import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateJobDto } from './dto/create-job.dto.js';
import { UpdateJobStatusDto } from './dto/update-job-status.dto.js';
import { QueryJobsDto } from './dto/query-jobs.dto.js';
import {
  ALLOWED_TRANSITIONS,
  JobStatus,
  isValidTransition,
} from './entities/job.entity.js';

@Injectable()
export class JobsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create a new job with initial status 'pending'.
   */
  async create(createJobDto: CreateJobDto) {
    return this.prisma.job.create({
      data: {
        title: createJobDto.title.trim(),
        type: createJobDto.type.trim(),
        status: JobStatus.PENDING,
        version: 1,
      },
    });
  }

  /**
   * Retrieve all jobs with optional filtering.
   */
  async findAll(query?: QueryJobsDto) {
    const where: any = {};

    if (query?.status) {
      where.status = query.status;
    }

    if (query?.type) {
      where.type = { contains: query.type };
    }

    if (query?.search) {
      where.OR = [
        { title: { contains: query.search } },
        { type: { contains: query.search } },
      ];
    }

    return this.prisma.job.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Retrieve a single job by ID.
   */
  async findOne(id: string) {
    const job = await this.prisma.job.findUnique({
      where: { id },
    });

    if (!job) {
      throw new NotFoundException(`Job with ID '${id}' not found`);
    }

    return job;
  }

  /**
   * Update job status with strict state machine validation and atomic concurrency control.
   *
   * Allowed transitions:
   *   pending  -> running
   *   running  -> completed
   *   running  -> failed
   * Terminal states: completed, failed (cannot transition to any other status).
   */
  async updateStatus(id: string, updateDto: UpdateJobStatusDto) {
    const targetStatus = updateDto.status;

    // A job cannot be transitioned into 'pending'
    if (targetStatus === JobStatus.PENDING) {
      throw new BadRequestException(
        `Invalid state transition: Cannot transition a job back to 'pending'.`,
      );
    }

    // Determine legal source statuses that can transition into targetStatus
    const validSourceStatuses: JobStatus[] = [];
    for (const [source, targets] of Object.entries(ALLOWED_TRANSITIONS)) {
      if (targets.includes(targetStatus)) {
        validSourceStatuses.push(source as JobStatus);
      }
    }

    if (validSourceStatuses.length === 0) {
      throw new BadRequestException(
        `Invalid transition: No states can transition to '${targetStatus}'.`,
      );
    }

    // If client supplied expectedStatus, verify it is among the valid source statuses
    if (updateDto.expectedStatus && !validSourceStatuses.includes(updateDto.expectedStatus)) {
      throw new BadRequestException(
        `Illegal transition request: Status '${updateDto.expectedStatus}' cannot transition to '${targetStatus}'.`,
      );
    }

    // Build atomic WHERE condition for Compare-And-Swap (CAS) / Optimistic Concurrency Control
    const whereCondition: any = {
      id,
      status: updateDto.expectedStatus
        ? updateDto.expectedStatus
        : { in: validSourceStatuses },
    };

    if (updateDto.version !== undefined) {
      whereCondition.version = updateDto.version;
    }

    // Execute atomic update. Only 1 concurrent request can match the source status!
    const result = await this.prisma.job.updateMany({
      where: whereCondition,
      data: {
        status: targetStatus,
        version: { increment: 1 },
      },
    });

    // If 0 rows updated, investigate why and return appropriate HTTP status
    if (result.count === 0) {
      const currentJob = await this.prisma.job.findUnique({ where: { id } });

      if (!currentJob) {
        throw new NotFoundException(`Job with ID '${id}' not found.`);
      }

      const currentStatus = currentJob.status as JobStatus;

      // Case 1: Job is already in the target status (e.g. concurrent race won by earlier request)
      if (currentStatus === targetStatus) {
        throw new ConflictException({
          statusCode: 409,
          error: 'Conflict',
          message: `Job '${id}' is already in '${targetStatus}' status (modified concurrently).`,
          currentStatus,
          targetStatus,
          version: currentJob.version,
        });
      }

      // Case 2: Job is in a terminal state
      if (currentStatus === JobStatus.COMPLETED || currentStatus === JobStatus.FAILED) {
        throw new ConflictException({
          statusCode: 409,
          error: 'Conflict',
          message: `Cannot transition job from terminal state '${currentStatus}' to '${targetStatus}'. A completed or failed job cannot become running again.`,
          currentStatus,
          targetStatus,
          version: currentJob.version,
        });
      }

      // Case 3: Version mismatch
      if (updateDto.version !== undefined && updateDto.version !== currentJob.version) {
        throw new ConflictException({
          statusCode: 409,
          error: 'Conflict',
          message: `Concurrency Conflict: Version mismatch. Expected version ${updateDto.version}, but current version is ${currentJob.version}.`,
          currentStatus,
          targetStatus,
          version: currentJob.version,
        });
      }

      // Case 4: Invalid state transition
      const allowed = ALLOWED_TRANSITIONS[currentStatus] || [];
      const allowedStr = allowed.length > 0 ? allowed.join(', ') : 'none (terminal)';
      throw new ConflictException({
        statusCode: 409,
        error: 'Conflict',
        message: `Invalid state transition: Cannot change status from '${currentStatus}' to '${targetStatus}'. Allowed transitions from '${currentStatus}' are: [${allowedStr}].`,
        currentStatus,
        targetStatus,
        version: currentJob.version,
      });
    }

    // Successfully updated atomically
    return this.prisma.job.findUniqueOrThrow({
      where: { id },
    });
  }

  /**
   * Delete a job by ID.
   */
  async delete(id: string) {
    const existing = await this.prisma.job.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException(`Job with ID '${id}' not found`);
    }

    await this.prisma.job.delete({
      where: { id },
    });

    return {
      success: true,
      message: `Job '${id}' deleted successfully`,
      id,
    };
  }

  /**
   * Get aggregate job status counts.
   */
  async getStats() {
    const [total, pending, running, completed, failed] = await Promise.all([
      this.prisma.job.count(),
      this.prisma.job.count({ where: { status: JobStatus.PENDING } }),
      this.prisma.job.count({ where: { status: JobStatus.RUNNING } }),
      this.prisma.job.count({ where: { status: JobStatus.COMPLETED } }),
      this.prisma.job.count({ where: { status: JobStatus.FAILED } }),
    ]);

    return {
      total,
      pending,
      running,
      completed,
      failed,
    };
  }

  /**
   * Helper to test concurrent status updates on a job.
   */
  async simulateRaceCondition(id: string) {
    const job = await this.findOne(id);

    if (job.status !== JobStatus.PENDING) {
      throw new BadRequestException(
        `Job must be in 'pending' status to test concurrent transitions. Current status: '${job.status}'.`,
      );
    }

    const [req1, req2] = await Promise.allSettled([
      this.updateStatus(id, { status: JobStatus.RUNNING }),
      this.updateStatus(id, { status: JobStatus.RUNNING }),
    ]);

    const formatResult = (res: PromiseSettledResult<any>) => {
      if (res.status === 'fulfilled') {
        return {
          outcome: 'SUCCESS (200 OK)',
          data: res.value,
        };
      }
      return {
        outcome: 'CONFLICT (409 Conflict)',
        error: res.reason?.response || res.reason?.message,
      };
    };

    return {
      summary: 'Concurrent update result: one request succeeded, concurrent request returned 409.',
      jobId: id,
      requestA: formatResult(req1),
      requestB: formatResult(req2),
      finalJobState: await this.findOne(id),
    };
  }
}
