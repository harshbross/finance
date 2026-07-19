'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import { UserPlus, Mail, Lock, User, MapPin } from 'lucide-react';
import styles from '../login/Auth.module.css';

export default function RegisterPage() {
  const { login, apiUrl } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [address, setAddress] = useState('');
  const [role, setRole] = useState('USER');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${apiUrl}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, address, role })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      login(data.token, data.user);
      window.location.href = '/';
    } catch (err: any) {
      setError(err.message || 'Server error, please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`${styles.authContainer} fade-in`}>
      <div className={`${styles.authCard} glass-panel`}>
        <div className={styles.header}>
          <div className={styles.iconWrap}>
            <UserPlus size={24} className={styles.icon} />
          </div>
          <h2 className="glow-text">Create Account</h2>
          <p className={styles.subtitle}>Join Aether Shop and start browsing premium tech</p>
        </div>

        {error && <div className={`${styles.alert} badge badge-error`}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className="form-group">
            <label className="form-label" htmlFor="name">Full Name</label>
            <div className={styles.inputWrapper}>
              <User size={18} className={styles.inputIcon} />
              <input
                id="name"
                type="text"
                className="form-input"
                style={{ paddingLeft: '45px' }}
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="email">Email Address</label>
            <div className={styles.inputWrapper}>
              <Mail size={18} className={styles.inputIcon} />
              <input
                id="email"
                type="email"
                className="form-input"
                style={{ paddingLeft: '45px' }}
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="address">Shipping Address</label>
            <div className={styles.inputWrapper}>
              <MapPin size={18} className={styles.inputIcon} />
              <input
                id="address"
                type="text"
                className="form-input"
                style={{ paddingLeft: '45px' }}
                placeholder="123 Street Name, City, Country"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">Password (min 6 chars)</label>
            <div className={styles.inputWrapper}>
              <Lock size={18} className={styles.inputIcon} />
              <input
                id="password"
                type="password"
                className="form-input"
                style={{ paddingLeft: '45px' }}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Development Admin Override Option */}
          <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '15px 0' }}>
            <input
              id="dev-admin"
              type="checkbox"
              style={{ width: '18px', height: '18px', accentColor: 'var(--accent-primary)' }}
              checked={role === 'ADMIN'}
              onChange={(e) => setRole(e.target.checked ? 'ADMIN' : 'USER')}
            />
            <label htmlFor="dev-admin" style={{ fontSize: '0.85rem', color: 'var(--accent-secondary)', cursor: 'pointer' }}>
              Register as Admin (For testing/evaluation)
            </label>
          </div>

          <button type="submit" className="btn-primary w-full" style={{ justifyContent: 'center', marginTop: '10px' }} disabled={loading}>
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        <div className={styles.footer}>
          <p>Already have an account? <Link href="/login" className={styles.link}>Sign In</Link></p>
        </div>
      </div>
    </div>
  );
}
