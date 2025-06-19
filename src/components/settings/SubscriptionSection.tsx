import React from 'react';
import { motion } from 'framer-motion';
import { Crown } from 'lucide-react';
import { SETTINGS } from '../../constants/uiStrings';
import { useNavigate } from 'react-router-dom';

/**
 * SubscriptionSection - Displays the user's current subscription status and management options
 * 
 * @component
 * @param {string} subscriptionStatus - Current subscription status (free, premium, cancelled, expired)
 * @param {string} subscriptionTier - Subscription tier (free, premium, premium_plus)
 * @param {string|null} subscriptionExpiresAt - Date when subscription expires
 * 
 * @example
 * return (
 *   <SubscriptionSection
 *     subscriptionStatus="premium"
 *     subscriptionTier="premium_plus"
 *     subscriptionExpiresAt="2023-12-31T00:00:00Z"
 *   />
 * )
 */
interface SubscriptionSectionProps {
  subscriptionStatus: string;
  subscriptionTier: string;
  subscriptionExpiresAt: string | null;
}

const SubscriptionSection = React.memo(function SubscriptionSection({
  subscriptionStatus,
  subscriptionTier,
  subscriptionExpiresAt
}: SubscriptionSectionProps) {
  const navigate = useNavigate();
  
  const isPremium = subscriptionStatus === 'premium';
  const isYearlySubscriber = subscriptionTier === 'premium_plus';
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-3xl p-6 shadow-xl border border-white/20 dark:border-gray-600/20">
      <h3 className="text-lg font-display font-bold text-zen-sage-800 dark:text-gray-200 mb-4 flex items-center">
        <Crown className="w-5 h-5 mr-2 text-yellow-500" aria-hidden="true" /> 
        {SETTINGS.SUBSCRIPTION.TITLE}
      </h3>
      
      <div className="space-y-4">
        <div className="p-4 bg-gradient-to-r from-zen-mint-50 to-zen-lavender-50 dark:from-gray-700 dark:to-gray-600 rounded-2xl">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium text-zen-sage-800 dark:text-gray-200">{SETTINGS.SUBSCRIPTION.CURRENT_PLAN}</h4>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
              isPremium
                ? 'bg-zen-mint-100 text-zen-mint-700 dark:bg-zen-mint-900/30 dark:text-zen-mint-400'
                : 'bg-zen-sage-100 text-zen-sage-700 dark:bg-gray-600 dark:text-gray-300'
            }`}>
              {isPremium 
                ? isYearlySubscriber 
                  ? SETTINGS.SUBSCRIPTION.PREMIUM_YEARLY
                  : SETTINGS.SUBSCRIPTION.PREMIUM_MONTHLY
                : SETTINGS.SUBSCRIPTION.FREE}
            </span>
          </div>
          
          {isPremium && subscriptionExpiresAt && (
            <p className="text-sm text-zen-sage-600 dark:text-gray-400 mb-4">
              {SETTINGS.SUBSCRIPTION.RENEWAL.replace('{date}', formatDate(subscriptionExpiresAt))}
            </p>
          )}
          
          {subscriptionStatus === 'cancelled' && subscriptionExpiresAt && (
            <p className="text-sm text-zen-peach-600 dark:text-zen-peach-400 mb-4">
              {SETTINGS.SUBSCRIPTION.CANCELLED.replace('{date}', formatDate(subscriptionExpiresAt))}
            </p>
          )}
          
          <button
            onClick={() => navigate('/premium')}
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-zen-mint-400 to-zen-mint-500 text-white rounded-xl hover:from-zen-mint-500 hover:to-zen-mint-600 transition-colors shadow-md"
          >
            <Crown className="w-4 h-4" aria-hidden="true" />
            <span>{isPremium ? 'Manage Subscription' : 'Upgrade to Premium'}</span>
          </button>
        </div>
      </div>
    </div>
  );
});

export default SubscriptionSection;