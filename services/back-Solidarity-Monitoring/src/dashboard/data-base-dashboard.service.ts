import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ActivityTracking } from 'src/activities/entities/activity-tracking.entity';
import { Attendance } from 'src/attendance/entities/attendance.entity';
import { User } from 'src/users/entities/user.entity';
import { Beneficiary } from 'src/recognition/entities/beneficiary.entity';
import { Program } from 'src/activities/entities/program.entity';
import { SubProgram } from 'src/activities/entities/sub-program.entity';
import { Activity } from 'src/activities/entities/activity.entity';
import { Absence } from 'src/users/entities/absence.entity';
import { Report } from 'src/users/entities/report.entity';
import { Repository } from 'typeorm';

@Injectable()
export class DataBaseDashboardService {
    constructor(
        @InjectRepository(ActivityTracking)
        private trackingRepo: Repository<ActivityTracking>,
        @InjectRepository(Attendance)
        private attendanceRepo: Repository<Attendance>,
        @InjectRepository(User)
        private userRepo: Repository<User>,
        @InjectRepository(Beneficiary)
        private beneficiaryRepo: Repository<Beneficiary>,
        @InjectRepository(Program)
        private programRepo: Repository<Program>,
        @InjectRepository(SubProgram)
        private subProgramRepo: Repository<SubProgram>,
        @InjectRepository(Activity)
        private activityRepo: Repository<Activity>,
        @InjectRepository(Absence)
        private absenceRepo: Repository<Absence>,
        @InjectRepository(Report)
        private reportRepo: Repository<Report>,
    ) {}

    // Cálculo de avances: currentMonth, lastMonth, semester
    async calculateProgress() {
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth(); // 0-11

        // Definir rangos de fechas
        const startCurrentMonth = new Date(currentYear, currentMonth, 1);
        const endCurrentMonth = new Date(currentYear, currentMonth + 1, 0);
        const startLastMonth = new Date(currentYear, currentMonth - 1, 1);
        const endLastMonth = new Date(currentYear, currentMonth, 0);
        const startSemester = new Date(currentYear, currentMonth >= 6 ? 6 : 0, 1); // inicio del semestre actual
        const endSemester = new Date(currentYear, currentMonth >= 6 ? 12 : 6, 0);

        // Helper para calcular ratio promedio (Executed / Planned) en un rango
        const getProgressRatio = async (start: Date, end: Date): Promise<number> => {
        const result = await this.trackingRepo
            .createQueryBuilder('track')
            .select('SUM(track.ExecutedActivities)', 'totalExecuted')
            .addSelect('SUM(track.PlannedActivities)', 'totalPlanned')
            .where('track.CreatedAt BETWEEN :start AND :end', { start, end })
            .getRawOne();

        const totalExecuted = Number(result.totalExecuted) || 0;
        const totalPlanned = Number(result.totalPlanned) || 0;
        if (totalPlanned === 0) return 0;
        return Math.min(1, totalExecuted / totalPlanned);
        };

        const currentMonthProgress = await getProgressRatio(startCurrentMonth, endCurrentMonth);
        const lastMonthProgress = await getProgressRatio(startLastMonth, endLastMonth);
        const semesterProgress = await getProgressRatio(startSemester, endSemester);

        return {
        currentMonth: currentMonthProgress,
        lastMonth: lastMonthProgress,
        semester: semesterProgress,
        };
    }

    // Attendance dashboard summary and KPIs
    async getAttendanceDashboardSummary() {
        const now = new Date();
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

        // Week start (Monday)
        const day = now.getDay();
        const diffToMonday = (day + 6) % 7; // 0->Monday
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - diffToMonday);
        startOfWeek.setHours(0,0,0,0);
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        endOfWeek.setHours(23,59,59,999);

        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

        const startOfYear = new Date(now.getFullYear(), 0, 1);
        const endOfYear = new Date(now.getFullYear(), 11, 31, 23, 59, 59);

