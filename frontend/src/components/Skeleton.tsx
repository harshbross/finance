import React from 'react';
import styles from './Skeleton.module.css';

interface SkeletonProps {
  width?: string;
  height?: string;
  borderRadius?: string;
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = '20px',
  borderRadius = 'var(--border-radius-sm)',
  className = '',
}) => (
  <div
    className={`${styles.skeleton} ${className}`}
    style={{ width, height, borderRadius }}
  />
);

export const ProductCardSkeleton: React.FC = () => (
  <div className={`glass-card ${styles.cardSkeleton}`}>
    <Skeleton height="220px" borderRadius="var(--border-radius-sm)" />
    <div style={{ padding: '16px' }}>
      <Skeleton width="60px" height="12px" />
      <Skeleton width="80%" height="20px" className={styles.mt12} />
      <Skeleton width="100%" height="14px" className={styles.mt8} />
      <Skeleton width="70%" height="14px" className={styles.mt4} />
      <div className={styles.footerSkeleton}>
        <Skeleton width="80px" height="24px" />
        <Skeleton width="70px" height="36px" borderRadius="8px" />
      </div>
    </div>
  </div>
);

export const ProductGridSkeleton: React.FC<{ count?: number }> = ({ count = 8 }) => (
  <div className={styles.productGrid}>
    {Array.from({ length: count }).map((_, i) => (
      <ProductCardSkeleton key={i} />
    ))}
  </div>
);

export const CartItemSkeleton: React.FC = () => (
  <div className={`glass-card ${styles.cartItemSkeleton}`}>
    <Skeleton width="80px" height="80px" borderRadius="var(--border-radius-sm)" />
    <div className={styles.cartItemInfo}>
      <Skeleton width="60%" height="18px" />
      <Skeleton width="80px" height="14px" className={styles.mt8} />
    </div>
    <Skeleton width="100px" height="36px" borderRadius="8px" />
    <Skeleton width="60px" height="18px" />
  </div>
);
