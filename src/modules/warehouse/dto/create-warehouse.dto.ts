import { IsOptional, IsString, IsNotEmpty, Length } from 'class-validator';

export class CreateWarehouseDto {
  @IsString()
  @IsNotEmpty()
  @Length(1, 50)
  Code!: string;

  @IsString()
  @IsNotEmpty()
  @Length(1, 255)
  Name!: string;

  @IsString()
  @IsOptional()
  Address?: string;

  @IsString()
  @IsOptional()
  Branch?: string;
}
