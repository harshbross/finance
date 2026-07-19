'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { User, MapPin, Mail, Key, Save, ShoppingBag, Eye } from 'lucide-react';
import Link from 'next/link';
import styles from './Profile.module.css';

interface Order {
  id: number;
  totalAmount: number;
  status: string;
  createdAt: string;
}

export default function ProfilePage() {
  const { user, token, apiUrl, updateUserInContext } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [password, setPassword] = useState('');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Redirect if not logged in
  useEffect(() => {
    if (!token && typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  }, [token]);

  // Load user data into form fields
  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
      setAddress(user.address || '');
    }
  }, [user]);

  // Load user orders
  useEffect(() => {
    if (!token) return;

    async function fetchOrders() {
      setLoadingOrders(true);
      try {
        const res = await fetch(`${apiUrl}/api/orders/my-orders`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (res.ok) {
          const data = await res.json();
          setOrders(data || []);
        }
      } catch (err) {
        console.error('Failed to fetch orders', err);
      } finally {
        setLoadingOrders(false);
      }
    }
    fetchOrders();
  }, [token, apiUrl]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoadingProfile(true);

    try {
      const response = await fetch(`${apiUrl}/api/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name, email, password: password || undefined, address })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update profile');
      }

      updateUserInContext(data.user);
      setSuccess('Profile updated successfully!');
      setPassword(''); // Clear password field
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setLoadingProfile(false);
    }
  };

  if (!user) {
    return <div className="text-center p-8">Loading profile...</div>;
  }

  return (
    <div className={`${styles.profileLayout} fade-in`}>
      {/* Edit Profile Form */}
      <div className={`${styles.profileFormCard} glass-panel`}>
        <div className={styles.cardHeader}>
          <div className={styles.avatarWrap}>
            <User size={32} className={styles.avatarIcon} />
          </div>
          <h2>My Profile</h2>
          <span className={`badge ${user.role === 'ADMIN' ? 'badge-primary' : 'badge-secondary'}`}>
            {user.role}
          </span>
        </div>

        {error && <div className={`${styles.alert} badge badge-error`}>{error}</div>}
        {success && <div className={`${styles.alert} badge badge-success`}>{success}</div>}

        <form onSubmit={handleUpdateProfile} className={styles.form}>
          <div className="form-group">
            <label className="form-label" htmlFor="profile-name">Full Name</label>
            <div className={styles.inputWrapper}>
              <User size={18} className={styles.inputIcon} />
              <input
                id="profile-name"
                type="text"
                className="form-input"
                style={{ paddingLeft: '45px' }}
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="profile-email">Email Address</label>
            <div className={styles.inputWrapper}>
              <Mail size={18} className={styles.inputIcon} />
              <input
                id="profile-email"
                type="email"
                className="form-input"
                style={{ paddingLeft: '45px' }}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="profile-address">Shipping Address</label>
            <div className={styles.inputWrapper}>
              <MapPin size={18} className={styles.inputIcon} />
              <input
                id="profile-address"
                type="text"
                className="form-input"
                style={{ paddingLeft: '45px' }}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="No address saved"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="profile-password">Change Password</label>
            <div className={styles.inputWrapper}>
              <Key size={18} className={styles.inputIcon} />
              <input
                id="profile-password"
                type="password"
                className="form-input"
                style={{ paddingLeft: '45px' }}
                placeholder="Leave blank to keep current password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button type="submit" className="btn-primary w-full" style={{ justifyContent: 'center' }} disabled={loadingProfile}>
            <Save size={18} />
            {loadingProfile ? 'Saving Changes...' : 'Save Settings'}
          </button>
        </form>
      </div>

      {/* User Order History */}
      <div className={`${styles.ordersCard} glass-panel`}>
        <div className={styles.cardHeader}>
          <div className={styles.avatarWrap}>
            <ShoppingBag size={24} className={styles.avatarIcon} />
          </div>
          <h2>Order History</h2>
          <span className="badge badge-primary">{orders.length} Orders</span>
        </div>

        {loadingOrders ? (
          <div className="text-center p-8 color-muted">Loading orders...</div>
        ) : orders.length > 0 ? (
          <div className={styles.ordersList}>
            {orders.map((order) => (
              <div key={order.id} className={`${styles.orderItem} glass-card`}>
                <div className={styles.orderInfo}>
                  <p className={styles.orderId}>Order #{order.id}</p>
                  <p className={styles.orderDate}>{new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
                <div className={styles.orderMeta}>
                  <span className={styles.orderPrice}>${order.totalAmount.toFixed(2)}</span>
                  <span className={`badge ${
                    order.status === 'Delivered' ? 'badge-success' :
                    order.status === 'Cancelled' ? 'badge-error' : 'badge-primary'
                  }`}>
                    {order.status}
                  </span>
                  <Link href={`/orders/${order.id}`} className={styles.viewDetailsBtn} title="View Details">
                    <Eye size={18} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.emptyOrders}>
            <ShoppingBag size={48} className={styles.emptyOrdersIcon} />
            <h3>No orders yet</h3>
            <p>Once you make a purchase, it will appear here!</p>
            <Link href="/products" className="btn-primary" style={{ marginTop: '16px' }}>
              Shop Now
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
