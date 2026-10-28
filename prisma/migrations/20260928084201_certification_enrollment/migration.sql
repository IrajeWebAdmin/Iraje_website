-- AlterTable
ALTER TABLE `certification_enrollment` ADD COLUMN `rejection_reason` VARCHAR(500) NULL,
    ADD COLUMN `reviewed_at` DATETIME(0) NULL,
    ADD COLUMN `reviewed_by` INTEGER NULL,
    ADD COLUMN `user_id` INTEGER NULL;

-- CreateTable
CREATE TABLE `users` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(255) NOT NULL,
    `name` VARCHAR(120) NOT NULL,
    `password_hash` VARCHAR(255) NOT NULL,
    `role` VARCHAR(20) NOT NULL DEFAULT 'student',
    `status` VARCHAR(20) NOT NULL DEFAULT 'active',
    `must_change_password` BOOLEAN NOT NULL DEFAULT true,
    `temp_password_expires_at` DATETIME(0) NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NOT NULL,

    UNIQUE INDEX `users_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sessions` (
    `id` CHAR(64) NOT NULL,
    `user_id` INTEGER NOT NULL,
    `expires_at` DATETIME(0) NOT NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `sessions_user_id_idx`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `certification_enrollment_status_idx` ON `certification_enrollment`(`status`);

-- AddForeignKey
ALTER TABLE `certification_enrollment` ADD CONSTRAINT `certification_enrollment_reviewed_by_fkey` FOREIGN KEY (`reviewed_by`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `certification_enrollment` ADD CONSTRAINT `certification_enrollment_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sessions` ADD CONSTRAINT `sessions_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
