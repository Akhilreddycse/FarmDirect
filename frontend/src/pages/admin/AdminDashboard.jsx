import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Sprout,
  Package,
  ShoppingBag,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import api from '../../services/api';

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminStats = async () => {
      try {
        setLoading(true);
        const res = await api.get('/admin/dashboard');
        if (res.data.success) {
          setData(res.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminStats();
  }, []);

  if (loading) {
    return (
      <div className="p-12 flex justify-center">
        <div className="w-10 h-10 border-4 border-forest-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const { stats, platformTrend, categoryStats, recentOrders } = data || {};

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-stone-900 via-stone-800 to-forest-950 text-white p-6 sm:p-8 rounded-3xl shadow-md flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
            Super Administrator
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-display mt-0.5">
            Platform Master Console
          </h1>
          <p className="text-xs text-stone-300 mt-1">
            Global market oversight • Farmer validations • Supply chain governance
          </p>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-stone-400 font-medium">Platform Gross GMV</span>
            <p className="text-2xl font-extrabold text-stone-900 font-display mt-0.5">
              ₹{stats?.totalRevenue?.toLocaleString() || 0}
            </p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-stone-400 font-medium">Registered Farmers</span>
            <p className="text-2xl font-extrabold text-forest-800 font-display mt-0.5">
              {stats?.totalFarmers || 0}
            </p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-forest-100 text-forest-800 flex items-center justify-center">
            <Sprout className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-stone-400 font-medium">Total Consumers</span>
            <p className="text-2xl font-extrabold text-stone-900 font-display mt-0.5">
              {stats?.totalConsumers || 0}
            </p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-sky-100 text-sky-800 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-stone-400 font-medium">Platform Orders</span>
            <p className="text-2xl font-extrabold text-stone-900 font-display mt-0.5">
              {stats?.totalOrders || 0}
            </p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center">
            <ShoppingBag className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Monthly Revenue Trend */}
        <div className="lg:col-span-8 bg-white p-6 rounded-3xl border border-stone-200/80 shadow-sm space-y-4">
          <h3 className="font-bold text-stone-900 text-sm font-display">
            Direct Marketplace Monthly Revenue Trend
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={platformTrend || []}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1ede6" />
                <XAxis dataKey="month" stroke="#9d8d7b" fontSize={11} />
                <YAxis stroke="#9d8d7b" fontSize={11} tickFormatter={(val) => `₹${val}`} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1c1917',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px',
                    border: 'none',
                  }}
                  formatter={(val) => [`₹${val}`, 'Platform GMV']}
                />
                <Area type="monotone" dataKey="revenue" stroke="#3f9754" strokeWidth={3} fill="#dcfce7" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Breakdown Bar Chart */}
        <div className="lg:col-span-4 bg-white p-6 rounded-3xl border border-stone-200/80 shadow-sm space-y-4">
          <h3 className="font-bold text-stone-900 text-sm font-display">
            Produce by Category
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryStats || []} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1ede6" />
                <XAxis type="number" fontSize={10} stroke="#9d8d7b" />
                <YAxis dataKey="name" type="category" width={80} fontSize={10} stroke="#9d8d7b" />
                <Tooltip />
                <Bar dataKey="count" fill="#224e2d" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
