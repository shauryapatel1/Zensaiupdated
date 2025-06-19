import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { usePremium } from './usePremium';
import { MoodLevel } from '../types';
import { ErrorCode, createAppError, getUserFriendlyErrorMessage } from '../types/errors';

/**
 * Interface for mood quote generation response
 * @interface MoodQuoteResponse
 */
interface MoodQuoteResponse {
  success: boolean;
  quote: string;
  attribution?: string;
  generated_by: 'ai' | 'fallback';
  error?: string;
  timestamp: string;
}

/**
 * Custom hook for generating mood-appropriate quotes
 * 
 * @returns {Object} Quote generation methods and state
 * 
 * @example
 * const { 
 *   generateMoodQuote, 
 *   isGenerating, 
 *   error 
 * } = useMoodQuoteGenerator();
 * 
 * // Generate a quote for a specific mood
 * const quote = await generateMoodQuote(4, "I'm feeling optimistic today");
 */
export function useMoodQuoteGenerator() {
  const { user } = useAuth();
  const { isPremium, trackFeatureUsage } = usePremium();
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dailyUsageCount, setDailyUsageCount] = useState(0);

  /**
   * Generate a quote appropriate for the user's mood
   * 
   * @param {MoodLevel} mood - User's mood level
   * @param {string} [journalEntry] - Optional journal entry for context
   * @param {string[]} [previousQuotes] - Previously shown quotes to avoid repetition
   * @returns {Promise<{quote: string, attribution?: string}|null>} Generated quote or null on failure
   */
  const generateMoodQuote = async (
    mood: MoodLevel,
    journalEntry?: string,
    previousQuotes?: string[]
  ): Promise<{ quote: string; attribution?: string } | null> => {
    setIsGenerating(true);
    setError(null);
    
    // Check if free user has reached daily limit
    if (!isPremium && !trackFeatureUsage('mood-quote-generator')) {
      const error = createAppError(
        ErrorCode.PREMIUM_DAILY_LIMIT,
        'Daily limit reached. Upgrade to Premium for unlimited mood quotes.',
        { feature: 'mood-quote-generator' }
      );
      setError(getUserFriendlyErrorMessage(error));
      setIsGenerating(false);
      return null;
    }

    try {
      // Convert mood level to string
      const moodString = getMoodString(mood);

      const { data, error: functionError } = await supabase.functions.invoke('generate-mood-quote', {
        body: {
          mood: moodString,
          entry: journalEntry,
          name: user?.name,
          previousQuotes: previousQuotes || []
        }
      });

      if (functionError) {
        console.error('Mood quote generation edge function error:', functionError);
        const error = createAppError(
          ErrorCode.AI_SERVICE_UNAVAILABLE,
          'Failed to generate mood quote',
          { functionError }
        );
        setError('Failed to generate mood quote');
        return null;
      }

      const response: MoodQuoteResponse = data;
      
      if (!response.success) {
        const error = createAppError(
          ErrorCode.AI_GENERATION_FAILED,
          response.error || 'Failed to generate mood quote',
          { response }
        );
        setError(getUserFriendlyErrorMessage(error));
        // Return the fallback quote even if marked as unsuccessful
        return {
          quote: response.quote,
          attribution: response.attribution
        };
      }

      return {
        quote: response.quote,
        attribution: response.attribution
      };
    } catch (err) {
      console.error('Error calling mood quote generator:', err);
      const error = createAppError(
        ErrorCode.UNKNOWN_ERROR,
        'An unexpected error occurred during quote generation',
        undefined, err
      );
      setError(getUserFriendlyErrorMessage(error));
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    generateMoodQuote,
    isGenerating,
    error,
    dailyUsageCount
  };
}

/**
 * Helper function to convert mood level to descriptive string
 * 
 * @param {MoodLevel} mood - Numeric mood level (1-5)
 * @returns {string} String representation of mood
 */
function getMoodString(mood: MoodLevel): string {
  switch (mood) {
    case 1:
      return 'struggling';
    case 2:
      return 'low';
    case 3:
      return 'neutral';
    case 4:
      return 'good';
    case 5:
      return 'amazing';
    default:
      return 'neutral';
  }
}