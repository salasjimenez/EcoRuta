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

export class CreateShippingRequestDto {
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  originCity: string;

  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @MaxLength(180)
  originAddress?: string;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 6 })
  @Min(-90)
  @Max(90)
  originLatitude: number;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 6 })
  @Min(-180)
  @Max(180)
  originLongitude: number;

  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  destinationCity: string;

  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @MaxLength(180)
  destinationAddress?: string;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 6 })
  @Min(-90)
  @Max(90)
  destinationLatitude: number;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 6 })
  @Min(-180)
  @Max(180)
  destinationLongitude: number;

  @IsDateString()
  pickupWindowStart: string;

  @IsDateString()
  pickupWindowEnd: string;

  @IsDateString()
  deliveryWindowStart: string;

  @IsDateString()
  deliveryWindowEnd: string;

  @IsEnum(CargoType)
  cargoType: CargoType;

  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @MinLength(2)
  @MaxLength(300)
  cargoDescription: string;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  weightKg: number;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 3 })
  @Min(0.001)
  volumeM3: number;

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
}
