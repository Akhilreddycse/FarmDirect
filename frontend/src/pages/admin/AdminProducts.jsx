import React, { useState, useEffect } from 'react';
import { Package, Search, Trash2, CheckCircle2, XCircle } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

const AdminProducts = () => {
  const { addToast } = useToast();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/products', { params: { search } });
      if (res.data.success) {
        setProducts(res.data.products);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleApproval = async (productId, status) => {
    try {
      const res = await api.put(`/admin/products/${productId}/approval`, {
        adminApproval: status,
      });
      if (res.data.success) {
        addToast(`Product ${status}`, 'success');
        fetchProducts();
      }
    } catch (err) {
      addToast('Failed to update product', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-forest-700">Moderation</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 font-display">
            Platform Product Moderation
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Supervise farm crop listings, stock numbers, and pricing standards
          </p>
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
                  <th className="p-4">Produce Item</th>
                  <th className="p-4">Farmer</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Price</th>
                  <th className="p-4">Stock</th>
                  <th className="p-4">Approval</th>
                  <th className="p-4 text-right">Moderation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {products.map((p) => (
                  <tr key={p._id} className="hover:bg-stone-50 transition">
                    <td className="p-4 font-bold text-stone-900">{p.name}</td>
                    <td className="p-4 text-stone-600">{p.farmer?.name}</td>
                    <td className="p-4 text-stone-500">{p.category?.name}</td>
                    <td className="p-4 font-bold text-forest-900">₹{p.price}/{p.unit}</td>
                    <td className="p-4">{p.availableQuantity} {p.unit}</td>
                    <td className="p-4">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          p.adminApproval === 'approved'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {p.adminApproval}
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-2">
                      {p.adminApproval === 'approved' ? (
                        <button
                          onClick={() => handleApproval(p._id, 'rejected')}
                          className="px-3 py-1 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-lg font-bold text-[11px]"
                        >
                          Reject / Delist
                        </button>
                      ) : (
                        <button
                          onClick={() => handleApproval(p._id, 'approved')}
                          className="px-3 py-1 bg-emerald-600 text-white hover:bg-emerald-700 rounded-lg font-bold text-[11px]"
                        >
                          Approve
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

export default AdminProducts;
