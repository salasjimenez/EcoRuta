import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { CargoType } from './cargo-type.enum';
import { VehicleType } from './vehicle-type.enum';

@Entity({ name: 'vehicles' })
@Index('IDX_vehicles_owner_id', ['ownerId'])
export class Vehicle {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'owner_id', type: 'uuid' })
  ownerId: string;

  @Column({ name: 'plate_number', type: 'varchar', length: 20, unique: true })
  plateNumber: string;

  @Column({ type: 'varchar', length: 80 })
  make: string;

  @Column({ type: 'varchar', length: 80 })
  model: string;

  @Column({ type: 'smallint' })
  year: number;

  @Column({
    name: 'vehicle_type',
    type: 'enum',
    enum: VehicleType,
    enumName: 'vehicle_type_enum',
  })
  vehicleType: VehicleType;

  @Column({ name: 'max_weight_kg', type: 'double precision' })
  maxWeightKg: number;

  @Column({ name: 'max_volume_m3', type: 'double precision' })
  maxVolumeM3: number;

  @Column({
    name: 'cargo_types',
    type: 'enum',
    enum: CargoType,
    enumName: 'cargo_type_enum',
    array: true,
  })
  cargoTypes: CargoType[];

  @Column({ name: 'is_available', type: 'boolean', default: true })
  isAvailable: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
