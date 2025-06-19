/**
 * UI Strings for the Zensai application
 * This file centralizes all user-facing text to facilitate future localization
 */

export const APP_NAME = 'Zensai';
export const APP_TAGLINE = 'Journaling, but with a heart.';

// Premium Page
export const PREMIUM = {
  TITLE: 'Choose Your Premium Plan',
  SUBTITLE: 'Unlock the full potential of Zensai with premium features designed to enhance your mindfulness journey.',
  TRIAL_INFO: '7-day free trial, cancel anytime',
  MONTHLY: {
    NAME: 'Monthly Premium',
    PRICE: '$8.99',
    PERIOD: 'per month',
    FEATURES: [
      'Unlimited journal entries with photo attachments',
      'Advanced AI mood analysis & personalized insights',
      'Custom affirmations with voice playback',
      'Complete journal history access',
      'Premium badge collection & achievements',
      'Priority customer support',
    ]
  },
  YEARLY: {
    NAME: 'Yearly Premium',
    PRICE: '$59.99',
    PERIOD: 'per year',
    FEATURES: [
      'All Monthly Premium features included',
      'Save over 44% compared to monthly plan',
      'VIP priority support with 24-hour response time',
      'Early access to all new features and updates',
      'Exclusive "Premium Plus" badge for your collection',
      'Advanced analytics and mood trend insights',
    ],
    POPULAR_TAG: 'Most Popular • Save 44%'
  },
  FEATURES_SECTION: {
    TITLE: 'Premium Features',
    ITEMS: [
      {
        TITLE: 'Personalized AI Insights',
        DESCRIPTION: 'Receive tailored mood analysis, personalized affirmations, and deep emotional pattern insights powered by advanced AI.'
      },
      {
        TITLE: 'Unlimited Journal Features',
        DESCRIPTION: 'Enjoy unlimited journal entries with photo attachments, complete history access, and voice-enabled affirmations.'
      },
      {
        TITLE: 'VIP Support & Early Access',
        DESCRIPTION: 'Receive priority customer support and exclusive early access to all new features before they\'re released to everyone else.'
      }
    ]
  },
  FAQ: {
    TITLE: 'Frequently Asked Questions',
    ITEMS: [
      {
        QUESTION: 'What happens after my 7-day free trial?',
        ANSWER: 'After your trial ends, you\'ll be charged for your selected plan. You can cancel anytime before the trial ends to avoid being charged. We\'ll send you a reminder email before your trial expires.'
      },
      {
        QUESTION: 'Can I switch between monthly and yearly plans?',
        ANSWER: 'Yes, you can switch plans at any time. If you upgrade from monthly to yearly, you\'ll receive a prorated credit for your remaining monthly subscription. Switching from yearly to monthly will take effect at your next renewal date.'
      },
      {
        QUESTION: 'How do I cancel my subscription?',
        ANSWER: 'You can cancel your subscription anytime from the Settings page or by contacting our support team. Your premium features will remain active until the end of your current billing period, and you won\'t be charged again.'
      },
      {
        QUESTION: 'Is my payment information secure?',
        ANSWER: 'Absolutely. All payments are processed securely through Stripe, a PCI-DSS Level 1 certified payment processor. We never store your credit card information on our servers, ensuring maximum security for your financial data.'
      }
    ]
  },
  BUTTONS: {
    SUBSCRIBE: 'Subscribe',
    CURRENT_PLAN: 'Current Plan',
    PROCESSING: 'Processing...',
    UPGRADE: 'Upgrade to Premium',
    MANAGE: 'Manage Subscription'
  }
};

// Upsell Modal
export const UPSELL = {
  TITLE: 'Upgrade to Premium',
  DEFAULT_FEATURE_NAME: 'Premium Feature',
  DEFAULT_DESCRIPTION: 'Upgrade to Zensai Premium to unlock this feature and many more!',
  FEATURES: [
    'Unlimited journal entries with photos',
    'Unlimited AI mood analysis & affirmations',
    'Voice synthesis for all affirmations',
    'Full journal history access',
    'Premium badges collection'
  ],
  BUTTONS: {
    UPGRADE: 'Upgrade to Premium',
    LATER: 'Maybe Later'
  },
  TRIAL_NOTE: 'Includes 7-day free trial. Cancel anytime.'
};

