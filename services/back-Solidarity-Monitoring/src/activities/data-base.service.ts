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

    async getAllProgramsWithActivities(): Promise<Program[]> {
        try{
        
            const activities = await this.programRepository
            .createQueryBuilder('p')
            .leftJoinAndSelect('p.subPrograms', 'sp')
            .leftJoinAndSelect('sp.activities', 'a')  
            .select(['p.NameProgram', 'sp.NameSubProgram', 'a.NameActivity']) 
            .orderBy('p.NameProgram', 'ASC')
            .addOrderBy('sp.NameSubProgram', 'ASC')
            .addOrderBy('a.NameActivity', 'ASC')
            .getMany();
            //console.log('Fetched programs with activities:', activities);
            return activities;
        }catch(error){
            console.error('Error fetching programs with activities:', error);
            throw error.message || 'Error fetching programs with activities';
        }
    }

    async getProgramNames(): Promise<string[]> {
        try {
            const programNames = await this.programRepository.find();
            //console.log('Program names fetched:', programNames);
            return programNames.map(program => program.NameProgram) || [];
        } catch (error) {
            throw error;
        }
    }
    async getProgramActivities(programName: string): Promise<Program | null> {
        try {
            const programByName = await this.programRepository.findOne({
                where: { NameProgram: programName },
                relations: ['subPrograms', 'subPrograms.tasks'],
            });
            //console.log('Program activities fetched for:', programName, programByName);
            return programByName;
        } catch (error) {
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
}