        // Counts by period (only present status)
        const [dayPresentRaw, weekPresentRaw, monthPresentRaw, yearPresentRaw] = await Promise.all([
            this.attendanceRepo.createQueryBuilder('att')
                .where('att.Status = :status', { status: 'present' })
                .andWhere('att.AttendanceDate BETWEEN :start AND :end', { start: startOfDay, end: endOfDay })
                .getCount(),
            this.attendanceRepo.createQueryBuilder('att')
                .where('att.Status = :status', { status: 'present' })
                .andWhere('att.AttendanceDate BETWEEN :start AND :end', { start: startOfWeek, end: endOfWeek })
                .getCount(),
            this.attendanceRepo.createQueryBuilder('att')
                .where('att.Status = :status', { status: 'present' })
                .andWhere('att.AttendanceDate BETWEEN :start AND :end', { start: startOfMonth, end: endOfMonth })
                .getCount(),
            this.attendanceRepo.createQueryBuilder('att')
                .where('att.Status = :status', { status: 'present' })
                .andWhere('att.AttendanceDate BETWEEN :start AND :end', { start: startOfYear, end: endOfYear })
                .getCount(),
        ]);

        // Beneficiaries present today (distinct)
        const beneficiariesPresentRaw = await this.attendanceRepo
            .createQueryBuilder('att')
            .select('COUNT(DISTINCT att.IdBeneficiary)', 'count')
            .where('att.Status = :status', { status: 'present' })
            .andWhere('att.AttendanceDate BETWEEN :start AND :end', { start: startOfDay, end: endOfDay })
            .getRawOne();

        // Absences and justified counts for today
        const [absentRaw, justifiedRaw] = await Promise.all([
            this.attendanceRepo.createQueryBuilder('att')
                .where('att.Status = :status', { status: 'absent' })
                .andWhere('att.AttendanceDate BETWEEN :start AND :end', { start: startOfDay, end: endOfDay })
                .getCount(),
            this.attendanceRepo.createQueryBuilder('att')
                .where('att.Status = :status', { status: 'justified' })
                .andWhere('att.AttendanceDate BETWEEN :start AND :end', { start: startOfDay, end: endOfDay })
                .getCount(),
        ]);

        const dayPresent = Number(dayPresentRaw) || 0;
        const weekPresent = Number(weekPresentRaw) || 0;
        const monthPresent = Number(monthPresentRaw) || 0;
        const yearPresent = Number(yearPresentRaw) || 0;
        const beneficiariesPresent = Number(beneficiariesPresentRaw.count) || 0;
        const absences = Number(absentRaw) || 0;
        const justified = Number(justifiedRaw) || 0;

        // Totals for percentages (use year range)
        const totalYearRaw = await this.attendanceRepo.createQueryBuilder('att')
            .andWhere('att.AttendanceDate BETWEEN :start AND :end', { start: startOfYear, end: endOfYear })
            .getCount();

        const totalYear = Number(totalYearRaw) || 0;

        const totalPresentYear = yearPresent;
        const totalAbsenceYearRaw = await this.attendanceRepo.createQueryBuilder('att')
            .where('att.Status = :status', { status: 'absent' })
            .andWhere('att.AttendanceDate BETWEEN :start AND :end', { start: startOfYear, end: endOfYear })
            .getCount();
        const totalJustifiedYearRaw = await this.attendanceRepo.createQueryBuilder('att')
            .where('att.Status = :status', { status: 'justified' })
            .andWhere('att.AttendanceDate BETWEEN :start AND :end', { start: startOfYear, end: endOfYear })
            .getCount();

        const totalAbsenceYear = Number(totalAbsenceYearRaw) || 0;
        const totalJustifiedYear = Number(totalJustifiedYearRaw) || 0;

        const percent = (val: number, total: number) => {
            if (total === 0) return '0%';
            return `${((val / total) * 100).toFixed(2)}%`;
        };

        // Top lists (limit 5)
        const limit = 5;

        const topProgramsByAttendanceRaw = await this.attendanceRepo.createQueryBuilder('att')
            .innerJoin('att.activity', 'activity')
            .innerJoin('activity.subProgram', 'subProgram')
            .innerJoin('subProgram.program', 'program')
            .select('program.IdProgram', 'id')
            .addSelect('COUNT(att.IdAttendance)', 'count')
            .where('att.Status = :status', { status: 'present' })
            .andWhere('att.AttendanceDate BETWEEN :start AND :end', { start: startOfYear, end: endOfYear })
            .groupBy('program.IdProgram')
            .orderBy('count', 'DESC')
            .limit(limit)
            .getRawMany();

