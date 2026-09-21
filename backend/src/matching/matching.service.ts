import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PlannedRoute } from '../routes/planned-route.entity';
import { RouteStatus } from '../routes/route-status.enum';
import { ShippingRequest } from '../shipping-requests/shipping-request.entity';
import { ShippingRequestStatus } from '../shipping-requests/shipping-request-status.enum';
import { BasicMatchResult, MatchCriteria } from './types/match-result.type';

@Injectable()
export class MatchingService {
  constructor(
    @InjectRepository(PlannedRoute)
    private readonly routes: Repository<PlannedRoute>,
    @InjectRepository(ShippingRequest)
    private readonly requests: Repository<ShippingRequest>,
  ) {}

  async findRoutesForRequest(companyId: string, requestId: string) {
    const request = await this.requests.findOne({
      where: { id: requestId, companyId },
    });

    if (!request) {
      throw new NotFoundException('Solicitud de transporte no encontrada');
    }

    if (request.status !== ShippingRequestStatus.OPEN) {
      throw new ConflictException(
        'Solo las solicitudes abiertas pueden buscar rutas compatibles',
      );
    }

    const routes = await this.routes.find({
      where: { status: RouteStatus.PLANNED },
      relations: { vehicle: true },
      order: { departureAt: 'ASC' },
    });

    const matches = routes
      .map((route) => {
        const evaluation = this.evaluate(route, request);

        if (!this.isCompatible(evaluation.criteria)) {
          return null;
        }

        return {
          ...evaluation,
          route: this.presentRoute(route),
        };
      })
      .filter((match): match is NonNullable<typeof match> => match !== null)
      .sort(
        (a, b) =>
          b.score - a.score ||
          a.route.departureAt.getTime() - b.route.departureAt.getTime(),
      );

    return {
      criteriaVersion: 'basic-v1' as const,
      request: this.presentRequest(request),
      totalEvaluatedRoutes: routes.length,
      totalMatches: matches.length,
      matches,
    };
  }

  async findRequestsForRoute(ownerId: string, routeId: string) {
    const route = await this.routes.findOne({
      where: { id: routeId, ownerId },
      relations: { vehicle: true },
    });

    if (!route) {
      throw new NotFoundException('Ruta planificada no encontrada');
    }

    if (route.status !== RouteStatus.PLANNED) {
      throw new ConflictException(
        'Solo las rutas planificadas pueden buscar solicitudes compatibles',
      );
    }

    const requests = await this.requests.find({
      where: { status: ShippingRequestStatus.OPEN },
      order: { pickupWindowStart: 'ASC' },
    });

    const matches = requests
      .map((request) => {
        const evaluation = this.evaluate(route, request);

        if (!this.isCompatible(evaluation.criteria)) {
          return null;
        }

        return {
          ...evaluation,
          request: this.presentRequest(request),
        };
      })
      .filter((match): match is NonNullable<typeof match> => match !== null)
      .sort(
        (a, b) =>
          b.score - a.score ||
          a.request.pickupWindowStart.getTime() -
            b.request.pickupWindowStart.getTime(),
      );

    return {
      criteriaVersion: 'basic-v1' as const,
      route: this.presentRoute(route),
      totalEvaluatedRequests: requests.length,
      totalMatches: matches.length,
      matches,
    };
  }

  private evaluate(
    route: PlannedRoute,
    request: ShippingRequest,
  ): BasicMatchResult {
    const remainingWeightKg = Math.max(
      0,
      route.offeredWeightKg - route.reservedWeightKg,
    );
    const remainingVolumeM3 = Math.max(
      0,
      route.offeredVolumeM3 - route.reservedVolumeM3,
    );

    const criteria: MatchCriteria = {
      originCity:
        this.normalizeCity(route.originCity) ===
        this.normalizeCity(request.originCity),
      destinationCity:
        this.normalizeCity(route.destinationCity) ===
        this.normalizeCity(request.destinationCity),
      pickupWindow: this.isWithin(
        route.departureAt,
        request.pickupWindowStart,
        request.pickupWindowEnd,
      ),
      deliveryWindow: this.isWithin(
        route.estimatedArrivalAt,
        request.deliveryWindowStart,
        request.deliveryWindowEnd,
      ),
      weightCapacity: remainingWeightKg >= request.weightKg,
      volumeCapacity: remainingVolumeM3 >= request.volumeM3,
      cargoType: (route.acceptedCargoTypes ?? []).includes(request.cargoType),
    };

    const weightUtilizationPct = this.utilizationPercent(
      request.weightKg,
      remainingWeightKg,
    );
    const volumeUtilizationPct = this.utilizationPercent(
      request.volumeM3,
      remainingVolumeM3,
    );

    return {
      score: this.calculateScore(
        route,
        request,
        weightUtilizationPct,
        volumeUtilizationPct,
      ),
      criteriaVersion: 'basic-v1',
      criteria,
      capacity: {
        requestedWeightKg: request.weightKg,
        remainingWeightKg,
        requestedVolumeM3: request.volumeM3,
        remainingVolumeM3,
        weightUtilizationPct,
        volumeUtilizationPct,
      },
      cargoType: request.cargoType,
    };
  }

