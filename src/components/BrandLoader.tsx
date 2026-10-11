import React from 'react';
import { cn } from '../lib/utils';

function PakistanEmblem() {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M36.2 10.4c-10.8 1.4-19 10.7-19 21.9 0 12.2 9.9 22.1 22.1 22.1 4.4 0 8.5-1.3 12-3.5-4.1 2.3-8.9 3.6-14 3.6C23.4 54.5 12 43.1 12 29.2 12 17.2 20.6 7.1 32 4.4c1.4-.3 2.9-.5 4.4-.5-.1 2.1-.1 4.3-.2 6.5z" />
      <path d="M44.8 18.2l2.6 5.4 5.9.7-4.4 4.1 1.2 5.8-5.3-2.9-5.3 2.9 1.2-5.8-4.4-4.1 5.9-.7z" />
    </svg>
  );
}

type BrandLoaderProps = {
  /** `sm` = inline rows; `md` = global overlay pill */
  size?: 'sm' | 'md';
  label?: string;
  className?: string;
};

export function BrandLoader({
  size = 'sm',
  label,
  className,
}: BrandLoaderProps) {
  const md = size === 'md';
  return (
    <div
      className={cn(
        'inline-flex items-center',
        md ? 'gap-3' : 'gap-2.5',
        className
      )}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div
        className={cn(
          'loader-orbit relative shrink-0',
          md ? 'loader-orbit-md' : 'loader-orbit-sm'
        )}
        aria-hidden
      >
        <div className="loader-emblem">
          <PakistanEmblem />
        </div>
      </div>
      {label ? (
        <span
          className={cn(
            'font-medium text-muted-foreground',
            md ? 'text-xs text-white/90' : 'text-sm'
          )}
        >
          {label}
        </span>
      ) : null}
    </div>
  );
}
