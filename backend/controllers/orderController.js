const Order = require('../models/Order');
const Product = require('../models/Product');
const Cart = require('../models/Cart');
const Notification = require('../models/Notification');
const FarmerProfile = require('../models/FarmerProfile');

// Helper to generate readable unique order number (e.g. FD-2026-98124)
const generateOrderNumber = () => {
  const timestamp = Date.now().toString().slice(-4);
  const random = Math.floor(1000 + Math.random() * 9000);
  return `FD-${new Date().getFullYear()}-${timestamp}${random}`;
};

// @desc    Create new order (with multi-farmer grouping and stock decrement)
// @route   POST /api/orders
// @access  Private (Consumer)
exports.createOrder = async (req, res, next) => {
  try {
    const { shippingAddress, paymentMethod = 'COD', paymentDetails } = req.body;

    if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.pincode) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid delivery address with contact details and PIN code',
      });
    }

    // Retrieve consumer's cart
    const cart = await Cart.findOne({ user: req.user.id }).populate('items.product');

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Your cart is empty. Please add products before placing an order.',
      });
    }

    // Validate stock and prepare items
    const orderItems = [];
    const farmerGroups = {};
    let subtotal = 0;

    for (const item of cart.items) {
      const product = await Product.findById(item.product._id || item.product);

      if (!product) {
        return res.status(400).json({
          success: false,
          message: `One or more products in your cart are no longer available`,
        });
      }

      if (product.availableQuantity < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for '${product.name}'. Available: ${product.availableQuantity} ${product.unit}`,
        });
      }

      const itemSubtotal = product.price * item.quantity;
      subtotal += itemSubtotal;

      const orderItem = {
        product: product._id,
        farmer: product.farmer,
        productName: product.name,
        image: product.images && product.images.length > 0 ? product.images[0] : '',
        price: product.price,
        unit: product.unit,
        quantity: item.quantity,
        subtotal: itemSubtotal,
        itemStatus: 'Confirmed',
        statusTimeline: [
          {
            status: 'Confirmed',
            timestamp: new Date(),
            note: 'Order confirmed and registered for harvesting/packing',
          },
        ],
      };

      orderItems.push(orderItem);

      // Group per farmer
      const farmerIdStr = product.farmer.toString();
      if (!farmerGroups[farmerIdStr]) {
        farmerGroups[farmerIdStr] = {
          farmer: product.farmer,
          items: [],
          farmerSubtotal: 0,
          status: 'Confirmed',
        };
      }
      farmerGroups[farmerIdStr].items.push(orderItem);
      farmerGroups[farmerIdStr].farmerSubtotal += itemSubtotal;

      // Decrement inventory stock
      product.availableQuantity -= item.quantity;
      if (product.availableQuantity <= 0) {
        product.availableQuantity = 0;
        product.status = 'out_of_stock';
      }
      await product.save();
    }

    const subOrders = Object.values(farmerGroups);
    const deliveryFee = subtotal > 500 ? 0 : 40;
    const totalAmount = subtotal + deliveryFee;

    const orderNumber = generateOrderNumber();

    const order = await Order.create({
      orderNumber,
      consumer: req.user.id,
      items: orderItems,
      subOrders,
      shippingAddress,
      paymentMethod,
      paymentStatus: paymentMethod === 'ONLINE' ? 'Completed' : 'Pending',
      paymentDetails: paymentDetails || {},
      subtotal,
      deliveryFee,
      totalAmount,
      overallStatus: 'Confirmed',
    });

    // Clear consumer cart
    cart.items = [];
    await cart.save();

    // Create transactional notifications
    // 1. For consumer
    await Notification.create({
      recipient: req.user.id,
      title: 'Order Confirmed! 🌾',
      message: `Your order #${orderNumber} for ₹${totalAmount} has been placed directly with our local farmers.`,
      type: 'order',
      link: `/orders/${order._id}`,
    });

    // 2. For each farmer in the order
    for (const farmerId of Object.keys(farmerGroups)) {
      const group = farmerGroups[farmerId];
      await Notification.create({
        recipient: farmerId,
        title: 'New Farm Order Received! 🚜',
        message: `You received a new order for ${group.items.length} product(s) totaling ₹${group.farmerSubtotal}.`,
        type: 'order',
        link: `/farmer/orders`,
      });

      // Update farmer sales stats
      await FarmerProfile.findOneAndUpdate(
        { user: farmerId },
        {
          $inc: {
            totalSalesAmount: group.farmerSubtotal,
            completedOrdersCount: 1,
          },
        }
      );
    }

    res.status(201).json({
      success: true,
      message: 'Order placed successfully directly with the farmers!',
      order,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get logged in consumer's order history
// @route   GET /api/orders/my-orders
// @access  Private (Consumer)
exports.getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ consumer: req.user.id })
      .sort({ createdAt: -1 })
      .populate('items.farmer', 'name email phone');

    res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single order details by ID
