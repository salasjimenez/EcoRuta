import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CargoType } from '../vehicles/cargo-type.enum';
import { Vehicle } from '../vehicles/vehicle.entity';
import { CreatePlannedRouteDto } from './dto/create-planned-route.dto';
import { RouteCapacityDto } from './dto/route-capacity.dto';
import { UpdatePlannedRouteDto } from './dto/update-planned-route.dto';
import { UpdateRouteCapacityDto } from './dto/update-route-capacity.dto';
import { PlannedRoute } from './planned-route.entity';
import { RouteStatus } from './route-status.enum';

type CapacityValues = {
  offeredWeightKg: number;
  reservedWeightKg: number;
  offeredVolumeM3: number;
  reservedVolumeM3: number;
  acceptedCargoTypes: CargoType[];
  maxPackageLengthCm: number | null;
  maxPackageWidthCm: number | null;
  maxPackageHeightCm: number | null;
  capacityNotes: string | null;
};

@Injectable()
export class RoutesService {
  constructor(
    @InjectRepository(PlannedRoute)
    private readonly routes: Repository<PlannedRoute>,
    @InjectRepository(Vehicle)
    private readonly vehicles: Repository<Vehicle>,
  ) {}

  async create(ownerId: string, dto: CreatePlannedRouteDto) {
    const vehicle = await this.requireAvailableOwnedVehicle(
      ownerId,
      dto.vehicleId,
    );

    this.validateSchedule(dto.departureAt, dto.estimatedArrivalAt);
    this.validateDifferentPoints(
      dto.originLatitude,
      dto.originLongitude,
      dto.destinationLatitude,
      dto.destinationLongitude,
    );

    const capacity = this.capacityFromCreateDto(dto.capacity);
    this.validateCapacity(vehicle, capacity, true);

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
      ...capacity,
      status: RouteStatus.PLANNED,
      notes: dto.notes || null,
    });

    const saved = await this.routes.save(route);
    return this.findOne(ownerId, saved.id);
  }

  async findAll(ownerId: string) {
    const routes = await this.routes.find({
      where: { ownerId },
      relations: { vehicle: true },
      order: { departureAt: 'ASC' },
    });

    return routes.map((route) => this.presentRoute(route));
  }

  async findOne(ownerId: string, routeId: string) {
    const route = await this.findOwnedRouteEntity(ownerId, routeId);
    return this.presentRoute(route);
  }

  async getCapacity(ownerId: string, routeId: string) {
    const route = await this.findOwnedRouteEntity(ownerId, routeId);
    return this.presentCapacity(route);
  }

  async updateCapacity(
    ownerId: string,
    routeId: string,
    dto: UpdateRouteCapacityDto,
  ) {
    const route = await this.findOwnedRouteEntity(ownerId, routeId);

    if (route.status !== RouteStatus.PLANNED) {
      throw new ConflictException(
        'La capacidad solo puede modificarse mientras la ruta este planificada',
      );
    }

    const nextCapacity: CapacityValues = {
      offeredWeightKg: dto.offeredWeightKg ?? route.offeredWeightKg,
      reservedWeightKg: route.reservedWeightKg,
      offeredVolumeM3: dto.offeredVolumeM3 ?? route.offeredVolumeM3,
      reservedVolumeM3: route.reservedVolumeM3,
      acceptedCargoTypes:
        dto.acceptedCargoTypes ?? route.acceptedCargoTypes ?? [],
      maxPackageLengthCm:
        dto.maxPackageLengthCm ?? route.maxPackageLengthCm,
      maxPackageWidthCm: dto.maxPackageWidthCm ?? route.maxPackageWidthCm,
      maxPackageHeightCm:
        dto.maxPackageHeightCm ?? route.maxPackageHeightCm,
      capacityNotes:
        dto.notes !== undefined
          ? typeof dto.notes === 'string'
            ? dto.notes.trim() || null
            : null
          : route.capacityNotes,
    };

    this.validateCapacity(route.vehicle, nextCapacity, false);

    route.offeredWeightKg = nextCapacity.offeredWeightKg;
    route.offeredVolumeM3 = nextCapacity.offeredVolumeM3;
    route.acceptedCargoTypes = nextCapacity.acceptedCargoTypes;
    route.maxPackageLengthCm = nextCapacity.maxPackageLengthCm;
    route.maxPackageWidthCm = nextCapacity.maxPackageWidthCm;
    route.maxPackageHeightCm = nextCapacity.maxPackageHeightCm;
    route.capacityNotes = nextCapacity.capacityNotes;

    await this.routes.save(route);
    return this.getCapacity(ownerId, routeId);
  }

  async update(ownerId: string, routeId: string, dto: UpdatePlannedRouteDto) {
    const route = await this.findOwnedRouteEntity(ownerId, routeId);

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
      const vehicle = await this.requireAvailableOwnedVehicle(
        ownerId,
        dto.vehicleId,
      );
      this.validateCapacity(vehicle, this.capacityFromRoute(route), false);
      route.vehicle = vehicle;
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
    const route = await this.findOwnedRouteEntity(ownerId, routeId);

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

  private async findOwnedRouteEntity(ownerId: string, routeId: string) {
    const route = await this.routes.findOne({
      where: { id: routeId, ownerId },
      relations: { vehicle: true },
    });

    if (!route) {
      throw new NotFoundException('Ruta planificada no encontrada');
    }

    return route;
  }

  private async requireAvailableOwnedVehicle(
    ownerId: string,
    vehicleId: string,
  ) {
    const vehicle = await this.vehicles.findOne({
      where: { id: vehicleId, ownerId },
    });

    if (!vehicle) {
      throw new NotFoundException('Vehiculo no encontrado');
    }

    if (!vehicle.isAvailable) {
      throw new ConflictException(
        'El vehiculo seleccionado no esta disponible',
      );
    }

    return vehicle;
  }

  private capacityFromCreateDto(dto: RouteCapacityDto): CapacityValues {
    return {
      offeredWeightKg: dto.offeredWeightKg,
      reservedWeightKg: 0,
      offeredVolumeM3: dto.offeredVolumeM3,
      reservedVolumeM3: 0,
      acceptedCargoTypes: dto.acceptedCargoTypes,
      maxPackageLengthCm: dto.maxPackageLengthCm ?? null,
      maxPackageWidthCm: dto.maxPackageWidthCm ?? null,
      maxPackageHeightCm: dto.maxPackageHeightCm ?? null,
      capacityNotes: dto.notes?.trim() || null,
    };
  }

  private capacityFromRoute(route: PlannedRoute): CapacityValues {
    return {
      offeredWeightKg: route.offeredWeightKg,
      reservedWeightKg: route.reservedWeightKg,
      offeredVolumeM3: route.offeredVolumeM3,
      reservedVolumeM3: route.reservedVolumeM3,
      acceptedCargoTypes: route.acceptedCargoTypes ?? [],
      maxPackageLengthCm: route.maxPackageLengthCm,
      maxPackageWidthCm: route.maxPackageWidthCm,
      maxPackageHeightCm: route.maxPackageHeightCm,
      capacityNotes: route.capacityNotes,
    };
  }

  private validateCapacity(
    vehicle: Vehicle,
    capacity: CapacityValues,
    requirePublishedCapacity: boolean,
  ) {
    const hasPublishedCapacity =
      capacity.offeredWeightKg > 0 || capacity.offeredVolumeM3 > 0;

    if (requirePublishedCapacity && !hasPublishedCapacity) {
      throw new BadRequestException(
        'La ruta debe ofrecer capacidad por peso, volumen o ambos',
      );
    }

    if (capacity.offeredWeightKg > vehicle.maxWeightKg) {
      throw new BadRequestException(
        'La capacidad ofrecida en kg supera la capacidad maxima del vehiculo',
      );
    }

    if (capacity.offeredVolumeM3 > vehicle.maxVolumeM3) {
      throw new BadRequestException(
        'La capacidad ofrecida en m3 supera la capacidad maxima del vehiculo',
      );
    }

    if (capacity.reservedWeightKg > capacity.offeredWeightKg) {
      throw new ConflictException(
        'La capacidad ofrecida en kg no puede ser menor que la ya reservada',
      );
    }

    if (capacity.reservedVolumeM3 > capacity.offeredVolumeM3) {
      throw new ConflictException(
        'La capacidad ofrecida en m3 no puede ser menor que la ya reservada',
      );
    }

    if (hasPublishedCapacity && capacity.acceptedCargoTypes.length === 0) {
      throw new BadRequestException(
        'Debes indicar al menos un tipo de carga aceptado para la ruta',
      );
    }

    const unsupportedCargoTypes = capacity.acceptedCargoTypes.filter(
      (cargoType) => !vehicle.cargoTypes.includes(cargoType),
    );

    if (unsupportedCargoTypes.length > 0) {
      throw new BadRequestException(
        `El vehiculo no admite estos tipos de carga: ${unsupportedCargoTypes.join(', ')}`,
      );
    }

    const dimensions = [
      capacity.maxPackageLengthCm,
      capacity.maxPackageWidthCm,
      capacity.maxPackageHeightCm,
    ];
    const suppliedDimensions = dimensions.filter((value) => value !== null);

    if (suppliedDimensions.length > 0 && suppliedDimensions.length < 3) {
      throw new BadRequestException(
        'Las dimensiones maximas deben incluir largo, ancho y alto',
      );
    }
  }

  private presentRoute(route: PlannedRoute) {
    const {
      offeredWeightKg,
      reservedWeightKg,
      offeredVolumeM3,
      reservedVolumeM3,
      acceptedCargoTypes,
      maxPackageLengthCm,
      maxPackageWidthCm,
      maxPackageHeightCm,
      capacityNotes,
      ...routeData
    } = route;

    return {
      ...routeData,
      capacity: this.presentCapacityValues({
        offeredWeightKg,
        reservedWeightKg,
        offeredVolumeM3,
        reservedVolumeM3,
        acceptedCargoTypes: acceptedCargoTypes ?? [],
        maxPackageLengthCm,
        maxPackageWidthCm,
        maxPackageHeightCm,
        capacityNotes,
      }),
    };
  }

  private presentCapacity(route: PlannedRoute) {
    return {
      routeId: route.id,
      vehicleId: route.vehicleId,
      status: route.status,
      ...this.presentCapacityValues(this.capacityFromRoute(route)),
    };
  }

  private presentCapacityValues(capacity: CapacityValues) {
    return {
      configured:
        capacity.offeredWeightKg > 0 || capacity.offeredVolumeM3 > 0,
      offeredWeightKg: capacity.offeredWeightKg,
      reservedWeightKg: capacity.reservedWeightKg,
      remainingWeightKg: Math.max(
        0,
        capacity.offeredWeightKg - capacity.reservedWeightKg,
      ),
      offeredVolumeM3: capacity.offeredVolumeM3,
      reservedVolumeM3: capacity.reservedVolumeM3,
      remainingVolumeM3: Math.max(
        0,
        capacity.offeredVolumeM3 - capacity.reservedVolumeM3,
      ),
      acceptedCargoTypes: capacity.acceptedCargoTypes,
      maxPackageDimensionsCm:
        capacity.maxPackageLengthCm !== null &&
        capacity.maxPackageWidthCm !== null &&
        capacity.maxPackageHeightCm !== null
          ? {
              length: capacity.maxPackageLengthCm,
              width: capacity.maxPackageWidthCm,
              height: capacity.maxPackageHeightCm,
            }
          : null,
      notes: capacity.capacityNotes,
    };
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
