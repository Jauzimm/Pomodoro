import { useEffect, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

import { X } from 'lucide-react';

import { cn } from '../../utils/cn';
import { useTranslation } from '../../i18n/useTranslation';
import { usePresence } from '../../hooks/usePresence';
import { Button } from './Button';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  className?: string;
}

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

export function Modal({ open, onClose, title, children, className }: ModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  const { t } = useTranslation();
  const { mounted, visible } = usePresence(open);

  // Mantém o onClose mais recente sem reexecutar o efeito de foco.
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!open || !mounted) return;

    const dialog = dialogRef.current;
    const previouslyFocused = document.activeElement as HTMLElement | null;

    const focusables = () =>
      Array.from(
        dialog?.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR) ?? [],
      );

    // Foco retido dentro do modal (a11y) + Esc fecha.
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onCloseRef.current();
        return;
      }
      if (event.key !== 'Tab') return;

      const list = focusables();
      if (list.length === 0) return;
      const first = list[0];
      const last = list[list.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    const focusFirst = () => {
      const list = focusables();
      const first = list[0];
      if (first) {
        first.focus();
      } else {
        dialog?.focus();
      }
    };

    focusFirst();
    document.addEventListener('keydown', onKeyDown);
    // Bloqueia o scroll do fundo enquanto o modal está aberto.
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = '';
      previouslyFocused?.focus();
    };
  }, [open, mounted]);

  if (!mounted) return null;

  return createPortal(
    <div
      className={cn(
        'fixed inset-0 z-50 flex items-center justify-center p-4',
        !visible && 'pointer-events-none',
      )}
      role="dialog"
      aria-modal="true"
      aria-label={title}
      inert={!visible}
    >
      <div
        className={cn(
          'absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ease-in-out motion-reduce:transition-none',
          !visible && 'opacity-0',
        )}
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        ref={dialogRef}
        tabIndex={-1}
        className={cn(
          'relative max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xl shadow-black/20 outline-none transition-all duration-300 ease-in-out motion-reduce:transition-none dark:border-zinc-800 dark:bg-zinc-900',
          visible ? 'translate-y-0 scale-100 opacity-100' : 'translate-y-2 scale-95 opacity-0',
          className,
        )}
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">{title}</h2>
           <Button variant="ghost" size="icon" onClick={onClose} aria-label={t('modal.close')} className="-mr-2 -mt-1">
             <X className="size-5" />
           </Button>
        </div>
        {children}
      </div>
    </div>,
    document.body,
  );
}