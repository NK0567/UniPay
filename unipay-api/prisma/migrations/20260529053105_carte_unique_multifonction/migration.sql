/*
  Warnings:

  - A unique constraint covering the columns `[idFournisseur]` on the table `cartes_virtuelles` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `idFournisseur` to the `cartes_virtuelles` table without a default value. This is not possible if the table is not empty.
  - Added the required column `numeroMasque` to the `cartes_virtuelles` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `cartes_virtuelles` ADD COLUMN `idFournisseur` VARCHAR(191) NOT NULL,
    ADD COLUMN `limitePlafond` DECIMAL(15, 2) NOT NULL DEFAULT 500000.00,
    ADD COLUMN `numeroMasque` VARCHAR(20) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `cartes_virtuelles_idFournisseur_key` ON `cartes_virtuelles`(`idFournisseur`);
