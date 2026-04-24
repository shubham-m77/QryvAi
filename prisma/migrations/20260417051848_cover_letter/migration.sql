/*
  Warnings:

  - You are about to drop the column `jonDescription` on the `CoverLetter` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "CoverLetter" DROP COLUMN "jonDescription",
ADD COLUMN     "jobDescription" TEXT;
