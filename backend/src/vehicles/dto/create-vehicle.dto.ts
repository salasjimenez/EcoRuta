import { Transform, Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  ArrayUnique,
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { CargoType } from '../cargo-type.enum';
import { VehicleType } from '../vehicle-type.enum';

export class CreateVehicleDto {
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toUpperCase() : value,
  )
  @IsString()
  @MinLength(4)
  @MaxLength(20)
  plateNumber: string;

  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @MinLength(2)
  @MaxLength(80)
  make: string;

  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @MinLength(1)
  @MaxLength(80)
  model: string;

  @Type(() => Number)
  @IsInt()
  @Min(1950)
  @Max(2100)
  year: number;

  @IsEnum(VehicleType)
  vehicleType: VehicleType;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(1)
  maxWeightKg: number;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 3 })
  @Min(0.01)
  maxVolumeM3: number;

  @IsArray()
  @ArrayNotEmpty()
  @ArrayUnique()
  @IsEnum(CargoType, { each: true })
  cargoTypes: CargoType[];

  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;
}
