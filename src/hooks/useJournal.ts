import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useJournalEntries } from './useJournalEntries';
import { MoodLevel } from '../types';

/**
 * Interface for journal entry data
 * @interface JournalEntry
 */
interface JournalEntry {
  id: string;
  user_id: string;
  content: string;
  mood: string;
  photo_url: string | null;
  photo_filename: string | null;
  title: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Interface for user profile data
 * @interface Profile
 */
interface Profile {
  user_id: string;
  name: string;
  current_streak: number;
  best_streak: number;
  last_entry_date: string | null;
  journaling_goal_frequency: number;
  total_badges_earned: number;
  subscription_status: string;
  subscription_tier: string;
  subscription_expires_at: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Interface for badge data
 * @interface Badge
 */
interface Badge {
  id: string;
  badge_name: string;
  badge_description: string;
  badge_icon: string;
  badge_category: string;
  badge_rarity: string;
  earned: boolean;
  earned_at: string | null;
  progress_current: number;
  progress_target: number;
  progress_percentage: number;
}

/**
 * Custom hook for managing journal-related functionality
 * 
 * @returns {Object} Journal methods and state
 * 
 * @example
 * const { 
 *   entries, 
 *   profile, 
 *   badges, 
 *   addEntry, 
 *   updateJournalingGoal 
 * } = useJournal();
 */
export function useJournal() {
  const { user, isAuthenticated } = useAuth();
  const { 
    entries, 
    isLoading: entriesLoading, 
    error: entriesError,
    loadEntries,
    addEntry,
    updateEntry,
    deleteEntry
  } = useJournalEntries();
  
  const [profile, setProfile] = useState<Profile | null>(null);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);

  /**
   * Calculate premium status directly from profile
   */
  const isPremium = profile?.subscription_status === 'premium' && 
    (!profile?.subscription_expires_at || new Date(profile.subscription_expires_at) > new Date());

  /**
   * Combined loading state from entries and profile
   */
  const isLoading = entriesLoading || isLoadingProfile;
  
  /**
   * Combined error state from entries and profile
   */
  const error = entriesError || profileError;

  /**
   * Load user profile and entries when authentication state changes
   */
  useEffect(() => {
    if (isAuthenticated && user) {
      loadUserData();
      loadUserBadges();
    } else {
      setIsLoadingProfile(false);
      setProfile(null);
      setBadges([]);
    }
  }, [isAuthenticated, user]);

  /**
   * Load user profile data from Supabase
   */
  const loadUserData = async () => {
    if (!user) return;

    try {
      setIsLoadingProfile(true);
      setProfileError(null);

      // Load profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (profileError) {
        console.error('Error loading profile:', profileError);
        setProfileError('Failed to load profile data');
        return;
      }

      setProfile(profileData);

      // Load entries with premium status
      const userIsPremium = isPremium;
      await loadEntries(userIsPremium);

    } catch (err) {
      console.error('Error loading user data:', err);
      setProfileError('An unexpected error occurred');
    } finally {
      setIsLoadingProfile(false);
    }
  };

  /**
   * Load user badges from Supabase
   */
  const loadUserBadges = async () => {
    if (!user) return;

    try {
      const { data: badgeData, error: badgeError } = await supabase
        .rpc('get_user_badge_progress', { target_user_id: user.id });

      if (badgeError) {
        console.error('Error loading badges:', badgeError);
        return;
      }

      setBadges(badgeData || []);
    } catch (err) {
      console.error('Error loading badges:', err);
    }
  };

