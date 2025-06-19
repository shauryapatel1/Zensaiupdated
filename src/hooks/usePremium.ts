import { useState, useCallback } from 'react';
import { useJournal } from './useJournal';
import { safeStorage, ErrorCode, createAppError } from '../types/errors';

/**
 * Interface for upsell modal content
 * @interface UpsellModalContent
 */
export interface UpsellModalContent {
  featureName: string;
  featureDescription: string;
}

/**
 * Custom hook for managing premium features and upsell functionality
 * 
 * @returns {Object} Premium state and methods
 * 
 * @example
 * const { 
 *   isPremium, 
 *   showUpsellModal, 
 *   hideUpsellModal,
 *   trackFeatureUsage
 * } = usePremium();
 */
export function usePremium() {
  const { profile } = useJournal();
  const [isUpsellModalOpen, setIsUpsellModalOpen] = useState(false);
  const [upsellContent, setUpsellContent] = useState<UpsellModalContent>({
    featureName: 'Premium Feature',
    featureDescription: 'Upgrade to Zensai Premium to unlock this feature and many more!'
  });

  /**
   * Check if user has premium subscription
   */
  const isPremium = profile?.subscription_status === 'premium';
  
  /**
   * Check if user has premium plus (yearly) subscription
   */
  const isPremiumPlus = isPremium && profile?.subscription_tier === 'premium_plus';
  
  /**
   * Get subscription expiry date if available
   */
  const subscriptionExpiresAt = profile?.subscription_expires_at 
    ? new Date(profile.subscription_expires_at) 
    : null;

  /**
   * Show upsell modal with custom content
   * 
   * @param {Partial<UpsellModalContent>} content - Custom content for the modal
   */
  const showUpsellModal = useCallback((content: Partial<UpsellModalContent> = {}) => {
    setUpsellContent(prev => ({
      featureName: content.featureName || prev.featureName,
      featureDescription: content.featureDescription || prev.featureDescription
    }));
    setIsUpsellModalOpen(true);
  }, []);

  /**
   * Hide upsell modal
   */
  const hideUpsellModal = useCallback(() => {
    setIsUpsellModalOpen(false);
  }, []);

  /**
   * Check if a feature is available based on subscription status
   * 
   * @param {string} featureName - Name of the feature to check
   * @returns {boolean} Whether the feature is available
   */
  const canUseFeature = useCallback((featureName: string): boolean => {
    // Free features available to everyone
    const freeFeatures = [
      'basic-journaling',
      'mood-tracking',
      'basic-ai-insights',
      'streak-tracking',
      'common-badges'
    ];

    if (freeFeatures.includes(featureName)) {
      return true;
    }

    // Premium features require subscription
    return isPremium;
  }, [isPremium]);

  /**
   * Track feature usage for free users (for daily limits)
   * Premium users always return true (unlimited usage)
   * Free users are limited based on the specified limit
   * 
   * @param {string} featureKey - Key identifying the feature
   * @param {number} [limit=2] - Daily usage limit for free users
   * @returns {boolean} Whether the feature can be used
   */
  const trackFeatureUsage = useCallback((featureKey: string, limit: number = 2): boolean => {
    if (isPremium) return true; // Premium users have unlimited usage

    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const storageKey = `zensai-feature-${featureKey}-${today}`;
    
    // Get current usage
    const currentUsage = parseInt(safeStorage.getItem(storageKey, '0'), 10);
    
    // Check if limit reached
    if (currentUsage >= limit) {
      return false;
    }
    
    // Increment usage
    safeStorage.setItem(storageKey, (currentUsage + 1).toString());
    return true;
  }, [isPremium]);

  return {
    isPremium,
    isPremiumPlus,
    subscriptionExpiresAt,
    isUpsellModalOpen,
    upsellContent,
    showUpsellModal,
    hideUpsellModal,
    canUseFeature,
    trackFeatureUsage
  };
}