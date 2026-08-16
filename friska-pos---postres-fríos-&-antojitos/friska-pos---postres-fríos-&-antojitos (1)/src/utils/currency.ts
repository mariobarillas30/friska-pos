/**
 * Utility functions for currency rounding and formatting in Friska POS.
 * Prevents JavaScript floating-point representation anomalies (e.g., $1.7500000000000002).
 */

export const roundCurrency = (value: number | string | null | undefined): number => {
  const num = typeof value === 'string' ? parseFloat(value) : Number(value);
  if (isNaN(num) || !isFinite(num)) return 0;
  return Math.round((num + Number.EPSILON) * 100) / 100;
};

export const formatCurrency = (
  value: number | string | null | undefined,
  includeSymbol: boolean = true,
  currencySymbol: string = '$'
): string => {
  const rounded = roundCurrency(value);
  const formattedNumber = rounded.toFixed(2);
  return includeSymbol ? `${currencySymbol}${formattedNumber}` : formattedNumber;
};
