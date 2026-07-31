/** Converts Urdu (۰-۹) and Arabic-Indic (٠-٩) digits to ASCII so users can
 *  type numbers with an Urdu keyboard. */
export function normalizeDigits(value: string): string {
  return value
    .replace(/[۰-۹]/g, (d) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)));
}

/** Strips everything but digits, converting +92 prefixes to local 0 form. */
export function normalizePhone(value: string): string {
  let v = normalizeDigits(value).replace(/\D/g, '');
  if (v.startsWith('92') && v.length === 12) v = `0${v.slice(2)}`;
  return v;
}

/** Input mask: digits only, capped at 11 (03001234567). */
export function maskPhone(value: string): string {
  return normalizeDigits(value).replace(/\D/g, '').slice(0, 11);
}

/** Pakistani mobile numbers: exactly 11 digits, 03XXXXXXXXX. */
export function isValidPakPhone(value: string): boolean {
  return /^03\d{9}$/.test(normalizePhone(value));
}

export function normalizeCnic(value: string): string {
  return normalizeDigits(value).replace(/\D/g, '');
}

/** Input mask: auto-inserts dashes as the user types → 31209-8736287-1 */
export function maskCnic(value: string): string {
  const digits = normalizeCnic(value).slice(0, 13);
  const parts = [digits.slice(0, 5), digits.slice(5, 12), digits.slice(12, 13)];
  return parts.filter(Boolean).join('-');
}

/** Pakistani CNIC: 13 digits (stored/displayed as XXXXX-XXXXXXX-X) */
export function isValidCnic(value: string): boolean {
  return /^\d{13}$/.test(normalizeCnic(value));
}

/** Formats a 13-digit CNIC as XXXXX-XXXXXXX-X */
export function formatCnic(value: string): string {
  const v = normalizeCnic(value);
  if (v.length !== 13) return value.trim();
  return `${v.slice(0, 5)}-${v.slice(5, 12)}-${v.slice(12)}`;
}

/** Case IDs: letters, digits, spaces, dashes, dots and slashes */
export function isValidCaseId(value: string): boolean {
  return /^[A-Za-z0-9\s./-]+$/.test(value.trim());
}
