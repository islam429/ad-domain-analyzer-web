/*
  Warnings:

  - You are about to drop the column `domain_id` on the `creative_domain` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[creative_id,landing_domain_id]` on the table `creative_domain` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `landing_domain_id` to the `creative_domain` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."creative_domain" DROP CONSTRAINT "creative_domain_domain_id_fkey";

-- DropIndex
DROP INDEX "public"."creative_domain_creative_id_domain_id_key";

-- DropIndex
DROP INDEX "public"."creative_domain_domain_id_idx";

-- AlterTable
ALTER TABLE "creative_domain" DROP COLUMN "domain_id",
ADD COLUMN     "landing_domain_id" INTEGER NOT NULL;

-- CreateIndex
CREATE INDEX "creative_domain_landing_domain_id_idx" ON "creative_domain"("landing_domain_id");

-- CreateIndex
CREATE UNIQUE INDEX "creative_domain_creative_id_landing_domain_id_key" ON "creative_domain"("creative_id", "landing_domain_id");

-- AddForeignKey
ALTER TABLE "creative_domain" ADD CONSTRAINT "creative_domain_landing_domain_id_fkey" FOREIGN KEY ("landing_domain_id") REFERENCES "landing_domain"("id") ON DELETE CASCADE ON UPDATE CASCADE;
