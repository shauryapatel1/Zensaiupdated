import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { usePremium } from './usePremium';
import { MoodLevel } from '../types';

/**
 * Interface for affirmation generation response
 * @interface AffirmationResponse
 */
interface AffirmationResponse {
  success: boolean;
  affirmation: string;
  generated_by: 'ai' | 'fallback';
  error?: string;
  timestamp: string;
}

/**
 * Custom hook for generating personalized affirmations
 * 
 * @returns {Object} Affirmation generation methods and state
 * 
 * @example
 * const { 
 *   generateAffirmation, 
 *   isGenerating, 
 *   error 
 * } = useAffirmationGenerator();
 * 
 * // Generate an affirmation
 * const affirmation = await generateAffirmation("I'm feeling proud of my progress", 4);
 */
export function useAffirmationGenerator() {
  const { user } = useAuth();
  const { isPremium, trackFeatureUsage } = usePremium();
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dailyUsageCount, setDailyUsageCount] = useState(0);

  /**
   * Generate a personalized affirmation based on journal content and mood
   * 
   * @param {string} journalEntry - Journal entry text
   * @param {MoodLevel} mood - User's mood level
   * @returns {Promise<string|null>} Generated affirmation or null on failure
   */
  const generateAffirmation = async (
    journalEntry: string, 
    mood: MoodLevel
  ): Promise<string | null> => {
    if (!journalEntry.trim()) {
      setError('Journal entry is required for affirmation generation');
      return null;
    }

    setIsGenerating(true);
    setError(null);

    // Check if free user has reached daily limit
    if (!isPremium && !trackFeatureUsage('affirmation-generator')) {
      setError('Daily limit reached. Upgrade to Premium for unlimited affirmations.');
      setIsGenerating(false);
      return null;
    }

    try {
      // Convert mood level to string
      const moodString = getMoodString(mood);

      const { data, error: functionError } = await supabase.functions.invoke('generate-affirmation', {
        body: {
          entry: journalEntry.trim(),
          mood: moodString,
          name: user?.name
        }
      });

      if (functionError) {
        console.error('Edge function error:', functionError);
        setError('Failed to generate affirmation');
        return null;
      }

      const response: AffirmationResponse = data;
      
      if (!response.success) {
        setError(response.error || 'Failed to generate affirmation');
        // Return the fallback affirmation even if marked as unsuccessful
        return response.affirmation || null;
      }

      return response.affirmation;
    } catch (err) {
      console.error('Error calling affirmation generator:', err);
      setError('An unexpected error occurred during affirmation generation');
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    generateAffirmation,
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