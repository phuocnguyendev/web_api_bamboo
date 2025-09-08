/*
  Warnings:

  - You are about to alter the column `BaseCost` on the `Product` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(18,2)`.
  - You are about to alter the column `FreightCost` on the `Receipt` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(18,2)`.
  - You are about to alter the column `HandlingCost` on the `Receipt` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(18,2)`.
  - You are about to alter the column `OtherCost` on the `Receipt` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(18,2)`.
  - You are about to alter the column `UnitCost` on the `ReceiptItem` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(18,2)`.
  - You are about to alter the column `VatRate` on the `ReceiptItem` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(5,2)`.
  - You are about to alter the column `UnitCost` on the `StockMovement` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(18,2)`.
  - You are about to alter the column `UnitCostSnapshot` on the `StockOutItem` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(18,2)`.
  - A unique constraint covering the columns `[Sku]` on the table `Product` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[Barcode]` on the table `Product` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `UpdatedAt` to the `Warehouse` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Product" ADD COLUMN     "Barcode" TEXT,
ADD COLUMN     "CountryOfOrigin" TEXT,
ADD COLUMN     "HSCode" TEXT,
ADD COLUMN     "HeightCm" DECIMAL(10,2),
ADD COLUMN     "ImageUrl" TEXT,
ADD COLUMN     "LengthCm" DECIMAL(10,2),
ADD COLUMN     "Sku" TEXT,
ADD COLUMN     "Version" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "WeightKg" DECIMAL(10,3),
ADD COLUMN     "WidthCm" DECIMAL(10,2),
ALTER COLUMN "Code" SET DATA TYPE TEXT,
ALTER COLUMN "BaseCost" SET DATA TYPE DECIMAL(18,2);

-- AlterTable
ALTER TABLE "public"."Receipt" ALTER COLUMN "FreightCost" SET DATA TYPE DECIMAL(18,2),
ALTER COLUMN "HandlingCost" SET DATA TYPE DECIMAL(18,2),
ALTER COLUMN "OtherCost" SET DATA TYPE DECIMAL(18,2);

-- AlterTable
ALTER TABLE "public"."ReceiptItem" ALTER COLUMN "UnitCost" SET DATA TYPE DECIMAL(18,2),
ALTER COLUMN "VatRate" SET DATA TYPE DECIMAL(5,2);

-- AlterTable
ALTER TABLE "public"."Stock" ADD COLUMN     "QtyReserved" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "ReorderPoint" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "SafetyStock" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "public"."StockMovement" ALTER COLUMN "UnitCost" DROP NOT NULL,
ALTER COLUMN "UnitCost" SET DATA TYPE DECIMAL(18,2);

-- AlterTable
ALTER TABLE "public"."StockOutItem" ALTER COLUMN "UnitCostSnapshot" SET DATA TYPE DECIMAL(18,2);

-- AlterTable
ALTER TABLE "public"."Warehouse" ADD COLUMN     "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "Status" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "UpdatedAt" TIMESTAMP(3) NOT NULL;

-- CreateTable
CREATE TABLE "public"."ProductImage" (
    "Id" TEXT NOT NULL,
    "ProductId" TEXT NOT NULL,
    "Url" TEXT NOT NULL,
    "AltText" TEXT,
    "IsPrimary" BOOLEAN NOT NULL DEFAULT false,
    "SortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ProductImage_pkey" PRIMARY KEY ("Id")
);

-- CreateIndex
CREATE INDEX "ProductImage_ProductId_idx" ON "public"."ProductImage"("ProductId");

-- CreateIndex
CREATE UNIQUE INDEX "Product_Sku_key" ON "public"."Product"("Sku");

-- CreateIndex
CREATE UNIQUE INDEX "Product_Barcode_key" ON "public"."Product"("Barcode");

-- AddForeignKey
ALTER TABLE "public"."ProductImage" ADD CONSTRAINT "ProductImage_ProductId_fkey" FOREIGN KEY ("ProductId") REFERENCES "public"."Product"("Id") ON DELETE CASCADE ON UPDATE CASCADE;
