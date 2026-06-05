import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ActivityTracking } from 'src/activities/entities/activity-tracking.entity';
import { Attendance } from 'src/attendance/entities/attendance.entity';
import { User } from 'src/users/entities/user.entity';
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
