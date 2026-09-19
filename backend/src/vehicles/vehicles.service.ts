import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { Vehicle } from './vehicle.entity';

type PostgresDriverError = {
  code?: string;
};

@Injectable()
export class VehiclesService {
  constructor(
    @InjectRepository(Vehicle)
    private readonly vehicles: Repository<Vehicle>,
  ) {}

  async create(ownerId: string, dto: CreateVehicleDto) {
    const vehicle = this.vehicles.create({
      ...dto,
      ownerId,
      plateNumber: this.normalizePlate(dto.plateNumber),
    });

    try {
      return await this.vehicles.save(vehicle);
    } catch (error) {
      this.handlePersistenceError(error);
      throw error;
    }
  }

  findAll(ownerId: string) {
    return this.vehicles.find({
      where: { ownerId },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(ownerId: string, vehicleId: string) {
    const vehicle = await this.vehicles.findOne({
      where: { id: vehicleId, ownerId },
    });

    if (!vehicle) {
      throw new NotFoundException('Vehiculo no encontrado');
    }

    return vehicle;
  }

  async update(ownerId: string, vehicleId: string, dto: UpdateVehicleDto) {
    const vehicle = await this.findOne(ownerId, vehicleId);

    if (dto.plateNumber !== undefined) {
      dto.plateNumber = this.normalizePlate(dto.plateNumber);
    }

    Object.assign(vehicle, dto);

    try {
      return await this.vehicles.save(vehicle);
    } catch (error) {
      this.handlePersistenceError(error);
      throw error;
    }
  }

  async remove(ownerId: string, vehicleId: string) {
    const vehicle = await this.findOne(ownerId, vehicleId);
    await this.vehicles.remove(vehicle);

    return {
      id: vehicleId,
      deleted: true,
    };
  }

  private normalizePlate(value: string) {
    return value.trim().toUpperCase().replace(/\s+/g, '');
  }

  private handlePersistenceError(error: unknown): void {
    if (!(error instanceof QueryFailedError)) {
      return;
    }

    const driverError = error.driverError as PostgresDriverError;

    if (driverError.code === '23505') {
      throw new ConflictException('Ya existe un vehiculo con esta placa');
    }
  }
}