// @route   GET /api/orders/:id
// @access  Private (Consumer, Farmer in order, Admin)
exports.getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('consumer', 'name email phone avatar')
      .populate('items.farmer', 'name email phone avatar')
      .populate('items.product', 'name slug unit images');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Verify access
    const isConsumer = order.consumer._id.toString() === req.user.id;
    const isFarmerInOrder = order.items.some(
      (item) => item.farmer._id.toString() === req.user.id
    );
    const isAdmin = req.user.role === 'admin';

    if (!isConsumer && !isFarmerInOrder && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to view this order',
      });
    }

    res.status(200).json({
      success: true,
      order,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Cancel order & restore inventory stock
// @route   PUT /api/orders/:id/cancel
// @access  Private (Consumer or Admin)
exports.cancelOrder = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.consumer.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to cancel this order',
      });
    }

    if (['Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'].includes(order.overallStatus)) {
      return res.status(400).json({
        success: false,
        message: `Order cannot be cancelled because it is already ${order.overallStatus.toLowerCase()}`,
      });
    }

    order.overallStatus = 'Cancelled';
    order.cancelledAt = new Date();
    order.cancellationReason = reason || 'Cancelled by customer';

    // Restore stock for all products in this order
    for (const item of order.items) {
      item.itemStatus = 'Cancelled';
      item.statusTimeline.push({
        status: 'Cancelled',
        timestamp: new Date(),
        note: `Order cancelled: ${order.cancellationReason}`,
      });

      await Product.findByIdAndUpdate(item.product, {
        $inc: { availableQuantity: item.quantity },
        $set: { status: 'active' },
      });
    }

    // Update suborders
    for (const sub of order.subOrders) {
      sub.status = 'Cancelled';
    }

    await order.save();

    // Notify farmers
    const uniqueFarmers = [...new Set(order.items.map((i) => i.farmer.toString()))];
    for (const farmerId of uniqueFarmers) {
      await Notification.create({
        recipient: farmerId,
        title: 'Order Cancelled ℹ️',
        message: `Order #${order.orderNumber} was cancelled. Reserved inventory has been restored.`,
        type: 'order',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Order cancelled successfully and stock restored',
      order,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get orders containing products for logged-in farmer
// @route   GET /api/farmer/orders
// @access  Private (Farmer)
exports.getFarmerOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ 'items.farmer': req.user.id })
      .populate('consumer', 'name email phone')
      .populate('items.product', 'name slug images unit')
      .sort({ createdAt: -1 });

    // Filter to only items that belong to this farmer for easy display
    const farmerFormattedOrders = orders.map((order) => {
      const myItems = order.items.filter(
        (item) => item.farmer.toString() === req.user.id
      );
      const mySubtotal = myItems.reduce((acc, curr) => acc + curr.subtotal, 0);

      return {
        _id: order._id,
        orderNumber: order.orderNumber,
        consumer: order.consumer,
        shippingAddress: order.shippingAddress,
        items: myItems,
        mySubtotal,
        paymentStatus: order.paymentStatus,
        paymentMethod: order.paymentMethod,
        overallStatus: order.overallStatus,
        createdAt: order.createdAt,
      };
    });

    res.status(200).json({
      success: true,
      count: farmerFormattedOrders.length,
      orders: farmerFormattedOrders,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update status of an item/suborder by Farmer
// @route   PUT /api/farmer/orders/:orderId/items/:itemId/status
// @access  Private (Farmer)
exports.updateFarmerItemStatus = async (req, res, next) => {
  try {
    const { status, note, trackingNumber } = req.body;
    const { orderId, itemId } = req.params;

    const validStatuses = [
      'Pending',
      'Confirmed',
      'Processing',
      'Packed',
      'Shipped',
      'Out for Delivery',
      'Delivered',
      'Cancelled',
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
      });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const item = order.items.id(itemId);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Order item not found' });
    }

    if (item.farmer.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to update fulfillment for this item',
      });
    }

    item.itemStatus = status;
    if (trackingNumber) item.trackingNumber = trackingNumber;
    item.statusTimeline.push({
      status,
      timestamp: new Date(),
      note: note || `Item updated to ${status}`,
    });

    // If delivered, check if overall order is completed
    if (status === 'Delivered') {
      const allDelivered = order.items.every((i) => i.itemStatus === 'Delivered');
      if (allDelivered) {
        order.overallStatus = 'Delivered';
        order.deliveredAt = new Date();
        if (order.paymentMethod === 'COD') {
          order.paymentStatus = 'Completed';
        }
      }
    } else if (['Shipped', 'Out for Delivery'].includes(status)) {
      order.overallStatus = status;
    }

    await order.save();

    // Notify consumer about status update
    await Notification.create({
      recipient: order.consumer,
      title: `Order Update: ${item.productName} is ${status}! 📦`,
      message: `Your item '${item.productName}' in order #${order.orderNumber} has been updated to '${status}'.`,
      type: 'order',
      link: `/orders/${order._id}`,
    });

    res.status(200).json({
      success: true,
      message: `Item status updated to ${status}`,
      order,
    });
  } catch (err) {
    next(err);
  }
};
