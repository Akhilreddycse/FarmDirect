import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Sprout, User, Lock, Mail, Phone, MapPin, ArrowRight, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Register = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { register } = useAuth();

  const [role, setRole] = useState(searchParams.get('role') === 'farmer' ? 'farmer' : 'consumer');
  const [loading, setLoading] = useState(false);

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');

  // Farmer Specific Fields
  const [farmName, setFarmName] = useState('');
  const [bio, setBio] = useState('');
  const [experienceYears, setExperienceYears] = useState(5);
  const [farmingMethod, setFarmingMethod] = useState('Organic');
  const [village, setVillage] = useState('');
  const [district, setDistrict] = useState('');
  const [state, setState] = useState('Maharashtra');
  const [pincode, setPincode] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      name,
      email,
      password,
      phone,
      role,
    };

    if (role === 'farmer') {
      payload.farmName = farmName || `${name}'s Family Farm`;
      payload.bio = bio || 'Dedicated to organic and sustainable agriculture.';
      payload.experienceYears = Number(experienceYears);
      payload.farmingMethods = [farmingMethod];
      payload.location = {
        village,
        district,
        state,
        pincode,
      };
    }

    const result = await register(payload);
    setLoading(false);

    if (result.success) {
      if (role === 'farmer') {
        navigate('/farmer/dashboard');
      } else {
        navigate('/marketplace');
      }
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-lg w-full space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-forest-800 text-emerald-300 flex items-center justify-center mx-auto shadow-md">
            <Sprout className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-bold font-display text-stone-900">Join FarmDirect Marketplace</h2>
          <p className="text-xs text-stone-500">Connect directly for fresh, fair trade agricultural produce</p>
        </div>

        {/* Role Toggle Selector */}
        <div className="grid grid-cols-2 gap-2 p-1.5 bg-stone-100 rounded-2xl border border-stone-200">
          <button
            type="button"
            onClick={() => setRole('consumer')}
            className={`py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
              role === 'consumer'
                ? 'bg-white text-forest-900 shadow-sm'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <User className="w-4 h-4" />
            I am a Consumer / Buyer
          </button>
          <button
            type="button"
            onClick={() => setRole('farmer')}
            className={`py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
              role === 'farmer'
                ? 'bg-forest-700 text-white shadow-sm'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <Sprout className="w-4 h-4" />
            I am a Farmer / Producer
          </button>
        </div>

        {/* Form Container */}
        <div className="bg-white p-8 rounded-3xl border border-stone-200/80 shadow-sm space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-stone-700">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Anand Sharma"
                className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-xs text-stone-900 mt-1 focus:outline-none focus:border-forest-600 focus:bg-white"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-stone-700">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-xs text-stone-900 mt-1 focus:outline-none focus:border-forest-600 focus:bg-white"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-stone-700">Mobile Phone</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 9876543210"
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-xs text-stone-900 mt-1 focus:outline-none focus:border-forest-600 focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-stone-700">Password</label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-xs text-stone-900 mt-1 focus:outline-none focus:border-forest-600 focus:bg-white"
              />
            </div>

            {/* Farmer Specific Extra Fields */}
            {role === 'farmer' && (
              <div className="space-y-4 pt-3 border-t border-stone-100">
                <div className="flex items-center gap-1.5 text-xs font-bold text-forest-800">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  Farm Details & Location
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-700">Farm / Enterprise Name</label>
                  <input
                    type="text"
                    required
                    value={farmName}
                    onChange={(e) => setFarmName(e.target.value)}
                    placeholder="e.g. Himalaya Organic Orchards"
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-xs text-stone-900 mt-1 focus:outline-none focus:border-forest-600 focus:bg-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-stone-700">Farming Method</label>
                    <select
                      value={farmingMethod}
                      onChange={(e) => setFarmingMethod(e.target.value)}
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-xs text-stone-900 mt-1 focus:outline-none"
                    >
                      <option value="Organic">Organic</option>
                      <option value="Natural / Vedic">Natural / Vedic</option>
                      <option value="Zero Budget Natural Farming (ZBNF)">ZBNF</option>
                      <option value="Regenerative">Regenerative</option>
                      <option value="Hydroponic">Hydroponic</option>
                      <option value="Traditional">Traditional</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-stone-700">Experience (Years)</label>
                    <input
                      type="number"
                      min={0}
                      value={experienceYears}
                      onChange={(e) => setExperienceYears(e.target.value)}
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-xs text-stone-900 mt-1 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-stone-700">Village / Town</label>
                    <input
                      type="text"
                      required
                      value={village}
                      onChange={(e) => setVillage(e.target.value)}
                      placeholder="e.g. Kotgarh"
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-xs text-stone-900 mt-1 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-stone-700">District</label>
                    <input
                      type="text"
                      required
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      placeholder="e.g. Shimla"
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-xs text-stone-900 mt-1 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-stone-700">State</label>
                    <input
                      type="text"
                      required
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      placeholder="e.g. Himachal Pradesh"
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-xs text-stone-900 mt-1 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-stone-700">Postal PIN Code</label>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value)}
                      placeholder="6 digits"
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-xs text-stone-900 mt-1 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-forest-700 hover:bg-forest-800 text-white rounded-xl text-xs font-bold transition shadow-md shadow-forest-900/10 flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  Create {role === 'farmer' ? 'Farmer Producer' : 'Consumer'} Account
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="pt-4 border-t border-stone-100 text-center text-xs text-stone-500">
            Already have an account?{' '}
            <Link to="/login" className="text-forest-700 font-bold hover:underline">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
