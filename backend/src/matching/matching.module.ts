import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { PlannedRoute } from '../routes/planned-route.entity';
import { ShippingRequest } from '../shipping-requests/shipping-request.entity';
import { MatchingController } from './matching.controller';
import { MatchingService } from './matching.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([PlannedRoute, ShippingRequest]),
    AuthModule,
  ],
  controllers: [MatchingController],
  providers: [MatchingService],
  exports: [MatchingService],
})
export class MatchingModule {}
