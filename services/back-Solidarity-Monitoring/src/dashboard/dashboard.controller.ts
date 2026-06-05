import { Controller, Get, HttpException, HttpStatus } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { sendResponse } from 'src/tools/function.tools';
import params from 'src/tools/params';

@Controller('letsHelp/Colombia/dashboard')
export class DashboardController {

    constructor(
        private readonly dashboardService: DashboardService,
    ) {}

    @Get('/indicators')
    async getIndicators() {
        try {
            const getIndicators = await this.dashboardService.getDashboardIndicators();
            return await sendResponse(true, params.ResponseMessages.MESSAGE_SUCCESS, getIndicators );
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
