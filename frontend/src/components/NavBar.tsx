'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { ShoppingCart, User, LogOut, LayoutDashboard, ShoppingBag, Menu, X, Heart } from 'lucide-react';
import styles from './NavBar.module.css';

const NavBar: React.FC = () => {
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
      <header className={`${styles.header} ${scrolled ? styles.scrolled : ''}`}>
        <div className={styles.navContainer}>
          <Link href="/" className={styles.logo} onClick={closeMobile}>
            <ShoppingBag className={styles.logoIcon} />
            <span>AETHER<span className="gradient-text">SHOP</span></span>
          </Link>

          {/* Desktop Nav */}
          <nav className={styles.navLinks}>
            <Link href="/products" className={styles.navLink}>
              Browse
            </Link>
            {user && (
              <Link href="/wishlist" className={styles.navLink}>
                <Heart size={16} />
                Wishlist
              </Link>
            )}
            {user?.role === 'ADMIN' && (
              <Link href="/admin" className={`${styles.navLink} ${styles.adminLink}`}>
                <LayoutDashboard size={18} />
                Dashboard
              </Link>
            )}
          </nav>

          <div className={styles.actions}>
            {user ? (
              <>
                <Link href="/cart" className={styles.cartBtn}>
                  <ShoppingCart size={20} />
                  {itemCount > 0 && <span className={styles.badge}>{itemCount}</span>}
                </Link>
                <Link href="/profile" className={styles.profileBtn} title="View Profile">
                  <User size={20} />
                  <span className={styles.userName}>{user.name}</span>
                </Link>
                <button onClick={logout} className={styles.logoutBtn} title="Logout">
                  <LogOut size={20} />
                </button>
              </>
            ) : (
              <>
                <Link href="/cart" className={styles.cartBtn}>
                  <ShoppingCart size={20} />
                </Link>
                <Link href="/login" className="btn-secondary" style={{ padding: '8px 18px', fontSize: '0.9rem' }}>
                  Login
                </Link>
                <Link href="/register" className="btn-primary" style={{ padding: '8px 18px', fontSize: '0.9rem' }}>
                  Register
                </Link>
              </>
            )}

            {/* Mobile Hamburger */}
            <button
              className={styles.hamburger}
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle mobile menu"
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Overlay */}
      {mobileOpen && <div className={styles.overlay} onClick={closeMobile} />}

      {/* Mobile Drawer */}
      <div className={`${styles.mobileDrawer} ${mobileOpen ? styles.drawerOpen : ''}`}>
        <nav className={styles.mobileNav}>
          <Link href="/products" className={styles.mobileLink} onClick={closeMobile}>
            <ShoppingBag size={18} />
            Browse Products
          </Link>
          {user && (
            <Link href="/wishlist" className={styles.mobileLink} onClick={closeMobile}>
              <Heart size={18} />
              Wishlist
            </Link>
          )}
          <Link href="/cart" className={styles.mobileLink} onClick={closeMobile}>
            <ShoppingCart size={18} />
            Cart {itemCount > 0 && <span className={styles.mobileBadge}>{itemCount}</span>}
          </Link>
          {user && (
            <>
              <Link href="/orders" className={styles.mobileLink} onClick={closeMobile}>
                Orders
              </Link>
              <Link href="/profile" className={styles.mobileLink} onClick={closeMobile}>
                <User size={18} />
                Profile
              </Link>
            </>
          )}
          {user?.role === 'ADMIN' && (
            <Link href="/admin" className={`${styles.mobileLink} ${styles.mobileAdmin}`} onClick={closeMobile}>
              <LayoutDashboard size={18} />
              Admin Dashboard
            </Link>
          )}

          <div className={styles.mobileDivider} />

          {user ? (
            <button onClick={() => { logout(); closeMobile(); }} className={styles.mobileLogout}>
              <LogOut size={18} />
              Sign Out
            </button>
          ) : (
            <div className={styles.mobileAuthBtns}>
              <Link href="/login" className="btn-secondary w-full" style={{ justifyContent: 'center' }} onClick={closeMobile}>
                Login
              </Link>
              <Link href="/register" className="btn-primary w-full" style={{ justifyContent: 'center' }} onClick={closeMobile}>
                Register
              </Link>
            </div>
          )}
        </nav>
      </div>
    </>
  );
};

export default NavBar;
