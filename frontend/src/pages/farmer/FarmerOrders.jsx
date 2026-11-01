import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  Clock,
  CheckCircle2,
  Truck,
  Package,
  MapPin,
  Phone,
  Search,
  ChevronDown,
} from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

const FarmerOrders = () => {
  const { addToast } = useToast();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Status Update Modal
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [newStatus, setNewStatus] = useState('Confirmed');
  const [statusNote, setStatusNote] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [updating, setUpdating] = useState(false);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await api.get('/farmer/orders');
      if (res.data.success) {
        setOrders(res.data.orders);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleOpenStatusModal = (order, item) => {
    setSelectedOrder(order);
    setSelectedItem(item);
    setNewStatus(item.itemStatus || 'Confirmed');
    setStatusNote('');
    setTrackingNumber(item.trackingNumber || '');
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      const res = await api.put(
        `/orders/${selectedOrder._id}/items/${selectedItem._id}/status`,
        {
          status: newStatus,
          note: statusNote,
          trackingNumber,
        }
      );
      if (res.data.success) {
        addToast(`Fulfillment status updated to ${newStatus}!`, 'success');
        setSelectedOrder(null);
        setSelectedItem(null);
        fetchOrders();
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to update status', 'error');
    } finally {
      setUpdating(false);
    }
  };

  const filteredOrders = orders.filter((o) => {
    if (statusFilter === 'ALL') return true;
    return o.overallStatus === statusFilter;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-forest-700">Fulfillment</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 font-display">
            Direct Customer Orders
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Pack fresh crops and update direct dispatch status for buyers
          </p>
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-white border border-stone-200 text-xs font-bold text-stone-700 px-3 py-2 rounded-xl"
        >
          <option value="ALL">All Order Statuses</option>
          <option value="Confirmed">Confirmed</option>
          <option value="Processing">Processing</option>
          <option value="Packed">Packed</option>
          <option value="Shipped">Shipped</option>
          <option value="Delivered">Delivered</option>
          <option value="Cancelled">Cancelled</option>
        </select>
      </div>

      {loading ? (
        <div className="p-12 flex justify-center">
          <div className="w-10 h-10 border-4 border-forest-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-stone-200 text-center space-y-3">
          <ShoppingBag className="w-12 h-12 text-stone-300 mx-auto" />
          <h3 className="text-base font-bold text-stone-900">No orders to display</h3>
          <p className="text-xs text-stone-500">Incoming customer orders will appear here automatically.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <div
              key={order._id}
              className="bg-white rounded-3xl border border-stone-200/80 shadow-sm p-6 space-y-4"
            >
              {/* Order Header Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-100 text-xs">
                <div>
                  <span className="font-bold text-stone-900 text-sm">#{order.orderNumber}</span>
                  <span className="text-stone-400 ml-2">
                    Placed: {new Date(order.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-forest-900">Your Harvest Share: ₹{order.mySubtotal}</span>
                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
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

              {/* Customer Shipping Address & Contact */}
              <div className="bg-stone-50 p-3.5 rounded-2xl border border-stone-200/60 text-xs flex flex-col sm:flex-row justify-between gap-3">
                <div>
                  <p className="font-bold text-stone-800">
                    Deliver to: {order.shippingAddress?.fullName}
                  </p>
                  <p className="text-stone-500 mt-0.5">
                    {order.shippingAddress?.houseBuilding}, {order.shippingAddress?.street}, {order.shippingAddress?.villageCity}, {order.shippingAddress?.district} - {order.shippingAddress?.pincode}
                  </p>
                </div>
                <div className="text-stone-600 font-medium shrink-0">
                  <p>📞 {order.shippingAddress?.phone}</p>
                  <p className="text-[11px] text-stone-400 mt-0.5">Payment: {order.paymentMethod} ({order.paymentStatus})</p>
                </div>
              </div>

              {/* Items for this Farmer */}
              <div className="divide-y divide-stone-100">
                {order.items.map((item) => (
                  <div key={item._id} className="py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                    <div>
                      <h4 className="font-bold text-stone-900">{item.productName}</h4>
                      <p className="text-stone-500">
                        {item.quantity} {item.unit} × ₹{item.price} = <strong className="text-stone-800">₹{item.subtotal}</strong>
                      </p>
                      {item.trackingNumber && (
                        <p className="text-[11px] text-stone-400 mt-0.5 font-mono">
                          Tracking: {item.trackingNumber}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="font-bold text-stone-700 bg-stone-100 px-2.5 py-1 rounded-lg">
                        Status: {item.itemStatus}
                      </span>
                      {order.overallStatus !== 'Cancelled' && (
                        <button
                          onClick={() => handleOpenStatusModal(order, item)}
                          className="px-3 py-1.5 bg-forest-700 hover:bg-forest-800 text-white rounded-xl font-bold transition shadow-xs"
                        >
                          Update Status
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Fulfillment Status Update Modal */}
      {selectedOrder && selectedItem && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-in fade-in">
            <div className="flex items-center justify-between pb-2 border-b border-stone-100">
              <h3 className="font-bold text-stone-900 text-sm">
                Update Fulfillment: {selectedItem.productName}
              </h3>
              <button
                onClick={() => {
                  setSelectedOrder(null);
                  setSelectedItem(null);
                }}
                className="text-stone-400 hover:text-stone-700"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdateStatus} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-stone-700 block mb-1">Status Step</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 focus:outline-none"
                >
                  <option value="Confirmed">Confirmed (Harvest Scheduled)</option>
                  <option value="Processing">Processing / Washing</option>
                  <option value="Packed">Packed in Farm Box</option>
                  <option value="Shipped">Shipped / In Transit</option>
                  <option value="Out for Delivery">Out for Delivery</option>
                  <option value="Delivered">Delivered to Customer</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Courier / Tracking Number (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. TRK-MH-99412"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Fulfillment Note</label>
                <input
                  type="text"
                  placeholder="e.g. Harvested at 6 AM, sorted & packed with eco-packaging"
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedOrder(null);
                    setSelectedItem(null);
                  }}
                  className="px-4 py-2 text-stone-500 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="px-5 py-2 bg-forest-700 text-white rounded-xl font-bold"
                >
                  {updating ? 'Updating...' : 'Save & Notify Buyer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FarmerOrders;
