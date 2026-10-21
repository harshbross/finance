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
              <ShoppingBag size={18} className={styles.logoIcon} />
              <span>LEDGER<span style={{ color: 'var(--accent-primary)', marginLeft: 3 }}>OPS</span></span>
            </Link>
            <p className={styles.brandText}>
              Enterprise hardware procurement, high-reliability workstation systems, and logistics operations.
            </p>
            <div className={styles.statusIndicator}>
              <span className={styles.statusDot} />
              <span>All procurement systems operational</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className={styles.linkCol}>
            <h4 className={styles.colTitle}>Catalog</h4>
            <Link href="/products" className={styles.link}>All Hardware</Link>
            <Link href="/products?category=1" className={styles.link}>Workstations</Link>
            <Link href="/products?category=2" className={styles.link}>Peripherals</Link>
            <Link href="/cart" className={styles.link}>Order Manifest</Link>
          </div>

          {/* Operations */}
          <div className={styles.linkCol}>
            <h4 className={styles.colTitle}>Operations</h4>
            <Link href="/orders" className={styles.link}>Track Shipments</Link>
            <Link href="/profile" className={styles.link}>Corporate Account</Link>
            <Link href="/admin" className={styles.link}>Inventory Portal</Link>
          </div>

          {/* SLA */}
          <div className={styles.linkCol}>
            <h4 className={styles.colTitle}>Assurance</h4>
            <span className={styles.infoText}>24h Expedited Dispatch</span>
            <span className={styles.infoText}>30-Day Evaluation RMA</span>
            <span className={styles.infoText}>PCI-DSS Level 1 Encrypted</span>
          </div>
        </div>

        <div className={styles.divider} />

        <div className={styles.bottom}>
          <p className={styles.copyright}>
            &copy; {new Date().getFullYear()} Ledger Ops Inc. Enterprise Commerce & Systems.
          </p>
          <div className={styles.bottomLinks}>
            <span className={styles.bottomLink}>Security Policy</span>
            <span className={styles.bottomLink}>Terms of Service</span>
            <span className={styles.bottomLink}>Procurement SLA</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
