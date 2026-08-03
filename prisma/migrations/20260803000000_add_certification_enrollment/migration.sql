-- CreateTable
CREATE TABLE `certification_enrollment` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(120) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `mobile_no` VARCHAR(20) NOT NULL,
    `organization` VARCHAR(150) NOT NULL,
    `designation` VARCHAR(120) NULL,
    `country` VARCHAR(100) NOT NULL,
    `years_experience` VARCHAR(40) NULL,
    `technology_domain` VARCHAR(120) NULL,
    `existing_customer` VARCHAR(60) NULL,
    `existing_partner` VARCHAR(60) NULL,
    `certifications` VARCHAR(255) NOT NULL,
    `status` VARCHAR(20) NOT NULL DEFAULT 'new',
    `created_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `certification_enrollment_email_idx`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

