import React from 'react';
import { Link } from 'react-router-dom';
import { Sprout, ShieldCheck, Truck, RefreshCw, Award, Heart } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-stone-900 text-stone-300 pt-16 pb-12 border-t border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Core Value Props Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 pb-12 border-b border-stone-800">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-forest-900/60 border border-forest-700/50 flex items-center justify-center text-forest-400 shrink-0">
              <Sprout className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-white font-semibold text-sm">100% Direct from Farm</h4>
              <p className="text-xs text-stone-400">Zero middleman margins or adulteration</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-forest-900/60 border border-forest-700/50 flex items-center justify-center text-forest-400 shrink-0">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-white font-semibold text-sm">Quality Guaranteed</h4>
              <p className="text-xs text-stone-400">Harvested fresh upon order confirmation</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-forest-900/60 border border-forest-700/50 flex items-center justify-center text-forest-400 shrink-0">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-white font-semibold text-sm">Direct Farm Logistics</h4>
              <p className="text-xs text-stone-400">Delivered within 24-48 hrs of harvest</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-forest-900/60 border border-forest-700/50 flex items-center justify-center text-forest-400 shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-white font-semibold text-sm">Fair Farmer Earnings</h4>
              <p className="text-xs text-stone-400">Farmers receive up to 90% of product price</p>
            </div>
          </div>
        </div>

        {/* Navigation Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-12">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Sprout className="w-6 h-6 text-forest-400" />
              <span className="text-lg font-bold font-display text-white">FarmDirect</span>
            </div>
            <p className="text-xs text-stone-400 leading-relaxed mb-4">
              Empowering Indian farmers by directly connecting them to conscious urban consumers for sustainable, pesticide-free nutrition.
            </p>
          </div>

          <div>
            <h4 className="text-white font-semibold text-sm mb-3 font-display">Categories</h4>
            <ul className="space-y-2 text-xs text-stone-400">
              <li><Link to="/marketplace?category=fresh-vegetables" className="hover:text-white transition">Fresh Vegetables</Link></li>
              <li><Link to="/marketplace?category=organic-fruits" className="hover:text-white transition">Organic Fruits</Link></li>
              <li><Link to="/marketplace?category=grains-rice" className="hover:text-white transition">Grains & Traditional Rice</Link></li>
              <li><Link to="/marketplace?category=pure-honey-jaggery" className="hover:text-white transition">Pure Honey & Jaggery</Link></li>
              <li><Link to="/marketplace?category=nutritious-millets" className="hover:text-white transition">Ancient Super Millets</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold text-sm mb-3 font-display">For Farmers</h4>
            <ul className="space-y-2 text-xs text-stone-400">
              <li><Link to="/register?role=farmer" className="hover:text-white transition">Register as a Farmer</Link></li>
              <li><Link to="/login" className="hover:text-white transition">Farmer Login Portal</Link></li>
              <li><Link to="/about" className="hover:text-white transition">Fair Trade Pricing Policy</Link></li>
              <li><Link to="/contact" className="hover:text-white transition">Farming Support Line</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold text-sm mb-3 font-display">Legal & Trust</h4>
            <ul className="space-y-2 text-xs text-stone-400">
              <li><Link to="/about" className="hover:text-white transition">Terms of Direct Sale</Link></li>
              <li><Link to="/about" className="hover:text-white transition">Privacy & Data Security</Link></li>
              <li><Link to="/contact" className="hover:text-white transition">Verified Farm Certificates</Link></li>
              <li><Link to="/contact" className="hover:text-white transition">Customer Support 24/7</Link></li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="pt-8 border-t border-stone-800 text-center text-xs text-stone-500 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} FarmDirect Marketplace. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Grown with care in India <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 inline" /> for healthy communities.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
