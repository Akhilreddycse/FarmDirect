import React, { useState, useEffect } from 'react';
import { FolderTree, Plus, Trash2, Edit } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

const AdminCategories = () => {
  const { addToast } = useToast();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');

  const fetchCats = async () => {
    try {
      setLoading(true);
      const res = await api.get('/categories');
      if (res.data.success) {
        setCategories(res.data.categories);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCats();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/categories', { name, description, image });
      if (res.data.success) {
        addToast('Category created', 'success');
        setName('');
        setDescription('');
        setImage('');
        setShowForm(false);
        fetchCats();
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to create category', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    try {
      const res = await api.delete(`/categories/${id}`);
      if (res.data.success) {
        addToast('Category removed', 'info');
        fetchCats();
      }
    } catch (err) {
      addToast('Failed to delete category', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-forest-700">Catalog Structure</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 font-display">
            Produce Categories Management
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Organize agricultural product classifications across the marketplace
          </p>
        </div>

        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2.5 bg-forest-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm"
        >
          <Plus className="w-4 h-4" /> Add Category
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm space-y-4 max-w-xl text-xs">
          <h3 className="text-sm font-bold text-stone-900">Create New Produce Category</h3>
          <div>
            <label className="font-bold text-stone-700 block mb-1">Category Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Exotic Herbs & Microgreens"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 focus:outline-none focus:border-forest-600"
            />
          </div>
          <div>
            <label className="font-bold text-stone-700 block mb-1">Description</label>
            <textarea
              rows="2"
              placeholder="Brief summary of crops in this category"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 focus:outline-none"
            />
          </div>
          <div>
            <label className="font-bold text-stone-700 block mb-1">Image URL (Optional)</label>
            <input
              type="text"
              placeholder="https://images.unsplash.com/..."
              value={image}
              onChange={(e) => setImage(e.target.value)}
              className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 focus:outline-none"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 text-stone-500 font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-forest-700 text-white rounded-xl font-bold"
            >
              Save Category
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((cat) => (
          <div
            key={cat._id}
            className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-forest-50 overflow-hidden shrink-0 flex items-center justify-center">
                {cat.image ? (
                  <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
                ) : (
                  <FolderTree className="w-6 h-6 text-forest-700" />
                )}
              </div>
              <div>
                <h4 className="font-bold text-stone-900 text-xs">{cat.name}</h4>
                <p className="text-[11px] text-stone-400 mt-0.5">{cat.itemCount || 0} active listings</p>
              </div>
            </div>

            <button
              onClick={() => handleDelete(cat._id)}
              className="text-stone-300 hover:text-rose-600 transition p-1"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminCategories;
