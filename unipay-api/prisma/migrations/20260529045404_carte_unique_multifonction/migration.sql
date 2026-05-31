/*
  Warnings:

  - Added the required column `updated_at` to the `cartes_virtuelles` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `cartes_virtuelles` ADD COLUMN `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `libelle` VARCHAR(50) NOT NULL DEFAULT 'Carte Unique UniPay',
    ADD COLUMN `marque` ENUM('VISA', 'MASTERCARD') NOT NULL DEFAULT 'VISA',
    ADD COLUMN `updated_at` DATETIME(3) NOT NULL,
    MODIFY `numeroTokenise` VARCHAR(255) NOT NULL;
