-- AlterTable
ALTER TABLE "public"."Role" ADD COLUMN     "LastUpdatedAt" TIMESTAMP(3),
ADD COLUMN     "LastUpdatedBy" TEXT;
