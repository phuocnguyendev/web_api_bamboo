import { HttpException, HttpStatus } from '@nestjs/common';

export async function ensureFieldUnique(
  repo: any,
  field: string,
  value: any,
  label: string,
  excludeId?: string,
): Promise<void> {
  if (!value) return;

  const where: any = { [field]: value };
  if (excludeId) {
    where.Id = { not: excludeId };
  }

  const exists = await repo.model.findFirst({ where });

  if (exists) {
    throw new HttpException(`${label} đã tồn tại`, HttpStatus.CONFLICT);
  }
}
