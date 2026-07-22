export interface ActivityTrackingPeriod {
  weekNumber: number;
  monthNumber: number;
  year: number;
}

export function parseDateOnly(value: string | Date): Date {
  if (value instanceof Date) {
    return new Date(value.getFullYear(), value.getMonth(), value.getDate());
  }

  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function getTrackingPeriodFromDate(date: Date): ActivityTrackingPeriod {
  const day = date.getDate();
  const weekNumber = Math.min(4, Math.ceil(day / 7));

  return {
    weekNumber,
    monthNumber: date.getMonth() + 1,
    year: date.getFullYear(),
  };
}
