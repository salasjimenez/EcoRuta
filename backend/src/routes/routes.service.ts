import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vehicle } from '../vehicles/vehicle.entity';
import { CreatePlannedRouteDto } from './dto/create-planned-route.dto';
import { UpdatePlannedRouteDto } from './dto/update-planned-route.dto';
import { PlannedRoute } from './planned-route.entity';
import { RouteStatus } from './route-status.enum';

@Injectable()
export class RoutesService {
  constructor(
    @InjectRepository(PlannedRoute)
    private readonly routes: Repository<PlannedRoute>,
    @InjectRepository(Vehicle)
    private readonly vehicles: Repository<Vehicle>,
  ) {}

  async create(ownerId: string, dto: CreatePlannedRouteDto) {
    await this.requireAvailableOwnedVehicle(ownerId, dto.vehicleId);
    this.validateSchedule(dto.departureAt, dto.estimatedArrivalAt);
    this.validateDifferentPoints(
      dto.originLatitude,
      dto.originLongitude,
      dto.destinationLatitude,
      dto.destinationLongitude,
    );

    const route = this.routes.create({
      ownerId,
      vehicleId: dto.vehicleId,
      originCity: dto.originCity,
      originAddress: dto.originAddress || null,
      originLatitude: dto.originLatitude,
      originLongitude: dto.originLongitude,
      destinationCity: dto.destinationCity,
      destinationAddress: dto.destinationAddress || null,
      destinationLatitude: dto.destinationLatitude,
      destinationLongitude: dto.destinationLongitude,
      departureAt: new Date(dto.departureAt),
      estimatedArrivalAt: new Date(dto.estimatedArrivalAt),
      estimatedDistanceKm: dto.estimatedDistanceKm,
      status: RouteStatus.PLANNED,
      notes: dto.notes || null,
    });

    const saved = await this.routes.save(route);
    return this.findOne(ownerId, saved.id);
  }

  findAll(ownerId: string) {
    return this.routes.find({
      where: { ownerId },
      relations: { vehicle: true },
      order: { departureAt: 'ASC' },
    });
  }

  async findOne(ownerId: string, routeId: string) {
    const route = await this.routes.findOne({
      where: { id: routeId, ownerId },
      relations: { vehicle: true },
    });

    if (!route) {
      throw new NotFoundException('Ruta planificada no encontrada');
    }

    return route;
  }

  async update(ownerId: string, routeId: string, dto: UpdatePlannedRouteDto) {
    const route = await this.findOne(ownerId, routeId);

    if (dto.status !== undefined) {
      this.validateStatusTransition(route.status, dto.status);
    }

    if (route.status !== RouteStatus.PLANNED) {
      const changesPlanningData =
        dto.vehicleId !== undefined ||
        dto.originCity !== undefined ||
        dto.originAddress !== undefined ||
        dto.originLatitude !== undefined ||
        dto.originLongitude !== undefined ||
        dto.destinationCity !== undefined ||
        dto.destinationAddress !== undefined ||
        dto.destinationLatitude !== undefined ||
        dto.destinationLongitude !== undefined ||
        dto.departureAt !== undefined ||
        dto.estimatedArrivalAt !== undefined ||
        dto.estimatedDistanceKm !== undefined;

      if (changesPlanningData) {
        throw new ConflictException(
          'Solo las rutas planificadas pueden modificar sus datos de recorrido',
        );
      }
    }

    if (dto.vehicleId !== undefined && dto.vehicleId !== route.vehicleId) {
      await this.requireAvailableOwnedVehicle(ownerId, dto.vehicleId);
    }

    const departureAt = dto.departureAt
      ? new Date(dto.departureAt)
      : route.departureAt;
    const estimatedArrivalAt = dto.estimatedArrivalAt
      ? new Date(dto.estimatedArrivalAt)
      : route.estimatedArrivalAt;

    this.validateSchedule(departureAt, estimatedArrivalAt);

    const originLatitude = dto.originLatitude ?? route.originLatitude;
    const originLongitude = dto.originLongitude ?? route.originLongitude;
    const destinationLatitude =
      dto.destinationLatitude ?? route.destinationLatitude;
    const destinationLongitude =
      dto.destinationLongitude ?? route.destinationLongitude;

    this.validateDifferentPoints(
      originLatitude,
      originLongitude,
      destinationLatitude,
      destinationLongitude,
    );

    if (dto.vehicleId !== undefined) route.vehicleId = dto.vehicleId;
    if (dto.originCity !== undefined) route.originCity = dto.originCity;
    if (dto.originAddress !== undefined) {
      route.originAddress = dto.originAddress || null;
    }
    if (dto.originLatitude !== undefined) {
      route.originLatitude = dto.originLatitude;
    }
    if (dto.originLongitude !== undefined) {
      route.originLongitude = dto.originLongitude;
    }
    if (dto.destinationCity !== undefined) {
      route.destinationCity = dto.destinationCity;
    }
    if (dto.destinationAddress !== undefined) {
      route.destinationAddress = dto.destinationAddress || null;
    }
    if (dto.destinationLatitude !== undefined) {
      route.destinationLatitude = dto.destinationLatitude;
    }
    if (dto.destinationLongitude !== undefined) {
      route.destinationLongitude = dto.destinationLongitude;
    }
    if (dto.departureAt !== undefined) route.departureAt = departureAt;
    if (dto.estimatedArrivalAt !== undefined) {
      route.estimatedArrivalAt = estimatedArrivalAt;
    }
    if (dto.estimatedDistanceKm !== undefined) {
      route.estimatedDistanceKm = dto.estimatedDistanceKm;
    }
    if (dto.status !== undefined) route.status = dto.status;
    if (dto.notes !== undefined) route.notes = dto.notes || null;

    await this.routes.save(route);
    return this.findOne(ownerId, routeId);
  }

