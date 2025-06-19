import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { usePremium } from './usePremium';
import { MoodLevel } from '../types';
import { ErrorCode, createAppError, getUserFriendlyErrorMessage } from '../types/errors';

/**
 * Interface for mood analysis response
 * @interface MoodAnalysisResponse
 */
interface MoodAnalysisResponse {
  success: boolean;
  mood: string;
  confidence?: number;
  analysis?: string;
  error?: string;
  timestamp: string;
}

/**
 * Custom hook for analyzing mood from journal text
 * 
 * @returns {Object} Mood analysis methods and state
 * 
 * @example
 * const { 
 *   analyzeMood, 
 *   isAnalyzing, 
 *   error 
 * } = useMoodAnalyzer();
 * 
 * // Analyze mood from text
 * const detectedMood = await analyzeMood("I'm feeling great today!");
 */
export function useMoodAnalyzer() {
  const { user } = useAuth();
  const { isPremium, trackFeatureUsage } = usePremium();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dailyUsageCount, setDailyUsageCount] = useState(0);

  /**
   * Analyze mood from journal text
   * 
   * @param {string} journalEntry - Text to analyze
   * @returns {Promise<MoodLevel|null>} Detected mood level or null on failure
   */
  const analyzeMood = async (journalEntry: string): Promise<MoodLevel | null> => {
    if (!journalEntry.trim()) {
      const error = createAppError(
        ErrorCode.VALIDATION_ERROR,
        'Journal entry is required for mood analysis'
      );
      setError(getUserFriendlyErrorMessage(error));
      return null;
    }

    setIsAnalyzing(true);
    setError(null);

    // Check if free user has reached daily limit
    if (!isPremium && !trackFeatureUsage('mood-analyzer')) {
      const error = createAppError(
        ErrorCode.PREMIUM_DAILY_LIMIT,
        'Daily limit reached. Upgrade to Premium for unlimited mood analysis.',
        { feature: 'mood-analyzer' }
      );
      setError(getUserFriendlyErrorMessage(error));
      setIsAnalyzing(false);
      return null;
    }

    try {
      const { data, error: functionError } = await supabase.functions.invoke('analyze-mood', {
        body: {
          entry: journalEntry.trim(),
          name: user?.name
        }
      });

      if (functionError) {
        console.error('Mood analysis edge function error:', functionError);
        const error = createAppError(
          ErrorCode.AI_SERVICE_UNAVAILABLE,
          'Failed to analyze mood',
          { functionError }
        );
        setError('Failed to analyze mood');
        return null;
      }

      const response: MoodAnalysisResponse = data;
      
      if (!response.success) {
        const error = createAppError(
          ErrorCode.AI_GENERATION_FAILED,
          response.error || 'Failed to analyze mood',
          { response }
        );
        setError(getUserFriendlyErrorMessage(error));
        // Return neutral as fallback
        return 3;
      }

      // Convert mood string to MoodLevel
      const moodLevel = convertMoodStringToLevel(response.mood);
      return moodLevel;
    } catch (err) {
      console.error('Error calling mood analyzer:', err);
      const error = createAppError(
        ErrorCode.UNKNOWN_ERROR,
        'An unexpected error occurred during mood analysis',
        undefined, err
      );
      setError(getUserFriendlyErrorMessage(error));
      return null;
    } finally {
      setIsAnalyzing(false);
    }
  };

  return {
    analyzeMood,
    isAnalyzing,
    error,
    dailyUsageCount
  };
}

/**
 * Helper function to convert mood string to MoodLevel
 * 
 * @param {string} mood - Mood string from API
 * @returns {MoodLevel} Numeric mood level (1-5)
 */
function convertMoodStringToLevel(mood: string): MoodLevel {
  const normalizedMood = mood.toLowerCase().trim();
  
  // Direct matches
  switch (normalizedMood) {
    case 'struggling':
      return 1;
    case 'low':
      return 2;
    case 'neutral':
      return 3;
    case 'good':
      return 4;
    case 'amazing':
      return 5;
  }
  
  // Handle variations and synonyms
  if (normalizedMood.includes('depress') || normalizedMood.includes('despair') || 
      normalizedMood.includes('hopeless') || normalizedMood.includes('overwhelm') ||
      normalizedMood.includes('anxious') || normalizedMood.includes('panic') ||
      normalizedMood.includes('stressed') || normalizedMood.includes('terrible')) {
    return 1; // struggling
  }
  
  if (normalizedMood.includes('sad') || normalizedMood.includes('down') || 
      normalizedMood.includes('disappoint') || normalizedMood.includes('melancholy') ||
      normalizedMood.includes('blue') || normalizedMood.includes('upset') ||
      normalizedMood.includes('worried') || normalizedMood.includes('concern')) {
    return 2; // low
  }
  
  if (normalizedMood.includes('happy') || normalizedMood.includes('joy') || 
      normalizedMood.includes('pleased') || normalizedMood.includes('content') ||
      normalizedMood.includes('satisfied') || normalizedMood.includes('positive') ||
      normalizedMood.includes('optimistic') || normalizedMood.includes('hopeful') ||
      normalizedMood.includes('cheerful') || normalizedMood.includes('upbeat')) {
    return 4; // good
  }
  
  if (normalizedMood.includes('ecstatic') || normalizedMood.includes('elated') || 
      normalizedMood.includes('thrilled') || normalizedMood.includes('euphoric') ||
      normalizedMood.includes('fantastic') || normalizedMood.includes('wonderful') ||
      normalizedMood.includes('excellent') || normalizedMood.includes('brilliant') ||
      normalizedMood.includes('incredible') || normalizedMood.includes('overjoyed')) {
    return 5; // amazing
  }
  
  // Default to neutral for unrecognized emotions
  return 3;
}