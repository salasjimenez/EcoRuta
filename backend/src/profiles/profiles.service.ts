import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthUser } from '../auth/types/auth-user.type';
import { UserRole } from '../users/user-role.enum';
import { AdminProfile } from './admin-profile.entity';
import { CompanyProfile } from './company-profile.entity';
import { UpdateAdminProfileDto } from './dto/update-admin-profile.dto';
import { UpdateCompanyProfileDto } from './dto/update-company-profile.dto';
import { UpdateTransporterProfileDto } from './dto/update-transporter-profile.dto';
import { TransporterProfile } from './transporter-profile.entity';

@Injectable()
export class ProfilesService {
  constructor(
    @InjectRepository(TransporterProfile)
    private readonly transporterProfiles: Repository<TransporterProfile>,
    @InjectRepository(CompanyProfile)
    private readonly companyProfiles: Repository<CompanyProfile>,
    @InjectRepository(AdminProfile)
    private readonly adminProfiles: Repository<AdminProfile>,
  ) {}

  async getOwnProfile(user: AuthUser) {
    if (user.role === UserRole.TRANSPORTER) {
      const profile = await this.findOrCreateTransporter(user.id);
      return { user, profile };
    }

    if (user.role === UserRole.COMPANY) {
      const profile = await this.findOrCreateCompany(user.id);
      return { user, profile };
    }

    const profile = await this.findOrCreateAdmin(user.id);
    return { user, profile };
  }

  async updateTransporter(
    userId: string,
    dto: UpdateTransporterProfileDto,
  ) {
    const profile = await this.findOrCreateTransporter(userId);
    Object.assign(profile, dto);
    return this.transporterProfiles.save(profile);
  }

  async updateCompany(userId: string, dto: UpdateCompanyProfileDto) {
    const profile = await this.findOrCreateCompany(userId);
    Object.assign(profile, dto);
    return this.companyProfiles.save(profile);
  }

  async updateAdmin(userId: string, dto: UpdateAdminProfileDto) {
    const profile = await this.findOrCreateAdmin(userId);
    Object.assign(profile, dto);
    return this.adminProfiles.save(profile);
  }

  private async findOrCreateTransporter(userId: string) {
    const existing = await this.transporterProfiles.findOne({
      where: { userId },
    });

    if (existing) {
      return existing;
    }

    return this.transporterProfiles.save(
      this.transporterProfiles.create({ userId }),
    );
  }

  private async findOrCreateCompany(userId: string) {
    const existing = await this.companyProfiles.findOne({
      where: { userId },
    });

    if (existing) {
      return existing;
    }

    return this.companyProfiles.save(this.companyProfiles.create({ userId }));
  }

  private async findOrCreateAdmin(userId: string) {
    const existing = await this.adminProfiles.findOne({
      where: { userId },
    });

    if (existing) {
      return existing;
    }

    return this.adminProfiles.save(this.adminProfiles.create({ userId }));
  }
}