        const topProgramsByAbsenceRaw = await this.attendanceRepo.createQueryBuilder('att')
            .innerJoin('att.activity', 'activity')
            .innerJoin('activity.subProgram', 'subProgram')
            .innerJoin('subProgram.program', 'program')
            .select('program.IdProgram', 'id')
            .addSelect('COUNT(att.IdAttendance)', 'count')
            .where('att.Status = :status', { status: 'absent' })
            .andWhere('att.AttendanceDate BETWEEN :start AND :end', { start: startOfYear, end: endOfYear })
            .groupBy('program.IdProgram')
            .orderBy('count', 'DESC')
            .limit(limit)
            .getRawMany();

        const topSubProgramsByAttendanceRaw = await this.attendanceRepo.createQueryBuilder('att')
            .innerJoin('att.activity', 'activity')
            .innerJoin('activity.subProgram', 'subProgram')
            .select('subProgram.IdSubProgram', 'id')
            .addSelect('COUNT(att.IdAttendance)', 'count')
            .where('att.Status = :status', { status: 'present' })
            .andWhere('att.AttendanceDate BETWEEN :start AND :end', { start: startOfYear, end: endOfYear })
            .groupBy('subProgram.IdSubProgram')
            .orderBy('count', 'DESC')
            .limit(limit)
            .getRawMany();

        const topSubProgramsByAbsenceRaw = await this.attendanceRepo.createQueryBuilder('att')
            .innerJoin('att.activity', 'activity')
            .innerJoin('activity.subProgram', 'subProgram')
            .select('subProgram.IdSubProgram', 'id')
            .addSelect('COUNT(att.IdAttendance)', 'count')
            .where('att.Status = :status', { status: 'absent' })
            .andWhere('att.AttendanceDate BETWEEN :start AND :end', { start: startOfYear, end: endOfYear })
            .groupBy('subProgram.IdSubProgram')
            .orderBy('count', 'DESC')
            .limit(limit)
            .getRawMany();

        const topActivitiesByAttendanceRaw = await this.attendanceRepo.createQueryBuilder('att')
            .innerJoin('att.activity', 'activity')
            .select('activity.IdActivity', 'id')
            .addSelect('COUNT(att.IdAttendance)', 'count')
            .where('att.Status = :status', { status: 'present' })
            .andWhere('att.AttendanceDate BETWEEN :start AND :end', { start: startOfYear, end: endOfYear })
            .groupBy('activity.IdActivity')
            .orderBy('count', 'DESC')
            .limit(limit)
            .getRawMany();

        const topActivitiesByAbsenceRaw = await this.attendanceRepo.createQueryBuilder('att')
            .innerJoin('att.activity', 'activity')
            .select('activity.IdActivity', 'id')
            .addSelect('COUNT(att.IdAttendance)', 'count')
            .where('att.Status = :status', { status: 'absent' })
            .andWhere('att.AttendanceDate BETWEEN :start AND :end', { start: startOfYear, end: endOfYear })
            .groupBy('activity.IdActivity')
            .orderBy('count', 'DESC')
            .limit(limit)
            .getRawMany();

        const mapTop = (arr: any[], total: number) => arr.map(r => ({ id: r.id, count: Number(r.count), percent: percent(Number(r.count), total) }));

