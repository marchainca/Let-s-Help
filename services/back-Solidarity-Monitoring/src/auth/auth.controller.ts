import { Body, Controller, HttpException, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { sendResponse } from 'src/tools/function.tools';
import { CustomResponse } from 'src/interfaces/interfaces';
import params from 'src/tools/params';

@Controller('letsHelp/Colombia/auth/')
export class AuthController {
    constructor(private readonly authService: AuthService) {}
    
    @Post('login')
    async login(@Body('email') email: string, @Body('password') password: string): Promise<CustomResponse> {
        try {
            console.log(email, password)
            const user = await this.authService.validateUser(email, password);
            const login = await  this.authService.login(user);
            return await sendResponse(true, params.ResponseMessages.SUCCESS, login);
        } catch (error) {
            throw new HttpException(
                {
                code: error.code,
                message: error.message,
                attribute: error.attribute,
                statusCode: error.statusCode,
                },
                HttpStatus.BAD_REQUEST,
            );
        }
        
    }
}
