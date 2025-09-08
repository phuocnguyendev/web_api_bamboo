import {
  IsEmail,
  IsInt,
  IsOptional,
  IsString,
  IsNotEmpty,
  Length,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateSupplierDto {
  @IsString()
  @IsNotEmpty()
  @Length(1, 255)
  Name!: string;

  @IsString()
  @IsOptional()
  TaxCode?: string;

  @IsString()
  @IsOptional()
  Phone?: string;

  @IsEmail()
  @IsOptional()
  Email?: string;

  @IsString()
  @IsOptional()
  Address?: string;

  @Type(() => Number)
  @IsInt()
  @IsOptional()
  Rating?: number;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  @IsOptional()
  LeadTime?: number; // ngày
}
