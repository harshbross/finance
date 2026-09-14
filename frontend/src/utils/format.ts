/**
 * Formats a numeric price into Indian Rupees (INR) with Indian numbering format (e.g. ₹1,24,999)
 */
export const formatPrice = (amount: number | undefined | null): string => {
  if (amount === undefined || amount === null || isNaN(amount)) return '₹0';
  return `₹${Math.round(amount).toLocaleString('en-IN')}`;
};
