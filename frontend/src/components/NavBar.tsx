'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { ShoppingCart, User, LogOut, LayoutDashboard, ShoppingBag } from 'lucide-react';
import styles from './NavBar.module.css';

const NavBar: React.FC = () => {
  const { user, logout } = useAuth();
  const { itemCount } = useCart();

  return (
    <header className={`${styles.header} glass-panel`}>
      <div className={styles.navContainer}>
        <Link href="/" className={styles.logo}>
          <ShoppingBag className={styles.logoIcon} />
          <span>AETHER<span className="gradient-text">SHOP</span></span>
        </Link>

        <nav className={styles.navLinks}>
          <Link href="/products" className={styles.navLink}>
            Browse
          </Link>
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
              <Link href="/login" className="btn-secondary">
                Login
              </Link>
              <Link href="/register" className="btn-primary">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default NavBar;
