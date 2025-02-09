/*
  Warnings:

  - Added the required column `statusCode` to the `RequestLog` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "RequestLog" ADD COLUMN     "comment" TEXT,
ADD COLUMN     "statusCode" INTEGER NOT NULL;
