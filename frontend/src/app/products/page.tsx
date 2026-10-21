'use client';

import React, { useEffect, useState, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import {
  Search,
  Filter,
  ShoppingCart,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  Heart,
  Eye,
  Star,
  ArrowUpDown
} from 'lucide-react';
import { ProductGridSkeleton } from '../../components/Skeleton';
import QuickViewModal, { QuickViewProduct } from '../../components/QuickViewModal';
import { MOCK_PRODUCTS, MOCK_CATEGORIES } from '../../data/mockProducts';
import { formatPrice } from '../../utils/format';
import styles from './Products.module.css';

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
  categoryId: number;
  category: Category;
  averageRating?: number;
  reviewCount?: number;
}

function ProductsContent() {
  const { apiUrl } = useAuth();
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const searchParams = useSearchParams();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [sortBy, setSortBy] = useState('newest');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Quick View Modal
  const [quickViewProduct, setQuickViewProduct] = useState<QuickViewProduct | null>(null);

  // Fetch categories
  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch(`${apiUrl}/api/categories`);
        if (res.ok) {
          const data = await res.json();
          if (data && data.length > 0) {
            setCategories(data);
            return;
          }
        }
      } catch (err) {
        console.error('Failed to load categories', err);
      }
      setCategories(MOCK_CATEGORIES);
    }
    fetchCategories();
  }, [apiUrl]);

  // Fetch products
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      if (search) query.append('search', search);
      if (selectedCategory) query.append('categoryId', selectedCategory);
      if (sortBy) query.append('sortBy', sortBy);
      if (minPrice) query.append('minPrice', minPrice);
      if (maxPrice) query.append('maxPrice', maxPrice);
      query.append('page', currentPage.toString());
      query.append('limit', '8');

      const res = await fetch(`${apiUrl}/api/products?${query.toString()}`);
      if (res.ok) {
        const data = await res.json();
        if (data.products && data.products.length > 0) {
          setProducts(data.products);
          setTotalPages(data.totalPages || 1);
          setLoading(false);
          return;
        }
      }
    } catch (err) {
      console.error('Failed to fetch products, using curated catalog', err);
    }

    // Curated catalog fallback
    let filtered = [...MOCK_PRODUCTS];
    if (search) {
      const s = search.toLowerCase();
      filtered = filtered.filter(
        p => p.name.toLowerCase().includes(s) || p.description.toLowerCase().includes(s)
      );
    }
    if (selectedCategory) {
      filtered = filtered.filter(p => p.categoryId === parseInt(selectedCategory));
    }
    if (minPrice) filtered = filtered.filter(p => p.price >= parseFloat(minPrice));
    if (maxPrice) filtered = filtered.filter(p => p.price <= parseFloat(maxPrice));
    if (sortBy === 'price-asc') filtered.sort((a, b) => a.price - b.price);
    else if (sortBy === 'price-desc') filtered.sort((a, b) => b.price - a.price);
    else if (sortBy === 'name-asc') filtered.sort((a, b) => a.name.localeCompare(b.name));
    else filtered.sort((a, b) => b.id - a.id);

    setProducts(filtered);
    setTotalPages(1);
    setLoading(false);
  }, [apiUrl, search, selectedCategory, sortBy, minPrice, maxPrice, currentPage]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchProducts();
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCategory(e.target.value);
    setCurrentPage(1);
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortBy(e.target.value);
    setCurrentPage(1);
  };

  return (
    <div className="fade-in">
      <div className={styles.headerArea}>
        <h1 className="section-title">Discover Products</h1>
        <p className={styles.subtitle}>Explore our curated collection of premium products</p>
      </div>

      {/* Filter and Search Bar */}
      <div className={`${styles.filterBar} glass-panel`}>
        <form onSubmit={handleSearchSubmit} className={styles.searchForm}>
          <Search size={18} className={styles.searchIcon} />
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: '45px' }}
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </form>

        <div className={styles.filtersRight}>
          {/* Category Filter */}
          <div className={styles.selectWrapper}>
            <Filter size={16} className={styles.selectIcon} />
            <select
              className="form-input"
              style={{ paddingLeft: '40px', cursor: 'pointer' }}
              value={selectedCategory}
              onChange={handleCategoryChange}
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Sort Filter */}
          <div className={styles.selectWrapper}>
            <ArrowUpDown size={16} className={styles.selectIcon} />
            <select
              className="form-input"
              style={{ paddingLeft: '40px', cursor: 'pointer' }}
              value={sortBy}
              onChange={handleSortChange}
            >
              <option value="newest">Newest Arrivals</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="name-asc">Name: A to Z</option>
            </select>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      {loading ? (
        <ProductGridSkeleton count={8} />
      ) : products.length > 0 ? (
        <>
          <div className={styles.productsGrid}>
            {products.map((product, i) => {
              const inWish = isInWishlist(product.id);
              const rating = product.averageRating || 5.0;

              return (
                <div
                  key={product.id}
                  className={`glass-card ${styles.productCard} fade-in-up stagger-${Math.min(
                    i + 1,
                    8
                  )}`}
                >
                  <div className={styles.imageContainer}>
                    {/* Top actions: Wishlist heart & Out-of-stock badge */}
                    <div className={styles.cardTopActions}>
                      {product.stock <= 0 ? (
                        <span className={styles.outOfStockBadge}>Out of Stock</span>
                      ) : (
                        <span />
                      )}
                      <button
                        className={`${styles.cardWishlistBtn} ${
                          inWish ? styles.cardWishlistBtnActive : ''
                        }`}
                        onClick={() => toggleWishlist(product)}
                        title={inWish ? 'Remove from wishlist' : 'Add to wishlist'}
                      >
                        <Heart
                          size={16}
                          fill={inWish ? '#be123c' : 'none'}
                          color={inWish ? '#be123c' : 'currentColor'}
                        />
                      </button>
                    </div>

                    <Link href={`/products/${product.id}`} style={{ display: 'contents' }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className={styles.productImage}
                      />
                    </Link>

                    {/* Quick View Button on hover */}
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
                      <span className={styles.productCategory}>{product.category?.name || 'Hardware'}</span>
                      <div className={styles.ratingBadge}>
                        <Star size={12} fill="#d97706" color="#d97706" />
                        <span>{rating.toFixed(1)}</span>
                        <span className={styles.reviewCount}>({product.reviewCount || 0})</span>
                      </div>
                    </div>

                    <Link href={`/products/${product.id}`} className={styles.productNameLink}>
                      <h3 className={styles.productName}>{product.name}</h3>
                    </Link>

                    <p className={styles.productDesc}>{product.description}</p>

                    <div className={styles.productFooter}>
                      <span className={styles.productPrice}>{formatPrice(product.price)}</span>
                      {product.stock > 0 ? (
                        <button
                          onClick={() => addToCart(product.id, 1)}
                          className="btn-primary"
                          style={{ padding: '8px 12px', fontSize: '0.8rem' }}
                        >
                          <ShoppingCart size={14} />
                          Add
                        </button>
                      ) : (
                        <button
                          className="btn-secondary"
                          style={{ padding: '8px 12px', fontSize: '0.8rem', cursor: 'not-allowed' }}
                          disabled
                        >
                          Sold Out
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className={styles.pagination}>
              <button
                className="btn-secondary"
                style={{ padding: '8px 12px' }}
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft size={18} />
              </button>
              <span className={styles.pageNumber}>
                Page {currentPage} of {totalPages}
              </span>
              <button
                className="btn-secondary"
                style={{ padding: '8px 12px' }}
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight size={18} />
              </button>
            </div>
          )}
        </>
      ) : (
        <div className={`${styles.emptyState} glass-card`}>
          <SlidersHorizontal size={48} className={styles.emptyIcon} />
          <h3>No products match your criteria</h3>
          <p>Try resetting filters or searching with another term.</p>
        </div>
      )}

      {/* Quick View Modal */}
      <QuickViewModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<ProductGridSkeleton count={8} />}>
      <ProductsContent />
    </Suspense>
  );
}
