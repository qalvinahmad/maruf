import DOMPurify from 'dompurify';
import { verify } from 'jsonwebtoken';

// Rate limiting map
const requestMap = new Map();

// Input validation patterns
const patterns = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  username: /^[a-zA-Z0-9_]{3,20}$/,
  password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
};

// Sanitize input
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  return DOMPurify.sanitize(input.trim());
};

// Validate email
export const isValidEmail = (email) => {
  return patterns.email.test(email);
};

// Validate username
export const isValidUsername = (username) => {
  return patterns.username.test(username);
};

// Validate password strength
export const isValidPassword = (password) => {
  return patterns.password.test(password);
};

// Rate limiting function
export const checkRateLimit = (ip, limit = 5, windowMs = 60000) => {
  const now = Date.now();
  const userRequests = requestMap.get(ip) || [];
  
  // Clean old requests
  const validRequests = userRequests.filter(time => now - time < windowMs);
  
  if (validRequests.length >= limit) {
    return false;
  }
  
  validRequests.push(now);
  requestMap.set(ip, validRequests);
  return true;
};

// CSRF token validation
export const validateCSRFToken = (token, secret) => {
  try {
    verify(token, secret);
    return true;
  } catch {
    return false;
  }
};

// Form validation with error messages
export const validateForm = (data, rules) => {
  const errors = {};

  Object.keys(rules).forEach(field => {
    const value = data[field];
    const rule = rules[field];

    // Required field check
    if (rule.required && !value) {
      errors[field] = 'Bidang ini wajib diisi';
      return;
    }

    // Pattern check
    if (rule.pattern && !rule.pattern.test(value)) {
      errors[field] = rule.message || 'Format tidak valid';
      return;
    }

    // Min length check
    if (rule.minLength && value.length < rule.minLength) {
      errors[field] = `Minimal ${rule.minLength} karakter`;
      return;
    }

    // Max length check
    if (rule.maxLength && value.length > rule.maxLength) {
      errors[field] = `Maksimal ${rule.maxLength} karakter`;
      return;
    }
  });

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// SQL Injection prevention
export const escapeSQLInput = (input) => {
  if (typeof input !== 'string') return input;
  return input.replace(/[\0\x08\x09\x1a\n\r"'\\\%]/g, char => {
    switch (char) {
      case "\0":
        return "\\0";
      case "\x08":
        return "\\b";
      case "\x09":
        return "\\t";
      case "\x1a":
        return "\\z";
      case "\n":
        return "\\n";
      case "\r":
        return "\\r";
      case "\"":
      case "'":
      case "\\":
      case "%":
        return "\\"+char;
      default:
        return char;
    }
  });
};

// XSS Prevention Middleware
export const xssMiddleware = (req, res, next) => {
  if (req.body) {
    Object.keys(req.body).forEach(key => {
      if (typeof req.body[key] === 'string') {
        req.body[key] = sanitizeInput(req.body[key]);
      }
    });
  }
  if (next) next();
};
