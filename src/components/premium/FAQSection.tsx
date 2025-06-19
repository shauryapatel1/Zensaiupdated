import React from 'react';
import { motion } from 'framer-motion';

interface FAQItem {
  question: string;
  answer: string;
}

const FAQSection = React.memo(function FAQSection() {
  const faqItems: FAQItem[] = [
    {
      question: "What happens after my 7-day free trial?",
      answer: "After your trial ends, you'll be charged for your selected plan. You can cancel anytime before the trial ends to avoid being charged. We'll send you a reminder email before your trial expires."
    },
    {
      question: "Can I switch between monthly and yearly plans?",
      answer: "Yes, you can switch plans at any time. If you upgrade from monthly to yearly, you'll receive a prorated credit for your remaining monthly subscription. Switching from yearly to monthly will take effect at your next renewal date."
    },
    {
      question: "How do I cancel my subscription?",
      answer: "You can cancel your subscription anytime from the Settings page or by contacting our support team. Your premium features will remain active until the end of your current billing period, and you won't be charged again."
    },
    {
      question: "Is my payment information secure?",
      answer: "Absolutely. All payments are processed securely through Stripe, a PCI-DSS Level 1 certified payment processor. We never store your credit card information on our servers, ensuring maximum security for your financial data."
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
    >
      <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/20 dark:border-gray-600/20">
        <h3 className="text-2xl font-display font-bold text-zen-sage-800 dark:text-gray-200 mb-6 text-center">
          Frequently Asked Questions
        </h3>
        
        <div className="space-y-4 max-w-3xl mx-auto">
          {faqItems.map((item, index) => (
            <motion.div
              key={index}
              className="bg-white/80 dark:bg-gray-700/80 rounded-2xl p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 + index * 0.1 }}
            >
              <h4 className="text-lg font-display font-semibold text-zen-sage-800 dark:text-gray-200 mb-2">
                {item.question}
              </h4>
              <p className="text-zen-sage-600 dark:text-gray-400 leading-relaxed">
                {item.answer}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
});

export default FAQSection;