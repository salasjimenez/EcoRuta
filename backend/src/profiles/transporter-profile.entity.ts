import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'transporter_profiles' })
export class TransporterProfile {
  @PrimaryColumn({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({ name: 'phone_number', type: 'varchar', length: 30, nullable: true })
  phoneNumber: string | null;

  @Column({ name: 'base_city', type: 'varchar', length: 120, nullable: true })
  baseCity: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  bio: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
