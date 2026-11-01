import React, { useState, useEffect } from 'react';
import { User, MapPin, Sprout, Award, CheckCircle2, Camera, Upload } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

const FarmerProfileSettings = () => {
  const { user, reloadUser } = useAuth();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar || '');

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    farmName: '',
    bio: '',
    experienceYears: 5,
    farmingMethods: ['Organic'],
    village: '',
    district: '',
    state: '',
    pincode: '',
  });

  useEffect(() => {
    if (user?.avatar) {
      setAvatarPreview(user.avatar);
    }
  }, [user]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setFetching(true);
        const res = await api.get('/farmer/profile');
        if (res.data.success) {
          const p = res.data.profile;
          setFormData({
            name: p.user?.name || user?.name || '',
            phone: p.user?.phone || user?.phone || '',
            farmName: p.farmName || '',
            bio: p.bio || '',
            experienceYears: p.experienceYears || 5,
            farmingMethods: p.farmingMethods || ['Organic'],
            village: p.location?.village || '',
            district: p.location?.district || '',
            state: p.location?.state || '',
            pincode: p.location?.pincode || '',
          });
          if (p.user?.avatar) {
            setAvatarPreview(p.user.avatar);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setFetching(false);
      }
    };

    fetchProfile();
  }, []);

  const handleAvatarChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let res;
      if (avatarFile) {
        const submitData = new FormData();
        submitData.append('name', formData.name);
        submitData.append('phone', formData.phone);
        submitData.append('farmName', formData.farmName);
        submitData.append('bio', formData.bio);
        submitData.append('experienceYears', Number(formData.experienceYears));
        (formData.farmingMethods || []).forEach((m) => {
          submitData.append('farmingMethods', m);
        });
        submitData.append(
          'location',
          JSON.stringify({
            village: formData.village,
            district: formData.district,
            state: formData.state,
            pincode: formData.pincode,
          })
        );
        submitData.append('avatar', avatarFile);

        // Do not pass manual Content-Type so Axios/browser creates boundary properly
        res = await api.put('/auth/profile', submitData);
      } else {
        // Instant JSON update when no image file is being uploaded
        res = await api.put('/auth/profile', {
          name: formData.name,
          phone: formData.phone,
          farmName: formData.farmName,
          bio: formData.bio,
          experienceYears: Number(formData.experienceYears),
          farmingMethods: formData.farmingMethods,
          location: {
            village: formData.village,
            district: formData.district,
            state: formData.state,
            pincode: formData.pincode,
          },
        });
      }

      if (res.data.success) {
        addToast('Farm profile updated successfully!', 'success');
        if (res.data.user?.avatar) {
          setAvatarPreview(res.data.user.avatar);
        }
        await reloadUser();
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to update profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="p-12 flex justify-center">
        <div className="w-10 h-10 border-4 border-forest-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-forest-700">Settings</span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 font-display">
          Farm Profile & Story
        </h1>
        <p className="text-xs text-stone-500 mt-0.5">
          This information is displayed on your farm store page for consumers.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-stone-200/80 shadow-sm p-6 sm:p-8 space-y-6 text-xs">
        {/* Personal Profile Photo Section */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 p-4 rounded-2xl bg-stone-50 border border-stone-200">
          <div className="relative group">
            <img
              src={
                avatarPreview ||
                'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80'
              }
              alt="Farmer Profile"
              className="w-20 h-20 rounded-2xl object-cover border-2 border-forest-600 shadow-sm"
            />
            <label className="absolute inset-0 bg-black/40 rounded-2xl flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition cursor-pointer">
              <Camera className="w-5 h-5 mb-0.5" />
              <span className="text-[10px] font-bold">Change</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </label>
          </div>

          <div className="flex-1 text-center sm:text-left space-y-1.5">
            <h4 className="font-bold text-stone-900 text-sm">Personal Profile Photo</h4>
            <p className="text-[11px] text-stone-500">
              Upload your personal farmer profile picture to build authenticity and trust with buyers.
            </p>
            <div className="pt-1 flex flex-wrap gap-2 justify-center sm:justify-start">
              <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-stone-300 hover:border-forest-600 rounded-xl text-stone-700 font-bold text-xs cursor-pointer shadow-xs hover:bg-forest-50 transition">
                <Upload className="w-3.5 h-3.5 text-forest-600" />
                Select Photo
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/jpg"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </label>
              {avatarFile && (
                <span className="text-emerald-700 font-semibold text-xs flex items-center gap-1 self-center">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Selected: {avatarFile.name}
                </span>
              )}
            </div>
          </div>
        </div>

        <div>
          <label className="font-bold text-stone-700 block mb-1">Farmer Full Name</label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 focus:outline-none focus:border-forest-600"
          />
        </div>

        <div>
          <label className="font-bold text-stone-700 block mb-1">Farm / Cooperative Name</label>
          <input
            type="text"
            required
            value={formData.farmName}
            onChange={(e) => setFormData({ ...formData, farmName: e.target.value })}
            className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 focus:outline-none focus:border-forest-600"
          />
        </div>

        <div>
          <label className="font-bold text-stone-700 block mb-1">Farm Bio & Story</label>
          <textarea
            rows="4"
            required
            value={formData.bio}
            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 focus:outline-none focus:border-forest-600"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="font-bold text-stone-700 block mb-1">Experience (Years)</label>
            <input
              type="number"
              min={0}
              value={formData.experienceYears}
              onChange={(e) => setFormData({ ...formData, experienceYears: e.target.value })}
              className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 focus:outline-none"
            />
          </div>
          <div>
            <label className="font-bold text-stone-700 block mb-1">Contact Phone</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <label className="font-bold text-stone-700 block mb-1">Village</label>
            <input
              type="text"
              value={formData.village}
              onChange={(e) => setFormData({ ...formData, village: e.target.value })}
              className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 focus:outline-none"
            />
          </div>
          <div>
            <label className="font-bold text-stone-700 block mb-1">District</label>
            <input
              type="text"
              value={formData.district}
              onChange={(e) => setFormData({ ...formData, district: e.target.value })}
              className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 focus:outline-none"
            />
          </div>
          <div>
            <label className="font-bold text-stone-700 block mb-1">State</label>
            <input
              type="text"
              value={formData.state}
              onChange={(e) => setFormData({ ...formData, state: e.target.value })}
              className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 focus:outline-none"
            />
          </div>
          <div>
            <label className="font-bold text-stone-700 block mb-1">PIN Code</label>
            <input
              type="text"
              value={formData.pincode}
              onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
              className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 focus:outline-none"
            />
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-stone-100">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-forest-700 hover:bg-forest-800 text-white rounded-xl font-bold transition shadow-sm"
          >
            {loading ? 'Saving Changes...' : 'Update Farm Profile'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default FarmerProfileSettings;
