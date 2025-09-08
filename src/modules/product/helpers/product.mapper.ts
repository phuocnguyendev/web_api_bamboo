import { Product } from '../interfaces/product.interface';
import { decimalToString } from 'src/utils/prisma.types';

export function mapProductDecimalFieldsToNumber<
  T extends { [key: string]: any },
>(data: T): T {
  return {
    ...data,
    BaseCost: data.BaseCost !== undefined ? Number(data.BaseCost) : undefined,
    WeightKg: data.WeightKg !== undefined ? Number(data.WeightKg) : undefined,
    LengthCm: data.LengthCm !== undefined ? Number(data.LengthCm) : undefined,
    WidthCm: data.WidthCm !== undefined ? Number(data.WidthCm) : undefined,
    HeightCm: data.HeightCm !== undefined ? Number(data.HeightCm) : undefined,
  };
}

export const mapPrismaProductToDomain = (p: any): Product => ({
  Id: p.Id,
  Code: p.Code,
  Sku: p.Sku ?? null,
  Name: p.Name,
  Material: p.Material ?? null,
  SpecText: p.SpecText ?? null,
  Uom: p.Uom,
  BaseCost: decimalToString(p.BaseCost) ?? null,
  Status: p.Status,
  Note: p.Note ?? null,
  Barcode: p.Barcode ?? null,
  HSCode: p.HSCode ?? null,
  CountryOfOrigin: p.CountryOfOrigin ?? null,
  WeightKg: decimalToString(p.WeightKg) ?? null,
  LengthCm: decimalToString(p.LengthCm) ?? null,
  WidthCm: decimalToString(p.WidthCm) ?? null,
  HeightCm: decimalToString(p.HeightCm) ?? null,
  Version: p.Version,
  ImageUrl: p.ImageUrl ?? null,
  CreatedAt: p.CreatedAt,
  UpdatedAt: p.UpdatedAt,
});
