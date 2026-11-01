import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, MapPin, Sparkles, Sprout } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import StarRating from './StarRating';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const { toggleWishlist, isItemWishlisted } = useWishlist();

  if (!product) return null;

  const wishlisted = isItemWishlisted(product._id);
  const isOutOfStock = product.status === 'out_of_stock' || product.availableQuantity <= 0;
  const discount =
    product.originalPrice && product.originalPrice > product.price
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : null;

  const imageSrc =
    product.images && product.images.length > 0
      ? product.images[0]
      : 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80';

  const farmName = product.farmerProfile?.farmName || 'Verified Farm';
  const locationText = product.location?.district
    ? `${product.location.district}, ${product.location.state || ''}`
    : 'Farm Direct';

  return (
    <div className="group relative bg-white rounded-2xl border border-stone-200/80 hover:border-forest-400 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden">
      {/* Image & Badges */}
      <div className="relative aspect-[4/3] bg-stone-100 overflow-hidden">
        <Link to={`/products/${product._id}`}>
          <img
            src={imageSrc}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
            loading="lazy"
          />
        </Link>

        {/* Wishlist Button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            toggleWishlist(product._id);
          }}
          className={`absolute top-3 right-3 p-2 rounded-full shadow-md backdrop-blur-md transition ${
            wishlisted
              ? 'bg-rose-50 text-rose-600'
              : 'bg-white/80 text-stone-600 hover:text-rose-600 hover:bg-white'
          }`}
          title="Add to wishlist"
        >
          <Heart className={`w-4 h-4 ${wishlisted ? 'fill-rose-600' : ''}`} />
        </button>

        {/* Badges Top Left */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 items-start">
          {product.isOrganic && (
            <span className="badge-organic backdrop-blur-md shadow-sm">
              <Sparkles className="w-3 h-3 text-emerald-600" />
              100% Organic
            </span>
          )}
          {discount && (
            <span className="bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
              {discount}% OFF
            </span>
          )}
        </div>

        {/* Out of Stock Overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center">
            <span className="bg-rose-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Farmer & Location Info */}
          <div className="flex items-center justify-between text-[11px] text-stone-500 mb-1.5">
            <Link
              to={`/farmers/${product.farmer?._id || product.farmer}`}
              className="hover:text-forest-700 font-medium flex items-center gap-1 truncate max-w-[140px]"
              title={farmName}
            >
              <Sprout className="w-3 h-3 text-forest-600 shrink-0" />
              {farmName}
            </Link>
            <span className="flex items-center gap-0.5 shrink-0 text-stone-400">
              <MapPin className="w-3 h-3 text-stone-400" />
              {locationText}
            </span>
          </div>

          {/* Product Name */}
          <Link to={`/products/${product._id}`}>
            <h3 className="font-semibold text-stone-900 text-sm line-clamp-2 group-hover:text-forest-700 transition leading-snug">
              {product.name}
            </h3>
          </Link>

          {/* Rating */}
          <div className="mt-2">
            <StarRating
              rating={product.ratingAverage || 5.0}
              count={product.ratingCount || 0}
            />
          </div>
        </div>

        {/* Pricing & Add to Cart Action */}
        <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between gap-2">
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-bold text-forest-900 font-display">
                ₹{product.price}
              </span>
              <span className="text-xs text-stone-500">/{product.unit}</span>
            </div>
            {product.originalPrice > product.price && (
              <span className="text-[11px] text-stone-400 line-through">
                ₹{product.originalPrice}
              </span>
            )}
          </div>

          <button
            onClick={() => addToCart(product._id, 1)}
            disabled={isOutOfStock}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
              isOutOfStock
                ? 'bg-stone-100 text-stone-400 cursor-not-allowed'
                : 'bg-forest-700 hover:bg-forest-800 text-white shadow-sm shadow-forest-900/10 active:scale-95'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            Add
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
