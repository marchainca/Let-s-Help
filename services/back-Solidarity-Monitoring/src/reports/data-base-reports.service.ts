import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ReportsTranslation } from 'src/common/translation/entities/reports-translation.entity';
import { TranslationService } from 'src/common/translation/translation.service';
import { Beneficiary } from 'src/recognition/entities/beneficiary.entity';
import params from 'src/tools/params';
import { Report } from 'src/users/entities/report.entity';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class DataBaseReportsService {
    constructor(
        @InjectRepository(Report)
        private readonly reportRepository: Repository<Report>,
        @InjectRepository(Beneficiary)
        private readonly beneficiaryRepository: Repository<Beneficiary>,
        @InjectRepository(ReportsTranslation)
        private readonly reportsTranslationRepository: Repository<ReportsTranslation>,
        private translationService : TranslationService
    ) {}

    //buscar beneficiario por identificación
    async getBeneficiaryByIdentification(identificacion: string): Promise<Beneficiary> {
        try {
            const beneficiary = await this.beneficiaryRepository.findOne({ where: { Identification: identificacion } });
            return beneficiary;

        } catch (error) {
            console.error('Error fetching beneficiary by identification:', error);
            throw error;
        }
    }

    //crear reporte
    async createReport(reportData: { 
    IdUser: number; 
    IdBeneficiary: number; 
    DescriptionReport: string; 
    langId: number 
  }): Promise<any> {
    try {
      const { IdUser, IdBeneficiary, DescriptionReport, langId } = reportData;

      // Crear el reporte base
      const newReport = this.reportRepository.create({
        IdUser,
        IdBeneficiary,
      });
      const savedReport = await this.reportRepository.save(newReport);
      const reportId = savedReport.IdReport;

      // Guardar la descripción en el idioma original (langId)
      const originalTranslation = this.reportsTranslationRepository.create({
        IdReport: reportId,
        IdLanguage: langId,
        DescriptionReport: DescriptionReport,
      });
      await this.reportsTranslationRepository.save(originalTranslation);

      // Traducir al idioma opuesto (1 <-> 2)
      const targetLangId = langId === params.languages.ES.code ? 2 : 1;
      let translatedDescription = DescriptionReport;
      try {
        const sourceLangCode = langId === params.languages.ES.code ? 'es' : 'en';
        const targetLangCode = langId === params.languages.ES.code ? 'en-US' : 'es';
        translatedDescription = await this.translationService.translate(DescriptionReport, targetLangCode, sourceLangCode);
      } catch (err) {
        console.error('Error al traducir reporte:', err);
        // Si falla, se guarda el original
      }

      // Guardar la traducción en el idioma destino
      const targetTranslation = this.reportsTranslationRepository.create({
        IdReport: reportId,
        IdLanguage: targetLangId,
        DescriptionReport: translatedDescription,
      });
      await this.reportsTranslationRepository.save(targetTranslation);

      // Retornar un objeto compatible (incluye la descripción original)
      return {
        IdReport: reportId,
        IdUser,
        IdBeneficiary,
        DescriptionReport: DescriptionReport, // campo virtual para compatibilidad
        CreatedAt: savedReport.CreatedAt,
      };
    } catch (error) {
      console.error('Error creating report:', error);
      throw error;
    }
  }

    //buscar reportes por identificación o nombres y apellidos
    async findReports(searchTerm: string, langId: number): Promise<any[]> {
      try {
        const reports = await this.reportRepository
          .createQueryBuilder('r')
          .leftJoin('r.beneficiary', 'b')
          .leftJoin('r.user', 'u')
          .leftJoin('r.translations', 'rt', 'rt.IdLanguage = :langId', { langId })
          .select([
            'r.IdReport AS IdReport',
            'b.Identification AS IdentificationBeneficiary',
            "CONCAT(b.FirstName, ' ', b.LastName) AS nombresApellidos",
            'rt.DescriptionReport AS DescriptionReport',
            'u.Identification AS Identification',
            'r.CreatedAt AS CreatedAt',
          ])
          .where(
            'b.Identification ILIKE :search OR ' +
            'CONCAT(b.FirstName, \' \', b.LastName) ILIKE :search OR ' +
            'rt.DescriptionReport ILIKE :search',
            { search: `%${searchTerm}%` }
          )
          .getRawMany();
          console.log("Consulta-->", reports);
        return reports;
      } catch (error) {
        console.error('Error finding reports:', error);
        throw error;
      }
    }

    async listRecentReports(langId: number): Promise<any[]> {
      try {
        const reports = await this.reportRepository
          .createQueryBuilder('r')
          .leftJoin('r.beneficiary', 'b')
          .leftJoin('r.user', 'u')
          .leftJoin('r.translations', 'rt', 'rt.IdLanguage = :langId', { langId })
          .select([
            'r.IdReport AS id',
            'b.Identification AS identificacion',
            "CONCAT(b.FirstName, ' ', b.LastName) AS nombresApellidos",
            'rt.DescriptionReport AS reporte', 
            'u.Identification AS createdBy',
            'r.CreatedAt AS createdAt',
          ])
          .orderBy('r.CreatedAt', 'DESC')
          .limit(10)
          .getRawMany();
        return reports;
      } catch (error) {
        console.error('Error listing recent reports:', error);
        throw error;
      }
  }
}