import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Sprout, Lock, Mail, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const result = await login(email, password);
    setLoading(false);

    if (result?.success) {
      const from = location.state?.from?.pathname;
      if (from) {
        navigate(from, { replace: true });
      } else if (result.user.role === 'farmer') {
        navigate('/farmer/dashboard');
      } else if (result.user.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/marketplace');
      }
    }
  };

  const setTestCreds = (testEmail, testPass) => {
    setEmail(testEmail);
    setPassword(testPass);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-forest-800 text-emerald-300 flex items-center justify-center mx-auto shadow-md">
            <Sprout className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-bold font-display text-stone-900">Welcome Back to FarmDirect</h2>
          <p className="text-xs text-stone-500">Sign in to manage your direct farm orders or products</p>
        </div>

        {/* 1-Click Quick Demo Login Pill Buttons */}
        <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-3.5 space-y-2">
          <p className="text-[11px] font-bold text-emerald-950 uppercase tracking-wide flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
            Quick Demo 1-Click Fill:
          </p>
          <div className="grid grid-cols-3 gap-1.5">
            <button
              type="button"
              onClick={() => setTestCreds('anand.farmer@farmdirect.com', 'Password@123')}
              className="px-2 py-1.5 bg-white border border-emerald-300 text-forest-900 rounded-lg text-[10px] font-bold hover:bg-emerald-100 transition truncate"
            >
              🚜 Farmer
            </button>
            <button
              type="button"
              onClick={() => setTestCreds('priya.consumer@farmdirect.com', 'Password@123')}
              className="px-2 py-1.5 bg-white border border-emerald-300 text-forest-900 rounded-lg text-[10px] font-bold hover:bg-emerald-100 transition truncate"
            >
              🛒 Consumer
            </button>
            <button
              type="button"
              onClick={() => setTestCreds('admin@farmdirect.com', 'Password@123')}
              className="px-2 py-1.5 bg-white border border-emerald-300 text-forest-900 rounded-lg text-[10px] font-bold hover:bg-emerald-100 transition truncate"
            >
              👨‍💼 Admin
            </button>
          </div>
        </div>

        {/* Login Form */}
        <div className="bg-white p-8 rounded-3xl border border-stone-200/80 shadow-sm space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-stone-700">Email Address</label>
              <div className="relative mt-1">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl pl-10 pr-3 py-2.5 text-xs text-stone-900 focus:outline-none focus:border-forest-600 focus:bg-white"
                />
                <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-stone-700">Password</label>
                <Link to="/forgot-password" className="text-[11px] text-forest-700 hover:text-forest-900 font-semibold">
                  Forgot Password?
                </Link>
              </div>
              <div className="relative mt-1">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl pl-10 pr-3 py-2.5 text-xs text-stone-900 focus:outline-none focus:border-forest-600 focus:bg-white"
                />
                <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-forest-700 hover:bg-forest-800 text-white rounded-xl text-xs font-bold transition shadow-md shadow-forest-900/10 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  Sign In to Marketplace
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="pt-4 border-t border-stone-100 text-center text-xs text-stone-500">
            Don't have an account yet?{' '}
            <Link to="/register" className="text-forest-700 font-bold hover:underline">
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
