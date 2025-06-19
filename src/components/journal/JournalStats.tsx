import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Trophy, Target, CheckCircle } from 'lucide-react';

interface JournalStatsProps {
  streak: number;
  bestStreak: number;
  totalEntries: number;
  alreadyJournaledToday: boolean;
  className?: string;
}

const JournalStats = React.memo(function JournalStats({
  streak,
  bestStreak,
  totalEntries,
  alreadyJournaledToday,
  className = ''
}: JournalStatsProps) {
  return (
    <div className={`space-y-4 ${className}`}>
      {/* Stats */}
      <div className="flex justify-center space-x-6 mb-6">
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="text-2xl font-bold text-zen-mint-600 dark:text-zen-mint-400">{streak}</div>
          <div className="text-sm text-zen-sage-600 dark:text-gray-400">Current Streak</div>
        </motion.div>
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="text-2xl font-bold text-zen-peach-600 dark:text-zen-peach-400">{bestStreak}</div>
          <div className="text-sm text-zen-sage-600 dark:text-gray-400">Best Streak</div>
        </motion.div>
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="text-2xl font-bold text-zen-lavender-600 dark:text-zen-lavender-400">{totalEntries}</div>
          <div className="text-sm text-zen-sage-600 dark:text-gray-400">Total Entries</div>
        </motion.div>
      </div>

      {/* Already journaled today message */}
      {alreadyJournaledToday && (
        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <div className="inline-flex items-center space-x-2 bg-zen-mint-50 dark:bg-gray-700 px-4 py-2 rounded-full border border-zen-mint-200 dark:border-gray-600">
            <CheckCircle className="w-4 h-4 text-zen-mint-600" aria-hidden="true" />
            <span className="text-sm text-zen-sage-700 dark:text-gray-300 font-medium">
              You've already journaled today! Feel free to add another entry.
            </span>
          </div>
        </motion.div>
      )}
    </div>
  );
});

export default JournalStats;