// Journal
export const JOURNAL = {
  PROMPTS: [
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
  ],
  MOOD_ENCOURAGEMENTS: {
    STRUGGLING: 'Remember, tough times don\'t last, but tough people do. 💪',
    LOW: 'Every small step forward is progress. You\'re doing great! 🌱',
    NEUTRAL: 'Balance is beautiful. You\'re exactly where you need to be. ⚖️',
    GOOD: 'Your positive energy is contagious! Keep shining! ✨',
    AMAZING: 'What a wonderful day to celebrate your joy! 🎉'
  },
  FALLBACK_AFFIRMATIONS: {
    STRUGGLING: 'You are stronger than you know, and this difficult moment will pass. Your feelings are valid, and you deserve compassion.',
    LOW: 'It\'s okay to have challenging days. You\'re human, and you\'re doing the best you can. Tomorrow brings new possibilities.',
    NEUTRAL: 'You are perfectly balanced in this moment. Trust in your journey and know that you are exactly where you need to be.',
    GOOD: 'Your positive energy lights up the world around you. Keep embracing the joy that flows through your life.',
    AMAZING: 'What a beautiful soul you are! Your happiness is a gift to yourself and everyone around you. Celebrate this wonderful moment!'
  },
  CONTEXTUAL_MESSAGES: {
    SAME_DAY: {
      STRUGGLING: 'I see you\'re going through a tough time. Remember, I\'m here with you every step of the way.',
      LOW: 'You\'ve been feeling low lately. Your courage to keep journaling shows your inner strength.',
      NEUTRAL: 'You\'re finding your balance. Each reflection brings you closer to understanding yourself.',
      GOOD: 'Your positive energy has been shining through your recent entries. Keep nurturing that light!',
      AMAZING: 'What a joy it is to see you flourishing! Your happiness radiates through your words.'
    },
    ONE_DAY: 'Welcome back! I\'ve been thinking about our last conversation.',
    FEW_DAYS: 'It\'s been {days} days since we last talked. I\'m glad you\'re here.',
    LONG_TIME: 'It\'s wonderful to have you back. I\'ve missed our conversations.'
  },
  SUCCESS_MESSAGES: {
    SAVED: 'Entry saved! Zeno is proud of you! 🎉',
    FIRST_ENTRY: 'Great start! You\'ve begun your journaling journey! 🌱',
    STREAK: 'Amazing! You\'re on a {streak}-day streak! 🔥',
    NEW_BEST: 'That\'s a new personal best! 🏆'
  }
};

// Settings
export const SETTINGS = {
  PROFILE: {
    TITLE: 'Profile Information',
    EMAIL_READONLY: 'Email cannot be changed. Contact support if needed.',
    GOAL_HELP: 'Set your weekly journaling goal to stay motivated and track your progress.'
  },
  PREFERENCES: {
    TITLE: 'App Preferences',
    DARK_MODE: {
      LABEL: 'Dark Mode',
      ENABLED: 'Dark theme enabled',
      DISABLED: 'Light theme enabled'
    },
    NOTIFICATIONS: {
      LABEL: 'Notifications',
      DESCRIPTION: 'Gentle reminders for journaling'
    }
  },
  SUBSCRIPTION: {
    TITLE: 'Subscription',
    CURRENT_PLAN: 'Current Plan',
    PREMIUM_YEARLY: 'Premium Yearly',
    PREMIUM_MONTHLY: 'Premium Monthly',
    FREE: 'Free',
    RENEWAL: 'Your subscription renews on {date}',
    CANCELLED: 'Your subscription is cancelled and will end on {date}'
  },
  DATA_PRIVACY: {
    TITLE: 'Data & Privacy',
    EXPORT_BUTTON: 'Export Journal Data',
    EXPORT_HELP: 'Download all your journal entries and data in JSON format.'
  },
  ACCOUNT_ACTIONS: {
    TITLE: 'Account Actions',
    SIGN_OUT: 'Sign Out',
    DELETE_ACCOUNT: 'Delete Account',
    DELETE_CONFIRMATION: 'Type DELETE to confirm:'
  },
  MODALS: {
    LOGOUT: {
      TITLE: 'Sign Out',
      MESSAGE: 'Are you sure you want to sign out? You\'ll need to sign in again to access your journal.',
      CANCEL: 'Cancel',
      CONFIRM: 'Sign Out'
    },
    DELETE: {
      TITLE: 'Delete Account',
      MESSAGE: 'This action cannot be undone. All your journal entries, progress, and data will be permanently deleted.',
      CANCEL: 'Cancel',
      CONFIRM: 'Delete Account'
    }
  }
};

// Badges
export const BADGES = {
  TITLE: 'Badge Collection',
  PROGRESS: {
    TITLE: 'Badge Progress',
    EARNED: '{count} earned',
    TOTAL: '{count} total',
    MORE_TO_GO: '{count} more to go!',
    PERCENTAGE: '{percent}%'
  },
  SECTIONS: {
    ALMOST_THERE: 'Almost There!',
    RECENT: 'Recent Achievements'
  }
};

// History
export const HISTORY = {
  TITLE: 'Journal Dashboard',
  SEARCH_PLACEHOLDER: 'Search your journal entries...',
  FILTERS: {
    TITLE: 'Filters',
    ALL_MOODS: 'All Moods',
    NEWEST: 'Newest First',
    OLDEST: 'Oldest First',
    CLEAR: 'Clear filters'
  },
  ANALYTICS: {
    TITLE: 'Advanced Analytics',
    COMING_SOON: 'Advanced Insights Coming Soon',
    COMING_SOON_DESC: 'We\'re working on detailed mood trends, sentiment analysis, and AI-generated summaries of your emotional patterns.',
    UNLOCK: 'Unlock Advanced Analytics',
    UNLOCK_DESC: 'Upgrade to Zensai Premium to access detailed mood trends, sentiment analysis, and AI-generated insights about your emotional patterns.'
  },
  HISTORY_LIMIT: {
    TITLE: 'Unlock Your Full Journal History',
    DESCRIPTION: 'Free accounts can only access the last 30 days or 30 entries. Upgrade to Zensai Premium to unlock your complete journal history and insights.'
  },
  EMPTY_STATE: {
    NO_ENTRIES: 'No entries found',
    WITH_FILTERS: 'Try adjusting your search or filters.',
    NO_FILTERS: 'Start journaling to see your entries here!'
  },
  MOOD_DISTRIBUTION: 'Mood Distribution'
};