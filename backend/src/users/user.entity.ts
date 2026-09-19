import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserRole } from './user-role.enum';

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'full_name', type: 'varchar', length: 120 })
  fullName: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({
    name: 'password_hash',
    type: 'varchar',
    length: 60,
    select: false,
  })
  passwordHash: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    enumName: 'user_role_enum',
    default: UserRole.TRANSPORTER,
  })
  role: UserRole;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
