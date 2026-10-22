'use client';

import React, { useState } from 'react';
import { Tag, CheckCircle2, ChevronDown, ChevronUp, Sparkles, X } from 'lucide-react';
import { AVAILABLE_COUPONS, Coupon, calculateDiscount } from '../data/coupons';
import { formatPrice } from '../utils/format';
import styles from './CouponSection.module.css';

interface CouponSectionProps {
  subtotal: number;
  appliedCoupon: Coupon | null;
  onApplyCoupon: (coupon: Coupon) => void;
  onRemoveCoupon: () => void;
}

export const CouponSection: React.FC<CouponSectionProps> = ({
  subtotal,
  appliedCoupon,
  onApplyCoupon,
  onRemoveCoupon
}) => {
  const [inputCode, setInputCode] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [showOffers, setShowOffers] = useState(false);

  const handleApply = (codeToApply?: string) => {
    setErrorMsg('');
    const code = (codeToApply || inputCode).trim().toUpperCase();

    if (!code) {
      setErrorMsg('Please enter a coupon code');
      return;
    }

    const found = AVAILABLE_COUPONS.find((c) => c.code === code);
    if (!found) {
      setErrorMsg(`Code "${code}" is invalid or expired`);
      return;
    }

    if (subtotal < found.minOrderValue) {
      setErrorMsg(
        `Minimum order value for ${found.code} is ${formatPrice(found.minOrderValue)} (Current: ${formatPrice(subtotal)})`
      );
      return;
    }

    onApplyCoupon(found);
    setInputCode('');
  };

  const discountAmount = appliedCoupon ? calculateDiscount(appliedCoupon, subtotal) : 0;

  return (
    <div className={styles.couponContainer}>
      {appliedCoupon ? (
        <div className={styles.appliedBadge}>
          <div className={styles.appliedInfo}>
            <Tag size={18} className={styles.tagIcon} />
            <div>
              <div className={styles.appliedCode}>{appliedCoupon.code} Applied!</div>
              <div className={styles.appliedSavings}>
                You save {formatPrice(discountAmount)} on this order
              </div>
            </div>
          </div>
          <button
            type="button"
            className={styles.removeBtn}
            onClick={onRemoveCoupon}
            title="Remove coupon"
          >
            <X size={14} style={{ display: 'inline', marginRight: 4 }} />
            Remove
          </button>
        </div>
      ) : (
        <>
          <div className={styles.promoInputGroup}>
            <input
              type="text"
              placeholder="ENTER PROMO CODE"
              className={styles.promoInput}
              value={inputCode}
              onChange={(e) => {
                setInputCode(e.target.value);
                if (errorMsg) setErrorMsg('');
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleApply();
                }
              }}
            />
            <button
              type="button"
              className={styles.applyBtn}
              onClick={() => handleApply()}
              disabled={!inputCode.trim()}
            >
              Apply
            </button>
          </div>

          {errorMsg && <div className={styles.errorText}>{errorMsg}</div>}

          <button
            type="button"
            className={styles.toggleOffersBtn}
            onClick={() => setShowOffers((prev) => !prev)}
          >
            <Sparkles size={14} />
            {showOffers ? 'Hide Available Coupons' : 'View Available Coupons'}
            {showOffers ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>

          {showOffers && (
            <div className={styles.offersList}>
              {AVAILABLE_COUPONS.map((coupon) => {
                const isEligible = subtotal >= coupon.minOrderValue;
                const potentialSavings = calculateDiscount(coupon, subtotal);

                return (
                  <div key={coupon.code} className={styles.offerCard}>
                    <div className={styles.offerLeft}>
                      <span className={styles.offerCode}>{coupon.code}</span>
                      <span className={styles.offerDesc}>{coupon.description}</span>
                    </div>
                    <button
                      type="button"
                      className={styles.applyOfferBtn}
                      disabled={!isEligible}
                      onClick={() => handleApply(coupon.code)}
                      title={isEligible ? `Save ${formatPrice(potentialSavings)}` : `Min order ${formatPrice(coupon.minOrderValue)} required`}
                    >
                      {isEligible ? 'Apply' : `Min ${formatPrice(coupon.minOrderValue)}`}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
};
