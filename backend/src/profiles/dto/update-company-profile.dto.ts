import { Transform } from 'class-transformer';
import { IsOptional, IsString, MaxLength } from 'class-validator';

function trimText(value: unknown) {
  return typeof value === 'string' ? value.trim() : value;
}

export class UpdateCompanyProfileDto {
  @Transform(({ value }) => trimText(value))
  @IsOptional()
  @IsString()
  @MaxLength(160)
  companyName?: string;

  @Transform(({ value }) => trimText(value))
  @IsOptional()
  @IsString()
  @MaxLength(30)
  taxId?: string;

  @Transform(({ value }) => trimText(value))
  @IsOptional()
  @IsString()
  @MaxLength(30)
  phoneNumber?: string;

  @Transform(({ value }) => trimText(value))
  @IsOptional()
  @IsString()
  @MaxLength(120)
  baseCity?: string;
}
