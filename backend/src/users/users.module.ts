import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminProfile } from '../profiles/admin-profile.entity';
import { CompanyProfile } from '../profiles/company-profile.entity';
import { TransporterProfile } from '../profiles/transporter-profile.entity';
import { User } from './user.entity';
import { UsersService } from './users.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      TransporterProfile,
      CompanyProfile,
      AdminProfile,
    ]),
  ],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
