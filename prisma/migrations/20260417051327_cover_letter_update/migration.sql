/*
  Warnings:

  - You are about to drop the column `jobDescription` on the `CoverLetter` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "CoverLetter" DROP COLUMN "jobDescription",
ADD COLUMN     "jonDescription" TEXT;
