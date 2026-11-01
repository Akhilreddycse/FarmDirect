import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  ShoppingBag,
  TrendingUp,
  AlertTriangle,
  PlusCircle,
  Clock,
  CheckCircle2,
  Users,
  ChevronRight,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import api from '../../services/api';

const FarmerDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const res = await api.get('/farmer/dashboard');
        if (res.data.success) {
          setDashboardData(res.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="p-8 flex justify-center">
        <div className="w-12 h-12 border-4 border-forest-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const { stats, lowStockAlerts, monthlyTrend, recentOrders, farmerProfile } = dashboardData || {};

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-forest-950 via-forest-900 to-forest-950 text-white p-6 sm:p-8 rounded-3xl shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div>
          <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider">
            Farmer Control Center
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold font-display mt-0.5">
            {farmerProfile?.farmName || 'My Farm Dashboard'}
          </h1>
          <p className="text-xs text-stone-300 mt-1">
            Direct sales monitoring • Direct customer order fulfillment
          </p>
        </div>

        <Link
          to="/farmer/products/new"
          className="px-5 py-3 bg-emerald-500 hover:bg-emerald-400 text-forest-950 rounded-2xl text-xs font-bold transition flex items-center gap-2 shadow-lg shadow-emerald-500/20"
        >
          <PlusCircle className="w-4 h-4" />
          Add New Harvest Listing
        </Link>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-stone-400 font-medium">Total Direct Sales</span>
            <p className="text-2xl font-extrabold text-stone-900 font-display mt-0.5">
              ₹{stats?.totalEarnings?.toLocaleString() || 0}
            </p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-stone-400 font-medium">Active Harvests</span>
            <p className="text-2xl font-extrabold text-stone-900 font-display mt-0.5">
              {stats?.activeProducts || 0}{' '}
              <span className="text-xs font-normal text-stone-400">/ {stats?.totalProducts || 0}</span>
            </p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-forest-100 text-forest-800 flex items-center justify-center">
            <Package className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-stone-400 font-medium">Pending Orders</span>
            <p className="text-2xl font-extrabold text-amber-600 font-display mt-0.5">
              {stats?.pendingOrdersCount || 0}
            </p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-stone-400 font-medium">Completed Orders</span>
            <p className="text-2xl font-extrabold text-stone-900 font-display mt-0.5">
              {stats?.completedOrdersCount || 0}
            </p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-sky-100 text-sky-800 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Stock Alerts (If any) */}
      {lowStockAlerts && lowStockAlerts.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-3xl p-5 space-y-2">
          <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            Low Inventory Alert ({lowStockAlerts.length} crops almost sold out):
          </div>
          <div className="flex flex-wrap gap-2 pt-1">
            {lowStockAlerts.map((item) => (
              <span
                key={item._id}
                className="bg-white border border-amber-300 text-amber-900 text-xs px-3 py-1 rounded-xl font-medium shadow-2xs"
              >
                {item.name}: only <strong>{item.availableQuantity} {item.unit}</strong> remaining
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Sales Trend Chart */}
      <div className="bg-white p-6 rounded-3xl border border-stone-200/80 shadow-sm space-y-4">
        <div>
          <h3 className="font-bold text-stone-900 text-base font-display">
            Monthly Earnings & Direct Sales Revenue
          </h3>
          <p className="text-xs text-stone-500">Track earnings direct from consumer checkouts</p>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={monthlyTrend || []} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1ede6" />
              <XAxis dataKey="month" stroke="#9d8d7b" fontSize={11} />
              <YAxis stroke="#9d8d7b" fontSize={11} tickFormatter={(val) => `₹${val}`} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0c2313',
                  borderRadius: '12px',
                  color: '#fff',
                  fontSize: '12px',
                  border: 'none',
                }}
                formatter={(val) => [`₹${val}`, 'Sales']}
              />
              <Area type="monotone" dataKey="sales" stroke="#059669" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="bg-white rounded-3xl border border-stone-200/80 shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-stone-900 text-base font-display">Recent Customer Orders</h3>
          <Link to="/farmer/orders" className="text-xs font-bold text-forest-700 hover:text-forest-900 flex items-center gap-1">
            Manage All Orders <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {recentOrders?.length === 0 ? (
          <div className="py-8 text-center text-xs text-stone-400">
            No customer orders received yet. Make sure your products are marked as Active.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-stone-200 text-stone-400 font-bold uppercase">
                <tr>
                  <th className="pb-3">Order Number</th>
                  <th className="pb-3">Customer</th>
                  <th className="pb-3">Items</th>
                  <th className="pb-3">Subtotal</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {recentOrders?.map((ord) => (
                  <tr key={ord._id} className="hover:bg-stone-50 transition">
                    <td className="py-3 font-bold text-stone-900">{ord.orderNumber}</td>
                    <td className="py-3 text-stone-700">{ord.consumerName}</td>
                    <td className="py-3 text-stone-500">{ord.itemsCount} crop(s)</td>
                    <td className="py-3 font-bold text-forest-900">₹{ord.totalAmount}</td>
                    <td className="py-3">
                      <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                        {ord.status}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <Link
                        to="/farmer/orders"
                        className="text-xs font-bold text-forest-700 hover:underline"
                      >
                        Fulfill →
                      </Link>
                    </td>
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

export default FarmerDashboard;
