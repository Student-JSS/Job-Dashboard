import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getInfo() {
    return {
      status: 'ok',
      service: 'Mini Job Queue Dashboard API',
      version: '1.0.0',
      documentation: '/api/docs',
      timestamp: new Date().toISOString(),
    };
  }
}
