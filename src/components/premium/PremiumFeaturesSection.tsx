import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Zap, Shield } from 'lucide-react';

const PremiumFeaturesSection = React.memo(function PremiumFeaturesSection() {
  const features = [
    {
      icon: Sparkles,
      title: "Personalized AI Insights",
      description: "Receive tailored mood analysis, personalized affirmations, and deep emotional pattern insights powered by advanced AI."
    },
    {
      icon: Zap,
      title: "Unlimited Journal Features",
      description: "Enjoy unlimited journal entries with photo attachments, complete history access, and voice-enabled affirmations."
    },
    {
      icon: Shield,
      title: "VIP Support & Early Access",
      description: "Receive priority customer support and exclusive early access to all new features before they're released to everyone else."
    }
  ];

  return (
    <motion.div
      className="mb-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
    >
      <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/20 dark:border-gray-600/20">
        <h3 className="text-2xl font-display font-bold text-zen-sage-800 dark:text-gray-200 mb-6 text-center">
          Premium Features
        </h3>
        
        <div className="grid md:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              className="bg-white/80 dark:bg-gray-700/80 rounded-2xl p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + index * 0.1 }}
            >
              <div className="w-12 h-12 bg-zen-mint-100 dark:bg-zen-mint-900/30 rounded-full flex items-center justify-center mb-4">
                <feature.icon className="w-6 h-6 text-zen-mint-500" aria-hidden="true" />
              </div>
              <h4 className="text-lg font-display font-semibold text-zen-sage-800 dark:text-gray-200 mb-3">
                {feature.title}
              </h4>
              <p className="text-zen-sage-600 dark:text-gray-400">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
});

export default PremiumFeaturesSection;