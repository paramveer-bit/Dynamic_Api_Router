/*
  Warnings:

  - You are about to drop the column `userId` on the `RateLimiting` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[user_code,requestId]` on the table `RateLimiting` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `user_code` to the `RateLimiting` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "RateLimiting" DROP CONSTRAINT "RateLimiting_userId_fkey";

-- DropIndex
DROP INDEX "RateLimiting_userId_requestId_key";

-- AlterTable
ALTER TABLE "RateLimiting" DROP COLUMN "userId",
ADD COLUMN     "user_code" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "RateLimiting_user_code_requestId_key" ON "RateLimiting"("user_code", "requestId");
