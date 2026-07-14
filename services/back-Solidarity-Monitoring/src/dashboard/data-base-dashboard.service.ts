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
import { ProgramsTranslation } from 'src/common/translation/entities/programs-translation.entity';
import { SubProgramsTranslation } from 'src/common/translation/entities/subprograms-translation.entity';
import { ActivitiesTranslation } from 'src/common/translation/entities/activities-translation.entity';
import params from 'src/tools/params';
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
        @InjectRepository(ProgramsTranslation)
        private programTranslationRepo: Repository<ProgramsTranslation>,
        @InjectRepository(SubProgramsTranslation)
        private subProgramTranslationRepo: Repository<SubProgramsTranslation>,
        @InjectRepository(ActivitiesTranslation)
        private activityTranslationRepo: Repository<ActivitiesTranslation>,
    ) {}

    private async findProgramName(id: number | null, langId: number) {
        if (!id) return null;
        const translation = await this.programTranslationRepo.findOne({
            where: { IdProgram: id, IdLanguage: langId },
        }) ?? await this.programTranslationRepo.findOne({
            where: { IdProgram: id, IdLanguage: params.languages.ES.code },
        });
        return { id, name: translation?.NameProgram ?? null };
    }

    private async findSubProgramName(id: number | null, langId: number) {
        if (!id) return null;
        const translation = await this.subProgramTranslationRepo.findOne({
            where: { IdSubProgram: id, IdLanguage: langId },
        }) ?? await this.subProgramTranslationRepo.findOne({
            where: { IdSubProgram: id, IdLanguage: params.languages.ES.code },
        });
        return { id, name: translation?.NameSubProgram ?? null };
    }

    private async findActivityName(id: number | null, langId: number) {
        if (!id) return null;
        const translation = await this.activityTranslationRepo.findOne({
            where: { IdActivity: id, IdLanguage: langId },
        }) ?? await this.activityTranslationRepo.findOne({
            where: { IdActivity: id, IdLanguage: params.languages.ES.code },
        });
        return { id, name: translation?.NameActivity ?? null };
    }

    private async findResponsibleName(id: number | null) {
        if (!id) return null;
        const user = await this.userRepo.findOne({ where: { IdUser: id } });
        if (!user) return { id, name: null };
        const name = [user.FirstName, user.LastName].filter(Boolean).join(' ').trim() || null;
        return { id, name };
    }

    private async buildActivitySummaryItem(
        item: {
            id: number | null;
            metric: string;
            value: number;
            programId?: number | null;
            subProgramId?: number | null;
            userId?: number | null;
        },
        langId: number,
    ) {
        const [activity, program, subProgram, responsible] = await Promise.all([
            this.findActivityName(item.id, langId),
            this.findProgramName(item.programId ?? null, langId),
            this.findSubProgramName(item.subProgramId ?? null, langId),
            this.findResponsibleName(item.userId ?? null),
        ]);

        return {
            id: item.id,
            name: activity?.name ?? null,
            metric: item.metric,
            value: item.value,
            activity,
            program,
            subProgram,
            responsible,
        };
    }

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
    async getAttendanceDashboardSummary(langId: number) {
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
            .leftJoin('program.translations', 'pt', 'pt.IdLanguage = :langId', { langId })
            .select('program.IdProgram', 'id')
            .addSelect('MAX(pt.NameProgram)', 'name')
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
            .leftJoin('program.translations', 'pt', 'pt.IdLanguage = :langId', { langId })
            .select('program.IdProgram', 'id')
            .addSelect('MAX(pt.NameProgram)', 'name')
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
            .leftJoin('subProgram.translations', 'spt', 'spt.IdLanguage = :langId', { langId })
            .select('subProgram.IdSubProgram', 'id')
            .addSelect('MAX(spt.NameSubProgram)', 'name')
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
            .leftJoin('subProgram.translations', 'spt', 'spt.IdLanguage = :langId', { langId })
            .select('subProgram.IdSubProgram', 'id')
            .addSelect('MAX(spt.NameSubProgram)', 'name')
            .addSelect('COUNT(att.IdAttendance)', 'count')
            .where('att.Status = :status', { status: 'absent' })
            .andWhere('att.AttendanceDate BETWEEN :start AND :end', { start: startOfYear, end: endOfYear })
            .groupBy('subProgram.IdSubProgram')
            .orderBy('count', 'DESC')
            .limit(limit)
            .getRawMany();

        const topActivitiesByAttendanceRaw = await this.attendanceRepo.createQueryBuilder('att')
            .innerJoin('att.activity', 'activity')
            .leftJoin('activity.translations', 'at', 'at.IdLanguage = :langId', { langId })
            .select('activity.IdActivity', 'id')
            .addSelect('MAX(at.NameActivity)', 'name')
            .addSelect('COUNT(att.IdAttendance)', 'count')
            .where('att.Status = :status', { status: 'present' })
            .andWhere('att.AttendanceDate BETWEEN :start AND :end', { start: startOfYear, end: endOfYear })
            .groupBy('activity.IdActivity')
            .orderBy('count', 'DESC')
            .limit(limit)
            .getRawMany();

        const topActivitiesByAbsenceRaw = await this.attendanceRepo.createQueryBuilder('att')
            .innerJoin('att.activity', 'activity')
            .leftJoin('activity.translations', 'at', 'at.IdLanguage = :langId', { langId })
            .select('activity.IdActivity', 'id')
            .addSelect('MAX(at.NameActivity)', 'name')
            .addSelect('COUNT(att.IdAttendance)', 'count')
            .where('att.Status = :status', { status: 'absent' })
            .andWhere('att.AttendanceDate BETWEEN :start AND :end', { start: startOfYear, end: endOfYear })
            .groupBy('activity.IdActivity')
            .orderBy('count', 'DESC')
            .limit(limit)
            .getRawMany();

        const mapTop = (arr: any[], total: number) => arr.map((r) => ({
            id: r.id,
            name: r.name ?? null,
            count: Number(r.count),
            percent: percent(Number(r.count), total),
            entity: { id: r.id, name: r.name ?? null },
        }));

        const topProgramsByAttendance = mapTop(topProgramsByAttendanceRaw, totalPresentYear);
        const topProgramsByAbsence = mapTop(topProgramsByAbsenceRaw, totalAbsenceYear);
        const topSubProgramsByAttendance = mapTop(topSubProgramsByAttendanceRaw, totalPresentYear);
        const topSubProgramsByAbsence = mapTop(topSubProgramsByAbsenceRaw, totalAbsenceYear);
        const topActivitiesByAttendance = mapTop(topActivitiesByAttendanceRaw, totalPresentYear);
        const topActivitiesByAbsence = mapTop(topActivitiesByAbsenceRaw, totalAbsenceYear);

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
                topProgramsByAttendance,
                topProgramsByAbsence,
                topSubProgramsByAttendance,
                topSubProgramsByAbsence,
                topActivitiesByAttendance,
                topActivitiesByAbsence,
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

    async getProgramDashboardSummary(langId: number) {
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
            name: row?.name ?? null,
            metric,
            value,
        });

        const programWithMostAttendance = programsWithAttendance[0]
            ? formatProgram(programsWithAttendance[0], 'attendance', Number(programsWithAttendance[0].count) || 0)
            : { id: null, name: null, metric: 'attendance', value: 0 };

        const programWithLeastAttendance = [...programsWithAttendance].sort((a, b) => Number(a.count) - Number(b.count))[0]
            ? formatProgram([...(programsWithAttendance as any[]).sort((a, b) => Number(a.count) - Number(b.count))][0], 'attendance', Number([...programsWithAttendance].sort((a, b) => Number(a.count) - Number(b.count))[0].count) || 0)
            : { id: null, name: null, metric: 'attendance', value: 0 };

        const programWithMostActivities = programsWithActivities[0]
            ? formatProgram(programsWithActivities[0], 'activities', Number(programsWithActivities[0].count) || 0)
            : { id: null, name: null, metric: 'activities', value: 0 };

        const programWithMostBeneficiaries = programsWithBeneficiaries[0]
            ? formatProgram(programsWithBeneficiaries[0], 'beneficiaries', Number(programsWithBeneficiaries[0].count) || 0)
            : { id: null, name: null, metric: 'beneficiaries', value: 0 };

        const [mostAttendanceProgram, leastAttendanceProgram, mostActivitiesProgram, mostBeneficiariesProgram] = await Promise.all([
            this.findProgramName(programWithMostAttendance.id, langId),
            this.findProgramName(programWithLeastAttendance.id, langId),
            this.findProgramName(programWithMostActivities.id, langId),
            this.findProgramName(programWithMostBeneficiaries.id, langId),
        ]);

        return {
            programs: {
                mostAttendance: {
                    ...programWithMostAttendance,
                    name: mostAttendanceProgram?.name ?? null,
                    program: mostAttendanceProgram,
                },
                leastAttendance: {
                    ...programWithLeastAttendance,
                    name: leastAttendanceProgram?.name ?? null,
                    program: leastAttendanceProgram,
                },
                mostActivities: {
                    ...programWithMostActivities,
                    name: mostActivitiesProgram?.name ?? null,
                    program: mostActivitiesProgram,
                },
                mostBeneficiaries: {
                    ...programWithMostBeneficiaries,
                    name: mostBeneficiariesProgram?.name ?? null,
                    program: mostBeneficiariesProgram,
                },
            },
        };
    }

    async getSubProgramDashboardSummary(langId: number) {
        const [subProgramsWithAttendance, subProgramsWithAbsence, subProgramsWithActivities, subProgramsWithBeneficiaries] = await Promise.all([
            this.attendanceRepo.createQueryBuilder('att')
                .innerJoin('att.activity', 'activity')
                .innerJoin('activity.subProgram', 'subProgram')
                .select('subProgram.IdSubProgram', 'id')
                .addSelect('COUNT(att.IdAttendance)', 'count')
                .where('att.Status = :status', { status: 'present' })
                .groupBy('subProgram.IdSubProgram')
                .orderBy('count', 'DESC')
                .getRawMany(),
            this.attendanceRepo.createQueryBuilder('att')
                .innerJoin('att.activity', 'activity')
                .innerJoin('activity.subProgram', 'subProgram')
                .select('subProgram.IdSubProgram', 'id')
                .addSelect('COUNT(att.IdAttendance)', 'count')
                .where('att.Status = :status', { status: 'absent' })
                .groupBy('subProgram.IdSubProgram')
                .orderBy('count', 'DESC')
                .getRawMany(),
            this.activityRepo.createQueryBuilder('activity')
                .innerJoin('activity.subProgram', 'subProgram')
                .select('subProgram.IdSubProgram', 'id')
                .addSelect('COUNT(activity.IdActivity)', 'count')
                .groupBy('subProgram.IdSubProgram')
                .orderBy('count', 'DESC')
                .getRawMany(),
            this.attendanceRepo.createQueryBuilder('att')
                .innerJoin('att.activity', 'activity')
                .innerJoin('activity.subProgram', 'subProgram')
                .select('subProgram.IdSubProgram', 'id')
                .addSelect('COUNT(DISTINCT att.IdBeneficiary)', 'count')
                .groupBy('subProgram.IdSubProgram')
                .orderBy('count', 'DESC')
                .getRawMany(),
        ]);

        const formatSubProgram = (row: any, metric: string, value: number) => ({
            id: row?.id,
            name: row?.name ?? null,
            metric,
            value,
        });

        const subProgramWithMostAttendance = subProgramsWithAttendance[0]
            ? formatSubProgram(subProgramsWithAttendance[0], 'attendance', Number(subProgramsWithAttendance[0].count) || 0)
            : { id: null, name: null, metric: 'attendance', value: 0 };

        const subProgramWithLeastAttendance = [...subProgramsWithAttendance].sort((a, b) => Number(a.count) - Number(b.count))[0]
            ? formatSubProgram([...(subProgramsWithAttendance as any[]).sort((a, b) => Number(a.count) - Number(b.count))][0], 'attendance', Number([...subProgramsWithAttendance].sort((a, b) => Number(a.count) - Number(b.count))[0].count) || 0)
            : { id: null, name: null, metric: 'attendance', value: 0 };

        const subProgramWithMostActivities = subProgramsWithActivities[0]
            ? formatSubProgram(subProgramsWithActivities[0], 'activities', Number(subProgramsWithActivities[0].count) || 0)
            : { id: null, name: null, metric: 'activities', value: 0 };

        const subProgramWithMostBeneficiaries = subProgramsWithBeneficiaries[0]
            ? formatSubProgram(subProgramsWithBeneficiaries[0], 'beneficiaries', Number(subProgramsWithBeneficiaries[0].count) || 0)
            : { id: null, name: null, metric: 'beneficiaries', value: 0 };

        const [mostAttendanceSubProgram, leastAttendanceSubProgram, mostActivitiesSubProgram, mostBeneficiariesSubProgram] = await Promise.all([
            this.findSubProgramName(subProgramWithMostAttendance.id, langId),
            this.findSubProgramName(subProgramWithLeastAttendance.id, langId),
            this.findSubProgramName(subProgramWithMostActivities.id, langId),
            this.findSubProgramName(subProgramWithMostBeneficiaries.id, langId),
        ]);

        return {
            subPrograms: {
                mostAttendance: {
                    ...subProgramWithMostAttendance,
                    name: mostAttendanceSubProgram?.name ?? null,
                    subProgram: mostAttendanceSubProgram,
                },
                leastAttendance: {
                    ...subProgramWithLeastAttendance,
                    name: leastAttendanceSubProgram?.name ?? null,
                    subProgram: leastAttendanceSubProgram,
                },
                mostActivities: {
                    ...subProgramWithMostActivities,
                    name: mostActivitiesSubProgram?.name ?? null,
                    subProgram: mostActivitiesSubProgram,
                },
                mostBeneficiaries: {
                    ...subProgramWithMostBeneficiaries,
                    name: mostBeneficiariesSubProgram?.name ?? null,
                    subProgram: mostBeneficiariesSubProgram,
                },
            },
        };
    }

    async getActivityDashboardSummary(langId: number) {
        const [activitiesWithAttendance, activitiesWithBeneficiaries] = await Promise.all([
            this.attendanceRepo.createQueryBuilder('att')
                .innerJoin('att.activity', 'activity')
                .innerJoin('activity.subProgram', 'subProgram')
                .innerJoin('subProgram.program', 'program')
                .select('activity.IdActivity', 'id')
                .addSelect('subProgram.IdSubProgram', 'subProgramId')
                .addSelect('program.IdProgram', 'programId')
                .addSelect('activity.IdUser', 'userId')
                .addSelect('COUNT(att.IdAttendance)', 'count')
                .where('att.Status = :status', { status: 'present' })
                .groupBy('activity.IdActivity')
                .addGroupBy('subProgram.IdSubProgram')
                .addGroupBy('program.IdProgram')
                .addGroupBy('activity.IdUser')
                .orderBy('count', 'DESC')
                .getRawMany(),
            this.attendanceRepo.createQueryBuilder('att')
                .innerJoin('att.activity', 'activity')
                .innerJoin('activity.subProgram', 'subProgram')
                .innerJoin('subProgram.program', 'program')
                .select('activity.IdActivity', 'id')
                .addSelect('subProgram.IdSubProgram', 'subProgramId')
                .addSelect('program.IdProgram', 'programId')
                .addSelect('activity.IdUser', 'userId')
                .addSelect('COUNT(DISTINCT att.IdBeneficiary)', 'count')
                .groupBy('activity.IdActivity')
                .addGroupBy('subProgram.IdSubProgram')
                .addGroupBy('program.IdProgram')
                .addGroupBy('activity.IdUser')
                .orderBy('count', 'DESC')
                .getRawMany(),
        ]);

        const formatActivity = (row: any, metric: string, value: number) => ({
            id: row?.id ?? null,
            metric,
            value,
            programId: row?.programId ?? null,
            subProgramId: row?.subProgramId ?? null,
            userId: row?.userId ?? null,
        });

        const emptyActivity = {
            id: null,
            metric: 'attendance',
            value: 0,
            programId: null,
            subProgramId: null,
            userId: null,
        };

        const activityWithMostAttendance = activitiesWithAttendance[0]
            ? formatActivity(activitiesWithAttendance[0], 'attendance', Number(activitiesWithAttendance[0].count) || 0)
            : { ...emptyActivity };

        const activityWithLeastAttendance = [...activitiesWithAttendance].sort((a, b) => Number(a.count) - Number(b.count))[0]
            ? formatActivity(
                [...activitiesWithAttendance].sort((a, b) => Number(a.count) - Number(b.count))[0],
                'attendance',
                Number([...activitiesWithAttendance].sort((a, b) => Number(a.count) - Number(b.count))[0].count) || 0,
            )
            : { ...emptyActivity };

        const activityWithMostBeneficiaries = activitiesWithBeneficiaries[0]
            ? formatActivity(activitiesWithBeneficiaries[0], 'beneficiaries', Number(activitiesWithBeneficiaries[0].count) || 0)
            : { ...emptyActivity, metric: 'beneficiaries' };

        const [mostAttendance, leastAttendance, mostBeneficiaries] = await Promise.all([
            this.buildActivitySummaryItem(activityWithMostAttendance, langId),
            this.buildActivitySummaryItem(activityWithLeastAttendance, langId),
            this.buildActivitySummaryItem(activityWithMostBeneficiaries, langId),
        ]);

        return {
            activities: {
                mostAttendance,
                leastAttendance,
                mostBeneficiaries,
            },
        };
    }

    async getTrackingDashboardSummary(langId: number) {
        const now = new Date();
        const startOfYear = new Date(now.getFullYear(), 0, 1);
        const endOfYear = new Date(now.getFullYear(), 11, 31, 23, 59, 59);

        const percent = (val: number, total: number) => {
            if (total === 0) return '0%';
            return `${((val / total) * 100).toFixed(2)}%`;
        };

        const complianceRatio = (val: number, total: number) => {
            if (total === 0) return 0;
            return Math.min(1, val / total);
        };

        const [executionRaw, coverageRaw, responsiblesRaw] = await Promise.all([
            this.trackingRepo.createQueryBuilder('track')
                .select('SUM(track.ExecutedActivities)', 'executed')
                .addSelect('SUM(track.PlannedActivities)', 'planned')
                .where('track.CreatedAt BETWEEN :start AND :end', { start: startOfYear, end: endOfYear })
                .getRawOne(),
            this.trackingRepo.createQueryBuilder('track')
                .select('SUM(track.ActualAttendees)', 'actualAttendees')
                .addSelect('SUM(track.ProjectedAttendees)', 'projectedAttendees')
                .where('track.CreatedAt BETWEEN :start AND :end', { start: startOfYear, end: endOfYear })
                .getRawOne(),
            this.trackingRepo.createQueryBuilder('track')
                .innerJoin('track.user', 'user')
                .select('user.IdUser', 'id')
                .addSelect("CONCAT(user.FirstName, ' ', user.LastName)", 'name')
                .addSelect('SUM(track.ExecutedActivities)', 'executed')
                .addSelect('SUM(track.PlannedActivities)', 'planned')
                .addSelect('SUM(track.ActualAttendees)', 'actualAttendees')
                .addSelect('SUM(track.ProjectedAttendees)', 'projectedAttendees')
                .where('track.CreatedAt BETWEEN :start AND :end', { start: startOfYear, end: endOfYear })
                .groupBy('user.IdUser')
                .addGroupBy('user.FirstName')
                .addGroupBy('user.LastName')
                .getRawMany(),
        ]);

        const executed = Number(executionRaw.executed) || 0;
        const planned = Number(executionRaw.planned) || 0;
        const actualAttendees = Number(coverageRaw.actualAttendees) || 0;
        const projectedAttendees = Number(coverageRaw.projectedAttendees) || 0;

        const responsibleCompliance = responsiblesRaw
            .map((row) => {
                const respExecuted = Number(row.executed) || 0;
                const respPlanned = Number(row.planned) || 0;
                const respActualAttendees = Number(row.actualAttendees) || 0;
                const respProjectedAttendees = Number(row.projectedAttendees) || 0;
                const executionLevel = complianceRatio(respExecuted, respPlanned);
                const coverageLevel = complianceRatio(respActualAttendees, respProjectedAttendees);
                const complianceLevel = respPlanned > 0 && respProjectedAttendees > 0
                    ? Math.min(1, (executionLevel + coverageLevel) / 2)
                    : respPlanned > 0
                        ? executionLevel
                        : coverageLevel;
                const responsibleName = row.name?.trim() || null;

                return {
                    id: row.id,
                    name: responsibleName,
                    executed: respExecuted,
                    planned: respPlanned,
                    actualAttendees: respActualAttendees,
                    projectedAttendees: respProjectedAttendees,
                    executionCompliance: {
                        ratio: executionLevel,
                        percent: percent(respExecuted, respPlanned),
                    },
                    coverageCompliance: {
                        ratio: coverageLevel,
                        percent: percent(respActualAttendees, respProjectedAttendees),
                    },
                    complianceLevel: {
                        ratio: complianceLevel,
                        percent: `${(complianceLevel * 100).toFixed(2)}%`,
                    },
                    responsible: { id: row.id, name: responsibleName },
                };
            })
            .sort((a, b) => b.complianceLevel.ratio - a.complianceLevel.ratio);

        return {
            tracking: {
                executionVsPlanning: {
                    executed,
                    planned,
                    ratio: complianceRatio(executed, planned),
                    percent: percent(executed, planned),
                },
                coverage: {
                    actualAttendees,
                    projectedAttendees,
                    ratio: complianceRatio(actualAttendees, projectedAttendees),
                    percent: percent(actualAttendees, projectedAttendees),
                },
                responsibleCompliance,
            },
        };
    }

    async getDropoutDashboardSummary(langId: number) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const thirtyDaysAgo = new Date(today);
        thirtyDaysAgo.setDate(today.getDate() - 30);

        const thresholds = [15, 30, 60, 90];
        const listLimit = 10;

        const daysSince = (date: Date | string | null): number | null => {
            if (!date) return null;
            const parsed = new Date(date);
            parsed.setHours(0, 0, 0, 0);
            return Math.floor((today.getTime() - parsed.getTime()) / (1000 * 60 * 60 * 24));
        };

        const getRiskLevel = (days: number | null): 'none' | 'low' | 'medium' | 'high' | 'critical' => {
            if (days === null) return 'critical';
            if (days >= 90) return 'critical';
            if (days >= 60) return 'high';
            if (days >= 30) return 'medium';
            if (days >= 15) return 'low';
            return 'none';
        };

        const calculateRiskScore = (
            days: number | null,
            neverAttended: boolean,
            recentAbsences: number,
            absenceRate: number,
        ): number => {
            if (neverAttended) return 100;
            let score = 0;
            if (days !== null) {
                score += Math.min(60, (days / 90) * 60);
            }
            score += Math.min(20, recentAbsences * 5);
            score += Math.min(20, absenceRate * 20);
            return Math.min(100, Math.round(score));
        };

        const buildRiskFactors = (
            days: number | null,
            neverAttended: boolean,
            recentAbsences: number,
            absenceRate: number,
        ): string[] => {
            const factors: string[] = [];
            if (neverAttended) factors.push('Sin asistencias registradas');
            if (days !== null && days >= 30) factors.push(`Sin asistir ${days} días`);
            else if (days !== null && days >= 15) factors.push(`Sin asistir ${days} días`);
            if (recentAbsences >= 3) factors.push(`${recentAbsences} ausencias en los últimos 30 días`);
            if (absenceRate >= 0.5) factors.push('Alta tasa de ausencias histórica');
            return factors;
        };

        const [beneficiaryStats, lastPresentDetails] = await Promise.all([
            this.beneficiaryRepo.createQueryBuilder('ben')
                .leftJoin('ben.attendances', 'att')
                .select('ben.IdBeneficiary', 'id')
                .addSelect('ben.FirstName', 'firstName')
                .addSelect('ben.LastName', 'lastName')
                .addSelect('ben.Identification', 'identification')
                .addSelect("MAX(CASE WHEN att.Status = 'present' THEN att.AttendanceDate END)", 'lastPresentDate')
                .addSelect("SUM(CASE WHEN att.Status = 'present' THEN 1 ELSE 0 END)", 'totalPresent')
                .addSelect("SUM(CASE WHEN att.Status = 'absent' THEN 1 ELSE 0 END)", 'totalAbsent')
                .addSelect("SUM(CASE WHEN att.Status = 'justified' THEN 1 ELSE 0 END)", 'totalJustified')
                .addSelect('COUNT(att.IdAttendance)', 'totalRecords')
                .addSelect("SUM(CASE WHEN att.Status = 'absent' AND att.AttendanceDate >= :recentStart THEN 1 ELSE 0 END)", 'recentAbsences')
                .setParameter('recentStart', thirtyDaysAgo)
                .groupBy('ben.IdBeneficiary')
                .addGroupBy('ben.FirstName')
                .addGroupBy('ben.LastName')
                .addGroupBy('ben.Identification')
                .getRawMany(),
            this.attendanceRepo.createQueryBuilder('att')
                .innerJoin('att.beneficiary', 'ben')
                .innerJoin('att.activity', 'activity')
                .innerJoin('activity.subProgram', 'subProgram')
                .innerJoin('subProgram.program', 'program')
                .leftJoin('activity.translations', 'at', 'at.IdLanguage = :langId', { langId })
                .leftJoin('subProgram.translations', 'spt', 'spt.IdLanguage = :langId', { langId })
                .leftJoin('program.translations', 'pt', 'pt.IdLanguage = :langId', { langId })
                .select('ben.IdBeneficiary', 'beneficiaryId')
                .addSelect('att.AttendanceDate', 'lastPresentDate')
                .addSelect('activity.IdActivity', 'activityId')
                .addSelect('at.NameActivity', 'activityName')
                .addSelect('subProgram.IdSubProgram', 'subProgramId')
                .addSelect('spt.NameSubProgram', 'subProgramName')
                .addSelect('program.IdProgram', 'programId')
                .addSelect('pt.NameProgram', 'programName')
                .where('att.Status = :status', { status: 'present' })
                .distinctOn(['ben.IdBeneficiary'])
                .orderBy('ben.IdBeneficiary', 'ASC')
                .addOrderBy('att.AttendanceDate', 'DESC')
                .getRawMany(),
        ]);

        const lastPresentMap = new Map(
            lastPresentDetails.map((row) => [Number(row.beneficiaryId), row]),
        );

        const enriched = beneficiaryStats.map((row) => {
            const daysSinceLastAttendance = daysSince(row.lastPresentDate);
            const totalPresent = Number(row.totalPresent) || 0;
            const totalAbsent = Number(row.totalAbsent) || 0;
            const totalJustified = Number(row.totalJustified) || 0;
            const totalRecords = Number(row.totalRecords) || 0;
            const recentAbsences = Number(row.recentAbsences) || 0;
            const neverAttended = !row.lastPresentDate;
            const absenceRate = totalRecords > 0 ? totalAbsent / totalRecords : 0;
            const lastDetail = lastPresentMap.get(Number(row.id));
            const name = [row.firstName, row.lastName].filter(Boolean).join(' ').trim() || null;
            const riskLevel = getRiskLevel(daysSinceLastAttendance);
            const riskScore = calculateRiskScore(daysSinceLastAttendance, neverAttended, recentAbsences, absenceRate);

            return {
                id: row.id,
                name,
                identification: row.identification ?? null,
                beneficiary: { id: row.id, name, identification: row.identification ?? null },
                lastPresentDate: row.lastPresentDate ?? null,
                daysSinceLastAttendance,
                neverAttended,
                totalPresent,
                totalAbsent,
                totalJustified,
                recentAbsences,
                absenceRate: Math.round(absenceRate * 10000) / 10000,
                absencePercent: `${(absenceRate * 100).toFixed(2)}%`,
                riskLevel,
                abandonmentRisk: {
                    score: riskScore,
                    level: riskLevel,
                    factors: buildRiskFactors(daysSinceLastAttendance, neverAttended, recentAbsences, absenceRate),
                },
                lastActivity: lastDetail
                    ? { id: lastDetail.activityId, name: lastDetail.activityName ?? null }
                    : null,
                program: lastDetail
                    ? { id: lastDetail.programId, name: lastDetail.programName ?? null }
                    : null,
                subProgram: lastDetail
                    ? { id: lastDetail.subProgramId, name: lastDetail.subProgramName ?? null }
                    : null,
            };
        });

        const filterByInactiveDays = (minDays: number) =>
            enriched
                .filter((b) => b.daysSinceLastAttendance === null || b.daysSinceLastAttendance >= minDays)
                .sort((a, b) => (b.daysSinceLastAttendance ?? 999) - (a.daysSinceLastAttendance ?? 999));

        const byPeriod = thresholds.reduce((acc, days) => {
            const list = filterByInactiveDays(days);
            acc[`${days}days`] = {
                days,
                count: list.length,
                beneficiaries: list.slice(0, listLimit),
            };
            return acc;
        }, {} as Record<string, { days: number; count: number; beneficiaries: typeof enriched }>);

        const atRisk = filterByInactiveDays(15);
        const neverAttendedList = enriched.filter((b) => b.neverAttended);
        const escalatingRisk = enriched.filter(
            (b) => !b.neverAttended
                && b.daysSinceLastAttendance !== null
                && b.daysSinceLastAttendance < 15
                && b.recentAbsences >= 3,
        );

        return {
            dropout: {
                summary: {
                    '15days': { count: byPeriod['15days'].count },
                    '30days': { count: byPeriod['30days'].count },
                    '60days': { count: byPeriod['60days'].count },
                    '90days': { count: byPeriod['90days'].count },
                },
                riskIndicators: {
                    totalAtRisk: atRisk.length,
                    neverAttended: neverAttendedList.length,
                    escalatingRisk: escalatingRisk.length,
                    criticalRisk: enriched.filter((b) => b.riskLevel === 'critical').length,
                    highRisk: enriched.filter((b) => b.riskLevel === 'high').length,
                    mediumRisk: enriched.filter((b) => b.riskLevel === 'medium').length,
                    lowRisk: enriched.filter((b) => b.riskLevel === 'low').length,
                },
                earlyWarnings: escalatingRisk
                    .sort((a, b) => b.abandonmentRisk.score - a.abandonmentRisk.score)
                    .slice(0, listLimit),
                byPeriod,
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
