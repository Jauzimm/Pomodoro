import { Copy, Eraser, NotebookPen } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import { useStore } from '../../../app/store';
import { useDebounce } from '../../../shared/hooks/useDebounce';
import { useTranslation } from '../../../shared/i18n/useTranslation';
import { Card, CardBody, CardHeader, CardTitle } from '../../../shared/components/ui/Card';
import { selectNote } from '../notes.slice';

const WORD_PATTERN = /\b[\p{L}\p{N}'-]+\b/gu;

/**
 * Bloco de anotações rápidas (scratchpad) com auto-save com debounce,
 * contador de palavras/caracteres e ações de copiar/limpar.
 */
export function Scratchpad() {
  const note = useStore(selectNote);
  const setContent = useStore((s) => s.setContent);
  const clearNote = useStore((s) => s.clearNote);
  const [copied, setCopied] = useState(false);
  const { t } = useTranslation();

  // Estado local para digitação imediata
  const [draft, setDraft] = useState(note.content);
  const [prevStoreContent, setPrevStoreContent] = useState(note.content);
  const debouncedDraft = useDebounce(draft, 300);

  // Ajusta o rascunho se o valor persistido/externo mudar
  if (note.content !== prevStoreContent) {
    setPrevStoreContent(note.content);
    setDraft(note.content);
  }

  // Sincroniza rascunho com o store após o debounce
  useEffect(() => {
    if (debouncedDraft !== note.content) {
      setContent(debouncedDraft);
    }
  }, [debouncedDraft, note.content, setContent]);

  const stats = useMemo(() => {
    const words = draft.trim() === '' ? 0 : (draft.match(WORD_PATTERN) ?? []).length;
    return { words, chars: draft.length };
  }, [draft]);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(draft);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard indisponível: ignora silenciosamente */
    }
  };

  const handleClear = () => {
    if (draft.trim() === '') return;
    if (window.confirm(t('notes.confirmClear'))) {
      setDraft('');
      clearNote();
    }
  };

  return (
    <Card className="flex h-full flex-col">
      <CardHeader>
        <CardTitle>
          <NotebookPen className="size-4 text-indigo-500" aria-hidden="true" />
          {t('notes.title')}
        </CardTitle>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={copyToClipboard}
            disabled={draft.trim() === ''}
            aria-label={t('notes.copy')}
            className="inline-flex cursor-pointer items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-medium text-zinc-400 transition-colors hover:bg-indigo-500/10 hover:text-indigo-500 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Copy className="size-3" aria-hidden="true" />
            {copied ? t('notes.copied') : t('notes.copy')}
          </button>
          <button
            type="button"
            onClick={handleClear}
            disabled={draft.trim() === ''}
            aria-label={t('notes.clear')}
            className="inline-flex cursor-pointer items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-medium text-zinc-400 transition-colors hover:bg-rose-500/10 hover:text-rose-500 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Eraser className="size-3" aria-hidden="true" />
            {t('notes.clear')}
          </button>
        </div>
      </CardHeader>

      <CardBody className="flex flex-1 flex-col gap-3">
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={t('notes.placeholder')}
          aria-label={t('notes.fieldAria')}
          spellCheck={false}
          className="min-h-40 flex-1 resize-none rounded-xl border border-zinc-200 bg-zinc-50/60 p-3 text-sm leading-relaxed text-zinc-800 outline-none transition-colors placeholder:text-zinc-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/30 dark:border-zinc-800 dark:bg-zinc-950/40 dark:text-zinc-100 dark:placeholder:text-zinc-600"
        />
        <div className="flex items-center justify-between text-[11px] font-medium text-zinc-400 tabular-nums dark:text-zinc-500">
          <span>{t(stats.words === 1 ? 'notes.wordsOne' : 'notes.wordsOther', { count: stats.words })}</span>
          <span>{t(stats.chars === 1 ? 'notes.charsOne' : 'notes.charsOther', { count: stats.chars })}</span>
        </div>
        <p className="text-[10px] text-zinc-300 dark:text-zinc-600">
          {t('notes.saved')}
        </p>
      </CardBody>
    </Card>
  );
}
