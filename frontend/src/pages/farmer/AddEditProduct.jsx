import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  Package,
  Plus,
  Upload,
  ArrowLeft,
  Sparkles,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

const AddEditProduct = () => {
  const { id } = useParams();
  const isEditing = Boolean(id);
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEditing);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    price: '',
    originalPrice: '',
    unit: 'kg',
    availableQuantity: '',
    minOrderQuantity: 1,
    farmingMethod: 'Organic',
    isOrganic: true,
    qualityGrade: 'Grade A (Premium)',
    shelfLifeDays: 7,
    imageUrls: '',
  });

  useEffect(() => {
    const fetchMeta = async () => {
      try {
        const catRes = await api.get('/categories');
        if (catRes.data.success) {
          setCategories(catRes.data.categories);
          if (!isEditing && catRes.data.categories.length > 0) {
            setFormData((prev) => ({ ...prev, category: catRes.data.categories[0]._id }));
          }
        }

        if (isEditing) {
          const prodRes = await api.get(`/products/${id}`);
          if (prodRes.data.success) {
            const p = prodRes.data.product;
            setFormData({
              name: p.name,
              description: p.description,
              category: p.category?._id || p.category,
              price: p.price,
              originalPrice: p.originalPrice || p.price,
              unit: p.unit || 'kg',
              availableQuantity: p.availableQuantity,
              minOrderQuantity: p.minOrderQuantity || 1,
              farmingMethod: p.farmingMethod || 'Organic',
              isOrganic: p.isOrganic,
              qualityGrade: p.qualityGrade || 'Grade A (Premium)',
              shelfLifeDays: p.shelfLifeDays || 7,
              imageUrls: p.images ? p.images.join(', ') : '',
            });
          }
        }
      } catch (err) {
        console.error(err);
        addToast('Failed to load form details', 'error');
      } finally {
        setFetching(false);
      }
    };

    fetchMeta();
  }, [id, isEditing]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const parsedImages = formData.imageUrls
        ? formData.imageUrls.split(',').map((s) => s.trim()).filter(Boolean)
        : [];

      const payload = {
        ...formData,
        price: Number(formData.price),
        originalPrice: Number(formData.originalPrice || formData.price),
        availableQuantity: Number(formData.availableQuantity),
        minOrderQuantity: Number(formData.minOrderQuantity || 1),
        shelfLifeDays: Number(formData.shelfLifeDays || 7),
        images: parsedImages,
      };

      if (isEditing) {
        await api.put(`/products/${id}`, payload);
        addToast('Product updated successfully', 'success');
      } else {
        await api.post('/products', payload);
        addToast('Product listing published directly to marketplace!', 'success');
      }
      navigate('/farmer/products');
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to save product', 'error');
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
    <div className="max-w-4xl mx-auto space-y-6">
      <Link to="/farmer/products" className="inline-flex items-center gap-2 text-xs font-bold text-stone-500 hover:text-forest-700">
        <ArrowLeft className="w-4 h-4" /> Back to My Products
      </Link>

      <div className="bg-white rounded-3xl border border-stone-200/80 shadow-sm p-6 sm:p-8 space-y-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-forest-700">
            {isEditing ? 'Update Produce' : 'New Listing'}
          </span>
          <h1 className="text-2xl font-extrabold text-stone-900 font-display mt-0.5">
            {isEditing ? 'Edit Agricultural Product' : 'Create Farm Produce Listing'}
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Ensure clear details, harvest accuracy, and true organic claims for consumer trust.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 text-xs">
          {/* 1. Name & Category */}
          <div className="space-y-4">
            <div>
              <label className="font-bold text-stone-700 block mb-1">Product / Crop Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Organic Red Cherry Tomatoes (Fresh Polyhouse Harvest)"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 text-xs focus:outline-none focus:border-forest-600"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-bold text-stone-700 block mb-1">Category</label>
                <select
                  required
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 text-xs focus:outline-none"
                >
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Quality Grade</label>
                <select
                  value={formData.qualityGrade}
                  onChange={(e) => setFormData({ ...formData, qualityGrade: e.target.value })}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 text-xs focus:outline-none"
                >
                  <option value="Grade A (Premium)">Grade A (Premium)</option>
                  <option value="Grade B (Standard)">Grade B (Standard)</option>
                  <option value="Certified Organic Export">Certified Organic Export</option>
                  <option value="Farm Fresh Choice">Farm Fresh Choice</option>
                </select>
              </div>
            </div>
          </div>

          {/* 2. Description */}
          <div>
            <label className="font-bold text-stone-700 block mb-1">Description & Taste Profile</label>
            <textarea
              rows="4"
              required
              placeholder="Describe farming techniques, natural sweeteners/fertilizers used, harvest frequency, nutrition benefits..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 text-xs focus:outline-none focus:border-forest-600"
            />
          </div>

          {/* 3. Pricing, Units, Inventory */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <label className="font-bold text-stone-700 block mb-1">Selling Price (₹)</label>
              <input
                type="number"
                required
                min={1}
                placeholder="e.g. 80"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 text-xs focus:outline-none"
              />
            </div>
            <div>
              <label className="font-bold text-stone-700 block mb-1">Original Price (₹)</label>
              <input
                type="number"
                placeholder="Optional strike price"
                value={formData.originalPrice}
                onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 text-xs focus:outline-none"
              />
            </div>
            <div>
              <label className="font-bold text-stone-700 block mb-1">Measurement Unit</label>
              <select
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 text-xs focus:outline-none"
              >
                <option value="kg">kg (Kilogram)</option>
                <option value="g">g (Gram)</option>
                <option value="quintal">quintal</option>
                <option value="liter">liter</option>
                <option value="bunch">bunch</option>
                <option value="piece">piece</option>
                <option value="dozen">dozen</option>
                <option value="box">box</option>
              </select>
            </div>
            <div>
              <label className="font-bold text-stone-700 block mb-1">Available Quantity</label>
              <input
                type="number"
                required
                min={0}
                placeholder="Total in stock"
                value={formData.availableQuantity}
                onChange={(e) => setFormData({ ...formData, availableQuantity: e.target.value })}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 text-xs focus:outline-none"
              />
            </div>
          </div>

          {/* 4. Organic & Method */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div>
              <label className="font-bold text-stone-700 block mb-1">Farming Method</label>
              <select
                value={formData.farmingMethod}
                onChange={(e) => setFormData({ ...formData, farmingMethod: e.target.value })}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 text-xs focus:outline-none"
              >
                <option value="Organic">Organic</option>
                <option value="Natural / Vedic">Natural / Vedic</option>
                <option value="Zero Budget Natural Farming (ZBNF)">ZBNF</option>
                <option value="Hydroponic">Hydroponic</option>
                <option value="Regenerative">Regenerative</option>
                <option value="Traditional">Traditional</option>
              </select>
            </div>
            <div>
              <label className="font-bold text-stone-700 block mb-1">Shelf Life (Days)</label>
              <input
                type="number"
                min={1}
                value={formData.shelfLifeDays}
                onChange={(e) => setFormData({ ...formData, shelfLifeDays: e.target.value })}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 text-xs focus:outline-none"
              />
            </div>
            <div className="flex items-center gap-3 pt-5">
              <input
                type="checkbox"
                id="isOrganic"
                checked={formData.isOrganic}
                onChange={(e) => setFormData({ ...formData, isOrganic: e.target.checked })}
                className="w-4 h-4 text-forest-600 rounded border-stone-300 focus:ring-forest-500 cursor-pointer"
              />
              <label htmlFor="isOrganic" className="font-bold text-stone-800 cursor-pointer">
                100% Certified Organic
              </label>
            </div>
          </div>

          {/* 5. Image URLs */}
          <div>
            <label className="font-bold text-stone-700 block mb-1">
              Image URLs (Comma separated image links)
            </label>
            <input
              type="text"
              placeholder="https://images.unsplash.com/..., https://..."
              value={formData.imageUrls}
              onChange={(e) => setFormData({ ...formData, imageUrls: e.target.value })}
              className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 text-xs focus:outline-none"
            />
            <span className="text-[11px] text-stone-400 mt-1 block">
              In production, you can upload via camera or CDN image links.
            </span>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-stone-100">
            <Link
              to="/farmer/products"
              className="px-5 py-3 text-stone-600 hover:text-stone-900 font-bold"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-forest-700 hover:bg-forest-800 text-white rounded-xl font-bold transition shadow-md shadow-forest-900/10 flex items-center gap-2"
            >
              {loading ? 'Saving...' : isEditing ? 'Update Listing' : 'Publish Product to Marketplace'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEditProduct;
