import { BadRequestException, Body, Controller, Get, HttpException, HttpStatus, Post, Query, UseGuards } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { sendResponse } from 'src/tools/function.tools';
import params from 'src/tools/params';
import { CustomResponse } from 'src/interfaces/interfaces';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { CreateAttendanceDto } from './dtos/create-attendance.dto';

@Controller('letsHelp/Colombia/attendance/')
@UseGuards(JwtAuthGuard)
export class AttendanceController {
    constructor(private readonly attendanceService: AttendanceService) {}

    // Endpoint para listar asistencias con filtros opcionales
    @Get('list')
    async listAttendances(
        @Query('identificacion') identificacion?: string,
        @Query('actividad') actividad?: string,
        @Query('fecha') fecha?: string,
        @Query('page') page: string = '1',
        @Query('limit') limit: string = '10',
    ): Promise<any> {
        try {
            // Validar que los parámetros de paginación sean números válidos
            const pageNumber = parseInt(page, 10);
            const limitNumber = parseInt(limit, 10);

            if (isNaN(pageNumber) || pageNumber < 1) {
                throw new BadRequestException('El parámetro "page" debe ser un número mayor o igual a 1.');
            }
            
            if (isNaN(limitNumber) || limitNumber < 1) {
            throw new BadRequestException('El parámetro "limit" debe ser un número mayor o igual a 1.');
            }

            const filters = { identificacion, actividad, fecha };
            const response =  await this.attendanceService.listAttendances(filters, pageNumber, limitNumber);
            return await sendResponse(true, params.ResponseMessages.SUCCESS, response);
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

     // Ruta para identificar al integrante
    @Post('identify')
    async identifyIntegrante(@Body('identificacion') identificacion: string): Promise<CustomResponse> {
        try {
            const identify= await this.attendanceService.identifyIntegrante(identificacion);
            return await sendResponse(true, params.ResponseMessages.SUCCESS, identify);
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

    // Ruta para registrar asistencia
    @Post('register')
    async registerAttendance(@Body() data: CreateAttendanceDto): Promise<CustomResponse> {
        try {
             const record = await this.attendanceService.registerAttendance(data);
             return await sendResponse(true, params.ResponseMessages.SUCCESS, record);
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

    // Endpoint para registrar inasistencias
    @Post('absences')
    async registerAbsence(
        @Body('identificacion') identificacion: string,
        @Body('actividad') actividad: string,
        @Body('motivo') motivo: string,
        @Body('fecha') fecha: string,
    ): Promise<object> {
        try {
            if (!identificacion || !actividad || !motivo) {
                throw new BadRequestException('Todos los campos (identificacion, actividad, motivo) son obligatorios.');
            }
            console.log("Llega al controlador:", identificacion, actividad, motivo, fecha);
            const absence = await this.attendanceService.registerAbsence(identificacion, actividad, motivo, fecha);
            return await sendResponse(true, params.ResponseMessages.SUCCESS, absence);
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
