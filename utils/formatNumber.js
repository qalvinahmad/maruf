/**
 * Format a number with spaces as thousands separators
 * @param {number} num - The number to format
 * @return {string} The formatted number with spaces
 */
export const formatNumber = (num) => {
  if (num === null || num === undefined) return '0';
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
  }
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
};
