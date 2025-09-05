import { PrismaClient } from '@prisma/client';

export class BaseRepository<T, Delegate> {
  constructor(
    protected readonly prisma: PrismaClient,
    protected readonly model: Delegate,
  ) {}

  async findUnique(args: any): Promise<T | null> {
    //@ts-ignore
    return this.model.findUnique(args);
  }

  async findMany(args: any): Promise<T[]> {
    //@ts-ignore
    return this.model.findMany(args);
  }

  async create(args: any): Promise<T> {
    //@ts-ignore
    return this.model.create(args);
  }

  async update(args: any): Promise<T> {
    //@ts-ignore
    return this.model.update(args);
  }

  async delete(args: any): Promise<T> {
    //@ts-ignore
    return this.model.delete(args);
  }

  async count(args: any): Promise<number> {
    //@ts-ignore
    return this.model.count(args);
  }
}
