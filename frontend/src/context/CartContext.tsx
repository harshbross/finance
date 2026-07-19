'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';

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

  const fetchCart = useCallback(async () => {
    if (!token) {
      setCartItems([]);
      return;
    }

    setLoadingCart(true);
    try {
      const response = await fetch(`${apiUrl}/api/cart`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setCartItems(data.items || []);
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
    } finally {
      setLoadingCart(false);
    }
  }, [token, apiUrl]);

  // Load cart when user logs in or token changes
  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addToCart = async (productId: number, quantity: number = 1) => {
    if (!token) {
      alert('Please log in to add items to your cart.');
      window.location.href = '/login';
      return;
    }

    try {
      const response = await fetch(`${apiUrl}/api/cart/items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ productId, quantity })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to add item to cart');
      }

      // Re-fetch cart to update the state correctly
      await fetchCart();
    } catch (error: any) {
      alert(error.message || 'Failed to add item');
      throw error;
    }
  };

  const updateQuantity = async (cartItemId: number, quantity: number) => {
    if (!token) return;

    try {
      const response = await fetch(`${apiUrl}/api/cart/items/${cartItemId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ quantity })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to update quantity');
      }

      await fetchCart();
    } catch (error: any) {
      alert(error.message || 'Failed to update quantity');
      throw error;
    }
  };

  const removeFromCart = async (cartItemId: number) => {
    if (!token) return;

    try {
      const response = await fetch(`${apiUrl}/api/cart/items/${cartItemId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to remove item');
      }

      await fetchCart();
    } catch (error: any) {
      alert(error.message || 'Failed to remove item');
      throw error;
    }
  };

  const clearCartLocal = () => {
    setCartItems([]);
  };

  const subtotal = cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider value={{
      cartItems,
      loadingCart,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCartLocal,
      fetchCart,
      subtotal,
      itemCount
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