  async remove(ownerId: string, routeId: string) {
    const route = await this.findOne(ownerId, routeId);

    if (
      route.status !== RouteStatus.PLANNED &&
      route.status !== RouteStatus.CANCELLED
    ) {
      throw new ConflictException(
        'Solo se pueden eliminar rutas planificadas o canceladas',
      );
    }

    await this.routes.remove(route);

    return {
      id: routeId,
      deleted: true,
    };
  }

  private async requireAvailableOwnedVehicle(ownerId: string, vehicleId: string) {
    const vehicle = await this.vehicles.findOne({
      where: { id: vehicleId, ownerId },
    });

    if (!vehicle) {
      throw new NotFoundException('Vehiculo no encontrado');
    }

    if (!vehicle.isAvailable) {
      throw new ConflictException('El vehiculo seleccionado no esta disponible');
    }

    return vehicle;
  }

  private validateSchedule(departure: string | Date, arrival: string | Date) {
    const departureAt =
      departure instanceof Date ? departure : new Date(departure);
    const arrivalAt = arrival instanceof Date ? arrival : new Date(arrival);

    if (arrivalAt.getTime() <= departureAt.getTime()) {
      throw new BadRequestException(
        'La llegada estimada debe ser posterior a la salida',
      );
    }
  }

  private validateDifferentPoints(
    originLatitude: number,
    originLongitude: number,
    destinationLatitude: number,
    destinationLongitude: number,
  ) {
    if (
      originLatitude === destinationLatitude &&
      originLongitude === destinationLongitude
    ) {
      throw new BadRequestException(
        'El origen y el destino deben ser puntos diferentes',
      );
    }
  }

  private validateStatusTransition(current: RouteStatus, next: RouteStatus) {
    if (current === next) {
      return;
    }

    const allowed: Record<RouteStatus, RouteStatus[]> = {
      [RouteStatus.PLANNED]: [RouteStatus.IN_PROGRESS, RouteStatus.CANCELLED],
      [RouteStatus.IN_PROGRESS]: [RouteStatus.COMPLETED, RouteStatus.CANCELLED],
      [RouteStatus.COMPLETED]: [],
      [RouteStatus.CANCELLED]: [],
    };

    if (!allowed[current].includes(next)) {
      throw new ConflictException(
        `No se puede cambiar una ruta de ${current} a ${next}`,
      );
    }
  }
}
