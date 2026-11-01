const Cart = require('../models/Cart');
const Product = require('../models/Product');

// @desc    Get current user's shopping cart
// @route   GET /api/cart
// @access  Private (Consumer)
exports.getCart = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ user: req.user.id })
      .populate({
        path: 'items.product',
        select: 'name slug price originalPrice unit images availableQuantity status farmingMethod isOrganic farmer',
        populate: {
          path: 'farmer',
          select: 'name',
        },
      })
      .populate('items.farmer', 'name email');

    if (!cart) {
      cart = await Cart.create({ user: req.user.id, items: [] });
    }

    // Filter out invalid items or check stock alerts
    let hasStockIssue = false;
    const validatedItems = [];
    let subtotal = 0;

    for (const item of cart.items) {
      if (item.product) {
        const itemTotal = item.product.price * item.quantity;
        subtotal += itemTotal;
        const outOfStock = item.product.availableQuantity < item.quantity || item.product.status !== 'active';
        if (outOfStock) hasStockIssue = true;

        validatedItems.push({
          _id: item._id,
          product: item.product,
          farmer: item.farmer,
          quantity: item.quantity,
          price: item.product.price,
          subtotal: itemTotal,
          isAvailable: !outOfStock,
          maxAvailable: item.product.availableQuantity,
        });
      }
    }

    const deliveryFee = subtotal > 0 ? (subtotal > 500 ? 0 : 40) : 0;
    const totalAmount = subtotal + deliveryFee;

    res.status(200).json({
      success: true,
      cart: {
        _id: cart._id,
        items: validatedItems,
        subtotal,
        deliveryFee,
        totalAmount,
        hasStockIssue,
        itemCount: validatedItems.reduce((acc, curr) => acc + curr.quantity, 0),
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Add product to cart
// @route   POST /api/cart
// @access  Private (Consumer)
exports.addToCart = async (req, res, next) => {
  try {
    const { productId, quantity = 1 } = req.body;
    const qty = parseInt(quantity, 10);

    if (qty <= 0) {
      return res.status(400).json({ success: false, message: 'Quantity must be at least 1' });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    if (product.status !== 'active' || product.availableQuantity <= 0) {
      return res.status(400).json({ success: false, message: 'Product is currently out of stock' });
    }

    let cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      cart = await Cart.create({ user: req.user.id, items: [] });
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId
    );

    if (itemIndex > -1) {
      // Check total combined quantity against stock
      const newQty = cart.items[itemIndex].quantity + qty;
      if (newQty > product.availableQuantity) {
        return res.status(400).json({
          success: false,
          message: `Cannot add more. Only ${product.availableQuantity} ${product.unit} available in stock.`,
        });
      }
      cart.items[itemIndex].quantity = newQty;
      cart.items[itemIndex].priceAtAddition = product.price;
    } else {
      if (qty > product.availableQuantity) {
        return res.status(400).json({
          success: false,
          message: `Requested quantity exceeds available stock of ${product.availableQuantity} ${product.unit}`,
        });
      }
      cart.items.push({
        product: product._id,
        farmer: product.farmer,
        quantity: qty,
        priceAtAddition: product.price,
      });
    }

    await cart.save();

    res.status(200).json({
      success: true,
      message: `${product.name} added to cart`,
      itemCount: cart.items.reduce((acc, curr) => acc + curr.quantity, 0),
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update cart item quantity
// @route   PUT /api/cart/:itemId
// @access  Private (Consumer)
exports.updateCartItem = async (req, res, next) => {
  try {
    const { quantity } = req.body;
    const qty = parseInt(quantity, 10);

    let cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }

    const itemIndex = cart.items.findIndex(
      (item) => item._id.toString() === req.params.itemId
    );

    if (itemIndex === -1) {
      return res.status(404).json({ success: false, message: 'Item not found in cart' });
    }

    if (qty <= 0) {
      cart.items.splice(itemIndex, 1);
      await cart.save();
      return res.status(200).json({ success: true, message: 'Item removed from cart' });
    }

    // Check inventory stock
    const product = await Product.findById(cart.items[itemIndex].product);
    if (!product || product.availableQuantity < qty) {
      return res.status(400).json({
        success: false,
        message: `Only ${product ? product.availableQuantity : 0} ${product ? product.unit : ''} available in stock`,
      });
    }

    cart.items[itemIndex].quantity = qty;
    await cart.save();

    res.status(200).json({
      success: true,
      message: 'Cart updated successfully',
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Remove item from cart
// @route   DELETE /api/cart/:itemId
// @access  Private (Consumer)
exports.removeFromCart = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }

    cart.items = cart.items.filter(
      (item) => item._id.toString() !== req.params.itemId
    );

    await cart.save();

    res.status(200).json({
      success: true,
      message: 'Item removed from cart',
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Clear entire cart
// @route   DELETE /api/cart
// @access  Private (Consumer)
exports.clearCart = async (req, res, next) => {
  try {
    await Cart.findOneAndUpdate({ user: req.user.id }, { items: [] });
    res.status(200).json({
      success: true,
      message: 'Cart cleared successfully',
    });
  } catch (err) {
    next(err);
  }
};
