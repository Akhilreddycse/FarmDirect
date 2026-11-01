import React, { useState, useEffect } from 'react';
import { Sprout, ShieldCheck, CheckCircle2, XCircle, MapPin } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

const AdminFarmers = () => {
  const { addToast } = useToast();
  const [farmers, setFarmers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchFarmers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/farmers');
      if (res.data.success) {
        setFarmers(res.data.farmers);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFarmers();
  }, []);

  const handleVerify = async (farmerProfileId, isApproved) => {
    try {
      const res = await api.put(`/admin/farmers/${farmerProfileId}/verify`, { isApproved });
      if (res.data.success) {
        addToast(res.data.message, 'success');
        fetchFarmers();
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Verification failed', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-forest-700">Verification</span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 font-display">
          Farmer Verification & Quality Approvals
        </h1>
        <p className="text-xs text-stone-500 mt-0.5">
          Approve or reject agricultural producer credentials to maintain 100% genuine farm produce
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-stone-200/80 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 flex justify-center">
            <div className="w-10 h-10 border-4 border-forest-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 font-bold uppercase">
                <tr>
                  <th className="p-4">Farmer / Farm Enterprise</th>
                  <th className="p-4">Location</th>
                  <th className="p-4">Experience</th>
                  <th className="p-4">Practices</th>
                  <th className="p-4">Total Sales</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Verification Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {farmers.map((f) => (
                  <tr key={f._id} className="hover:bg-stone-50 transition">
                    <td className="p-4">
                      <div className="font-bold text-stone-900">{f.user?.name}</div>
                      <div className="text-[11px] text-forest-800 font-semibold">{f.farmName}</div>
                      <div className="text-[10px] text-stone-400">{f.user?.email}</div>
                    </td>
                    <td className="p-4 text-stone-600">
                      {f.location?.district}, {f.location?.state}
                    </td>
                    <td className="p-4 text-stone-600">{f.experienceYears} Years</td>
                    <td className="p-4">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {f.farmingMethods?.map((m) => (
                          <span key={m} className="bg-forest-50 text-forest-800 text-[10px] font-bold px-2 py-0.5 rounded">
                            {m}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="p-4 font-bold text-forest-900 font-display">
                      ₹{f.totalSalesAmount?.toLocaleString() || 0}
                    </td>
                    <td className="p-4">
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                          f.isApproved
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {f.isApproved ? 'Verified & Approved' : 'Pending Verification'}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      {f.isApproved ? (
                        <button
                          onClick={() => handleVerify(f._id, false)}
                          className="px-3 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 font-bold rounded-xl text-[11px]"
                        >
                          Revoke Verification
                        </button>
                      ) : (
                        <button
                          onClick={() => handleVerify(f._id, true)}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-[11px]"
                        >
                          Approve Farmer
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminFarmers;
