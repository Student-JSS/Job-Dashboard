import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AppService } from './app.service.js';

@ApiTags('System')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ summary: 'API Root & Health Check' })
  @ApiResponse({ status: 200, description: 'API status information' })
  getInfo() {
    return this.appService.getInfo();
  }
}
