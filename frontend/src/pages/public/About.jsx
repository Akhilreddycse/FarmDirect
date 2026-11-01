import React from 'react';
import { Sprout, ShieldCheck, HeartHandshake, Award, TrendingUp, Users } from 'lucide-react';

const About = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs font-bold uppercase tracking-wider text-forest-700">Our Agricultural Mission</span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-stone-900 font-display">
          Reimagining Food Systems from Farm to Fork
        </h1>
        <p className="text-stone-600 text-sm sm:text-base leading-relaxed">
          FarmDirect was founded to solve a massive structural crisis: Indian farmers earn less than 20-30% of consumer food spending due to layers of intermediaries, while consumers pay inflated prices for weeks-old, chemical-treated produce.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white p-8 rounded-3xl border border-stone-200 shadow-sm space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-forest-800 flex items-center justify-center">
            <HeartHandshake className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-stone-900 text-base">Direct Fair Trade</h3>
          <p className="text-xs text-stone-500 leading-relaxed">
            Farmers set their own crop prices based on real production costs and retain 85-90% of the sale value.
          </p>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-stone-200 shadow-sm space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center">
            <Award className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-stone-900 text-base">Chemical-Free Nutrition</h3>
          <p className="text-xs text-stone-500 leading-relaxed">
            Every listed farm uses natural, organic, or Vedic zero-chemical methods verified by our quality inspection team.
          </p>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-stone-200 shadow-sm space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-forest-100 text-forest-800 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-stone-900 text-base">Complete Traceability</h3>
          <p className="text-xs text-stone-500 leading-relaxed">
            Consumers know exactly which village, farmer, and harvest batch their food came from with transparent harvesting dates.
          </p>
        </div>
      </div>
    </div>
  );
};

export default About;
