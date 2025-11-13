import CryptoJS from 'crypto-js';

// Hash password using SHA-256 before sending to backend
export const hashPassword = (password: string): string => {
  return CryptoJS.SHA256(password).toString();
};

// Generate a salt for password hashing
export const generateSalt = (): string => {
  return CryptoJS.lib.WordArray.random(128/8).toString();
};

// Hash password with salt
export const hashPasswordWithSalt = (password: string, salt: string): string => {
  return CryptoJS.SHA256(password + salt).toString();
};