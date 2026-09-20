import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { ShippingRequest } from './shipping-request.entity';
import { ShippingRequestsController } from './shipping-requests.controller';
import { ShippingRequestsService } from './shipping-requests.service';

@Module({
  imports: [TypeOrmModule.forFeature([ShippingRequest]), AuthModule],
  controllers: [ShippingRequestsController],
  providers: [ShippingRequestsService],
  exports: [ShippingRequestsService],
})
export class ShippingRequestsModule {}
