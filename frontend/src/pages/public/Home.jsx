import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Sprout,
  ArrowRight,
  ShieldCheck,
  Award,
  Sparkles,
  MapPin,
  TrendingUp,
  Truck,
  HeartHandshake,
  CheckCircle2,
} from 'lucide-react';
import api from '../../services/api';
import ProductCard from '../../components/common/ProductCard';

const Home = () => {
  const [categories, setCategories] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [organicProducts, setOrganicProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [catsRes, featRes, orgRes] = await Promise.all([
          api.get('/categories'),
          api.get('/products?featured=true&limit=4'),
          api.get('/products?organic=true&limit=8'),
        ]);

        if (catsRes.data.success) setCategories(catsRes.data.categories);
        if (featRes.data.success) setFeaturedProducts(featRes.data.products);
        if (orgRes.data.success) setOrganicProducts(orgRes.data.products);
      } catch (err) {
        console.error('Failed to load homepage data', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="space-y-16 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-forest-950 via-forest-900 to-forest-950 text-white pt-20 pb-28 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#64b476_1px,transparent_1px)] [background-size:16px_16px]" />

        <div className="max-w-7xl mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-forest-800/80 border border-forest-600/50 text-emerald-300 text-xs font-semibold backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5" />
              Direct from 1,200+ Verified Indian Farmers
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight font-display text-white leading-tight">
              Pure Farm Produce,{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-300">
                Zero Middlemen.
              </span>
            </h1>

            <p className="text-stone-300 text-base sm:text-lg max-w-2xl leading-relaxed">
              Buy freshly harvested vegetables, cold-pressed oils, pure mountain honey, and ancient millets directly from the farmers who grow them. 100% fair pricing, 100% traceable.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-2 justify-center lg:justify-start">
              <Link
                to="/marketplace"
                className="px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-forest-950 font-bold rounded-2xl shadow-lg shadow-emerald-500/20 hover:scale-[1.02] active:scale-95 transition flex items-center justify-center gap-2"
              >
                Shop Farm Fresh
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to="/register?role=farmer"
                className="px-8 py-4 bg-forest-800/80 hover:bg-forest-700 text-white font-semibold rounded-2xl border border-forest-600/60 backdrop-blur-md transition flex items-center justify-center gap-2"
              >
                Sell as a Farmer
              </Link>
            </div>

            {/* Micro Stats */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-forest-800/60">
              <div>
                <p className="text-2xl font-bold text-white font-display">0%</p>
                <p className="text-xs text-stone-400">Intermediary Cut</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-emerald-400 font-display">24-48 hrs</p>
                <p className="text-xs text-stone-400">Harvest to Doorstep</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-amber-300 font-display">100%</p>
                <p className="text-xs text-stone-400">Organic & Natural</p>
              </div>
            </div>
          </div>

          {/* Hero Banner Visual Showcase */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md">
              <div className="aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl border-4 border-forest-700/50 group">
                <img
                  src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80"
                  alt="Fresh Organic Harvest"
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-700"
                />
              </div>

              {/* Floating Quality / Origin Badge */}
              <div className="absolute -bottom-6 -left-6 bg-white/95 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-stone-200/80 text-stone-900 max-w-xs animate-bounce-subtle">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-emerald-100 flex items-center justify-center border-2 border-forest-600 text-forest-700 shrink-0">
                    <Sprout className="w-6 h-6 text-emerald-700" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-stone-900">Direct From Verified Farms</p>
                    <p className="text-[10px] text-stone-500">Zero Middlemen • Fresh Harvest</p>
                    <div className="flex items-center gap-1 text-emerald-600 text-[10px] font-bold mt-0.5">
                      <CheckCircle2 className="w-3 h-3" />
                      100% Traceable to Soil
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Produce Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-forest-700">Explore Produce</span>
            <h2 className="text-2xl sm:text-3xl font-bold text-stone-900 mt-1">
              Shop by Farm Category
            </h2>
          </div>
          <Link
            to="/marketplace"
            className="text-xs font-bold text-forest-700 hover:text-forest-900 flex items-center gap-1"
          >
            All Categories <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat._id}
              to={`/marketplace?category=${cat.slug}`}
              className="group bg-white p-3 rounded-2xl border border-stone-200/80 hover:border-forest-600 hover:shadow-lg transition-all text-center flex flex-col items-center"
            >
              <div className="w-14 h-14 rounded-full bg-forest-50 flex items-center justify-center overflow-hidden mb-2 group-hover:scale-110 transition">
                {cat.image ? (
                  <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
                ) : (
                  <Sprout className="w-6 h-6 text-forest-700" />
                )}
              </div>
              <span className="text-xs font-bold text-stone-800 group-hover:text-forest-700 line-clamp-2">
                {cat.name}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Farm Fresh Produce */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">Hand-Picked Daily</span>
            <h2 className="text-2xl sm:text-3xl font-bold text-stone-900 mt-1">
              Featured Direct Harvests
            </h2>
          </div>
          <Link
            to="/marketplace"
            className="text-xs font-bold text-forest-700 hover:text-forest-900 flex items-center gap-1"
          >
            Explore Catalog <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      </section>

      {/* How Direct Marketplace Eliminates Middlemen */}
      <section className="bg-stone-100 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-forest-700">The FarmDirect Difference</span>
            <h2 className="text-3xl font-bold text-stone-900 mt-1 font-display">
              How We Eliminate Middlemen
            </h2>
            <p className="text-stone-600 text-sm mt-2">
              Traditional supply chains involve 4-6 brokers before food reaches your kitchen, inflating prices by 200% while farmers receive meager returns. FarmDirect creates a straight line.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm relative">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-lg mb-4">
                1
              </div>
              <h3 className="text-base font-bold text-stone-900 mb-2">Farmer Lists Fresh Harvest</h3>
              <p className="text-xs text-stone-500 leading-relaxed">
                Farmers list their crops directly from their fields with transparent prices, organic certifications, and available harvest quantities.
              </p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm relative">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-lg mb-4">
                2
              </div>
              <h3 className="text-base font-bold text-stone-900 mb-2">You Order at Honest Rates</h3>
              <p className="text-xs text-stone-500 leading-relaxed">
                You browse produce across multiple farmers in a single cart, with complete visibility into the farm origin and harvesting method.
              </p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm relative">
              <div className="w-12 h-12 rounded-2xl bg-forest-100 text-forest-800 flex items-center justify-center font-bold text-lg mb-4">
                3
              </div>
              <h3 className="text-base font-bold text-stone-900 mb-2">Direct Harvest & Door Delivery</h3>
              <p className="text-xs text-stone-500 leading-relaxed">
                The farmer packs the order fresh upon confirmation, and it is dispatched directly to your doorstep in 24-48 hours.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 100% Certified Organic & Natural Produce */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">Zero Chemical Farming</span>
            <h2 className="text-2xl sm:text-3xl font-bold text-stone-900 mt-1">
              Certified Organic & Vedic Produce
            </h2>
          </div>
          <Link
            to="/marketplace?organic=true"
            className="text-xs font-bold text-forest-700 hover:text-forest-900 flex items-center gap-1"
          >
            View All Organic <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {organicProducts.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;
