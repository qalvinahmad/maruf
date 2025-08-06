// Hijri Calendar Utility using Aladhan API
// This utility provides functions to convert Gregorian dates to Hijri dates
// using the reliable Aladhan API service.

import React from 'react';

let hijriCache = new Map();

/**
 * Convert Gregorian date to Hijri date using Aladhan API
 * @param {Date|string} gregorianDate - The Gregorian date to convert
 * @returns {Promise<string>} - Formatted Hijri date string
 */
export const convertToHijri = async (gregorianDate) => {
  try {
    const date = new Date(gregorianDate);
    
    // Validate date
    if (isNaN(date.getTime())) {
      console.warn('Invalid date provided to convertToHijri:', gregorianDate);
      return '';
    }

    const dateKey = date.toISOString().split('T')[0]; // YYYY-MM-DD format
    
    // Check cache first to avoid unnecessary API calls
    if (hijriCache.has(dateKey)) {
      return hijriCache.get(dateKey);
    }

    try {
      // Fetch from Aladhan API with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
      
      const response = await fetch(`https://api.aladhan.com/v1/gToH/${dateKey}`, {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        console.warn(`Hijri API request failed with status: ${response.status}`);
        return '~ Hijriyah'; // Return fallback instead of throwing
      }

      const data = await response.json();
      
      if (data.code === 200 && data.data && data.data.hijri) {
        const { hijri } = data.data;
        const formattedDate = `${hijri.day} ${hijri.month.en} ${hijri.year} H`;
        
        // Cache the result to improve performance
        hijriCache.set(dateKey, formattedDate);
        
        return formattedDate;
      } else {
        console.warn('Invalid response from Aladhan API:', data);
        return '~ Hijriyah';
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        console.warn('Hijri API request timeout');
      } else {
        console.warn('Error fetching Hijri date:', error.message);
      }
      return '~ Hijriyah'; // Return fallback on any error
    }
  } catch (error) {
    console.error('Error in convertToHijri function:', error);
    return '~ Hijriyah';
  }
};

/**
 * Convert Gregorian date to Hijri date with Arabic month names
 * @param {Date|string} gregorianDate - The Gregorian date to convert
 * @returns {Promise<string>} - Formatted Hijri date string with Arabic month
 */
export const convertToHijriArabic = async (gregorianDate) => {
  try {
    const date = new Date(gregorianDate);
    
    if (isNaN(date.getTime())) {
      return '';
    }

    const dateKey = date.toISOString().split('T')[0];
    const cacheKey = `${dateKey}_ar`;
    
    if (hijriCache.has(cacheKey)) {
      return hijriCache.get(cacheKey);
    }

    const response = await fetch(`https://api.aladhan.com/v1/gToH/${dateKey}`);
    
    if (!response.ok) {
      throw new Error(`API request failed with status: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.code === 200 && data.data && data.data.hijri) {
      const { hijri } = data.data;
      const formattedDate = `${hijri.day} ${hijri.month.ar} ${hijri.year} هـ`;
      
      hijriCache.set(cacheKey, formattedDate);
      return formattedDate;
    } else {
      return '~ هجري';
    }
  } catch (error) {
    console.error('Error converting to Hijri date (Arabic):', error);
    return '~ هجري';
  }
};

/**
 * Get current Hijri date
 * @returns {Promise<string>} - Current Hijri date string
 */
export const getCurrentHijriDate = async () => {
  return await convertToHijri(new Date());
};

/**
 * Get current Hijri date with Arabic month names
 * @returns {Promise<string>} - Current Hijri date string with Arabic month
 */
export const getCurrentHijriDateArabic = async () => {
  return await convertToHijriArabic(new Date());
};

/**
 * Clear the Hijri date cache
 * Useful for forcing fresh API calls or managing memory
 */
export const clearHijriCache = () => {
  hijriCache.clear();
};

/**
 * Get cache size for debugging purposes
 * @returns {number} - Number of cached entries
 */
export const getHijriCacheSize = () => {
  return hijriCache.size;
};

/**
 * Batch convert multiple dates to Hijri
 * @param {Array<Date|string>} dates - Array of dates to convert
 * @returns {Promise<Array<string>>} - Array of formatted Hijri date strings
 */
export const batchConvertToHijri = async (dates) => {
  const promises = dates.map(date => convertToHijri(date));
  return await Promise.all(promises);
};

/**
 * Hook for React components to use Hijri calendar functionality
 * @returns {Object} - Object containing Hijri calendar functions and state
 */
export const useHijriCalendar = () => {
  const [currentHijriDate, setCurrentHijriDate] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);

  const fetchCurrentHijriDate = async () => {
    try {
      setLoading(true);
      setError(null);
      const hijriDate = await getCurrentHijriDate();
      setCurrentHijriDate(hijriDate);
    } catch (err) {
      setError(err);
      console.error('Error fetching current Hijri date:', err);
    } finally {
      setLoading(false);
    }
  };

  const convertDate = async (date) => {
    try {
      setLoading(true);
      setError(null);
      return await convertToHijri(date);
    } catch (err) {
      setError(err);
      console.error('Error converting date:', err);
      return '';
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchCurrentHijriDate();
  }, []);

  return {
    currentHijriDate,
    loading,
    error,
    convertDate,
    convertToHijri,
    convertToHijriArabic,
    getCurrentHijriDate,
    getCurrentHijriDateArabic,
    refreshCurrentDate: fetchCurrentHijriDate
  };
};

export default {
  convertToHijri,
  convertToHijriArabic,
  getCurrentHijriDate,
  getCurrentHijriDateArabic,
  clearHijriCache,
  getHijriCacheSize,
  batchConvertToHijri,
  useHijriCalendar
};
