/*
  Warnings:

  - The `Status` column on the `Warehouse` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "public"."Warehouse" DROP COLUMN "Status",
ADD COLUMN     "Status" INTEGER NOT NULL DEFAULT 1;

-- DropEnum
DROP TYPE "public"."WarehouseStatus";
