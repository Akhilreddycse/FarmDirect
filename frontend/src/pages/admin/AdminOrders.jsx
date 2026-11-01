import React, { useState, useEffect } from 'react';
import { ShoppingBag, Search, Filter } from 'lucide-react';
import api from '../../services/api';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/orders', { params: { status: statusFilter } });
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
  }, [statusFilter]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-forest-700">Oversight</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 font-display">
            Platform Orders Surveillance
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Complete transaction records, order statuses, and settlement tracking
          </p>
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-white border border-stone-200 text-xs font-bold text-stone-700 px-3 py-2 rounded-xl"
        >
          <option value="">All Order Statuses</option>
          <option value="Confirmed">Confirmed</option>
          <option value="Packed">Packed</option>
          <option value="Shipped">Shipped</option>
          <option value="Delivered">Delivered</option>
          <option value="Cancelled">Cancelled</option>
        </select>
      </div>

      <div className="bg-white rounded-3xl border border-stone-200/80 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 flex justify-center">
            <div className="w-10 h-10 border-4 border-forest-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 font-bold uppercase">
                <tr>
                  <th className="p-4">Order No</th>
                  <th className="p-4">Consumer</th>
                  <th className="p-4">Delivery Location</th>
                  <th className="p-4">Subtotal</th>
                  <th className="p-4">Payment</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {orders.map((o) => (
                  <tr key={o._id} className="hover:bg-stone-50 transition">
                    <td className="p-4 font-bold text-stone-900">{o.orderNumber}</td>
                    <td className="p-4 text-stone-700">{o.consumer?.name || 'Customer'}</td>
                    <td className="p-4 text-stone-500">{o.shippingAddress?.district}, {o.shippingAddress?.state}</td>
                    <td className="p-4 font-bold text-forest-900 font-display text-sm">₹{o.totalAmount}</td>
                    <td className="p-4">
                      <span className="font-semibold text-stone-700">{o.paymentMethod}</span> ({o.paymentStatus})
                    </td>
                    <td className="p-4">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          o.overallStatus === 'Delivered'
                            ? 'bg-emerald-100 text-emerald-800'
                            : o.overallStatus === 'Cancelled'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {o.overallStatus}
                      </span>
                    </td>
                    <td className="p-4 text-stone-400">{new Date(o.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminOrders;
