import { Injectable } from '@nestjs/common';
import { Activity } from "./entities/activity.entity";
import { Program } from './entities/program.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { SubProgram } from './entities/sub-program.entity';
import { ActivityTracking } from './entities/activity-tracking.entity';
import { ProgramsTranslation } from 'src/common/translation/entities/programs-translation.entity';
import { TranslationService } from 'src/common/translation/translation.service';
import params from 'src/tools/params';
import { SubProgramsTranslation } from 'src/common/translation/entities/subprograms-translation.entity';
import { ActivitiesTranslation } from 'src/common/translation/entities/activities-translation.entity';

@Injectable()
export class DataBaseService {
    constructor(
        @InjectRepository(Activity)
        private readonly activityRepository:Repository<Activity>,
        @InjectRepository(ActivityTracking)
        private readonly activityTrackingRepository:Repository<ActivityTracking>,
        @InjectRepository(Program)
        private readonly programRepository:Repository<Program>,
        @InjectRepository(SubProgram)
        private readonly subProgramRepository:Repository<SubProgram>,
        @InjectRepository(User)
        private readonly userRepository:Repository<User>,
        @InjectRepository(ProgramsTranslation)
        private programsTranslationRepository: Repository<ProgramsTranslation>,
        @InjectRepository(SubProgramsTranslation)
        private subProgramsTranslationRepository: Repository<SubProgramsTranslation>,
        @InjectRepository(ActivitiesTranslation)
        private activitiesTranslationRepository: Repository<ActivitiesTranslation>,
        private readonly translationService: TranslationService,


    ) {}

    async getAllProgramsWithActivities(langId: number): Promise<Program[]> {
        try{

            // Consulta optimizada para obtener solo los campos necesarios segun la internacionalización
            const programsAndActivities = await this.programRepository
            .createQueryBuilder('p')
            .leftJoinAndSelect('p.subPrograms', 'sp')
            .leftJoinAndSelect('sp.activities', 'a')
            .leftJoinAndSelect('p.translations', 'pt', 'pt.IdLanguage = :langId', { langId })
            .leftJoinAndSelect('sp.translations', 'spt', 'spt.IdLanguage = :langId', { langId })
            .leftJoinAndSelect('a.translations', 'at', 'at.IdLanguage = :langId', { langId })
            .select(['p.IdProgram', 'pt.NameProgram', 'pt.DescriptionProgram',
                    'sp.IdSubProgram', 'spt.NameSubProgram', 'spt.DescriptionSubProgram',
                    'a.IdActivity', 'at.NameActivity'])
            .orderBy('pt.NameProgram', 'ASC')
            .addOrderBy('spt.NameSubProgram', 'ASC')
            .addOrderBy('at.NameActivity', 'ASC')
            .getMany();

            return programsAndActivities;
        }catch(error){
            console.error('Error fetching programs with activities:', error);
            throw error;
        }
    }

    async getProgramNames(langId?: number): Promise<string[]> {
        try {
            //const programNames = await this.programRepository.find();
            //console.log('Program names fetched:', programNames);
            //return programNames.map(program => program.NameProgram) || [];
            
            // Consulta optimizada para obtener solo los nombres de los programas segun la internacionalización
            const programNames = await this.programRepository
                .createQueryBuilder('p')
                .leftJoinAndSelect('p.translations', 'pt', 'pt.IdLanguage = :langId', { langId })
                .select(['p.IdProgram', 'pt.NameProgram'])
                .orderBy('pt.NameProgram', 'ASC')
                .getMany();
            //console.log('Program names fetched with translations:', programNames);
            return programNames.map(program => program.translations[0]?.NameProgram || 'Nombre no disponible') || [];
        } catch (error) {
            throw error;
        }
    }
    async getProgramActivities(programName: string, langId?: number): Promise<any> {
        try {
            // Consulta optimizada para obtener las actividades de un programa específico segun la internacionalización
            const results = await this.programRepository
                .createQueryBuilder('p')
                .innerJoin('ProgramsTranslations', 'pt', 'pt.IdProgram = p.IdProgram AND pt.IdLanguage = :langId AND pt.NameProgram = :programName', { langId, programName })
                .leftJoin('p.subPrograms', 'sp')
                .leftJoin('SubProgramsTranslations', 'spt', 'spt.IdSubProgram = sp.IdSubProgram AND spt.IdLanguage = :langId')
                .leftJoin('sp.activities', 'a')
                .leftJoin('ActivitiesTranslations', 'at', 'at.IdActivity = a.IdActivity AND at.IdLanguage = :langId')
                .select([
                'spt.NameSubProgram as subprogramname',   // alias en minúsculas
                'at.NameActivity as activityname'         // alias en minúsculas
                ])
                .orderBy('spt.NameSubProgram', 'ASC')
                .addOrderBy('at.NameActivity', 'ASC')
                .getRawMany();

            return results;
        } catch (error) {
            throw error;
        }
    }

