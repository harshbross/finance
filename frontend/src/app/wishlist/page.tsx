'use client';

import React from 'react';
import Link from 'next/link';
import { Heart, ShoppingCart, Trash2, ArrowRight } from 'lucide-react';
import { useWishlist } from '../../context/WishlistContext';
import { useCart } from '../../context/CartContext';
import { formatPrice } from '../../utils/format';
import styles from './Wishlist.module.css';

export default function WishlistPage() {
  const { wishlist, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();

  const handleMoveToCart = async (product: any) => {
    await addToCart(product.id, 1);
    await removeFromWishlist(product.id);
  };

  return (
    <div className="fade-in">
      <div className={styles.header}>
        <div>
          <h1 className="section-title">My Wishlist</h1>
          <p className={styles.subtitle}>
            {wishlist.length} {wishlist.length === 1 ? 'item' : 'items'} saved for later
          </p>
        </div>
      </div>

      {wishlist.length === 0 ? (
        <div className={`${styles.emptyState} glass-card`}>
          <div className={styles.emptyIconWrap}>
            <Heart size={48} className={styles.emptyIcon} />
          </div>
          <h3>Your wishlist is empty</h3>
          <p>Save items you love by tapping the heart icon on any product card.</p>
          <Link href="/products" className="btn-primary" style={{ marginTop: '20px' }}>
            Explore Products
            <ArrowRight size={18} />
          </Link>
        </div>
      ) : (
        <div className={styles.grid}>
          {wishlist.map((product) => (
            <div key={product.id} className={`${styles.card} glass-card`}>
              <div className={styles.imageWrap}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={product.imageUrl} alt={product.name} className={styles.image} />
                <button
                  className={styles.removeBtn}
                  onClick={() => removeFromWishlist(product.id)}
                  title="Remove from wishlist"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <div className={styles.content}>
                {product.category && (
                  <span className={styles.categoryBadge}>{product.category.name}</span>
                )}
                <Link href={`/products/${product.id}`} className={styles.title}>
                  {product.name}
                </Link>

                <div className={styles.priceRow}>
                  <span className={styles.price}>{formatPrice(product.price)}</span>
                  {product.stock > 0 ? (
                    <span className="badge badge-success">In Stock</span>
                  ) : (
                    <span className="badge badge-error">Out of Stock</span>
                  )}
                </div>

                <div className={styles.actions}>
                  <button
                    className="btn-primary w-full"
                    onClick={() => handleMoveToCart(product)}
                    disabled={product.stock <= 0}
                    style={{ justifyContent: 'center' }}
                  >
                    <ShoppingCart size={16} />
                    Move to Cart
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
