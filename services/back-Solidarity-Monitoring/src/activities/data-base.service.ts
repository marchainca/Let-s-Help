import { Injectable } from '@nestjs/common';
import { Activity } from "./entities/activity.entity";
import { Program } from './entities/program.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class DataBaseService {
    constructor(
        @InjectRepository(Activity)
        private readonly activityRepository:Repository<Activity>,
        @InjectRepository(Program)
        private readonly programRepository:Repository<Program>,
        @InjectRepository(User)
        private readonly userRepository:Repository<User>,
    ) {}

    async getAllProgramsWithActivities(): Promise<Program[]> {
        try{
        
            const activities = await this.programRepository
                .createQueryBuilder('p')
                .leftJoinAndSelect('p.subPrograms', 'sp')
                .leftJoinAndSelect('sp.tasks', 't')
                .select(['p.NameProgram', 'sp.NameSubProgram', 't.NameTask'])
                .orderBy('p.NameProgram', 'ASC')
                .addOrderBy('sp.NameSubProgram', 'ASC')
                .addOrderBy('t.NameTask', 'ASC')
                .getMany();
            
            return activities;
        }catch(error){
            console.error('Error fetching programs with activities:', error.message || error);
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
            console.log('User found by identification:', identification, userByIdenti);
            if (!userByIdenti) {
                throw new Error(`No se encontró un usuario con la identificación: ${identification}`);
            }
            return userByIdenti;
        } catch (error) {
            console.error('Error finding user by identification:', identification, error.message || error);
            throw error;
        }
        
    }
}
