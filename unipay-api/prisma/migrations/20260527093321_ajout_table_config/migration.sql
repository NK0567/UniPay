-- CreateTable
CREATE TABLE `configuration_generale` (
    `id` VARCHAR(191) NOT NULL,
    `cle` VARCHAR(191) NOT NULL,
    `valeur` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `configuration_generale_cle_key`(`cle`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
