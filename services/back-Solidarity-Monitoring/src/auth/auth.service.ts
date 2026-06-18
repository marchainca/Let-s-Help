import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { errorResponse } from 'src/tools/function.tools';
import { UsersDataBaseService } from 'src/users/users-data-base.service';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class AuthService {
    private collectionName = 'users';
    constructor(
        private readonly jwtService: JwtService,
        private readonly usersDatabaseService: UsersDataBaseService,
    ) {}

    async validateUser(email: string, password: string): Promise<any> {
        try {
            console.log("validateUser", email, password)
           const user = await this.usersDatabaseService.getUserByEmail(email);

           if (user.length < 1) {
                throw await errorResponse("Error: Invalid data", "validateUser");
            }

            if (user[0].Password != password) {
                throw await errorResponse("Error: Invalid pass", "validateUser");
            }
            return { id: user[0].IdUser, idNumber: user[0].Identification, email: user[0].Email, name: user[0].FirstName, role: user[0].role[0]?.NameRole, urlImage: user[0].UrlImage, birthdate: user[0].Birthdate};
        } catch (error) {
            console.log("Error validateUser", error)
            throw error;
        }

    }

    // Generar un JWT
    async login(user: any): Promise<object> {
        try {

            const payload = { sub: user.id, email: user.email, roles: user.role };
            //console.log("user", user)
            return {
            accessToken: this.jwtService.sign(payload),
            user
            };
        } catch (error) {
            console.log("Error login", error)
            throw error;
        }
    }

}
