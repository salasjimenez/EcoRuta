import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'company_profiles' })
export class CompanyProfile {
  @PrimaryColumn({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({ name: 'company_name', type: 'varchar', length: 160, nullable: true })
  companyName: string | null;

  @Column({ name: 'tax_id', type: 'varchar', length: 30, nullable: true })
  taxId: string | null;

  @Column({ name: 'phone_number', type: 'varchar', length: 30, nullable: true })
  phoneNumber: string | null;

  @Column({ name: 'base_city', type: 'varchar', length: 120, nullable: true })
  baseCity: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
