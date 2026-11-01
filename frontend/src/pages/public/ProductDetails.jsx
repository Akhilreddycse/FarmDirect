import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  Heart,
  Sparkles,
  MapPin,
  Calendar,
  Award,
  CheckCircle2,
  ShieldCheck,
  Truck,
  ArrowLeft,
  Plus,
  Minus,
  UserCheck,
} from 'lucide-react';
import api from '../../services/api';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useToast } from '../../context/ToastContext';
import StarRating from '../../components/common/StarRating';
import ProductCard from '../../components/common/ProductCard';
import FollowFarmButton from '../../components/common/FollowFarmButton';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { toggleWishlist, isItemWishlisted } = useWishlist();
  const { addToast } = useToast();

  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [selectedImage, setSelectedImage] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/products/${id}`);
        if (res.data.success) {
          setProduct(res.data.product);
          setReviews(res.data.reviews || []);
          setRelatedProducts(res.data.relatedProducts || []);
          const defaultImg =
            res.data.product.images && res.data.product.images.length > 0
              ? res.data.product.images[0]
              : 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80';
          setSelectedImage(defaultImg);
          setQuantity(res.data.product.minOrderQuantity || 1);
        }
      } catch (err) {
        console.error(err);
        addToast('Failed to load product details', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
    window.scrollTo(0, 0);
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 flex justify-center">
        <div className="w-12 h-12 border-4 border-forest-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-stone-900">Product not found</h2>
        <Link to="/marketplace" className="px-6 py-2.5 bg-forest-700 text-white rounded-xl text-xs font-bold inline-block">
          Return to Marketplace
        </Link>
      </div>
    );
  }

  const isOutOfStock = product.status === 'out_of_stock' || product.availableQuantity <= 0;
  const wishlisted = isItemWishlisted(product._id);

  const handleBuyNow = async () => {
    const added = await addToCart(product._id, quantity);
    if (added) {
      navigate('/cart');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-xs font-bold text-stone-500 hover:text-forest-700 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Catalog
      </button>

      {/* Main Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left: Image Gallery */}
        <div className="lg:col-span-6 space-y-4">
          <div className="aspect-[4/3] rounded-3xl overflow-hidden bg-stone-100 border border-stone-200 shadow-md relative">
            <img
              src={selectedImage}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            {product.isOrganic && (
              <span className="absolute top-4 left-4 badge-organic shadow-md">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                100% Certified Organic
              </span>
            )}
            {isOutOfStock && (
              <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center">
                <span className="bg-rose-600 text-white text-sm font-bold px-4 py-1.5 rounded-full uppercase tracking-wider">
                  Out of Stock
                </span>
              </div>
            )}
          </div>

          {/* Thumbnails */}
          {product.images && product.images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(img)}
                  className={`w-20 h-20 rounded-2xl overflow-hidden border-2 transition shrink-0 ${
                    selectedImage === img ? 'border-forest-600 ring-2 ring-forest-600/30' : 'border-stone-200 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Product Details & Purchase Actions */}
        <div className="lg:col-span-6 space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-forest-700 bg-forest-50 px-2.5 py-0.5 rounded-md">
                {product.category?.name || 'Produce'}
              </span>
              <span className="text-xs font-medium text-stone-500">•</span>
              <span className="text-xs font-semibold text-stone-600">{product.qualityGrade}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 font-display leading-snug">
              {product.name}
            </h1>

            {/* Rating Summary */}
            <div className="flex items-center gap-3 mt-3">
              <StarRating rating={product.ratingAverage || 5.0} count={product.ratingCount || 0} size="md" />
              <span className="text-xs text-stone-400">|</span>
              <span className="text-xs font-medium text-stone-500">
                {product.viewsCount || 1} Community Views
              </span>
            </div>
          </div>

          {/* Pricing Box */}
          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 flex items-baseline gap-3">
            <span className="text-3xl font-extrabold text-forest-900 font-display">
              ₹{product.price}
            </span>
            <span className="text-sm font-medium text-stone-500">per {product.unit}</span>
            {product.originalPrice > product.price && (
              <span className="text-sm text-stone-400 line-through">
                ₹{product.originalPrice}
              </span>
            )}
            <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full ml-auto">
              Direct Farmer Price
            </span>
          </div>

          {/* Description */}
          <p className="text-stone-600 text-sm leading-relaxed whitespace-pre-line">
            {product.description}
          </p>

          {/* Farm Details Metadata Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="p-3 bg-white rounded-xl border border-stone-200 text-xs space-y-0.5">
              <span className="text-stone-400 font-medium">Farming Method</span>
              <p className="font-bold text-stone-800">{product.farmingMethod}</p>
            </div>
            <div className="p-3 bg-white rounded-xl border border-stone-200 text-xs space-y-0.5">
              <span className="text-stone-400 font-medium">Available Stock</span>
              <p className="font-bold text-stone-800">
                {product.availableQuantity} {product.unit}
              </p>
            </div>
            <div className="p-3 bg-white rounded-xl border border-stone-200 text-xs space-y-0.5">
              <span className="text-stone-400 font-medium">Shelf Life</span>
              <p className="font-bold text-stone-800">{product.shelfLifeDays || 7} Days</p>
            </div>
          </div>

          {/* Quantity Selector & Order Buttons */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-4">
              <span className="text-xs font-bold text-stone-700">Quantity ({product.unit}):</span>
              <div className="flex items-center border border-stone-300 rounded-xl bg-white shadow-xs overflow-hidden">
                <button
                  onClick={() => setQuantity((q) => Math.max(product.minOrderQuantity || 1, q - 1))}
                  disabled={quantity <= (product.minOrderQuantity || 1) || isOutOfStock}
                  className="p-2.5 hover:bg-stone-100 disabled:opacity-40"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="px-4 text-xs font-bold text-stone-900">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => Math.min(product.availableQuantity, q + 1))}
                  disabled={quantity >= product.availableQuantity || isOutOfStock}
                  className="p-2.5 hover:bg-stone-100 disabled:opacity-40"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
              <span className="text-xs text-stone-400">
                (Min order: {product.minOrderQuantity || 1} {product.unit})
              </span>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => addToCart(product._id, quantity)}
                disabled={isOutOfStock}
                className={`flex-1 py-3.5 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 transition ${
                  isOutOfStock
                    ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
                    : 'bg-forest-700 hover:bg-forest-800 text-white shadow-md shadow-forest-900/10 active:scale-98'
                }`}
              >
                <ShoppingBag className="w-4 h-4" />
                Add to Cart
              </button>
              <button
                onClick={handleBuyNow}
                disabled={isOutOfStock}
                className={`flex-1 py-3.5 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 transition ${
                  isOutOfStock
                    ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
                    : 'bg-emerald-500 hover:bg-emerald-400 text-forest-950 shadow-md shadow-emerald-500/20 active:scale-98'
                }`}
              >
                Buy Now Direct
              </button>
              <button
                onClick={() => toggleWishlist(product._id)}
                className={`p-3.5 rounded-2xl border transition ${
                  wishlisted
                    ? 'bg-rose-50 border-rose-200 text-rose-600'
                    : 'bg-white border-stone-300 text-stone-600 hover:bg-stone-50'
                }`}
              >
                <Heart className={`w-5 h-5 ${wishlisted ? 'fill-rose-600' : ''}`} />
              </button>
            </div>
          </div>

          {/* Farmer / Farm Card */}
          <div className="bg-emerald-50/50 border border-emerald-200/80 rounded-3xl p-5 flex items-start gap-4">
            <img
              src={
                product.farmer?.avatar ||
                'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80'
              }
              alt={product.farmerProfile?.farmName || 'Farm'}
              className="w-14 h-14 rounded-2xl object-cover border-2 border-forest-600 shrink-0"
            />
            <div className="flex-1 space-y-1">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h4 className="font-bold text-stone-900 text-sm">
                  {product.farmerProfile?.farmName || 'Verified Family Farm'}
                </h4>
                <div className="flex items-center gap-2">
                  <FollowFarmButton
                    farmerId={product.farmer?._id || product.farmer}
                    farmName={product.farmerProfile?.farmName || 'this farm'}
                    className="py-1 px-3 text-[11px]"
                  />
                  <Link
                    to={`/farmers/${product.farmer?._id || product.farmer}`}
                    className="text-xs font-bold text-forest-700 hover:text-forest-900 flex items-center gap-1"
                  >
                    View Farm Store →
                  </Link>
                </div>
              </div>
              <p className="text-xs font-semibold text-emerald-800 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Verified Direct Producer
              </p>
              <p className="text-xs text-stone-500 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-stone-400" />
                {product.location?.village ? `${product.location.village}, ` : ''}
                {product.location?.district}, {product.location?.state}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Customer Reviews Section */}
      <section className="border-t border-stone-200 pt-10 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-stone-900 font-display">
              Verified Buyer Reviews ({reviews.length})
            </h3>
            <p className="text-xs text-stone-500">
              Only consumers who purchased and received this crop can submit verified reviews.
            </p>
          </div>
        </div>

        {reviews.length === 0 ? (
          <div className="p-8 bg-stone-50 rounded-2xl border border-stone-200 text-center text-xs text-stone-500">
            No reviews yet for this harvest. Be among the first to order and review!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reviews.map((rev) => (
              <div
                key={rev._id}
                className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <img
                      src={
                        rev.consumer?.avatar ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(
                          rev.consumer?.name || 'User'
                        )}&background=224e2d&color=fff`
                      }
                      alt={rev.consumer?.name}
                      className="w-7 h-7 rounded-full object-cover"
                    />
                    <span className="text-xs font-bold text-stone-800">{rev.consumer?.name}</span>
                  </div>
                  <span className="text-[10px] text-stone-400">
                    {new Date(rev.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <StarRating rating={rev.rating} count={0} showCount={false} />
                <p className="text-xs text-stone-600 leading-relaxed">{rev.comment}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Related Produce */}
      {relatedProducts.length > 0 && (
        <section className="border-t border-stone-200 pt-10 space-y-6">
          <h3 className="text-xl font-bold text-stone-900 font-display">Related Farm Produce</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default ProductDetails;
