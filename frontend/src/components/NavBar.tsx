'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';
import { ShoppingCart, User, LogOut, LayoutDashboard, ShoppingBag, Menu, X, Heart, Sun, Moon } from 'lucide-react';
import styles from './NavBar.module.css';

const NavBar: React.FC = () => {
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const { theme, toggleTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const closeMobile = () => setMobileOpen(false);

  return (
    <>
      <header className={styles.header}>
        <div className={styles.navContainer}>
          <Link href="/" className={styles.logo} onClick={closeMobile}>
            <ShoppingBag size={18} className={styles.logoIcon} />
            <span>LEDGER<span style={{ color: 'var(--accent-primary)', marginLeft: 3 }}>OPS</span></span>
            <span className={styles.logoBadge}>PRO</span>
          </Link>

          {/* Desktop Nav */}
          <nav className={styles.navLinks}>
            <Link href="/products" className={styles.navLink}>
              Catalog
            </Link>
            {user && (
              <Link href="/wishlist" className={styles.navLink}>
                <Heart size={15} />
                Saved
              </Link>
            )}
            {user && (
              <Link href="/orders" className={styles.navLink}>
                Orders
              </Link>
            )}
            {user?.role === 'ADMIN' && (
              <Link href="/admin" className={`${styles.navLink} ${styles.adminLink}`}>
                <LayoutDashboard size={15} />
                Admin
              </Link>
            )}
          </nav>

          <div className={styles.actions}>
            {/* Theme Toggle Button */}
            <button
              type="button"
              onClick={toggleTheme}
              className={styles.cartBtn}
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
            </button>

            {user ? (
              <>
                <Link href="/cart" className={styles.cartBtn} title="Shopping Cart">
                  <ShoppingCart size={17} />
                  {itemCount > 0 && <span className={styles.badge}>{itemCount}</span>}
                </Link>
                <Link href="/profile" className={styles.profileBtn} title="Account Settings">
                  <User size={16} />
                  <span className={styles.userName}>{user.name}</span>
                </Link>
                <button onClick={logout} className={styles.logoutBtn} title="Sign Out">
                  <LogOut size={16} />
                </button>
              </>
            ) : (
              <>
                <Link href="/cart" className={styles.cartBtn} title="Shopping Cart">
                  <ShoppingCart size={17} />
                  {itemCount > 0 && <span className={styles.badge}>{itemCount}</span>}
                </Link>
                <Link href="/login" className="btn-secondary" style={{ padding: '6px 14px', fontSize: '0.8125rem' }}>
                  Sign In
                </Link>
                <Link href="/register" className="btn-primary" style={{ padding: '6px 14px', fontSize: '0.8125rem' }}>
                  Get Started
                </Link>
              </>
            )}

            {/* Mobile Hamburger */}
            <button
              className={styles.hamburger}
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle mobile menu"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Overlay */}
      {mobileOpen && <div className={styles.overlay} onClick={closeMobile} />}

      {/* Mobile Drawer */}
      <div className={`${styles.mobileDrawer} ${mobileOpen ? styles.drawerOpen : ''}`}>
        <nav className={styles.mobileNav}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-muted)' }}>APPEARANCE</span>
            <button
              onClick={toggleTheme}
              className={styles.cartBtn}
              style={{ padding: '6px 10px' }}
            >
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
              <span style={{ marginLeft: 6, fontSize: '0.75rem' }}>{theme === 'dark' ? 'Light' : 'Dark'}</span>
            </button>
          </div>

          <Link href="/products" className={styles.mobileLink} onClick={closeMobile}>
            <ShoppingBag size={16} />
            Hardware Catalog
          </Link>
          {user && (
            <Link href="/wishlist" className={styles.mobileLink} onClick={closeMobile}>
              <Heart size={16} />
              Saved Items
            </Link>
          )}
          <Link href="/cart" className={styles.mobileLink} onClick={closeMobile}>
            <ShoppingCart size={16} />
            Cart {itemCount > 0 && <span className={styles.badge} style={{ position: 'static', marginLeft: 'auto' }}>{itemCount}</span>}
          </Link>
          {user && (
            <>
              <Link href="/orders" className={styles.mobileLink} onClick={closeMobile}>
                Orders & Invoices
              </Link>
              <Link href="/profile" className={styles.mobileLink} onClick={closeMobile}>
                <User size={16} />
                Profile Settings
              </Link>
            </>
          )}
          {user?.role === 'ADMIN' && (
            <Link href="/admin" className={`${styles.mobileLink} ${styles.adminLink}`} onClick={closeMobile}>
              <LayoutDashboard size={16} />
              Admin Portal
            </Link>
          )}

          <div className={styles.mobileDivider} />

          {user ? (
            <button onClick={() => { logout(); closeMobile(); }} className={styles.mobileLogout}>
              <LogOut size={16} />
              Sign Out
            </button>
          ) : (
            <div className={styles.mobileAuthBtns}>
              <Link href="/login" className="btn-secondary w-full" onClick={closeMobile}>
                Sign In
              </Link>
              <Link href="/register" className="btn-primary w-full" onClick={closeMobile}>
                Get Started
              </Link>
            </div>
          )}
        </nav>
      </div>
    </>
  );
};

export default NavBar;
