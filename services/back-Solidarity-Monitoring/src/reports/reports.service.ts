import { Injectable, BadRequestException } from '@nestjs/common';
import { Firestore } from '@google-cloud/firestore';
import { Report } from '../interfaces/interfaces';
import { errorResponse, formatDate } from 'src/tools/function.tools';
import { CreateReportDto } from './dtos/create-report.dto';
import { DataBaseRecognitionService } from 'src/recognition/data-base-recognition.service';
import { DataBaseServiceAttendance } from 'src/attendance/data-base-attendance.service';
import { DataBaseReportsService } from './data-base-reports.service';
import { UsersDataBaseService } from 'src/users/users-data-base.service';

@Injectable()
export class ReportsService {

  private firestore: Firestore;

  constructor(
    private readonly dataBaseReportsService: DataBaseReportsService,
    private readonly usersDataBaseService: UsersDataBaseService,
  ) { this.firestore = new Firestore(); };

  /**
   * Crea un nuevo reporte.
   * @param report Datos del reporte a crear.
   * @returns ID del reporte creado.
  */
  async createReport(report: CreateReportDto, langId: number): Promise<Object> {
      try {
          const { identificacion, nombresApellidos, reporte, createdBy } = report;

          // Validar longitud del reporte
          if (reporte.length > 500) {
            throw await errorResponse('Error: The "report" field cannot exceed 500 characters.', "createReport");
          }

          // Buscar el beneficiario por identificación
          const beneficiary = await this.dataBaseReportsService.getBeneficiaryByIdentification(identificacion);

          if (!beneficiary) {
            throw await errorResponse(`Error: Beneficiary with identification ${identificacion} not found`, "createReport");
          }

          // Buscar el usuario que crea el reporte por identificación
          const user = await this.usersDataBaseService.getUserByIdNumber(createdBy, langId);
          if (!user || user.length === 0) {
            throw await errorResponse(`Error: User with identification ${createdBy} not found`, "createReport");
          }

          // Crear el nuevo reporte
          const newReport = await this.dataBaseReportsService.createReport({
            IdUser: user[0].IdUser,
            IdBeneficiary: beneficiary.IdBeneficiary,
            DescriptionReport: reporte,
            langId: langId,

          });
          return {id: newReport.IdReport.toString()} ; // Retorna el ID del reporte creado
      } catch (error) {
        console.error('Error in createReport:', error);
        throw error;
      }

  }

  /**
   * Busca reportes por identificación o nombres y apellidos.
   * @param searchTerm Término de búsqueda.
   * @returns Lista de reportes coincidentes.
  */
  async findReports(searchTerm: string, langId: number): Promise<any> {
      try {
        if (!searchTerm) {
          throw await errorResponse('Error: You must provide a search term.', 'findReports');
        }
        const reports = await this.dataBaseReportsService.findReports(searchTerm, langId);

        const formatResult = reports.map((row: any) => ({
          id: row.idreport,
          identificacion: row.identificationbeneficiary,
          nombresApellidos: row.nombresapellidos,
          reporte: row.descriptionreport,
          createdBy: row.identification,
          createdAt: row.createdat ? this.formatDate(row.createdat) : null,
        }));

        return formatResult;
      } catch (error) {
        throw error;
      }
  }

  /**
   * Lista los últimos 10 reportes creados, ordenados por fecha de creación (descendente).
   * @returns Lista de los últimos 10 reportes.
   */
  async listRecentReports(langId: number): Promise<any[]> {
      try {
        const results = await this.dataBaseReportsService.listRecentReports(langId);

        const formattedResults = results.map((row: any) => ({
          id: row.id,
          identificacion: row.identificacion,
          nombresApellidos: row.nombresapellidos,
          reporte: row.reporte,
          createdBy: row.createdby,
          createdAt: row.createdat ? this.formatDate(row.createdat) : null,
        }));

        return formattedResults;
      } catch (error) {
        console.error('Error al listar los reportes recientes:', error);
        throw error;
      }
  }

  private formatDate(date: Date): string {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const seconds = String(d.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  }

}