import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  ShoppingBag,
  Heart,
  MapPin,
  Clock,
  ArrowRight,
  User,
  ShieldCheck,
  ChevronRight,
  Tractor,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const ConsumerDashboard = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [followedFarmsCount, setFollowedFarmsCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [ordersRes, addressRes, followRes] = await Promise.all([
          api.get('/orders/my-orders'),
          api.get('/addresses'),
          api.get('/follow/my-followed-farms').catch(() => ({ data: { farms: [] } })),
        ]);

        if (ordersRes.data.success) setOrders(ordersRes.data.orders);
        if (addressRes.data.success) setAddresses(addressRes.data.addresses);
        if (followRes.data?.success) setFollowedFarmsCount(followRes.data.farms?.length || 0);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-forest-900 to-forest-800 text-white rounded-3xl p-6 sm:p-8 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <img
            src={
              user?.avatar ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(
                user?.name || 'User'
              )}&background=224e2d&color=fff`
            }
            alt={user?.name}
            className="w-16 h-16 rounded-2xl object-cover border-2 border-emerald-400"
          />
          <div>
            <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider">
              Consumer Account
            </span>
            <h1 className="text-2xl font-bold font-display">{user?.name}</h1>
            <p className="text-xs text-stone-300 mt-0.5">{user?.email}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            to="/consumer/followed-farms"
            className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-forest-950 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
          >
            <Tractor className="w-4 h-4" />
            Followed Farms Feed
          </Link>
          <Link
            to="/marketplace"
            className="px-5 py-2.5 bg-forest-800 hover:bg-forest-700 text-white rounded-xl text-xs font-semibold border border-forest-600 transition flex items-center gap-1.5"
          >
            <ShoppingBag className="w-4 h-4" />
            Shop Produce
          </Link>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-stone-400 font-medium">Total Orders Placed</span>
            <p className="text-2xl font-extrabold text-stone-900 font-display mt-0.5">
              {orders.length}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-forest-50 text-forest-700 flex items-center justify-center">
            <Package className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-stone-400 font-medium">Active Deliveries</span>
            <p className="text-2xl font-extrabold text-stone-900 font-display mt-0.5">
              {orders.filter((o) => ['Confirmed', 'Processing', 'Packed', 'Shipped', 'Out for Delivery'].includes(o.overallStatus)).length}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <Link
          to="/consumer/followed-farms"
          className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs flex items-center justify-between hover:border-forest-400 transition group"
        >
          <div>
            <span className="text-xs text-stone-400 font-medium">Followed Farms</span>
            <p className="text-2xl font-extrabold text-stone-900 font-display mt-0.5 group-hover:text-forest-700 transition">
              {followedFarmsCount}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <Tractor className="w-5 h-5" />
          </div>
        </Link>

        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-stone-400 font-medium">Saved Addresses</span>
            <p className="text-2xl font-extrabold text-stone-900 font-display mt-0.5">
              {addresses.length}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-stone-100 text-stone-600 flex items-center justify-center">
            <MapPin className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Recent Direct Orders */}
      <div className="bg-white rounded-3xl border border-stone-200/80 shadow-sm p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-stone-900 text-base font-display">Recent Farm Orders</h3>
            <p className="text-xs text-stone-500">Track and review your recent farm orders</p>
          </div>
          <Link to="/orders" className="text-xs font-bold text-forest-700 hover:text-forest-900 flex items-center gap-1">
            All Orders <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {orders.length === 0 ? (
          <div className="py-12 text-center text-xs text-stone-400 space-y-3">
            <Package className="w-10 h-10 text-stone-300 mx-auto" />
            <p>You haven't placed any direct farm orders yet.</p>
            <Link
              to="/marketplace"
              className="px-5 py-2 bg-forest-700 text-white rounded-xl text-xs font-bold inline-block"
            >
              Explore Fresh Harvest
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-stone-100">
            {orders.slice(0, 5).map((order) => (
              <div key={order._id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-stone-900 text-sm">{order.orderNumber}</span>
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
                  <p className="text-xs text-stone-500">
                    {order.items.length} item(s) • Placed on {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4">
                  <span className="text-sm font-bold text-stone-900 font-display">
                    ₹{order.totalAmount}
                  </span>
                  <Link
                    to={`/orders/${order._id}`}
                    className="px-4 py-2 bg-stone-100 hover:bg-forest-50 hover:text-forest-800 rounded-xl text-xs font-bold transition flex items-center gap-1 text-stone-700"
                  >
                    Track Order <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ConsumerDashboard;
