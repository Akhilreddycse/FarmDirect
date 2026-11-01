import React, { useState, useEffect } from 'react';
import { MapPin, Plus, Trash2, Edit, CheckCircle2 } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

const AddressesPage = () => {
  const { addToast } = useToast();
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    houseBuilding: '',
    street: '',
    villageCity: '',
    district: '',
    state: 'Maharashtra',
    pincode: '',
    landmark: '',
    addressType: 'Home',
    isDefault: false,
  });

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const res = await api.get('/addresses');
      if (res.data.success) setAddresses(res.data.addresses);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/addresses', formData);
      if (res.data.success) {
        addToast('Delivery address saved', 'success');
        setShowForm(false);
        fetchAddresses();
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to save', 'error');
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await api.delete(`/addresses/${id}`);
      if (res.data.success) {
        addToast('Address deleted', 'info');
        fetchAddresses();
      }
    } catch (err) {
      addToast('Failed to delete address', 'error');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-forest-700">Account</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 font-display">
            Delivery Addresses
          </h1>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2.5 bg-forest-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm"
        >
          <Plus className="w-4 h-4" /> Add Address
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSave} className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm space-y-4 max-w-2xl">
          <h3 className="text-sm font-bold text-stone-900">Add New Address</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="text"
              required
              placeholder="Full Name"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              className="bg-stone-50 p-2.5 rounded-xl border border-stone-200 text-xs"
            />
            <input
              type="tel"
              required
              placeholder="Phone Number"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="bg-stone-50 p-2.5 rounded-xl border border-stone-200 text-xs"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="text"
              required
              placeholder="Flat / Building"
              value={formData.houseBuilding}
              onChange={(e) => setFormData({ ...formData, houseBuilding: e.target.value })}
              className="bg-stone-50 p-2.5 rounded-xl border border-stone-200 text-xs"
            />
            <input
              type="text"
              required
              placeholder="Street Name"
              value={formData.street}
              onChange={(e) => setFormData({ ...formData, street: e.target.value })}
              className="bg-stone-50 p-2.5 rounded-xl border border-stone-200 text-xs"
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <input
              type="text"
              required
              placeholder="City / Village"
              value={formData.villageCity}
              onChange={(e) => setFormData({ ...formData, villageCity: e.target.value })}
              className="bg-stone-50 p-2.5 rounded-xl border border-stone-200 text-xs"
            />
            <input
              type="text"
              required
              placeholder="District"
              value={formData.district}
              onChange={(e) => setFormData({ ...formData, district: e.target.value })}
              className="bg-stone-50 p-2.5 rounded-xl border border-stone-200 text-xs"
            />
            <input
              type="text"
              required
              placeholder="PIN Code"
              value={formData.pincode}
              onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
              className="bg-stone-50 p-2.5 rounded-xl border border-stone-200 text-xs"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 text-xs text-stone-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-forest-700 text-white text-xs font-bold rounded-xl"
            >
              Save Address
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {addresses.map((addr) => (
          <div key={addr._id} className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-stone-900 text-sm">{addr.fullName}</span>
                {addr.isDefault && (
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                    Default
                  </span>
                )}
              </div>
              <p className="text-xs text-stone-500 mt-2">
                {addr.houseBuilding}, {addr.street}, {addr.villageCity}, {addr.district}, {addr.state} - {addr.pincode}
              </p>
              <p className="text-xs text-stone-400 mt-1">📞 {addr.phone}</p>
            </div>

            <div className="flex justify-end pt-3 border-t border-stone-100">
              <button
                onClick={() => handleDelete(addr._id)}
                className="text-stone-400 hover:text-rose-600 transition p-1"
                title="Delete address"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AddressesPage;
