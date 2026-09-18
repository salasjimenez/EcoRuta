import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

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

  create(input: Pick<User, 'fullName' | 'email' | 'passwordHash'>) {
    const user = this.usersRepository.create(input);
    return this.usersRepository.save(user);
  }
}
