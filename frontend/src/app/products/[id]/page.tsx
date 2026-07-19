'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import { useCart } from '../../../context/CartContext';
import { ShoppingCart, ArrowLeft, ShieldCheck, Truck, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import styles from './ProductDetail.module.css';

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

export default function ProductDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { apiUrl } = useAuth();
  const { addToCart } = useCart();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    if (!id) return;

    async function fetchProduct() {
      setLoading(true);
      try {
        const res = await fetch(`${apiUrl}/api/products/${id}`);
        if (res.ok) {
          const data = await res.json();
          setProduct(data);
        } else {
          setProduct(null);
        }
      } catch (err) {
        console.error('Error fetching product details', err);
      } finally {
        setLoading(false);
      }
    }
    fetchProduct();
  }, [id, apiUrl]);

  const handleAddToCart = async () => {
    if (!product) return;
    setAdding(true);
    try {
      await addToCart(product.id, quantity);
      alert('Product added to cart!');
    } catch (err) {
      console.error(err);
    } finally {
      setAdding(false);
    }
  };

  if (loading) {
    return <div className={styles.loader}>Loading product details...</div>;
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

  return (
    <div className="fade-in">
      <button onClick={() => router.back()} className={styles.backBtn}>
        <ArrowLeft size={16} />
        Back to Products
      </button>

      <div className={`${styles.detailGrid} glass-panel`}>
        {/* Product Image */}
        <div className={styles.imageColumn}>
          <div className={styles.imageContainer}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={product.imageUrl} alt={product.name} className={styles.productImage} />
          </div>
        </div>

        {/* Product Info */}
        <div className={styles.infoColumn}>
          <span className={styles.categoryBadge}>{product.category.name}</span>
          <h1 className={styles.productName}>{product.name}</h1>
          
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

          {/* Add to Cart Controls */}
          {product.stock > 0 && (
            <div className={styles.actionArea}>
              <div className={styles.quantityPicker}>
                <button 
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className={styles.qtyBtn}
                  disabled={quantity <= 1}
                >
                  -
                </button>
                <span className={styles.qtyValue}>{quantity}</span>
                <button 
                  onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
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
    </div>
  );
}
