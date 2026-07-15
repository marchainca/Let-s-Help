import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { SmartAlert, COVERAGE_THRESHOLD, COMPLIANCE_THRESHOLD } from '@/types/dashboard/smart-alerts';
import { useAttendanceSummary } from './useAttendanceSummary';
import { useActivitySummary } from './useActivitySummary';
import { useTrackingSummary } from './useTrackingSummary';
import { useDropoutSummary } from './useDropoutSummary';

export function useSmartAlertsSection() {
  const { t } = useTranslation();
  const attendanceQuery = useAttendanceSummary();
  const activityQuery = useActivitySummary();
  const trackingQuery = useTrackingSummary();
  const dropoutQuery = useDropoutSummary();

  const alerts = useMemo<SmartAlert[]>(() => {
    const items: SmartAlert[] = [];
    const attendance = attendanceQuery.data?.kpis;
    const activity = activityQuery.data?.activities;
    const tracking = trackingQuery.data?.tracking;
    const dropout = dropoutQuery.data?.dropout;

    const lowestAttendanceProgram = attendance?.topProgramsByAttendance.at(-1);
    if (lowestAttendanceProgram) {
      items.push({
        id: 'lowest-attendance-program',
        severity: 'warning',
        categoryKey: 'lowestAttendanceProgram',
        title: t('dashboard.smartAlerts.categories.lowestAttendanceProgram'),
        description: t('dashboard.smartAlerts.messages.lowestAttendanceProgram', {
          name: lowestAttendanceProgram.name,
          count: lowestAttendanceProgram.count,
          percent: lowestAttendanceProgram.percent,
        }),
        source: 'attendance-summary',
      });
    }

    const highestAbsenceProgram = attendance?.topProgramsByAbsence.at(0);
    if (highestAbsenceProgram) {
      items.push({
        id: 'highest-absence-program',
        severity: 'critical',
        categoryKey: 'highestAbsenceProgram',
        title: t('dashboard.smartAlerts.categories.highestAbsenceProgram'),
        description: t('dashboard.smartAlerts.messages.highestAbsenceProgram', {
          name: highestAbsenceProgram.name,
          count: highestAbsenceProgram.count,
          percent: highestAbsenceProgram.percent,
        }),
        source: 'attendance-summary',
      });
    }

    const lowestAttendanceActivity = activity?.leastAttendance;
    if (lowestAttendanceActivity?.activity?.name || lowestAttendanceActivity?.name) {
      items.push({
        id: 'lowest-attendance-activity',
        severity: 'warning',
        categoryKey: 'lowestAttendanceActivity',
        title: t('dashboard.smartAlerts.categories.lowestAttendanceActivity'),
        description: t('dashboard.smartAlerts.messages.lowestAttendanceActivity', {
          name: lowestAttendanceActivity.activity?.name ?? lowestAttendanceActivity.name,
          count: lowestAttendanceActivity.value,
        }),
        source: 'activity-summary',
      });
    }

    const responsibles = tracking?.responsibleCompliance ?? [];
    if (responsibles.length > 0) {
      const lowestCompliance = [...responsibles].sort(
        (a, b) => a.complianceLevel.ratio - b.complianceLevel.ratio
      )[0];

      if (lowestCompliance) {
        items.push({
          id: 'lowest-responsible-compliance',
          severity: 'warning',
          categoryKey: 'lowestResponsibleCompliance',
          title: t('dashboard.smartAlerts.categories.lowestResponsibleCompliance'),
          description: t('dashboard.smartAlerts.messages.lowestResponsibleCompliance', {
            name: lowestCompliance.responsible?.name ?? lowestCompliance.name,
            percent: lowestCompliance.complianceLevel.percent,
          }),
          source: 'tracking-summary',
        });
      }

      responsibles
        .filter((row) => row.complianceLevel.ratio < COMPLIANCE_THRESHOLD)
        .sort((a, b) => a.complianceLevel.ratio - b.complianceLevel.ratio)
        .forEach((row) => {
          items.push({
            id: `responsible-below-70-${row.id}`,
            severity: 'critical',
            categoryKey: 'responsibleBelow70',
            title: t('dashboard.smartAlerts.categories.responsibleBelow70'),
            description: t('dashboard.smartAlerts.messages.responsibleBelow70', {
              name: row.responsible?.name ?? row.name,
              percent: row.complianceLevel.percent,
            }),
            source: 'tracking-summary',
          });
        });
    }

    const criticalCount = dropout?.riskIndicators.criticalRisk ?? 0;
    if (criticalCount > 0) {
      const criticalNames =
        dropout?.byPeriod?.['15days']?.beneficiaries
          .filter((b) => b.riskLevel === 'critical')
          .map((b) => b.beneficiary?.name ?? b.name)
          .slice(0, 3)
          .join(', ') ?? '';

      items.push({
        id: 'critical-beneficiaries',
        severity: 'critical',
        categoryKey: 'criticalBeneficiaries',
        title: t('dashboard.smartAlerts.categories.criticalBeneficiaries'),
        description: criticalNames
          ? t('dashboard.smartAlerts.messages.criticalBeneficiariesWithNames', {
              count: criticalCount,
              names: criticalNames,
            })
          : t('dashboard.smartAlerts.messages.criticalBeneficiaries', { count: criticalCount }),
        source: 'dropout-summary',
      });
    }

    if (tracking && tracking.coverage.ratio < COVERAGE_THRESHOLD) {
      items.push({
        id: 'coverage-below-80',
        severity: 'warning',
        categoryKey: 'coverageBelow80',
        title: t('dashboard.smartAlerts.categories.coverageBelow80'),
        description: t('dashboard.smartAlerts.messages.coverageBelow80', {
          percent: tracking.coverage.percent,
          actual: tracking.coverage.actualAttendees,
          projected: tracking.coverage.projectedAttendees,
        }),
        source: 'tracking-summary',
      });
    }

    responsibles
      .filter((row) => row.coverageCompliance.ratio < COVERAGE_THRESHOLD)
      .forEach((row) => {
        items.push({
          id: `responsible-coverage-below-80-${row.id}`,
          severity: 'warning',
          categoryKey: 'responsibleCoverageBelow80',
          title: t('dashboard.smartAlerts.categories.responsibleCoverageBelow80'),
          description: t('dashboard.smartAlerts.messages.responsibleCoverageBelow80', {
            name: row.responsible?.name ?? row.name,
            percent: row.coverageCompliance.percent,
          }),
          source: 'tracking-summary',
        });
      });

    const severityOrder = { critical: 0, warning: 1, info: 2 };
    return items.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);
  }, [attendanceQuery.data, activityQuery.data, trackingQuery.data, dropoutQuery.data, t]);

  const isLoading =
    attendanceQuery.isLoading ||
    activityQuery.isLoading ||
    trackingQuery.isLoading ||
    dropoutQuery.isLoading;

  const isError =
    attendanceQuery.isError ||
    activityQuery.isError ||
    trackingQuery.isError ||
    dropoutQuery.isError;

  const errorMessage =
    (attendanceQuery.error as Error | undefined)?.message ||
    (activityQuery.error as Error | undefined)?.message ||
    (trackingQuery.error as Error | undefined)?.message ||
    (dropoutQuery.error as Error | undefined)?.message;

  const refetch = () => {
    void attendanceQuery.refetch();
    void activityQuery.refetch();
    void trackingQuery.refetch();
    void dropoutQuery.refetch();
  };

  return {
    alerts,
    isLoading,
    isError,
    errorMessage,
    refetch,
  };
}
