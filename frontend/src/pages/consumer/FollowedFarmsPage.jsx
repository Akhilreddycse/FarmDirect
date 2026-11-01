import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Tractor,
  MapPin,
  Star,
  ArrowRight,
  Bell,
  Package,
  RefreshCw,
  Sprout,
  ChevronRight,
} from 'lucide-react';
import api from '../../services/api';

const FollowedFarmsPage = () => {
  const [farms, setFarms] = useState([]);
  const [feed, setFeed] = useState([]);
  const [loadingFarms, setLoadingFarms] = useState(true);
  const [loadingFeed, setLoadingFeed] = useState(true);
  const [activeTab, setActiveTab] = useState('feed'); // 'feed' | 'farms'

  const fetchFarms = async () => {
    setLoadingFarms(true);
    try {
      const res = await api.get('/follow/my-farms');
      if (res.data.success) setFarms(res.data.farms);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingFarms(false);
    }
  };

  const fetchFeed = async () => {
    setLoadingFeed(true);
    try {
      const res = await api.get('/follow/feed?limit=12');
      if (res.data.success) setFeed(res.data.products);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingFeed(false);
    }
  };

  useEffect(() => {
    fetchFarms();
    fetchFeed();
  }, []);

  const unfollowFarm = async (farmerId, farmName) => {
    try {
      await api.delete(`/follow/${farmerId}`);
      setFarms((prev) => prev.filter((f) => f.farmer._id !== farmerId));
    } catch (err) {
      console.error('Unfollow failed', err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-forest-900 to-forest-800 text-white rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-500/20 rounded-2xl flex items-center justify-center">
            <Tractor className="w-6 h-6 text-emerald-300" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold font-display">My Followed Farms</h1>
            <p className="text-xs text-stone-300 mt-0.5">
              {farms.length} farm{farms.length !== 1 ? 's' : ''} followed · Get notified when they add new products
            </p>
          </div>
        </div>
        <Link
          to="/marketplace"
          className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-forest-950 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
        >
          <Sprout className="w-4 h-4" /> Discover More Farms
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-stone-100 p-1 rounded-2xl w-fit">
        <button
          onClick={() => setActiveTab('feed')}
          className={`px-5 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'feed' ? 'bg-white text-forest-800 shadow-sm' : 'text-stone-500 hover:text-stone-700'
          }`}
        >
          🌾 Latest Products
        </button>
        <button
          onClick={() => setActiveTab('farms')}
          className={`px-5 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'farms' ? 'bg-white text-forest-800 shadow-sm' : 'text-stone-500 hover:text-stone-700'
          }`}
        >
          🚜 Followed Farms ({farms.length})
        </button>
      </div>

      {/* ── FEED TAB ── */}
      {activeTab === 'feed' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-bold text-stone-900 text-base font-display">New From Your Farms</h2>
              <p className="text-xs text-stone-500">Latest products added by farms you follow</p>
            </div>
            <button onClick={fetchFeed} className="flex items-center gap-1.5 text-xs font-bold text-forest-700 hover:text-forest-900">
              <RefreshCw className="w-3.5 h-3.5" /> Refresh
            </button>
          </div>

          {loadingFeed ? (
            <div className="flex justify-center py-16">
              <div className="w-10 h-10 border-4 border-forest-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : farms.length === 0 ? (
            <EmptyFollowState />
          ) : feed.length === 0 ? (
            <div className="bg-white rounded-3xl border border-stone-200 p-12 text-center space-y-3">
              <Package className="w-10 h-10 text-stone-300 mx-auto" />
              <p className="text-sm font-bold text-stone-700">No new products yet</p>
              <p className="text-xs text-stone-400">The farms you follow haven't added new products recently.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {feed.map((product) => (
                <FeedProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── FARMS TAB ── */}
      {activeTab === 'farms' && (
        <div className="space-y-4">
          {loadingFarms ? (
            <div className="flex justify-center py-16">
              <div className="w-10 h-10 border-4 border-forest-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : farms.length === 0 ? (
            <EmptyFollowState />
          ) : (
            farms.map((follow) => (
              <FarmCard
                key={follow._id}
                follow={follow}
                onUnfollow={() => unfollowFarm(follow.farmer._id, follow.farmerProfile?.farmName)}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
};

// ─── Feed Product Card ────────────────────────────────────────────────────────
const FeedProductCard = ({ product }) => {
  const discount = product.originalPrice && product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : null;

  return (
    <Link
      to={`/products/${product._id}`}
      className="bg-white rounded-2xl border border-stone-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all overflow-hidden group"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={product.images?.[0] || 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=400&q=80'}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {discount && (
          <span className="absolute top-2 left-2 bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
            -{discount}%
          </span>
        )}
        {product.isOrganic && (
          <span className="absolute top-2 right-2 bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
            Organic
          </span>
        )}
      </div>
      <div className="p-3.5 space-y-1.5">
        <p className="text-[10px] text-forest-700 font-semibold truncate">
          🚜 {product.farmerProfile?.farmName || product.farmer?.name}
        </p>
        <h3 className="text-xs font-bold text-stone-900 leading-snug line-clamp-2">{product.name}</h3>
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-baseline gap-1.5">
            <span className="text-sm font-extrabold text-forest-800">₹{product.price}</span>
            <span className="text-[10px] text-stone-400">/{product.unit}</span>
          </div>
          {product.originalPrice > product.price && (
            <span className="text-[10px] text-stone-400 line-through">₹{product.originalPrice}</span>
          )}
        </div>
      </div>
    </Link>
  );
};

// ─── Farm Card ────────────────────────────────────────────────────────────────
const FarmCard = ({ follow, onUnfollow }) => {
  const { farmer, farmerProfile, createdAt } = follow;
  const fp = farmerProfile || {};

  return (
    <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-5 flex flex-col sm:flex-row items-start sm:items-center gap-5">
      <img
        src={
          farmer?.avatar ||
          `https://ui-avatars.com/api/?name=${encodeURIComponent(fp.farmName || farmer?.name || 'Farm')}&background=224e2d&color=fff`
        }
        alt={fp.farmName}
        className="w-14 h-14 rounded-2xl object-cover border-2 border-emerald-200 shrink-0"
      />
      <div className="flex-1 space-y-1 min-w-0">
        <p className="font-bold text-stone-900 text-sm truncate">{fp.farmName || farmer?.name}</p>
        <div className="flex flex-wrap gap-3 text-xs text-stone-500">
          {fp.location?.district && (
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {fp.location.district}, {fp.location.state}
            </span>
          )}
          {fp.ratingAverage && (
            <span className="flex items-center gap-1">
              <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
              {fp.ratingAverage.toFixed(1)} ({fp.ratingCount} reviews)
            </span>
          )}
        </div>
        <p className="text-[10px] text-stone-400">
          Following since {new Date(createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
        </p>
        <div className="flex flex-wrap gap-1 pt-0.5">
          {fp.farmingMethods?.slice(0, 3).map((m) => (
            <span key={m} className="bg-forest-50 text-forest-700 text-[10px] font-semibold px-2 py-0.5 rounded-md border border-forest-200">
              {m}
            </span>
          ))}
        </div>
      </div>
      <div className="flex sm:flex-col gap-2 shrink-0">
        <Link
          to={`/farmers/${farmer?._id}`}
          className="flex items-center gap-1 px-3 py-1.5 bg-forest-50 border border-forest-200 text-forest-800 rounded-lg text-[10px] font-bold hover:bg-forest-100 transition"
        >
          Visit Farm <ChevronRight className="w-3 h-3" />
        </Link>
        <button
          onClick={onUnfollow}
          className="px-3 py-1.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-[10px] font-bold hover:bg-rose-100 transition"
        >
          Unfollow
        </button>
      </div>
    </div>
  );
};

// ─── Empty State ──────────────────────────────────────────────────────────────
const EmptyFollowState = () => (
  <div className="bg-white rounded-3xl border border-stone-200 p-14 text-center space-y-4">
    <div className="w-16 h-16 bg-forest-50 rounded-3xl flex items-center justify-center mx-auto">
      <Tractor className="w-8 h-8 text-forest-400" />
    </div>
    <div>
      <p className="font-bold text-stone-800 text-sm">You haven't followed any farms yet</p>
      <p className="text-xs text-stone-400 mt-1">
        Visit a farmer's profile and click <strong>"🌾 Follow Farm"</strong> to get notified when they add new products.
      </p>
    </div>
    <Link
      to="/marketplace"
      className="inline-flex items-center gap-2 px-5 py-2.5 bg-forest-700 text-white rounded-xl text-xs font-bold hover:bg-forest-800 transition"
    >
      Discover Farmers <ArrowRight className="w-4 h-4" />
    </Link>
  </div>
);

export default FollowedFarmsPage;
