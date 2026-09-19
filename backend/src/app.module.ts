import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { validateEnvironment } from './configuration';
import { buildDatabaseOptions } from './database/database.config';
import { HealthModule } from './health/health.module';
import { ProfilesModule } from './profiles/profiles.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      validate: validateEnvironment,
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: buildDatabaseOptions,
    }),
    HealthModule,
    AuthModule,
    ProfilesModule,
  ],
})
export class AppModule {}
