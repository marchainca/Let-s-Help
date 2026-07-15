import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type { EChartsOption } from 'echarts';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import EventBusyIcon from '@mui/icons-material/EventBusy';
import VerifiedIcon from '@mui/icons-material/Verified';
import PeopleIcon from '@mui/icons-material/People';
import { SvgIconComponent } from '@mui/icons-material';
import { useAttendanceSummary } from './useAttendanceSummary';
import { useAppTheme } from '@/providers/ThemeProvider';
import { RankedEntity } from '@/types/dashboard/attendance-summary';
import {
  buildAttendanceDonutOption,
  buildAttendanceTrendOption,
  buildRankingBarOption,
  getChartThemeColors,
  getRankingChartHeight,
  getRankingLabelLayout,
} from './attendanceChartOptions';

export interface AttendanceKpiItem {
  id: string;
  title: string;
  tooltip: string;
  value: string;
  subtitle?: string;
  icon: SvgIconComponent;
  color: string;
}

export interface AttendanceRankingItem {
  id: string;
  title: string;
  items: RankedEntity[];
  barColor: string;
  chartOption: EChartsOption;
  chartHeight: number;
}

export function useAttendanceSummarySection() {
  const { t } = useTranslation();
  const { mode } = useAppTheme();
  const query = useAttendanceSummary();
  const colors = getChartThemeColors(mode);

  const kpiCards = useMemo<AttendanceKpiItem[]>(() => {
    const attendance = query.data?.attendance;
    const kpis = query.data?.kpis;

    return [
      {
        id: 'effectiveAttendance',
        title: t('dashboard.attendanceSummary.kpis.effectiveAttendance.title'),
        tooltip: t('dashboard.attendanceSummary.kpis.effectiveAttendance.tooltip'),
        value: kpis?.effectiveAttendance.percent ?? '0%',
        subtitle: String(kpis?.effectiveAttendance.count ?? 0),
        icon: TrendingUpIcon,
        color: '#4CAF50',
      },
      {
        id: 'absences',
        title: t('dashboard.attendanceSummary.kpis.absences.title'),
        tooltip: t('dashboard.attendanceSummary.kpis.absences.tooltip'),
        value: kpis?.absences.percent ?? '0%',
        subtitle: String(kpis?.absences.count ?? 0),
        icon: EventBusyIcon,
        color: '#F44336',
      },
      {
        id: 'justifiedAbsences',
        title: t('dashboard.attendanceSummary.kpis.justifiedAbsences.title'),
        tooltip: t('dashboard.attendanceSummary.kpis.justifiedAbsences.tooltip'),
        value: kpis?.justifiedAbsences.percent ?? '0%',
        subtitle: String(kpis?.justifiedAbsences.count ?? 0),
        icon: VerifiedIcon,
        color: '#FF9800',
      },
      {
        id: 'beneficiariesPresent',
        title: t('dashboard.attendanceSummary.kpis.beneficiariesPresent.title'),
        tooltip: t('dashboard.attendanceSummary.kpis.beneficiariesPresent.tooltip'),
        value: String(attendance?.beneficiariesPresent ?? 0),
        icon: PeopleIcon,
        color: '#29ABE2',
      },
    ];
  }, [query.data, t]);

  const trendChartOption = useMemo<EChartsOption>(() => {
    const attendance = query.data?.attendance;
    const labels = [
      t('dashboard.attendanceSummary.charts.periods.day'),
      t('dashboard.attendanceSummary.charts.periods.week'),
      t('dashboard.attendanceSummary.charts.periods.month'),
      t('dashboard.attendanceSummary.charts.periods.year'),
    ];
    const values = [
      attendance?.day ?? 0,
      attendance?.week ?? 0,
      attendance?.month ?? 0,
      attendance?.year ?? 0,
    ];

    return buildAttendanceTrendOption(
      labels,
      values,
      t('dashboard.attendanceSummary.charts.trendTitle'),
      colors
    );
  }, [query.data, t, colors]);

  const donutChartOption = useMemo<EChartsOption>(() => {
    const attendance = query.data?.attendance;
    const labels = [
      t('dashboard.attendanceSummary.charts.status.present'),
      t('dashboard.attendanceSummary.charts.status.absent'),
      t('dashboard.attendanceSummary.charts.status.justified'),
    ];
    const values = [
      attendance?.beneficiariesPresent ?? 0,
      attendance?.absences ?? 0,
      attendance?.justified ?? 0,
    ];

    return buildAttendanceDonutOption(
      labels,
      values,
      t('dashboard.attendanceSummary.charts.donutTitle'),
      colors
    );
  }, [query.data, t, colors]);

  const rankings = useMemo<AttendanceRankingItem[]>(() => {
    const kpis = query.data?.kpis;
    if (!kpis) return [];

    const rankingConfig = [
      {
        id: 'topProgramsByAttendance',
        titleKey: 'topProgramsByAttendance',
        items: kpis.topProgramsByAttendance,
        barColor: '#4CAF50',
      },
      {
        id: 'topProgramsByAbsence',
        titleKey: 'topProgramsByAbsence',
        items: kpis.topProgramsByAbsence,
        barColor: '#F44336',
      },
      {
        id: 'topSubProgramsByAttendance',
        titleKey: 'topSubProgramsByAttendance',
        items: kpis.topSubProgramsByAttendance,
        barColor: '#29ABE2',
      },
      {
        id: 'topSubProgramsByAbsence',
        titleKey: 'topSubProgramsByAbsence',
        items: kpis.topSubProgramsByAbsence,
        barColor: '#FF5722',
      },
      {
        id: 'topActivitiesByAttendance',
        titleKey: 'topActivitiesByAttendance',
        items: kpis.topActivitiesByAttendance,
        barColor: '#7B61FF',
      },
      {
        id: 'topActivitiesByAbsence',
        titleKey: 'topActivitiesByAbsence',
        items: kpis.topActivitiesByAbsence,
        barColor: '#E91E63',
      },
    ] as const;

    return rankingConfig.map((config) => {
      const mappedItems = config.items.map((item) => ({
        name: item.name,
        count: item.count,
        percent: item.percent,
      }));
      const { lineCounts } = getRankingLabelLayout(mappedItems.map((item) => item.name));

      return {
        id: config.id,
        title: t(`dashboard.attendanceSummary.rankings.${config.titleKey}`),
        items: config.items,
        barColor: config.barColor,
        chartHeight: getRankingChartHeight(lineCounts),
        chartOption: buildRankingBarOption(
          mappedItems,
          t(`dashboard.attendanceSummary.rankings.${config.titleKey}`),
          config.barColor,
          colors
        ),
      };
    });
  }, [query.data, t, colors]);

  const hasChartData = useMemo(() => {
    const attendance = query.data?.attendance;
    if (!attendance) return false;

    const trendTotal = attendance.day + attendance.week + attendance.month + attendance.year;
    const statusTotal =
      attendance.beneficiariesPresent + attendance.absences + attendance.justified;

    return trendTotal > 0 || statusTotal > 0;
  }, [query.data]);

  return {
    kpiCards,
    trendChartOption,
    donutChartOption,
    rankings,
    hasChartData,
    isLoading: query.isLoading,
    isError: query.isError,
    errorMessage: (query.error as Error | undefined)?.message,
    refetch: query.refetch,
  };
}
