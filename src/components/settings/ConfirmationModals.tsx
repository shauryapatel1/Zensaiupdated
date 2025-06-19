import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';

interface LogoutConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const LogoutConfirmModal = React.memo(function LogoutConfirmModal({
  isOpen,
  onClose,
  onConfirm
}: LogoutConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-labelledby="logout-title"
      >
        <motion.div
          className="bg-white dark:bg-gray-800 rounded-3xl p-6 max-w-md w-full shadow-2xl border border-white/20 dark:border-gray-600/20"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          onClick={(e) => e.stopPropagation()}
        >
          <h3 id="logout-title" className="text-lg font-display font-bold text-zen-sage-800 dark:text-gray-200 mb-4">
            Sign Out
          </h3>
          <p className="text-zen-sage-600 dark:text-gray-400 mb-6">
            Are you sure you want to sign out? You'll need to sign in again to access your journal.
          </p>
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-zen-sage-100 dark:bg-gray-700 text-zen-sage-800 dark:text-gray-200 rounded-2xl hover:bg-zen-sage-200 dark:hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 px-4 py-3 bg-zen-peach-400 text-white rounded-2xl hover:bg-zen-peach-500 transition-colors"
            >
              Sign Out
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
});

interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  confirmText: string;
  onConfirmTextChange: (text: string) => void;
  isConfirmDisabled: boolean;
}

export const DeleteAccountModal = React.memo(function DeleteAccountModal({
  isOpen,
  onClose,
  onConfirm,
  confirmText,
  onConfirmTextChange,
  isConfirmDisabled
}: DeleteAccountModalProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-account-title"
      >
        <motion.div
          className="bg-white dark:bg-gray-800 rounded-3xl p-6 max-w-md w-full shadow-2xl border border-white/20 dark:border-gray-600/20"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          onClick={(e) => e.stopPropagation()}
        >
          <h3 id="delete-account-title" className="text-lg font-display font-bold text-red-600 dark:text-red-400 mb-4 flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2" aria-hidden="true" />
            Delete Account
          </h3>
          <p className="text-zen-sage-600 dark:text-gray-400 mb-4">
            This action cannot be undone. All your journal entries, progress, and data will be permanently deleted.
          </p>
          <p className="text-zen-sage-600 dark:text-gray-400 mb-6">
            Type <strong>DELETE</strong> to confirm:
          </p>
          <input
            type="text"
            value={confirmText}
            onChange={(e) => onConfirmTextChange(e.target.value)}
            className="w-full px-4 py-3 border border-zen-sage-200 dark:border-gray-600 rounded-2xl focus:ring-2 focus:ring-red-400 focus:border-transparent bg-white/70 dark:bg-gray-700 text-zen-sage-800 dark:text-gray-200 mb-6"
            placeholder="Type DELETE to confirm"
            aria-label="Type DELETE to confirm account deletion"
          />
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-zen-sage-100 dark:bg-gray-700 text-zen-sage-800 dark:text-gray-200 rounded-2xl hover:bg-zen-sage-200 dark:hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={isConfirmDisabled}
              className="flex-1 px-4 py-3 bg-red-500 text-white rounded-2xl hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Delete Account
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
});