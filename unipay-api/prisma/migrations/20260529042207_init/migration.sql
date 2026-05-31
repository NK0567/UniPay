-- CreateTable
CREATE TABLE `utilisateurs` (
    `id` VARCHAR(191) NOT NULL,
    `nom` VARCHAR(100) NOT NULL,
    `prenom` VARCHAR(191) NOT NULL,
    `email` VARCHAR(150) NOT NULL,
    `telephone` VARCHAR(20) NOT NULL,
    `motDePasse` VARCHAR(255) NOT NULL,
    `statutKYC` ENUM('NON_VERIFIE', 'EN_COURS', 'VERIFIE', 'REJETE') NOT NULL DEFAULT 'NON_VERIFIE',
    `role` ENUM('USER', 'ADMIN', 'SUPPORT', 'MODERATEUR') NOT NULL DEFAULT 'USER',
    `statutCompte` ENUM('ACTIF', 'SUSPENDU', 'FERME') NOT NULL DEFAULT 'ACTIF',
    `pays` CHAR(2) NULL,
    `langue` VARCHAR(5) NOT NULL DEFAULT 'fr',
    `dateCreation` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `dateModif` DATETIME(3) NOT NULL,
    `resetToken` VARCHAR(191) NULL,
    `resetTokenExpires` DATETIME(3) NULL,

    UNIQUE INDEX `utilisateurs_email_key`(`email`),
    UNIQUE INDEX `utilisateurs_telephone_key`(`telephone`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `portefeuilles` (
    `id` VARCHAR(191) NOT NULL,
    `utilisateurId` VARCHAR(191) NOT NULL,
    `solde` DECIMAL(18, 4) NOT NULL DEFAULT 0,
    `soldeBloque` DECIMAL(18, 4) NOT NULL DEFAULT 0,
    `devise` VARCHAR(191) NOT NULL,
    `statut` ENUM('ACTIF', 'SUSPENDU', 'FERME') NOT NULL DEFAULT 'ACTIF',
    `plafondJour` DECIMAL(18, 4) NULL,
    `dateCreation` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `dateModif` DATETIME(3) NOT NULL,

    UNIQUE INDEX `portefeuilles_utilisateurId_key`(`utilisateurId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `transactions` (
    `id` VARCHAR(191) NOT NULL,
    `type` ENUM('DEPOT', 'RETRAIT', 'TRANSFERT', 'PAIEMENT') NOT NULL,
    `montant` DECIMAL(18, 4) NOT NULL,
    `deviseSource` CHAR(3) NOT NULL,
    `deviseCible` CHAR(3) NOT NULL,
    `tauxApplique` DECIMAL(18, 6) NULL,
    `montantConverti` DECIMAL(18, 4) NULL,
    `statut` ENUM('EN_ATTENTE', 'SUCCES', 'ECHEC', 'ANNULEE', 'REMBOURSEE') NOT NULL DEFAULT 'EN_ATTENTE',
    `methodePaiement` ENUM('MOMO', 'ORANGE_MONEY', 'CARTE', 'VIREMENT', 'LIEN') NULL,
    `description` TEXT NULL,
    `dateTransaction` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `frais` DECIMAL(18, 4) NOT NULL DEFAULT 0,
    `gainSpread` DECIMAL(18, 4) NOT NULL DEFAULT 0,
    `paysOperation` CHAR(2) NOT NULL DEFAULT 'CM',
    `walletSourceId` VARCHAR(191) NOT NULL,
    `agregateurId` VARCHAR(191) NOT NULL,
    `walletDestId` VARCHAR(191) NULL,
    `tauxChangeId` VARCHAR(191) NULL,
    `lienPaiementId` VARCHAR(191) NULL,
    `expediteurId` VARCHAR(191) NULL,
    `destinataireId` VARCHAR(191) NULL,
    `marchand` VARCHAR(150) NULL,
    `referenceMarchand` VARCHAR(100) NULL,
    `source` VARCHAR(255) NULL,
    `destination` VARCHAR(255) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sessions` (
    `id` VARCHAR(191) NOT NULL,
    `utilisateurId` VARCHAR(191) NOT NULL,
    `token` VARCHAR(500) NOT NULL,
    `expiration` DATETIME(3) NOT NULL,
    `type` ENUM('WEB', 'MOBILE', 'API') NOT NULL DEFAULT 'WEB',
    `revoque` BOOLEAN NOT NULL DEFAULT false,
    `dateCreation` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `sessions_token_key`(`token`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `blacklist_tokens` (
    `id` VARCHAR(191) NOT NULL,
    `token` VARCHAR(500) NOT NULL,
    `utilisateurId` VARCHAR(191) NULL,
    `dateExpiry` DATETIME(3) NOT NULL,
    `dateAjout` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `blacklist_tokens_token_key`(`token`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `agregateurs` (
    `id` VARCHAR(191) NOT NULL,
    `nom` VARCHAR(100) NOT NULL,
    `type` ENUM('MOBILE_MONEY', 'BANQUE', 'CARTE', 'INTERNE') NOT NULL,
    `pays` CHAR(2) NOT NULL,
    `commissionPct` DECIMAL(5, 4) NOT NULL DEFAULT 0,
    `statut` ENUM('ACTIF', 'SUSPENDU', 'TEST') NOT NULL DEFAULT 'ACTIF',

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `config_agregateurs` (
    `id` VARCHAR(191) NOT NULL,
    `agregateurId` VARCHAR(191) NOT NULL,
    `cle` VARCHAR(100) NOT NULL,
    `valeur` TEXT NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `taux_change` (
    `id` VARCHAR(191) NOT NULL,
    `deviseSource` CHAR(3) NOT NULL,
    `deviseCible` CHAR(3) NOT NULL,
    `taux` DECIMAL(18, 8) NOT NULL,
    `valide` BOOLEAN NOT NULL DEFAULT true,
    `dateMiseAJour` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `cartes_virtuelles` (
    `id` VARCHAR(191) NOT NULL,
    `portefeuilleId` VARCHAR(191) NOT NULL,
    `numeroTokenise` VARCHAR(20) NOT NULL,
    `cvvHash` VARCHAR(255) NOT NULL,
    `statut` ENUM('ACTIVE', 'BLOQUEE', 'EXPIREE') NOT NULL DEFAULT 'ACTIVE',
    `dateExpiration` DATETIME(3) NOT NULL,

    UNIQUE INDEX `cartes_virtuelles_portefeuilleId_key`(`portefeuilleId`),
    UNIQUE INDEX `cartes_virtuelles_numeroTokenise_key`(`numeroTokenise`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `liens_paiement` (
    `id` VARCHAR(191) NOT NULL,
    `utilisateurId` VARCHAR(191) NOT NULL,
    `portefeuilleId` VARCHAR(191) NOT NULL,
    `code` VARCHAR(10) NOT NULL,
    `token` VARCHAR(128) NOT NULL,
    `signatureHmac` VARCHAR(64) NOT NULL,
    `montant` DECIMAL(18, 4) NULL,
    `statut` ENUM('ACTIF', 'DESACTIVE', 'EXPIRE', 'UTILISE') NOT NULL DEFAULT 'ACTIF',
    `dateExpiration` DATETIME(3) NULL,
    `dateCreation` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `dateModif` DATETIME(3) NOT NULL,

    UNIQUE INDEX `liens_paiement_code_key`(`code`),
    UNIQUE INDEX `liens_paiement_token_key`(`token`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

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

-- CreateTable
CREATE TABLE `coffre_unipay` (
    `id` VARCHAR(191) NOT NULL DEFAULT 'global_vault',
    `cumulGainsXAF` DECIMAL(18, 4) NOT NULL DEFAULT 0.0000,
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `objectifs_epargne` (
    `id` VARCHAR(191) NOT NULL,
    `utilisateurId` VARCHAR(191) NOT NULL,
    `portefeuilleId` VARCHAR(191) NOT NULL,
    `libelle` VARCHAR(150) NOT NULL,
    `montantCible` DECIMAL(18, 4) NOT NULL,
    `montantActuel` DECIMAL(18, 4) NOT NULL DEFAULT 0,
    `type` ENUM('SIMPLE', 'INTELLIGENTE') NOT NULL DEFAULT 'SIMPLE',
    `sousType` ENUM('LEGERE', 'STRICTE') NOT NULL DEFAULT 'LEGERE',
    `statut` ENUM('EN_COURS', 'ATTEINT', 'CLOTURE', 'SUSPENDU') NOT NULL DEFAULT 'EN_COURS',
    `autoPrelevement` BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `mouvements_epargne` (
    `id` VARCHAR(191) NOT NULL,
    `objectifId` VARCHAR(191) NOT NULL,
    `transactionId` VARCHAR(191) NULL,
    `type` ENUM('DEPOT', 'RETRAIT') NOT NULL,
    `montant` DECIMAL(18, 4) NOT NULL,
    `dateMouvement` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `notifications` (
    `id` VARCHAR(191) NOT NULL,
    `utilisateurId` VARCHAR(191) NOT NULL,
    `transactionId` VARCHAR(191) NULL,
    `type` ENUM('TRANSACTION', 'SECURITE', 'EPARGNE', 'SYSTEME', 'LIEN', 'CHATBOT') NOT NULL,
    `message` TEXT NOT NULL,
    `statut` ENUM('LUE', 'NON_LUE') NOT NULL DEFAULT 'NON_LUE',
    `dateNotification` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `rapports` (
    `id` VARCHAR(191) NOT NULL,
    `type` ENUM('MENSUEL', 'TRIMESTRIEL', 'ANNUEL') NOT NULL,
    `totalTransactions` INTEGER NOT NULL DEFAULT 0,
    `totalRevenus` DECIMAL(18, 4) NOT NULL DEFAULT 0,
    `generePar` VARCHAR(191) NOT NULL,
    `dateGeneration` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `audit_logs` (
    `id` VARCHAR(191) NOT NULL,
    `utilisateurId` VARCHAR(191) NULL,
    `action` VARCHAR(100) NOT NULL,
    `entite` VARCHAR(50) NOT NULL,
    `avant` JSON NULL,
    `apres` JSON NULL,
    `dateAction` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `securite` (
    `id` VARCHAR(191) NOT NULL,
    `type` ENUM('CHIFFREMENT', 'AUTHENTIFICATION', 'ANTI_FRAUDE') NOT NULL,
    `niveau` ENUM('FAIBLE', 'MOYEN', 'ELEVE', 'CRITIQUE') NOT NULL,
    `statut` BOOLEAN NOT NULL DEFAULT true,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `chatbot_context` (
    `id` VARCHAR(191) NOT NULL,
    `utilisateurId` VARCHAR(191) NOT NULL,
    `dernierMessage` TEXT NULL,
    `etapeEnCours` VARCHAR(191) NULL,
    `donneesTemporaires` JSON NULL,
    `dateModif` DATETIME(3) NOT NULL,

    UNIQUE INDEX `chatbot_context_utilisateurId_key`(`utilisateurId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `configuration_systeme` (
    `id` VARCHAR(191) NOT NULL,
    `cle` VARCHAR(100) NOT NULL,
    `valeur` TEXT NOT NULL,
    `description` TEXT NULL,
    `type` VARCHAR(50) NOT NULL,
    `dateModif` DATETIME(3) NOT NULL,

    UNIQUE INDEX `configuration_systeme_cle_key`(`cle`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `portefeuilles` ADD CONSTRAINT `portefeuilles_utilisateurId_fkey` FOREIGN KEY (`utilisateurId`) REFERENCES `utilisateurs`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `transactions` ADD CONSTRAINT `transactions_walletSourceId_fkey` FOREIGN KEY (`walletSourceId`) REFERENCES `portefeuilles`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `transactions` ADD CONSTRAINT `transactions_walletDestId_fkey` FOREIGN KEY (`walletDestId`) REFERENCES `portefeuilles`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `transactions` ADD CONSTRAINT `transactions_agregateurId_fkey` FOREIGN KEY (`agregateurId`) REFERENCES `agregateurs`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `transactions` ADD CONSTRAINT `transactions_tauxChangeId_fkey` FOREIGN KEY (`tauxChangeId`) REFERENCES `taux_change`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `transactions` ADD CONSTRAINT `transactions_lienPaiementId_fkey` FOREIGN KEY (`lienPaiementId`) REFERENCES `liens_paiement`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `transactions` ADD CONSTRAINT `transactions_expediteurId_fkey` FOREIGN KEY (`expediteurId`) REFERENCES `utilisateurs`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `transactions` ADD CONSTRAINT `transactions_destinataireId_fkey` FOREIGN KEY (`destinataireId`) REFERENCES `utilisateurs`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sessions` ADD CONSTRAINT `sessions_utilisateurId_fkey` FOREIGN KEY (`utilisateurId`) REFERENCES `utilisateurs`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `blacklist_tokens` ADD CONSTRAINT `blacklist_tokens_utilisateurId_fkey` FOREIGN KEY (`utilisateurId`) REFERENCES `utilisateurs`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `config_agregateurs` ADD CONSTRAINT `config_agregateurs_agregateurId_fkey` FOREIGN KEY (`agregateurId`) REFERENCES `agregateurs`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cartes_virtuelles` ADD CONSTRAINT `cartes_virtuelles_portefeuilleId_fkey` FOREIGN KEY (`portefeuilleId`) REFERENCES `portefeuilles`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `liens_paiement` ADD CONSTRAINT `liens_paiement_utilisateurId_fkey` FOREIGN KEY (`utilisateurId`) REFERENCES `utilisateurs`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `liens_paiement` ADD CONSTRAINT `liens_paiement_portefeuilleId_fkey` FOREIGN KEY (`portefeuilleId`) REFERENCES `portefeuilles`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `objectifs_epargne` ADD CONSTRAINT `objectifs_epargne_utilisateurId_fkey` FOREIGN KEY (`utilisateurId`) REFERENCES `utilisateurs`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `objectifs_epargne` ADD CONSTRAINT `objectifs_epargne_portefeuilleId_fkey` FOREIGN KEY (`portefeuilleId`) REFERENCES `portefeuilles`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `mouvements_epargne` ADD CONSTRAINT `mouvements_epargne_objectifId_fkey` FOREIGN KEY (`objectifId`) REFERENCES `objectifs_epargne`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `mouvements_epargne` ADD CONSTRAINT `mouvements_epargne_transactionId_fkey` FOREIGN KEY (`transactionId`) REFERENCES `transactions`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notifications` ADD CONSTRAINT `notifications_utilisateurId_fkey` FOREIGN KEY (`utilisateurId`) REFERENCES `utilisateurs`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notifications` ADD CONSTRAINT `notifications_transactionId_fkey` FOREIGN KEY (`transactionId`) REFERENCES `transactions`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `rapports` ADD CONSTRAINT `rapports_generePar_fkey` FOREIGN KEY (`generePar`) REFERENCES `utilisateurs`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `audit_logs` ADD CONSTRAINT `audit_logs_utilisateurId_fkey` FOREIGN KEY (`utilisateurId`) REFERENCES `utilisateurs`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `chatbot_context` ADD CONSTRAINT `chatbot_context_utilisateurId_fkey` FOREIGN KEY (`utilisateurId`) REFERENCES `utilisateurs`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
