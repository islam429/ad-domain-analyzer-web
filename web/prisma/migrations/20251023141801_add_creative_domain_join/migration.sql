-- CreateEnum
CREATE TYPE "JobStatus" AS ENUM ('PENDING', 'RUNNING', 'COMPLETED', 'FAILED');

-- CreateTable
CREATE TABLE "Advertiser" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "externalId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Advertiser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Creative" (
    "id" TEXT NOT NULL,
    "advertiserId" TEXT NOT NULL,
    "sourceId" TEXT,
    "title" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Creative_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "landing_domain" (
    "id" SERIAL NOT NULL,
    "domain" TEXT NOT NULL,
    "root_domain" TEXT,
    "first_seen" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_seen" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "landing_domain_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "creative_domain" (
    "id" SERIAL NOT NULL,
    "creative_id" TEXT NOT NULL,
    "domain_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "creative_domain_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "domain_metrics_monthly" (
    "id" SERIAL NOT NULL,
    "domain_id" INTEGER NOT NULL,
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
CREATE TABLE "job_domain" (
    "id" SERIAL NOT NULL,
    "job_id" INTEGER NOT NULL,
    "domain_id" INTEGER NOT NULL,

    CONSTRAINT "job_domain_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Job" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" "JobStatus" NOT NULL DEFAULT 'PENDING',
    "payload" JSONB,
    "result" JSONB,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Job_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Advertiser_externalId_key" ON "Advertiser"("externalId");

-- CreateIndex
CREATE UNIQUE INDEX "Creative_sourceId_key" ON "Creative"("sourceId");

-- CreateIndex
CREATE UNIQUE INDEX "landing_domain_domain_key" ON "landing_domain"("domain");

-- CreateIndex
CREATE INDEX "creative_domain_creative_id_idx" ON "creative_domain"("creative_id");

-- CreateIndex
CREATE INDEX "creative_domain_domain_id_idx" ON "creative_domain"("domain_id");

-- CreateIndex
CREATE UNIQUE INDEX "creative_domain_creative_id_domain_id_key" ON "creative_domain"("creative_id", "domain_id");

-- CreateIndex
CREATE INDEX "domain_metrics_monthly_domain_id_idx" ON "domain_metrics_monthly"("domain_id");

-- CreateIndex
CREATE UNIQUE INDEX "domain_metrics_monthly_domain_id_year_month_key" ON "domain_metrics_monthly"("domain_id", "year", "month");

-- CreateIndex
CREATE INDEX "job_domain_job_id_idx" ON "job_domain"("job_id");

-- CreateIndex
CREATE INDEX "job_domain_domain_id_idx" ON "job_domain"("domain_id");

-- CreateIndex
CREATE UNIQUE INDEX "job_domain_job_id_domain_id_key" ON "job_domain"("job_id", "domain_id");

-- AddForeignKey
ALTER TABLE "Creative" ADD CONSTRAINT "Creative_advertiserId_fkey" FOREIGN KEY ("advertiserId") REFERENCES "Advertiser"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "creative_domain" ADD CONSTRAINT "creative_domain_creative_id_fkey" FOREIGN KEY ("creative_id") REFERENCES "Creative"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "creative_domain" ADD CONSTRAINT "creative_domain_domain_id_fkey" FOREIGN KEY ("domain_id") REFERENCES "landing_domain"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "domain_metrics_monthly" ADD CONSTRAINT "domain_metrics_monthly_domain_id_fkey" FOREIGN KEY ("domain_id") REFERENCES "landing_domain"("id") ON DELETE CASCADE ON UPDATE CASCADE;
