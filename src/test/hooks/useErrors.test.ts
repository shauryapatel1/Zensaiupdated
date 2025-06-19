import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ErrorCode, createAppError, getUserFriendlyErrorMessage, safeStorage } from '../../types/errors';

describe('Error utilities', () => {
  describe('createAppError', () => {
    it('creates an error object with the correct structure', () => {
      const error = createAppError(
        ErrorCode.VALIDATION_ERROR,
        'Validation failed',
        { field: 'email' },
        new Error('Invalid email')
      );
      
      expect(error).toEqual({
        code: ErrorCode.VALIDATION_ERROR,
        message: 'Validation failed',
        details: { field: 'email' },
        originalError: new Error('Invalid email')
      });
    });
    
    it('creates an error with minimal properties', () => {
      const error = createAppError(
        ErrorCode.UNKNOWN_ERROR,
        'Something went wrong'
      );
      
      expect(error).toEqual({
        code: ErrorCode.UNKNOWN_ERROR,
        message: 'Something went wrong',
        details: undefined,
        originalError: undefined
      });
    });
  });
  
  describe('getUserFriendlyErrorMessage', () => {
    it('extracts message from AppError', () => {
      const error = createAppError(
        ErrorCode.VALIDATION_ERROR,
        'Please enter a valid email address'
      );
      
      const message = getUserFriendlyErrorMessage(error);
      expect(message).toBe('Please enter a valid email address');
    });
    
    it('extracts message from Error object', () => {
      const error = new Error('Network request failed');
      const message = getUserFriendlyErrorMessage(error);
      expect(message).toBe('Network request failed');
    });
    
    it('handles string errors', () => {
      const message = getUserFriendlyErrorMessage('Something went wrong');
      expect(message).toBe('Something went wrong');
    });
    
    it('handles null or undefined', () => {
      expect(getUserFriendlyErrorMessage(null)).toBe('An unknown error occurred');
      expect(getUserFriendlyErrorMessage(undefined)).toBe('An unknown error occurred');
    });
    
    it('handles other types', () => {
      expect(getUserFriendlyErrorMessage(123)).toBe('An unexpected error occurred');
      expect(getUserFriendlyErrorMessage({})).toBe('An unexpected error occurred');
    });
  });
});

describe('safeStorage', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    
    // Spy on localStorage methods
    vi.spyOn(Storage.prototype, 'getItem');
    vi.spyOn(Storage.prototype, 'setItem');
    vi.spyOn(Storage.prototype, 'removeItem');
  });
  
  describe('getItem', () => {
    it('retrieves string values correctly', () => {
      localStorage.setItem('test-key', 'test-value');
      
      const result = safeStorage.getItem('test-key', 'default');
      expect(result).toBe('test-value');
      expect(localStorage.getItem).toHaveBeenCalledWith('test-key');
    });
    
    it('parses JSON values correctly', () => {
      localStorage.setItem('test-object', JSON.stringify({ foo: 'bar' }));
      
      const result = safeStorage.getItem('test-object', {});
      expect(result).toEqual({ foo: 'bar' });
    });
    
    it('returns default value for missing keys', () => {
      const result = safeStorage.getItem('missing-key', 'default-value');
      expect(result).toBe('default-value');
    });
    
    it('handles localStorage errors', () => {
      // Mock localStorage.getItem to throw an error
      Storage.prototype.getItem = vi.fn().mockImplementation(() => {
        throw new Error('Storage error');
      });
      
      const result = safeStorage.getItem('test-key', 'fallback');
      expect(result).toBe('fallback');
    });
  });
  
  describe('setItem', () => {
    it('stores string values correctly', () => {
      const result = safeStorage.setItem('test-key', 'test-value');
      
      expect(result).toBe(true);
      expect(localStorage.setItem).toHaveBeenCalledWith('test-key', 'test-value');
      expect(localStorage.getItem('test-key')).toBe('test-value');
    });
    
    it('stores and stringifies objects correctly', () => {
      const testObject = { foo: 'bar', num: 123 };
      const result = safeStorage.setItem('test-object', testObject);
      
      expect(result).toBe(true);
      expect(localStorage.setItem).toHaveBeenCalledWith('test-object', JSON.stringify(testObject));
      expect(JSON.parse(localStorage.getItem('test-object') || '{}')).toEqual(testObject);
    });
    
    it('handles localStorage errors', () => {
      // Mock localStorage.setItem to throw an error
      Storage.prototype.setItem = vi.fn().mockImplementation(() => {
        throw new Error('Storage error');
      });
      
      const result = safeStorage.setItem('test-key', 'test-value');
      expect(result).toBe(false);
    });
  });
  
  describe('removeItem', () => {
    it('removes items correctly', () => {
      // Set up an item
      localStorage.setItem('test-key', 'test-value');
      
      const result = safeStorage.removeItem('test-key');
      
      expect(result).toBe(true);
      expect(localStorage.removeItem).toHaveBeenCalledWith('test-key');
      expect(localStorage.getItem('test-key')).toBeNull();
    });
    
    it('handles localStorage errors', () => {
      // Mock localStorage.removeItem to throw an error
      Storage.prototype.removeItem = vi.fn().mockImplementation(() => {
        throw new Error('Storage error');
      });
      
      const result = safeStorage.removeItem('test-key');
      expect(result).toBe(false);
    });
  });
});