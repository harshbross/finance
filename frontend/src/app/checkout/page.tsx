'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import {
  CreditCard,
  MapPin,
  ShieldCheck,
  ArrowLeft,
  CheckCircle,
  Home,
  Briefcase,
  QrCode,
  Banknote,
  Edit2,
  PlusCircle,
  Check
} from 'lucide-react';
import Link from 'next/link';
import { formatPrice, handleImageError } from '../../utils/format';
import { CouponSection } from '../../components/CouponSection';
import { Coupon, calculateDiscount } from '../../data/coupons';
import styles from './Checkout.module.css';

interface StructuredAddress {
  fullName: string;
  phone: string;
  flat: string;
  area: string;
  landmark: string;
  city: string;
  state: string;
  pincode: string;
  type: 'Home' | 'Work' | 'Other';
}

const INDIAN_STATES = [
  'Andhra Pradesh',
  'Assam',
  'Bihar',
  'Chandigarh',
  'Chhattisgarh',
  'Delhi',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jammu & Kashmir',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Tamil Nadu',
  'Telangana',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal'
];

export default function CheckoutPage() {
  const { user, token, apiUrl } = useAuth();
  const { cartItems, subtotal, clearCartLocal } = useCart();

  // Structured Address State
  const [address, setAddress] = useState<StructuredAddress>({
    fullName: user?.name || '',
    phone: '',
    flat: '',
    area: '',
    landmark: '',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400053',
    type: 'Home'
  });

  const [hasSavedAddress, setHasSavedAddress] = useState(false);
  const [isEditingAddress, setIsEditingAddress] = useState(false);

  // Payment State
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'upi' | 'cod'>('card');
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [upiId, setUpiId] = useState('');

  // Coupon State
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Check auth
  useEffect(() => {
    if (!token && typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  }, [token]);

  // Load existing coupon and saved address from storage
  useEffect(() => {
    try {
      const savedCoupon = localStorage.getItem('active_coupon');
      if (savedCoupon) {
        setAppliedCoupon(JSON.parse(savedCoupon));
      }

      const savedAddr = localStorage.getItem('user_shipping_address');
      if (savedAddr) {
        const parsed: StructuredAddress = JSON.parse(savedAddr);
        setAddress(parsed);
        setHasSavedAddress(true);
      } else if (user?.address) {
        setAddress((prev) => ({
          ...prev,
          fullName: user.name || prev.fullName,
          area: user.address || ''
        }));
      }
    } catch (e) {
      // Ignore
    }
  }, [user]);

  const handleApplyCoupon = (coupon: Coupon) => {
    setAppliedCoupon(coupon);
    try {
      localStorage.setItem('active_coupon', JSON.stringify(coupon));
    } catch (e) {}
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    try {
      localStorage.removeItem('active_coupon');
    } catch (e) {}
  };

  const discountAmount = appliedCoupon ? calculateDiscount(appliedCoupon, subtotal) : 0;
  const finalTotal = Math.max(0, subtotal - discountAmount);

  const validateAddress = () => {
    if (!address.fullName.trim()) return 'Recipient Full Name is required';
    if (!address.phone.trim() || address.phone.replace(/\D/g, '').length < 10) {
      return 'Please enter a valid 10-digit mobile phone number';
    }
    if (!address.flat.trim()) return 'Flat, House, or Building details are required';
    if (!address.area.trim()) return 'Street or Area locality is required';
    if (!address.city.trim()) return 'City is required';
    if (!address.pincode.trim() || address.pincode.length !== 6) {
      return 'Please enter a valid 6-digit PIN code';
    }
    return null;
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const addressError = validateAddress();
    if (addressError) {
      setError(addressError);
      setIsEditingAddress(true);
      return;
    }

    // Save address locally for future orders
    try {
      localStorage.setItem('user_shipping_address', JSON.stringify(address));
      setHasSavedAddress(true);
    } catch (err) {}

    const formattedAddress = `${address.fullName}, +91 ${address.phone}, ${address.flat}, ${address.area}${
      address.landmark ? ', Near ' + address.landmark : ''
    }, ${address.city}, ${address.state} - ${address.pincode} [${address.type}]`;

    setLoading(true);

    try {
      const response = await fetch(`${apiUrl}/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          shippingAddress: formattedAddress,
          paymentMethod,
          couponCode: appliedCoupon?.code || null,
          discountAmount,
          totalAmount: finalTotal
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to place order');
      }

      // Clear cart locally
      clearCartLocal();
      try {
        localStorage.removeItem('active_coupon');
      } catch (e) {}

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

      <h1 className="section-title">Secure Checkout</h1>

      <div className={styles.checkoutLayout}>
        {/* Shipping and Payment Column */}
        <div className={`${styles.formColumn} glass-panel`}>
          <form onSubmit={handlePlaceOrder} className={styles.form}>
            {error && <div className={`${styles.alert} badge badge-error`}>{error}</div>}

            {/* 1. Shipping Address Section */}
            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                <div className={styles.sectionHeaderLeft}>
                  <MapPin className={styles.sectionIcon} />
                  <h3>1. Delivery Address</h3>
                </div>
                {hasSavedAddress && !isEditingAddress && (
                  <button
                    type="button"
                    className={styles.editAddressBtn}
                    onClick={() => setIsEditingAddress(true)}
                  >
                    <Edit2 size={13} style={{ display: 'inline', marginRight: 4 }} />
                    Change Address
                  </button>
                )}
              </div>

              {hasSavedAddress && !isEditingAddress ? (
                /* Saved Address Preview Card */
                <div className={styles.savedAddressCard}>
                  <div className={styles.savedAddressInfo}>
                    <div className={styles.savedAddressHeader}>
                      <span className={styles.recipientName}>{address.fullName}</span>
                      <span className={styles.addressTypeBadge}>{address.type}</span>
                    </div>
                    <div className={styles.addressLine}>
                      {address.flat}, {address.area}
                      {address.landmark && `, Near ${address.landmark}`}
                    </div>
                    <div className={styles.addressLine}>
                      {address.city}, {address.state} - {address.pincode}
                    </div>
                    <div className={styles.addressPhone}>Phone: +91 {address.phone}</div>
                  </div>
                  <CheckCircle size={22} color="var(--accent-primary)" />
                </div>
              ) : (
                /* Detailed Address Input Form */
                <div className={styles.addressFormGrid}>
                  <div className={styles.formRow}>
                    <div className={styles.formCol}>
                      <label className="form-label" htmlFor="fullName">Full Name</label>
                      <input
                        id="fullName"
                        type="text"
                        className="form-input"
                        placeholder="e.g. Harsh Sharma"
                        value={address.fullName}
                        onChange={(e) => setAddress({ ...address, fullName: e.target.value })}
                        required
                      />
                    </div>
                    <div className={styles.formCol}>
                      <label className="form-label" htmlFor="phone">Mobile Number</label>
                      <div className={styles.phoneInputGroup}>
                        <span className={styles.phonePrefix}>+91</span>
                        <input
                          id="phone"
                          type="tel"
                          maxLength={10}
                          className={`form-input ${styles.phoneInput}`}
                          placeholder="98765 43210"
                          value={address.phone}
                          onChange={(e) =>
                            setAddress({
                              ...address,
                              phone: e.target.value.replace(/\D/g, '').slice(0, 10)
                            })
                          }
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className={styles.formRow}>
                    <div className={styles.formCol}>
                      <label className="form-label" htmlFor="flat">Flat, House No., Building, Apartment</label>
                      <input
                        id="flat"
                        type="text"
                        className="form-input"
                        placeholder="e.g. Flat 402, Lotus Residency"
                        value={address.flat}
                        onChange={(e) => setAddress({ ...address, flat: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className={styles.formRow}>
                    <div className={styles.formCol}>
                      <label className="form-label" htmlFor="area">Street, Sector, Locality</label>
                      <input
                        id="area"
                        type="text"
                        className="form-input"
                        placeholder="e.g. Linking Road, Bandra West"
                        value={address.area}
                        onChange={(e) => setAddress({ ...address, area: e.target.value })}
                        required
                      />
                    </div>
                    <div className={styles.formCol}>
                      <label className="form-label" htmlFor="landmark">Landmark (Optional)</label>
                      <input
                        id="landmark"
                        type="text"
                        className="form-input"
                        placeholder="e.g. Near City Park"
                        value={address.landmark}
                        onChange={(e) => setAddress({ ...address, landmark: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className={styles.formRow}>
                    <div className={styles.formCol}>
                      <label className="form-label" htmlFor="city">City / Town</label>
                      <input
                        id="city"
                        type="text"
                        className="form-input"
                        placeholder="Mumbai"
                        value={address.city}
                        onChange={(e) => setAddress({ ...address, city: e.target.value })}
                        required
                      />
                    </div>
                    <div className={styles.formCol}>
                      <label className="form-label" htmlFor="state">State</label>
                      <select
                        id="state"
                        className="form-input"
                        value={address.state}
                        onChange={(e) => setAddress({ ...address, state: e.target.value })}
                        required
                        style={{ background: 'var(--bg-glass-card)' }}
                      >
                        {INDIAN_STATES.map((st) => (
                          <option key={st} value={st} style={{ background: '#111827', color: '#fff' }}>
                            {st}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className={styles.formCol}>
                      <label className="form-label" htmlFor="pincode">PIN Code</label>
                      <input
                        id="pincode"
                        type="text"
                        maxLength={6}
                        className="form-input"
                        placeholder="400053"
                        value={address.pincode}
                        onChange={(e) =>
                          setAddress({
                            ...address,
                            pincode: e.target.value.replace(/\D/g, '').slice(0, 6)
                          })
                        }
                        required
                      />
                    </div>
                  </div>

                  {/* Address Type Selector */}
                  <div>
                    <label className="form-label">Address Type</label>
                    <div className={styles.typeSelector}>
                      <button
                        type="button"
                        className={`${styles.typePill} ${
                          address.type === 'Home' ? styles.typePillActive : ''
                        }`}
                        onClick={() => setAddress({ ...address, type: 'Home' })}
                      >
                        <Home size={14} />
                        Home (7 AM - 9 PM)
                      </button>
                      <button
                        type="button"
                        className={`${styles.typePill} ${
                          address.type === 'Work' ? styles.typePillActive : ''
                        }`}
                        onClick={() => setAddress({ ...address, type: 'Work' })}
                      >
                        <Briefcase size={14} />
                        Work (10 AM - 6 PM)
                      </button>
                      <button
                        type="button"
                        className={`${styles.typePill} ${
                          address.type === 'Other' ? styles.typePillActive : ''
                        }`}
                        onClick={() => setAddress({ ...address, type: 'Other' })}
                      >
                        <MapPin size={14} />
                        Other
                      </button>
                    </div>
                  </div>

                  {hasSavedAddress && isEditingAddress && (
                    <button
                      type="button"
                      className="btn-secondary"
                      style={{ marginTop: 6, alignSelf: 'flex-start' }}
                      onClick={() => setIsEditingAddress(false)}
                    >
                      Use Saved Address
                    </button>
                  )}
                </div>
              )}
            </div>

            <div className={styles.divider}></div>

            {/* 2. Payment Method Section */}
            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                <div className={styles.sectionHeaderLeft}>
                  <CreditCard className={styles.sectionIcon} />
                  <h3>2. Payment Method</h3>
                </div>
              </div>

              {/* Payment Tabs */}
              <div className={styles.paymentTabs}>
                <button
                  type="button"
                  className={`${styles.paymentTab} ${
                    paymentMethod === 'card' ? styles.paymentTabActive : ''
                  }`}
                  onClick={() => setPaymentMethod('card')}
                >
                  <CreditCard size={18} />
                  <span>Card</span>
                </button>
                <button
                  type="button"
                  className={`${styles.paymentTab} ${
                    paymentMethod === 'upi' ? styles.paymentTabActive : ''
                  }`}
                  onClick={() => setPaymentMethod('upi')}
                >
                  <QrCode size={18} />
                  <span>UPI / QR</span>
                </button>
                <button
                  type="button"
                  className={`${styles.paymentTab} ${
                    paymentMethod === 'cod' ? styles.paymentTabActive : ''
                  }`}
                  onClick={() => setPaymentMethod('cod')}
                >
                  <Banknote size={18} />
                  <span>Cash on Delivery</span>
                </button>
              </div>

              {paymentMethod === 'card' && (
                <>
                  <p className={styles.mockAlert}>
                    Sandbox University Mode: Please do NOT input real credit card credentials.
                  </p>
                  <div className="form-group" style={{ marginTop: '12px' }}>
                    <label className="form-label" htmlFor="card-name">Cardholder Name</label>
                    <input
                      id="card-name"
                      type="text"
                      className="form-input"
                      placeholder="e.g. Harsh Sharma"
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      required={paymentMethod === 'card'}
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
                      required={paymentMethod === 'card'}
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
                        required={paymentMethod === 'card'}
                      />
                    </div>
                    <div className="form-group" style={{ flex: 1 }}>
                      <label className="form-label" htmlFor="card-cvv">CVV</label>
                      <input
                        id="card-cvv"
                        type="password"
                        maxLength={4}
                        className="form-input"
                        placeholder="123"
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value)}
                        required={paymentMethod === 'card'}
                      />
                    </div>
                  </div>
                </>
              )}

              {paymentMethod === 'upi' && (
                <div className={styles.upiSection}>
                  <div className={styles.upiQrBox}>
                    {/* Mock SVG QR Code */}
                    <svg viewBox="0 0 100 100" width="100%" height="100%">
                      <rect width="100" height="100" fill="#ffffff" />
                      <path
                        d="M10,10 h25 v25 h-25 z M15,15 v15 h15 v-15 z M19,19 h7 v7 h-7 z"
                        fill="#000000"
                      />
                      <path
                        d="M65,10 h25 v25 h-25 z M70,15 v15 h15 v-15 z M74,19 h7 v7 h-7 z"
                        fill="#000000"
                      />
                      <path
                        d="M10,65 h25 v25 h-25 z M15,70 v15 h15 v-15 z M19,74 h7 v7 h-7 z"
                        fill="#000000"
                      />
                      <rect x="45" y="15" width="10" height="10" fill="#000000" />
                      <rect x="45" y="45" width="10" height="10" fill="#000000" />
                      <rect x="65" y="65" width="10" height="10" fill="#000000" />
                      <rect x="75" y="45" width="15" height="10" fill="#000000" />
                      <rect x="45" y="75" width="20" height="10" fill="#000000" />
                      <rect x="75" y="75" width="15" height="15" fill="#000000" />
                    </svg>
                  </div>
                  <div style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
                    Scan with any UPI App
                  </div>
                  <div className={styles.upiAppsRow}>
                    <span className={styles.upiAppBadge}>Google Pay</span>
                    <span className={styles.upiAppBadge}>PhonePe</span>
                    <span className={styles.upiAppBadge}>Paytm</span>
                    <span className={styles.upiAppBadge}>BHIM</span>
                  </div>
                  <div style={{ width: '100%', marginTop: 8 }}>
                    <label className="form-label" htmlFor="upi-id">Or Enter UPI ID</label>
                    <input
                      id="upi-id"
                      type="text"
                      className="form-input"
                      placeholder="username@okaxis"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                    />
                  </div>
                </div>
              )}

              {paymentMethod === 'cod' && (
                <div className={styles.mockAlert} style={{ background: 'rgba(16, 185, 129, 0.08)', color: '#10b981', borderColor: 'rgba(16, 185, 129, 0.3)' }}>
                  ✓ Pay with cash or UPI upon delivery. Exact change is appreciated!
                </div>
              )}
            </div>

            <button
              type="submit"
              className="btn-primary w-full"
              style={{ justifyContent: 'center', marginTop: '16px' }}
              disabled={loading}
            >
              <ShieldCheck size={18} />
              {loading
                ? 'Processing Order...'
                : paymentMethod === 'cod'
                ? `Confirm Order (${formatPrice(finalTotal)})`
                : `Pay & Place Order (${formatPrice(finalTotal)})`}
            </button>
          </form>
        </div>

        {/* Order Summary Column */}
        <div className={`${styles.summaryColumn} glass-panel`}>
          <h3>Items to Purchase ({cartItems.length})</h3>
          <div className={styles.divider}></div>

          <div className={styles.itemsList}>
            {cartItems.map((item) => (
              <div key={item.id} className={styles.itemSummary}>
                <div className={styles.itemMeta}>
                  <span className={styles.itemName}>{item.product.name}</span>
                  <span className={styles.itemQuantity}>Qty: {item.quantity}</span>
                </div>
                <span className={styles.itemTotal}>
                  {formatPrice(item.product.price * item.quantity)}
                </span>
              </div>
            ))}
          </div>

          <div className={styles.divider}></div>

          <div className={styles.summaryRow}>
            <span>Subtotal</span>
            <span>{formatPrice(subtotal)}</span>
          </div>

          {appliedCoupon && discountAmount > 0 && (
            <div className={styles.discountRow}>
              <span>Discount ({appliedCoupon.code})</span>
              <span>-{formatPrice(discountAmount)}</span>
            </div>
          )}

          <div className={styles.summaryRow}>
            <span>Express Delivery</span>
            <span className="badge badge-success" style={{ textTransform: 'none' }}>
              Free
            </span>
          </div>

          {/* Checkout Coupon Module */}
          <CouponSection
            subtotal={subtotal}
            appliedCoupon={appliedCoupon}
            onApplyCoupon={handleApplyCoupon}
            onRemoveCoupon={handleRemoveCoupon}
          />

          <div className={styles.divider}></div>

          <div className={styles.totalRow}>
            <span>Total to Pay</span>
            <span className={styles.totalValue}>{formatPrice(finalTotal)}</span>
          </div>

          <div className={styles.secureBadge}>
            <CheckCircle size={16} />
            <span>256-Bit SSL Encrypted & Verified</span>
          </div>
        </div>
      </div>
    </div>
  );
}
