/*
  Warnings:

  - A unique constraint covering the columns `[pageId]` on the table `advertiser` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `pageId` to the `advertiser` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "advertiser" ADD COLUMN     "pageId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "Ad" (
    "id" TEXT NOT NULL,
    "metaAdId" TEXT NOT NULL,
    "advertiserId" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3),

    CONSTRAINT "Ad_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Domain" (
    "id" TEXT NOT NULL,
    "host" TEXT NOT NULL,

    CONSTRAINT "Domain_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdDomain" (
    "adId" TEXT NOT NULL,
    "domainId" TEXT NOT NULL,
    "firstSeen" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdDomain_pkey" PRIMARY KEY ("adId","domainId")
);

-- CreateTable
CREATE TABLE "TrafficSnapshot" (
    "id" TEXT NOT NULL,
    "domainId" TEXT NOT NULL,
    "month" TEXT NOT NULL,
    "visits" INTEGER NOT NULL,
    "source" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TrafficSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Ad_metaAdId_key" ON "Ad"("metaAdId");

-- CreateIndex
CREATE UNIQUE INDEX "Domain_host_key" ON "Domain"("host");

-- CreateIndex
CREATE UNIQUE INDEX "TrafficSnapshot_domainId_month_key" ON "TrafficSnapshot"("domainId", "month");

-- CreateIndex
CREATE UNIQUE INDEX "advertiser_pageId_key" ON "advertiser"("pageId");

-- AddForeignKey
ALTER TABLE "Ad" ADD CONSTRAINT "Ad_advertiserId_fkey" FOREIGN KEY ("advertiserId") REFERENCES "advertiser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdDomain" ADD CONSTRAINT "AdDomain_adId_fkey" FOREIGN KEY ("adId") REFERENCES "Ad"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdDomain" ADD CONSTRAINT "AdDomain_domainId_fkey" FOREIGN KEY ("domainId") REFERENCES "Domain"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrafficSnapshot" ADD CONSTRAINT "TrafficSnapshot_domainId_fkey" FOREIGN KEY ("domainId") REFERENCES "Domain"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
