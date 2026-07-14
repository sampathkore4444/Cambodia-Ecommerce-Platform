import React, { createContext, useState, useEffect, useCallback, useContext } from 'react';
import { cartAPI } from '../api';
import { getStorageItem, setStorageItem } from '../utils/helpers';
import { AuthContext } from './AuthContext';
import toast from 'react-hot-toast';

export const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { isAuthenticated } = useContext(AuthContext);
  const [items, setItems] = useState(() => getStorageItem('cart') || []);
  const [isLoading, setIsLoading] = useState(false);

  const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => {
    if (isAuthenticated) {
      cartAPI.getCart()
        .then(res => {
          const data = res.data.data;
          setItems(data?.items || []);
        })
        .catch(() => {})
        .finally(() => setIsLoading(false));
    } else {
      setItems(getStorageItem('cart') || []);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) setStorageItem('cart', items);
  }, [items, isAuthenticated]);

  const addItem = useCallback(async (product, quantity = 1, variant = null) => {
    if (isAuthenticated) {
      setIsLoading(true);
      try {
        await cartAPI.addToCart({ product_id: product.id, quantity, variant_id: variant?.id });
        const res = await cartAPI.getCart();
        const data = res.data.data;
        setItems(data?.items || []);
        toast.success('បានបន្ថែមទៅរទេះ');
      } catch (err) {
        toast.error(err.message || 'បញ្ចូលទៅរទេះមិនបាន');
      } finally {
        setIsLoading(false);
      }
    } else {
      setItems(prev => {
        const key = `${product.id}-${variant?.id || 'default'}`;
        const existing = prev.find(i => `${i.productId}-${i.variantId || 'default'}` === key);
        if (existing) return prev.map(i => i === existing ? { ...i, quantity: i.quantity + quantity } : i);
        return [...prev, {
          id: `local-${Date.now()}`,
          productId: product.id,
          name: product.name,
          price: product.price,
          image: product.images?.[0],
          quantity,
          variant,
          variantId: variant?.id,
          stock: product.stock || 99,
        }];
      });
      toast.success('បានបន្ថែមទៅរទេះ');
    }
  }, [isAuthenticated]);

  const updateQuantity = useCallback(async (itemId, quantity) => {
    if (quantity < 1) return;
    if (isAuthenticated) {
      setIsLoading(true);
      try {
        await cartAPI.updateCartItem(itemId, quantity);
        const res = await cartAPI.getCart();
        const data = res.data.data;
        setItems(data?.items || []);
      } catch (err) {
        toast.error(err.message || 'មិនអាចអាប់ដេតបរិមាណបាន');
      } finally {
        setIsLoading(false);
      }
    } else {
      setItems(prev => prev.map(i => (i.id || i.productId) === itemId ? { ...i, quantity } : i));
    }
  }, [isAuthenticated]);

  const removeItem = useCallback(async (itemId) => {
    if (isAuthenticated) {
      setIsLoading(true);
      try {
        await cartAPI.removeFromCart(itemId);
        setItems(prev => prev.filter(i => i.id !== itemId));
      } catch (err) {
        toast.error(err.message || 'មិនអាចលុបបាន');
      } finally {
        setIsLoading(false);
      }
    } else {
      setItems(prev => prev.filter(i => i.id !== itemId && i.productId !== itemId));
    }
  }, [isAuthenticated]);

  const clearCart = useCallback(async () => {
    if (isAuthenticated) {
      try { await cartAPI.clearCart(); } catch {}
    }
    setItems([]);
  }, [isAuthenticated]);

  return (
    <CartContext.Provider value={{ items, total, itemCount, isLoading, addItem, updateQuantity, removeItem, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}
