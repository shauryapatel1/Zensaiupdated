import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { MoodLevel } from '../types';

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

interface AddEntryResult {
  success: boolean;
  error?: string;
}

export function useJournalEntries() {
  const { user, isAuthenticated } = useAuth();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadEntries = async (isPremium: boolean) => {
    if (!user) return;

    try {
      setIsLoading(true);
      setError(null);

      // Load recent journal entries
      // For free users, limit to 30 days or 30 entries
      let query = supabase
        .from('journal_entries')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (!isPremium) {
        // Get entries from the last 30 days or the most recent 30 entries
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        query = query
          .gt('created_at', thirtyDaysAgo.toISOString())
          .limit(30);
      }

      const { data: entriesData, error: entriesError } = await query;

      if (entriesError) {
        console.error('Error loading entries:', entriesError);
        setError('Failed to load journal entries');
        return;
      }

      setEntries(entriesData || []);
    } catch (err) {
      console.error('Error loading entries:', err);
      setError('An unexpected error occurred while loading entries');
    } finally {
      setIsLoading(false);
    }
  };

  const addEntry = async (
    content: string, 
    title: string | null,
    mood: MoodLevel, 
    photoFile?: File
  ): Promise<AddEntryResult> => {
    if (!user || !isAuthenticated) {
      return { success: false, error: 'You must be logged in to save entries' };
    }

    if (!content.trim()) {
      return { success: false, error: 'Entry content cannot be empty' };
    }

    try {
      setError(null);

      // Convert mood level to string
      const moodString = getMoodString(mood);
      
      let photoUrl: string | null = null;
      let photoFilename: string | null = null;

      // Handle photo upload if provided
      if (photoFile) {
        try {
          // Generate unique filename
          const timestamp = Date.now();
          const fileExt = photoFile.name.split('.').pop()?.toLowerCase();
          const fileName = `${user.id}/${timestamp}_${Math.random().toString(36).substring(7)}.${fileExt}`;
          
          // Upload to Supabase Storage
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('journal-photos')
            .upload(fileName, photoFile, {
              cacheControl: '3600',
              upsert: false
            });

          if (uploadError) {
            console.error('Photo upload error:', uploadError);
            return { success: false, error: 'Failed to upload photo. Please try again.' };
          }

          // Get public URL
          const { data: urlData } = supabase.storage
            .from('journal-photos')
            .getPublicUrl(fileName);

          photoUrl = urlData.publicUrl;
          photoFilename = photoFile.name;
        } catch (photoError) {
          console.error('Photo processing error:', photoError);
          return { success: false, error: 'Failed to process photo. Please try again.' };
        }
      }

      // Insert journal entry
      const { data: entryData, error: entryError } = await supabase
        .from('journal_entries')
        .insert({
          user_id: user.id,
          content: content.trim(),
          title: title?.trim() || null,
          mood: moodString,
          photo_url: photoUrl,
          photo_filename: photoFilename
        })
        .select()
        .single();

      if (entryError) {
        console.error('Error saving entry:', entryError);
        return { success: false, error: 'Failed to save your journal entry. Please try again.' };
      }

      // Update local state
      setEntries(prev => [entryData, ...prev]);

      return { success: true };
    } catch (err) {
      console.error('Error adding entry:', err);
      return { success: false, error: 'An unexpected error occurred. Please try again.' };
    }
  };

  const updateEntry = async (
    entryId: string, 
    content: string, 
    title: string | null,
    mood: MoodLevel, 
    photoFile?: File,
    removePhoto?: boolean
  ): Promise<AddEntryResult> => {
    if (!user || !isAuthenticated) {
      return { success: false, error: 'You must be logged in to update entries' };
    }

    if (!content.trim()) {
      return { success: false, error: 'Entry content cannot be empty' };
    }

    try {
      setError(null);

      // Convert mood level to string
      const moodString = getMoodString(mood);
      
      let photoUrl: string | null = null;
      let photoFilename: string | null = null;
      
      // Get current entry to check for existing photo
      const currentEntry = entries.find(e => e.id === entryId);
      
      if (removePhoto && currentEntry?.photo_url) {
        // Delete existing photo from storage
        try {
          const fileName = currentEntry.photo_url.split('/').pop();
          if (fileName) {
            await supabase.storage
              .from('journal-photos')
              .remove([`${user.id}/${fileName}`]);
          }
        } catch (deleteError) {
          console.warn('Failed to delete old photo:', deleteError);
        }
        photoUrl = null;
        photoFilename = null;
      } else if (photoFile) {
        // Upload new photo
        try {
          // Delete old photo if exists
          if (currentEntry?.photo_url) {
            const oldFileName = currentEntry.photo_url.split('/').pop();
            if (oldFileName) {
              await supabase.storage
                .from('journal-photos')
                .remove([`${user.id}/${oldFileName}`]);
            }
          }
          
          // Upload new photo
          const timestamp = Date.now();
          const fileExt = photoFile.name.split('.').pop()?.toLowerCase();
          const fileName = `${user.id}/${timestamp}_${Math.random().toString(36).substring(7)}.${fileExt}`;
          
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('journal-photos')
            .upload(fileName, photoFile, {
              cacheControl: '3600',
              upsert: false
            });

          if (uploadError) {
            console.error('Photo upload error:', uploadError);
            return { success: false, error: 'Failed to upload photo. Please try again.' };
          }

          const { data: urlData } = supabase.storage
            .from('journal-photos')
            .getPublicUrl(fileName);

          photoUrl = urlData.publicUrl;
          photoFilename = photoFile.name;
        } catch (photoError) {
          console.error('Photo processing error:', photoError);
          return { success: false, error: 'Failed to process photo. Please try again.' };
        }
      } else {
        // Keep existing photo
        photoUrl = currentEntry?.photo_url || null;
        photoFilename = currentEntry?.photo_filename || null;
      }

      // Prepare update data
      const updateData: any = {
        content: content.trim(),
        title: title?.trim() || null,
        mood: moodString,
        updated_at: new Date().toISOString()
      };
      
      // Only update photo fields if they were explicitly changed
      if (removePhoto || photoFile) {
        updateData.photo_url = photoUrl;
        updateData.photo_filename = photoFilename;
      }

      // Update journal entry
      const { error: updateError } = await supabase
        .from('journal_entries')
        .update(updateData)
        .eq('id', entryId)
        .eq('user_id', user.id);

      if (updateError) {
        console.error('Error updating entry:', updateError);
        return { success: false, error: 'Failed to update your journal entry. Please try again.' };
      }

      // Update local state
      setEntries(prev => prev.map(entry => 
        entry.id === entryId 
          ? { 
              ...entry, 
              content: content.trim(), 
              title: title?.trim() || null,
              mood: moodString, 
              updated_at: new Date().toISOString(),
              ...(removePhoto || photoFile ? { photo_url: photoUrl, photo_filename: photoFilename } : {})
            }
          : entry
      ));

      return { success: true };
    } catch (err) {
      console.error('Error updating entry:', err);
      return { success: false, error: 'An unexpected error occurred. Please try again.' };
    }
  };

  const deleteEntry = async (entryId: string): Promise<AddEntryResult> => {
    if (!user || !isAuthenticated) {
      return { success: false, error: 'You must be logged in to delete entries' };
    }

    try {
      setError(null);
      
      // Get entry to check for photo
      const entryToDelete = entries.find(e => e.id === entryId);
      
      // Delete photo from storage if exists
      if (entryToDelete?.photo_url) {
        try {
          const fileName = entryToDelete.photo_url.split('/').pop();
          if (fileName) {
            await supabase.storage
              .from('journal-photos')
              .remove([`${user.id}/${fileName}`]);
          }
        } catch (photoError) {
          console.warn('Failed to delete photo:', photoError);
          // Continue with entry deletion even if photo deletion fails
        }
      }

      // Delete journal entry
      const { error: deleteError } = await supabase
        .from('journal_entries')
        .delete()
        .eq('id', entryId)
        .eq('user_id', user.id);

      if (deleteError) {
        console.error('Error deleting entry:', deleteError);
        return { success: false, error: 'Failed to delete your journal entry. Please try again.' };
      }

      // Update local state
      setEntries(prev => prev.filter(entry => entry.id !== entryId));

      return { success: true };
    } catch (err) {
      console.error('Error deleting entry:', err);
      return { success: false, error: 'An unexpected error occurred. Please try again.' };
    }
  };

  return {
    entries,
    isLoading,
    error,
    loadEntries,
    addEntry,
    updateEntry,
    deleteEntry
  };
}

// Helper function to convert mood level to descriptive string
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