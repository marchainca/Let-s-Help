import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class DataBaseService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) {}

    async createUser(userData: any): Promise<User> {
        try {
            const newUser = new User();
            newUser.Identification = userData.idNumber;
            newUser.Email = userData.email;
            newUser.Birthdate = userData.birthdate;
            newUser.role = userData.role;
            newUser.FirstName = userData.name;
            newUser.LastName = userData.name;
            newUser.Password = userData.password;
            newUser.UrlImage = userData.urlImage || null;
            const createUser = await this.userRepository.save(newUser);
            return createUser;
        } catch (error) {
            console.error('Error al crear el usuario:', error.message || error);
            throw error;
        }
    }

    async getUserByEmail(email: string): Promise<User[]> {
        try {
            const userByEmail = await this.userRepository.find({ where: { Email: email } });
            console.log('User found by email:', email, userByEmail);
            return userByEmail;
        } catch (error) {
            console.error('Error finding user by email:', email, error.message || error);
            throw error;
        }  
    }

    async getUserByIdNumber(idNumber: string): Promise<User[]> {
        try {
            const userByIdNumber = await this.userRepository.find({ where: { Identification: idNumber } });
            console.log('User found by idNumber:', idNumber, userByIdNumber);
            return userByIdNumber;
        } catch (error) {
            console.error('Error finding user by idNumber:', idNumber, error.message || error);
            throw error;
        }
    }
}
