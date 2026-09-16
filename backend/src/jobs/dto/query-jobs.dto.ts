import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { JobStatus } from '../entities/job.entity.js';

export class QueryJobsDto {
  @ApiPropertyOptional({
    enum: JobStatus,
    description: 'Filter jobs by status',
  })
  @IsOptional()
  @IsEnum(JobStatus)
  status?: JobStatus;

  @ApiPropertyOptional({
    type: String,
    description: 'Filter jobs by type',
  })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiPropertyOptional({
    type: String,
    description: 'Search in title or type',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  _t?: any;
}
