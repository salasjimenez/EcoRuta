import { Transform, Type } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { CargoType } from '../../vehicles/cargo-type.enum';
import { ShippingRequestStatus } from '../shipping-request-status.enum';

export class UpdateShippingRequestDto {
  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  originCity?: string;

  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @MaxLength(180)
  originAddress?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 6 })
  @Min(-90)
  @Max(90)
  originLatitude?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 6 })
  @Min(-180)
  @Max(180)
  originLongitude?: number;

  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  destinationCity?: string;

  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @MaxLength(180)
  destinationAddress?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 6 })
  @Min(-90)
  @Max(90)
  destinationLatitude?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 6 })
  @Min(-180)
  @Max(180)
  destinationLongitude?: number;

  @IsOptional()
  @IsDateString()
  pickupWindowStart?: string;

  @IsOptional()
  @IsDateString()
  pickupWindowEnd?: string;

  @IsOptional()
  @IsDateString()
  deliveryWindowStart?: string;

  @IsOptional()
  @IsDateString()
  deliveryWindowEnd?: string;

  @IsOptional()
  @IsEnum(CargoType)
  cargoType?: CargoType;

  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @MinLength(2)
  @MaxLength(300)
  cargoDescription?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  weightKg?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 3 })
  @Min(0.001)
  volumeM3?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.1)
  packageLengthCm?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.1)
  packageWidthCm?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.1)
  packageHeightCm?: number;

  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @MaxLength(500)
  specialRequirements?: string;

  @IsOptional()
  @IsEnum(ShippingRequestStatus)
  status?: ShippingRequestStatus;
}
