import React from 'react';
import { motion } from 'framer-motion';
import LottieAvatar from '../LottieAvatar';

interface EmptyStateProps {
  searchTerm: string;
  filterMood: string;
  onClearFilters: () => void;
}

const EmptyState = React.memo(function EmptyState({
  searchTerm,
  filterMood,
  onClearFilters
}: EmptyStateProps) {
  const hasFilters = searchTerm || filterMood !== 'all';

  return (
    <motion.div
      className="text-center py-16"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <LottieAvatar mood={3} size="lg" variant="idle" />
      <h3 className="text-xl font-display font-semibold text-zen-sage-800 dark:text-gray-200 mt-6 mb-2">
        No entries found
      </h3>
      <p className="text-zen-sage-600 dark:text-gray-400 mb-4">
        {hasFilters 
          ? 'Try adjusting your search or filters.'
          : 'Start journaling to see your entries here!'
        }
      </p>
      {hasFilters && (
        <button
          onClick={onClearFilters}
          className="px-6 py-2 bg-zen-mint-400 text-white rounded-xl hover:bg-zen-mint-500 transition-colors"
        >
          Clear Filters
        </button>
      )}
    </motion.div>
  );
});

export default EmptyState;