  /**
   * Update the user's weekly journaling goal
   * 
   * @param {number} frequency - Number of days per week (1-7)
   * @returns {Promise<{success: boolean, error?: string}>} Result object
   */
  const updateJournalingGoal = async (frequency: number): Promise<{ success: boolean; error?: string }> => {
    if (!user || !isAuthenticated) {
      return { success: false, error: 'You must be logged in to update your goal' };
    }

    if (frequency < 1 || frequency > 7) {
      return { success: false, error: 'Goal frequency must be between 1 and 7 days per week' };
    }

    try {
      setError(null);

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          journaling_goal_frequency: frequency,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (updateError) {
        console.error('Error updating goal:', updateError);
        return { success: false, error: 'Failed to update your journaling goal. Please try again.' };
      }

      // Update local state
      setProfile(prev => prev ? { ...prev, journaling_goal_frequency: frequency } : null);
      
      // Reload badges as goal change might unlock new badges
      await loadUserBadges();

      return { success: true };
    } catch (err) {
      console.error('Error updating goal:', err);
      return { success: false, error: 'An unexpected error occurred. Please try again.' };
    }
  };

  /**
   * Get the user's current journaling streak
   * 
   * @returns {number} Current streak in days
   */
  const getStreak = (): number => {
    return profile?.current_streak || 0;
  };

  /**
   * Get the user's best journaling streak
   * 
   * @returns {number} Best streak in days
   */
  const getBestStreak = (): number => {
    return profile?.best_streak || 0;
  };

  /**
   * Get the total number of journal entries
   * 
   * @returns {number} Total entries count
   */
  const getTotalEntries = (): number => {
    return entries.length;
  };

  /**
   * Get the date of the last journal entry
   * 
   * @returns {Date|null} Date object or null if no entries
   */
  const getLastEntryDate = (): Date | null => {
    if (!profile?.last_entry_date) return null;
    return new Date(profile.last_entry_date);
  };

  /**
   * Check if the user has already journaled today
   * 
   * @returns {boolean} True if an entry exists for today
   */
  const hasEntryToday = (): boolean => {
    const today = new Date().toISOString().split('T')[0];
    return profile?.last_entry_date === today;
  };

  /**
   * Add a new journal entry with premium checks and profile updates
   * 
   * @param {string} content - Journal entry content
   * @param {string|null} title - Optional entry title
   * @param {MoodLevel} mood - Selected mood level
   * @param {File} [photoFile] - Optional photo attachment
   * @returns {Promise<{success: boolean, error?: string}>} Result object
   */
  const handleAddEntry = async (
    content: string,
    title: string | null,
    mood: MoodLevel,
    photoFile?: File
  ): Promise<{ success: boolean; error?: string }> => {
    // Check if photo uploads are allowed for free users
    if (photoFile && !isPremium) {
      return { success: false, error: 'Photo uploads are a premium feature. Please upgrade to add photos to your entries.' };
    }
    
    // Call the addEntry function from useJournalEntries
    const result = await addEntry(content, title, mood, photoFile);
    
    if (result.success) {
      // Reload profile to get updated streak
      try {
        const { data: updatedProfile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user?.id)
          .single();
  
        if (!profileError && updatedProfile) {
          setProfile(updatedProfile);
        }
        
        // Reload badges as new entry might unlock badges
        await loadUserBadges();
      } catch (err) {
        console.error('Error updating profile after entry:', err);
      }
    }
    
    return result;
  };
  
  /**
   * Delete a journal entry and update profile data
   * 
   * @param {string} entryId - ID of the entry to delete
   * @returns {Promise<{success: boolean, error?: string}>} Result object
   */
  const handleDeleteEntry = async (entryId: string): Promise<{ success: boolean; error?: string }> => {
    const result = await deleteEntry(entryId);
    
    if (result.success) {
      // Reload profile to get updated streak (deletion might affect streak)
      await loadUserData();
      await loadUserBadges();
    }
    
    return result;
  };

  /**
   * Refresh all journal data (entries, profile, badges)
   */
  const refreshData = () => {
    loadUserData();
    loadUserBadges();
  };

  return {
    entries,
    profile,
    badges,
    isLoading,
    error,
    isPremium,
    addEntry: handleAddEntry,
    updateEntry,
    deleteEntry: handleDeleteEntry,
    updateJournalingGoal,
    getStreak,
    getBestStreak,
    getTotalEntries,
    getLastEntryDate,
    hasEntryToday,
    refreshData
  };
}