import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface MoodQuoteDisplayProps {
  moodQuote: { quote: string; attribution?: string } | null;
  showMoodQuote: boolean;
}

const MoodQuoteDisplay = React.memo(function MoodQuoteDisplay({
  moodQuote,
  showMoodQuote
}: MoodQuoteDisplayProps) {
  if (!showMoodQuote || !moodQuote) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="mb-6"
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        transition={{ duration: 0.5, type: "spring", stiffness: 200 }}
        role="region"
        aria-label="Inspirational quote"
        aria-live="polite"
      >
        <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl p-5 shadow-lg border border-white/30 dark:border-gray-600/30 max-w-2xl mx-auto">
          <p className="text-zen-sage-700 dark:text-gray-300 text-center italic">
            "{moodQuote.quote}"
          </p>
          {moodQuote.attribution && (
            <p className="text-zen-sage-500 dark:text-gray-400 text-center text-sm mt-2">
              — {moodQuote.attribution}
            </p>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
});

export default MoodQuoteDisplay;