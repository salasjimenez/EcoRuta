import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { Vehicle } from '../vehicles/vehicle.entity';
import { PlannedRoute } from './planned-route.entity';
import { RoutesController } from './routes.controller';
import { RoutesService } from './routes.service';

@Module({
  imports: [TypeOrmModule.forFeature([PlannedRoute, Vehicle]), AuthModule],
  controllers: [RoutesController],
  providers: [RoutesService],
})
export class RoutesModule {}
