export interface ISubprogram {
  id: string;
  name: string;
}

export interface IProgram {
  id: string;
  name: string;
  subprograms: ISubprogram[];
}

export interface IActivityPeriod {
  weekNumber: number;
  monthNumber: number | null;
  year: number | null;
  projectedActivities: number;
  executedActivities: number;
  projectedAttendees: number;
  actualAttendees: number;
  responsible: string;
}

export interface IActivityContent {
  id: string;
  title: string;
  executionDate: string | null;
  activities: IActivityPeriod[];
}

export interface ActivityTableRow {
  id: string;
  title: string;
  executionDate: string | null;
  projectedActivities: number;
  executedActivities: number;
  projectedAttendees: number;
  actualAttendees: number;
  weekNumber: number;
  monthNumber: number | null;
  year: number | null;
  responsible: string;
}

export interface ActivityFilters {
  date: string;
  month: string;
  year: string;
}

type GetAllActivitiesProgram = {
  id: string;
  [key: string]: unknown;
};

function parseDate(value: string): Date {
  return new Date(`${value}T00:00:00`);
}

function getExecutionMonth(executionDate: string | null): number | null {
  if (!executionDate) return null;
  return parseDate(executionDate).getMonth() + 1;
}

function getExecutionYear(executionDate: string | null): number | null {
  if (!executionDate) return null;
  return parseDate(executionDate).getFullYear();
}

export function parseProgramsFromGetAll(content: GetAllActivitiesProgram[]): IProgram[] {
  return content.map((program) => {
    const subprograms = Object.keys(program)
      .filter((key) => key !== 'id')
      .map((name) => ({ id: name, name }));

    return {
      id: String(program.id),
      name: String(program.id),
      subprograms,
    };
  });
}

export function parseProgramsFromGetAllProgram(
  program: GetAllActivitiesProgram
): ISubprogram[] {
  return Object.keys(program)
    .filter((key) => key !== 'id')
    .map((name) => ({ id: name, name }));
}

function periodMatchesFilters(
  period: IActivityPeriod,
  executionDate: string | null,
  filters: ActivityFilters
): boolean {
  const { date, month, year } = filters;

  if (date) {
    return executionDate === date;
  }

  if (year) {
    const periodYear = period.year ?? getExecutionYear(executionDate);
    if (periodYear == null || periodYear.toString() !== year) {
      return false;
    }
  }

  if (month) {
    const periodMonth = period.monthNumber ?? getExecutionMonth(executionDate);
    if (periodMonth == null || periodMonth.toString() !== month) {
      return false;
    }
  }

  return true;
}

export function pickActivityPeriod(
  item: IActivityContent,
  filters: ActivityFilters
): IActivityPeriod | null {
  const { date, month, year } = filters;

  if (!date && !month && !year) {
    return item.activities[0] ?? null;
  }

  if (date) {
    if (item.executionDate !== date) return null;
    return item.activities[0] ?? null;
  }

  const matchedPeriod = item.activities.find((period) =>
    periodMatchesFilters(period, item.executionDate, filters)
  );

  if (matchedPeriod) return matchedPeriod;

  if (item.executionDate && periodMatchesFilters(
    {
      weekNumber: item.activities[0]?.weekNumber ?? 1,
      monthNumber: getExecutionMonth(item.executionDate),
      year: getExecutionYear(item.executionDate),
      projectedActivities: item.activities[0]?.projectedActivities ?? 0,
      executedActivities: item.activities[0]?.executedActivities ?? 0,
      projectedAttendees: item.activities[0]?.projectedAttendees ?? 0,
      actualAttendees: item.activities[0]?.actualAttendees ?? 0,
      responsible: item.activities[0]?.responsible ?? '',
    },
    item.executionDate,
    filters
  )) {
    return item.activities[0] ?? null;
  }

  return null;
}

export function matchesActivityFilters(item: IActivityContent, filters: ActivityFilters): boolean {
  const { date, month, year } = filters;
  if (!date && !month && !year) return true;
  return pickActivityPeriod(item, filters) !== null;
}

export function toActivityTableRow(
  item: IActivityContent,
  filters: ActivityFilters
): ActivityTableRow | null {
  const period = pickActivityPeriod(item, filters);
  if (!period) return null;

  return {
    id: item.id,
    title: item.title,
    executionDate: item.executionDate,
    projectedActivities: period.projectedActivities,
    executedActivities: period.executedActivities,
    projectedAttendees: period.projectedAttendees,
    actualAttendees: period.actualAttendees,
    weekNumber: period.weekNumber,
    monthNumber: period.monthNumber,
    year: period.year,
    responsible: period.responsible,
  };
}

export function buildActivityTableRows(
  content: IActivityContent[],
  filters: ActivityFilters
): ActivityTableRow[] {
  return content
    .filter((item) => matchesActivityFilters(item, filters))
    .map((item) => toActivityTableRow(item, filters))
    .filter((row): row is ActivityTableRow => row !== null);
}

export function collectAvailableYears(content: IActivityContent[]): number[] {
  const years = new Set<number>();

  content.forEach((item) => {
    const executionYear = getExecutionYear(item.executionDate);
    if (executionYear) years.add(executionYear);

    item.activities.forEach((period) => {
      if (period.year != null) years.add(period.year);
    });
  });

  years.add(new Date().getFullYear());
  return Array.from(years).sort((a, b) => b - a);
}

export function formatExecutionDate(
  executionDate: string | null,
  locale: string,
  emptyLabel: string
): string {
  if (!executionDate) return emptyLabel;

  try {
    return new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(parseDate(executionDate));
  } catch {
    return executionDate;
  }
}
