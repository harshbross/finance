'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ShoppingCart,
  ArrowLeft,
  ShieldCheck,
  Truck,
  RefreshCw,
  Heart,
  Star,
  ChevronRight,
  Send,
  Trash2
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useCart } from '../../../context/CartContext';
import { useWishlist } from '../../../context/WishlistContext';
import { useToast } from '../../../context/ToastContext';
import { Skeleton } from '../../../components/Skeleton';
import styles from './ProductDetail.module.css';

interface Category {
  id: number;
  name: string;
}

interface ReviewUser {
  id: number;
  name: string;
}

interface Review {
  id: number;
  rating: number;
  comment: string;
  createdAt: string;
  user: ReviewUser;
}

interface Product {
  id: number;
  name: string;
  price: number;
  imageUrl: string;
  description: string;
  stock: number;
  categoryId: number;
  category: Category;
  averageRating?: number;
  reviewCount?: number;
  reviews?: Review[];
}

export default function ProductDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { apiUrl, user, token } = useAuth();
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { addToast } = useToast();

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);

  // Reviews state
  const [reviews, setReviews] = useState<Review[]>([]);
  const [ratingInput, setRatingInput] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [commentInput, setCommentInput] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  // Fetch product data
  const fetchProduct = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await fetch(`${apiUrl}/api/products/${id}`);
      if (res.ok) {
        const data = await res.json();
        setProduct(data);
        if (data.reviews) {
          setReviews(data.reviews);
        }

        // Fetch related products from same category
        if (data.categoryId) {
          const relRes = await fetch(
            `${apiUrl}/api/products?categoryId=${data.categoryId}&limit=4`
          );
          if (relRes.ok) {
            const relData = await relRes.json();
            setRelatedProducts(
              (relData.products || []).filter((p: Product) => p.id !== data.id)
            );
          }
        }
      } else {
        setProduct(null);
      }
    } catch (err) {
      console.error('Error fetching product details', err);
    } finally {
      setLoading(false);
    }
  }, [id, apiUrl]);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  // Handle add to cart
  const handleAddToCart = async () => {
    if (!product) return;
    setAdding(true);
    try {
      await addToCart(product.id, quantity);
    } catch (err) {
      console.error(err);
    } finally {
      setAdding(false);
    }
  };

  // Submit review
  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      addToast('Please log in to submit a review', 'warning');
      router.push('/login');
      return;
    }

    setSubmittingReview(true);
    try {
      const res = await fetch(`${apiUrl}/api/reviews/product/${id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          rating: ratingInput,
          comment: commentInput
        })
      });

      if (res.ok) {
        const newReview = await res.json();
        addToast('Review submitted successfully! ⭐', 'success');
        setCommentInput('');
        setRatingInput(5);
        // Update reviews list locally
        setReviews((prev) => {
          const filtered = prev.filter((r) => r.user?.id !== user?.id);
          return [newReview, ...filtered];
        });
      } else {
        const errData = await res.json();
        addToast(errData.message || 'Failed to submit review', 'error');
      }
    } catch (err) {
      console.error('Error submitting review', err);
      addToast('Error submitting review', 'error');
    } finally {
      setSubmittingReview(false);
    }
  };

  // Delete review
  const handleDeleteReview = async (reviewId: number) => {
    if (!token) return;
    try {
      const res = await fetch(`${apiUrl}/api/reviews/${reviewId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setReviews((prev) => prev.filter((r) => r.id !== reviewId));
        addToast('Review removed', 'info');
      }
    } catch (err) {
      console.error('Error deleting review', err);
    }
  };

  if (loading) {
    return (
      <div className="fade-in">
        <Skeleton width="220px" height="20px" className="mb-24" />
        <div className={`${styles.detailGrid} glass-panel`}>
          <Skeleton height="450px" borderRadius="var(--border-radius-md)" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <Skeleton width="100px" height="16px" />
            <Skeleton width="70%" height="36px" />
            <Skeleton width="120px" height="24px" />
            <Skeleton width="100%" height="80px" />
            <Skeleton width="200px" height="44px" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className={`${styles.notFound} glass-panel`}>
        <h2>Product Not Found</h2>
        <p>The product you are looking for does not exist or has been removed.</p>
        <Link href="/products" className="btn-primary" style={{ marginTop: '16px' }}>
          Back to Shop
        </Link>
      </div>
    );
  }

  const inWish = isInWishlist(product.id);
  const totalReviews = reviews.length;
  const avgRating = totalReviews > 0
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews)
    : 5.0;

  // Rating distribution
  const dist = [5, 4, 3, 2, 1].map((stars) => {
    const count = reviews.filter((r) => r.rating === stars).length;
    const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
    return { stars, count, percentage };
  });

  return (
    <div className="fade-in">
      {/* Breadcrumb Navigation */}
      <nav className={styles.breadcrumbRow} aria-label="Breadcrumb">
        <Link href="/" className={styles.breadcrumbLink}>
          Home
        </Link>
        <ChevronRight size={14} className={styles.breadcrumbSep} />
        <Link href="/products" className={styles.breadcrumbLink}>
          Products
        </Link>
        <ChevronRight size={14} className={styles.breadcrumbSep} />
        <Link
          href={`/products?category=${product.categoryId}`}
          className={styles.breadcrumbLink}
        >
          {product.category.name}
        </Link>
        <ChevronRight size={14} className={styles.breadcrumbSep} />
        <span className={styles.breadcrumbCurrent}>{product.name}</span>
      </nav>

      {/* Main Product Detail Grid */}
      <div className={`${styles.detailGrid} glass-panel`}>
        {/* Product Image Column */}
        <div className={styles.imageColumn}>
          <div className={styles.imageContainer}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={product.imageUrl} alt={product.name} className={styles.productImage} />
          </div>
        </div>

        {/* Product Info Column */}
        <div className={styles.infoColumn}>
          <span className={styles.categoryBadge}>{product.category.name}</span>
          <h1 className={styles.productName}>{product.name}</h1>

          {/* Rating summary in header */}
          <div className={styles.ratingRow}>
            <div className={styles.stars}>
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  size={16}
                  fill={s <= Math.round(avgRating) ? '#fbbf24' : 'none'}
                  color={s <= Math.round(avgRating) ? '#fbbf24' : '#4b5563'}
                />
              ))}
            </div>
            <span className={styles.ratingText}>
              <strong className={styles.ratingScore}>{avgRating.toFixed(1)}</strong> ({totalReviews}{' '}
              {totalReviews === 1 ? 'review' : 'reviews'})
            </span>
          </div>

          <div className={styles.priceArea}>
            <span className={styles.price}>${product.price.toFixed(2)}</span>
            {product.stock > 0 ? (
              <span className="badge badge-success">In Stock ({product.stock} left)</span>
            ) : (
              <span className="badge badge-error">Out of Stock</span>
            )}
          </div>

          <div className={styles.divider}></div>

          <div className={styles.descArea}>
            <h3>Description</h3>
            <p>{product.description || 'No description provided for this item.'}</p>
          </div>

          <div className={styles.divider}></div>

          {/* Add to Cart & Wishlist Controls */}
          {product.stock > 0 && (
            <div className={styles.actionArea}>
              <div className={styles.quantityPicker}>
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className={styles.qtyBtn}
                  disabled={quantity <= 1}
                >
                  -
                </button>
                <span className={styles.qtyValue}>{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                  className={styles.qtyBtn}
                  disabled={quantity >= product.stock}
                >
                  +
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                className="btn-primary"
                style={{ flex: 1, justifyContent: 'center' }}
                disabled={adding}
              >
                <ShoppingCart size={18} />
                {adding ? 'Adding...' : 'Add to Cart'}
              </button>

              <button
                onClick={() => toggleWishlist(product)}
                className={`${styles.wishlistBtn} ${inWish ? styles.wishlistBtnActive : ''}`}
                title={inWish ? 'Remove from wishlist' : 'Add to wishlist'}
              >
                <Heart
                  size={20}
                  fill={inWish ? '#ec4899' : 'none'}
                  color={inWish ? '#ec4899' : 'currentColor'}
                />
              </button>
            </div>
          )}

          {/* Trust badges */}
          <div className={styles.trustBadges}>
            <div className={styles.trustItem}>
              <Truck size={18} className={styles.trustIcon} />
              <span>Free Delivery</span>
            </div>
            <div className={styles.trustItem}>
              <ShieldCheck size={18} className={styles.trustIcon} />
              <span>2 Year Warranty</span>
            </div>
            <div className={styles.trustItem}>
              <RefreshCw size={18} className={styles.trustIcon} />
              <span>30 Day Returns</span>
            </div>
          </div>
        </div>
      </div>

      {/* Customer Reviews Section */}
      <section className={styles.reviewsSection}>
        <div className={styles.reviewsHeader}>
          <div>
            <h2 className="section-title">Customer Reviews</h2>
            <p className="text-secondary">Read authentic feedback from verified buyers</p>
          </div>
        </div>

        <div className={styles.reviewsGrid}>
          {/* Rating Breakdown Card */}
          <div className={`${styles.ratingSummaryCard} glass-panel`}>
            <div className={styles.bigRating}>{avgRating.toFixed(1)}</div>
            <div className={styles.summaryStars}>
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  size={20}
                  fill={s <= Math.round(avgRating) ? '#fbbf24' : 'none'}
                  color={s <= Math.round(avgRating) ? '#fbbf24' : '#4b5563'}
                />
              ))}
            </div>
            <span className={styles.totalReviewsText}>
              Based on {totalReviews} {totalReviews === 1 ? 'review' : 'reviews'}
            </span>

            <div className={styles.distributionList}>
              {dist.map((d) => (
                <div key={d.stars} className={styles.distRow}>
                  <span className={styles.distLabel}>
                    {d.stars} <Star size={12} fill="#fbbf24" color="#fbbf24" />
                  </span>
                  <div className={styles.distBar}>
                    <div className={styles.distFill} style={{ width: `${d.percentage}%` }} />
                  </div>
                  <span className={styles.distCount}>{d.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Review List & Submit Form */}
          <div className={styles.reviewsContent}>
            {/* Write a Review Card */}
            <div className={`${styles.writeReviewCard} glass-panel`}>
              <h3 className={styles.writeReviewTitle}>Share Your Thoughts</h3>

              <form onSubmit={handleReviewSubmit}>
                <div className={styles.starPicker}>
                  <span className={styles.starPickerLabel}>Your Rating:</span>
                  {[1, 2, 3, 4, 5].map((star) => {
                    const active = (hoverRating || ratingInput) >= star;
                    return (
                      <button
                        type="button"
                        key={star}
                        className={styles.starBtn}
                        onClick={() => setRatingInput(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                      >
                        <Star
                          size={22}
                          fill={active ? '#fbbf24' : 'none'}
                          color={active ? '#fbbf24' : '#4b5563'}
                        />
                      </button>
                    );
                  })}
                </div>

                <textarea
                  className={styles.reviewTextarea}
                  placeholder="Tell us what you liked or disliked about this product..."
                  value={commentInput}
                  onChange={(e) => setCommentInput(e.target.value)}
                  required
                />

                <button
                  type="submit"
                  className="btn-primary"
                  disabled={submittingReview}
                  style={{ justifyContent: 'center' }}
                >
                  <Send size={16} />
                  {submittingReview ? 'Submitting...' : 'Post Review'}
                </button>
              </form>
            </div>

            {/* Existing Reviews List */}
            <div className={styles.reviewsList}>
              {reviews.length === 0 ? (
                <div className={`${styles.noReviews} glass-card`}>
                  <p>No reviews yet. Be the first to review this product!</p>
                </div>
              ) : (
                reviews.map((rev) => {
                  const isAuthor = user && rev.user && user.id === rev.user.id;
                  const isAdmin = user && user.role === 'ADMIN';

                  return (
                    <div key={rev.id} className={`${styles.reviewItem} glass-card`}>
                      <div className={styles.reviewTop}>
                        <div className={styles.reviewUser}>
                          <div className={styles.userAvatar}>
                            {rev.user ? rev.user.name[0].toUpperCase() : 'U'}
                          </div>
                          <div>
                            <span className={styles.userName}>
                              {rev.user ? rev.user.name : 'Anonymous User'}
                            </span>
                            <div className={styles.reviewDate}>
                              {new Date(rev.createdAt).toLocaleDateString(undefined, {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })}
                            </div>
                          </div>
                        </div>

                        {(isAuthor || isAdmin) && (
                          <button
                            className={styles.deleteReviewBtn}
                            onClick={() => handleDeleteReview(rev.id)}
                            title="Delete review"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>

                      <div className={styles.reviewStars}>
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            size={14}
                            fill={s <= rev.rating ? '#fbbf24' : 'none'}
                            color={s <= rev.rating ? '#fbbf24' : '#4b5563'}
                          />
                        ))}
                      </div>

                      <p className={styles.reviewComment}>{rev.comment}</p>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Related Products Section */}
      {relatedProducts.length > 0 && (
        <section className={styles.relatedSection}>
          <h2 className={`section-title ${styles.relatedTitle}`}>Related Products</h2>
          <div className={styles.relatedGrid}>
            {relatedProducts.map((rel) => (
              <Link
                key={rel.id}
                href={`/products/${rel.id}`}
                className={`${styles.relatedCard} glass-card`}
              >
                <div className={styles.relatedImgWrap}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={rel.imageUrl} alt={rel.name} className={styles.relatedImg} />
                </div>
                <div className={styles.relatedInfo}>
                  <h4 className={styles.relatedName}>{rel.name}</h4>
                  <span className={styles.relatedPrice}>${rel.price.toFixed(2)}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
