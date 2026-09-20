import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class HealthService {
  constructor(private readonly dataSource: DataSource) {}

  getApplicationStatus() {
    return {
      status: 'ok',
      service: 'ecoruta-api',
      version: 'v7',
      timestamp: new Date().toISOString(),
    };
  }

  async getDatabaseStatus() {
    const result = await this.dataSource.query<Array<{ now: Date }>>(
      'SELECT NOW() AS now',
    );

    return {
      status: 'ok',
      database: 'postgresql',
      connected: true,
      timestamp: result[0]?.now ?? new Date().toISOString(),
    };
  }
}