    async getPrograms(userId: number, langId: number): Promise<any[]> {
        try {

            const rawData = await this.programRepository
            .createQueryBuilder('p')
            .leftJoin('p.translations', 'pt', 'pt.IdLanguage = :langId', { langId })
            .leftJoinAndSelect('p.leadUser', 'leadUser')
            .leftJoin('p.subPrograms', 'sp')
            .leftJoin('sp.translations', 'spt', 'spt.IdLanguage = :langId', { langId })
            .where('p.IdLeadUser = :userId', { userId })
            .select([
                'p.IdProgram',
                'pt.NameProgram AS programName',
                'pt.DescriptionProgram AS programDescription',
                'p.IdLeadUser',
                'leadUser.Identification',
                'sp.IdSubProgram',
                'spt.NameSubProgram AS subProgramName'
            ])
            .getRawMany();

            //console.log('Raw data fetched for user programs:', rawData);

            // Reconstruir programa con sus subprogramas
            const programsMap = new Map();
            for (const row of rawData) {
            const progId = row.p_IdProgram;
            if (!programsMap.has(progId)) {
                programsMap.set(progId, {
                IdProgram: progId,
                NameProgram: row.programname,
                DescriptionProgram: row.programdescription,
                IdLeadUser: row.p_IdLeadUser,
                leadUser: { Identification: row.leadUser_Identification },
                subPrograms: []
                });
            }
            const program = programsMap.get(progId);
            if (row.sp_IdSubProgram) {
                program.subPrograms.push({
                IdSubProgram: row.sp_IdSubProgram,
                NameSubProgram: row.subprogramname
                });
            }
            }
            return Array.from(programsMap.values());
        } catch (error) {
            console.error(`Error al obtener programas para usuario ${userId}:`, error);
            throw error;
        }
    }

    async createProgram(body: any, idUser: number, langId: number): Promise<string> {
        try {
            const originalName = body['name'];
            const originalDescription = body['description'] || '';

            // Crear y guardar el programa sin campos textuales
            const newProgram = new Program();
            newProgram.IdLeadUser = idUser;
            const savedProgram = await this.programRepository.save(newProgram);

            // Guardar la traducción en el idioma original
            const originalTranslation = new ProgramsTranslation();
            originalTranslation.IdProgram = savedProgram.IdProgram;
            originalTranslation.IdLanguage = langId;
            originalTranslation.NameProgram = originalName;
            originalTranslation.DescriptionProgram = originalDescription;
            await this.programsTranslationRepository.save(originalTranslation);

            // Traducir al otro idioma (el que no es langId)
            const spanishLangId = params.languages.ES.code;
            const targetLangId = langId === spanishLangId ? 2 : 1;
            let translatedName = originalName;
            let translatedDescription = originalDescription;

            // Usar el servicio de traducción (requiere código de idioma: 'es' o 'en')
            const sourceLangCode = langId === spanishLangId ? 'es' : 'en';
            const targetLangCode = targetLangId === spanishLangId ? 'es' : 'en-US';

            try {
                translatedName = await this.translationService.translate(originalName, targetLangCode, sourceLangCode);
                if (originalDescription) {
                    translatedDescription = await this.translationService.translate(originalDescription, targetLangCode, sourceLangCode);
                }
            } catch (error) {
                console.error('Error al traducir el programa:', error);
                // Si falla la traducción, guardamos el mismo texto original
            }

            // Guardar la traducción en el idioma destino
            const targetTranslation = new ProgramsTranslation();
            targetTranslation.IdProgram = savedProgram.IdProgram;
            targetTranslation.IdLanguage = targetLangId;
            targetTranslation.NameProgram = translatedName;
            targetTranslation.DescriptionProgram = translatedDescription;
            await this.programsTranslationRepository.save(targetTranslation);

            return savedProgram.IdProgram.toString();
        } catch (error) {
            console.error('Error al crear el programa:', error.message || error);
            throw error;
        }
    }

    async findUserByIdentification(identification: string): Promise<any> {
        try {
            const userByIdenti = await this.userRepository.findOne({ where: { Identification: identification } });
            //console.log('User found by identification:', identification, userByIdenti);
            if (!userByIdenti) {
                throw new Error(`No se encontró un usuario con la identificación: ${identification}`);
            }
            return userByIdenti;
        } catch (error) {
            console.error('Error finding user by identification:', identification, error.message || error);
            throw error;
        }

    }

    async findProgramById(programId: number): Promise<any> {
        try {
            const programById = await this.programRepository.findOne({ where: { IdProgram: programId } });
            if (!programById) {
                throw new Error(`No se encontró un programa con el ID: ${programId}`);
            }
            return programById;
        } catch (error) {
            console.error('Error finding program by ID:', programId, error.message || error);
            throw error;
        }
    }

