/*
  Warnings:

  - You are about to drop the `Referral` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ReferralReward` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "reward_type_enum" AS ENUM ('ONE_MONTH_HOBBY_LICENSE');

-- DropTable
DROP TABLE "Referral";

-- DropTable
DROP TABLE "ReferralReward";

-- DropEnum
DROP TYPE "RewardType";

-- CreateTable
CREATE TABLE IF NOT EXISTS "RegionConfig" (
    "id" STRING NOT NULL,
    "key" STRING NOT NULL,
    "value" STRING NOT NULL,
    "region" STRING NOT NULL,

    CONSTRAINT "RegionConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "UserDebt" (
    "user_id" STRING NOT NULL,
    "status" STRING NOT NULL,

    CONSTRAINT "UserDebt_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "UserKYC" (
    "user_uid" STRING NOT NULL,
    "status" STRING NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "next_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserKYC_pkey" PRIMARY KEY ("user_uid")
);

-- CreateTable
CREATE TABLE "referral" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "code" STRING NOT NULL,
    "uid" UUID NOT NULL,
    "referrer_id" UUID,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,
    "used" BOOL NOT NULL DEFAULT false,
    "available" BOOL NOT NULL DEFAULT false,
    "verify" BOOL NOT NULL DEFAULT false,

    CONSTRAINT "referral_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "referral_reward" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "referral_id" UUID NOT NULL,
    "reward" "reward_type_enum" NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "referral_reward_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "referral_code_key" ON "referral"("code");

-- CreateIndex
CREATE UNIQUE INDEX "referral_uid_key" ON "referral"("uid");

-- CreateIndex
CREATE INDEX "referral_referrer_id_idx" ON "referral"("referrer_id");

-- CreateIndex
CREATE INDEX "referral_used_idx" ON "referral"("used");

-- CreateIndex
CREATE INDEX "referral_available_idx" ON "referral"("available");

-- CreateIndex
CREATE UNIQUE INDEX "referral_uid_referrer_id_key" ON "referral"("uid", "referrer_id");

-- CreateIndex
CREATE INDEX "referral_reward_referral_id_idx" ON "referral_reward"("referral_id");
