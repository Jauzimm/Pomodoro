import { Ban, Check, ImagePlus, Trash2, Wallpaper } from 'lucide-react';
import { useRef, useState, type ChangeEvent } from 'react';

import { useStore } from '../../../app/store';
import { Card, CardBody, CardHeader, CardTitle } from '../../../shared/components/ui/Card';
import { cn } from '../../../shared/utils/cn';
import { useTranslation } from '../../../shared/i18n/useTranslation';
import {
  MAX_CUSTOM_WALLPAPER_BYTES,
  MAX_CUSTOM_WALLPAPERS,
  WALLPAPER_PRESETS,
} from '../presets';
import { selectActiveWallpaperId, selectCustomWallpapers } from '../wallpaper.slice';

const WALLPAPER_KEYS: Record<string, 'wallpaper.aurora' | 'wallpaper.ocean' | 'wallpaper.sunset' | 'wallpaper.forest' | 'wallpaper.midnight' | 'wallpaper.sand'> = {
  aurora: 'wallpaper.aurora',
  ocean: 'wallpaper.ocean',
  sunset: 'wallpaper.sunset',
  forest: 'wallpaper.forest',
  midnight: 'wallpaper.midnight',
  sand: 'wallpaper.sand',
};

/** Atalho visual de seleção para cada opção da grade. */
function SelectionMark({ selected }: { selected: boolean }) {
  return (
    <span
      className={cn(
        'absolute right-1.5 top-1.5 flex size-5 items-center justify-center rounded-full transition-all',
        selected
          ? 'bg-indigo-600 text-white shadow'
          : 'bg-zinc-900/50 text-transparent opacity-0 group-hover:opacity-100',
      )}
      aria-hidden="true"
    >
      <Check className="size-3" strokeWidth={3} />
    </span>
  );
}

/**
 * Seletor de plano de fundo: presets embutidos + uploads do usuário.
 * A imagem escolhida é aplicada ao <body> pelo useWallpaperEffect.
 */
export function WallpaperPicker() {
  const activeWallpaperId = useStore(selectActiveWallpaperId);
  const customWallpapers = useStore(selectCustomWallpapers);
  const setActiveWallpaper = useStore((s) => s.setActiveWallpaper);
  const addCustomWallpaper = useStore((s) => s.addCustomWallpaper);
  const removeCustomWallpaper = useStore((s) => s.removeCustomWallpaper);
  const { t } = useTranslation();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError(t('wallpaper.formatError'));
      return;
    }
    if (file.size > MAX_CUSTOM_WALLPAPER_BYTES) {
      setError(t('wallpaper.sizeError'));
      return;
    }
    if (customWallpapers.length >= MAX_CUSTOM_WALLPAPERS) {
      setError(t('wallpaper.maxError', { max: MAX_CUSTOM_WALLPAPERS }));
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      addCustomWallpaper(file.name.replace(/\.[^.]+$/, '') || 'Personalizado', dataUrl);
      setError(null);
    };
    reader.onerror = () => setError(t('wallpaper.readError'));
    reader.readAsDataURL(file);
  };

  return (
    <Card className="flex h-full flex-col">
      <CardHeader>
        <CardTitle>
          <Wallpaper className="size-4 text-indigo-500" aria-hidden="true" />
          {t('wallpaper.title')}
        </CardTitle>
      </CardHeader>

      <CardBody className="space-y-4">
        <div className="grid grid-cols-2 gap-2">
          {WALLPAPER_PRESETS.map(({ id, src }) => {
            const selected = activeWallpaperId === id;
            const presetName = t(WALLPAPER_KEYS[id] ?? 'wallpaper.aurora');
            return (
              <button
                key={id}
                type="button"
                onClick={() => setActiveWallpaper(selected ? null : id)}
                aria-pressed={selected}
                aria-label={t('wallpaper.useAria', { name: presetName })}
                title={presetName}
                className={cn(
                  'group relative cursor-pointer overflow-hidden rounded-xl border-2 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500',
                  selected
                    ? 'border-indigo-500 shadow-md shadow-indigo-500/20'
                    : 'border-transparent hover:border-zinc-300 dark:hover:border-zinc-700',
                )}
              >
                <img
                  src={src}
                  alt=""
                  loading="lazy"
                  className="aspect-video w-full object-cover"
                />
                <SelectionMark selected={selected} />
              </button>
            );
          })}
        </div>

        {activeWallpaperId === null && (
          <p className="flex items-center gap-1.5 text-[11px] text-zinc-400 dark:text-zinc-500">
            <Ban className="size-3" aria-hidden="true" />
            {t('wallpaper.none')}
          </p>
        )}

        <div className="h-px bg-zinc-100 dark:bg-zinc-800" aria-hidden="true" />

        <div>
          <p className="mb-2 text-xs font-semibold text-zinc-600 dark:text-zinc-300">
            {t('wallpaper.yours')}
            <span className="ml-1 font-normal text-zinc-400 dark:text-zinc-500">
              ({customWallpapers.length}/{MAX_CUSTOM_WALLPAPERS})
            </span>
          </p>

          {customWallpapers.length > 0 && (
            <div className="mb-2 grid grid-cols-2 gap-2">
              {customWallpapers.map(({ id, name, dataUrl }) => {
                const selected = activeWallpaperId === id;
                return (
                  <div key={id} className="relative">
                    <button
                      type="button"
                      onClick={() => setActiveWallpaper(selected ? null : id)}
                      aria-pressed={selected}
                       aria-label={t('wallpaper.useAria', { name })}
                       title={name}
                      className={cn(
                        'group relative block w-full cursor-pointer overflow-hidden rounded-xl border-2 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500',
                        selected
                          ? 'border-indigo-500 shadow-md shadow-indigo-500/20'
                          : 'border-transparent hover:border-zinc-300 dark:hover:border-zinc-700',
                      )}
                    >
                      <img src={dataUrl} alt="" loading="lazy" className="aspect-video w-full object-cover" />
                      <SelectionMark selected={selected} />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeCustomWallpaper(id)}
                       aria-label={t('wallpaper.remove')}
                       title={t('wallpaper.remove')}
                      className="absolute bottom-1.5 right-1.5 flex size-6 cursor-pointer items-center justify-center rounded-md bg-zinc-900/60 text-zinc-100 opacity-0 backdrop-blur-sm transition-opacity hover:bg-rose-600 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 group-hover:opacity-100"
                    >
                      <Trash2 className="size-3.5" aria-hidden="true" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFile}
            className="hidden"
            aria-hidden="true"
            tabIndex={-1}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={customWallpapers.length >= MAX_CUSTOM_WALLPAPERS}
            className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-zinc-300 px-3 py-2.5 text-xs font-medium text-zinc-500 transition-colors hover:border-indigo-400 hover:bg-indigo-500/5 hover:text-indigo-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-40 dark:border-zinc-700 dark:text-zinc-400 dark:hover:border-indigo-500 dark:hover:text-indigo-400"
          >
            <ImagePlus className="size-4" aria-hidden="true" />
            {t('wallpaper.upload')}
          </button>

          {error && (
            <p className="mt-2 text-[11px] font-medium text-rose-500" role="alert">
              {error}
            </p>
          )}
          <p className="mt-2 text-[10px] text-zinc-300 dark:text-zinc-600">
            {t('wallpaper.savedNote')}
          </p>
        </div>
      </CardBody>
    </Card>
  );
}