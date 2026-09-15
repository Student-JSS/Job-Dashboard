import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { describe, it, expect, beforeEach } from 'vitest';
import { JobsService } from './jobs.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { JobStatus } from './entities/job.entity.js';

describe('JobsService', () => {
  let service: JobsService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [JobsService, PrismaService],
    }).compile();

    service = module.get<JobsService>(JobsService);
    prisma = module.get<PrismaService>(PrismaService);

    // Clean up test database
    await prisma.job.deleteMany({});
  });

  it('should create a job with initial status "pending"', async () => {
    const job = await service.create({
      title: 'Process video export',
      type: 'video_processing',
    });

    expect(job).toBeDefined();
    expect(job.title).toBe('Process video export');
    expect(job.type).toBe('video_processing');
    expect(job.status).toBe(JobStatus.PENDING);
    expect(job.version).toBe(1);
    expect(job.id).toBeDefined();
    expect(job.createdAt).toBeInstanceOf(Date);
  });

  it('should allow valid transition from pending to running', async () => {
    const job = await service.create({
      title: 'Send newsletter',
      type: 'email',
    });

    const updated = await service.updateStatus(job.id, {
      status: JobStatus.RUNNING,
    });

    expect(updated.status).toBe(JobStatus.RUNNING);
    expect(updated.version).toBe(2);
  });

  it('should allow transition from running to completed', async () => {
    const job = await service.create({
      title: 'Data sync',
      type: 'sync',
    });

    await service.updateStatus(job.id, { status: JobStatus.RUNNING });
    const completed = await service.updateStatus(job.id, {
      status: JobStatus.COMPLETED,
    });

    expect(completed.status).toBe(JobStatus.COMPLETED);
    expect(completed.version).toBe(3);
  });

  it('should allow transition from running to failed', async () => {
    const job = await service.create({
      title: 'Payment settlement',
      type: 'billing',
    });

    await service.updateStatus(job.id, { status: JobStatus.RUNNING });
    const failed = await service.updateStatus(job.id, {
      status: JobStatus.FAILED,
    });

    expect(failed.status).toBe(JobStatus.FAILED);
  });

  it('should reject transition directly from pending to completed', async () => {
    const job = await service.create({
      title: 'Direct completion test',
      type: 'test',
    });

    await expect(
      service.updateStatus(job.id, { status: JobStatus.COMPLETED }),
    ).rejects.toThrow(ConflictException);
  });

  it('should reject transitioning a completed job back to running', async () => {
    const job = await service.create({
      title: 'Terminal test',
      type: 'test',
    });

    await service.updateStatus(job.id, { status: JobStatus.RUNNING });
    await service.updateStatus(job.id, { status: JobStatus.COMPLETED });

    await expect(
      service.updateStatus(job.id, { status: JobStatus.RUNNING }),
    ).rejects.toThrow(ConflictException);
  });

  it('should reject transitioning a failed job back to running', async () => {
    const job = await service.create({
      title: 'Failed terminal test',
      type: 'test',
    });

    await service.updateStatus(job.id, { status: JobStatus.RUNNING });
    await service.updateStatus(job.id, { status: JobStatus.FAILED });

    await expect(
      service.updateStatus(job.id, { status: JobStatus.RUNNING }),
    ).rejects.toThrow(ConflictException);
  });

  it('should reject transitioning any job to pending', async () => {
    const job = await service.create({
      title: 'Reset test',
      type: 'test',
    });

    await expect(
      service.updateStatus(job.id, { status: JobStatus.PENDING }),
    ).rejects.toThrow(BadRequestException);
  });

  it('should throw NotFoundException for non-existent job', async () => {
    await expect(
      service.updateStatus('non-existent-id', { status: JobStatus.RUNNING }),
    ).rejects.toThrow(NotFoundException);
  });

  it('should handle concurrent updates safely: only one succeeds and the other receives 409 Conflict', async () => {
    const job = await service.create({
      title: 'Concurrent race condition test',
      type: 'concurrency',
    });

    // Simulate two clients simultaneously trying to transition the same pending job to running
    const [res1, res2] = await Promise.allSettled([
      service.updateStatus(job.id, { status: JobStatus.RUNNING }),
      service.updateStatus(job.id, { status: JobStatus.RUNNING }),
    ]);

    const fulfilledCount = [res1, res2].filter((r) => r.status === 'fulfilled').length;
    const rejectedCount = [res1, res2].filter((r) => r.status === 'rejected').length;

    expect(fulfilledCount).toBe(1);
    expect(rejectedCount).toBe(1);

    const rejected = [res1, res2].find((r) => r.status === 'rejected') as PromiseRejectedResult;
    expect(rejected.reason).toBeInstanceOf(ConflictException);

    // Verify database state is running with version 2
    const finalJob = await service.findOne(job.id);
    expect(finalJob.status).toBe(JobStatus.RUNNING);
    expect(finalJob.version).toBe(2);
  });

  it('should compute status counts accurately', async () => {
    const j1 = await service.create({ title: 'J1', type: 't1' });
    const j2 = await service.create({ title: 'J2', type: 't2' });
    const j3 = await service.create({ title: 'J3', type: 't3' });
    const j4 = await service.create({ title: 'J4', type: 't4' });

    await service.updateStatus(j2.id, { status: JobStatus.RUNNING });
    await service.updateStatus(j3.id, { status: JobStatus.RUNNING });
    await service.updateStatus(j3.id, { status: JobStatus.COMPLETED });
    await service.updateStatus(j4.id, { status: JobStatus.RUNNING });
    await service.updateStatus(j4.id, { status: JobStatus.FAILED });

    const stats = await service.getStats();
    expect(stats.total).toBe(4);
    expect(stats.pending).toBe(1);
    expect(stats.running).toBe(1);
    expect(stats.completed).toBe(1);
    expect(stats.failed).toBe(1);
  });

  it('should delete a job', async () => {
    const job = await service.create({ title: 'To Delete', type: 'delete' });
    const delResult = await service.delete(job.id);
    expect(delResult.success).toBe(true);

    await expect(service.findOne(job.id)).rejects.toThrow(NotFoundException);
  });
});
