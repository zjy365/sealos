/*
  Warnings:

  - Added the required column `card_token` to the `CardInfo` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "CardInfo" ADD COLUMN     "card_token" STRING NOT NULL;
