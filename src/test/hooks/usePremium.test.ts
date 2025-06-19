import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePremium } from '../../hooks/usePremium';
import { safeStorage } from '../../types/errors';

// Mock dependencies
vi.mock('../../hooks/useJournal', () => ({
  useJournal: () => ({
    profile: { subscription_status: 'free' }
  })
}));

// Mock safeStorage
vi.mock('../../types/errors', async () => {
  const actual = await vi.importActual('../../types/errors');
  return {
    ...actual,
    safeStorage: {
      getItem: vi.fn().mockImplementation((key, defaultValue) => defaultValue),
      setItem: vi.fn().mockReturnValue(true),
      removeItem: vi.fn().mockReturnValue(true)
    }
  };
});

describe('usePremium', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return isPremium as false for free users', () => {
    const { result } = renderHook(() => usePremium());
    expect(result.current.isPremium).toBe(false);
  });

  it('should track feature usage for free users', () => {
    const { result } = renderHook(() => usePremium());
    
    // First usage should return true
    act(() => {
      const canUse = result.current.trackFeatureUsage('test-feature');
      expect(canUse).toBe(true);
      expect(safeStorage.setItem).toHaveBeenCalledWith(expect.stringContaining('test-feature'), '1');
    });
  });

  it('should show and hide upsell modal', () => {
    const { result } = renderHook(() => usePremium());
    
    // Initially modal should be closed
    expect(result.current.isUpsellModalOpen).toBe(false);
    
    // Show modal
    act(() => {
      result.current.showUpsellModal({
        featureName: 'Test Feature',
        featureDescription: 'This is a test feature'
      });
    });
    
    // Modal should be open with correct content
    expect(result.current.isUpsellModalOpen).toBe(true);
    expect(result.current.upsellContent.featureName).toBe('Test Feature');
    expect(result.current.upsellContent.featureDescription).toBe('This is a test feature');
    
    // Hide modal
    act(() => {
      result.current.hideUpsellModal();
    });
    
    // Modal should be closed
    expect(result.current.isUpsellModalOpen).toBe(false);
  });

  it('should determine if a feature is available based on subscription status', () => {
    const { result } = renderHook(() => usePremium());
    
    // Free features should be available to everyone
    expect(result.current.canUseFeature('basic-journaling')).toBe(true);
    expect(result.current.canUseFeature('mood-tracking')).toBe(true);
    
    // Premium features should not be available to free users
    expect(result.current.canUseFeature('premium-feature')).toBe(false);
  });
});

// Test with premium user
describe('usePremium with premium user', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock premium user
    vi.mock('../../hooks/useJournal', () => ({
      useJournal: () => ({
        profile: { subscription_status: 'premium', subscription_tier: 'premium_plus' }
      })
    }));
  });

  afterEach(() => {
    // Reset to free user for other tests
    vi.mock('../../hooks/useJournal', () => ({
      useJournal: () => ({
        profile: { subscription_status: 'free' }
      })
    }));
  });

  it('should return isPremium as true for premium users', () => {
    const { result } = renderHook(() => usePremium());
    expect(result.current.isPremium).toBe(true);
    expect(result.current.isPremiumPlus).toBe(true);
  });

  it('should always allow feature usage for premium users', () => {
    const { result } = renderHook(() => usePremium());
    
    // Premium users should always have access
    act(() => {
      const canUse = result.current.trackFeatureUsage('test-feature');
      expect(canUse).toBe(true);
      // Should not increment usage counter for premium users
      expect(safeStorage.setItem).not.toHaveBeenCalled();
    });
  });

  it('should allow access to all features for premium users', () => {
    const { result } = renderHook(() => usePremium());
    
    // All features should be available to premium users
    expect(result.current.canUseFeature('basic-journaling')).toBe(true);
    expect(result.current.canUseFeature('premium-feature')).toBe(true);
  });
});