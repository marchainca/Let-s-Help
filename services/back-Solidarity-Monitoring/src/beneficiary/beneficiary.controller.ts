import { Controller, Post, Body, BadRequestException, HttpException, HttpStatus, UseGuards, Get, Query } from '@nestjs/common';
import { BeneficiaryService } from './beneficiary.service';
import { sendResponse } from 'src/tools/function.tools';
import params from 'src/tools/params';
import { CustomResponse } from 'src/interfaces/interfaces';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';

@Controller('letsHelp/Colombia/beneficiary')
@UseGuards(JwtAuthGuard)
export class BeneficiaryController {
  constructor(private readonly beneficiaryService: BeneficiaryService) {}

  // Endpoint para registrar una persona
  @Post('/register')
  async registerPerson(@Body() body: any): Promise<CustomResponse> {
    try {
      console.log("Data recibida", body)
      const register = await this.beneficiaryService.registerPerson(body);
      return  await sendResponse(true, params.ResponseMessages.CREATED, {register} )
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

  // Endpoint para identificar una persona
  @Post('/identify')
  async identifyPerson(@Body('imageBase64') imageBase64: string): Promise<any> {
    try {
      if (!imageBase64) {
        throw new BadRequestException('La imagen base64 es requerida.');
      }
      console.log("que lelga en identifyPerson", imageBase64)
      imageBase64 = "data:image/jpg;base64," + imageBase64
      const identify = await this.beneficiaryService.identifyPerson(imageBase64);
      return sendResponse(true, params.ResponseMessages.MESSAGE_SUCCESS, identify)
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

  @Get('/search')
  async searchByName(@Query('name') name: string): Promise<CustomResponse> {
    try {

      const search = await this.beneficiaryService.searchByName(name);
      return sendResponse(true, params.ResponseMessages.MESSAGE_SUCCESS, search)
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
