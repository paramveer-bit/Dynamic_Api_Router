/*
  Warnings:

  - Changed the type of `response` on the `RequestLog` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "RequestLog" DROP COLUMN "response",
ADD COLUMN     "response" JSONB NOT NULL;
