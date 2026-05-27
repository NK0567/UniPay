/*
  Warnings:

  - Added the required column `signatureHmac` to the `liens_paiement` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `liens_paiement` ADD COLUMN `signatureHmac` VARCHAR(64) NOT NULL;

-- CreateTable
CREATE TABLE `coffre_unipay` (
    `id` VARCHAR(191) NOT NULL DEFAULT 'global_vault',
    `cumulGainsXAF` DECIMAL(18, 4) NOT NULL DEFAULT 0.0000,
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
