import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  MapPin,
  Award,
  Sprout,
  CheckCircle2,
  Calendar,
  Sparkles,
  Phone,
  ArrowLeft,
} from 'lucide-react';
import api from '../../services/api';
import StarRating from '../../components/common/StarRating';
import ProductCard from '../../components/common/ProductCard';
import FollowFarmButton from '../../components/common/FollowFarmButton';

const FarmerProfile = () => {
  const { farmerId } = useParams();
  const [profile, setProfile] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFarmer = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/products/farmer/${farmerId}`);
        if (res.data.success) {
          setProfile(res.data.farmerProfile);
          setProducts(res.data.products);
        }
      } catch (err) {
        console.error('Failed to load farmer profile', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFarmer();
  }, [farmerId]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 flex justify-center">
        <div className="w-12 h-12 border-4 border-forest-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-stone-900">Farmer profile not found</h2>
        <Link to="/marketplace" className="px-6 py-2.5 bg-forest-700 text-white rounded-xl text-xs font-bold inline-block">
          Return to Marketplace
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      <Link to="/marketplace" className="inline-flex items-center gap-2 text-xs font-bold text-stone-500 hover:text-forest-700">
        <ArrowLeft className="w-4 h-4" /> Back to Marketplace
      </Link>

      {/* Hero Header Card */}
      <div className="bg-white rounded-3xl border border-stone-200/80 shadow-md p-6 sm:p-8 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <img
            src={
              profile.user?.avatar ||
              'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80'
            }
            alt={profile.user?.name}
            className="w-24 h-24 rounded-3xl object-cover border-4 border-emerald-500 shadow-md shrink-0"
          />

          <div className="flex-1 space-y-2">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 font-display">
                {profile.farmName || 'Verified Farm'}
              </h1>
              <span className="badge-organic">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Verified Direct Producer
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs text-stone-500">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-stone-400" />
                {profile.location?.village ? `${profile.location.village}, ` : ''}
                {profile.location?.district}, {profile.location?.state}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-stone-400" />
                {profile.experienceYears || 5} Years Farming Experience
              </span>
            </div>

            <div className="pt-1">
              <StarRating rating={profile.ratingAverage || 5.0} count={profile.ratingCount || 0} size="md" />
            </div>
          </div>

          {/* Follow Button */}
          <FollowFarmButton
            farmerId={farmerId}
            farmName={profile.farmName || 'this farm'}
            className="text-xs px-5 py-2.5"
          />
        </div>

        {/* Bio & Farming Methods */}
        <div className="mt-6 pt-6 border-t border-stone-100 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-2">
            <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider">About the Farm & Philosophy</h3>
            <p className="text-xs text-stone-600 leading-relaxed">{profile.bio}</p>
          </div>
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider">Practiced Methods</h3>
            <div className="flex flex-wrap gap-1.5">
              {profile.farmingMethods?.map((m) => (
                <span key={m} className="bg-forest-50 text-forest-800 text-[11px] font-semibold px-2.5 py-1 rounded-lg border border-forest-200">
                  {m}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Farmer's Catalog */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-stone-900 font-display">
            Active Harvests from this Farm ({products.length})
          </h2>
        </div>

        {products.length === 0 ? (
          <div className="p-8 bg-white rounded-3xl border border-stone-200 text-center text-xs text-stone-500">
            This farmer currently has no active products in harvest season.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FarmerProfile;
