export interface Coupon {
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number; // percentage (e.g. 10 for 10%) or fixed INR amount (e.g. 500)
  minOrderValue: number;
  maxDiscount?: number; // max discount in INR for percentage
  title: string;
  description: string;
}

export const AVAILABLE_COUPONS: Coupon[] = [
  {
    code: 'WELCOME10',
    discountType: 'percentage',
    discountValue: 10,
    minOrderValue: 500,
    maxDiscount: 1500,
    title: 'Welcome 10% Off',
    description: '10% off on your order above ₹500 (Max discount ₹1,500)'
  },
  {
    code: 'FESTIVE25',
    discountType: 'percentage',
    discountValue: 25,
    minOrderValue: 2000,
    maxDiscount: 2500,
    title: 'Festive Mega 25% Off',
    description: '25% off on luxury & premium orders above ₹2,000 (Max discount ₹2,500)'
  },
  {
    code: 'SUPER500',
    discountType: 'fixed',
    discountValue: 500,
    minOrderValue: 3500,
    title: 'Flat ₹500 Off',
    description: 'Instant flat ₹500 discount on orders above ₹3,500'
  },
  {
    code: 'FREESHIP',
    discountType: 'fixed',
    discountValue: 199,
    minOrderValue: 0,
    title: 'Free Express Care',
    description: 'Flat ₹199 discount waiver for priority express handling'
  }
];

export function calculateDiscount(coupon: Coupon, subtotal: number): number {
  if (subtotal < coupon.minOrderValue) {
    return 0;
  }

  if (coupon.discountType === 'percentage') {
    const rawDiscount = (subtotal * coupon.discountValue) / 100;
    if (coupon.maxDiscount && rawDiscount > coupon.maxDiscount) {
      return Math.round(coupon.maxDiscount);
    }
    return Math.round(rawDiscount);
  }

  // Fixed
  return Math.min(coupon.discountValue, subtotal);
}
