-- CreateTable
CREATE TABLE "ad_row" (
    "id" SERIAL NOT NULL,
    "job_id" BIGINT NOT NULL,
    "domain" TEXT NOT NULL,
    "organic_etv" DOUBLE PRECISION,
    "paid_etv" DOUBLE PRECISION,
    "featured_snippet_etv" DOUBLE PRECISION,
    "local_pack_etv" DOUBLE PRECISION,
    "visits_search_total" DOUBLE PRECISION,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ad_row_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ad_row_job_id_domain_key" ON "ad_row"("job_id", "domain");
