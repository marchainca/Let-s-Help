import { RiskLevel } from '@/types/dashboard/dropout-summary';

export const RISK_LEVEL_COLORS: Record<
  RiskLevel,
  { backgroundColor: string; color: string }
> = {
  critical: { backgroundColor: '#F44336', color: '#ffffff' },
  high: { backgroundColor: '#FF9800', color: '#ffffff' },
  medium: { backgroundColor: '#FFEB3B', color: '#424242' },
  low: { backgroundColor: '#4CAF50', color: '#ffffff' },
};

export function formatDropoutDate(date: string | null, locale: string): string {
  if (!date) return '—';

  try {
    return new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(new Date(date));
  } catch {
    return '—';
  }
}
