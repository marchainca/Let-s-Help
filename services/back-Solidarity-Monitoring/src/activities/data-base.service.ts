import { Injectable } from '@nestjs/common';
import { Activity } from "./entities/activity.entity";
import { Program } from './entities/program.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class DataBaseService {
    constructor(
        @InjectRepository(Activity)
        private readonly activityRepository:Repository<Activity>,
        @InjectRepository(Program)
        private readonly programRepository:Repository<Program>,
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
            const programNames = await this.activityRepository
                .createQueryBuilder('activity')
                .select('DISTINCT activity.NameActivity', 'NameActivity')
                .getRawMany();
            return programNames.map(program => program.NameActivity);
        } catch (error) {
            throw error;
        }
        }
    async getProgramActivities(programName: string): Promise<Activity[]> {
        try {
            const activities = await this.activityRepository
                .createQueryBuilder('activity')
                .where('activity.NameActivity = :programName', { programName })
                .getMany();
            return activities;
        } catch (error) {
            throw error;
        }""
        }
}
