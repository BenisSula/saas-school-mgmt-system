import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './Button';
import { modalAnimation } from '../../lib/utils/animations';

export interface ModalProps {
  title: string;
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
  initialFocusRef?: React.RefObject<HTMLElement>;
}

export function Modal({ title, isOpen, onClose, children, footer, initialFocusRef }: ModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const lastActiveElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    lastActiveElement.current = document.activeElement as HTMLElement;
    const node =
      initialFocusRef?.current ??
      dialogRef.current?.querySelector<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
    node?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
      if (event.key === 'Tab') {
        const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (!focusable || focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      lastActiveElement.current?.focus();
    };
  }, [isOpen, onClose, initialFocusRef]);

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          role="presentation"
          className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--brand-surface)]/70 px-4 py-6 backdrop-blur-sm sm:px-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              onClose();
            }
          }}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            ref={dialogRef}
            className="w-full max-w-lg rounded-xl border border-[var(--brand-border)] bg-[var(--brand-surface)] text-[var(--brand-surface-contrast)] shadow-2xl focus-visible-ring"
            variants={modalAnimation}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <header className="flex items-center justify-between border-b border-[var(--brand-border)] px-4 py-3 sm:px-6 sm:py-4">
              <h2 id="modal-title" className="text-base font-semibold sm:text-lg">
                {title}
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                aria-label="Close modal"
                className="text-[var(--brand-surface-contrast)] hover:bg-[var(--brand-surface-secondary)]"
              >
                ✕
              </Button>
            </header>
            <div className="px-4 py-4 text-sm text-[var(--brand-text-primary)] sm:px-6">
              {children}
            </div>
            {footer ? (
              <footer className="flex flex-col items-stretch gap-2 border-t border-[var(--brand-border)] px-4 py-3 sm:flex-row sm:items-center sm:justify-end sm:px-6 sm:py-4">
                {footer}
              </footer>
            ) : null}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}

export default Modal;
