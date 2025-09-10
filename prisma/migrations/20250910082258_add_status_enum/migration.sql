/*
  Warnings:

  - The `Status` column on the `Warehouse` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "public"."WarehouseStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'MAINTENANCE', 'PENDING_APPROVAL');

-- AlterTable
ALTER TABLE "public"."Warehouse" DROP COLUMN "Status",
ADD COLUMN     "Status" "public"."WarehouseStatus" NOT NULL DEFAULT 'ACTIVE';
