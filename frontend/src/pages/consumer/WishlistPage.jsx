import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag } from 'lucide-react';
import { useWishlist } from '../../context/WishlistContext';
import ProductCard from '../../components/common/ProductCard';

const WishlistPage = () => {
  const { wishlistItems } = useWishlist();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-forest-700">Account</span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 font-display">
          My Saved Produce Wishlist
        </h1>
        <p className="text-xs text-stone-500 mt-0.5">
          Bookmark favorite crops for recurring seasonal harvests
        </p>
      </div>

      {wishlistItems.length === 0 ? (
        <div className="py-20 text-center space-y-4 bg-white rounded-3xl border border-stone-200">
          <Heart className="w-12 h-12 text-stone-300 mx-auto" />
          <h3 className="text-lg font-bold text-stone-900 font-display">Your wishlist is empty</h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            Browse our fresh agricultural marketplace and click the heart icon to save favorite farm items.
          </p>
          <Link
            to="/marketplace"
            className="px-6 py-2.5 bg-forest-700 text-white rounded-xl text-xs font-bold inline-block"
          >
            Explore Catalog
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {wishlistItems.map((prod) => (
            <ProductCard key={prod._id} product={prod} />
          ))}
        </div>
      )}
    </div>
  );
};

export default WishlistPage;
