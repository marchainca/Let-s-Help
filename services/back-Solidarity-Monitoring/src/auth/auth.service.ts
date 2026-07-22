import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { randomBytes } from 'crypto';
import { errorResponse } from 'src/tools/function.tools';
import { UsersDataBaseService } from 'src/users/users-data-base.service';
import { AuthDataBaseService } from './auth-data-base.service';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class AuthService {
    private readonly accessTokenExpiresIn = '30m';
    private readonly accessTokenExpiresInSeconds = 30 * 60;
    private readonly refreshTokenExpiresInDays = Number(process.env.REFRESH_TOKEN_EXPIRES_DAYS ?? 7);

    constructor(
        private readonly jwtService: JwtService,
        private readonly usersDatabaseService: UsersDataBaseService,
        private readonly authDataBaseService: AuthDataBaseService,
    ) {}

    private mapUser(user: User) {
        return {
            id: user.IdUser,
            idRole: user.IdRole,
            idNumber: user.Identification,
            email: user.Email,
            name: user.FirstName,
            role: (user.role as any)?.NameRole,
            urlImage: user.UrlImage,
            birthdate: user.Birthdate,
        };
    }

    private buildAccessToken(user: User): string {
        const mappedUser = this.mapUser(user);
        const payload = { sub: mappedUser.id, email: mappedUser.email, roles: mappedUser.role };
        return this.jwtService.sign(payload, { expiresIn: this.accessTokenExpiresIn });
    }

    private generateRefreshTokenValue(): string {
        return randomBytes(64).toString('hex');
    }

    private getRefreshTokenExpirationDate(): Date {
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + this.refreshTokenExpiresInDays);
        return expiresAt;
    }

    private async issueTokens(user: User) {
        await this.authDataBaseService.revokeRefreshTokensByUserId(user.IdUser);

        const refreshToken = this.generateRefreshTokenValue();
        const refreshTokenExpiresAt = this.getRefreshTokenExpirationDate();
        await this.authDataBaseService.saveRefreshToken(user.IdUser, refreshToken, refreshTokenExpiresAt);

        return {
            accessToken: this.buildAccessToken(user),
            refreshToken,
            expiresIn: this.accessTokenExpiresInSeconds,
            refreshTokenExpiresAt: refreshTokenExpiresAt.toISOString(),
            user: this.mapUser(user),
        };
    }

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
            return this.mapUser(user[0]);
        } catch (error) {
            console.log("Error validateUser", error)
            throw error;
        }

    }

    async login(user: any): Promise<object> {
        try {
            const dbUser = await this.usersDatabaseService.getUserByEmail(user.email);
            if (!dbUser.length) {
                throw await errorResponse('Error: Invalid data', 'login');
            }

            return this.issueTokens(dbUser[0]);
        } catch (error) {
            console.log("Error login", error)
            throw error;
        }
    }

    async refreshTokens(refreshToken: string): Promise<object> {
        try {
            if (!refreshToken) {
                throw await errorResponse('Error: Refresh token is required.', 'refreshTokens');
            }

            const storedToken = await this.authDataBaseService.findValidRefreshToken(refreshToken);
            if (!storedToken?.user) {
                throw await errorResponse('Error: Invalid or expired refresh token.', 'refreshTokens');
            }

            await this.authDataBaseService.deleteRefreshToken(refreshToken);
            return this.issueTokens(storedToken.user);
        } catch (error) {
            console.log('Error refreshTokens', error);
            throw error;
        }
    }
}
