'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';
import { MOCK_PRODUCTS } from '../data/mockProducts';

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  imageUrl: string;
  categoryId: number;
}

export interface CartItem {
  id: number;
  cartId: number;
  productId: number;
  quantity: number;
  product: Product;
}

interface CartContextType {
  cartItems: CartItem[];
  loadingCart: boolean;
  addToCart: (productId: number, quantity?: number) => Promise<void>;
  updateQuantity: (cartItemId: number, quantity: number) => Promise<void>;
  removeFromCart: (cartItemId: number) => Promise<void>;
  clearCartLocal: () => void;
  fetchCart: () => Promise<void>;
  subtotal: number;
  itemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token, apiUrl } = useAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loadingCart, setLoadingCart] = useState(false);
  const [toastQueue, setToastQueue] = useState<{message: string; type: 'success' | 'error' | 'info' | 'warning'}[]>([]);

  // Load cart from server or guest localStorage
  const fetchCart = useCallback(async () => {
    if (token && apiUrl) {
      setLoadingCart(true);
      try {
        const response = await fetch(`${apiUrl}/api/cart`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          setCartItems(data.items || []);
          return;
        }
      } catch (error) {
        console.error('Error fetching server cart, falling back to local cart:', error);
      } finally {
        setLoadingCart(false);
      }
    }

    // Guest / local fallback
    try {
      const saved = localStorage.getItem('aether_cart');
      if (saved) {
        setCartItems(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Failed to load local cart', e);
    }
  }, [token, apiUrl]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const saveLocalCart = (items: CartItem[]) => {
    setCartItems(items);
    localStorage.setItem('aether_cart', JSON.stringify(items));
  };

  const addToCart = async (productId: number, quantity: number = 1) => {
    if (token && apiUrl) {
      try {
        const response = await fetch(`${apiUrl}/api/cart/items`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ productId, quantity })
        });

        if (response.ok) {
          await fetchCart();
          setToastQueue(prev => [...prev, { message: 'Added to cart!', type: 'success' }]);
          return;
        }
      } catch {
        // Fall back to local storage
      }
    }

    // Local cart handling
    let product = MOCK_PRODUCTS.find(p => p.id === productId);
    if (!product) {
      try {
        const res = await fetch(`/api/products/${productId}`);
        if (res.ok) product = await res.json();
      } catch {
        // use default placeholder
      }
    }

    const currentItems = [...cartItems];
    const existingIndex = currentItems.findIndex(i => i.productId === productId);

    if (existingIndex > -1) {
      currentItems[existingIndex].quantity += quantity;
    } else {
      currentItems.push({
        id: Date.now(),
        cartId: 1,
        productId,
        quantity,
        product: product || {
          id: productId,
          name: 'Selected Product',
          description: '',
          price: 99.99,
          stock: 20,
          imageUrl: '',
          categoryId: 1
        }
      });
    }

    saveLocalCart(currentItems);
    setToastQueue(prev => [...prev, { message: 'Added to cart!', type: 'success' }]);
  };

  const updateQuantity = async (cartItemId: number, quantity: number) => {
    if (token && apiUrl) {
      try {
        const response = await fetch(`${apiUrl}/api/cart/items/${cartItemId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ quantity })
        });

        if (response.ok) {
          await fetchCart();
          return;
        }
      } catch {
        // Fall through to local update
      }
    }

    const updated = cartItems.map(item =>
      item.id === cartItemId ? { ...item, quantity: Math.max(1, quantity) } : item
    );
    saveLocalCart(updated);
  };

  const removeFromCart = async (cartItemId: number) => {
    if (token && apiUrl) {
      try {
        const response = await fetch(`${apiUrl}/api/cart/items/${cartItemId}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.ok) {
          await fetchCart();
          setToastQueue(prev => [...prev, { message: 'Item removed from cart', type: 'info' }]);
          return;
        }
      } catch {
        // Fall through to local update
      }
    }

    const updated = cartItems.filter(item => item.id !== cartItemId);
    saveLocalCart(updated);
    setToastQueue(prev => [...prev, { message: 'Item removed from cart', type: 'info' }]);
  };

  const clearCartLocal = () => {
    setCartItems([]);
    localStorage.removeItem('aether_cart');
  };

  const subtotal = cartItems.reduce((acc, item) => {
    const price = item.product ? item.product.price : 0;
    return acc + price * item.quantity;
  }, 0);

  const itemCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        loadingCart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCartLocal,
        fetchCart,
        subtotal,
        itemCount,
        toastQueue,
        clearToastQueue: () => setToastQueue([])
      } as any}
    >
      {children}
      <CartToastBridge toastQueue={toastQueue} onClear={() => setToastQueue([])} />
    </CartContext.Provider>
  );
};

// Bridge component to consume useToast inside ToastProvider
const CartToastBridge: React.FC<{
  toastQueue: { message: string; type: 'success' | 'error' | 'info' | 'warning' }[];
  onClear: () => void;
}> = ({ toastQueue, onClear }) => {
  const { addToast } = useToast();

  useEffect(() => {
    if (toastQueue.length > 0) {
      toastQueue.forEach(item => {
        addToast(item.message, item.type);
      });
      onClear();
    }
  }, [toastQueue, addToast, onClear]);

  return null;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
