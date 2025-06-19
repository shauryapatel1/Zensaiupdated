import React, { useState, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, BarChart3 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useJournal } from '../hooks/useJournal';
import { usePremium } from '../hooks/usePremium';
import Logo from './Logo';
import UpsellModal from './UpsellModal';
import { MoodLevel } from '../types';
import { moods } from '../data/moods';

// Import memoized components
import MoodStatsOverview from './history/MoodStatsOverview';
import HistoryFilters from './history/HistoryFilters';
import JournalEntryCard from './history/JournalEntryCard';
import HistoryPagination from './history/HistoryPagination';
import DateGroupHeader from './history/DateGroupHeader';
import EmptyState from './history/EmptyState';
import PremiumHistoryLimit from './history/PremiumHistoryLimit';
import AdvancedAnalytics from './history/AdvancedAnalytics';

interface MoodHistoryScreenProps {
  onBack: () => void;
}

interface JournalEntry {
  id: string;
  content: string;
  mood: string;
  created_at: string;
  updated_at: string;
  photo_url?: string | null;
  photo_filename?: string | null;
  title?: string | null;
}

interface GroupedEntries {
  [date: string]: JournalEntry[];
}

export default function MoodHistoryScreen({ onBack }: MoodHistoryScreenProps) {
  const { user } = useAuth();
  const { isPremium, isUpsellModalOpen, upsellContent, showUpsellModal, hideUpsellModal } = usePremium();
  const { entries, isLoading, error, deleteEntry, updateEntry } = useJournal();
  
  // State management
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMood, setFilterMood] = useState<MoodLevel | 'all'>('all');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [expandedEntry, setExpandedEntry] = useState<string | null>(null);
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  
  const ENTRIES_PER_PAGE = 10;
  
  // Check if we need to show the history limit message
  const showHistoryLimitMessage = !isPremium && entries.length > 0 && 
    (entries.length >= 30 || 
     (new Date().getTime() - new Date(entries[entries.length - 1].created_at).getTime()) / (1000 * 60 * 60 * 24) >= 30);

  // Calculate mood statistics
  const moodStats = useMemo(() => {
    const moodCounts = entries.reduce((acc, entry) => {
      const moodLevel = getMoodLevel(entry.mood);
      acc[moodLevel] = (acc[moodLevel] || 0) + 1;
      return acc;
    }, {} as Record<MoodLevel, number>);

    const total = entries.length;
    return moods.map(mood => ({
      ...mood,
      count: moodCounts[mood.level] || 0,
      percentage: total > 0 ? Math.round(((moodCounts[mood.level] || 0) / total) * 100) : 0
    }));
  }, [entries]);

  // Filter and search entries
  const filteredEntries = useMemo(() => {
    return entries.filter(entry => {
      const matchesMood = filterMood === 'all' || getMoodLevel(entry.mood) === filterMood;
      const matchesSearch = searchTerm === '' || 
        entry.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (entry.title && entry.title.toLowerCase().includes(searchTerm.toLowerCase()));
      return matchesMood && matchesSearch;
    });
  }, [entries, filterMood, searchTerm]);

  // Sort entries
  const sortedEntries = useMemo(() => {
    return [...filteredEntries].sort((a, b) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });
  }, [filteredEntries, sortOrder]);

  // Group entries by date
  const groupedEntries = useMemo(() => {
    return sortedEntries.reduce((groups: GroupedEntries, entry) => {
      const dateKey = getDateKey(entry.created_at);
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(entry);
      return groups;
    }, {});
  }, [sortedEntries]);

  // Pagination
  const groupedDates = Object.keys(groupedEntries);
  const totalPages = Math.ceil(groupedDates.length / ENTRIES_PER_PAGE);
  const paginatedDates = groupedDates.slice(
    (currentPage - 1) * ENTRIES_PER_PAGE,
    currentPage * ENTRIES_PER_PAGE
  );

  // Event handlers
  const handleEditEntry = useCallback((entry: JournalEntry) => {
    setEditingEntry(entry);
    setExpandedEntry(null);
  }, []);

  const handleSaveEdit = useCallback(async (
    entryId: string, 
    content: string, 
    title: string | null, 
    mood: MoodLevel
  ) => {
    try {
      const result = await updateEntry(entryId, content, title, mood);
      if (result.success) {
        setEditingEntry(null);
      }
    } catch (err) {
      console.error('Failed to update entry:', err);
    }
  }, [updateEntry]);

  const handleDeleteEntry = useCallback(async (entryId: string) => {
    if (window.confirm('Are you sure you want to delete this entry? This action cannot be undone.')) {
      try {
        const result = await deleteEntry(entryId);
        if (result.success) {
          setExpandedEntry(null);
        }
      } catch (err) {
        console.error('Failed to delete entry:', err);
      }
    }
  }, [deleteEntry]);

  const toggleEntryExpansion = useCallback((entryId: string) => {
    setExpandedEntry(expandedEntry === entryId ? null : entryId);
  }, [expandedEntry]);

  const clearFilters = useCallback(() => {
    setSearchTerm('');
    setFilterMood('all');
    setCurrentPage(1);
  }, []);

  const handleShowUpsellModal = useCallback(() => {
    showUpsellModal({
      featureName: 'Complete Journal History',
      featureDescription: 'Access your entire journaling history without limits.'
    });
  }, [showUpsellModal]);

  function getMoodLevel(moodString: string): MoodLevel {
    const moodMap: Record<string, MoodLevel> = {
      'struggling': 1,
      'low': 2,
      'neutral': 3,
      'good': 4,
      'amazing': 5
    };
    return moodMap[moodString] || 3;
  }

  function getDateKey(dateString: string) {
    return new Date(dateString).toDateString();
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-zen-mint-50 via-zen-cream-50 to-zen-lavender-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="w-16 h-16 border-4 border-zen-mint-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-zen-sage-600 dark:text-gray-300 font-medium">Loading your journal history...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-zen-mint-50 via-zen-cream-50 to-zen-lavender-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Floating Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 left-10 w-32 h-32 bg-zen-mint-200 dark:bg-zen-mint-800 rounded-full opacity-20"
          animate={{
            x: [0, 30, 0],
            y: [0, -20, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute top-40 right-20 w-24 h-24 bg-zen-lavender-200 dark:bg-zen-lavender-800 rounded-full opacity-20"
          animate={{
            x: [0, -20, 0],
            y: [0, 30, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-32 left-1/4 w-40 h-40 bg-zen-peach-200 dark:bg-zen-peach-800 rounded-full opacity-15"
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 10, 0],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      {/* Header */}
      <motion.header
        className="relative z-10 p-4 bg-white/30 dark:bg-gray-800/30 backdrop-blur-sm border-b border-white/20 dark:border-gray-600/20"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="container mx-auto max-w-6xl flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBack}
              className="p-2 text-zen-sage-600 dark:text-gray-400 hover:text-zen-sage-800 dark:hover:text-gray-200 hover:bg-white/50 dark:hover:bg-gray-700/50 rounded-full transition-all duration-300"
              aria-label="Go back"
            >
              <ArrowLeft className="w-5 h-5" aria-hidden="true" />
            </button>
            
            <div className="flex items-center space-x-3">
              <Logo size="sm" className="mr-1" />
              <h1 className="font-display font-bold text-zen-sage-800 dark:text-gray-200 flex items-center">
                <BarChart3 className="w-5 h-5 mr-2 text-zen-mint-500" aria-hidden="true" />
                Journal Dashboard
              </h1>
              <p className="text-xs text-zen-sage-600 dark:text-gray-400">
                {filteredEntries.length} of {entries.length} entries
              </p>
            </div>
          </div>
        </div>
      </motion.header>

      <div className="container mx-auto px-4 py-6 max-w-6xl">
        {/* Mood Statistics Overview */}
        <MoodStatsOverview moodStats={moodStats} />

        {/* Search and Filters */}
        <HistoryFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          filterMood={filterMood}
          onFilterMoodChange={setFilterMood}
          sortOrder={sortOrder}
          onSortOrderChange={setSortOrder}
          onClearFilters={clearFilters}
        />

        {/* Advanced Analytics Section (Premium Feature) */}
        <AdvancedAnalytics 
          isPremium={isPremium} 
          onUpgrade={handleShowUpsellModal} 
        />

        {/* Premium History Limit Message */}
        <PremiumHistoryLimit 
          showHistoryLimitMessage={showHistoryLimitMessage} 
          onUpgrade={handleShowUpsellModal} 
        />

        {/* Entries Timeline */}
        <div className="space-y-8">
          {paginatedDates.length === 0 ? (
            <EmptyState 
              searchTerm={searchTerm} 
              filterMood={filterMood === 'all' ? 'all' : moods.find(m => m.level === filterMood)?.label || 'all'} 
              onClearFilters={clearFilters} 
            />
          ) : (
            paginatedDates.map((dateKey, dateIndex) => {
              const dayEntries = groupedEntries[dateKey];
              
              return (
                <motion.div
                  key={dateKey}
                  className="relative"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: dateIndex * 0.1 }}
                >
                  {/* Date Header */}
                  <DateGroupHeader 
                    date={dateKey} 
                    entries={dayEntries} 
                    index={dateIndex} 
                  />

                  {/* Entries for this date */}
                  <div className="space-y-4 ml-8">
                    {dayEntries.map((entry, entryIndex) => (
                      <JournalEntryCard
                        key={entry.id}
                        entry={entry}
                        isExpanded={expandedEntry === entry.id}
                        isEditing={editingEntry?.id === entry.id}
                        onToggleExpand={toggleEntryExpansion}
                        onEdit={handleEditEntry}
                        onDelete={handleDeleteEntry}
                        onSaveEdit={handleSaveEdit}
                        onCancelEdit={() => setEditingEntry(null)}
                        index={entryIndex}
                        delay={dateIndex * 0.1 + entryIndex * 0.05}
                      />
                    ))}
                  </div>
                </motion.div>
              );
            })
          )}
        </div>

        {/* Pagination */}
        <HistoryPagination 
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* Upsell Modal */}
      <UpsellModal
        isOpen={isUpsellModalOpen}
        onClose={hideUpsellModal}
        featureName={upsellContent?.featureName || 'Premium Feature'}
        featureDescription={upsellContent?.featureDescription || 'Upgrade to unlock premium features'}
      />
    </div>
  );
}