import React, { useState, useEffect } from 'react';
import { Users, Search, ShieldCheck, XCircle, CheckCircle2 } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

const AdminUsers = () => {
  const { addToast } = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/users', {
        params: { search, role: roleFilter },
      });
      if (res.data.success) {
        setUsers(res.data.users);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter]);

  const handleToggleActive = async (user) => {
    try {
      const res = await api.put(`/admin/users/${user._id}/status`, {
        isActive: !user.isActive,
      });
      if (res.data.success) {
        addToast(`User ${!user.isActive ? 'activated' : 'deactivated'}`, 'success');
        fetchUsers();
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to update user', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-forest-700">Governance</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 font-display">
            User Accounts Management
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Monitor, verify, activate, or suspend platform user and farmer accounts
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="bg-white border border-stone-200 text-xs font-bold text-stone-700 px-3 py-2 rounded-xl"
          >
            <option value="">All Roles</option>
            <option value="farmer">Farmers</option>
            <option value="consumer">Consumers</option>
            <option value="admin">Administrators</option>
          </select>
        </div>
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
                  <th className="p-4">User</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Phone</th>
                  <th className="p-4">Joined Date</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-stone-50 transition">
                    <td className="p-4 flex items-center gap-3">
                      <img
                        src={
                          u.avatar ||
                          `https://ui-avatars.com/api/?name=${encodeURIComponent(
                            u.name
                          )}&background=224e2d&color=fff`
                        }
                        alt=""
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <div>
                        <span className="font-bold text-stone-900 block">{u.name}</span>
                        <span className="text-[11px] text-stone-400">{u.email}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="bg-forest-100 text-forest-900 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                        {u.role}
                      </span>
                    </td>
                    <td className="p-4 text-stone-600">{u.phone || 'N/A'}</td>
                    <td className="p-4 text-stone-500">{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td className="p-4">
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                          u.isActive
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {u.isActive ? 'Active' : 'Suspended'}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      {u.role !== 'admin' && (
                        <button
                          onClick={() => handleToggleActive(u)}
                          className={`px-3 py-1.5 rounded-xl font-bold transition text-[11px] ${
                            u.isActive
                              ? 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                              : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                          }`}
                        >
                          {u.isActive ? 'Deactivate' : 'Activate'}
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

export default AdminUsers;
