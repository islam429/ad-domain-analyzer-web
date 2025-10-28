/*
  Warnings:

  - The primary key for the `landing_domain` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropForeignKey
ALTER TABLE "public"."creative_domain" DROP CONSTRAINT "creative_domain_landing_domain_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."domain_metrics_monthly" DROP CONSTRAINT "domain_metrics_monthly_domain_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."job_result_domain" DROP CONSTRAINT "job_result_domain_domain_id_fkey";

-- AlterTable
ALTER TABLE "creative_domain" ALTER COLUMN "landing_domain_id" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "domain_metrics_monthly" ALTER COLUMN "domain_id" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "job_result_domain" ALTER COLUMN "domain_id" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "landing_domain" DROP CONSTRAINT "landing_domain_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "landing_domain_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "landing_domain_id_seq";

-- AddForeignKey
ALTER TABLE "creative_domain" ADD CONSTRAINT "creative_domain_landing_domain_id_fkey" FOREIGN KEY ("landing_domain_id") REFERENCES "landing_domain"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "domain_metrics_monthly" ADD CONSTRAINT "domain_metrics_monthly_domain_id_fkey" FOREIGN KEY ("domain_id") REFERENCES "landing_domain"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_result_domain" ADD CONSTRAINT "job_result_domain_domain_id_fkey" FOREIGN KEY ("domain_id") REFERENCES "landing_domain"("id") ON DELETE CASCADE ON UPDATE CASCADE;
