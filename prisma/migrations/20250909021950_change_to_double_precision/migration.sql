/*
  Warnings:

  - You are about to alter the column `HeightCm` on the `Product` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `DoublePrecision`.
  - You are about to alter the column `LengthCm` on the `Product` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `DoublePrecision`.
  - You are about to alter the column `WeightKg` on the `Product` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,3)` to `DoublePrecision`.
  - You are about to alter the column `WidthCm` on the `Product` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `DoublePrecision`.

*/
-- AlterTable
ALTER TABLE "public"."Product" ALTER COLUMN "HeightCm" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "LengthCm" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "WeightKg" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "WidthCm" SET DATA TYPE DOUBLE PRECISION;
