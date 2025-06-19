import React from 'react';
import { motion } from 'framer-motion';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  animate?: boolean;
}

const Logo = React.memo(function Logo({ size = 'md', className = '', animate = true }: LogoProps) {
  // Size classes for the container
  const logoContainerSizeClasses = {
    sm: 'w-10 h-10',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  if (animate) {
    return (
      <motion.div
        className={`flex-shrink-0 rounded-full overflow-hidden bg-white/20 backdrop-blur-sm shadow-lg ${logoContainerSizeClasses[size]} ${className}`}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        whileHover={{ scale: 1.05 }}
        role="img"
        aria-label="Zensai logo"
      >
        <img 
          src="/Zensai Logo copy.png" 
          alt="" 
          className="w-full h-full object-cover object-center"
        />
      </motion.div>
    );
  }

  return (
    <div 
      className={`flex-shrink-0 rounded-full overflow-hidden bg-white/20 backdrop-blur-sm shadow-lg ${logoContainerSizeClasses[size]} ${className}`}
      role="img"
      aria-label="Zensai logo"
    >
      <img 
        src="/Zensai Logo copy.png" 
        alt="" 
        className="w-full h-full object-cover object-center"
      />
    </div>
  );
});

export default Logo;