import React from 'react';
import { cn } from '../../lib/utils';

type Props = {
  selected: boolean;
  disabled?: boolean;
  onPick: () => void;
  children: React.ReactNode;
};

export function PickerOptionButton({
  selected,
  disabled,
  onPick,
  children,
}: Props) {
  return (
    <button
      type="button"
      disabled={disabled}
      className={cn(
        'flex w-full rounded-sm px-2 py-1.5 text-start text-sm hover:bg-accent hover:text-accent-foreground disabled:pointer-events-none disabled:opacity-50',
        selected && 'bg-accent'
      )}
      onMouseDown={(e) => e.preventDefault()}
      onPointerDown={(e) => {
        if (disabled) return;
        if (e.pointerType === 'touch') {
          e.preventDefault();
          onPick();
        }
      }}
      onClick={() => {
        if (!disabled) onPick();
      }}
    >
      {children}
    </button>
  );
}
