/*
  Warnings:

  - Added the required column `category` to the `jobs` table without a default value. This is not possible if the table is not empty.
  - Added the required column `work` to the `jobs` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable - Add columns with temporary defaults
ALTER TABLE "jobs" ADD COLUMN "category" TEXT NOT NULL DEFAULT 'Other',
ADD COLUMN "salaryMax" INTEGER,
ADD COLUMN "salaryMin" INTEGER,
ADD COLUMN "work" TEXT NOT NULL DEFAULT 'General';

-- Update existing rows based on jobType
UPDATE "jobs" SET "category" = 'Technology', "work" = "jobType" WHERE "jobType" IS NOT NULL;

-- Remove defaults for future inserts
ALTER TABLE "jobs" ALTER COLUMN "category" DROP DEFAULT;
ALTER TABLE "jobs" ALTER COLUMN "work" DROP DEFAULT;

-- CreateIndex
CREATE INDEX "jobs_category_idx" ON "jobs"("category");
