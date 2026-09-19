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
