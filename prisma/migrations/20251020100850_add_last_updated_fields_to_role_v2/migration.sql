-- AlterTable
ALTER TABLE "public"."Permission" ADD COLUMN     "LastUpdatedAt" TIMESTAMP(3),
ADD COLUMN     "LastUpdatedBy" TEXT;
