'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { X, ShoppingCart, Heart, Star, ExternalLink, Truck, ShieldCheck } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import styles from './QuickViewModal.module.css';

export interface QuickViewProduct {
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

interface QuickViewModalProps {
  product: QuickViewProduct | null;
  onClose: () => void;
}

export const QuickViewModal: React.FC<QuickViewModalProps> = ({ product, onClose }) => {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    setQuantity(1);
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (product) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [product, onClose]);

  if (!product) return null;

  const inWish = isInWishlist(product.id);

  const handleAddToCart = async () => {
    setAdding(true);
    try {
      await addToCart(product.id, quantity);
    } catch (e) {
      console.error(e);
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={`${styles.modal} glass-panel`} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={onClose} aria-label="Close modal">
          <X size={20} />
        </button>

        <div className={styles.grid}>
          {/* Product Image */}
          <div className={styles.imageContainer}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={product.imageUrl} alt={product.name} className={styles.productImage} />
            {product.stock <= 0 && <span className={styles.outOfStockBadge}>Out of Stock</span>}
          </div>

          {/* Product Details */}
          <div className={styles.details}>
            {product.category && (
              <span className={styles.categoryBadge}>{product.category.name}</span>
            )}
            <h2 className={styles.productName}>{product.name}</h2>

            {/* Rating */}
            <div className={styles.ratingRow}>
              <div className="star-rating">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={16}
                    className="star-icon"
                    fill={star <= Math.round(product.averageRating || 5) ? '#fbbf24' : 'none'}
                    color={star <= Math.round(product.averageRating || 5) ? '#fbbf24' : '#4b5563'}
                  />
                ))}
              </div>
              <span className={styles.ratingText}>
                {product.averageRating ? product.averageRating.toFixed(1) : '5.0'} (
                {product.reviewCount || 0} reviews)
              </span>
            </div>

            {/* Price */}
            <div className={styles.priceRow}>
              <span className={styles.price}>${product.price.toFixed(2)}</span>
              {product.stock > 0 ? (
                <span className="badge badge-success">In Stock ({product.stock} available)</span>
              ) : (
                <span className="badge badge-error">Out of Stock</span>
              )}
            </div>

            <p className={styles.description}>{product.description}</p>

            {/* Quantity and Actions */}
            {product.stock > 0 && (
              <div className={styles.actionArea}>
                <div className={styles.qtyPicker}>
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                    className={styles.qtyBtn}
                  >
                    -
                  </button>
                  <span className={styles.qtyValue}>{quantity}</span>
                  <button
                    onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                    disabled={quantity >= product.stock}
                    className={styles.qtyBtn}
                  >
                    +
                  </button>
                </div>

                <button
                  onClick={handleAddToCart}
                  disabled={adding}
                  className="btn-primary"
                  style={{ flex: 1, justifyContent: 'center' }}
                >
                  <ShoppingCart size={18} />
                  {adding ? 'Adding...' : 'Add to Cart'}
                </button>

                <button
                  onClick={() => toggleWishlist(product)}
                  className={`wishlist-heart-btn ${inWish ? 'active' : ''}`}
                  title={inWish ? 'Remove from wishlist' : 'Add to wishlist'}
                  style={{ width: '46px', height: '46px' }}
                >
                  <Heart
                    size={20}
                    fill={inWish ? '#ec4899' : 'none'}
                    color={inWish ? '#ec4899' : 'currentColor'}
                  />
                </button>
              </div>
            )}

            <div className={styles.divider}></div>

            {/* Trust highlights */}
            <div className={styles.trustHighlights}>
              <div className={styles.trustPoint}>
                <Truck size={16} /> Free Delivery On All Orders
              </div>
              <div className={styles.trustPoint}>
                <ShieldCheck size={16} /> Genuine & Verified Quality
              </div>
            </div>

            {/* Full Details Link */}
            <Link
              href={`/products/${product.id}`}
              className={styles.fullDetailLink}
              onClick={onClose}
            >
              <span>View full product page & customer reviews</span>
              <ExternalLink size={14} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickViewModal;
