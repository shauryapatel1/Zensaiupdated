import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Save, RefreshCw, AlertCircle, Sparkles } from 'lucide-react';
import { MoodLevel } from '../../types';
import MoodSelector from '../MoodSelector';
import PhotoUpload from '../PhotoUpload';
import { JOURNAL } from '../../constants/uiStrings';
import { moods } from '../../data/moods';

/**
 * JournalEntryForm - Form for creating new journal entries
 * 
 * @component
 * @param {function} onSubmit - Function to handle form submission
 * @param {boolean} isSubmitting - Whether the form is currently submitting
 * @param {string} error - Error message if submission failed
 * @param {string} dailyPrompt - Prompt to inspire the user's journal entry
 * @param {boolean} isLoadingPrompt - Whether a new prompt is being loaded
 * @param {function} onGenerateNewPrompt - Function to generate a new prompt
 * @param {boolean} showMoodSuggestion - Whether to show AI mood suggestion
 * @param {MoodLevel|null} aiDetectedMood - AI-detected mood level
 * @param {function} onAcceptAiMood - Function to accept AI mood suggestion
 * @param {function} onDismissMoodSuggestion - Function to dismiss AI mood suggestion
 * @param {boolean} [isPremiumUser=true] - Whether user has premium access
 * @param {function} [onUpsellTrigger] - Function to trigger premium upsell
 * 
 * @example
 * return (
 *   <JournalEntryForm
 *     onSubmit={handleSubmit}
 *     isSubmitting={isSubmitting}
 *     error={error}
 *     dailyPrompt={dailyPrompt}
 *     isLoadingPrompt={isLoadingPrompt}
 *     onGenerateNewPrompt={handleGenerateNewPrompt}
 *     showMoodSuggestion={showMoodSuggestion}
 *     aiDetectedMood={aiDetectedMood}
 *     onAcceptAiMood={handleAcceptAiMood}
 *     onDismissMoodSuggestion={handleDismissMoodSuggestion}
 *   />
 * )
 */
interface JournalEntryFormProps {
  onSubmit: (content: string, title: string | null, mood: MoodLevel, photo: File | null) => Promise<void>;
  isSubmitting: boolean;
  error: string;
  dailyPrompt: string;
  isLoadingPrompt: boolean;
  onGenerateNewPrompt: () => void;
  showMoodSuggestion: boolean;
  aiDetectedMood: MoodLevel | null;
  onAcceptAiMood: () => void;
  onDismissMoodSuggestion: () => void;
  isPremiumUser?: boolean;
  onUpsellTrigger?: () => void;
}

