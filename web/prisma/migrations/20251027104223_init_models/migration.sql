/*
  Warnings:

  - You are about to drop the `AdEntry` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Domain` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Job` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `JobRun` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."AdEntry" DROP CONSTRAINT "AdEntry_domainId_fkey";

-- DropForeignKey
ALTER TABLE "public"."AdEntry" DROP CONSTRAINT "AdEntry_jobRunId_fkey";

-- DropForeignKey
ALTER TABLE "public"."JobRun" DROP CONSTRAINT "JobRun_jobId_fkey";

-- DropTable
DROP TABLE "public"."AdEntry";

-- DropTable
DROP TABLE "public"."Domain";

-- DropTable
DROP TABLE "public"."Job";

-- DropTable
DROP TABLE "public"."JobRun";

-- DropTable
DROP TABLE "public"."User";

-- CreateTable
CREATE TABLE "user_account" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "name" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organization" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "owner_user_id" TEXT NOT NULL,
    "plan" TEXT NOT NULL DEFAULT 'free',
    "stripe_id" TEXT,
    "stripe_subscription_item_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "organization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "membership" (
    "id" TEXT NOT NULL,
    "org_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'admin',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "membership_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usage" (
    "org_id" TEXT NOT NULL,
    "credits" INTEGER NOT NULL DEFAULT 1000,
    "month" TEXT NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "usage_pkey" PRIMARY KEY ("org_id")
);

-- CreateTable
CREATE TABLE "traffic_cache" (
    "id" SERIAL NOT NULL,
    "domain" TEXT NOT NULL,
    "country" TEXT,
    "language" TEXT,
    "organic_etv" DOUBLE PRECISION,
    "paid_etv" DOUBLE PRECISION,
    "featured_snippet_etv" DOUBLE PRECISION,
    "local_pack_etv" DOUBLE PRECISION,
    "visits_search_total" DOUBLE PRECISION,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "traffic_cache_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ad_row" (
    "id" SERIAL NOT NULL,
    "job_id" BIGINT NOT NULL,
    "org_id" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "organic_etv" DOUBLE PRECISION,
    "paid_etv" DOUBLE PRECISION,
    "featured_snippet_etv" DOUBLE PRECISION,
    "local_pack_etv" DOUBLE PRECISION,
    "visits_search_total" DOUBLE PRECISION,
    "conversions_15" DOUBLE PRECISION,
    "conversions_25" DOUBLE PRECISION,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ad_row_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "job" (
    "id" SERIAL NOT NULL,
    "search_term" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by_id" TEXT,
    "rows_inserted" INTEGER,

    CONSTRAINT "job_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "job_run" (
    "id" TEXT NOT NULL,
    "job_id" INTEGER NOT NULL,
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finished_at" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'running',
    "error" TEXT,
    "stats" JSONB,

    CONSTRAINT "job_run_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "advertiser" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "externalId" TEXT,
    "country" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "advertiser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "creative_domain" (
    "id" TEXT NOT NULL,
    "host" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "creative_domain_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "landing_domain" (
    "id" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "root_domain" TEXT,
    "first_seen" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_seen" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "landing_domain_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "creative" (
    "id" TEXT NOT NULL,
    "advertiserId" TEXT NOT NULL,
    "creativeDomainId" TEXT,
    "jobRunId" TEXT,
    "externalId" TEXT,
    "headline" TEXT,
    "text" TEXT,
    "image_url" TEXT,
    "video_url" TEXT,
    "country" TEXT,
    "start_date" TIMESTAMP(3),
    "end_date" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "creative_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "creative_landing_domain" (
    "creativeId" TEXT NOT NULL,
    "landingDomainId" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "creative_landing_domain_pkey" PRIMARY KEY ("creativeId","landingDomainId")
);

-- CreateTable
CREATE TABLE "domain_metrics_monthly" (
    "id" SERIAL NOT NULL,
    "domain_id" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "organic_etv" DOUBLE PRECISION,
    "paid_etv" DOUBLE PRECISION,
    "featured_snippet_etv" DOUBLE PRECISION,
    "local_pack_etv" DOUBLE PRECISION,
    "visits_search_total" DOUBLE PRECISION,

    CONSTRAINT "domain_metrics_monthly_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "job_result_domain" (
    "id" SERIAL NOT NULL,
    "job_id" INTEGER NOT NULL,
    "domain_id" TEXT NOT NULL,

    CONSTRAINT "job_result_domain_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_account_email_key" ON "user_account"("email");

-- CreateIndex
CREATE INDEX "membership_user_id_idx" ON "membership"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "membership_org_id_user_id_key" ON "membership"("org_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "traffic_cache_domain_country_language_key" ON "traffic_cache"("domain", "country", "language");

-- CreateIndex
CREATE UNIQUE INDEX "ad_row_job_id_domain_org_id_key" ON "ad_row"("job_id", "domain", "org_id");

-- CreateIndex
CREATE INDEX "job_status_idx" ON "job"("status");

-- CreateIndex
CREATE INDEX "job_run_job_id_idx" ON "job_run"("job_id");

-- CreateIndex
CREATE UNIQUE INDEX "advertiser_externalId_key" ON "advertiser"("externalId");

-- CreateIndex
CREATE UNIQUE INDEX "creative_domain_host_key" ON "creative_domain"("host");

-- CreateIndex
CREATE UNIQUE INDEX "landing_domain_domain_key" ON "landing_domain"("domain");

-- CreateIndex
CREATE UNIQUE INDEX "creative_externalId_key" ON "creative"("externalId");

-- CreateIndex
CREATE INDEX "creative_advertiserId_idx" ON "creative"("advertiserId");

-- CreateIndex
CREATE INDEX "creative_jobRunId_idx" ON "creative"("jobRunId");

-- CreateIndex
CREATE INDEX "domain_metrics_monthly_domain_id_idx" ON "domain_metrics_monthly"("domain_id");

-- CreateIndex
CREATE UNIQUE INDEX "domain_metrics_monthly_domain_id_year_month_key" ON "domain_metrics_monthly"("domain_id", "year", "month");

-- CreateIndex
CREATE INDEX "job_result_domain_job_id_idx" ON "job_result_domain"("job_id");

-- CreateIndex
CREATE INDEX "job_result_domain_domain_id_idx" ON "job_result_domain"("domain_id");

-- CreateIndex
CREATE UNIQUE INDEX "job_result_domain_job_id_domain_id_key" ON "job_result_domain"("job_id", "domain_id");

-- AddForeignKey
ALTER TABLE "membership" ADD CONSTRAINT "membership_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usage" ADD CONSTRAINT "usage_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_run" ADD CONSTRAINT "job_run_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "job"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "creative" ADD CONSTRAINT "creative_advertiserId_fkey" FOREIGN KEY ("advertiserId") REFERENCES "advertiser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "creative" ADD CONSTRAINT "creative_creativeDomainId_fkey" FOREIGN KEY ("creativeDomainId") REFERENCES "creative_domain"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "creative" ADD CONSTRAINT "creative_jobRunId_fkey" FOREIGN KEY ("jobRunId") REFERENCES "job_run"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "creative_landing_domain" ADD CONSTRAINT "creative_landing_domain_creativeId_fkey" FOREIGN KEY ("creativeId") REFERENCES "creative"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "creative_landing_domain" ADD CONSTRAINT "creative_landing_domain_landingDomainId_fkey" FOREIGN KEY ("landingDomainId") REFERENCES "landing_domain"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "domain_metrics_monthly" ADD CONSTRAINT "domain_metrics_monthly_domain_id_fkey" FOREIGN KEY ("domain_id") REFERENCES "landing_domain"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_result_domain" ADD CONSTRAINT "job_result_domain_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "job"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_result_domain" ADD CONSTRAINT "job_result_domain_domain_id_fkey" FOREIGN KEY ("domain_id") REFERENCES "landing_domain"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
