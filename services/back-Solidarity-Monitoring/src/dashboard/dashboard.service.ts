import { Injectable } from '@nestjs/common';
import { DataBaseDashboardService } from './data-base-dashboard.service';

@Injectable()
export class DashboardService {
  constructor(
    private readonly dataBaseService: DataBaseDashboardService,
  ) {}

  async getDashboardIndicators() {
    // 1. Calcular progresos (basado en actividades ejecutadas vs planificadas)
    const progress = await this.dataBaseService.calculateProgress();

    // 2. Obtener performance: total de participantes por mes (enero a junio del año actual)
    const performance = await this.dataBaseService.getMonthlyParticipants();

    // 3. Obtener budget: total de actividades ejecutadas por colaborador en el año actual
    const budget = await this.dataBaseService.getCollaboratorExecutedActivities();

    return {
      progress,
      performance,
      budget,
    };
  }

  async getExecutiveDashboardSummary() {
    return this.dataBaseService.getExecutiveDashboardSummary();
  }

  async getAttendanceDashboardSummary(langId: number) {
    return this.dataBaseService.getAttendanceDashboardSummary(langId);
  }

  async getProgramDashboardSummary(langId: number) {
    return this.dataBaseService.getProgramDashboardSummary(langId);
  }

  async getSubProgramDashboardSummary(langId: number) {
    return this.dataBaseService.getSubProgramDashboardSummary(langId);
  }

  async getActivityDashboardSummary(langId: number) {
    return this.dataBaseService.getActivityDashboardSummary(langId);
  }

  async getTrackingDashboardSummary(langId: number) {
    return this.dataBaseService.getTrackingDashboardSummary(langId);
  }
}