import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { CargoType } from '../vehicles/cargo-type.enum';
import { ShippingRequestStatus } from './shipping-request-status.enum';

@Entity({ name: 'shipping_requests' })
@Index('IDX_shipping_requests_company_id', ['companyId'])
@Index('IDX_shipping_requests_status', ['status'])
@Index('IDX_shipping_requests_pickup_window_start', ['pickupWindowStart'])
@Index('IDX_shipping_requests_origin_destination', [
  'originCity',
  'destinationCity',
])
export class ShippingRequest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'company_id', type: 'uuid' })
  companyId: string;

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

  @Column({ name: 'pickup_window_start', type: 'timestamptz' })
  pickupWindowStart: Date;

  @Column({ name: 'pickup_window_end', type: 'timestamptz' })
  pickupWindowEnd: Date;

  @Column({ name: 'delivery_window_start', type: 'timestamptz' })
  deliveryWindowStart: Date;

  @Column({ name: 'delivery_window_end', type: 'timestamptz' })
  deliveryWindowEnd: Date;

  @Column({
    name: 'cargo_type',
    type: 'enum',
    enum: CargoType,
    enumName: 'cargo_type_enum',
  })
  cargoType: CargoType;

  @Column({ name: 'cargo_description', type: 'varchar', length: 300 })
  cargoDescription: string;

  @Column({ name: 'weight_kg', type: 'double precision' })
  weightKg: number;

  @Column({ name: 'volume_m3', type: 'double precision' })
  volumeM3: number;

  @Column({ name: 'package_length_cm', type: 'double precision', nullable: true })
  packageLengthCm: number | null;

  @Column({ name: 'package_width_cm', type: 'double precision', nullable: true })
  packageWidthCm: number | null;

  @Column({ name: 'package_height_cm', type: 'double precision', nullable: true })
  packageHeightCm: number | null;

  @Column({ name: 'special_requirements', type: 'varchar', length: 500, nullable: true })
  specialRequirements: string | null;

  @Column({
    type: 'enum',
    enum: ShippingRequestStatus,
    enumName: 'shipping_request_status_enum',
    default: ShippingRequestStatus.OPEN,
  })
  status: ShippingRequestStatus;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
