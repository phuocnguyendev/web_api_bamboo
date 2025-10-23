import { Injectable } from '@nestjs/common';
import { BaseRepository } from 'src/repository/baseRepository';
import { Supplier, SupplierResponse } from '../interfaces/supplier.interface';
import { PrismaService } from 'src/config/prisma/prisma.service';
import { CreateSupplierDto } from '../dto';

export const querySupplier = {
  Id: true,
  Name: true,
  TaxCode: true,
  Phone: true,
  Email: true,
  Address: true,
  Rating: true,
  LeadTime: true,
  CreatedAt: true,
  UpdatedAt: true,
};
@Injectable()
export class SupplierRepository extends BaseRepository<Supplier, any> {
  constructor(prisma: PrismaService) {
    super(prisma, prisma.supplier);
  }

  async createSupplier(data: CreateSupplierDto): Promise<Supplier> {
    const createData = {
      ...data,
    };
    return this.model.create({
      data: createData,
      select: querySupplier,
    });
  }

  async updateSupplier(
    id: string,
    data: Partial<CreateSupplierDto>,
  ): Promise<Supplier> {
    return this.model.update({
      where: { Id: id },
      data,
      select: querySupplier,
    });
  }

  async deleteSupplier(id: string): Promise<Supplier> {
    return this.model.delete({
      where: { Id: id },
      select: querySupplier,
    });
  }

  async findAllSuppliers(
    page: number,
    pageSize: number,
    searchText?: string,
  ): Promise<[SupplierResponse[], number]> {
    const skip = (page - 1) * pageSize;
    const where = searchText
      ? {
          OR: [
            { Name: { contains: searchText, mode: 'insensitive' } },
            { TaxCode: { contains: searchText, mode: 'insensitive' } },
          ],
        }
      : undefined;
    const [data, count] = await Promise.all([
      this.model.findMany({
        skip,
        take: pageSize,
        where,
        select: querySupplier,
      }),
      this.model.count({ where }),
    ]);
    return [data, count];
  }

  async findOneById(id: string): Promise<Supplier | null> {
    return this.model.findUnique({
      where: { Id: id },
      select: querySupplier,
    });
  }
}
