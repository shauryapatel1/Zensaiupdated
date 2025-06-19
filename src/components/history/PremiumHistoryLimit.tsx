import React from 'react';
import { motion } from 'framer-motion';
import { Crown } from 'lucide-react';

interface PremiumHistoryLimitProps {
  showHistoryLimitMessage: boolean;
  onUpgrade: () => void;
}

const PremiumHistoryLimit = React.memo(function PremiumHistoryLimit({
  showHistoryLimitMessage,
  onUpgrade
}: PremiumHistoryLimitProps) {
  if (!showHistoryLimitMessage) return null;

  return (
    <motion.div
      className="mb-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <div className="bg-gradient-to-r from-zen-peach-100 to-zen-lavender-100 dark:from-gray-700 dark:to-gray-600 rounded-3xl p-6 shadow-xl border border-zen-peach-200 dark:border-gray-600">
        <div className="flex items-start space-x-4">
          <div className="bg-white/80 dark:bg-gray-800/80 p-3 rounded-full flex-shrink-0">
            <Crown className="w-6 h-6 text-yellow-500" aria-hidden="true" />
          </div>
          <div>
            <h3 className="text-lg font-display font-bold text-zen-sage-800 dark:text-gray-200 mb-2">
              Unlock Your Full Journal History
            </h3>
            <p className="text-zen-sage-600 dark:text-gray-400 mb-4">
              Free accounts can only access the last 30 days or 30 entries. Upgrade to Zensai Premium to unlock your complete journal history and insights.
            </p>
            <button
              onClick={onUpgrade}
              className="px-4 py-2 bg-gradient-to-r from-zen-mint-400 to-zen-mint-500 text-white rounded-xl hover:from-zen-mint-500 hover:to-zen-mint-600 transition-colors shadow-md"
            >
              Upgrade to Premium
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
});

export default PremiumHistoryLimit;