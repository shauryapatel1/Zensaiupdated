import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, Calendar, Heart, Sparkles, AlertCircle, CheckCircle, Trophy, Target, BarChart3, BookOpen, Lightbulb, RefreshCw, Save, Volume2, Settings } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useJournal } from '../hooks/useJournal';
import { usePromptGenerator } from '../hooks/usePromptGenerator';
import { useMoodAnalyzer } from '../hooks/useMoodAnalyzer';
import { useAffirmationGenerator } from '../hooks/useAffirmationGenerator';
import { useMoodQuoteGenerator } from '../hooks/useMoodQuoteGenerator';
import { useVoiceSynthesis } from '../hooks/useVoiceSynthesis';
import { usePremium } from '../hooks/usePremium';
import Logo from './Logo';
import BadgeWidget from './BadgeWidget';
import UpsellModal from './UpsellModal';
import LottieAvatar from './LottieAvatar';
import MoodHistoryScreen from './MoodHistoryScreen';
import SettingsScreen from './SettingsScreen';
import BadgesScreen from './BadgesScreen';
import PremiumPage from './PremiumPage';
import ToastNotification, { ToastType } from './ToastNotification';
import { MoodLevel } from '../types';
import { moods } from '../data/moods';
import WelcomeSection from './journal/WelcomeSection';
// Import memoized components
import JournalEntryForm from './journal/JournalEntryForm';
import AffirmationDisplay from './journal/AffirmationDisplay';
import MoodQuoteDisplay from './journal/MoodQuoteDisplay';

// Define available Lottie animation variants
const LOTTIE_VARIANTS = ['greeting', 'journaling', 'typing', 'coding', 'music'];

