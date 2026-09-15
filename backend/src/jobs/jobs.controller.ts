import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiConflictResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JobsService } from './jobs.service.js';
import { CreateJobDto } from './dto/create-job.dto.js';
import { UpdateJobStatusDto } from './dto/update-job-status.dto.js';
import { QueryJobsDto } from './dto/query-jobs.dto.js';

@ApiTags('Jobs')
@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new job (initial status: pending)' })
  @ApiResponse({ status: 201, description: 'Job created successfully' })
  create(@Body() createJobDto: CreateJobDto) {
    return this.jobsService.create(createJobDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all jobs with optional filtering' })
  @ApiOkResponse({ description: 'List of jobs returned' })
  findAll(@Query() query: QueryJobsDto) {
    return this.jobsService.findAll(query);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get aggregate counts by status' })
  @ApiOkResponse({ description: 'Status count breakdown' })
  getStats() {
    return this.jobsService.getStats();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific job by ID' })
  @ApiOkResponse({ description: 'Job found' })
  @ApiNotFoundResponse({ description: 'Job not found' })
  findOne(@Param('id') id: string) {
    return this.jobsService.findOne(id);
  }

  @Patch(':id/status')
  @ApiOperation({
    summary:
      'Update job status with strict state machine validation and atomic concurrency control',
  })
  @ApiOkResponse({ description: 'Job status updated successfully' })
  @ApiConflictResponse({
    description: 'Concurrency race condition or invalid state transition',
  })
  @ApiNotFoundResponse({ description: 'Job not found' })
  updateStatus(
    @Param('id') id: string,
    @Body() updateDto: UpdateJobStatusDto,
  ) {
    return this.jobsService.updateStatus(id, updateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a job by ID' })
  @ApiOkResponse({ description: 'Job deleted successfully' })
  @ApiNotFoundResponse({ description: 'Job not found' })
  delete(@Param('id') id: string) {
    return this.jobsService.delete(id);
  }

  @Post(':id/simulate-race')
  @ApiOperation({
    summary:
      'Simulate two browser tabs trying to transition a pending job to running at the exact same moment',
  })
  simulateRaceCondition(@Param('id') id: string) {
    return this.jobsService.simulateRaceCondition(id);
  }
}
