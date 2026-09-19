import {
  Body,
  Controller,
  Get,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { AuthUser } from '../auth/types/auth-user.type';
import { UserRole } from '../users/user-role.enum';
import { UpdateAdminProfileDto } from './dto/update-admin-profile.dto';
import { UpdateCompanyProfileDto } from './dto/update-company-profile.dto';
import { UpdateTransporterProfileDto } from './dto/update-transporter-profile.dto';
import { ProfilesService } from './profiles.service';

@Controller('profiles')
export class ProfilesController {
  constructor(private readonly profilesService: ProfilesService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  getOwnProfile(@CurrentUser() user: AuthUser) {
    return this.profilesService.getOwnProfile(user);
  }

  @Patch('me/transporter')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.TRANSPORTER)
  updateTransporter(
    @CurrentUser() user: AuthUser,
    @Body() dto: UpdateTransporterProfileDto,
  ) {
    return this.profilesService.updateTransporter(user.id, dto);
  }

  @Patch('me/company')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.COMPANY)
  updateCompany(
    @CurrentUser() user: AuthUser,
    @Body() dto: UpdateCompanyProfileDto,
  ) {
    return this.profilesService.updateCompany(user.id, dto);
  }

  @Patch('me/admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  updateAdmin(
    @CurrentUser() user: AuthUser,
    @Body() dto: UpdateAdminProfileDto,
  ) {
    return this.profilesService.updateAdmin(user.id, dto);
  }
}
