/**
 * Format a number with spaces as thousands separators
 * @param {number} num - The number to format
 * @return {string} The formatted number with spaces
 */
export const formatNumber = (num) => {
  if (num === null || num === undefined) return '0';
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
};
