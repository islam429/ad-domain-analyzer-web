/*
  Warnings:

  - A unique constraint covering the columns `[job_id,domain,org_id]` on the table `ad_row` will be added. If there are existing duplicate values, this will fail.
  - Made the column `org_id` on table `ad_row` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "ad_row" ALTER COLUMN "org_id" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "ad_row_job_id_domain_org_id_key" ON "ad_row"("job_id", "domain", "org_id");
