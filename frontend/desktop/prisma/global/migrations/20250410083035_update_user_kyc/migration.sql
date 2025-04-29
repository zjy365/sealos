/*
  Warnings:

  - You are about to drop the `Referral` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ReferralReward` table. If the table is not empty, all the data it contains will be lost.

*/

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
