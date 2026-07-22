import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Beneficiary } from 'src/recognition/entities/beneficiary.entity';
import { In, Repository } from 'typeorm';
import { Attendance } from './entities/attendance.entity';
import { Activity } from 'src/activities/entities/activity.entity';
import { Absence } from 'src/users/entities/absence.entity';
import { AbsencesTranslation } from 'src/common/translation/entities/absences-translation.entity';
import { TranslationService } from 'src/common/translation/translation.service';
import params from 'src/tools/params';


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
        @InjectRepository(AbsencesTranslation)
        private readonly absencesTranslationRepository: Repository<AbsencesTranslation>,
        private readonly translationService: TranslationService
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

    async getAttendances(langId: number, filters?: any, page: number = 1, limit: number = 10): Promise<any> {

        try {
            // Construir query base con relaciones
            const qb = this.attendanceRepository
            .createQueryBuilder('att')
            .leftJoin('att.beneficiary', 'ben')
            .leftJoin('att.activity', 'act')
            .leftJoin('act.translations', 'at', 'at.IdLanguage = :langId', { langId }) // Unir traducciones
            .addSelect('ben.Identification', 'identificacion')
            .addSelect('at.NameActivity', 'actividad') // Usar nombre traducido
            .addSelect('att.AttendanceDate', 'fecha')
            .addSelect('att.IdAttendance', 'id');

            // Aplicar filtros
            if (filters?.identificacion) {
            qb.andWhere('ben.Identification = :identificacion', { identificacion: filters.identificacion });
            }
            if (filters?.actividad) {
            // Buscar en el nombre traducido
            qb.andWhere('at.NameActivity ILIKE :actividad', { actividad: `%${filters.actividad}%` });
            }
            if (filters?.fecha) {
            qb.andWhere('att.AttendanceDate = :fecha', { fecha: filters.fecha });
            }

            // Obtener total de registros (sin paginación)
            const total = await qb.getCount();

            // Aplicar paginación
            qb.skip((page - 1) * limit).take(limit);
            qb.orderBy('att.AttendanceDate', 'DESC');

            // Ejecutar consulta y obtener resultados planos
            const rawResults = await qb.getRawMany();

            return { rawResults, total };
        } catch (error) {
            console.error('Error al obtener asistencias:', error);
            throw error;
        }
    }

    async isDuplicateAbsence(identificacion: string, actividad: string, fecha: string, langId: number): Promise<boolean> {
        try {
            const existingAbsence = await this.attendanceRepository
            .createQueryBuilder('att')
            .leftJoin('att.beneficiary', 'ben')
            .leftJoin('att.activity', 'act')
            .leftJoin('act.translations', 'at', 'at.IdLanguage = :langId', { langId })
            .where('ben.Identification = :identificacion', { identificacion })
            .andWhere('at.NameActivity = :actividad', { actividad })
            .andWhere('att.AttendanceDate = :fecha', { fecha })
            .andWhere('att.Status IN (:...statuses)', { statuses: ['absent', 'justified'] })
            .getOne();
            return !!existingAbsence;
        } catch (error) {
            console.error('Error al verificar ausencia duplicada:', error);
            throw error;
        }
    }

    //Buscar actividad por nombre
    async findActivityByName(activityName: string, langId: number): Promise<any> {
        console.log('Buscando actividad por nombre:', activityName, 'en idioma ID:', langId);
        try {
            const activity = await this.activityRepository
            .createQueryBuilder('act')
            .innerJoin('act.translations', 'at', 'at.IdLanguage = :langId AND at.NameActivity = :activityName', { langId, activityName })
            .select(['act.IdActivity', 'act.IdProgram', 'act.IdSubProgram', 'act.IdUser', 'act.ExecutionDate'])
            .getOne();
            console.log('Actividad encontrada por nombre:', activity);
            return activity;
        } catch (error) {
            console.error('Error al buscar actividad por nombre:', error);
            throw error;
        }
    }

    //Crear el registro en Absences y luego en Attendances con status 'absent' y el IdAbsence correspondiente
    async registerAbsence(
        IdBeneficiary: number,
        IdActivity: number,
        motivo: string,
        fecha: string,
        langId: number,
        isJustified = false,
        idUsuario: number,
    ): Promise<object> {
    try {
      // 1. Crear la ausencia base (sin DescriptionAbsence)
      const newAbsence = this.absenceRepository.create({
        IdUser: idUsuario,
        IdBeneficiary,
        IdActivity,
        IsJustified: isJustified,
      });
      const savedAbsence = await this.absenceRepository.save(newAbsence);
      const absenceId = savedAbsence.IdAbsence;

      // 2. Guardar traducción en idioma original (langId)
      const originalTranslation = this.absencesTranslationRepository.create({
        IdAbsence: absenceId,
        IdLanguage: langId,
        DescriptionAbsence: motivo,
      });

      await this.absencesTranslationRepository.save(originalTranslation);

      // 3. Traducir al idioma opuesto (1 <-> 2)
      const targetLangId = langId === params.languages.ES.code ? 2 : 1;
      let translatedMotivo = motivo;
      try {
        const sourceLangCode = langId === params.languages.ES.code ? 'es' : 'en';
        const targetLangCode = langId === params.languages.ES.code ? 'en-US' : 'es';
        translatedMotivo = await this.translationService.translate(motivo, targetLangCode, sourceLangCode);
      } catch (err) {
        console.error('Error al traducir motivo de ausencia:', err);
        // Si falla, se guarda el motivo original
      }

      // 4. Guardar traducción en idioma destino
      const targetTranslation = this.absencesTranslationRepository.create({
        IdAbsence: absenceId,
        IdLanguage: targetLangId,
        DescriptionAbsence: translatedMotivo,
      });
      await this.absencesTranslationRepository.save(targetTranslation);

      // 5. Crear el registro de asistencia (Attendances)
      const newAttendance: Partial<Attendance> = {
        IdBeneficiary,
        IdActivity,
        AttendanceDate: new Date(fecha),
        Status: isJustified ? 'justified' : 'absent',
        IdAbsence: absenceId,
        CreatedAt: new Date(),
        UpdatedAt: new Date(),
      };

      console.log("Registro de inasistencia a crear: ", newAttendance);
      await this.attendanceRepository.save(newAttendance);

      return {
        message: `Inasistencia registrada exitosamente para el beneficiario con ID ${IdBeneficiary} en la actividad con ID ${IdActivity}`,
        isJustified,
      };
    } catch (error) {
      console.error('Error al registrar inasistencia:', error);
      throw error;
    }
  }

    async findProgramByName(programName: string, langId: number): Promise<any> {
        try {
            // Buscar el programa cuyo nombre traducido coincida en el idioma solicitado
            const program = await this.activityRepository.manager
            .getRepository('Program')
            .createQueryBuilder('p')
            .innerJoin(
                'ProgramsTranslations',
                'pt',
                'pt.IdProgram = p.IdProgram AND pt.IdLanguage = :langId AND pt.NameProgram = :programName',
                { langId, programName }
            )
            .getOne();

            return program;
        } catch (error) {
            console.error('Error al buscar programa por nombre:', error);
            throw error;
        }
    }

}