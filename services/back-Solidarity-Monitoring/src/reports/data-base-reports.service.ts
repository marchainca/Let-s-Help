import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Beneficiary } from 'src/recognition/entities/beneficiary.entity';
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
    async createReport(reportData: { IdUser: number; IdBeneficiary: number; DescriptionReport: string }): Promise<Report> {
        try {
            const report = this.reportRepository.create(reportData);
            return await this.reportRepository.save(report);
        } catch (error) {
            console.error('Error creating report:', error);
            throw error;
        }
    }

    //buscar reportes por identificación o nombres y apellidos
    async findReports(searchTerm: string): Promise<Report[]> {
        try {
            const reports = await this.reportRepository
                .createQueryBuilder('r')
                .leftJoin('r.beneficiary', 'b')
                .leftJoin('r.user', 'u')
                .select([
                'r.IdReport AS IdReport',
                'b.Identification AS IdentificationBeneficiary',
                "CONCAT(b.FirstName, ' ', b.LastName) AS nombresApellidos",
                'r.DescriptionReport AS DescriptionReport',
                'u.Identification AS Identification',
                'r.CreatedAt AS CreatedAt',
                ])
                .where(
                'b.Identification ILIKE :search OR CONCAT(b.FirstName, \' \', b.LastName) ILIKE :search',
                { search: `%${searchTerm}%` }
                )
                .getRawMany();
            return reports;
        } catch (error) {
            console.error('Error finding reports:', error);
            throw error;
        }
    }

    async listRecentReports(): Promise<Report[]> {
        try {
            const reports = await this.reportRepository
            .createQueryBuilder('r')
            .leftJoin('r.beneficiary', 'b')
            .leftJoin('r.user', 'u')
            .select([
            'r.IdReport AS id',
            'b.Identification AS identificacion',
            "CONCAT(b.FirstName, ' ', b.LastName) AS nombresApellidos",
            'r.DescriptionReport AS reporte',
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