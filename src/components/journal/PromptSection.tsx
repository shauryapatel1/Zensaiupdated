import React from 'react';
import { motion } from 'framer-motion';
import { Lightbulb, RefreshCw } from 'lucide-react';
import VoiceButton from '../VoiceButton';
import { JOURNAL } from '../../constants/uiStrings';

/**
 * PromptSection - Displays daily journaling prompts with voice playback option
 * 
 * @component
 * @param {string} dailyPrompt - Prompt text to display
 * @param {boolean} isLoadingPrompt - Whether a new prompt is being loaded
 * @param {function} onGenerateNewPrompt - Function to generate a new prompt
 * @param {boolean} isGeneratingSpeech - Whether speech is being generated
 * @param {boolean} isSpeechPlaying - Whether speech is currently playing
 * @param {function} onPlaySpeech - Function to play prompt as speech
 * @param {function} onStopSpeech - Function to stop speech playback
 * @param {boolean} [isPremiumUser=true] - Whether user has premium access
 * @param {function} [onUpsellTrigger] - Function to trigger premium upsell
 * 
 * @example
 * return (
 *   <PromptSection
 *     dailyPrompt="What are you grateful for today?"
 *     isLoadingPrompt={false}
 *     onGenerateNewPrompt={handleGenerateNewPrompt}
 *     isGeneratingSpeech={false}
 *     isSpeechPlaying={false}
 *     onPlaySpeech={handlePlaySpeech}
 *     onStopSpeech={handleStopSpeech}
 *   />
 * )
 */
interface PromptSectionProps {
  dailyPrompt: string;
  isLoadingPrompt: boolean;
  onGenerateNewPrompt: () => void;
  isGeneratingSpeech: boolean;
  isSpeechPlaying: boolean;
  onPlaySpeech: () => void;
  onStopSpeech: () => void;
  isPremiumUser?: boolean;
  onUpsellTrigger?: () => void;
}

const PromptSection = React.memo(function PromptSection({
  dailyPrompt,
  isLoadingPrompt,
  onGenerateNewPrompt,
  isGeneratingSpeech,
  isSpeechPlaying,
  onPlaySpeech,
  onStopSpeech,
  isPremiumUser = true,
  onUpsellTrigger
}: PromptSectionProps) {
  return (
    <motion.div
      className="mb-8"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.4 }}
    >
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-3xl p-6 shadow-lg border border-white/20 dark:border-gray-600/20">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Lightbulb className="w-5 h-5 text-zen-peach-500" aria-hidden="true" />
            <h3 className="font-display font-bold text-zen-sage-800 dark:text-gray-200" id="daily-prompt-heading">
              Today's Reflection
            </h3>
          </div>
          <div className="flex items-center space-x-2">
            <VoiceButton
              isGenerating={isGeneratingSpeech}
              isPlaying={isSpeechPlaying}
              onPlay={onPlaySpeech}
              onStop={onStopSpeech}
              size="sm"
              isPremiumUser={isPremiumUser}
              onUpsellTrigger={onUpsellTrigger}
              aria-label="Listen to prompt"
            />
            <button
              onClick={onGenerateNewPrompt}
              disabled={isLoadingPrompt}
              className="p-2 text-zen-sage-600 dark:text-gray-400 hover:text-zen-sage-800 dark:hover:text-gray-200 hover:bg-zen-sage-100 dark:hover:bg-gray-700 rounded-full transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Generate new prompt"
              aria-label="Generate new prompt"
            >
              <RefreshCw className={`w-4 h-4 ${isLoadingPrompt ? 'animate-spin' : ''}`} aria-hidden="true" />
            </button>
          </div>
        </div>
        <p 
          className="text-zen-sage-700 dark:text-gray-300 leading-relaxed"
          aria-labelledby="daily-prompt-heading"
          aria-live={isLoadingPrompt ? "polite" : "off"}
        >
          {dailyPrompt}
        </p>
      </div>
    </motion.div>
  );
});

export default PromptSection;