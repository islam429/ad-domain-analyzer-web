/*
  Warnings:

  - You are about to drop the `Job` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `job_domain` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."job_domain" DROP CONSTRAINT "job_domain_domain_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."job_domain" DROP CONSTRAINT "job_domain_job_id_fkey";

-- DropTable
DROP TABLE "public"."Job";

-- DropTable
DROP TABLE "public"."job_domain";

-- DropEnum
DROP TYPE "public"."JobStatus";

-- CreateTable
CREATE TABLE "job" (
    "id" SERIAL NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL,
    "search_term" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "rows_inserted" INTEGER NOT NULL,

    CONSTRAINT "job_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "job_result_domain" (
    "id" SERIAL NOT NULL,
    "job_id" INTEGER NOT NULL,
    "domain_id" INTEGER NOT NULL,

    CONSTRAINT "job_result_domain_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "job_result_domain_job_id_idx" ON "job_result_domain"("job_id");

-- CreateIndex
CREATE INDEX "job_result_domain_domain_id_idx" ON "job_result_domain"("domain_id");

-- CreateIndex
CREATE UNIQUE INDEX "job_result_domain_job_id_domain_id_key" ON "job_result_domain"("job_id", "domain_id");

-- AddForeignKey
ALTER TABLE "job_result_domain" ADD CONSTRAINT "job_result_domain_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "job"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_result_domain" ADD CONSTRAINT "job_result_domain_domain_id_fkey" FOREIGN KEY ("domain_id") REFERENCES "landing_domain"("id") ON DELETE CASCADE ON UPDATE CASCADE;
