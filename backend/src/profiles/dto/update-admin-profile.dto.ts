import { Transform } from 'class-transformer';
import { IsOptional, IsString, MaxLength } from 'class-validator';

function trimText(value: unknown) {
  return typeof value === 'string' ? value.trim() : value;
}

export class UpdateAdminProfileDto {
  @Transform(({ value }) => trimText(value))
  @IsOptional()
  @IsString()
  @MaxLength(120)
  department?: string;

  @Transform(({ value }) => trimText(value))
  @IsOptional()
  @IsString()
  @MaxLength(120)
  jobTitle?: string;
}
