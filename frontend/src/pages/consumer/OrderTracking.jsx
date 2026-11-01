import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Package,
  MapPin,
  Clock,
  CheckCircle2,
  XCircle,
  Truck,
  Star,
  ArrowLeft,
  AlertTriangle,
  UserCheck,
} from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import OrderTimeline from '../../components/common/OrderTimeline';

const OrderTracking = () => {
  const { id } = useParams();
  const { addToast } = useToast();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  // Review Modal State
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedProductForReview, setSelectedProductForReview] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/orders/${id}`);
      if (res.data.success) {
        setOrder(res.data.order);
      }
    } catch (err) {
      console.error(err);
      addToast('Failed to load order details', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const handleCancelOrder = async () => {
    if (!window.confirm('Are you sure you want to cancel this farm order? Stock will be returned to farmers.')) {
      return;
    }

    try {
      const res = await api.put(`/orders/${id}/cancel`, {
        reason: 'Customer requested cancellation via portal',
      });
      if (res.data.success) {
        addToast('Order cancelled successfully', 'info');
        fetchOrder();
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to cancel order', 'error');
    }
  };

  const handleOpenReview = (item) => {
    setSelectedProductForReview(item);
    setRating(5);
    setComment('');
    setReviewModalOpen(true);
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    setSubmittingReview(true);
    try {
      const res = await api.post('/reviews', {
        productId: selectedProductForReview.product._id || selectedProductForReview.product,
        orderId: order._id,
        rating,
        comment,
      });
      if (res.data.success) {
        addToast('Review submitted! Thank you for supporting the farmer.', 'success');
        setReviewModalOpen(false);
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to submit review', 'error');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 flex justify-center">
        <div className="w-12 h-12 border-4 border-forest-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-stone-900">Order not found</h2>
        <Link to="/orders" className="px-6 py-2.5 bg-forest-700 text-white rounded-xl text-xs font-bold inline-block">
          View All Orders
        </Link>
      </div>
    );
  }

  const canCancel = ['Pending', 'Confirmed', 'Processing'].includes(order.overallStatus);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link to="/orders" className="text-xs font-bold text-stone-500 hover:text-forest-700 flex items-center gap-1 mb-2">
            <ArrowLeft className="w-4 h-4" /> All Orders
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 font-display">
            Order #{order.orderNumber}
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Placed on {new Date(order.createdAt).toLocaleDateString()} at{' '}
            {new Date(order.createdAt).toLocaleTimeString()}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {canCancel && (
            <button
              onClick={handleCancelOrder}
              className="px-4 py-2 bg-rose-50 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold hover:bg-rose-100 transition"
            >
              Cancel Order
            </button>
          )}
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold ${
              order.overallStatus === 'Delivered'
                ? 'bg-emerald-100 text-emerald-800'
                : order.overallStatus === 'Cancelled'
                ? 'bg-rose-100 text-rose-800'
                : 'bg-amber-100 text-amber-800'
            }`}
          >
            {order.overallStatus}
          </span>
        </div>
      </div>

      {/* Visual Tracking Timeline */}
      <div className="bg-white rounded-3xl border border-stone-200/80 shadow-sm p-6 sm:p-8">
        <h3 className="font-bold text-stone-900 text-sm mb-4">Direct Farm Fulfillment Progress</h3>
        <OrderTimeline status={order.overallStatus} timeline={order.items[0]?.statusTimeline || []} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Ordered Farm Produce */}
        <div className="lg:col-span-8 bg-white rounded-3xl border border-stone-200/80 shadow-sm p-6 space-y-6">
          <h3 className="font-bold text-stone-900 text-base font-display">
            Ordered Products ({order.items.length})
          </h3>

          <div className="divide-y divide-stone-100">
            {order.items.map((item) => (
              <div key={item._id} className="py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <img
                    src={
                      item.image ||
                      'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=200&q=80'
                    }
                    alt={item.productName}
                    className="w-16 h-16 rounded-2xl object-cover border border-stone-200 shrink-0"
                  />
                  <div>
                    <h4 className="font-bold text-stone-900 text-sm">{item.productName}</h4>
                    <p className="text-xs text-stone-500">
                      Farm: <span className="font-medium text-stone-800">{item.farmerProfile?.farmName || 'Direct Farm'}</span>
                    </p>
                    <p className="text-xs text-stone-400 mt-0.5">
                      {item.quantity} {item.unit} × ₹{item.price} = ₹{item.subtotal}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                      item.itemStatus === 'Delivered'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-stone-100 text-stone-700'
                    }`}
                  >
                    {item.itemStatus}
                  </span>

                  {item.itemStatus === 'Delivered' && (
                    <button
                      onClick={() => handleOpenReview(item)}
                      className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-xl text-xs font-bold transition flex items-center gap-1"
                    >
                      <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                      Write Review
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Delivery & Payment Details */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-3xl border border-stone-200/80 shadow-sm p-6 space-y-4">
            <h3 className="font-bold text-stone-900 text-base font-display">Delivery Address</h3>
            <div className="text-xs text-stone-600 space-y-1">
              <p className="font-bold text-stone-900">{order.shippingAddress.fullName}</p>
              <p>{order.shippingAddress.houseBuilding}, {order.shippingAddress.street}</p>
              <p>{order.shippingAddress.villageCity}, {order.shippingAddress.district}, {order.shippingAddress.state} - {order.shippingAddress.pincode}</p>
              <p className="text-stone-400">📞 {order.shippingAddress.phone}</p>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-stone-200/80 shadow-sm p-6 space-y-4">
            <h3 className="font-bold text-stone-900 text-base font-display">Payment Information</h3>
            <div className="text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-stone-500">Method</span>
                <span className="font-bold text-stone-900">{order.paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Payment Status</span>
                <span className={`font-bold ${order.paymentStatus === 'Completed' ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {order.paymentStatus}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Items Subtotal</span>
                <span className="font-bold text-stone-900">₹{order.subtotal}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Direct Logistics</span>
                <span className="font-bold text-stone-900">₹{order.deliveryFee}</span>
              </div>
              <div className="pt-2 border-t border-stone-100 flex justify-between text-sm">
                <span className="font-bold text-stone-900">Total Paid</span>
                <span className="font-bold text-forest-900 font-display text-base">₹{order.totalAmount}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Review Modal */}
      {reviewModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-in fade-in">
            <div className="flex items-center justify-between pb-2 border-b border-stone-100">
              <h3 className="font-bold text-stone-900 text-base">
                Review {selectedProductForReview?.productName}
              </h3>
              <button onClick={() => setReviewModalOpen(false)} className="text-stone-400 hover:text-stone-700">
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitReview} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-stone-700">Rating (1 to 5 Stars)</label>
                <div className="flex items-center gap-2 mt-1.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setRating(s)}
                      className="p-1 hover:scale-110 transition"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          s <= rating ? 'text-amber-400 fill-amber-400' : 'text-stone-200'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-bold text-stone-700 ml-2">{rating} Star Rating</span>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700">Your Feedback / Review</label>
                <textarea
                  rows="3"
                  required
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="How was the freshness, taste, and quality of the harvest?"
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 text-xs mt-1 focus:outline-none focus:border-forest-600"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setReviewModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-stone-500 hover:text-stone-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="px-5 py-2 bg-forest-700 text-white rounded-xl text-xs font-bold"
                >
                  {submittingReview ? 'Submitting...' : 'Submit Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderTracking;
