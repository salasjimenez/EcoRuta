import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateShippingRequestDto } from './dto/create-shipping-request.dto';
import { UpdateShippingRequestDto } from './dto/update-shipping-request.dto';
import { ShippingRequest } from './shipping-request.entity';
import { ShippingRequestStatus } from './shipping-request-status.enum';

@Injectable()
export class ShippingRequestsService {
  constructor(
    @InjectRepository(ShippingRequest)
    private readonly requests: Repository<ShippingRequest>,
  ) {}

  async create(companyId: string, dto: CreateShippingRequestDto) {
    const pickupWindowStart = new Date(dto.pickupWindowStart);
    const pickupWindowEnd = new Date(dto.pickupWindowEnd);
    const deliveryWindowStart = new Date(dto.deliveryWindowStart);
    const deliveryWindowEnd = new Date(dto.deliveryWindowEnd);

    this.validateWindows(
      pickupWindowStart,
      pickupWindowEnd,
      deliveryWindowStart,
      deliveryWindowEnd,
    );
    this.validateDifferentPoints(
      dto.originLatitude,
      dto.originLongitude,
      dto.destinationLatitude,
      dto.destinationLongitude,
    );
    this.validatePackageDimensions(
      dto.packageLengthCm,
      dto.packageWidthCm,
      dto.packageHeightCm,
    );

    const request = this.requests.create({
      companyId,
      originCity: dto.originCity,
      originAddress: dto.originAddress || null,
      originLatitude: dto.originLatitude,
      originLongitude: dto.originLongitude,
      destinationCity: dto.destinationCity,
      destinationAddress: dto.destinationAddress || null,
      destinationLatitude: dto.destinationLatitude,
      destinationLongitude: dto.destinationLongitude,
      pickupWindowStart,
      pickupWindowEnd,
      deliveryWindowStart,
      deliveryWindowEnd,
      cargoType: dto.cargoType,
      cargoDescription: dto.cargoDescription,
      weightKg: dto.weightKg,
      volumeM3: dto.volumeM3,
      packageLengthCm: dto.packageLengthCm ?? null,
      packageWidthCm: dto.packageWidthCm ?? null,
      packageHeightCm: dto.packageHeightCm ?? null,
      specialRequirements: dto.specialRequirements || null,
      status: ShippingRequestStatus.OPEN,
    });

    return this.requests.save(request);
  }

  findAll(companyId: string) {
    return this.requests.find({
      where: { companyId },
      order: { pickupWindowStart: 'ASC', createdAt: 'DESC' },
    });
  }

  async findOne(companyId: string, requestId: string) {
    return this.findOwnedRequest(companyId, requestId);
  }

