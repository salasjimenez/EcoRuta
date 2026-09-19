import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AdminProfile } from '../profiles/admin-profile.entity';
import { CompanyProfile } from '../profiles/company-profile.entity';
import { TransporterProfile } from '../profiles/transporter-profile.entity';
import { User } from './user.entity';
import { UserRole } from './user-role.enum';

type CreateUserInput = Pick<
  User,
  'fullName' | 'email' | 'passwordHash' | 'role'
>;

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  findByEmailWithPassword(email: string): Promise<User | null> {
    return this.usersRepository
      .createQueryBuilder('user')
      .addSelect('user.passwordHash')
      .where('user.email = :email', { email })
      .getOne();
  }

  findActiveById(id: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { id, isActive: true },
    });
  }

  create(input: CreateUserInput): Promise<User> {
    return this.usersRepository.manager.transaction(async (manager) => {
      const userRepository = manager.getRepository(User);
      const user = await userRepository.save(userRepository.create(input));

      if (user.role === UserRole.TRANSPORTER) {
        const profiles = manager.getRepository(TransporterProfile);
        await profiles.save(profiles.create({ userId: user.id }));
      }

      if (user.role === UserRole.COMPANY) {
        const profiles = manager.getRepository(CompanyProfile);
        await profiles.save(profiles.create({ userId: user.id }));
      }

      if (user.role === UserRole.ADMIN) {
        const profiles = manager.getRepository(AdminProfile);
        await profiles.save(profiles.create({ userId: user.id }));
      }

      return user;
    });
  }
}
