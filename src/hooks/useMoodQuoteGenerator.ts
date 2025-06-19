import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { usePremium } from './usePremium';
import { MoodLevel } from '../types';

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
      setError('Daily limit reached. Upgrade to Premium for unlimited mood quotes.');
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
        console.error('Edge function error:', functionError);
        setError('Failed to generate mood quote');
        return null;
      }

      const response: MoodQuoteResponse = data;
      
      if (!response.success) {
        setError(response.error || 'Failed to generate mood quote');
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
      setError('An unexpected error occurred during quote generation');
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