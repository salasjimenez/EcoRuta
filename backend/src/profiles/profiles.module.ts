import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { AdminProfile } from './admin-profile.entity';
import { CompanyProfile } from './company-profile.entity';
import { ProfilesController } from './profiles.controller';
import { ProfilesService } from './profiles.service';
import { TransporterProfile } from './transporter-profile.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      TransporterProfile,
      CompanyProfile,
      AdminProfile,
    ]),
    AuthModule,
  ],
  controllers: [ProfilesController],
  providers: [ProfilesService],
})
export class ProfilesModule {}
