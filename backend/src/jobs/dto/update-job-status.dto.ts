import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional, Min } from 'class-validator';
import { JobStatus } from '../entities/job.entity.js';

export class UpdateJobStatusDto {
  @ApiProperty({
    enum: JobStatus,
    example: JobStatus.RUNNING,
    description: 'Target status to transition the job to',
  })
  @IsEnum(JobStatus, {
    message: 'Status must be one of: pending, running, completed, failed',
  })
  status: JobStatus;

  @ApiPropertyOptional({
    enum: JobStatus,
    description: 'Expected current status for optimistic concurrency verification',
  })
  @IsOptional()
  @IsEnum(JobStatus)
  expectedStatus?: JobStatus;

  @ApiPropertyOptional({
    type: Number,
    example: 1,
    description: 'Expected entity version for optimistic locking verification',
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  version?: number;
}
