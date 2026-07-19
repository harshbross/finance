'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { Search, Filter, ShoppingCart, SlidersHorizontal, ChevronLeft, ChevronRight } from 'lucide-react';
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
}

export default function ProductsPage() {
  const { apiUrl } = useAuth();
  const { addToCart } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Fetch categories
  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch(`${apiUrl}/api/categories`);
        if (res.ok) {
          const data = await res.json();
          setCategories(data || []);
        }
      } catch (err) {
        console.error('Failed to load categories', err);
      }
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
      query.append('page', currentPage.toString());
      query.append('limit', '8');

      const res = await fetch(`${apiUrl}/api/products?${query.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setProducts(data.products || []);
        setTotalPages(data.totalPages || 1);
      }
    } catch (err) {
      console.error('Failed to fetch products', err);
    } finally {
      setLoading(false);
    }
  }, [apiUrl, search, selectedCategory, currentPage]);

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

  return (
    <div className="fade-in">
      <div className={styles.headerArea}>
        <h1 className="section-title">Discover Products</h1>
        <p className={styles.subtitle}>Explore our high-performance gear with futuristic aesthetics</p>
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
        </div>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className={styles.loader}>Loading products...</div>
      ) : products.length > 0 ? (
        <>
          <div className={styles.productsGrid}>
            {products.map((product) => (
              <div key={product.id} className="glass-card p-4 flex flex-col">
                <div className={styles.imageContainer}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={product.imageUrl} alt={product.name} className={styles.productImage} />
                  {product.stock <= 0 && <span className={styles.outOfStockBadge}>Out of Stock</span>}
                </div>
                
                <span className={styles.productCategory}>{product.category.name}</span>
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
                      Empty
                    </button>
                  )}
                </div>
              </div>
            ))}
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
    </div>
  );
}
