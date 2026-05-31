-- AlterTable
ALTER TABLE `audit_logs` ADD COLUMN `ip` VARCHAR(45) NULL,
    ADD COLUMN `navigateur` TEXT NULL;

-- AlterTable
ALTER TABLE `transactions` ADD COLUMN `motifEchec` VARCHAR(255) NULL;
