/*
  Warnings:

  - You are about to drop the column `card_token` on the `CardInfo` table. All the data in the column will be lost.
  - You are about to drop the column `infoUid` on the `PrecommitTransaction` table. All the data in the column will be lost.
  - You are about to drop the `AuditLog` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `AuditLogDetail` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `DeleteUserTransactionInfo` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `MergeUserTransactionInfo` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `info` to the `PrecommitTransaction` table without a default value. This is not possible if the table is not empty.
  - Made the column `old_plan_id` on table `SubscriptionTransaction` required. This step will fail if there are existing NULL values in that column.
  - Made the column `new_plan_id` on table `SubscriptionTransaction` required. This step will fail if there are existing NULL values in that column.
  - Changed the type of `transactionUid` on the `TransactionDetail` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterEnum
ALTER TYPE "TransactionType" ADD VALUE 'SYNC_PLAN';

-- DropIndex
DROP INDEX "CardInfo_card_token_key";

-- DropIndex
DROP INDEX "PrecommitTransaction_infoUid_transactionType_key";

-- AlterTable
ALTER TABLE "CardInfo" DROP COLUMN "card_token";

-- AlterTable
ALTER TABLE "PrecommitTransaction" DROP COLUMN "infoUid";
ALTER TABLE "PrecommitTransaction" ADD COLUMN     "info" JSONB NOT NULL;

-- AlterTable
ALTER TABLE "SubscriptionTransaction" ALTER COLUMN "old_plan_id" SET NOT NULL;
ALTER TABLE "SubscriptionTransaction" ALTER COLUMN "new_plan_id" SET NOT NULL;

-- AlterTable
ALTER TABLE "TransactionDetail" DROP COLUMN "transactionUid";
ALTER TABLE "TransactionDetail" ADD COLUMN     "transactionUid" UUID NOT NULL;

-- DropTable
DROP TABLE "AuditLog";

-- DropTable
DROP TABLE "AuditLogDetail";

-- DropTable
DROP TABLE "DeleteUserTransactionInfo";

-- DropTable
DROP TABLE "MergeUserTransactionInfo";

-- CreateTable
CREATE TABLE "AccountRegionUserTask" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "region_domain" STRING(50) NOT NULL,
    "user_uid" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "type" STRING NOT NULL DEFAULT 'flush-quota',
    "start_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "end_at" TIMESTAMPTZ(6),
    "status" STRING NOT NULL DEFAULT 'pending',

    CONSTRAINT "AccountRegionUserTask_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_AccountRegionUserTask_user_uid" ON "AccountRegionUserTask"("user_uid");

-- CreateIndex
CREATE INDEX "SubscriptionTransaction_old_plan_id_idx" ON "SubscriptionTransaction"("old_plan_id");

-- CreateIndex
CREATE INDEX "SubscriptionTransaction_new_plan_id_idx" ON "SubscriptionTransaction"("new_plan_id");

-- CreateIndex
CREATE UNIQUE INDEX "TransactionDetail_transactionUid_regionUid_key" ON "TransactionDetail"("transactionUid", "regionUid");
