import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateJobDto {
  @ApiProperty({
    example: 'Generate Monthly Sales Report',
    description: 'Human-readable title for the job',
  })
  @IsString()
  @IsNotEmpty({ message: 'Job title must not be empty' })
  @MaxLength(120, { message: 'Job title must not exceed 120 characters' })
  title: string;

  @ApiProperty({
    example: 'report_generation',
    description: 'Type/category of the job (e.g. email, report, export, backup)',
  })
  @IsString()
  @IsNotEmpty({ message: 'Job type must not be empty' })
  @MaxLength(60, { message: 'Job type must not exceed 60 characters' })
  type: string;
}
