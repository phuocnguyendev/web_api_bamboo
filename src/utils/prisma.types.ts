import { Prisma } from '@prisma/client';

/** Map domain DecimalValue -> Prisma.Decimal an toàn */
export const toPrismaDecimal = (
  v: string | number | Prisma.Decimal | null | undefined,
) => {
  if (v === null || v === undefined) return undefined; // để Prisma bỏ qua khi update
  if (v instanceof Prisma.Decimal) return v;
  return new Prisma.Decimal(v);
};

/** Khi trả ra ngoài API, ép Prisma.Decimal -> string để tránh mất chính xác */
export const decimalToString = (
  v: Prisma.Decimal | string | number | null | undefined,
): string | null => {
  if (v === null || v === undefined) return null;
  if (v instanceof Prisma.Decimal) return v.toFixed(); // hoặc v.toString()
  return String(v);
};
