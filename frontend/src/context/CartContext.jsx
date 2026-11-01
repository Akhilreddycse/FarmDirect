import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { isAuthenticated, isConsumer } = useAuth();
  const { addToast } = useToast();
  const [cart, setCart] = useState({
    items: [],
    subtotal: 0,
    deliveryFee: 0,
    totalAmount: 0,
    itemCount: 0,
  });
  const [loading, setLoading] = useState(false);

  const fetchCart = async () => {
    if (!isAuthenticated || !isConsumer) {
      setCart({ items: [], subtotal: 0, deliveryFee: 0, totalAmount: 0, itemCount: 0 });
      return;
    }

    try {
      setLoading(true);
      const res = await api.get('/cart');
      if (res.data.success) {
        setCart(res.data.cart);
      }
    } catch (err) {
      console.error('Failed to fetch cart', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [isAuthenticated, isConsumer]);

  const addToCart = async (productId, quantity = 1) => {
    if (!isAuthenticated) {
      addToast('Please log in to add items to your cart', 'info');
      return false;
    }
    if (!isConsumer) {
      addToast('Only consumer accounts can purchase products', 'info');
      return false;
    }

    try {
      const res = await api.post('/cart', { productId, quantity });
      if (res.data.success) {
        addToast(res.data.message || 'Added to cart', 'success');
        await fetchCart();
        return true;
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to add item to cart';
      addToast(msg, 'error');
      return false;
    }
  };

  const updateQuantity = async (itemId, quantity) => {
    try {
      const res = await api.put(`/cart/${itemId}`, { quantity });
      if (res.data.success) {
        await fetchCart();
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update quantity';
      addToast(msg, 'error');
    }
  };

  const removeFromCart = async (itemId) => {
    try {
      const res = await api.delete(`/cart/${itemId}`);
      if (res.data.success) {
        addToast('Item removed from cart', 'info');
        await fetchCart();
      }
    } catch (err) {
      addToast('Failed to remove item', 'error');
    }
  };

  const clearCart = async () => {
    try {
      await api.delete('/cart');
      await fetchCart();
    } catch (err) {
      console.error('Failed to clear cart', err);
    }
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        refreshCart: fetchCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