  private isCompatible(criteria: MatchCriteria) {
    return Object.values(criteria).every(Boolean);
  }

  private calculateScore(
    route: PlannedRoute,
    request: ShippingRequest,
    weightUtilizationPct: number,
    volumeUtilizationPct: number,
  ) {
    const capacityFit = (weightUtilizationPct + volumeUtilizationPct) / 2;
    const pickupFit = this.windowCloseness(
      route.departureAt,
      request.pickupWindowStart,
      request.pickupWindowEnd,
    );
    const deliveryFit = this.windowCloseness(
      route.estimatedArrivalAt,
      request.deliveryWindowStart,
      request.deliveryWindowEnd,
    );
    const scheduleFit = (pickupFit + deliveryFit) / 2;

    return this.round(50 + capacityFit * 0.25 + scheduleFit * 0.25);
  }

  private windowCloseness(date: Date, start: Date, end: Date) {
    const startMs = start.getTime();
    const endMs = end.getTime();
    const dateMs = date.getTime();
    const duration = endMs - startMs;

    if (duration <= 0 || dateMs < startMs || dateMs > endMs) {
      return 0;
    }

    const midpoint = startMs + duration / 2;
    const distanceFromMidpoint = Math.abs(dateMs - midpoint);
    const normalizedDistance = distanceFromMidpoint / (duration / 2);

    return Math.max(0, 100 - normalizedDistance * 100);
  }

  private utilizationPercent(requested: number, available: number) {
    if (available <= 0 || requested > available) {
      return 0;
    }

    return this.round((requested / available) * 100);
  }

  private isWithin(date: Date, start: Date, end: Date) {
    const time = date.getTime();
    return time >= start.getTime() && time <= end.getTime();
  }

  private normalizeCity(value: string) {
    return value
      .trim()
      .toLocaleLowerCase('es')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }

  private round(value: number) {
    return Math.round(value * 100) / 100;
  }

  private presentRoute(route: PlannedRoute) {
    const remainingWeightKg = Math.max(
      0,
      route.offeredWeightKg - route.reservedWeightKg,
    );
    const remainingVolumeM3 = Math.max(
      0,
      route.offeredVolumeM3 - route.reservedVolumeM3,
    );

    return {
      id: route.id,
      vehicle: {
        id: route.vehicle.id,
        make: route.vehicle.make,
        model: route.vehicle.model,
        vehicleType: route.vehicle.vehicleType,
      },
      originCity: route.originCity,
      destinationCity: route.destinationCity,
      departureAt: route.departureAt,
      estimatedArrivalAt: route.estimatedArrivalAt,
      estimatedDistanceKm: route.estimatedDistanceKm,
      remainingCapacity: {
        weightKg: remainingWeightKg,
        volumeM3: remainingVolumeM3,
      },
      acceptedCargoTypes: route.acceptedCargoTypes,
      status: route.status,
    };
  }

  private presentRequest(request: ShippingRequest) {
    return {
      id: request.id,
      originCity: request.originCity,
      destinationCity: request.destinationCity,
      pickupWindowStart: request.pickupWindowStart,
      pickupWindowEnd: request.pickupWindowEnd,
      deliveryWindowStart: request.deliveryWindowStart,
      deliveryWindowEnd: request.deliveryWindowEnd,
      cargoType: request.cargoType,
      cargoDescription: request.cargoDescription,
      weightKg: request.weightKg,
      volumeM3: request.volumeM3,
      status: request.status,
    };
  }
}