    async createSubprogram(body: object, langId: number): Promise<string> {
        try {
            const programId = body['programId'];
            const name = body['name'];
            const description = body['description'] || '';

            // Verificar que el programa exista
            const program = await this.programRepository.findOne({ where: { IdProgram: programId } });
            if (!program) {
            throw new Error(`No se encontró un programa con el ID: ${programId}`);
            }

            // Crear la entidad base del subprograma
            const newSubprogram = this.subProgramRepository.create({
            IdProgram: program.IdProgram,
            });
            const savedSubprogram = await this.subProgramRepository.save(newSubprogram);
            const subprogramId = savedSubprogram.IdSubProgram;

            // Guardar la traducción en el idioma original
            const originalTranslation = this.subProgramsTranslationRepository.create({
            IdSubProgram: subprogramId,
            IdLanguage: langId,
            NameSubProgram: name,
            DescriptionSubProgram: description,
            });
            await this.subProgramsTranslationRepository.save(originalTranslation);

            //  Obtener el idioma
            const targetLangId = langId === params.languages.ES.code ? params.languages.EN.code : params.languages.ES.code;
            let translatedName = name;
            let translatedDescription = description;

            // Traducir solo si el texto no está vacío y se requiere el otro idioma
            if (name || description) {
                try {
                    // Mapear IdLanguage a código de idioma para DeepL (1: español -> 'es', 2: inglés -> 'en')
                    const sourceLangCode = langId === params.languages.ES.code ? 'es' : 'en';
                    const targetLangCode = langId === params.languages.ES.code ? 'en-US' : 'es';

                    if (name) {
                        translatedName = await this.translationService.translate(name, targetLangCode, sourceLangCode);
                    }
                    if (description) {
                        translatedDescription = await this.translationService.translate(description, targetLangCode, sourceLangCode);
                    }
                } catch (translationError) {
                    console.error('Error al traducir subprograma:', translationError);
                    // Si falla la traducción, se guarda el texto original (o vacío) para no bloquear la creación
                }
            }

            // Guardar la traducción en el idioma destino
            const targetTranslation = this.subProgramsTranslationRepository.create({
            IdSubProgram: subprogramId,
            IdLanguage: targetLangId,
            NameSubProgram: translatedName,
            DescriptionSubProgram: translatedDescription,
            });
            await this.subProgramsTranslationRepository.save(targetTranslation);

            return subprogramId.toString();
        } catch (error) {
            console.error('Error creating subprogram:', error.message || error);
            throw error;
        }
}

    async findSubprogramById(subprogramId: number): Promise<any> {
        try {
            const subprogramById = await this.subProgramRepository.findOne({ where: { IdSubProgram: subprogramId } });
            if (!subprogramById) {
                throw new Error(`No se encontró un subprograma con el ID: ${subprogramId}`);
            }
            return subprogramById;
        } catch (error) {
            console.error('Error finding subprogram by ID:', subprogramId, error.message || error);
            throw error;
        }
    }

    async createActivity(body: object, userId: number, langId: number): Promise<number> {
        try {
            const programId = body['programId'];
            const subprogramId = body['subprogramId'];
            const activityTitle = body['activityData']?.title;
            if (!activityTitle) {
            throw new Error('El título de la actividad es obligatorio');
            }

            // Crear la entidad base de la actividad
            const newActivity = new Activity();
            newActivity.IdUser = userId;
            newActivity.IdProgram = programId;
            newActivity.subProgram = subprogramId;
            const savedActivity = await this.activityRepository.save(newActivity);
            const activityId = savedActivity.IdActivity;

            // Guardar traducción en el idioma original
            const originalTranslation = this.activitiesTranslationRepository.create({
            IdActivity: activityId,
            IdLanguage: langId,
            NameActivity: activityTitle,
            });
            await this.activitiesTranslationRepository.save(originalTranslation);

            // Obtener el idioma destino 1 -> 2, 2 -> 1
            const targetLangId = langId === params.languages.ES.code ? params.languages.EN.code : params.languages.ES.code;
            let translatedTitle = activityTitle;

            // Traducir título al idioma destino
            try {
                const sourceLangCode = langId === params.languages.ES.code ? 'es' : 'en';
                const targetLangCode = langId === params.languages.ES.code ? 'en-US' : 'es';
                translatedTitle = await this.translationService.translate(activityTitle, targetLangCode, sourceLangCode);
            } catch (err) {
                console.error('Error al traducir el título de la actividad:', err);
                // Si falla la traducción, se guarda el título original para no bloquear la creación
            }

            // Guardar traducción en el idioma destino
            const targetTranslation = this.activitiesTranslationRepository.create({
            IdActivity: activityId,
            IdLanguage: targetLangId,
            NameActivity: translatedTitle,
            });
            await this.activitiesTranslationRepository.save(targetTranslation);

            return activityId;
        } catch (error) {
            console.error('Error creating activity:', error.message || error);
            throw error;
        }
    }

