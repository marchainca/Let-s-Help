import { Injectable } from '@nestjs/common';
import { Activity } from "./entities/activity.entity";
import { Program } from './entities/program.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { SubProgram } from './entities/sub-program.entity';
import { ActivityTracking } from './entities/activity-tracking.entity';

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

            const output: Record<string, string[]> = {};
            for (const row of results) {
                const subName = row.subprogramname;   // usar minúsculas
                const actName = row.activityname;     // usar minúsculas
                if (!subName) continue;
                if (!output[subName]) {
                output[subName] = [];
                }
                // Evitar duplicados (opcional)
                if (actName && !output[subName].includes(actName)) {
                output[subName].push(actName);
                }
            }
            return output;
        } catch (error) {
            throw error;
        }
    }

    async getPrograms(id: string): Promise<Program[]> {
        try{
            /* const program = await this.programRepository.find({ where: { IdLeadUser: parseInt(id) },
                relations: ['subPrograms', 'subPrograms.activities'] });
            console.log('Program fetched for user ID:', id, program); */
            const programs = await this.programRepository.find({
                where: { IdLeadUser: parseInt(id) },
                relations: ['subPrograms', 'leadUser']
            });

            if (!programs) {
                throw new Error(`No se encontró un programa con el ID: ${id}`);
            }
            return programs;
        }catch (error) {
            console.error(`Error al obtener el programa para el id: ${id}` , error);
            throw error;
        }
    }

    async createProgram(body: object, idUser): Promise<string> {
        try {
            const newProgram = new Program();
            newProgram.NameProgram = body['name'];
            newProgram.DescriptionProgram = body['description'];
            newProgram.IdLeadUser = idUser;

            const savedProgram = await this.programRepository.save(newProgram);
            return savedProgram.IdProgram.toString();
        } catch (error) {
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

    async createSubprogram(body: object): Promise<string> {
        try {
            const program = await this.programRepository.findOne({ where: { IdProgram: body['programId'] } });

            if (!program) {
                throw new Error(`No se encontró un programa con el ID: ${body['programId']}`);
            }

            const createSubprogram = new SubProgram();
            createSubprogram.IdProgram =program.IdProgram;
            createSubprogram.NameSubProgram = body['name'];
            createSubprogram.DescriptionSubProgram = body['description'];

            const newSubprogram = this.subProgramRepository.create(createSubprogram);
            const savedSubprogram = await this.subProgramRepository.save(newSubprogram);
            return savedSubprogram.IdSubProgram.toString();
        }catch (error) {
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

    async createActivity(body: object, userId: number): Promise<number> {
        try {
            const newActivity = new Activity();
            newActivity.IdUser = userId;
            newActivity.IdProgram = body['programId'];
            newActivity.subProgram = body['subprogramId'];
            newActivity.NameActivity = body['activityData'].title;

            const saveActivity = await this.activityRepository.save(newActivity);
            return saveActivity.IdActivity;
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

    async getActivitiesWithTrackingsBySubProgram(subProgramId: number): Promise<Activity[]> {
        try {
            // Obtenemos las actividades del subprograma, con sus trackings y el usuario responsable
            const activities = await this.activityRepository
                .createQueryBuilder('act')
                .leftJoinAndSelect('act.activityTrackings', 'track')
                .leftJoinAndSelect('act.user', 'user')   // para obtener la identificación del responsable
                .where('act.IdSubProgram = :subProgramId', { subProgramId })
                .orderBy('act.IdActivity', 'ASC')
                .addOrderBy('track.WeekNumber', 'ASC')
                .getMany();

            return activities;
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
