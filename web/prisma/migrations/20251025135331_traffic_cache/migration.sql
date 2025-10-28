-- CreateTable
CREATE TABLE "TrafficCache" (
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

    CONSTRAINT "TrafficCache_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TrafficCache_domain_country_language_key" ON "TrafficCache"("domain", "country", "language");
