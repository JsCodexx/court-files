import React from 'react';
import { Plus } from '../icons';
import { BrandLoader } from '../BrandLoader';
import { useLocale } from '../../i18n/LocaleContext';

type Props = {
  saving: boolean;
  saveLabel: string;
  onSave: () => void;
};

/** “Save for future use” row — shows loader while POST is in flight. */
export function PickerAddOption({ saving, saveLabel, onSave }: Props) {
  const { t } = useLocale();

  return (
    <li role="option" aria-selected={false}>
      <button
        type="button"
        className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-start text-sm text-primary hover:bg-accent disabled:cursor-wait disabled:opacity-80"
        disabled={saving}
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => {
          if (!saving) onSave();
        }}
        aria-busy={saving}
      >
        {saving ? (
          <BrandLoader size="sm" className="shrink-0" />
        ) : (
          <Plus className="h-3.5 w-3.5 shrink-0" />
        )}
        <span className="min-w-0 flex-1">
          {saving ? t('common.saving') : saveLabel}
        </span>
      </button>
    </li>
  );
}
