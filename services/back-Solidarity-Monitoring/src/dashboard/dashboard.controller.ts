import { Controller, Get, HttpException, HttpStatus } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { sendResponse } from 'src/tools/function.tools';
import params from 'src/tools/params';
import { Language } from 'src/common/decorators/language.decorator';

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

    @Get('/executive-summary')
    async getExecutiveSummary() {
        try {
            const summary = await this.dashboardService.getExecutiveDashboardSummary();
            return await sendResponse(true, params.ResponseMessages.MESSAGE_SUCCESS, summary );
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

    @Get('/attendance-summary')
    async getAttendanceSummary(@Language() lang: number) {
        try {
            const summary = await this.dashboardService.getAttendanceDashboardSummary(lang);
            return await sendResponse(true, params.ResponseMessages.MESSAGE_SUCCESS, summary );
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

    @Get('/program-summary')
    async getProgramSummary(@Language() lang: number) {
        try {
            const summary = await this.dashboardService.getProgramDashboardSummary(lang);
            return await sendResponse(true, params.ResponseMessages.MESSAGE_SUCCESS, summary );
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

    @Get('/subprogram-summary')
    async getSubProgramSummary(@Language() lang: number) {
        try {
            const summary = await this.dashboardService.getSubProgramDashboardSummary(lang);
            return await sendResponse(true, params.ResponseMessages.MESSAGE_SUCCESS, summary );
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

    @Get('/activity-summary')
    async getActivitySummary(@Language() lang: number) {
        try {
            const summary = await this.dashboardService.getActivityDashboardSummary(lang);
            return await sendResponse(true, params.ResponseMessages.MESSAGE_SUCCESS, summary );
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

    @Get('/tracking-summary')
    async getTrackingSummary(@Language() lang: number) {
        try {
            const summary = await this.dashboardService.getTrackingDashboardSummary(lang);
            return await sendResponse(true, params.ResponseMessages.MESSAGE_SUCCESS, summary );
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
