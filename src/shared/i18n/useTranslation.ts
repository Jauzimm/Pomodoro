// ============================================================================
// I18N HOOK — Liga o idioma da store à função `t`
// Camada: Shared (utilitário de aplicação)
// ============================================================================

import { useStore } from '../../app/store';
import type { AppLanguage, Language } from './types';
import { translate, dictionaries, type TParams, type TranslationKey } from './translations';
import { detectBrowserLanguage } from './detect';

export type { TranslationKey, TParams } from './translations';

/** Garante um idioma válido mesmo se houver valor obsoleto persistido (ex.: 'auto'). */
export function resolveLanguage(lang: AppLanguage): Language {
  return lang in dictionaries ? lang : detectBrowserLanguage();
}

export function useTranslation() {
  const language = useStore((s) => s.language);
  const setLanguage = useStore((s) => s.setLanguage);
  const resolved = resolveLanguage(language);

  const t = (key: TranslationKey, params?: TParams): string =>
    translate(resolved, key, params);

  return { t, language, setLanguage, resolved };
}
