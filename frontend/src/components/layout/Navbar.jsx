import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Sprout,
  ShoppingBag,
  Heart,
  User,
  Search,
  Menu,
  X,
  Bell,
  LogOut,
  LayoutDashboard,
  ShieldCheck,
  ChevronDown,
  Package,
  Tractor,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import api from '../../services/api';

const Navbar = () => {
  const { user, isAuthenticated, isFarmer, isConsumer, isAdmin, logout } = useAuth();
  const { cart } = useCart();
  const { wishlistIds } = useWishlist();
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [searchKeyword, setSearchKeyword] = useState('');

  // Close menus on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
    setNotificationsOpen(false);
  }, [location.pathname]);

  // Fetch notifications if logged in
  useEffect(() => {
    if (isAuthenticated) {
      const fetchNotifications = async () => {
        try {
          const res = await api.get('/notifications');
          if (res.data.success) {
            setNotifications(res.data.notifications);
            setUnreadCount(res.data.unreadCount);
          }
        } catch (err) {
          // silently fail
        }
      };
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchKeyword.trim()) {
      navigate(`/marketplace?keyword=${encodeURIComponent(searchKeyword.trim())}`);
    } else {
      navigate('/marketplace');
    }
  };

  const markNotificationRead = async (id, link) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
      if (link) navigate(link);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-stone-200/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Brand */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-forest-800 to-forest-600 flex items-center justify-center text-white shadow-md shadow-forest-900/10 group-hover:scale-105 transition duration-300">
              <Sprout className="w-6 h-6 text-emerald-300" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-2xl font-bold font-display tracking-tight text-forest-950">
                  Farm<span className="text-forest-600">Direct</span>
                </span>
                <span className="bg-emerald-100 text-forest-800 text-[10px] font-bold px-1.5 py-0.5 rounded tracking-wide uppercase">
                  Direct
                </span>
              </div>
              <p className="text-[11px] text-stone-500 font-medium hidden sm:block">
                Farm to Doorstep • Zero Middlemen
              </p>
            </div>
          </Link>

          {/* Search Bar (Desktop) */}
          <form
            onSubmit={handleSearchSubmit}
            className="hidden md:flex flex-1 max-w-md mx-8 relative"
          >
            <input
              type="text"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              placeholder="Search organic veggies, fruits, honey, grains..."
              className="w-full bg-stone-100/90 text-stone-900 placeholder:text-stone-400 text-sm pl-11 pr-4 py-2.5 rounded-full border border-stone-200 focus:outline-none focus:border-forest-600 focus:bg-white focus:ring-4 focus:ring-forest-600/10 transition-all"
            />
            <Search className="w-4 h-4 text-stone-400 absolute left-4 top-3.5" />
          </form>

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-stone-600">
            <Link
              to="/marketplace"
              className="hover:text-forest-700 transition flex items-center gap-1.5"
            >
              Marketplace
            </Link>
            {isConsumer && (
              <Link
                to="/consumer/followed-farms"
                className="hover:text-forest-700 transition flex items-center gap-1.5 font-bold text-forest-800 bg-forest-50 px-3 py-1 rounded-xl"
              >
                <Tractor className="w-4 h-4 text-forest-700" />
                Followed Farms
              </Link>
            )}
            <Link to="/about" className="hover:text-forest-700 transition">
              Our Mission
            </Link>
            <Link to="/contact" className="hover:text-forest-700 transition">
              Support
            </Link>
          </nav>

          {/* Action Icons & User Control */}
          <div className="flex items-center gap-3">
            {/* Wishlist (Consumer) */}
            {isConsumer && (
              <Link
                to="/wishlist"
                className="relative p-2.5 text-stone-600 hover:text-rose-600 hover:bg-stone-100 rounded-full transition"
                title="Wishlist"
              >
                <Heart className="w-5 h-5" />
                {wishlistIds.length > 0 && (
                  <span className="absolute top-1 right-1 bg-rose-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {wishlistIds.length}
                  </span>
                )}
              </Link>
            )}

            {/* Shopping Cart (Consumer) */}
            {isConsumer && (
              <Link
                to="/cart"
                className="relative p-2.5 text-stone-600 hover:text-forest-700 hover:bg-forest-50 rounded-full transition"
                title="Cart"
              >
                <ShoppingBag className="w-5 h-5" />
                {cart.itemCount > 0 && (
                  <span className="absolute top-1 right-1 bg-forest-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                    {cart.itemCount}
                  </span>
                )}
              </Link>
            )}

            {/* Notification Bell */}
            {isAuthenticated && (
              <div className="relative">
                <button
                  onClick={() => setNotificationsOpen(!notificationsOpen)}
                  className="relative p-2.5 text-stone-600 hover:text-forest-700 hover:bg-stone-100 rounded-full transition"
                  title="Notifications"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 bg-amber-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* Notifications Dropdown */}
                {notificationsOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-stone-200 py-3 z-50 animate-in fade-in slide-in-from-top-2">
                    <div className="px-4 pb-2 border-b border-stone-100 flex items-center justify-between">
                      <h4 className="font-semibold text-stone-900 text-sm">Notifications</h4>
                      <span className="text-xs text-stone-400">{unreadCount} unread</span>
                    </div>
                    <div className="max-h-72 overflow-y-auto divide-y divide-stone-50">
                      {notifications.length === 0 ? (
                        <div className="py-6 text-center text-xs text-stone-400">
                          No notifications yet
                        </div>
                      ) : (
                        notifications.map((n) => (
                          <div
                            key={n._id}
                            onClick={() => markNotificationRead(n._id, n.link)}
                            className={`px-4 py-3 cursor-pointer hover:bg-stone-50 text-xs transition ${
                              !n.isRead ? 'bg-forest-50/50 font-medium' : ''
                            }`}
                          >
                            <p className="font-semibold text-stone-800">{n.title}</p>
                            <p className="text-stone-500 mt-0.5">{n.message}</p>
                            <span className="text-[10px] text-stone-400 mt-1 block">
                              {new Date(n.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* User Account / Auth Buttons */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2.5 p-1.5 pl-2.5 rounded-full border border-stone-200 hover:border-forest-600 bg-white shadow-sm transition"
                >
                  <img
                    src={
                      user?.avatar ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(
                        user?.name || 'User'
                      )}&background=224e2d&color=fff`
                    }
                    alt={user?.name}
                    className="w-7 h-7 rounded-full object-cover border border-stone-200"
                  />
                  <span className="text-xs font-semibold text-stone-700 hidden sm:inline max-w-[100px] truncate">
                    {user?.name?.split(' ')[0]}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-stone-400 pr-1" />
                </button>

                {/* Account Dropdown */}
                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-stone-200 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                    <div className="px-4 py-2 border-b border-stone-100">
                      <p className="text-xs font-bold text-stone-900 truncate">{user?.name}</p>
                      <p className="text-[11px] text-stone-500 truncate">{user?.email}</p>
                      <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-bold rounded-full uppercase bg-forest-100 text-forest-800">
                        {user?.role}
                      </span>
                    </div>

                    <div className="py-1 text-xs text-stone-700">
                      {isFarmer && (
                        <>
                          <Link
                            to="/farmer/dashboard"
                            className="flex items-center gap-2.5 px-4 py-2.5 hover:bg-forest-50 hover:text-forest-800"
                          >
                            <LayoutDashboard className="w-4 h-4 text-forest-600" />
                            Farmer Dashboard
                          </Link>
                          <Link
                            to="/farmer/products"
                            className="flex items-center gap-2.5 px-4 py-2.5 hover:bg-forest-50 hover:text-forest-800"
                          >
                            <Package className="w-4 h-4 text-forest-600" />
                            My Products
                          </Link>
                          <Link
                            to="/farmer/orders"
                            className="flex items-center gap-2.5 px-4 py-2.5 hover:bg-forest-50 hover:text-forest-800"
                          >
                            <ShoppingBag className="w-4 h-4 text-forest-600" />
                            Customer Orders
                          </Link>
                        </>
                      )}

                      {isConsumer && (
                        <>
                          <Link
                            to="/consumer/dashboard"
                            className="flex items-center gap-2.5 px-4 py-2.5 hover:bg-forest-50 hover:text-forest-800"
                          >
                            <LayoutDashboard className="w-4 h-4 text-forest-600" />
                            My Account
                          </Link>
                          <Link
                            to="/consumer/followed-farms"
                            className="flex items-center gap-2.5 px-4 py-2.5 hover:bg-forest-50 hover:text-forest-800"
                          >
                            <Tractor className="w-4 h-4 text-forest-600" />
                            Followed Farms
                          </Link>
                          <Link
                            to="/orders"
                            className="flex items-center gap-2.5 px-4 py-2.5 hover:bg-forest-50 hover:text-forest-800"
                          >
                            <Package className="w-4 h-4 text-forest-600" />
                            Order History
                          </Link>
                        </>
                      )}

                      {isAdmin && (
                        <Link
                          to="/admin/dashboard"
                          className="flex items-center gap-2.5 px-4 py-2.5 hover:bg-forest-50 hover:text-forest-800"
                        >
                          <ShieldCheck className="w-4 h-4 text-amber-600" />
                          Admin Console
                        </Link>
                      )}

                      <button
                        onClick={logout}
                        className="w-full text-left flex items-center gap-2.5 px-4 py-2.5 text-rose-600 hover:bg-rose-50 border-t border-stone-100 mt-1"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="text-xs font-semibold text-stone-700 hover:text-forest-700 px-3 py-2 rounded-xl transition"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="text-xs font-bold bg-forest-700 hover:bg-forest-800 text-white px-4 py-2 rounded-xl shadow-sm transition shadow-forest-900/10"
                >
                  Register
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-stone-600 hover:text-stone-900 rounded-lg"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-stone-200 px-4 pt-2 pb-6 space-y-3">
          <form onSubmit={handleSearchSubmit} className="relative mt-2">
            <input
              type="text"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              placeholder="Search farm fresh produce..."
              className="w-full bg-stone-100 text-sm pl-10 pr-4 py-2 rounded-xl border border-stone-200 focus:outline-none"
            />
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
          </form>

          <div className="flex flex-col gap-2 pt-2 text-sm font-semibold text-stone-700">
            <Link to="/marketplace" className="py-2 border-b border-stone-100">
              Browse Marketplace
            </Link>
            <Link to="/about" className="py-2 border-b border-stone-100">
              About FarmDirect
            </Link>
            <Link to="/contact" className="py-2 border-b border-stone-100">
              Contact & Support
            </Link>
            {!isAuthenticated && (
              <div className="flex flex-col gap-2 pt-2">
                <Link
                  to="/login"
                  className="w-full text-center py-2.5 rounded-xl border border-stone-300 font-semibold"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="w-full text-center py-2.5 rounded-xl bg-forest-700 text-white font-bold"
                >
                  Register as Farmer / Buyer
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
