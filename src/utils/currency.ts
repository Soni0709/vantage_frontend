/**
 * Currency formatting utilities for Indian Rupees
 */

/**
 * Formats a number in Indian Rupee format with proper lakhs/crores notation
 * @param amount - The amount to format
 * @param includeDecimals - Whether to include decimal places (default: true)
 * @returns Formatted string with ₹ symbol
 * 
 * Examples:
 * formatINR(1000) => "₹1,000"
 * formatINR(100000) => "₹1,00,000"
 * formatINR(10000000) => "₹1,00,00,000"
 * formatINR(1234.56) => "₹1,234.56"
 */
export const formatINR = (amount: number, includeDecimals: boolean = true): string => {
  // Handle negative numbers
  const isNegative = amount < 0;
  const absoluteAmount = Math.abs(amount);
  
  // Format with proper decimal places
  const fixedAmount = includeDecimals 
    ? absoluteAmount.toFixed(2) 
    : Math.round(absoluteAmount).toString();
  
  // Split into integer and decimal parts
  const [integerPart, decimalPart] = fixedAmount.split('.');
  
  // Indian number system formatting
  // Last 3 digits
  let lastThree = integerPart.substring(integerPart.length - 3);
  // Remaining digits
  let otherNumbers = integerPart.substring(0, integerPart.length - 3);
  
  // Add commas every 2 digits for the remaining part
  if (otherNumbers !== '') {
    lastThree = ',' + lastThree;
  }
  
  // Format other numbers with commas every 2 digits
  const formattedOtherNumbers = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',');
  
  // Combine all parts
  let formatted = formattedOtherNumbers + lastThree;
  
  // Add decimal part if needed
  if (includeDecimals && decimalPart) {
    formatted += '.' + decimalPart;
  }
  
  // Add currency symbol and negative sign if needed
  return (isNegative ? '-' : '') + '₹' + formatted;
};

/**
 * Formats currency with words for better readability
 * @param amount - The amount to format
 * @returns Formatted string with K/L/Cr suffix
 * 
 * Examples:
 * formatINRCompact(1500) => "₹1.5K"
 * formatINRCompact(150000) => "₹1.5L"
 * formatINRCompact(15000000) => "₹1.5Cr"
 */
export const formatINRCompact = (amount: number): string => {
  const isNegative = amount < 0;
  const absoluteAmount = Math.abs(amount);
  
  let formatted: string;
  
  if (absoluteAmount >= 10000000) {
    // Crores (1 Crore = 10 Million)
    formatted = '₹' + (absoluteAmount / 10000000).toFixed(2) + ' Cr';
  } else if (absoluteAmount >= 100000) {
    // Lakhs (1 Lakh = 100 Thousand)
    formatted = '₹' + (absoluteAmount / 100000).toFixed(2) + ' L';
  } else if (absoluteAmount >= 1000) {
    // Thousands
    formatted = '₹' + (absoluteAmount / 1000).toFixed(2) + ' K';
  } else {
    formatted = formatINR(absoluteAmount, true);
  }
  
  return (isNegative ? '-' : '') + formatted;
};

/**
 * Converts dollar amounts to INR (mock conversion for demo)
 * In production, this should use a real exchange rate API
 * @param dollarAmount - Amount in USD
 * @param exchangeRate - USD to INR exchange rate (default: 83)
 * @returns Amount in INR
 */
export const convertUSDtoINR = (dollarAmount: number, exchangeRate: number = 83): number => {
  return dollarAmount * exchangeRate;
};

/**
 * Format percentage with proper sign and symbol
 * @param percentage - The percentage value
 * @param includeSign - Whether to include + for positive values
 * @returns Formatted percentage string
 */
export const formatPercentage = (percentage: number, includeSign: boolean = true): string => {
  const sign = percentage > 0 && includeSign ? '+' : '';
  return `${sign}${percentage.toFixed(1)}%`;
};
