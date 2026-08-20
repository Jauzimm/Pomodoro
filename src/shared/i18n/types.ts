// ============================================================================
// I18N TYPES — Idiomas suportados e tipo do seletor de idioma
// Camada: Shared (utilitário de aplicação)
// ============================================================================

export type Language = 'pt' | 'en' | 'es';

/** Idioma da UI (o padrão é detectado do navegador na inicialização). */
export type AppLanguage = Language;

/** Opções fixas (nomes dos idiomas na própria língua — padrão de UI). */
export const LANGUAGES: { id: Language; nativeName: string }[] = [
  { id: 'pt', nativeName: 'Português' },
  { id: 'en', nativeName: 'English' },
  { id: 'es', nativeName: 'Español' },
];