    async createActivityTracking(body: object, activityId: number, userId: number): Promise<string> {
        try {

            const newActivityTracking = new ActivityTracking;

            newActivityTracking.IdActivity = activityId;
            newActivityTracking.IdUser =userId;
            newActivityTracking.ActualAttendees = body['activityData'].actualAttendees;
            newActivityTracking.ExecutedActivities = body['activityData'].executedActivities;
            newActivityTracking.PlannedActivities = body['activityData'].projectedActivities;
            newActivityTracking.ProjectedAttendees = body['activityData'].projectedAttendees;
            newActivityTracking.WeekNumber = body['activityData'].weekNumber;

            const saveActivityTracking = await this.activityTrackingRepository.save(newActivityTracking);
            return saveActivityTracking.IdTracking.toString();
        }catch (error) {
            console.error('Error creating activity with details:', error.message || error);
            throw error;
        }
    }

    async getActivitiesWithTrackingsBySubProgram(subProgramId: number, langId: number): Promise<any[]> {
        try {
            // Consulta con joins a las tablas de traducción, tracking y usuario
            console.log(`Fetching activities with trackings for SubProgram ID: ${subProgramId} and Language ID: ${langId}`);
            const rawResults = await this.activityRepository
            .createQueryBuilder('act')
            .leftJoin('act.translations', 'at', 'at.IdLanguage = :langId', { langId })
            .leftJoin('act.activityTrackings', 'track')
            .leftJoin('act.user', 'user')
            .where('act.IdSubProgram = :subProgramId', { subProgramId })
            .select([
                'act.IdActivity AS id',
                'at.NameActivity AS title',
                'track.IdTracking AS trackingId',
                'track.WeekNumber AS weekNumber',
                'track.PlannedActivities AS plannedActivities',
                'track.ExecutedActivities AS executedActivities',
                'track.ProjectedAttendees AS projectedAttendees',
                'track.ActualAttendees AS actualAttendees',
                'user.Identification AS responsible'
            ])
            .orderBy('act.IdActivity', 'ASC')
            .addOrderBy('track.WeekNumber', 'ASC')
            .getRawMany();

            //console.log('Raw results for activities with trackings:', rawResults);

            // Reconstruir la estructura anidada
            const activitiesMap = new Map();
            for (const row of rawResults) {
                const activityId = row.id;
                if (!activitiesMap.has(activityId)) {
                    activitiesMap.set(activityId, {
                    IdActivity: activityId,
                    NameActivity: row.title,
                    user: { Identification: row.responsible },
                    activityTrackings: []
                    });
                }
                const activity = activitiesMap.get(activityId);
                if (row.trackingid) {
                    activity.activityTrackings.push({
                    WeekNumber: row.weeknumber,
                    PlannedActivities: row.plannedactivities,
                    ExecutedActivities: row.executedactivities,
                    ProjectedAttendees: row.projectedattendees,
                    ActualAttendees: row.actualattendees
                    });
                }
            }
            return Array.from(activitiesMap.values());
        } catch (error) {
            console.error(`Error al obtener actividades para el subprograma ID: ${subProgramId}`, error.message || error);
            throw error;
        }
    }

    // Verificar que la actividad existe y pertenece al subprograma y programa indicados
    async findActivityWithSubProgramAndProgram(actId: number, progId: number): Promise<Activity> {
        try {
            const activity = await this.activityRepository.findOne({
                where: {
                IdActivity: actId,
                IdProgram: progId,
                },
                relations: ['subProgram'],
            });

            return activity;

        } catch (error) {
            console.error(`Error al encontrar actividad con ID: ${actId} para el programa ID: ${progId}`, error.message || error);
            throw error;
        }
    }

    //Buscar el registro de tracking para esa actividad y semana
    async findActivityTrackingByActivityAndWeek(actId: number, weekNumber: number): Promise<ActivityTracking> {
        try {
            const activityTracking = await this.activityTrackingRepository.findOne({
                where: {
                    IdActivity: actId,
                    WeekNumber: weekNumber,
                },
            });
            return activityTracking;
        } catch (error) {
            console.error(`Error al encontrar tracking para actividad ID: ${actId} y semana: ${weekNumber}`, error.message || error);
            throw error;
        }
    }

    async updateActivityTracking(activityTracking: ActivityTracking): Promise<void> {
        try {
            await this.activityTrackingRepository.save(activityTracking);
        } catch (error) {
            console.error(`Error al actualizar tracking para actividad ID: ${activityTracking.IdActivity} y semana: ${activityTracking.WeekNumber}`, error.message || error);
            throw error;
        }
    }
}
