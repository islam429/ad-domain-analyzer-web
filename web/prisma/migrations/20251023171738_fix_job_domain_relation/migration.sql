-- AlterTable
ALTER TABLE "job_domain" ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "job_id" SET DATA TYPE TEXT;

-- AddForeignKey
ALTER TABLE "job_domain" ADD CONSTRAINT "job_domain_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_domain" ADD CONSTRAINT "job_domain_domain_id_fkey" FOREIGN KEY ("domain_id") REFERENCES "landing_domain"("id") ON DELETE CASCADE ON UPDATE CASCADE;
