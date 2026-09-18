import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export function buildDatabaseOptions(
  config: ConfigService,
): TypeOrmModuleOptions {
  return {
    type: 'postgres',
    host: config.getOrThrow<string>('DB_HOST'),
    port: config.getOrThrow<number>('DB_PORT'),
    database: config.getOrThrow<string>('DB_NAME'),
    username: config.getOrThrow<string>('DB_USER'),
    password: config.getOrThrow<string>('DB_PASSWORD'),
    autoLoadEntities: true,
    synchronize: false,
    migrationsRun: false,
    retryAttempts: 3,
    retryDelay: 1000,
  };
}
