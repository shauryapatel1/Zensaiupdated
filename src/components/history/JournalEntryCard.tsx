import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, Edit3, Trash2, Eye, ChevronUp, ChevronDown, X, Save } from 'lucide-react';
import { MoodLevel } from '../../types';
import { moods } from '../../data/moods';
import MoodSelector from '../MoodSelector';
import { JOURNAL } from '../../constants/uiStrings';

/**
 * Interface for journal entry data
 * @interface JournalEntry
 */
interface JournalEntry {
  id: string;
  content: string;
  mood: string;
  title: string | null;
  photo_url: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * JournalEntryCard - Displays a single journal entry with view/edit functionality
 * 
 * @component
 * @param {JournalEntry} entry - Journal entry data
 * @param {boolean} isExpanded - Whether the entry is expanded to show full content
 * @param {boolean} isEditing - Whether the entry is in edit mode
 * @param {function} onToggleExpand - Function to toggle expanded state
 * @param {function} onEdit - Function to enter edit mode
 * @param {function} onDelete - Function to delete the entry
 * @param {function} onSaveEdit - Function to save edits
 * @param {function} onCancelEdit - Function to cancel editing
 * @param {number} index - Index of the entry in the list
 * @param {number} delay - Animation delay
 * 
 * @example
 * return (
 *   <JournalEntryCard
 *     entry={entry}
 *     isExpanded={expandedEntry === entry.id}
 *     isEditing={editingEntry?.id === entry.id}
 *     onToggleExpand={toggleEntryExpansion}
 *     onEdit={handleEditEntry}
 *     onDelete={handleDeleteEntry}
 *     onSaveEdit={handleSaveEdit}
 *     onCancelEdit={() => setEditingEntry(null)}
 *     index={index}
 *     delay={0.1}
 *   />
 * )
 */
interface JournalEntryCardProps {
  entry: JournalEntry;
  isExpanded: boolean;
  isEditing: boolean;
  onToggleExpand: (id: string) => void;
  onEdit: (entry: JournalEntry) => void;
  onDelete: (id: string) => void;
  onSaveEdit: (id: string, content: string, title: string | null, mood: MoodLevel) => Promise<void>;
  onCancelEdit: () => void;
  index: number;
  delay: number;
}

const JournalEntryCard = React.memo(function JournalEntryCard({
  entry,
  isExpanded,
  isEditing,
  onToggleExpand,
  onEdit,
  onDelete,
  onSaveEdit,
  onCancelEdit,
  index,
  delay
}: JournalEntryCardProps) {
  const [editContent, setEditContent] = useState(entry.content);
  const [editTitle, setEditTitle] = useState(entry.title || '');
  const [editMood, setEditMood] = useState<MoodLevel>(getMoodLevel(entry.mood));
  
  const entryMoodData = moods.find(m => m.level === getMoodLevel(entry.mood));
  const isEditable = !isEditing;
  const needsExpansion = entry.content.length > 150;

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

  function formatTime(dateString: string) {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  }

  const handleSave = async () => {
    await onSaveEdit(entry.id, editContent, editTitle || null, editMood);
  };

  return (
    <motion.div
      className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 dark:border-gray-600/20 overflow-hidden"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: delay }}
      whileHover={{ scale: isEditable ? 1.01 : 1 }}
    >
      {isEditing ? (
        /* Edit Mode */
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-display font-semibold text-zen-sage-800 dark:text-gray-200">
              Edit Entry
            </h4>
            <div className="flex space-x-2">
              <button
                onClick={handleSave}
                className="p-2 text-zen-mint-600 hover:text-zen-mint-700 hover:bg-zen-mint-100 dark:hover:bg-zen-mint-900/30 rounded-lg transition-colors"
                aria-label="Save changes"
              >
                <Save className="w-4 h-4" aria-hidden="true" />
              </button>
              <button
                onClick={onCancelEdit}
                className="p-2 text-zen-sage-500 hover:text-zen-sage-700 hover:bg-zen-sage-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                aria-label="Cancel editing"
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zen-sage-700 dark:text-gray-300 mb-2" htmlFor={`edit-title-${entry.id}`}>
                Title (optional)
              </label>
              <input
                id={`edit-title-${entry.id}`}
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                placeholder="Add a title to your entry..."
                className="w-full px-4 py-2 border border-zen-sage-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-zen-mint-400 focus:border-transparent bg-white/70 dark:bg-gray-700 text-zen-sage-800 dark:text-gray-200"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zen-sage-700 dark:text-gray-300 mb-2" id={`edit-mood-${entry.id}-label`}>
                How are you feeling?
              </label>
              <MoodSelector
                selectedMood={editMood}
                onMoodSelect={setEditMood}
                size="md"
                layout="horizontal"
                aria-labelledby={`edit-mood-${entry.id}-label`}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zen-sage-700 dark:text-gray-300 mb-2" htmlFor={`edit-content-${entry.id}`}>
                Your thoughts
              </label>
              <textarea
                id={`edit-content-${entry.id}`}
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                rows={6}
                className="w-full px-4 py-3 border border-zen-sage-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-zen-mint-400 focus:border-transparent bg-white/70 dark:bg-gray-700 text-zen-sage-800 dark:text-gray-200 resize-none"
                placeholder="What's on your mind?"
              />
            </div>
          </div>
        </div>
      ) : (
        /* View Mode */
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="text-2xl" aria-hidden="true">{entryMoodData?.emoji}</div>
              <div>
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-zen-sage-400 dark:text-gray-500" aria-hidden="true" />
                  <span className="text-sm font-medium text-zen-sage-600 dark:text-gray-400">
                    {formatTime(entry.created_at)}
                  </span>
                  <span className="text-xs text-zen-sage-400 dark:text-gray-500" aria-hidden="true">•</span>
                  <span className="text-sm text-zen-sage-600 dark:text-gray-400">
                    {entryMoodData?.label}
                  </span>
                </div>
                {entry.title && (
                  <h4 className="font-display font-semibold text-zen-sage-800 dark:text-gray-200 mt-1">
                    {entry.title}
                  </h4>
                )}
              </div>
            </div>

            <div className="flex space-x-2">
              <button
                onClick={() => onEdit(entry)}
                className="p-2 text-zen-sage-500 hover:text-zen-sage-700 hover:bg-zen-sage-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                aria-label="Edit entry"
              >
                <Edit3 className="w-4 h-4" aria-hidden="true" />
              </button>
              <button
                onClick={() => onDelete(entry.id)}
                className="p-2 text-red-500 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                aria-label="Delete entry"
              >
                <Trash2 className="w-4 h-4" aria-hidden="true" />
              </button>
              <button
                onClick={() => onToggleExpand(entry.id)}
                className="p-2 text-zen-sage-500 hover:text-zen-sage-700 hover:bg-zen-sage-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                aria-label={isExpanded ? "Collapse entry" : "Expand entry"}
                aria-expanded={isExpanded}
              >
                {isExpanded ? <ChevronUp className="w-4 h-4" aria-hidden="true" /> : <Eye className="w-4 h-4" aria-hidden="true" />}
              </button>
            </div>
          </div>

          <div className={`text-zen-sage-700 dark:text-gray-300 leading-relaxed ${
            isExpanded ? '' : 'line-clamp-3'
          }`}>
            {entry.content}
          </div>

          {entry.photo_url && (
            <div className="mt-4">
              <img
                src={entry.photo_url}
                alt="Journal entry"
                className="rounded-xl max-w-full h-auto shadow-md"
              />
            </div>
          )}

          {!isExpanded && needsExpansion && (
            <button
              onClick={() => onToggleExpand(entry.id)}
              className="mt-3 text-zen-mint-600 hover:text-zen-mint-700 text-sm font-medium"
              aria-label="Read more of this entry"
            >
              Read more...
            </button>
          )}
        </div>
      )}
    </motion.div>
  );
});

export default JournalEntryCard;