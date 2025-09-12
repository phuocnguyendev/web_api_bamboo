export interface Supplier {
  Id: string;
  Name: string;
  TaxCode: string | null;
  Phone: string | null;
  Email: string | null;
  Address: string | null;
  Rating: number | null;
  LeadTime: number | null;
  CreatedAt: Date;
  UpdatedAt: Date;
}

export interface SupplierResponse
  extends Pick<
    Supplier,
    | 'Id'
    | 'Name'
    | 'TaxCode'
    | 'Phone'
    | 'Email'
    | 'Address'
    | 'Rating'
    | 'LeadTime'
  > {}

export interface SupplierCreateData
  extends Omit<Supplier, 'Id' | 'CreatedAt' | 'UpdatedAt'> {}

export interface SupplierUpdateData extends Partial<SupplierCreateData> {
  Id: string;
}
