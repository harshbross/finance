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
  Cpu,
  Layers,
  Star,
  Truck,
  ShieldCheck,
  RefreshCw,
  Heart,
  Eye,
  SlidersHorizontal,
  Headphones,
  Laptop,
  Armchair,
  Activity
} from 'lucide-react';
import QuickViewModal, { QuickViewProduct } from '../components/QuickViewModal';
import { MOCK_PRODUCTS, MOCK_CATEGORIES } from '../data/mockProducts';
import { formatPrice, handleImageError } from '../utils/format';
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
  'Hardware': <Cpu size={20} />,
  'Peripherals': <SlidersHorizontal size={20} />,
  'Accessories': <Layers size={20} />,
  'Audio': <Headphones size={20} />,
  'Wearables': <Laptop size={20} />,
  'Furniture': <Armchair size={20} />,
  'Sports & Fitness': <Activity size={20} />,
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
          fetch(`${apiUrl}/api/products?limit=8`),
          fetch(`${apiUrl}/api/categories`),
        ]);

        if (prodRes.ok) {
          const prodData = await prodRes.json();
          if (prodData.products && prodData.products.length > 0) {
            setFeaturedProducts(prodData.products);
          } else {
            setFeaturedProducts(MOCK_PRODUCTS.slice(0, 8));
          }
        } else {
          setFeaturedProducts(MOCK_PRODUCTS.slice(0, 8));
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
        setFeaturedProducts(MOCK_PRODUCTS.slice(0, 8));
        setCategories(MOCK_CATEGORIES);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [apiUrl]);

  return (
    <div className="fade-in">
      {/* Enterprise SaaS Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <div className={styles.badgeWrap}>
            <span className="badge badge-primary">
              Enterprise Hardware & Operations
            </span>
          </div>
          <h1 className={styles.title}>
            Precision Hardware for
            <br />
            Modern Engineering Teams
          </h1>
          <p className={styles.subtitle}>
            Enterprise-grade workstations, studio peripherals, and computing essentials.
            Direct fulfillment, verified reviews, and dedicated corporate procurement.
          </p>
          <div className={styles.heroActions}>
            <Link href="/products" className="btn-primary">
              Browse Hardware Catalog
              <ArrowRight size={16} />
            </Link>
            <Link href="/products" className="btn-secondary">
              View Specifications
            </Link>
          </div>

          {/* Operational Metrics */}
          <div className={styles.statsRow}>
            <div className={styles.stat}>
              <span className={styles.statValue}>500+</span>
              <span className={styles.statLabel}>Active SKUs</span>
            </div>
            <div className={styles.statDivider} />
            <div className={styles.stat}>
              <span className={styles.statValue}>99.9%</span>
              <span className={styles.statLabel}>Fulfillment Rate</span>
            </div>
            <div className={styles.statDivider} />
            <div className={styles.stat}>
              <span className={styles.statValue}>24h</span>
              <span className={styles.statLabel}>Global Dispatch</span>
            </div>
            <div className={styles.statDivider} />
            <div className={styles.stat}>
              <span className={styles.statValue}>4.9 / 5</span>
              <span className={styles.statLabel}>Customer Score</span>
            </div>
          </div>
        </div>
      </section>

      {/* Category Navigation */}
      {categories.length > 0 && (
        <section className={styles.categoriesSection}>
          <div className={styles.sectionHeader}>
            <div>
              <h2 className="section-title" style={{ marginBottom: 4 }}>Hardware Categories</h2>
              <p className={styles.sectionSubtitle}>Browse by functional tier and system department</p>
            </div>
          </div>
          <div className={styles.categoriesGrid}>
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/products?category=${cat.id}`}
                className={styles.categoryCard}
              >
                <div className={styles.categoryIcon}>
                  {categoryIcons[cat.name] || <ShoppingBag size={20} />}
                </div>
                <span className={styles.categoryName}>{cat.name}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Operational Value Pillars */}
      <section className={styles.featuresSection}>
        <div className={styles.featuresGrid}>
          <div className={styles.featureCard}>
            <div className={styles.featureIconWrap}>
              <Truck size={20} />
            </div>
            <h3 className={styles.featureTitle}>Priority Logistics</h3>
            <p className={styles.featureText}>Expedited enterprise dispatch with real-time tracking and delivery guarantees.</p>
          </div>
          <div className={styles.featureCard}>
            <div className={styles.featureIconWrap}>
              <ShieldCheck size={20} />
            </div>
            <h3 className={styles.featureTitle}>Encrypted Billing</h3>
            <p className={styles.featureText}>PCI-compliant corporate billing, corporate invoice support, and secure payments.</p>
          </div>
          <div className={styles.featureCard}>
            <div className={styles.featureIconWrap}>
              <RefreshCw size={20} />
            </div>
            <h3 className={styles.featureTitle}>30-Day Evaluation</h3>
            <p className={styles.featureText}>Full replacement and return coverage for enterprise deployments and team testing.</p>
          </div>
          <div className={styles.featureCard}>
            <div className={styles.featureIconWrap}>
              <Cpu size={20} />
            </div>
            <h3 className={styles.featureTitle}>OEM Warranty</h3>
            <p className={styles.featureText}>All hardware is direct OEM certified with full warranty and enterprise RMA service.</p>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className={styles.featuredSection}>
        <div className={styles.sectionHeader}>
          <div>
            <h2 className="section-title" style={{ marginBottom: 4 }}>Featured Hardware</h2>
            <p className={styles.sectionSubtitle}>High-demand systems and accessories available for immediate shipment</p>
          </div>
          <Link href="/products" className={styles.viewAll}>
            View Full Inventory
            <ArrowRight size={14} />
          </Link>
        </div>

        {loading ? (
          <div className={styles.productsGrid}>
            {[1, 2, 3].map((i) => (
              <div key={i} className={styles.productCard}>
                <div className={styles.imageContainer} style={{ background: 'var(--bg-surface-elevated)' }} />
                <div style={{ padding: '14px' }}>
                  <div style={{ height: 14, background: 'var(--border-subtle)', borderRadius: 4, width: '60%' }} />
                  <div style={{ height: 14, background: 'var(--border-subtle)', borderRadius: 4, width: '80%', marginTop: '8px' }} />
                  <div style={{ height: 14, background: 'var(--border-subtle)', borderRadius: 4, width: '40%', marginTop: '14px' }} />
                </div>
              </div>
            ))}
          </div>
        ) : featuredProducts.length > 0 ? (
          <div className={styles.productsGrid}>
            {featuredProducts.map((product) => {
              const inWish = isInWishlist(product.id);
              const rating = product.averageRating || 5.0;

              return (
                <div key={product.id} className={styles.productCard}>
                  <div className={styles.imageContainer}>
                    <div className={styles.cardTopActions}>
                      {product.stock <= 0 ? (
                        <span className={styles.outOfStockBadge}>Out of Stock</span>
                      ) : (
                        <span className="badge badge-secondary" style={{ fontSize: '0.6875rem' }}>
                          In Stock ({product.stock})
                        </span>
                      )}
                      <button
                        className={`${styles.cardWishlistBtn} ${inWish ? styles.cardWishlistBtnActive : ''}`}
                        onClick={() => toggleWishlist(product)}
                        title={inWish ? 'Remove from wishlist' : 'Save item'}
                      >
                        <Heart
                          size={14}
                          fill={inWish ? '#ef4444' : 'none'}
                          color={inWish ? '#ef4444' : 'currentColor'}
                        />
                      </button>
                    </div>

                    <Link href={`/products/${product.id}`} style={{ display: 'contents' }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className={styles.productImage}
                        onError={handleImageError}
                      />
                    </Link>

                    <button
                      className={styles.quickViewBtn}
                      onClick={() => setQuickViewProduct(product)}
                      title="Quick Specs"
                    >
                      <Eye size={12} />
                      Quick Specs
                    </button>
                  </div>

                  <div className={styles.productInfo}>
                    <div className={styles.productCategoryRow}>
                      <span className={styles.productCategory}>
                        {product.category ? product.category.name : 'Hardware'}
                      </span>
                      <div className={styles.ratingBadge}>
                        <Star size={11} fill="#f59e0b" color="#f59e0b" />
                        <span>{rating.toFixed(1)}</span>
                        <span className={styles.reviewCount}>({product.reviewCount || 0})</span>
                      </div>
                    </div>

                    <Link href={`/products/${product.id}`}>
                      <h3 className={styles.productName}>{product.name}</h3>
                    </Link>

                    <p className={styles.productDesc}>{product.description}</p>

                    <div className={styles.productFooter}>
                      <span className={styles.productPrice}>{formatPrice(product.price)}</span>
                      {product.stock > 0 ? (
                        <button
                          onClick={() => addToCart(product.id, 1)}
                          className="btn-primary"
                          style={{ padding: '6px 12px', fontSize: '0.8125rem' }}
                        >
                          <ShoppingCart size={13} />
                          Add to Order
                        </button>
                      ) : (
                        <span className="badge">Backorder</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className={styles.emptyState}>
            <ShoppingBag size={40} className={styles.emptyIcon} />
            <h3 style={{ fontSize: '1.125rem', fontWeight: 600 }}>No products found</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: 4 }}>
              The catalog is currently being updated.
            </p>
            <Link href="/admin" className="btn-primary" style={{ marginTop: '16px' }}>
              Manage Inventory
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