const JournalEntryForm = React.memo(function JournalEntryForm({
  onSubmit,
  isSubmitting,
  error,
  dailyPrompt,
  isLoadingPrompt,
  onGenerateNewPrompt,
  showMoodSuggestion,
  aiDetectedMood,
  onAcceptAiMood,
  onDismissMoodSuggestion,
  isPremiumUser = true,
  onUpsellTrigger
}: JournalEntryFormProps) {
  const [journalEntry, setJournalEntry] = useState('');
  const [entryTitle, setEntryTitle] = useState('');
  const [selectedMood, setSelectedMood] = useState<MoodLevel>();
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);
  const [isTextareaFocused, setIsTextareaFocused] = useState(false);

  const handleSubmit = () => {
    if (!journalEntry.trim() || !selectedMood) return;
    onSubmit(journalEntry, entryTitle, selectedMood, selectedPhoto);
  };

  return (
    <div className="space-y-6">
      {/* Daily Prompt Section */}
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4 }}
      >
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-3xl p-6 shadow-lg border border-white/20 dark:border-gray-600/20">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-zen-peach-500" />
              <h3 className="font-display font-bold text-zen-sage-800 dark:text-gray-200">Today's Reflection</h3>
            </div>
            <button
              onClick={onGenerateNewPrompt}
              disabled={isLoadingPrompt}
              className="p-2 text-zen-sage-600 dark:text-gray-400 hover:text-zen-sage-800 dark:hover:text-gray-200 hover:bg-zen-sage-100 dark:hover:bg-gray-700 rounded-full transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Generate new prompt"
              aria-label="Generate new journal prompt"
            >
              <RefreshCw className={`w-4 h-4 ${isLoadingPrompt ? 'animate-spin' : ''}`} aria-hidden="true" />
            </button>
          </div>
          <p className="text-zen-sage-700 dark:text-gray-300 leading-relaxed">
            {dailyPrompt}
          </p>
        </div>
      </motion.div>

      {/* Entry Title */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-zen-sage-700 dark:text-gray-300 mb-2" htmlFor="entry-title">
          Entry Title (Optional)
        </label>
        <input
          id="entry-title"
          type="text"
          value={entryTitle}
          onChange={(e) => setEntryTitle(e.target.value)}
          placeholder="Give your entry a title..."
          className="w-full px-4 py-3 bg-white/50 dark:bg-gray-700/50 border border-zen-mint-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-zen-mint-400 focus:border-transparent transition-all duration-300 text-zen-sage-800 dark:text-gray-200 placeholder-zen-sage-400 dark:placeholder-gray-500"
          disabled={isSubmitting}
        />
      </div>

      {/* Mood Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-zen-sage-700 dark:text-gray-300 mb-3" id="mood-selector-label">
          How are you feeling?
        </label>
        <MoodSelector
          selectedMood={selectedMood}
          onMoodSelect={setSelectedMood}
          disabled={isSubmitting}
          aria-labelledby="mood-selector-label"
        />
      </div>

      {/* AI Mood Suggestion */}
      <AnimatePresence>
        {showMoodSuggestion && aiDetectedMood && (
          <motion.div
            className="mb-6 bg-zen-lavender-50 dark:bg-gray-700 border border-zen-lavender-200 dark:border-gray-600 rounded-2xl p-4"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            role="alert"
            aria-live="polite"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Sparkles className="w-5 h-5 text-zen-lavender-600" aria-hidden="true" />
                <div>
                  <p className="text-sm font-medium text-zen-sage-800 dark:text-gray-200">
                    Based on your writing, I sense you might be feeling{' '}
                    <span className="font-semibold">
                      {moods.find(m => m.level === aiDetectedMood)?.label}
                    </span>
                  </p>
                  <p className="text-xs text-zen-sage-600 dark:text-gray-400">
                    Would you like me to update your mood selection?
                  </p>
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={onAcceptAiMood}
                  className="px-3 py-1 bg-zen-lavender-500 text-white text-sm rounded-lg hover:bg-zen-lavender-600 transition-colors duration-200"
                  aria-label={`Accept suggested mood: ${moods.find(m => m.level === aiDetectedMood)?.label}`}
                >
                  Yes
                </button>
                <button
                  onClick={onDismissMoodSuggestion}
                  className="px-3 py-1 bg-gray-300 dark:bg-gray-600 text-zen-sage-700 dark:text-gray-300 text-sm rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors duration-200"
                  aria-label="Keep current mood selection"
                >
                  No
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Photo Upload */}
      <div className="mb-6">
        <PhotoUpload
          selectedPhoto={selectedPhoto}
          onPhotoSelect={setSelectedPhoto}
          disabled={isSubmitting}
          isPremiumUser={isPremiumUser}
          onUpsellTrigger={onUpsellTrigger}
          aria-label="Upload a photo to attach to your journal entry"
        />
      </div>

      {/* Journal Entry Textarea */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-zen-sage-700 dark:text-gray-300 mb-2" htmlFor="journal-entry">
          Your thoughts
        </label>
        <div className="relative">
          <textarea
            id="journal-entry"
            value={journalEntry}
            onChange={(e) => setJournalEntry(e.target.value)}
            onFocus={() => setIsTextareaFocused(true)}
            onBlur={() => setIsTextareaFocused(false)}
            placeholder="Share what's on your mind... Zeno is here to listen."
            rows={8}
            className="w-full px-4 py-4 bg-white/50 dark:bg-gray-700/50 border border-zen-mint-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-zen-mint-400 focus:border-transparent transition-all duration-300 text-zen-sage-800 dark:text-gray-200 placeholder-zen-sage-400 dark:placeholder-gray-500 resize-none"
            disabled={isSubmitting}
            aria-required="true"
          />
          {/* Character count */}
          <div className="absolute bottom-3 right-3 text-xs text-zen-sage-400 dark:text-gray-500">
            {journalEntry.length} characters
          </div>
        </div>
      </div>

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.div
            className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-4"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            role="alert"
            aria-live="assertive"
          >
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-red-500" aria-hidden="true" />
              <p className="text-red-700 dark:text-red-300 text-sm font-medium">{error}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Submit Button */}
      <div className="flex justify-center">
        <motion.button
          onClick={handleSubmit}
          disabled={!journalEntry.trim() || !selectedMood || isSubmitting}
          className="flex items-center space-x-3 px-8 py-4 bg-gradient-to-r from-zen-mint-400 to-zen-mint-500 text-white font-semibold rounded-2xl hover:from-zen-mint-500 hover:to-zen-mint-600 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          aria-label="Save journal entry"
        >
          {isSubmitting ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" aria-hidden="true" />
              <span>Saving your thoughts...</span>
            </>
          ) : (
            <>
              <Save className="w-5 h-5" aria-hidden="true" />
              <span>Save Entry</span>
            </>
          )}
        </motion.button>
      </div>
    </div>
  );
});

export default JournalEntryForm;