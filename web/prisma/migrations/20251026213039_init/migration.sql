/*
  Warnings:

  - You are about to drop the `Advertiser` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Creative` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ad_row` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `creative_domain` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `domain_metrics_monthly` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `job` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `job_result_domain` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `landing_domain` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `membership` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `organization` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `traffic_cache` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `usage` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `user_account` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."Creative" DROP CONSTRAINT "Creative_advertiserId_fkey";

-- DropForeignKey
ALTER TABLE "public"."creative_domain" DROP CONSTRAINT "creative_domain_creative_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."creative_domain" DROP CONSTRAINT "creative_domain_landing_domain_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."domain_metrics_monthly" DROP CONSTRAINT "domain_metrics_monthly_domain_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."job_result_domain" DROP CONSTRAINT "job_result_domain_domain_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."job_result_domain" DROP CONSTRAINT "job_result_domain_job_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."membership" DROP CONSTRAINT "membership_org_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."usage" DROP CONSTRAINT "usage_org_id_fkey";

-- DropTable
DROP TABLE "public"."Advertiser";

-- DropTable
DROP TABLE "public"."Creative";

-- DropTable
DROP TABLE "public"."ad_row";

-- DropTable
DROP TABLE "public"."creative_domain";

-- DropTable
DROP TABLE "public"."domain_metrics_monthly";

-- DropTable
DROP TABLE "public"."job";

-- DropTable
DROP TABLE "public"."job_result_domain";

-- DropTable
DROP TABLE "public"."landing_domain";

-- DropTable
DROP TABLE "public"."membership";

-- DropTable
DROP TABLE "public"."organization";

-- DropTable
DROP TABLE "public"."traffic_cache";

-- DropTable
DROP TABLE "public"."usage";

-- DropTable
DROP TABLE "public"."user_account";

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Job" (
    "id" TEXT NOT NULL,
    "searchTerm" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Job_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobRun" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" TIMESTAMP(3),
    "status" TEXT NOT NULL,
    "results" JSONB,

    CONSTRAINT "JobRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Domain" (
    "id" TEXT NOT NULL,
    "host" TEXT NOT NULL,
    "monthlyVisits" INTEGER,

    CONSTRAINT "Domain_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdEntry" (
    "id" TEXT NOT NULL,
    "jobRunId" TEXT NOT NULL,
    "domainId" TEXT NOT NULL,
    "meta" JSONB,

    CONSTRAINT "AdEntry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Domain_host_key" ON "Domain"("host");

-- AddForeignKey
ALTER TABLE "JobRun" ADD CONSTRAINT "JobRun_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdEntry" ADD CONSTRAINT "AdEntry_jobRunId_fkey" FOREIGN KEY ("jobRunId") REFERENCES "JobRun"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdEntry" ADD CONSTRAINT "AdEntry_domainId_fkey" FOREIGN KEY ("domainId") REFERENCES "Domain"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
