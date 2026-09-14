'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import {
  ArrowRight,
  ShoppingBag,
  ShoppingCart,
  Sparkles,
  Zap,
  Lock,
  Layers,
  Star,
  Truck,
  ShieldCheck,
  RefreshCw,
  Heart,
  Eye
} from 'lucide-react';
import QuickViewModal, { QuickViewProduct } from '../components/QuickViewModal';
import { MOCK_PRODUCTS, MOCK_CATEGORIES } from '../data/mockProducts';
import styles from './Home.module.css';

interface Category {
  id: number;
  name: string;
}

interface Product {
  id: number;
  name: string;
  price: number;
  imageUrl: string;
  description: string;
  stock: number;
  category?: Category;
  averageRating?: number;
  reviewCount?: number;
}

const categoryIcons: Record<string, React.ReactNode> = {
  'Electronics': <Zap size={24} />,
  'Clothing': <Layers size={24} />,
  'Books': <Layers size={24} />,
  'Gaming': <Sparkles size={24} />,
  'Accessories': <Star size={24} />,
};

export default function HomePage() {
  const { apiUrl } = useAuth();
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [quickViewProduct, setQuickViewProduct] = useState<QuickViewProduct | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [prodRes, catRes] = await Promise.all([
          fetch(`${apiUrl}/api/products?limit=6`),
          fetch(`${apiUrl}/api/categories`),
        ]);

        if (prodRes.ok) {
          const prodData = await prodRes.json();
          if (prodData.products && prodData.products.length > 0) {
            setFeaturedProducts(prodData.products);
          } else {
            setFeaturedProducts(MOCK_PRODUCTS.slice(0, 6));
          }
        } else {
          setFeaturedProducts(MOCK_PRODUCTS.slice(0, 6));
        }

        if (catRes.ok) {
          const catData = await catRes.json();
          if (catData && catData.length > 0) {
            setCategories(catData);
          } else {
            setCategories(MOCK_CATEGORIES);
          }
        } else {
          setCategories(MOCK_CATEGORIES);
        }
      } catch (err) {
        console.error('Failed to fetch homepage data, using curated catalog', err);
        setFeaturedProducts(MOCK_PRODUCTS.slice(0, 6));
        setCategories(MOCK_CATEGORIES);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [apiUrl]);

  return (
    <div className="fade-in">
      {/* Hero Section */}
      <section className={styles.hero}>
        {/* Decorative orbs */}
        <div className={`orb ${styles.orb1}`} />
        <div className={`orb ${styles.orb2}`} />
        <div className={`orb ${styles.orb3}`} />

        <div className={styles.heroContent}>
          <div className={styles.badgeWrap}>
            <span className="badge badge-secondary">
              <Sparkles size={12} style={{ marginRight: '4px' }} />
              New Collection Available
            </span>
          </div>
          <h1 className={styles.title}>
            Discover Premium
            <br />
            <span className="animated-gradient-text">Tech & Lifestyle</span>
          </h1>
          <p className={styles.subtitle}>
            Curated collection of high-performance gear and modern essentials.
            Free delivery on all orders. Experience the future of shopping.
          </p>
          <div className={styles.heroActions}>
            <Link href="/products" className="btn-primary">
              Shop Now
              <ArrowRight size={18} />
            </Link>
            <Link href="/products" className="btn-secondary">
              View Catalog
            </Link>
          </div>

          {/* Stats */}
          <div className={styles.statsRow}>
            <div className={styles.stat}>
              <span className={styles.statValue}>500+</span>
              <span className={styles.statLabel}>Products</span>
            </div>
            <div className={styles.statDivider} />
            <div className={styles.stat}>
              <span className={styles.statValue}>10K+</span>
              <span className={styles.statLabel}>Customers</span>
            </div>
            <div className={styles.statDivider} />
            <div className={styles.stat}>
              <span className={styles.statValue}>4.9</span>
              <span className={styles.statLabel}>Rating</span>
            </div>
          </div>
        </div>
      </section>

      {/* Category Browsing */}
      {categories.length > 0 && (
        <section className={styles.categoriesSection}>
          <h2 className="section-title text-center">Shop by Category</h2>
          <div className={styles.categoriesGrid}>
            {categories.map((cat, i) => (
              <Link
                key={cat.id}
                href={`/products?category=${cat.id}`}
                className={`${styles.categoryCard} glass-card fade-in-up stagger-${i + 1}`}
              >
                <div className={styles.categoryIcon}>
                  {categoryIcons[cat.name] || <ShoppingBag size={24} />}
                </div>
                <span className={styles.categoryName}>{cat.name}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Features / Trust Section */}
      <section className={styles.featuresSection}>
        <div className={styles.featuresGrid}>
          <div className={`glass-card ${styles.featureCard}`}>
            <div className={styles.featureIconWrap}>
              <Truck size={28} />
            </div>
            <h3 className={styles.featureTitle}>Free Delivery</h3>
            <p className={styles.featureText}>Free shipping on all orders. No minimum purchase required.</p>
          </div>
          <div className={`glass-card ${styles.featureCard}`}>
            <div className={styles.featureIconWrap}>
              <ShieldCheck size={28} />
            </div>
            <h3 className={styles.featureTitle}>Secure Payment</h3>
            <p className={styles.featureText}>End-to-end encrypted transactions. Your data stays safe.</p>
          </div>
          <div className={`glass-card ${styles.featureCard}`}>
            <div className={styles.featureIconWrap}>
              <RefreshCw size={28} />
            </div>
            <h3 className={styles.featureTitle}>30-Day Returns</h3>
            <p className={styles.featureText}>Not satisfied? Return any item within 30 days hassle-free.</p>
          </div>
          <div className={`glass-card ${styles.featureCard}`}>
            <div className={styles.featureIconWrap}>
              <Lock size={28} />
            </div>
            <h3 className={styles.featureTitle}>Warranty</h3>
            <p className={styles.featureText}>All products come with manufacturer warranty protection.</p>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className={styles.featuredSection}>
        <div className={styles.sectionHeader}>
          <div>
            <h2 className="section-title">Trending Now</h2>
            <p className={styles.sectionSubtitle}>Our most popular picks this season</p>
          </div>
          <Link href="/products" className={styles.viewAll}>
            View All Products
            <ArrowRight size={16} />
          </Link>
        </div>

        {loading ? (
          <div className={styles.productsGrid}>
            {[1, 2, 3].map((i) => (
              <div key={i} className={`glass-card ${styles.skeletonCard}`}>
                <div className={styles.skeletonImage} />
                <div style={{ padding: '16px' }}>
                  <div className={styles.skeletonLine} style={{ width: '60%' }} />
                  <div className={styles.skeletonLine} style={{ width: '80%', marginTop: '10px' }} />
                  <div className={styles.skeletonLine} style={{ width: '40%', marginTop: '16px' }} />
                </div>
              </div>
            ))}
          </div>
        ) : featuredProducts.length > 0 ? (
          <div className={styles.productsGrid}>
            {featuredProducts.map((product, i) => {
              const inWish = isInWishlist(product.id);
              const rating = product.averageRating || 5.0;

              return (
                <div key={product.id} className={`glass-card ${styles.productCard} fade-in-up stagger-${i + 1}`}>
                  <div className={styles.imageContainer}>
                    <div className={styles.cardTopActions}>
                      {product.stock <= 0 ? (
                        <span className={styles.outOfStockBadge}>Out of Stock</span>
                      ) : (
                        <span />
                      )}
                      <button
                        className={`${styles.cardWishlistBtn} ${inWish ? styles.cardWishlistBtnActive : ''}`}
                        onClick={() => toggleWishlist(product)}
                        title={inWish ? 'Remove from wishlist' : 'Add to wishlist'}
                      >
                        <Heart
                          size={18}
                          fill={inWish ? '#ec4899' : 'none'}
                          color={inWish ? '#ec4899' : 'currentColor'}
                        />
                      </button>
                    </div>

                    <Link href={`/products/${product.id}`} style={{ display: 'contents' }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={product.imageUrl} alt={product.name} className={styles.productImage} />
                    </Link>

                    <button
                      className={styles.quickViewBtn}
                      onClick={() => setQuickViewProduct(product)}
                      title="Quick View"
                    >
                      <Eye size={14} />
                      Quick View
                    </button>
                  </div>

                  <div className={styles.productInfo}>
                    <div className={styles.productCategoryRow}>
                      <span className={styles.productCategory}>
                        {product.category ? product.category.name : 'Trending'}
                      </span>
                      <div className={styles.ratingBadge}>
                        <Star size={12} fill="#fbbf24" color="#fbbf24" />
                        <span>{rating.toFixed(1)}</span>
                        <span className={styles.reviewCount}>({product.reviewCount || 0})</span>
                      </div>
                    </div>

                    <Link href={`/products/${product.id}`} className={styles.productNameLink}>
                      <h3 className={styles.productName}>{product.name}</h3>
                    </Link>

                    <p className={styles.productDesc}>{product.description}</p>

                    <div className={styles.productFooter}>
                      <span className={styles.productPrice}>${product.price.toFixed(2)}</span>
                      {product.stock > 0 ? (
                        <button
                          onClick={() => addToCart(product.id, 1)}
                          className="btn-primary"
                          style={{ padding: '8px 14px', fontSize: '0.85rem' }}
                        >
                          <ShoppingCart size={14} />
                          Add
                        </button>
                      ) : (
                        <span className="badge badge-error">Sold Out</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className={`${styles.emptyState} glass-card`}>
            <ShoppingBag size={48} className={styles.emptyIcon} />
            <h3>No products found</h3>
            <p>Database is empty. Head to the Admin Portal to seed categories and products!</p>
            <Link href="/admin" className="btn-primary" style={{ marginTop: '16px' }}>
              Add Products
            </Link>
          </div>
        )}
      </section>

      {/* Quick View Modal */}
      <QuickViewModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />
    </div>
  );
}
