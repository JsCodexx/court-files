function pad(n: number): string {
  return String(n).padStart(2, '0');
}

export function toISODate(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function parseISODate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}

export function todayISO(): string {
  return toISODate(new Date());
}

export function tomorrowISO(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return toISODate(d);
}

type MonthLabel = (index: number, short?: boolean) => string;

export function formatDisplayDate(
  iso: string,
  monthLabel?: MonthLabel
): string {
  if (!iso) return '—';
  try {
    const d = parseISODate(iso);
    if (monthLabel) {
      return `${pad(d.getDate())} ${monthLabel(d.getMonth(), true)} ${d.getFullYear()}`;
    }
    const months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    return `${pad(d.getDate())} ${months[d.getMonth()]} ${d.getFullYear()}`;
  } catch {
    return iso;
  }
}

/** Official-style DD-MM-YYYY for proceeding-history printouts. */
export function formatDMYDate(iso: string): string {
  if (!iso) return '—';
  try {
    const d = parseISODate(iso);
    return `${pad(d.getDate())}-${pad(d.getMonth() + 1)}-${d.getFullYear()}`;
  } catch {
    return iso;
  }
}

export function formatMonthYear(
  date: Date,
  monthLabel?: MonthLabel
): string {
  if (monthLabel) {
    return `${monthLabel(date.getMonth())} ${date.getFullYear()}`;
  }
  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];
  return `${months[date.getMonth()]} ${date.getFullYear()}`;
}

export function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function endOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

export function startOfWeek(date: Date): Date {
  const d = new Date(date);
  d.setDate(d.getDate() - d.getDay());
  d.setHours(0, 0, 0, 0);
  return d;
}

export function endOfWeek(date: Date): Date {
  const d = startOfWeek(date);
  d.setDate(d.getDate() + 6);
  return d;
}

export function addMonths(date: Date, amount: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + amount, 1);
}

export function eachDayOfInterval(start: Date, end: Date): Date[] {
  const days: Date[] = [];
  const cursor = new Date(start);
  cursor.setHours(0, 0, 0, 0);
  const last = new Date(end);
  last.setHours(0, 0, 0, 0);
  while (cursor <= last) {
    days.push(new Date(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
  return days;
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function isSameMonth(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}

export function isTodayDate(iso: string): boolean {
  try {
    return isSameDay(parseISODate(iso), new Date());
  } catch {
    return false;
  }
}

export function isTomorrowDate(iso: string): boolean {
  try {
    return iso === tomorrowISO();
  } catch {
    return false;
  }
}

export function isPastDate(iso: string): boolean {
  try {
    const d = parseISODate(iso);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    d.setHours(0, 0, 0, 0);
    return d < today;
  } catch {
    return false;
  }
}

/** Courts are closed on Sunday (JS getDay() === 0). */
export function isSunday(isoOrDate: string | Date): boolean {
  try {
    const d =
      typeof isoOrDate === 'string' ? parseISODate(isoOrDate) : isoOrDate;
    return d.getDay() === 0;
  } catch {
    return false;
  }
}

/** Today if it's a working day, otherwise the next Monday. */
export function nextWorkingDayISO(from: Date = new Date()): string {
  const d = new Date(from);
  d.setHours(0, 0, 0, 0);
  while (d.getDay() === 0) {
    d.setDate(d.getDate() + 1);
  }
  return toISODate(d);
}
