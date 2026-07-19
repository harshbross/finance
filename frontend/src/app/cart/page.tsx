'use client';

import React from 'react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { ShoppingCart, Trash2, ArrowRight, ShoppingBag, Plus, Minus } from 'lucide-react';
import Link from 'next/link';
import styles from './Cart.module.css';

export default function CartPage() {
  const { token } = useAuth();
  const { cartItems, loadingCart, updateQuantity, removeFromCart, subtotal, itemCount } = useCart();

  if (!token) {
    return (
      <div className={`${styles.authRequired} glass-panel fade-in`}>
        <ShoppingCart size={48} className={styles.icon} />
        <h2>Login Required</h2>
        <p>Please sign in to view and manage your shopping cart.</p>
        <Link href="/login" className="btn-primary" style={{ marginTop: '16px' }}>
          Go to Login
        </Link>
      </div>
    );
  }

  return (
    <div className="fade-in">
      <h1 className="section-title">Your Cart</h1>

      {loadingCart ? (
        <div className={styles.loader}>Refreshing cart items...</div>
      ) : cartItems.length > 0 ? (
        <div className={styles.cartLayout}>
          {/* Cart Items List */}
          <div className={`${styles.itemsListCard} glass-panel`}>
            {cartItems.map((item) => (
              <div key={item.id} className={`${styles.cartItem} glass-card`}>
                <div className={styles.itemImageContainer}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.product.imageUrl} alt={item.product.name} className={styles.itemImage} />
                </div>

                <div className={styles.itemInfo}>
                  <Link href={`/products/${item.product.id}`} className={styles.itemName}>
                    {item.product.name}
                  </Link>
                  <span className={styles.itemCategory}>Price: ${item.product.price.toFixed(2)}</span>
                </div>

                {/* Quantity Controls */}
                <div className={styles.qtyPicker}>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className={styles.qtyBtn}
                    disabled={item.quantity <= 1}
                  >
                    <Minus size={14} />
                  </button>
                  <span className={styles.qtyValue}>{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className={styles.qtyBtn}
                    disabled={item.quantity >= item.product.stock}
                  >
                    <Plus size={14} />
                  </button>
                </div>

                {/* Item Total & Delete */}
                <div className={styles.itemTotalArea}>
                  <span className={styles.itemTotal}>
                    ${(item.product.price * item.quantity).toFixed(2)}
                  </span>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className={styles.deleteBtn}
                    title="Remove from Cart"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Cart Summary */}
          <div className={`${styles.summaryCard} glass-panel`}>
            <h2>Order Summary</h2>
            <div className={styles.divider}></div>
            
            <div className={styles.summaryRow}>
              <span>Items ({itemCount})</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            
            <div className={styles.summaryRow}>
              <span>Shipping</span>
              <span className="badge badge-success" style={{ textTransform: 'none' }}>Free</span>
            </div>
            
            <div className={styles.divider}></div>
            
            <div className={styles.totalRow}>
              <span>Total Amount</span>
              <span className={styles.totalValue}>${subtotal.toFixed(2)}</span>
            </div>

            <Link href="/checkout" className="btn-primary w-full" style={{ justifyContent: 'center', marginTop: '20px' }}>
              Proceed to Checkout
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      ) : (
        <div className={`${styles.emptyState} glass-card`}>
          <ShoppingBag size={48} className={styles.emptyIcon} />
          <h3>Your cart is empty</h3>
          <p>Browse our catalog and add items to your cart to checkout.</p>
          <Link href="/products" className="btn-primary" style={{ marginTop: '16px' }}>
            Shop Now
          </Link>
        </div>
      )}
    </div>
  );
}
