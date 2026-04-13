import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        configService: ConfigService
    ) {
        super({
          jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // Extrae el token del encabezado Authorization
          ignoreExpiration: false, // No ignorar tokens expirados
          secretOrKey: configService.get<string>('SECRET_KEY'),
        });
    }

    async validate(payload: any) {
        //console.log("Ingreso al validate")
        return { userId: payload.sub, email: payload.email, roles: payload.roles };
    }
}