export default function AuthenticatedApp() {
  const { user, logout } = useAuth();
  const { 
    addEntry, 
    entries,
    badges,
    getStreak, 
    getBestStreak, 
    getTotalEntries, 
    hasEntryToday, 
    isLoading: journalLoading,
    error: journalError 
  } = useJournal();
  
  const [currentView, setCurrentView] = useState<'journal' | 'history' | 'settings' | 'badges' | 'premium'>('journal');
  const [selectedMood, setSelectedMood] = useState<MoodLevel>();
  const [journalEntry, setJournalEntry] = useState('');
  const [entryTitle, setEntryTitle] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [zenoVariant, setZenoVariant] = useState<'idle' | 'greeting' | 'journaling' | 'typing'>('greeting');
  const [successMessage, setSuccessMessage] = useState('');
  const [dailyPrompt, setDailyPrompt] = useState<string>('');
  const [isLoadingPrompt, setIsLoadingPrompt] = useState(true);
  const [promptError, setPromptError] = useState<string | null>(null);
  const [aiDetectedMood, setAiDetectedMood] = useState<MoodLevel | null>(null);
  const [showMoodSuggestion, setShowMoodSuggestion] = useState(false);
  const [affirmation, setAffirmation] = useState<string | null>(null);
  const [showAffirmation, setShowAffirmation] = useState(false);
  const [affirmationError, setAffirmationError] = useState<string | null>(null);
  const [moodConfirmed, setMoodConfirmed] = useState(false);
  const [showMoodConfirmation, setShowMoodConfirmation] = useState(false);
  const [moodQuote, setMoodQuote] = useState<{ quote: string; attribution?: string } | null>(null);
  const [showMoodQuote, setShowMoodQuote] = useState(false);
  const [isTextareaFocused, setIsTextareaFocused] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);
  const [randomZenoVariant, setRandomZenoVariant] = useState<string>('greeting');

  // Initialize all hooks first before any useCallback that depends on them
  const { generatePrompt } = usePromptGenerator();
  const { analyzeMood, isAnalyzing: isMoodAnalyzing } = useMoodAnalyzer();
  const { generateAffirmation, isGenerating: isGeneratingAffirmation, error: affirmationGenerationError } = useAffirmationGenerator();
  const { generateMoodQuote, isGenerating: isGeneratingMoodQuote, error: moodQuoteError } = useMoodQuoteGenerator();
  
  const { 
    generateAndPlaySpeech, 
    stopSpeech, 
    isGenerating: isGeneratingSpeech, 
    isPlaying: isSpeechPlaying,
    error: speechError,
    clearError: clearSpeechError
  } = useVoiceSynthesis();

  // Premium features
  const {
    isPremium, 
    isUpsellModalOpen, 
    upsellContent, 
    showUpsellModal, 
    hideUpsellModal 
  } = usePremium();

  // Memoize callback functions
  const generateMoodQuoteForMood = React.useCallback(async (mood: MoodLevel, entry?: string) => {
    try {
      const quote = await generateMoodQuote(mood, entry);
      if (quote) {
        setMoodQuote(quote);
        setShowMoodQuote(true);
      }
    } catch (err) {
      console.error('Failed to generate mood quote:', err);
    }
  }, [generateMoodQuote]);

  // Toast notification state
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<ToastType>('success');
  const [toastBadge, setToastBadge] = useState<{ icon: string; name: string; rarity: string } | undefined>();
  
  // Track previous badges to detect new ones
  const [previousBadges, setPreviousBadges] = useState<string[]>([]);

  const streak = getStreak();
  const bestStreak = getBestStreak();
  const totalEntries = getTotalEntries();
  const alreadyJournaledToday = hasEntryToday(); 
  const currentMood = selectedMood ? moods.find(m => m.level === selectedMood) : undefined;

  const showToast = React.useCallback((message: string, type: ToastType = 'success', badge?: { icon: string; name: string; rarity: string }) => {
    setToastMessage(message);
    setToastType(type);
    setToastBadge(badge);
    setToastVisible(true);
  }, []);

  const getGreeting = React.useCallback(() => {
    const hour = new Date().getHours();
    const name = user?.name || 'friend';
    if (hour < 12) return `Good morning, ${name}!`;
    if (hour < 17) return `Good afternoon, ${name}!`;
    return `Good evening, ${name}!`;
  }, [user?.name]);

  const getCurrentDate = React.useCallback(() => {
    const today = new Date();
    return today.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long', 
      day: 'numeric'
    });
  }, []);

  const getDailyPrompt = React.useCallback(() => {
    if (isLoadingPrompt) return "Loading today's reflection prompt...";
    if (promptError) return "How are you feeling today? What's on your mind?";
    if (dailyPrompt) return dailyPrompt;
    
    const prompts = [
      "What are three things you're grateful for today?",
      "How are you feeling right now, and what might be contributing to that feeling?",
      "What's one small thing that brought you joy today?",
      "If you could give your past self one piece of advice, what would it be?",
      "What's something you're looking forward to?",
      "Describe a moment today when you felt most like yourself.",
      "What's one thing you learned about yourself recently?",
      "How did you show kindness to yourself or others today?",
      "What would you like to let go of today?",
      "What's one thing you accomplished today, no matter how small?"
    ];
    
    const today = new Date();
    const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000);
    return prompts[dayOfYear % prompts.length];
  }, [isLoadingPrompt, promptError, dailyPrompt]);

  // Helper functions
  const getMoodString = React.useCallback((mood: MoodLevel): string => {
    const moodMap: Record<MoodLevel, string> = {
      1: 'very sad',
      2: 'sad',
      3: 'neutral',
      4: 'happy',
      5: 'very happy'
    };
    return moodMap[mood];
  }, []);

  const getMoodAnimation = React.useCallback((mood: MoodLevel): 'idle' | 'greeting' | 'journaling' | 'typing' => {
    if (mood <= 2) return 'idle';
    if (mood >= 4) return 'greeting';
    return 'idle';
  }, []);

  const getMoodEncouragement = React.useCallback((mood: MoodLevel): string => {
    const encouragements: Record<MoodLevel, string> = { 
      1: 'Remember, tough times don\'t last, but tough people do. 💪',
      2: 'Every small step forward is progress. You\'re doing great! 🌱',
      3: 'Balance is beautiful. You\'re exactly where you need to be. ⚖️',
      4: 'Your positive energy is contagious! Keep shining! ✨',
      5: 'What a wonderful day to celebrate your joy! 🎉'
    };
    return encouragements[mood] || '';
  }, []);

  const getFallbackAffirmation = React.useCallback((mood: MoodLevel): string => {
    const affirmations: Record<MoodLevel, string> = {
      1: 'You are stronger than you know, and this difficult moment will pass. Your feelings are valid, and you deserve compassion.',
      2: 'It\'s okay to have challenging days. You\'re human, and you\'re doing the best you can. Tomorrow brings new possibilities.',
      3: 'You are perfectly balanced in this moment. Trust in your journey and know that you are exactly where you need to be.',
      4: 'Your positive energy lights up the world around you. Keep embracing the joy that flows through your life.',
      5: 'What a beautiful soul you are! Your happiness is a gift to yourself and everyone around you. Celebrate this wonderful moment!'
    };
    return affirmations[mood] || 'You are worthy of love, happiness, and all the good things life has to offer.';
  }, []);

  const loadDailyPrompt = React.useCallback(async () => {
    setIsLoadingPrompt(true);
    setPromptError(null);
    
    try {
      const moodString = selectedMood ? getMoodString(selectedMood) : undefined;
      const newPrompt = await generatePrompt({
        mood: moodString,
        previousPrompts: []
      });
      
      // The generatePrompt function now always returns a prompt (fallback if needed)
      setDailyPrompt(newPrompt || getDailyPrompt());
    } catch (err) {
      console.error('Failed to generate new prompt:', err);
      setPromptError('Failed to load today\'s prompt');
    } finally {
      setIsLoadingPrompt(false);
    }
  }, [selectedMood, generatePrompt, getDailyPrompt, getMoodString]);

  const handleGenerateNewPrompt = React.useCallback(async () => {
    setIsLoadingPrompt(true);
    setPromptError(null);
    
    try {
      const moodString = selectedMood ? getMoodString(selectedMood) : undefined;
      const newPrompt = await generatePrompt({
        mood: moodString,
        previousPrompts: dailyPrompt ? [dailyPrompt] : []
      });
      
      // The generatePrompt function now always returns a prompt (fallback if needed)
      setDailyPrompt(newPrompt || getDailyPrompt());
    } catch (err) {
      console.error('Failed to generate new prompt:', err);
      setPromptError('Failed to generate new prompt');
    } finally {
      setIsLoadingPrompt(false);
    }
  }, [selectedMood, dailyPrompt, generatePrompt, getDailyPrompt, getMoodString]);

  const handleAcceptAiMood = React.useCallback(() => {
    if (aiDetectedMood) {
      setSelectedMood(aiDetectedMood);
      setShowMoodSuggestion(false);
      setMoodConfirmed(true);
      setShowMoodConfirmation(true);
      setTimeout(() => setShowMoodConfirmation(false), 3000);
    }
  }, [aiDetectedMood]);

  const handleDismissMoodSuggestion = React.useCallback(() => {
    setShowMoodSuggestion(false);
    setAiDetectedMood(null);
    setMoodConfirmed(true);
    setShowMoodConfirmation(true);
    setTimeout(() => setShowMoodConfirmation(false), 3000);
  }, []);

  const handleMoodSelect = React.useCallback((mood: MoodLevel) => {
    setSelectedMood(mood);
    setMoodConfirmed(true);
    setShowMoodConfirmation(true);
    
    // Generate mood quote when mood is selected
    generateMoodQuoteForMood(mood);
    
    setTimeout(() => setShowMoodConfirmation(false), 3000);
  }, [generateMoodQuoteForMood]);

  const handleSubmit = React.useCallback(async () => {
    if (!journalEntry?.trim() || !selectedMood) return;

    setIsSubmitting(true);
    setError('');
    setAffirmationError(null);
    setShowAffirmation(false);
    
    try {
      // First, analyze the mood using AI
      let detectedMood: MoodLevel | null = null;
      let finalMood = selectedMood;
      
      try {
        detectedMood = await analyzeMood(journalEntry.trim());
        if (detectedMood) {
          finalMood = detectedMood;
          // Update Zeno's animation based on detected mood
          setZenoVariant(getMoodAnimation(detectedMood));
        }
      } catch (moodError) {
        console.warn('Mood analysis failed, using user-selected mood:', moodError);
        // Continue with user-selected mood if AI analysis fails
      }
      
      setZenoVariant('typing'); // Show typing animation while saving
      
      // Save to database
      const result = await addEntry(journalEntry.trim(), entryTitle, finalMood, selectedPhoto || undefined);
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to save your entry');
      }

      // Generate affirmation after successful save
      try {
        const generatedAffirmation = await generateAffirmation(journalEntry.trim(), finalMood);
        
        if (generatedAffirmation) {
          setAffirmation(generatedAffirmation);
          setShowAffirmation(true);
        } else {
          // Use fallback affirmation if generation fails
          const fallbackAffirmation = getFallbackAffirmation(finalMood);
          setAffirmation(fallbackAffirmation);
          setShowAffirmation(true);
          setAffirmationError('Sorry, I couldn\'t generate a personalized affirmation. Here\'s some encouragement from my heart!');
        }
      } catch (affirmationErr) {
        console.error('Affirmation generation failed:', affirmationErr);
        setAffirmationError('Sorry, I couldn\'t generate an affirmation. Please try again.');
      }

      // Generate mood quote for the final mood
      generateMoodQuoteForMood(finalMood, journalEntry.trim());

      // Get updated streak for success message
      const newStreak = getStreak();
      const newBestStreak = getBestStreak();
      
      // Create success message based on streak
      let message = 'Entry saved! Zeno is proud of you! 🎉';
      
      if (newStreak === 1) {
        message = 'Great start! You\'ve begun your journaling journey! 🌱';
      } else if (newStreak > 1) {
        message = `Amazing! You're on a ${newStreak}-day streak! 🔥`;
        
        if (newStreak === newBestStreak && newStreak > 1) {
          message += ' That\'s a new personal best! 🏆';
        }
      }
      
      // Add mood-specific encouragement
      if (detectedMood) {
        const moodEncouragement = getMoodEncouragement(detectedMood);
        if (moodEncouragement) {
          message += ` ${moodEncouragement}`;
        }
      }
      
      setSuccessMessage(message);

      setJournalEntry('');
      setEntryTitle('');
      setSelectedMood(undefined);
      setSelectedPhoto(null);
      setAiDetectedMood(null);
      setShowMoodSuggestion(false);
      setShowMoodQuote(false);
      setZenoVariant('greeting');
      setShowSuccess(true);

      setTimeout(() => setShowSuccess(false), 3000);
      // Keep affirmation visible longer
      setTimeout(() => setShowAffirmation(false), 8000);
      // Keep mood quote visible for a moderate duration
      setTimeout(() => setShowMoodQuote(false), 6000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }, [journalEntry, entryTitle, selectedMood, selectedPhoto, analyzeMood, getMoodAnimation, addEntry, generateAffirmation, getFallbackAffirmation, generateMoodQuoteForMood, getStreak, getBestStreak, getMoodEncouragement]);

  // Set a random Zeno variant on component mount
  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * LOTTIE_VARIANTS.length);
    setRandomZenoVariant(LOTTIE_VARIANTS[randomIndex]);
  }, []);

  // Initialize previous badges on first load
  useEffect(() => {
    if (badges.length > 0 && previousBadges.length === 0) {
      setPreviousBadges(badges.filter(b => b.earned).map(b => b.id));
    }
  }, [badges, previousBadges.length]);

  // Check for new badges and show notifications
  useEffect(() => {
    if (badges.length > 0 && previousBadges.length > 0) {
      const currentEarnedBadges = badges.filter(b => b.earned).map(b => b.id);
      const newBadges = currentEarnedBadges.filter(id => !previousBadges.includes(id));
      
      if (newBadges.length > 0) {
        // Show notification for the first new badge
        const newBadge = badges.find(b => b.id === newBadges[0] && b.earned);
        if (newBadge) {
          showToast(
            `Congratulations! You've earned the "${newBadge.badge_name}" badge!`,
            'badge',
            {
              icon: newBadge.badge_icon,
              name: newBadge.badge_name,
              rarity: newBadge.badge_rarity
            }
          );
        }
        
        // Update previous badges
        setPreviousBadges(currentEarnedBadges);
      }
    }
  }, [badges, previousBadges, showToast]);

  // Load initial prompt on component mount
  useEffect(() => {
    if (user) {
      loadDailyPrompt();
    }
  }, [user, loadDailyPrompt]);

  // Analyze mood when user finishes typing (with debounce) 
  useEffect(() => {
    if (!journalEntry.trim() || journalEntry.length < 20) {
      setAiDetectedMood(null);
      setShowMoodSuggestion(false);
      return;
    }

    const timeoutId = setTimeout(async () => {
      const detectedMood = await analyzeMood(journalEntry);
      if (detectedMood && detectedMood !== selectedMood) {
        setAiDetectedMood(detectedMood);
        setShowMoodSuggestion(true);
      }
    }, 2000); // Wait 2 seconds after user stops typing

    return () => clearTimeout(timeoutId);
  }, [journalEntry, selectedMood, analyzeMood]);

  // Update Zeno's animation based on user interaction
  useEffect(() => {
    if (isSubmitting || isGeneratingAffirmation || isGeneratingSpeech) {
      setZenoVariant('typing');
    } else if (journalEntry.length > 0) {
      setZenoVariant('journaling');
    } else if (selectedMood) {
      setZenoVariant('idle');
    } else {
      setZenoVariant('greeting');
    }
  }, [isSubmitting, isGeneratingAffirmation, isGeneratingSpeech, journalEntry, selectedMood]);

  const getContextualMessage = React.useCallback((): string => {
    if (entries.length === 0) return '';
    
    try {
      const recentEntry = entries[0];
      const recentMoodLevel = getMoodLevel(recentEntry.mood);
      const daysSinceLastEntry = Math.floor((Date.now() - new Date(recentEntry.created_at).getTime()) / (1000 * 60 * 60 * 24));
    
      if (daysSinceLastEntry === 0) {
        // Same day
        const messages: Record<MoodLevel, string> = {
          1: 'I see you\'re going through a tough time. Remember, I\'m here with you every step of the way.',
          2: 'You\'ve been feeling low lately. Your courage to keep journaling shows your inner strength.',
          3: 'You\'re finding your balance. Each reflection brings you closer to understanding yourself.',
          4: 'Your positive energy has been shining through your recent entries. Keep nurturing that light!',
          5: 'What a joy it is to see you flourishing! Your happiness radiates through your words.'
        };
        return messages[recentMoodLevel] || 'Thank you for sharing your thoughts with me.';
      } else if (daysSinceLastEntry === 1) {
        return 'Welcome back! I\'ve been thinking about our last conversation.';
      } else if (daysSinceLastEntry <= 7) {
        return `It\'s been ${daysSinceLastEntry} days since we last talked. I\'m glad you\'re here.`;
      } else {
        return 'It\'s wonderful to have you back. I\'ve missed our conversations.';
      }
    } catch (err) {
      console.error('Error generating contextual message:', err);
      return '';
    }
  }, [entries]);

  const getMoodLevel = React.useCallback((moodString: string): MoodLevel => {
    const moodMap: Record<string, MoodLevel> = {
      'struggling': 1,
      'low': 2,
      'neutral': 3,
      'good': 4,
      'amazing': 5
    };
    return moodMap[moodString] || 3;
  }, []);

  const formatDate = React.useCallback((dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }, []);

  // Show journal loading state
  if (journalLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-zen-mint-50 via-zen-cream-50 to-zen-lavender-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="w-16 h-16 border-4 border-zen-mint-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-zen-sage-600 dark:text-gray-300 font-medium">Loading your journal...</p>
        </motion.div>
      </div>
    );
  }

  // Show journal error state
  if (journalError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-zen-mint-50 via-zen-cream-50 to-zen-lavender-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
        <motion.div
          className="text-center max-w-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-display font-bold text-zen-sage-800 mb-2">
            Oops! Something went wrong
          </h2>
          <p className="text-zen-sage-600 mb-6">{journalError}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-gradient-to-r from-zen-mint-400 to-zen-mint-500 text-white font-medium rounded-xl hover:from-zen-mint-500 hover:to-zen-mint-600 transition-all duration-300"
          >
            Try Again
          </button>
        </motion.div>
      </div>
    );
  }

  // Show history view
  if (currentView === 'history') {
    return <MoodHistoryScreen onBack={() => setCurrentView('journal')} />;
  }

  // Show settings view
  if (currentView === 'settings') {
    return <SettingsScreen onBack={() => setCurrentView('journal')} />;
  }

  // Show badges view
  if (currentView === 'badges') {
    return <BadgesScreen onBack={() => setCurrentView('journal')} />;
  }
  
  // Show premium view
  if (currentView === 'premium') {
    return <PremiumPage onBack={() => setCurrentView('journal')} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-zen-mint-50 via-zen-cream-50 to-zen-lavender-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Floating Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 left-10 w-32 h-32 bg-zen-mint-200 rounded-full opacity-20"
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
          className="absolute top-40 right-20 w-24 h-24 bg-zen-lavender-200 rounded-full opacity-20"
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
          className="absolute bottom-32 left-1/4 w-40 h-40 bg-zen-peach-200 rounded-full opacity-15"
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
        className="relative z-10 p-4 flex justify-between items-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex items-center space-x-3">
          <Logo size="md" />
          <h1 className="font-display font-bold text-zen-sage-800 dark:text-gray-200">Zensai</h1>
          <p className="text-xs text-zen-sage-600 dark:text-gray-400">with Zeno</p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setCurrentView('history')}
            className="flex items-center space-x-2 px-3 py-2 text-zen-sage-600 dark:text-gray-400 hover:text-zen-sage-800 dark:hover:text-gray-200 hover:bg-white/50 dark:hover:bg-gray-700/50 rounded-full transition-all duration-300"
          >
            <BarChart3 className="w-4 h-4" />
            <span className="text-sm font-medium hidden sm:inline">Journal Dashboard</span>
          </button>
          <button
            onClick={() => setCurrentView('badges')}
            className="flex items-center space-x-2 px-3 py-2 text-zen-sage-600 dark:text-gray-400 hover:text-zen-sage-800 dark:hover:text-gray-200 hover:bg-white/50 dark:hover:bg-gray-700/50 rounded-full transition-all duration-300 relative"
          >
            <Trophy className="w-4 h-4" />
            <span className="text-sm font-medium hidden sm:inline">Badges</span>
            {badges.filter(b => b.earned).length > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-zen-peach-400 text-white text-xs rounded-full flex items-center justify-center font-bold">
                {badges.filter(b => b.earned).length}
              </span>
            )}
          </button>
          <button
            onClick={() => setCurrentView('premium')}
            className="flex items-center space-x-2 px-3 py-2 text-zen-sage-600 dark:text-gray-400 hover:text-zen-sage-800 dark:hover:text-gray-200 hover:bg-white/50 dark:hover:bg-gray-700/50 rounded-full transition-all duration-300"
          >
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-medium hidden sm:inline">Premium</span>
          </button>
          <button
            onClick={() => setCurrentView('settings')}
            className="flex items-center space-x-2 px-3 py-2 text-zen-sage-600 dark:text-gray-400 hover:text-zen-sage-800 dark:hover:text-gray-200 hover:bg-white/50 dark:hover:bg-gray-700/50 rounded-full transition-all duration-300"
          >
            <Settings className="w-4 h-4" />
            <span className="text-sm font-medium hidden sm:inline">Settings</span>
          </button>
          <button
            onClick={logout}
            className="p-2 text-zen-sage-600 dark:text-gray-400 hover:text-zen-sage-800 dark:hover:text-gray-200 hover:bg-white/50 dark:hover:bg-gray-700/50 rounded-full transition-all duration-300"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </motion.header>

      {/* Toast Notification */}
      <ToastNotification
        isVisible={toastVisible}
        message={toastMessage}
        type={toastType}
        badge={toastBadge}
        onClose={() => setToastVisible(false)}
        duration={toastType === 'badge' ? 8000 : 5000}
      />

      {/* Success Message */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            className="fixed top-4 right-4 bg-gradient-to-r from-zen-mint-400 to-zen-mint-500 text-white px-6 py-4 rounded-2xl shadow-xl z-50 border border-zen-mint-300"
            initial={{ opacity: 0, x: 100, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.8 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-6 h-6 text-white" />
              <span className="font-medium">{successMessage}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="relative z-10 max-w-4xl mx-auto px-4 pb-8">
        {/* Welcome Section */}
        <WelcomeSection 
          user={user}
          streak={streak}
          bestStreak={bestStreak}
          totalEntries={totalEntries}
          alreadyJournaledToday={alreadyJournaledToday}
          contextualMessage={getContextualMessage()}
        />

        {/* Zeno Avatar */}
        <motion.div
          className="flex justify-center mb-8"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <div className="relative">
            <LottieAvatar 
              variant={isSubmitting || isGeneratingAffirmation || isGeneratingSpeech || journalEntry.length > 0 || selectedMood 
                ? zenoVariant 
                : randomZenoVariant} 
              size="lg" 
            />
            {/* Speech bubble for contextual messages */}
            {(showMoodConfirmation || showAffirmation || showMoodQuote) && (
              <motion.div
                className="absolute -top-16 left-1/2 transform -translate-x-1/2 bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-xl border border-zen-mint-200 dark:border-gray-700 max-w-xs"
                initial={{ opacity: 0, y: 10, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.9 }}
                transition={{ duration: 0.3 }}
              >
                {showMoodConfirmation && (
                  <p className="text-sm text-zen-sage-700 dark:text-gray-300">
                    Perfect! I can sense that energy. ✨
                  </p>
                )}
                {showAffirmation && affirmation && (
                  <div>
                    <p className="text-sm text-zen-sage-700 dark:text-gray-300 mb-2">
                      {affirmation}
                    </p>
                    {affirmationError && (
                      <p className="text-xs text-zen-peach-600 dark:text-zen-peach-400">
                        {affirmationError}
                      </p>
                    )}
                  </div>
                )}
                {showMoodQuote && moodQuote && (
                  <div>
                    <p className="text-sm text-zen-sage-700 dark:text-gray-300 italic">
                      "{moodQuote.quote}"
                    </p>
                    {moodQuote.attribution && (
                      <p className="text-xs text-zen-sage-500 dark:text-gray-400 mt-1">
                        — {moodQuote.attribution}
                      </p>
                    )}
                  </div>
                )}
                {/* Speech bubble tail */}
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-white dark:border-t-gray-800"></div>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Affirmation Display */}
        <AffirmationDisplay
          affirmation={affirmation}
          showAffirmation={showAffirmation}
          affirmationError={affirmationError}
          isGeneratingSpeech={isGeneratingSpeech}
          isSpeechPlaying={isSpeechPlaying}
          onPlaySpeech={() => affirmation && generateAndPlaySpeech(affirmation)}
          onStopSpeech={stopSpeech}
          selectedMood={selectedMood}
          isPremiumUser={isPremium}
          onUpsellTrigger={() => showUpsellModal({
            featureName: 'Voice Synthesis',
            featureDescription: 'Listen to your affirmations with natural-sounding voice.'
          })}
        />
        
        {/* Mood Quote Display */}
        <MoodQuoteDisplay
          moodQuote={moodQuote}
          showMoodQuote={showMoodQuote}
        />

        {/* Journal Entry Form */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-3xl p-6 shadow-xl border border-white/20 dark:border-gray-600/20">
              <h3 className="font-display font-bold text-zen-sage-800 dark:text-gray-200 mb-6 flex items-center space-x-2">
                <BookOpen className="w-5 h-5 text-zen-mint-500" />
                <span>Journal Entry</span>
              </h3>
              
              <JournalEntryForm
                onSubmit={async (content, title, mood, photo) => {
                  setJournalEntry(content);
                  setEntryTitle(title || '');
                  setSelectedMood(mood);
                  setSelectedPhoto(photo);
                  await handleSubmit();
                }}
                isSubmitting={isSubmitting}
                error={error}
                dailyPrompt={getDailyPrompt()}
                isLoadingPrompt={isLoadingPrompt}
                onGenerateNewPrompt={handleGenerateNewPrompt}
                showMoodSuggestion={showMoodSuggestion}
                aiDetectedMood={aiDetectedMood}
                onAcceptAiMood={handleAcceptAiMood}
                onDismissMoodSuggestion={handleDismissMoodSuggestion}
                isPremiumUser={isPremium}
                onUpsellTrigger={() => showUpsellModal({
                  featureName: 'Photo Uploads',
                  featureDescription: 'Add photos to your journal entries to capture special moments.'
                })}
              />
            </div>
          </div>

          {/* Sidebar with Badge Widget */}
          <motion.div
            className="lg:col-span-1"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <BadgeWidget 
              badges={badges} 
              onViewAllBadges={() => setCurrentView('badges')} 
            />
          </motion.div>
        </div>
      </main>

      {/* Upsell Modal */}
      <UpsellModal
        isOpen={isUpsellModalOpen}
        onClose={hideUpsellModal}
        featureName={upsellContent?.featureName || 'Premium Feature'}
        featureDescription={upsellContent?.featureDescription || 'Upgrade to Zensai Premium to unlock this feature and many more!'}
      />
    </div>
  );
}