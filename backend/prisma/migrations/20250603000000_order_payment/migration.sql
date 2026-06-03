-- AlterTable
ALTER TABLE `Order` ADD COLUMN `paymentMethod` ENUM('CARD', 'BANK', 'MOBILE') NULL,
    ADD COLUMN `paymentLabel` VARCHAR(191) NULL;
