export interface Product {
  Id: string;
  Code: string;
  Sku?: string | null;
  Name: string;
  Material?: string | null;
  SpecText?: string | null;
  Uom: string;
  BaseCost?: number | null;
  Status: boolean;
  Note?: string | null;
  Barcode?: string | null;
  HSCode?: string | null;
  CountryOfOrigin?: string | null;
  WeightKg?: number | null;
  LengthCm?: number | null;
  WidthCm?: number | null;
  HeightCm?: number | null;
  Version?: number;
  ImageUrl?: string | null;
  CreatedAt: Date;
  UpdatedAt: Date;
}

export interface ProductResponse
  extends Pick<
    Product,
    | 'Id'
    | 'Name'
    | 'Material'
    | 'SpecText'
    | 'Uom'
    | 'Status'
    | 'Note'
    | 'Sku'
    | 'Code'
    | 'BaseCost'
    | 'WeightKg'
    | 'LengthCm'
    | 'WidthCm'
    | 'HeightCm'
    | 'ImageUrl'
    | 'Barcode'
    | 'HSCode'
    | 'CountryOfOrigin'
    | 'Version'
    | 'CreatedAt'
    | 'UpdatedAt'
  > {}
