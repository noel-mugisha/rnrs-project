/*
  Warnings:

  - You are about to drop the column `category` on the `jobs` table. All the data in the column will be lost.
  - You are about to drop the column `responsibilities` on the `jobs` table. All the data in the column will be lost.
  - You are about to drop the column `salaryMax` on the `jobs` table. All the data in the column will be lost.
  - You are about to drop the column `salaryMin` on the `jobs` table. All the data in the column will be lost.
  - You are about to drop the column `salaryRange` on the `jobs` table. All the data in the column will be lost.
  - You are about to drop the column `work` on the `jobs` table. All the data in the column will be lost.
  - Added the required column `salaryAmount` to the `jobs` table without a default value. This is not possible if the table is not empty.
  - Added the required column `workCategory` to the `jobs` table without a default value. This is not possible if the table is not empty.
  - Added the required column `workType` to the `jobs` table without a default value. This is not possible if the table is not empty.
  - Made the column `location` on table `jobs` required. This step will fail if there are existing NULL values in that column.

*/
-- DropIndex
DROP INDEX "jobs_category_idx";

-- AlterTable: Add new columns with temporary defaults first
ALTER TABLE "jobs" 
ADD COLUMN "workCategory" TEXT,
ADD COLUMN "workType" TEXT,
ADD COLUMN "salaryAmount" INTEGER;

-- Migrate data from old columns to new ones
UPDATE "jobs" SET 
  "workCategory" = COALESCE("category", 'General'),
  "workType" = COALESCE("work", 'General Work'),
  "salaryAmount" = COALESCE("salaryMin", "salaryMax", 0),
  "location" = COALESCE("location", 'Not Specified');

-- Now make the columns NOT NULL
ALTER TABLE "jobs"
ALTER COLUMN "workCategory" SET NOT NULL,
ALTER COLUMN "workType" SET NOT NULL,
ALTER COLUMN "salaryAmount" SET NOT NULL,
ALTER COLUMN "location" SET NOT NULL;

-- Drop old columns
ALTER TABLE "jobs" 
DROP COLUMN "category",
DROP COLUMN "responsibilities",
DROP COLUMN "salaryMax",
DROP COLUMN "salaryMin",
DROP COLUMN "salaryRange",
DROP COLUMN "work";

-- Update other columns
ALTER TABLE "jobs"
ALTER COLUMN "requirements" SET DATA TYPE TEXT,
ALTER COLUMN "jobType" SET DEFAULT 'FULLTIME',
ALTER COLUMN "experienceLevel" SET DEFAULT 'ENTRY';

-- CreateIndex
CREATE INDEX "jobs_workCategory_idx" ON "jobs"("workCategory");
