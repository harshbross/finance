'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { CreditCard, MapPin, ShieldCheck, ArrowLeft, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import styles from './Checkout.module.css';

export default function CheckoutPage() {
  const { user, token, apiUrl } = useAuth();
  const { cartItems, subtotal, clearCartLocal } = useCart();

  const [shippingAddress, setShippingAddress] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token && typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  }, [token]);

  useEffect(() => {
    if (user && user.address) {
      setShippingAddress(user.address);
    }
  }, [user]);

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!shippingAddress) {
      setError('Shipping address is required');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${apiUrl}/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ shippingAddress })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to place order');
      }

      // Clear cart locally since DB cleared it
      clearCartLocal();
      
      // Redirect to Order Confirmation page
      window.location.href = `/orders/${data.id}`;
    } catch (err: any) {
      setError(err.message || 'Server error, please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!user || cartItems.length === 0) {
    return (
      <div className={`${styles.emptyState} glass-panel fade-in`}>
        <h2>Checkout Unavailable</h2>
        <p>You cannot checkout because your cart is empty or you are not logged in.</p>
        <Link href="/products" className="btn-primary" style={{ marginTop: '16px' }}>
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="fade-in">
      <Link href="/cart" className={styles.backBtn}>
        <ArrowLeft size={16} />
        Back to Cart
      </Link>

      <h1 className="section-title">Checkout</h1>

      <div className={styles.checkoutLayout}>
        {/* Shipping and Payment Forms */}
        <div className={`${styles.formColumn} glass-panel`}>
          <form onSubmit={handlePlaceOrder} className={styles.form}>
            {error && <div className={`${styles.alert} badge badge-error`}>{error}</div>}

            {/* Shipping Address */}
            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                <MapPin className={styles.sectionIcon} />
                <h3>1. Shipping Details</h3>
              </div>
              <div className="form-group" style={{ marginTop: '15px' }}>
                <label className="form-label" htmlFor="checkout-address">Delivery Address</label>
                <textarea
                  id="checkout-address"
                  className="form-input"
                  rows={3}
                  placeholder="Street address, City, State, ZIP, Country"
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className={styles.divider}></div>

            {/* Payment Info */}
            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                <CreditCard className={styles.sectionIcon} />
                <h3>2. Mock Payment</h3>
              </div>
              <p className={styles.mockAlert}>
                This is a sandbox university project. Please do NOT input real credit card credentials.
              </p>
              
              <div className="form-group" style={{ marginTop: '15px' }}>
                <label className="form-label" htmlFor="card-name">Cardholder Name</label>
                <input
                  id="card-name"
                  type="text"
                  className="form-input"
                  placeholder="John Doe"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="card-number">Card Number</label>
                <input
                  id="card-number"
                  type="text"
                  className="form-input"
                  placeholder="4111 2222 3333 4444"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  required
                />
              </div>

              <div className={styles.cardRow}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label" htmlFor="card-expiry">Expiry Date</label>
                  <input
                    id="card-expiry"
                    type="text"
                    className="form-input"
                    placeholder="MM/YY"
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label" htmlFor="card-cvv">CVV</label>
                  <input
                    id="card-cvv"
                    type="password"
                    className="form-input"
                    placeholder="123"
                    value={cardCvv}
                    onChange={(e) => setCardCvv(e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>

            <button type="submit" className="btn-primary w-full" style={{ justifyContent: 'center', marginTop: '10px' }} disabled={loading}>
              <ShieldCheck size={18} />
              {loading ? 'Processing Order...' : `Pay & Place Order ($${subtotal.toFixed(2)})`}
            </button>
          </form>
        </div>

        {/* Order Summary Column */}
        <div className={`${styles.summaryColumn} glass-panel`}>
          <h3>Items to Purchase</h3>
          <div className={styles.divider}></div>
          
          <div className={styles.itemsList}>
            {cartItems.map((item) => (
              <div key={item.id} className={styles.itemSummary}>
                <div className={styles.itemMeta}>
                  <span className={styles.itemName}>{item.product.name}</span>
                  <span className={styles.itemQuantity}>Qty: {item.quantity}</span>
                </div>
                <span className={styles.itemTotal}>
                  ${(item.product.price * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          <div className={styles.divider}></div>

          <div className={styles.summaryRow}>
            <span>Subtotal</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <div className={styles.summaryRow}>
            <span>Shipping</span>
            <span className="badge badge-success" style={{ textTransform: 'none' }}>Free</span>
          </div>
          
          <div className={styles.divider}></div>
          
          <div className={styles.totalRow}>
            <span>Total to Pay</span>
            <span className={styles.totalValue}>${subtotal.toFixed(2)}</span>
          </div>

          <div className={styles.secureBadge}>
            <CheckCircle size={16} />
            <span>Secure SSL Encrypted Connection</span>
          </div>
        </div>
      </div>
    </div>
  );
}