        return {
            attendance: {
                day: dayPresent,
                week: weekPresent,
                month: monthPresent,
                year: yearPresent,
                beneficiariesPresent,
                absences,
                justified,
            },
            kpis: {
                effectiveAttendance: { count: totalPresentYear, percent: percent(totalPresentYear, totalYear) },
                absences: { count: totalAbsenceYear, percent: percent(totalAbsenceYear, totalYear) },
                justifiedAbsences: { count: totalJustifiedYear, percent: percent(totalJustifiedYear, totalYear) },
                topProgramsByAttendance: mapTop(topProgramsByAttendanceRaw, totalPresentYear),
                topProgramsByAbsence: mapTop(topProgramsByAbsenceRaw, totalAbsenceYear),
                topSubProgramsByAttendance: mapTop(topSubProgramsByAttendanceRaw, totalPresentYear),
                topSubProgramsByAbsence: mapTop(topSubProgramsByAbsenceRaw, totalAbsenceYear),
                topActivitiesByAttendance: mapTop(topActivitiesByAttendanceRaw, totalPresentYear),
                topActivitiesByAbsence: mapTop(topActivitiesByAbsenceRaw, totalAbsenceYear),
            }
        };
    }

    // Executive dashboard summary
    async getExecutiveDashboardSummary() {
        const [
            beneficiaries,
            programs,
            subPrograms,
            activities,
            attendances,
            absences,
            reports,
            users,
        ] = await Promise.all([
            this.beneficiaryRepo.count(),
            this.programRepo.count(),
            this.subProgramRepo.count(),
            this.activityRepo.count(),
            this.attendanceRepo.count(),
            this.absenceRepo.count(),
            this.reportRepo.count(),
            this.userRepo.count(),
        ]);

        return {
            metrics: [
                {
                    indicator: 'Total de beneficiarios registrados',
                    table: 'Beneficiaries',
                    value: beneficiaries,
                },
                {
                    indicator: 'Total de programas',
                    table: 'Programs',
                    value: programs,
                },
                {
                    indicator: 'Total de subprogramas',
                    table: 'Sub_Programs',
                    value: subPrograms,
                },
                {
                    indicator: 'Total de actividades',
                    table: 'Activities',
                    value: activities,
                },
                {
                    indicator: 'Total de asistencias registradas',
                    table: 'Attendances',
                    value: attendances,
                },
                {
                    indicator: 'Total de ausencias',
                    table: 'Absences',
                    value: absences,
                },
                {
                    indicator: 'Total de reportes disciplinarios',
                    table: 'Reports',
                    value: reports,
                },
                {
                    indicator: 'Total de líderes o usuarios',
                    table: 'Users',
                    value: users,
                },
            ],
        };
    }

    async getProgramDashboardSummary() {
        const [programsWithAttendance, programsWithAbsence, programsWithActivities, programsWithBeneficiaries] = await Promise.all([
            this.attendanceRepo.createQueryBuilder('att')
                .innerJoin('att.activity', 'activity')
                .innerJoin('activity.subProgram', 'subProgram')
                .innerJoin('subProgram.program', 'program')
                .select('program.IdProgram', 'id')
                .addSelect('program.IdLeadUser', 'leadUserId')
                .addSelect('COUNT(att.IdAttendance)', 'count')
                .where('att.Status = :status', { status: 'present' })
                .groupBy('program.IdProgram')
                .addGroupBy('program.IdLeadUser')
                .orderBy('count', 'DESC')
                .getRawMany(),
            this.attendanceRepo.createQueryBuilder('att')
                .innerJoin('att.activity', 'activity')
                .innerJoin('activity.subProgram', 'subProgram')
                .innerJoin('subProgram.program', 'program')
                .select('program.IdProgram', 'id')
                .addSelect('COUNT(att.IdAttendance)', 'count')
                .where('att.Status = :status', { status: 'absent' })
                .groupBy('program.IdProgram')
                .orderBy('count', 'DESC')
                .getRawMany(),
            this.activityRepo.createQueryBuilder('activity')
                .innerJoin('activity.subProgram', 'subProgram')
                .innerJoin('subProgram.program', 'program')
                .select('program.IdProgram', 'id')
                .addSelect('COUNT(activity.IdActivity)', 'count')
                .groupBy('program.IdProgram')
                .orderBy('count', 'DESC')
                .getRawMany(),
            this.attendanceRepo.createQueryBuilder('att')
                .innerJoin('att.activity', 'activity')
                .innerJoin('activity.subProgram', 'subProgram')
                .innerJoin('subProgram.program', 'program')
                .select('program.IdProgram', 'id')
                .addSelect('COUNT(DISTINCT att.IdBeneficiary)', 'count')
                .groupBy('program.IdProgram')
                .orderBy('count', 'DESC')
                .getRawMany(),
        ]);

        const formatProgram = (row: any, metric: string, value: number) => ({
            id: row?.id,
            metric,
            value,
        });

        const programWithMostAttendance = programsWithAttendance[0]
            ? formatProgram(programsWithAttendance[0], 'attendance', Number(programsWithAttendance[0].count) || 0)
            : { id: null, metric: 'attendance', value: 0 };

        const programWithLeastAttendance = [...programsWithAttendance].sort((a, b) => Number(a.count) - Number(b.count))[0]
            ? formatProgram([...(programsWithAttendance as any[]).sort((a, b) => Number(a.count) - Number(b.count))][0], 'attendance', Number([...programsWithAttendance].sort((a, b) => Number(a.count) - Number(b.count))[0].count) || 0)
            : { id: null, metric: 'attendance', value: 0 };

        const programWithMostActivities = programsWithActivities[0]
            ? formatProgram(programsWithActivities[0], 'activities', Number(programsWithActivities[0].count) || 0)
            : { id: null, metric: 'activities', value: 0 };

        const programWithMostBeneficiaries = programsWithBeneficiaries[0]
            ? formatProgram(programsWithBeneficiaries[0], 'beneficiaries', Number(programsWithBeneficiaries[0].count) || 0)
            : { id: null, metric: 'beneficiaries', value: 0 };

        const findProgramName = async (id: number | null) => {
            if (!id) return null;
            const program = await this.programRepo.findOne({ where: { IdProgram: id } });
            return program ? { id, name: program.IdProgram?.toString() } : { id, name: null };
        };

        const [mostAttendanceProgram, leastAttendanceProgram, mostActivitiesProgram, mostBeneficiariesProgram] = await Promise.all([
            findProgramName(programWithMostAttendance.id),
            findProgramName(programWithLeastAttendance.id),
            findProgramName(programWithMostActivities.id),
            findProgramName(programWithMostBeneficiaries.id),
        ]);

        return {
            programs: {
                mostAttendance: {
                    ...programWithMostAttendance,
                    program: mostAttendanceProgram,
                },
                leastAttendance: {
                    ...programWithLeastAttendance,
                    program: leastAttendanceProgram,
                },
                mostActivities: {
                    ...programWithMostActivities,
                    program: mostActivitiesProgram,
                },
                mostBeneficiaries: {
                    ...programWithMostBeneficiaries,
                    program: mostBeneficiariesProgram,
                },
            },
        };
    }

    // Total de participantes (beneficiarios únicos) por mes, de enero a junio del año actual
  async getMonthlyParticipants(): Promise<number[]> {
    const currentYear = new Date().getFullYear();
    const months = [0, 1, 2, 3, 4, 5]; // Enero a Junio (0-index)
    const results: number[] = [];

    for (const month of months) {
      const startDate = new Date(currentYear, month, 1);
      const endDate = new Date(currentYear, month + 1, 0);

      const count = await this.attendanceRepo
        .createQueryBuilder('att')
        .select('COUNT(DISTINCT att.IdBeneficiary)', 'count')
        .where('att.AttendanceDate BETWEEN :start AND :end', { start: startDate, end: endDate })
        .getRawOne();

      results.push(Number(count.count) || 0);
    }
    return results;
  }

  // Total de actividades ejecutadas por cada colaborador (usuario con rol colaborador) en el año actual
  async getCollaboratorExecutedActivities(): Promise<{ id: string; name: string; amount: number; image: string }[]> {
    const currentYear = new Date().getFullYear();
    const startYear = new Date(currentYear, 0, 1);
    const endYear = new Date(currentYear, 11, 31);

    // Unir Activities_tracking con Users, sumar ExecutedActivities, agrupar por usuario
    const collaborators = await this.trackingRepo
      .createQueryBuilder('track')
      .innerJoin('track.user', 'user')
      .select([
        'user.IdUser AS id',
        "CONCAT(user.FirstName, ' ', user.LastName) AS name",
        'SUM(track.ExecutedActivities) AS amount',
        'user.UrlImage AS image',
      ])
      .where('track.CreatedAt BETWEEN :start AND :end', { start: startYear, end: endYear })
      .andWhere('track.ExecutedActivities > 0') // Solo usuarios con al menos una actividad ejecutada
      .groupBy('user.IdUser')
      .orderBy('amount', 'DESC')
      .getRawMany();

    return collaborators.map(c => ({
      id: c.id.toString(),
      name: c.name,
      amount: parseFloat(c.amount) || 0,
      image: c.image || 'https://via.placeholder.com/50', // fallback si no tiene imagen
    }));
  }
}
