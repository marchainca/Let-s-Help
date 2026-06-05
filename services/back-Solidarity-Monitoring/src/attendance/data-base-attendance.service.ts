import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Beneficiary } from 'src/recognition/entities/beneficiary.entity';
import { In, Repository } from 'typeorm';
import { Attendance } from './entities/attendance.entity';
import { Activity } from 'src/activities/entities/activity.entity';
import { Absence } from 'src/users/entities/absence.entity';


@Injectable()
export class DataBaseServiceAttendance {
     constructor(
        @InjectRepository(Beneficiary)
        private readonly beneficiaryRepository: Repository<Beneficiary>,
        @InjectRepository(Attendance)
        private readonly attendanceRepository: Repository<Attendance>,
        @InjectRepository(Activity)
        private readonly activityRepository: Repository<Activity>,
        @InjectRepository(Absence)
        private readonly absenceRepository: Repository<Absence>,
    ){}

    async getBeneficiaryByIdentification(identification: string): Promise<any> {
        try {
            //console.log('Buscando beneficiario con identificación:', identification);
            // Buscar beneficiario con todas las relaciones necesarias
            const beneficiary = await this.beneficiaryRepository.findOne({
            where: { Identification: identification },
            relations: [
                'address',
                'address.city',
                'address.city.state',
                'neighborhood',
                'documentType',
                'biometricData',
            ],
            });

            console.log('Beneficiario encontrado:', beneficiary);

            if (!beneficiary) {
            throw new NotFoundException(`Beneficiario con identificación ${identification} no encontrado`);
            }

            // Construir dirección completa (calle, número, ciudad, estado)
            let fullAddress = '';
            if (beneficiary.address) {
            const address = beneficiary.address;
            const city = address.city;
            const state = city?.state;
            fullAddress = [
                address.Street,
                address.Number,
                city?.NameCity,
                state?.NameState,
            ].filter(Boolean).join(', ');
            }

            // Obtener el descriptor biométrico
            let descriptorArray: number[] = [];
            if (beneficiary.biometricData && beneficiary.biometricData.length > 0) {
                // Suponiendo que el primer elemento es el más reciente (o puedes ordenar por CreatedAt desc)
                const latestBiometric = beneficiary.biometricData.sort((a, b) => b.CreatedAt.getTime() - a.CreatedAt.getTime())[0];
                const buffer = latestBiometric.binaryDescriptor;
                if (buffer && Buffer.isBuffer(buffer)) {
                    try {
                        // Asumiendo que el buffer contiene un string JSON con el array de floats
                        const jsonString = buffer.toString('utf8');
                        descriptorArray = JSON.parse(jsonString);
                    } catch (error) {
                        console.error('Error al parsear binaryDescriptor:', error);
                    }
                }
            }

            // Obtener nombre del tipo de documento
            const documentTypeName = beneficiary.documentType?.Name || 'Cédula de ciudadanía';

            // Construir respuesta
            const result = {
            idBeneficiary: beneficiary.IdBeneficiary,
            name: beneficiary.FirstName || '',
            lastName: beneficiary.LastName || '',
            email: beneficiary.Email || '',
            documentType: documentTypeName,
            documentNumber: beneficiary.Identification || '',
            //solucionar el error TypeError: beneficiary.Birthdate.toISOString is not a function
            birthdate: beneficiary.Birthdate instanceof Date ? beneficiary.Birthdate.toISOString().split('T')[0] : '',
            //birthdate: beneficiary.Birthdate ? beneficiary.Birthdate.toISOString().split('T')[0] : '',
            address: fullAddress,
            neighborhood: beneficiary.neighborhood?.NameNeighborhood || '',
            policyNumber: beneficiary.PolicyNumber || '',
            emergencyContact: beneficiary.EmergencyContact || '',
            imageUrl: beneficiary.UrlImage || '',
            descriptor: descriptorArray,
            createdAt: beneficiary.CreatedAt ? beneficiary.CreatedAt.toISOString() : '',
            };

            return result;
        } catch (error) {
            console.error('Error en getBeneficiaryByIdentification:', error);
            throw error;
        }
    }

    // Buscar asistencia existente
    async findExistingAttendance(idBeneficiary: number, idActivity: number, attendanceDate: Date): Promise<Attendance | null> {
        try {
            const existing = await this.attendanceRepository.findOne({
                where: {
                    IdBeneficiary: idBeneficiary,
                    IdActivity: idActivity,
                    AttendanceDate: attendanceDate,
                },
            });
            return existing;
        } catch (error) {
            console.error('Error al buscar asistencia existente:', error);
            throw error;
        }
    }

