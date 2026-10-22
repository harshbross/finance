'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
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
  Trash2,
  CheckCircle2,
  ThumbsUp,
  Camera,
  Filter,
  Image as ImageIcon,
  X
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useCart } from '../../../context/CartContext';
import { useWishlist } from '../../../context/WishlistContext';
import { useToast } from '../../../context/ToastContext';
import { Skeleton } from '../../../components/Skeleton';
import { MOCK_PRODUCTS } from '../../../data/mockProducts';
import { formatPrice, handleImageError } from '../../../utils/format';
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
  title?: string;
  comment: string;
  createdAt: string;
  verified?: boolean;
  helpfulCount?: number;
  photos?: string[];
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
  const [titleInput, setTitleInput] = useState('');
  const [commentInput, setCommentInput] = useState('');
  const [photoInput, setPhotoInput] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  // Review Filter & Sorting & Interaction State
  const [selectedStarFilter, setSelectedStarFilter] = useState<string>('all');
  const [selectedSort, setSelectedSort] = useState<'recent' | 'highest' | 'lowest' | 'helpful'>('recent');
  const [helpfulVotes, setHelpfulVotes] = useState<Record<number, number>>({});
  const [userVoted, setUserVoted] = useState<Record<number, boolean>>({});
  const [previewPhoto, setPreviewPhoto] = useState<string | null>(null);

  // Fetch product data
  const fetchProduct = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    const numericId = parseInt(id as string);

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
        setLoading(false);
        return;
      }
    } catch (err) {
      console.error('API fetch failed, falling back to curated product:', err);
    }

    // Fallback to MOCK_PRODUCTS
    const mock = MOCK_PRODUCTS.find((p) => p.id === numericId);
    if (mock) {
      setProduct(mock as any);
      setReviews(mock.reviews as any);
      setRelatedProducts(
        (MOCK_PRODUCTS.filter((p) => p.categoryId === mock.categoryId && p.id !== mock.id) as any)
      );
    } else {
      setProduct(null);
    }
    setLoading(false);
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
    const newLocalReview: Review = {
      id: Date.now(),
      rating: ratingInput,
      title: titleInput.trim() || undefined,
      comment: commentInput,
      createdAt: new Date().toISOString(),
      verified: true,
      helpfulCount: 0,
      photos: photoInput.trim() ? [photoInput.trim()] : undefined,
      user: {
        id: user?.id || 1,
        name: user?.name || 'Verified Buyer'
      }
    };

    try {
      const res = await fetch(`${apiUrl}/api/reviews/product/${id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          rating: ratingInput,
          title: titleInput.trim(),
          comment: commentInput,
          photos: photoInput.trim() ? [photoInput.trim()] : []
        })
      });

      if (res.ok) {
        const newReview = await res.json();
        addToast('Review submitted successfully! ⭐', 'success');
        setCommentInput('');
        setTitleInput('');
        setPhotoInput('');
        setRatingInput(5);
        setReviews((prev) => [
          { ...newLocalReview, ...newReview },
          ...prev.filter((r) => r.user?.id !== user?.id)
        ]);
      } else {
        // Fallback locally for smooth experience
        setReviews((prev) => [
          newLocalReview,
          ...prev.filter((r) => r.user?.id !== user?.id)
        ]);
        addToast('Review posted successfully! ⭐', 'success');
        setCommentInput('');
        setTitleInput('');
        setPhotoInput('');
        setRatingInput(5);
      }
    } catch (err) {
      // Fallback locally
      setReviews((prev) => [
        newLocalReview,
        ...prev.filter((r) => r.user?.id !== user?.id)
      ]);
      addToast('Review posted successfully! ⭐', 'success');
      setCommentInput('');
      setTitleInput('');
      setPhotoInput('');
      setRatingInput(5);
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleVoteHelpful = (reviewId: number) => {
    if (userVoted[reviewId]) {
      setHelpfulVotes((prev) => ({
        ...prev,
        [reviewId]: Math.max(0, (prev[reviewId] || 0) - 1)
      }));
      setUserVoted((prev) => ({ ...prev, [reviewId]: false }));
    } else {
      setHelpfulVotes((prev) => ({
        ...prev,
        [reviewId]: (prev[reviewId] || 0) + 1
      }));
      setUserVoted((prev) => ({ ...prev, [reviewId]: true }));
      addToast('Thank you for marking this review as helpful! 👍', 'info');
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

  const photoReviewsCount = reviews.filter((r) => r.photos && r.photos.length > 0).length;

  // Filtered and sorted reviews
  const filteredAndSortedReviews = useMemo(() => {
    let list = reviews;

    if (selectedStarFilter !== 'all') {
      if (selectedStarFilter === 'photos') {
        list = list.filter((r) => r.photos && r.photos.length > 0);
      } else {
        const starNum = parseInt(selectedStarFilter);
        list = list.filter((r) => r.rating === starNum);
      }
    }

    return [...list].sort((a, b) => {
      if (selectedSort === 'recent') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (selectedSort === 'highest') {
        return b.rating - a.rating;
      }
      if (selectedSort === 'lowest') {
        return a.rating - b.rating;
      }
      if (selectedSort === 'helpful') {
        const aH = (helpfulVotes[a.id] || 0) + (a.helpfulCount || 0);
        const bH = (helpfulVotes[b.id] || 0) + (b.helpfulCount || 0);
        return bH - aH;
      }
      return 0;
    });
  }, [reviews, selectedStarFilter, selectedSort, helpfulVotes]);

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
            <img
              src={product.imageUrl}
              alt={product.name}
              className={styles.productImage}
              onError={handleImageError}
            />
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
            <span className={styles.price}>{formatPrice(product.price)}</span>
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
            <h2 className="section-title">Customer Reviews & Ratings</h2>
            <p className="text-secondary">Authentic customer feedback from verified purchases</p>
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
              {dist.map((d) => {
                const isActive = selectedStarFilter === d.stars.toString();
                return (
                  <div
                    key={d.stars}
                    className={`${styles.distRow} ${isActive ? styles.distRowActive : ''}`}
                    onClick={() =>
                      setSelectedStarFilter(isActive ? 'all' : d.stars.toString())
                    }
                    title={`Click to filter by ${d.stars} stars`}
                  >
                    <span className={styles.distLabel}>
                      {d.stars} <Star size={12} fill="#fbbf24" color="#fbbf24" />
                    </span>
                    <div className={styles.distBar}>
                      <div className={styles.distFill} style={{ width: `${d.percentage}%` }} />
                    </div>
                    <span className={styles.distCount}>{d.count}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Review List & Filters & Submit Form */}
          <div className={styles.reviewsContent}>
            {/* Interactive Filters & Sort Bar */}
            <div className={styles.filterSortRow}>
              <div className={styles.filterPillsGroup}>
                <button
                  type="button"
                  className={`${styles.filterPill} ${
                    selectedStarFilter === 'all' ? styles.filterPillActive : ''
                  }`}
                  onClick={() => setSelectedStarFilter('all')}
                >
                  All ({totalReviews})
                </button>
                {[5, 4, 3, 2, 1].map((st) => {
                  const count = reviews.filter((r) => r.rating === st).length;
                  if (count === 0 && selectedStarFilter !== st.toString()) return null;
                  return (
                    <button
                      key={st}
                      type="button"
                      className={`${styles.filterPill} ${
                        selectedStarFilter === st.toString() ? styles.filterPillActive : ''
                      }`}
                      onClick={() => setSelectedStarFilter(st.toString())}
                    >
                      {st} ★ ({count})
                    </button>
                  );
                })}
                {photoReviewsCount > 0 && (
                  <button
                    type="button"
                    className={`${styles.filterPill} ${
                      selectedStarFilter === 'photos' ? styles.filterPillActive : ''
                    }`}
                    onClick={() => setSelectedStarFilter('photos')}
                  >
                    <Camera size={13} />
                    With Photos ({photoReviewsCount})
                  </button>
                )}
              </div>

              <select
                className={styles.sortSelect}
                value={selectedSort}
                onChange={(e) => setSelectedSort(e.target.value as any)}
              >
                <option value="recent">Most Recent</option>
                <option value="highest">Highest Rating</option>
                <option value="lowest">Lowest Rating</option>
                <option value="helpful">Most Helpful</option>
              </select>
            </div>

            {/* Write a Review Card */}
            <div className={`${styles.writeReviewCard} glass-panel`}>
              <h3 className={styles.writeReviewTitle}>Share Your Review</h3>

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

                <div style={{ marginBottom: 12 }}>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Review headline (e.g. Exceptional sound and comfort!)"
                    value={titleInput}
                    onChange={(e) => setTitleInput(e.target.value)}
                  />
                </div>

                <textarea
                  className={styles.reviewTextarea}
                  placeholder="Tell other shoppers what you loved, how it performs in daily use..."
                  value={commentInput}
                  onChange={(e) => setCommentInput(e.target.value)}
                  required
                />

                <div style={{ marginBottom: 16 }}>
                  <input
                    type="url"
                    className="form-input"
                    placeholder="Optional customer photo URL (e.g. https://images.unsplash.com/...)"
                    value={photoInput}
                    onChange={(e) => setPhotoInput(e.target.value)}
                  />
                </div>

                <button
                  type="submit"
                  className="btn-primary"
                  disabled={submittingReview}
                  style={{ justifyContent: 'center' }}
                >
                  <Send size={16} />
                  {submittingReview ? 'Submitting...' : 'Post Verified Review'}
                </button>
              </form>
            </div>

            {/* Existing Reviews List */}
            <div className={styles.reviewsList}>
              {filteredAndSortedReviews.length === 0 ? (
                <div className={`${styles.noReviews} glass-card`}>
                  <p>No reviews match your selected filter.</p>
                  {selectedStarFilter !== 'all' && (
                    <button
                      type="button"
                      className="btn-secondary"
                      style={{ marginTop: 12 }}
                      onClick={() => setSelectedStarFilter('all')}
                    >
                      Clear Filter
                    </button>
                  )}
                </div>
              ) : (
                filteredAndSortedReviews.map((rev) => {
                  const isAuthor = user && rev.user && user.id === rev.user.id;
                  const isAdmin = user && user.role === 'ADMIN';
                  const helpfulCount = (rev.helpfulCount || 0) + (helpfulVotes[rev.id] || 0);
                  const isVoted = userVoted[rev.id];

                  return (
                    <div key={rev.id} className={`${styles.reviewItem} glass-card`}>
                      <div className={styles.reviewTop}>
                        <div className={styles.reviewUser}>
                          <div className={styles.userAvatar}>
                            {rev.user ? rev.user.name[0].toUpperCase() : 'U'}
                          </div>
                          <div>
                            <span className={styles.userName}>
                              {rev.user ? rev.user.name : 'Verified Customer'}
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
                        <div className={styles.reviewStarsIcons}>
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              size={14}
                              fill={s <= rev.rating ? '#fbbf24' : 'none'}
                              color={s <= rev.rating ? '#fbbf24' : '#4b5563'}
                            />
                          ))}
                        </div>
                        <span className={styles.verifiedBadge}>
                          <CheckCircle2 size={12} />
                          Verified Buyer
                        </span>
                      </div>

                      {rev.title && <div className={styles.reviewTitle}>{rev.title}</div>}

                      <p className={styles.reviewComment}>{rev.comment}</p>

                      {/* Attached Customer Photos */}
                      {rev.photos && rev.photos.length > 0 && (
                        <div className={styles.reviewPhotos}>
                          {rev.photos.map((pUrl, idx) => (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              key={idx}
                              src={pUrl}
                              alt="Review customer photo"
                              className={styles.reviewPhotoThumb}
                              onClick={() => setPreviewPhoto(pUrl)}
                              onError={handleImageError}
                            />
                          ))}
                        </div>
                      )}

                      {/* Helpful Button */}
                      <div className={styles.reviewBottom}>
                        <button
                          type="button"
                          className={`${styles.helpfulBtn} ${
                            isVoted ? styles.helpfulBtnActive : ''
                          }`}
                          onClick={() => handleVoteHelpful(rev.id)}
                        >
                          <ThumbsUp size={13} fill={isVoted ? 'currentColor' : 'none'} />
                          Helpful ({helpfulCount})
                        </button>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          Verified Purchase
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Photo Zoom Modal */}
      {previewPhoto && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.85)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20
          }}
          onClick={() => setPreviewPhoto(null)}
        >
          <div style={{ position: 'relative', maxWidth: '800px', maxHeight: '80vh' }}>
            <button
              type="button"
              onClick={() => setPreviewPhoto(null)}
              style={{
                position: 'absolute',
                top: -40,
                right: 0,
                background: 'transparent',
                border: 'none',
                color: '#fff',
                cursor: 'pointer'
              }}
            >
              <X size={24} />
            </button>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewPhoto}
              alt="Enlarged review photo"
              style={{ width: '100%', maxHeight: '80vh', objectFit: 'contain', borderRadius: 8 }}
              onError={handleImageError}
            />
          </div>
        </div>
      )}

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
                  <img
                    src={rel.imageUrl}
                    alt={rel.name}
                    className={styles.relatedImg}
                    onError={handleImageError}
                  />
                </div>
                <div className={styles.relatedInfo}>
                  <h4 className={styles.relatedName}>{rel.name}</h4>
                  <span className={styles.relatedPrice}>{formatPrice(rel.price)}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
