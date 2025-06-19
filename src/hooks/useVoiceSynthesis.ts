import { useState, useRef, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { usePremium } from './usePremium';
import { ErrorCode, createAppError, getUserFriendlyErrorMessage } from '../types/errors';

/**
 * Interface for voice synthesis settings
 * @interface VoiceSettings
 */
interface VoiceSettings {
  stability?: number;
  similarity_boost?: number;
  style?: number;
  use_speaker_boost?: boolean;
}

/**
 * Interface for speech generation response
 * @interface SpeechResponse
 */
interface SpeechResponse {
  success: boolean;
  audio_url?: string;
  error?: string;
  timestamp: string;
}

/**
 * Custom hook for text-to-speech functionality
 * 
 * @returns {Object} Voice synthesis methods and state
 * 
 * @example
 * const { 
 *   generateAndPlaySpeech, 
 *   stopSpeech, 
 *   isGenerating,
 *   isPlaying,
 *   error,
 *   clearError
 * } = useVoiceSynthesis();
 * 
 * // Generate and play speech
 * await generateAndPlaySpeech("Hello, this is a test");
 * 
 * // Stop playback
 * stopSpeech();
 */
export function useVoiceSynthesis() {
  const { isPremium, trackFeatureUsage } = usePremium();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  /**
   * Generate speech from text and play it
   * 
   * @param {string} text - Text to convert to speech
   * @param {VoiceSettings} [voiceSettings] - Optional voice customization settings
   * @returns {Promise<boolean>} Success status
   */
  const generateAndPlaySpeech = useCallback(async (
    text: string,
    voiceSettings?: VoiceSettings
  ): Promise<boolean> => {
    if (!text?.trim()) {
      const error = createAppError(
        ErrorCode.VALIDATION_ERROR,
        'Text is required for speech generation'
      );
      setError(getUserFriendlyErrorMessage(error));
      return false;
    }
    
    // Check if free user has reached daily limit
    if (!isPremium && !trackFeatureUsage('voice-synthesis')) {
      const error = createAppError(
        ErrorCode.PREMIUM_REQUIRED,
        'Voice synthesis is a premium feature. Upgrade to unlock unlimited voice playback.'
      );
      setError(getUserFriendlyErrorMessage(error));
      return false;
    }

    setIsGenerating(true);
    setError(null);

    try {
      // Stop any currently playing audio
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }

      const { data, error: functionError } = await supabase.functions.invoke('generate-speech', {
        body: {
          text: text.trim(),
          voice_settings: voiceSettings
        }
      });

      if (functionError) {
        console.error('Speech generation edge function error:', functionError);
        const error = createAppError(
          ErrorCode.AI_GENERATION_FAILED,
          'Failed to generate speech',
          { functionError }
        );
        setError('Failed to generate speech');
        return false;
      }

      const response: SpeechResponse = data;
      
      if (!response.success || !response.audio_url) {
        const error = createAppError(
          ErrorCode.AI_GENERATION_FAILED,
          response.error || 'Failed to generate speech',
          { response }
        );
        setError(getUserFriendlyErrorMessage(error));
        return false;
      }

      // Create and play audio
      const audio = new Audio(response.audio_url);
      audioRef.current = audio;

      // Set up audio event listeners
      audio.addEventListener('loadstart', () => setIsPlaying(true));
      audio.addEventListener('ended', () => {
        setIsPlaying(false);
        audioRef.current = null;
      });
      audio.addEventListener('error', () => {
        setIsPlaying(false);
        const error = createAppError(
          ErrorCode.MEDIA_UPLOAD_FAILED,
          'Failed to play audio',
          { audioSrc: response.audio_url }
        );
        setError(getUserFriendlyErrorMessage(error));
        audioRef.current = null;
      });

      // Play the audio
      try {
        await audio.play();
        return true;
      } catch (playError) {
        console.error('Audio play error:', playError);
        const error = createAppError(
          ErrorCode.MEDIA_UPLOAD_FAILED,
          'Failed to play audio. Please check your browser settings.',
          { playError }
        );
        setError(getUserFriendlyErrorMessage(error));
        setIsPlaying(false);
        return false;
      }

    } catch (err) {
      console.error('Error generating speech:', err);
      const error = createAppError(
        ErrorCode.UNKNOWN_ERROR,
        'An unexpected error occurred during speech generation',
        undefined,
        err
      );
      setError(getUserFriendlyErrorMessage(error));
      return false;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  /**
   * Stop speech playback
   */
  const stopSpeech = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
      setIsPlaying(false);
    }
  }, []);

  /**
   * Clear any error messages
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    generateAndPlaySpeech,
    stopSpeech,
    clearError,
    isGenerating,
    isPlaying,
    error
  };
}