    // Registrar asistencia o actualizar si ya existe
    async registerAttendance(register: Partial<Attendance>): Promise<object> {
        try {

            await this.attendanceRepository.save(register);

            return {message: `Asistencia registrada exitosamente para el beneficiario con ID ${register.IdBeneficiary} en la actividad con ID ${register.IdActivity}`};

        } catch (error) {
            console.error('Error al registrar asistencia:', error);
            throw error;
        }
    }

    async getAttendances(filters?: any, page: number = 1, limit: number = 10): Promise<any> {
        try {
            // Construir query base con relaciones
            const qb = this.attendanceRepository
            .createQueryBuilder('att')
            .leftJoin('att.beneficiary', 'ben')
            .leftJoin('att.activity', 'act')
            .addSelect('ben.Identification', 'identificacion')
            .addSelect('act.NameActivity', 'actividad')
            .addSelect('att.AttendanceDate', 'fecha')
            .addSelect('att.IdAttendance', 'id');

            // Aplicar filtros
            if (filters?.identificacion) {
                qb.andWhere('ben.Identification = :identificacion', { identificacion: filters.identificacion });
            }
            if (filters?.actividad) {
                qb.andWhere('act.NameActivity ILIKE :actividad', { actividad: `%${filters.actividad}%` });
            }
            if (filters?.fecha) {
                // La fecha se guarda como DATE en PostgreSQL, comparamos como string en formato YYYY-MM-DD
                qb.andWhere('att.AttendanceDate = :fecha', { fecha: filters.fecha });
            }

            // Obtener total de registros (sin paginación)
            const total = await qb.getCount();

            // Aplicar paginación
            qb.skip((page - 1) * limit).take(limit);
            qb.orderBy('att.AttendanceDate', 'DESC');

            // Ejecutar consulta y obtener resultados planos
            const rawResults = await qb.getRawMany();

            return {rawResults, total}
        } catch (error) {
            console.error('Error al obtener asistencias:', error);
            throw error;
        }
    }

    async isDuplicateAbsence(identificacion: string, actividad: string, fecha: string): Promise<boolean> {
        try {
            const existingAbsence = await this.attendanceRepository.createQueryBuilder('att')
                .leftJoin('att.beneficiary', 'ben')
                .leftJoin('att.activity', 'act')
                .where('ben.Identification = :identificacion', { identificacion })
                .andWhere('act.NameActivity = :actividad', { actividad })
                .andWhere('att.AttendanceDate = :fecha', { fecha })
                .andWhere('att.Status = :status', { status: 'absent' })
                .getOne();
            return !!existingAbsence;
        }catch (error) {
            console.error('Error al verificar ausencia duplicada:', error);
            throw error;
        }
    }

    //Buscar actividad por nombre
    async findActivityByName(activityName: string): Promise<any> {
        try {
            //cambiar al repositorio Tasks para buscar por nombre de actividad
            const activity = await this.activityRepository.findOne({
                where: { NameActivity: activityName },
                order: { CreatedAt: 'DESC' }, // Si hay varias con el mismo nombre, tomar la más reciente
            });
            return activity;
        } catch (error) {
            console.error('Error al buscar actividad por nombre:', error);
            throw error;
        }
    }

    //Crear el registro en Absences y luego en Attendances con status 'absent' y el IdAbsence correspondiente
    async registerAbsence(IdBeneficiary: number, IdActivity: number, motivo: string, fecha: string): Promise<object> {
        try {
            const newAbsence = this.absenceRepository.create({
                IdUser: 1, //se deja hardcodeado por ahora, luego se debe obtener el Id del usuario autenticado que registra la ausencia
                IdBeneficiary,
                IdActivity,
                DescriptionAbsence: motivo,
            });
            const savedAbsence = await this.absenceRepository.save(newAbsence);
            const newAttendance: Partial<Attendance> = {
                IdBeneficiary,
                IdActivity,
                AttendanceDate: new Date(fecha),
                Status: 'absent',
                IdAbsence: savedAbsence.IdAbsence,
                CreatedAt: new Date(),
                UpdatedAt: new Date(),
            };
            await this.attendanceRepository.save(newAttendance);
            return {message: `Inasistencia registrada exitosamente para el beneficiario con ID ${IdBeneficiary} en la actividad con ID ${IdActivity}`};
        } catch (error) {
            console.error('Error al registrar inasistencia:', error);
            throw error;
        }
    }

    async findProgramByName(programName: string): Promise<any> {
        try {
            const program = await this.activityRepository.manager.getRepository('Program').findOne({
                where: { NameProgram: programName },
            });
            return program;
        } catch (error) {
            console.error('Error al buscar programa por nombre:', error);
            throw error;
        }
    }

}