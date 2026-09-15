import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module.js';
import { JobsModule } from './jobs/jobs.module.js';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';

@Module({
  imports: [PrismaModule, JobsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
