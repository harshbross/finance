import React from 'react';
import Link from 'next/link';
import { ShoppingBag } from 'lucide-react';
import styles from './Footer.module.css';

const Footer: React.FC = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.grid}>
          {/* Brand */}
          <div className={styles.brandCol}>
            <Link href="/" className={styles.logo}>
              <ShoppingBag size={20} className={styles.logoIcon} />
              <span>AETHER<span className="gradient-text">SHOP</span></span>
            </Link>
            <p className={styles.brandText}>
              Curated collection of premium tech and lifestyle products. Elevating your everyday experience.
            </p>
          </div>

          {/* Quick Links */}
          <div className={styles.linkCol}>
            <h4 className={styles.colTitle}>Shop</h4>
            <Link href="/products" className={styles.link}>All Products</Link>
            <Link href="/cart" className={styles.link}>Cart</Link>
            <Link href="/orders" className={styles.link}>Orders</Link>
          </div>

          {/* Account */}
          <div className={styles.linkCol}>
            <h4 className={styles.colTitle}>Account</h4>
            <Link href="/profile" className={styles.link}>Profile</Link>
            <Link href="/login" className={styles.link}>Sign In</Link>
            <Link href="/register" className={styles.link}>Register</Link>
          </div>

          {/* Info */}
          <div className={styles.linkCol}>
            <h4 className={styles.colTitle}>Info</h4>
            <span className={styles.infoText}>Free Delivery Worldwide</span>
            <span className={styles.infoText}>30-Day Return Policy</span>
            <span className={styles.infoText}>Secure Payment</span>
          </div>
        </div>

        <div className={styles.divider} />

        <div className={styles.bottom}>
          <p className={styles.copyright}>
            &copy; {new Date().getFullYear()} Aether Shop. Built with Next.js, Express & Prisma.
          </p>
          <div className={styles.bottomLinks}>
            <span className={styles.bottomLink}>Privacy</span>
            <span className={styles.bottomLink}>Terms</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
