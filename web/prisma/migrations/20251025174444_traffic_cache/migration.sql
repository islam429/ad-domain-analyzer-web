/*
  Warnings:

  - You are about to drop the `TrafficCache` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "public"."TrafficCache";

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

-- CreateIndex
CREATE UNIQUE INDEX "traffic_cache_domain_country_language_key" ON "traffic_cache"("domain", "country", "language");
