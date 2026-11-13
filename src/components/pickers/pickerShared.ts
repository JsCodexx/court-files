import type { RefObject } from 'react';

export const PICKER_MENU_CLASS =
  'fixed z-[120] overflow-y-auto rounded-md border bg-popover p-1 text-popover-foreground shadow-md';

export function bindPickerOutsideClose(
  open: boolean,
  listId: string,
  wrapRef: RefObject<HTMLDivElement | null>,
  onClose: () => void
): () => void {
  if (!open) return () => {};
  const onDoc = (e: Event) => {
    const target = e.target as Node;
    if (wrapRef.current?.contains(target)) return;
    const pop = document.getElementById(listId);
    if (pop?.contains(target)) return;
    onClose();
  };
  document.addEventListener('mousedown', onDoc);
  document.addEventListener('touchstart', onDoc, { passive: true });
  return () => {
    document.removeEventListener('mousedown', onDoc);
    document.removeEventListener('touchstart', onDoc);
  };
}
