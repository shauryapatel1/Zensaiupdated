import React from 'react';
import { motion } from 'framer-motion';
import { Volume2, VolumeX, Loader2 } from 'lucide-react';

interface VoiceButtonProps {
  isPremiumUser?: boolean;
  onUpsellTrigger?: () => void;
  isGenerating: boolean;
  isPlaying: boolean;
  onPlay: () => void;
  onStop: () => void;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const VoiceButton = React.memo(function VoiceButton({
  isPremiumUser = true,
  onUpsellTrigger,
  isGenerating,
  isPlaying,
  onPlay,
  onStop,
  disabled = false,
  size = 'md',
  className = ''
}: VoiceButtonProps) {
  const sizeClasses = {
    sm: 'w-8 h-8 p-1.5',
    md: 'w-10 h-10 p-2',
    lg: 'w-12 h-12 p-2.5'
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  const handleClick = () => {
    if (!isPremiumUser) {
      if (onUpsellTrigger) onUpsellTrigger();
      return; 
    }
    
    if (isPlaying) {
      onStop();
    } else {
      onPlay();
    }
  };

  const getIcon = () => {
    if (isGenerating) {
      return <Loader2 className={`${iconSizes[size]} animate-spin`} />;
    }
    if (isPlaying) {
      return <VolumeX className={iconSizes[size]} />;
    }
    return <Volume2 className={iconSizes[size]} />;
  };

  const getTooltip = () => {
    if (!isPremiumUser) return 'Premium feature - Upgrade to unlock';
    if (isGenerating) return 'Generating speech...';
    if (isPlaying) return 'Stop speech';
    return 'Play speech';
  };

  return (
    <motion.button
      onClick={handleClick}
      disabled={(!isPremiumUser && !onUpsellTrigger) || disabled || isGenerating}
      className={`
        ${sizeClasses[size]}
        ${isPremiumUser ? 'bg-zen-peach-400 hover:bg-zen-peach-500' : 'bg-gray-400 hover:bg-gray-500'} 
        text-white rounded-full 
        transition-all duration-300 
        shadow-lg hover:shadow-xl
        disabled:opacity-50 disabled:cursor-not-allowed
        flex items-center justify-center
        ${className}
      `}
      whileHover={!disabled && !isGenerating && (isPremiumUser || onUpsellTrigger) ? { scale: 1.1 } : {}}
      whileTap={!disabled && !isGenerating && (isPremiumUser || onUpsellTrigger) ? { scale: 0.95 } : {}}
      title={getTooltip()}
      aria-label={getTooltip()}
      aria-disabled={(!isPremiumUser && !onUpsellTrigger) || disabled || isGenerating}
      aria-pressed={isPlaying}
      aria-label={getTooltip()}
    >
      {getIcon()}
      
      {/* Pulse effect when playing */}
      {isPlaying && (
        <motion.div
          className="absolute inset-0 bg-zen-peach-400 rounded-full"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.7, 0, 0.7]
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity, 
            ease: "easeInOut"
          }}
          aria-hidden="true"
        />
      )}
    </motion.button>
  );
});

export default VoiceButton;