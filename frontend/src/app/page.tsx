'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { ArrowRight, ShoppingBag, ShieldCheck, Sparkles } from 'lucide-react';
import styles from './Home.module.css';

interface Product {
  id: number;
  name: string;
  price: number;
  imageUrl: string;
  description: string;
}

export default function HomePage() {
  const { apiUrl } = useAuth();
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFeatured() {
      try {
        const res = await fetch(`${apiUrl}/api/products?limit=3`);
        if (res.ok) {
          const data = await res.json();
          setFeaturedProducts(data.products || []);
        }
      } catch (err) {
        console.error('Failed to fetch featured products', err);
      } finally {
        setLoading(false);
      }
    }
    fetchFeatured();
  }, [apiUrl]);

  return (
    <div className="fade-in">
      {/* Hero Section */}
      <section className={`${styles.hero} glass-panel float-animation`}>
        <div className={styles.heroContent}>
          <div className={styles.badgeWrap}>
            <span className="badge badge-primary">
              <Sparkles size={12} style={{ marginRight: '4px' }} />
              University Project MVP
            </span>
          </div>
          <h1 className={`${styles.title} glow-text`}>
            Next-Gen E-Commerce <br />
            <span className="gradient-text">Aether Shop</span>
          </h1>
          <p className={styles.subtitle}>
            A modern full-stack application built with Next.js App Router, Express.js, Prisma, and PostgreSQL. 
            Experience glassmorphism aesthetics, secure JWT authentication, shopping cart state, and an admin management dashboard.
          </p>
          <div className={styles.heroActions}>
            <Link href="/products" className="btn-primary">
              Browse Catalog
              <ArrowRight size={18} />
            </Link>
            <Link href="/admin" className="btn-secondary">
              <ShieldCheck size={18} />
              Admin Portal
            </Link>
          </div>
        </div>
      </section>

      {/* Highlights Section */}
      <section className={styles.featuresSection}>
        <h2 className="section-title text-center">Core Project Features</h2>
        <div className={styles.featuresGrid}>
          <div className="glass-card p-6">
            <h3 className={styles.featureTitle}>JWT Authentication</h3>
            <p className={styles.featureText}>Secure token-based registration, login, and profile modification. User roles guard administrative capabilities.</p>
          </div>
          <div className="glass-card p-6">
            <h3 className={styles.featureTitle}>Relational DB (Neon)</h3>
            <p className={styles.featureText}>Managed with Prisma ORM. Complex transactional logic clears shopping carts and updates product stock levels.</p>
          </div>
          <div className="glass-card p-6">
            <h3 className={styles.featureTitle}>Admin CRUD Panel</h3>
            <p className={styles.featureText}>Fully operational management page to create, update, delete products/categories, view users, and monitor orders.</p>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className={styles.featuredSection}>
        <div className={styles.sectionHeader}>
          <h2 className="section-title">New Arrivals</h2>
          <Link href="/products" className={styles.viewAll}>
            View All Products
            <ArrowRight size={16} />
          </Link>
        </div>

        {loading ? (
          <div className={styles.loader}>Loading featured products...</div>
        ) : featuredProducts.length > 0 ? (
          <div className={styles.productsGrid}>
            {featuredProducts.map((product) => (
              <div key={product.id} className="glass-card p-4 flex flex-col">
                <div className={styles.imageContainer}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={product.imageUrl} alt={product.name} className={styles.productImage} />
                </div>
                <h3 className={styles.productName}>{product.name}</h3>
                <p className={styles.productDesc}>{product.description}</p>
                <div className={styles.productFooter}>
                  <span className={styles.productPrice}>${product.price.toFixed(2)}</span>
                  <Link href={`/products/${product.id}`} className="btn-primary" style={{ padding: '8px 14px', fontSize: '0.85rem' }}>
                    View
                  </Link>
                </div>
              </div>
            ))}
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
    </div>
  );
}
