import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const { isAuthenticated, isConsumer } = useAuth();
  const { addToast } = useToast();
  const [wishlistIds, setWishlistIds] = useState([]);
  const [wishlistItems, setWishlistItems] = useState([]);

  const fetchWishlist = async () => {
    if (!isAuthenticated || !isConsumer) {
      setWishlistIds([]);
      setWishlistItems([]);
      return;
    }

    try {
      const res = await api.get('/wishlist');
      if (res.data.success) {
        setWishlistItems(res.data.products);
        setWishlistIds(res.data.products.map((p) => p._id));
      }
    } catch (err) {
      console.error('Failed to fetch wishlist', err);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, [isAuthenticated, isConsumer]);

  const toggleWishlist = async (productId) => {
    if (!isAuthenticated) {
      addToast('Please log in to save items to your wishlist', 'info');
      return;
    }
    if (!isConsumer) {
      addToast('Only consumers can save items to wishlist', 'info');
      return;
    }

    try {
      const res = await api.post(`/wishlist/${productId}`);
      if (res.data.success) {
        addToast(res.data.message, 'success');
        await fetchWishlist();
      }
    } catch (err) {
      addToast('Failed to update wishlist', 'error');
    }
  };

  const isItemWishlisted = (productId) => wishlistIds.includes(productId);

  return (
    <WishlistContext.Provider
      value={{
        wishlistItems,
        wishlistIds,
        toggleWishlist,
        isItemWishlisted,
        refreshWishlist: fetchWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => useContext(WishlistContext);
