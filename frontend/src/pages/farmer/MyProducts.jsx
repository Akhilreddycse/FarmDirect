import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  PlusCircle,
  Edit,
  Trash2,
  Sparkles,
  Eye,
  CheckCircle2,
  XCircle,
  Search,
} from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

const MyProducts = () => {
  const { addToast } = useToast();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchMyProducts = async () => {
    try {
      setLoading(true);
      const res = await api.get('/products/my-products');
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
    fetchMyProducts();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to remove this product listing?')) return;
    try {
      const res = await api.delete(`/products/${id}`);
      if (res.data.success) {
        addToast('Product removed', 'info');
        fetchMyProducts();
      }
    } catch (err) {
      addToast('Failed to delete product', 'error');
    }
  };

  const handleToggleStatus = async (product) => {
    const newStatus = product.status === 'active' ? 'inactive' : 'active';
    try {
      const res = await api.put(`/products/${product._id}`, { status: newStatus });
      if (res.data.success) {
        addToast(`Product marked as ${newStatus}`, 'success');
        fetchMyProducts();
      }
    } catch (err) {
      addToast('Failed to update status', 'error');
    }
  };

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-forest-700">Catalog</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 font-display">
            My Farm Produce Listings
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Manage your crops, inventory quantities, prices, and organic certifications
          </p>
        </div>

        <Link
          to="/farmer/products/new"
          className="px-5 py-2.5 bg-forest-700 hover:bg-forest-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
        >
          <PlusCircle className="w-4 h-4" />
          Add New Product
        </Link>
      </div>

      {/* Search Filter */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-xs flex items-center gap-4">
        <div className="relative flex-1">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search among your crops..."
            className="w-full bg-stone-50 text-xs pl-10 pr-4 py-2 rounded-xl border border-stone-200 focus:outline-none focus:border-forest-600"
          />
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
        </div>
        <span className="text-xs font-bold text-stone-500 shrink-0">
          {filtered.length} of {products.length} Products
        </span>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-3xl border border-stone-200/80 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 flex justify-center">
            <div className="w-10 h-10 border-4 border-forest-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <Package className="w-12 h-12 text-stone-300 mx-auto" />
            <h3 className="text-base font-bold text-stone-900">No products found</h3>
            <p className="text-xs text-stone-500">Add your first agricultural harvest listing to start receiving direct orders.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 font-bold uppercase">
                <tr>
                  <th className="p-4">Crop / Product</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Price</th>
                  <th className="p-4">Available Inventory</th>
                  <th className="p-4">Method</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filtered.map((prod) => (
                  <tr key={prod._id} className="hover:bg-stone-50/60 transition">
                    <td className="p-4 flex items-center gap-3">
                      <img
                        src={
                          prod.images && prod.images.length > 0
                            ? prod.images[0]
                            : 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=150&q=80'
                        }
                        alt={prod.name}
                        className="w-12 h-12 rounded-xl object-cover border border-stone-200 shrink-0"
                      />
                      <div>
                        <Link to={`/products/${prod._id}`} className="font-bold text-stone-900 hover:text-forest-700">
                          {prod.name}
                        </Link>
                        {prod.isOrganic && (
                          <span className="badge-organic text-[10px] py-0 mt-0.5 block w-fit">
                            Organic
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-stone-600 font-medium">{prod.category?.name}</td>
                    <td className="p-4 font-bold text-forest-900 font-display text-sm">
                      ₹{prod.price} <span className="text-[11px] font-normal text-stone-400">/{prod.unit}</span>
                    </td>
                    <td className="p-4">
                      <span className={`font-bold ${prod.availableQuantity <= 5 ? 'text-amber-600' : 'text-stone-800'}`}>
                        {prod.availableQuantity} {prod.unit}
                      </span>
                    </td>
                    <td className="p-4 text-stone-600">{prod.farmingMethod}</td>
                    <td className="p-4">
                      <button
                        onClick={() => handleToggleStatus(prod)}
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase cursor-pointer transition ${
                          prod.status === 'active'
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            : prod.status === 'out_of_stock'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-stone-100 text-stone-500 hover:bg-stone-200'
                        }`}
                      >
                        {prod.status}
                      </button>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/farmer/products/edit/${prod._id}`}
                          className="p-1.5 bg-stone-100 text-stone-700 hover:bg-forest-50 hover:text-forest-800 rounded-lg transition"
                          title="Edit Product"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </Link>
                        <button
                          onClick={() => handleDelete(prod._id)}
                          className="p-1.5 bg-stone-100 text-stone-700 hover:bg-rose-50 hover:text-rose-600 rounded-lg transition"
                          title="Delete Listing"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
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

export default MyProducts;
