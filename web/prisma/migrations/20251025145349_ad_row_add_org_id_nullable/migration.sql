-- DropIndex
DROP INDEX "public"."ad_row_job_id_domain_idx";

-- DropIndex
DROP INDEX "public"."ad_row_job_id_domain_key";

-- AlterTable
ALTER TABLE "ad_row" ADD COLUMN     "org_id" TEXT;
