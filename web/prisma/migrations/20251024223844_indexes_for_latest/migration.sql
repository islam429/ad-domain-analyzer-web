-- CreateIndex
CREATE INDEX "ad_row_job_id_idx" ON "ad_row"("job_id");

-- CreateIndex
CREATE INDEX "ad_row_job_id_domain_idx" ON "ad_row"("job_id", "domain");
