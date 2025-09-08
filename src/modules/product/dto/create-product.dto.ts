import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';
export class CreateProductDto {
  @ApiProperty({
    description: 'The code of the product',
    required: true,
    example: 'NL001',
  })
  @IsString()
  @IsNotEmpty()
  @Length(1, 50)
  Code!: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'The SKU of the product',
    required: false,
    example: 'SKU001',
  })
  Sku?: string;

  @IsString()
  @IsNotEmpty()
  @Length(1, 255)
  @ApiProperty({
    description: 'The name of the product',
    required: true,
    example: 'Nón lá Huế',
  })
  Name!: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'The material of the product',
    required: false,
    example: 'Lá cọ',
  })
  Material?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'The specifications of the product',
    required: false,
    example: 'Kích thước: 30cm, Chất liệu: Lá cọ',
  })
  SpecText?: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'The unit of measurement for the product',
    required: true,
    example: 'Cái',
  })
  Uom!: string;

  @IsOptional()
  @IsNumber({}, { message: 'Giá vốn phải là số' })
  @ApiProperty({
    description: 'The base cost of the product',
    required: false,
    example: 10000.0,
    type: 'number',
  })
  BaseCost?: number;

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'The barcode of the product',
    required: false,
    example: '8938505974190',
  })
  Barcode?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'The HS code of the product',
    required: false,
    example: '6504.00.00',
  })
  HSCode?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'Country of origin',
    required: false,
    example: 'Vietnam',
  })
  CountryOfOrigin?: string;

  @IsOptional()
  @IsNumber({}, { message: 'Khối lượng phải là số' })
  @ApiProperty({
    description: 'Weight in kg',
    required: false,
    example: 0.25,
    type: 'number',
  })
  WeightKg?: number;

  @IsOptional()
  @IsNumber({}, { message: 'Chiều dài phải là số' })
  @ApiProperty({
    description: 'Length in cm',
    required: false,
    example: 30,
    type: 'number',
  })
  LengthCm?: number;

  @IsOptional()
  @IsNumber({}, { message: 'Chiều rộng phải là số' })
  @ApiProperty({
    description: 'Width in cm',
    required: false,
    example: 30,
    type: 'number',
  })
  WidthCm?: number;

  @IsOptional()
  @IsNumber({}, { message: 'Chiều cao phải là số' })
  @ApiProperty({
    description: 'Height in cm',
    required: false,
    example: 15,
    type: 'number',
  })
  HeightCm?: number;

  @IsOptional()
  @ApiProperty({
    description: 'Version of the product',
    required: false,
    example: 1,
  })
  Version?: number;

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'Image URL of the product',
    required: false,
    example: 'https://example.com/image.jpg',
  })
  ImageUrl?: string;
  @IsBoolean()
  @IsOptional()
  @ApiProperty({
    description: 'The status of the product (active/inactive)',
    required: false,
    example: true,
  })
  Status?: boolean;

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'Any additional notes about the product',
    required: false,
    example: 'Hàng xuất sang Nhật',
  })
  Note?: string;
}
