import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Zap, Shield } from 'lucide-react';
import { PREMIUM } from '../../constants/uiStrings';

/**
 * PremiumFeaturesSection - Displays the key premium features in a visually appealing grid
 * 
 * @component
 * @example
 * return <PremiumFeaturesSection />
 */
const PremiumFeaturesSection = React.memo(function PremiumFeaturesSection() {
  const features = PREMIUM.FEATURES_SECTION.ITEMS;
  const iconMap = {
    'Personalized AI Insights': Sparkles,
    'Unlimited Journal Features': Zap,
    'VIP Support & Early Access': Shield
  };

  return (
    <motion.div
      className="mb-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
    >
      <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/20 dark:border-gray-600/20">
        <h3 className="text-2xl font-display font-bold text-zen-sage-800 dark:text-gray-200 mb-6 text-center">
          {PREMIUM.FEATURES_SECTION.TITLE}
        </h3>
        
        <div className="grid md:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.TITLE}
              className="bg-white/80 dark:bg-gray-700/80 rounded-2xl p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + index * 0.1 }}
            >
              <div className="w-12 h-12 bg-zen-mint-100 dark:bg-zen-mint-900/30 rounded-full flex items-center justify-center mb-4">
                {iconMap[feature.TITLE as keyof typeof iconMap] && 
                  React.createElement(iconMap[feature.TITLE as keyof typeof iconMap], {
                    className: "w-6 h-6 text-zen-mint-500",
                    "aria-hidden": true
                  })
                }
              </div>
              <h4 className="text-lg font-display font-semibold text-zen-sage-800 dark:text-gray-200 mb-3">
                {feature.TITLE}
              </h4>
              <p className="text-zen-sage-600 dark:text-gray-400">
                {feature.DESCRIPTION}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
});

export default PremiumFeaturesSection;