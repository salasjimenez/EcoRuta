import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { CargoType } from '../vehicles/cargo-type.enum';
import { Vehicle } from '../vehicles/vehicle.entity';
import { RouteStatus } from './route-status.enum';

@Entity({ name: 'planned_routes' })
@Index('IDX_planned_routes_owner_id', ['ownerId'])
@Index('IDX_planned_routes_vehicle_id', ['vehicleId'])
@Index('IDX_planned_routes_departure_at', ['departureAt'])
@Index('IDX_planned_routes_status', ['status'])
export class PlannedRoute {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'owner_id', type: 'uuid' })
  ownerId: string;

  @Column({ name: 'vehicle_id', type: 'uuid' })
  vehicleId: string;

  @ManyToOne(() => Vehicle, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'vehicle_id' })
  vehicle: Vehicle;

  @Column({ name: 'origin_city', type: 'varchar', length: 100 })
  originCity: string;

  @Column({ name: 'origin_address', type: 'varchar', length: 180, nullable: true })
  originAddress: string | null;

  @Column({ name: 'origin_latitude', type: 'double precision' })
  originLatitude: number;

  @Column({ name: 'origin_longitude', type: 'double precision' })
  originLongitude: number;

  @Column({ name: 'destination_city', type: 'varchar', length: 100 })
  destinationCity: string;

  @Column({ name: 'destination_address', type: 'varchar', length: 180, nullable: true })
  destinationAddress: string | null;

  @Column({ name: 'destination_latitude', type: 'double precision' })
  destinationLatitude: number;

  @Column({ name: 'destination_longitude', type: 'double precision' })
  destinationLongitude: number;

  @Column({ name: 'departure_at', type: 'timestamptz' })
  departureAt: Date;

  @Column({ name: 'estimated_arrival_at', type: 'timestamptz' })
  estimatedArrivalAt: Date;

  @Column({ name: 'estimated_distance_km', type: 'double precision' })
  estimatedDistanceKm: number;

  @Column({ name: 'offered_weight_kg', type: 'double precision', default: 0 })
  offeredWeightKg: number;

  @Column({ name: 'reserved_weight_kg', type: 'double precision', default: 0 })
  reservedWeightKg: number;

  @Column({ name: 'offered_volume_m3', type: 'double precision', default: 0 })
  offeredVolumeM3: number;

  @Column({ name: 'reserved_volume_m3', type: 'double precision', default: 0 })
  reservedVolumeM3: number;

  @Column({
    name: 'accepted_cargo_types',
    type: 'enum',
    enum: CargoType,
    enumName: 'cargo_type_enum',
    array: true,
    default: () => `ARRAY[]::"cargo_type_enum"[]`,
  })
  acceptedCargoTypes: CargoType[];

  @Column({ name: 'max_package_length_cm', type: 'double precision', nullable: true })
  maxPackageLengthCm: number | null;

  @Column({ name: 'max_package_width_cm', type: 'double precision', nullable: true })
  maxPackageWidthCm: number | null;

  @Column({ name: 'max_package_height_cm', type: 'double precision', nullable: true })
  maxPackageHeightCm: number | null;

  @Column({ name: 'capacity_notes', type: 'varchar', length: 300, nullable: true })
  capacityNotes: string | null;

  @Column({
    type: 'enum',
    enum: RouteStatus,
    enumName: 'route_status_enum',
    default: RouteStatus.PLANNED,
  })
  status: RouteStatus;

  @Column({ type: 'varchar', length: 500, nullable: true })
  notes: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
