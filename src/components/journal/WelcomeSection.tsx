import React from 'react';
import { motion } from 'framer-motion';
import { User } from '../../contexts/AuthContext';
import JournalStats from './JournalStats';
import { JOURNAL } from '../../constants/uiStrings';

/**
 * WelcomeSection - Displays welcome message, date, and journal statistics
 * 
 * @component
 * @param {User|null} user - Current user object
 * @param {number} streak - Current journaling streak
 * @param {number} bestStreak - Best journaling streak
 * @param {number} totalEntries - Total number of journal entries
 * @param {boolean} alreadyJournaledToday - Whether user has journaled today
 * @param {string} [contextualMessage] - Optional contextual message based on recent activity
 * 
 * @example
 * return (
 *   <WelcomeSection
 *     user={currentUser}
 *     streak={5}
 *     bestStreak={10}
 *     totalEntries={42}
 *     alreadyJournaledToday={true}
 *     contextualMessage="Welcome back! I've been thinking about our last conversation."
 *   />
 * )
 */
interface WelcomeSectionProps {
  user: User | null;
  streak: number;
  bestStreak: number;
  totalEntries: number;
  alreadyJournaledToday: boolean;
  contextualMessage?: string;
}

const WelcomeSection = React.memo(function WelcomeSection({
  user,
  streak,
  bestStreak,
  totalEntries,
  alreadyJournaledToday,
  contextualMessage
}: WelcomeSectionProps) {
  const getGreeting = () => {
    const hour = new Date().getHours();
    const name = user?.name || 'friend';
    if (hour < 12) return `Good morning, ${name}!`;
    if (hour < 17) return `Good afternoon, ${name}!`;
    return `Good evening, ${name}!`;
  };

  const getCurrentDate = () => {
    const today = new Date();
    return today.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <motion.div
      className="text-center mb-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
    >
      <h2 className="text-3xl font-display font-bold text-zen-sage-800 dark:text-gray-200 mb-2">
        {getGreeting()}
      </h2>
      <p className="text-zen-sage-600 dark:text-gray-400 mb-4">{getCurrentDate()}</p>
      
      {/* Stats */}
      <JournalStats 
        streak={streak}
        bestStreak={bestStreak}
        totalEntries={totalEntries}
        alreadyJournaledToday={alreadyJournaledToday}
      />

      {/* Contextual Message */}
      {contextualMessage && (
        <motion.div
          className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl p-4 mb-6 border border-zen-mint-200 dark:border-gray-700"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.4 }}
        >
          <p className="text-zen-sage-700 dark:text-gray-300 font-medium">
            {contextualMessage}
          </p>
        </motion.div>
      )}
    </motion.div>
  );
});

export default WelcomeSection;