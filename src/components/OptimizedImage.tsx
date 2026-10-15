import React, { useState, useEffect, useRef } from 'react';

export interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  sizes?: string;
  priority?: boolean;
  aspectRatioClass?: string;
  containerClassName?: string;
  fallbackSrc?: string;
  disableSrcSet?: boolean;
}

const BANNER_BASES = new Set([
  'banner-minh-tien',
  'banner-3',
  'Banner-mt1',
  'minh-tien-ba-hon',
]);

const PHOTO_BASES = new Set([
  'Minh-Tien-storefront',
  'minh-tien-co-so',
  'Minhtien-QC-Decor',
]);

const LOGO_380_BASES = new Set([
  'logo-emblem',
  'logo-minh-tien',
  'logo-minh-tien-transparent',
]);

/**
 * Normalizes any local /assets/*.{png,jpg,jpeg} path to .webp
 */
export function normalizeToWebp(url: string): string {
  if (!url) return '';
  if (url.startsWith('data:') || url.startsWith('blob:')) return url;
  if (url.startsWith('/assets/')) {
    return url.replace(/\.(png|jpe?g)$/i, '.webp');
  }
  return url;
}

/**
 * Builds responsive WebP srcSet for local /assets/ images
 */
export function buildWebpSrcSet(webpUrl: string): {
  srcSet?: string;
  defaultWidth: number;
  defaultHeight: number;
  defaultSizes: string;
} {
  const match = webpUrl.match(/^\/assets\/([^/.]+?)(?:-\d+w)?\.webp$/);
  if (!match) {
    return {
      defaultWidth: 800,
      defaultHeight: 600,
      defaultSizes: '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 800px',
    };
  }

  const baseName = match[1];

  if (BANNER_BASES.has(baseName)) {
    return {
      srcSet: `/assets/${baseName}-480w.webp 480w, /assets/${baseName}-800w.webp 800w, /assets/${baseName}-1600w.webp 1600w`,
      defaultWidth: 1600,
      defaultHeight: 600,
      defaultSizes: '(max-width: 640px) 100vw, (max-width: 1200px) 90vw, 1600px',
    };
  }

  if (PHOTO_BASES.has(baseName)) {
    return {
      srcSet: `/assets/${baseName}-480w.webp 480w, /assets/${baseName}-800w.webp 800w, /assets/${baseName}-1200w.webp 1200w`,
      defaultWidth: 1200,
      defaultHeight: 900,
      defaultSizes: '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 600px',
    };
  }

  if (LOGO_380_BASES.has(baseName)) {
    return {
      srcSet: `/assets/${baseName}-200w.webp 200w, /assets/${baseName}-380w.webp 380w`,
      defaultWidth: 380,
      defaultHeight: baseName === 'logo-emblem' ? 106 : 230,
      defaultSizes: '200px',
    };
  }

  if (baseName === 'logo-icon-emblem') {
    return {
      srcSet: `/assets/logo-icon-emblem-120w.webp 120w, /assets/logo-icon-emblem-212w.webp 212w`,
      defaultWidth: 212,
      defaultHeight: 106,
      defaultSizes: '96px',
    };
  }

  return {
    defaultWidth: 800,
    defaultHeight: 600,
    defaultSizes: '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 800px',
  };
}

const DEFAULT_FALLBACK_WEBP = '/assets/Minh-Tien-storefront-800w.webp';

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  width,
  height,
  sizes,
  priority = false,
  loading,
  decoding,
  fetchPriority,
  className = 'w-full h-full object-cover',
  aspectRatioClass = '',
  containerClassName = '',
  fallbackSrc = DEFAULT_FALLBACK_WEBP,
  disableSrcSet = false,
  onError,
  onLoad,
  ...rest
}) => {
  const normalizedSrc = normalizeToWebp(src);
  const { srcSet, defaultWidth, defaultHeight, defaultSizes } = buildWebpSrcSet(normalizedSrc);

  const [currentSrc, setCurrentSrc] = useState<string>(normalizedSrc);
  const [retryCount, setRetryCount] = useState<number>(0);
  const [useFallback, setUseFallback] = useState<boolean>(false);
  const [allFailed, setAllFailed] = useState<boolean>(false);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const retryTimerRef = useRef<number | null>(null);

  useEffect(() => {
    const nextNormalized = normalizeToWebp(src);
    setCurrentSrc(nextNormalized);
    setRetryCount(0);
    setUseFallback(false);
    setAllFailed(false);
    setIsLoaded(false);
    return () => {
      if (retryTimerRef.current) {
        window.clearTimeout(retryTimerRef.current);
      }
    };
  }, [src]);

  const handleLoad = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    setIsLoaded(true);
    if (onLoad) {
      onLoad(e);
    }
  };

  const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    if (retryCount < 2 && normalizedSrc) {
      const nextRetry = retryCount + 1;
      setRetryCount(nextRetry);
      retryTimerRef.current = window.setTimeout(() => {
        const sep = normalizedSrc.includes('?') ? '&' : '?';
        setCurrentSrc(`${normalizedSrc}${sep}retry=${nextRetry}`);
      }, 350 * nextRetry);
      return;
    }

    if (!useFallback && fallbackSrc && currentSrc !== fallbackSrc) {
      setUseFallback(true);
      setCurrentSrc(normalizeToWebp(fallbackSrc));
      return;
    }

    setAllFailed(true);
    setIsLoaded(true);
    if (onError) {
      onError(e);
    }
  };

  const effectiveLoading = priority ? 'eager' : loading || 'lazy';
  const effectiveDecoding = decoding || 'async';
  const effectiveFetchPriority = priority ? 'high' : fetchPriority || 'auto';
  const effectiveWidth = width || defaultWidth;
  const effectiveHeight = height || defaultHeight;
  const effectiveSizes = sizes || defaultSizes;
  const activeSrcSet =
    !disableSrcSet && retryCount === 0 && !useFallback ? srcSet : undefined;

  if (allFailed) {
    return (
      <div
        className={`relative flex flex-col items-center justify-center bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 text-white p-4 text-center select-none ${aspectRatioClass} ${containerClassName} ${className}`}
        role="img"
        aria-label={alt}
      >
        <div className="px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-[11px] font-bold uppercase tracking-wider mb-1">
          MINH TIẾN • 160 QL80 KIÊN LƯƠNG
        </div>
        <span className="text-xs font-semibold text-neutral-200 line-clamp-2 max-w-xs">
          {alt}
        </span>
      </div>
    );
  }

  return (
    <img
      src={currentSrc}
      srcSet={activeSrcSet}
      sizes={activeSrcSet ? effectiveSizes : undefined}
      alt={alt}
      width={effectiveWidth}
      height={effectiveHeight}
      loading={effectiveLoading}
      decoding={effectiveDecoding}
      fetchPriority={effectiveFetchPriority}
      onLoad={handleLoad}
      onError={handleError}
      className={`${className} ${
        isLoaded
          ? 'opacity-100'
          : 'bg-neutral-200/80 dark:bg-neutral-800/80 animate-pulse'
      } transition-opacity duration-300`}
      {...rest}
    />
  );
};
