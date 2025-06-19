import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import VoiceButton from '../VoiceButton';
import LottieAvatar from '../LottieAvatar';
import { MoodLevel } from '../../types';

interface AffirmationDisplayProps {
  affirmation: string | null;
  showAffirmation: boolean;
  affirmationError: string | null;
  isGeneratingSpeech: boolean;
  isSpeechPlaying: boolean;
  onPlaySpeech: () => void;
  onStopSpeech: () => void;
  selectedMood?: MoodLevel;
  isPremiumUser?: boolean;
  onUpsellTrigger?: () => void;
}

const AffirmationDisplay = React.memo(function AffirmationDisplay({
  affirmation,
  showAffirmation,
  affirmationError,
  isGeneratingSpeech,
  isSpeechPlaying,
  onPlaySpeech,
  onStopSpeech,
  selectedMood = 3,
  isPremiumUser = true,
  onUpsellTrigger
}: AffirmationDisplayProps) {
  if (!showAffirmation || !affirmation) return null;

  return (
    <AnimatePresence>
      <motion.div 
        className="mb-8"
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        transition={{ duration: 0.5, type: "spring", stiffness: 200 }}
      >
        <div className="flex items-start space-x-4 max-w-2xl mx-auto">
          {/* Zeno avatar for affirmation */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <LottieAvatar 
              mood={selectedMood} 
              size="md" 
              variant="greeting"
            />
          </motion.div>
          
          {/* Affirmation speech bubble */}
          <motion.div
            className="flex-1 bg-gradient-to-br from-zen-mint-100 to-zen-peach-100 dark:from-gray-700 dark:to-gray-600 backdrop-blur-sm rounded-3xl rounded-tl-lg px-6 py-5 shadow-lg border border-zen-mint-200 dark:border-gray-500 relative"
            initial={{ opacity: 0, scale: 0.9, x: 20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.9, x: 20 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            role="region"
            aria-label="Personal affirmation"
            aria-live="polite"
          >
            {/* Speech bubble tail */}
            <div 
              className="absolute left-0 top-6 w-0 h-0 border-t-8 border-t-transparent border-b-8 border-b-transparent border-r-8 border-r-zen-mint-100 dark:border-r-gray-700 transform -translate-x-2" 
              aria-hidden="true"
            />
            
            <div className="flex items-start space-x-3">
              <Sparkles className="w-5 h-5 text-zen-peach-500 mt-1 flex-shrink-0" aria-hidden="true" />
              <div>
                <p className="text-zen-sage-700 dark:text-gray-200 font-medium leading-relaxed">
                  {affirmation}
                </p>
                {affirmationError && (
                  <p className="text-zen-sage-500 dark:text-gray-400 text-sm mt-2 italic">
                    {affirmationError}
                  </p>
                )}
              </div>
              <div className="flex-shrink-0">
                <VoiceButton
                  isGenerating={isGeneratingSpeech}
                  isPlaying={isSpeechPlaying}
                  onPlay={onPlaySpeech}
                  onStop={onStopSpeech}
                  size="sm"
                  isPremiumUser={isPremiumUser}
                  onUpsellTrigger={onUpsellTrigger}
                />
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
});

export default AffirmationDisplay;