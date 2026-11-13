import type { TranslationKey } from '../i18n/translations';
import type { ManualPaymentSubmitBody } from '../types/manualPayment';
import { isValidPakPhone } from './validation';

export function validateManualPaymentSubmit(
  body: ManualPaymentSubmitBody
): TranslationKey | null {
  const rawTxn = body.transactionId.trim();
  if (!rawTxn || rawTxn.length < 3) {
    return 'manualPayment.validationTxn';
  }
  if (rawTxn.length > 80) {
    return 'manualPayment.validationTxn';
  }

  const name = body.senderAccountName.trim();
  if (!name || name.length < 2) {
    return 'manualPayment.validationName';
  }
  if (name.length > 120) {
    return 'manualPayment.validationName';
  }

  if (body.senderAccountTitle.trim().length > 120) {
    return 'manualPayment.validationName';
  }

  const phone = body.senderPhone?.trim() ?? '';
  if (phone && !isValidPakPhone(phone)) {
    return 'manualPayment.validationPhone';
  }

  if (body.notes && body.notes.trim().length > 500) {
    return 'manualPayment.validationNotes';
  }

  return null;
}
