import { BadRequestException, Body, Controller, Get, HttpException, HttpStatus, Post, Query, UseGuards } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { CustomResponse, Report } from '../interfaces/interfaces';
import { sendResponse } from 'src/tools/function.tools';
import params from 'src/tools/params';
import { CreateReportDto } from './dtos/create-report.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';

@Controller('letsHelp/Colombia/reports')
@UseGuards(JwtAuthGuard)
export class ReportsController {
    constructor(private readonly reportsService: ReportsService) {}

  /**
   * Endpoint para crear un reporte.
   * @param report Datos del reporte a crear.
   * @returns ID del reporte creado.
   */
  @Post('/create')
  async createReport(@Body() report: CreateReportDto): Promise<CustomResponse> {
    try { 
        const createReport = await this.reportsService.createReport(report);
        return sendResponse(true, params.ResponseMessages.MESSAGE_SUCCESS, createReport)
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

  /**
   * Endpoint para buscar reportes por identificación o nombres y apellidos.
   * @param searchTerm Término de búsqueda.
   * @returns Lista de reportes coincidentes.
   */
  @Get('/search')
  async findReports(@Query('term') searchTerm: string): Promise<CustomResponse> {

    try {
        const findReport = await this.reportsService.findReports(searchTerm);
        return sendResponse(true, params.ResponseMessages.MESSAGE_SUCCESS, findReport)
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


  /**
 * Endpoint para listar los últimos 10 reportes creados.
 * @returns Lista de los últimos 10 reportes.
 */
@Get('/recent')
async listRecentReports(): Promise<CustomResponse> {
    try {
        const listReport = await this.reportsService.listRecentReports();
        return sendResponse(true, params.ResponseMessages.MESSAGE_SUCCESS, listReport) 
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
