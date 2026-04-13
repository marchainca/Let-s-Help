import { Body, Controller, Delete, Get, HttpException, HttpStatus, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { FirebaseService } from 'src/firebase/firebase.service';
import { UsersService } from './users.service';
import { CreateUserDto } from './dtos/create-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import { sendResponse } from 'src/tools/function.tools';
import params from 'src/tools/params';
import { CustomResponse } from 'src/interfaces/interfaces';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';

@Controller('letsHelp/Colombia/users/')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @Post()
    @Roles('Admin')
    async createUser(@Body() userData: CreateUserDto): Promise<CustomResponse> {
        try {
          console.log("depués del try")
            const id = await this.usersService.createUser(userData);
            
            return await sendResponse(true, params.ResponseMessages.CREATED, {id} )
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

    // Ruta para obtener todos los usuarios
    @Get()
    @Roles('Admin')
    async getUsers(): Promise<any[]> {
        
        try {
            return await this.usersService.getUsers();
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

    // Ruta para actualizar un usuario por ID
    @Patch(':id')
    async updateUser(@Param('id') userId: string, @Body() updateData: UpdateUserDto): Promise<string> {        
        try {
          //console.log("contenido de userId: ", userId.slice(4))
            await this.usersService.updateUser(userId.slice(4), updateData);
            return `User with ID ${userId} updated successfully.`;
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

    // Ruta para eliminar un usuario por ID
    @Delete(':id')
    async deleteUser(@Param('id') userId: string): Promise<string> {
       try {
            await this.usersService.deleteUser(userId);
            return `User with ID ${userId} deleted successfully.`;
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

