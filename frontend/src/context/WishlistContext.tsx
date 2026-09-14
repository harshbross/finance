'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

export interface WishlistProduct {
  id: number;
  name: string;
  price: number;
  imageUrl: string;
  description: string;
  stock: number;
  category?: {
    id: number;
    name: string;
  };
  averageRating?: number;
  reviewCount?: number;
}

interface WishlistContextType {
  wishlist: WishlistProduct[];
  wishlistIds: Set<number>;
  loading: boolean;
  isInWishlist: (productId: number) => boolean;
  toggleWishlist: (product: WishlistProduct) => Promise<void>;
  removeFromWishlist: (productId: number) => Promise<void>;
  itemCount: number;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token, apiUrl } = useAuth();
  const { addToast } = useToast();
  const [wishlist, setWishlist] = useState<WishlistProduct[]>([]);
  const [loading, setLoading] = useState(false);

  const wishlistIds = new Set(wishlist.map(item => item.id));

  // Load wishlist either from backend (if logged in) or localStorage
  const loadWishlist = useCallback(async () => {
    if (token) {
      setLoading(true);
      try {
        const res = await fetch(`${apiUrl}/api/wishlist`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          const products = data.map((item: any) => item.product);
          setWishlist(products);
        } else {
          // fallback to localStorage if backend table isn't migrated yet
          const local = localStorage.getItem('aether_wishlist');
          if (local) setWishlist(JSON.parse(local));
        }
      } catch (err) {
        console.error('Failed to load wishlist from server, using local storage', err);
        const local = localStorage.getItem('aether_wishlist');
        if (local) setWishlist(JSON.parse(local));
      } finally {
        setLoading(false);
      }
    } else {
      // LocalStorage fallback for guests
      try {
        const local = localStorage.getItem('aether_wishlist');
        if (local) {
          setWishlist(JSON.parse(local));
        }
      } catch (e) {
        console.error('Error reading local wishlist', e);
      }
    }
  }, [token, apiUrl]);

  useEffect(() => {
    loadWishlist();
  }, [loadWishlist]);

  const isInWishlist = useCallback((productId: number) => {
    return wishlistIds.has(productId);
  }, [wishlistIds]);

  const toggleWishlist = async (product: WishlistProduct) => {
    const isCurrentlyIn = isInWishlist(product.id);

    if (isCurrentlyIn) {
      // Remove from wishlist
      const updated = wishlist.filter(item => item.id !== product.id);
      setWishlist(updated);
      localStorage.setItem('aether_wishlist', JSON.stringify(updated));

      if (token) {
        try {
          await fetch(`${apiUrl}/api/wishlist/${product.id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` }
          });
        } catch (e) {
          console.error(e);
        }
      }
      addToast(`Removed "${product.name}" from wishlist`, 'info');
    } else {
      // Add to wishlist
      const updated = [product, ...wishlist];
      setWishlist(updated);
      localStorage.setItem('aether_wishlist', JSON.stringify(updated));

      if (token) {
        try {
          await fetch(`${apiUrl}/api/wishlist/${product.id}`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` }
          });
        } catch (e) {
          console.error(e);
        }
      }
      addToast(`Added "${product.name}" to wishlist ❤️`, 'success');
    }
  };

  const removeFromWishlist = async (productId: number) => {
    const product = wishlist.find(item => item.id === productId);
    const updated = wishlist.filter(item => item.id !== productId);
    setWishlist(updated);
    localStorage.setItem('aether_wishlist', JSON.stringify(updated));

    if (token) {
      try {
        await fetch(`${apiUrl}/api/wishlist/${productId}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        });
      } catch (e) {
        console.error(e);
      }
    }

    if (product) {
      addToast(`Removed "${product.name}" from wishlist`, 'info');
    }
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        wishlistIds,
        loading,
        isInWishlist,
        toggleWishlist,
        removeFromWishlist,
        itemCount: wishlist.length
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};