  async update(
    companyId: string,
    requestId: string,
    dto: UpdateShippingRequestDto,
  ) {
    const request = await this.findOwnedRequest(companyId, requestId);

    if (request.status === ShippingRequestStatus.CANCELLED) {
      throw new ConflictException(
        'Una solicitud cancelada ya no puede modificarse',
      );
    }

    if (dto.status === ShippingRequestStatus.CANCELLED) {
      request.status = ShippingRequestStatus.CANCELLED;
    }

    const pickupWindowStart = dto.pickupWindowStart
      ? new Date(dto.pickupWindowStart)
      : request.pickupWindowStart;
    const pickupWindowEnd = dto.pickupWindowEnd
      ? new Date(dto.pickupWindowEnd)
      : request.pickupWindowEnd;
    const deliveryWindowStart = dto.deliveryWindowStart
      ? new Date(dto.deliveryWindowStart)
      : request.deliveryWindowStart;
    const deliveryWindowEnd = dto.deliveryWindowEnd
      ? new Date(dto.deliveryWindowEnd)
      : request.deliveryWindowEnd;

    this.validateWindows(
      pickupWindowStart,
      pickupWindowEnd,
      deliveryWindowStart,
      deliveryWindowEnd,
    );

    const originLatitude = dto.originLatitude ?? request.originLatitude;
    const originLongitude = dto.originLongitude ?? request.originLongitude;
    const destinationLatitude =
      dto.destinationLatitude ?? request.destinationLatitude;
    const destinationLongitude =
      dto.destinationLongitude ?? request.destinationLongitude;

    this.validateDifferentPoints(
      originLatitude,
      originLongitude,
      destinationLatitude,
      destinationLongitude,
    );

    const packageLengthCm =
      dto.packageLengthCm ?? request.packageLengthCm ?? undefined;
    const packageWidthCm =
      dto.packageWidthCm ?? request.packageWidthCm ?? undefined;
    const packageHeightCm =
      dto.packageHeightCm ?? request.packageHeightCm ?? undefined;

    this.validatePackageDimensions(
      packageLengthCm,
      packageWidthCm,
      packageHeightCm,
    );

    if (dto.originCity !== undefined) request.originCity = dto.originCity;
    if (dto.originAddress !== undefined) {
      request.originAddress = dto.originAddress || null;
    }
    if (dto.originLatitude !== undefined) {
      request.originLatitude = dto.originLatitude;
    }
    if (dto.originLongitude !== undefined) {
      request.originLongitude = dto.originLongitude;
    }
    if (dto.destinationCity !== undefined) {
      request.destinationCity = dto.destinationCity;
    }
    if (dto.destinationAddress !== undefined) {
      request.destinationAddress = dto.destinationAddress || null;
    }
    if (dto.destinationLatitude !== undefined) {
      request.destinationLatitude = dto.destinationLatitude;
    }
    if (dto.destinationLongitude !== undefined) {
      request.destinationLongitude = dto.destinationLongitude;
    }
    if (dto.pickupWindowStart !== undefined) {
      request.pickupWindowStart = pickupWindowStart;
    }
    if (dto.pickupWindowEnd !== undefined) {
      request.pickupWindowEnd = pickupWindowEnd;
    }
    if (dto.deliveryWindowStart !== undefined) {
      request.deliveryWindowStart = deliveryWindowStart;
    }
    if (dto.deliveryWindowEnd !== undefined) {
      request.deliveryWindowEnd = deliveryWindowEnd;
    }
    if (dto.cargoType !== undefined) request.cargoType = dto.cargoType;
    if (dto.cargoDescription !== undefined) {
      request.cargoDescription = dto.cargoDescription;
    }
    if (dto.weightKg !== undefined) request.weightKg = dto.weightKg;
    if (dto.volumeM3 !== undefined) request.volumeM3 = dto.volumeM3;
    if (dto.packageLengthCm !== undefined) {
      request.packageLengthCm = dto.packageLengthCm;
    }
    if (dto.packageWidthCm !== undefined) {
      request.packageWidthCm = dto.packageWidthCm;
    }
    if (dto.packageHeightCm !== undefined) {
      request.packageHeightCm = dto.packageHeightCm;
    }
    if (dto.specialRequirements !== undefined) {
      request.specialRequirements = dto.specialRequirements || null;
    }

    return this.requests.save(request);
  }

  async remove(companyId: string, requestId: string) {
    const request = await this.findOwnedRequest(companyId, requestId);
    await this.requests.remove(request);

    return {
      id: requestId,
      deleted: true,
    };
  }

  private async findOwnedRequest(companyId: string, requestId: string) {
    const request = await this.requests.findOne({
      where: { id: requestId, companyId },
    });

    if (!request) {
      throw new NotFoundException('Solicitud de transporte no encontrada');
    }

    return request;
  }

  private validateWindows(
    pickupWindowStart: Date,
    pickupWindowEnd: Date,
    deliveryWindowStart: Date,
    deliveryWindowEnd: Date,
  ) {
    if (pickupWindowStart >= pickupWindowEnd) {
      throw new BadRequestException(
        'El fin de la ventana de recojo debe ser posterior al inicio',
      );
    }

    if (deliveryWindowStart >= deliveryWindowEnd) {
      throw new BadRequestException(
        'El fin de la ventana de entrega debe ser posterior al inicio',
      );
    }

    if (pickupWindowStart >= deliveryWindowEnd) {
      throw new BadRequestException(
        'La ventana de entrega debe terminar despues del inicio del recojo',
      );
    }
  }

  private validateDifferentPoints(
    originLatitude: number,
    originLongitude: number,
    destinationLatitude: number,
    destinationLongitude: number,
  ) {
    const sameLatitude = Math.abs(originLatitude - destinationLatitude) < 0.000001;
    const sameLongitude = Math.abs(originLongitude - destinationLongitude) < 0.000001;

    if (sameLatitude && sameLongitude) {
      throw new BadRequestException(
        'El origen y el destino no pueden ser el mismo punto',
      );
    }
  }

  private validatePackageDimensions(
    length?: number,
    width?: number,
    height?: number,
  ) {
    const dimensions = [length, width, height];
    const suppliedDimensions = dimensions.filter(
      (value) => value !== undefined && value !== null,
    );

    if (suppliedDimensions.length > 0 && suppliedDimensions.length < 3) {
      throw new BadRequestException(
        'Las dimensiones deben incluir largo, ancho y alto',
      );
    }
  }
}
