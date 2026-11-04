-- CreateTable
CREATE TABLE `user_certifications` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `certification_code` VARCHAR(10) NOT NULL,
    `status` VARCHAR(20) NOT NULL DEFAULT 'in_progress',
    `started_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `completed_at` DATETIME(0) NULL,

    INDEX `user_certifications_certification_code_idx`(`certification_code`),
    UNIQUE INDEX `user_certifications_user_id_certification_code_key`(`user_id`, `certification_code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `module_progress` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_certification_id` INTEGER NOT NULL,
    `module_id` VARCHAR(100) NOT NULL,
    `read_at` DATETIME(0) NULL,
    `check_passed_at` DATETIME(0) NULL,

    UNIQUE INDEX `module_progress_user_certification_id_module_id_key`(`user_certification_id`, `module_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `exam_attempts` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_certification_id` INTEGER NOT NULL,
    `exam_set` INTEGER NOT NULL,
    `paper` JSON NOT NULL,
    `answers` JSON NULL,
    `started_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `deadline_at` DATETIME(0) NOT NULL,
    `submitted_at` DATETIME(0) NULL,
    `score` INTEGER NULL,
    `total` INTEGER NULL,
    `percentage` INTEGER NULL,
    `passed` BOOLEAN NULL,

    INDEX `exam_attempts_user_certification_id_idx`(`user_certification_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `certificates` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `certificate_no` VARCHAR(32) NOT NULL,
    `user_certification_id` INTEGER NOT NULL,
    `exam_attempt_id` INTEGER NOT NULL,
    `holder_name` VARCHAR(120) NOT NULL,
    `certification_code` VARCHAR(10) NOT NULL,
    `certification_title` VARCHAR(200) NOT NULL,
    `score_percentage` INTEGER NOT NULL,
    `issued_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `expires_at` DATETIME(0) NOT NULL,
    `status` VARCHAR(20) NOT NULL DEFAULT 'valid',

    UNIQUE INDEX `certificates_certificate_no_key`(`certificate_no`),
    UNIQUE INDEX `certificates_user_certification_id_key`(`user_certification_id`),
    UNIQUE INDEX `certificates_exam_attempt_id_key`(`exam_attempt_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `user_certifications` ADD CONSTRAINT `user_certifications_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `module_progress` ADD CONSTRAINT `module_progress_user_certification_id_fkey` FOREIGN KEY (`user_certification_id`) REFERENCES `user_certifications`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `exam_attempts` ADD CONSTRAINT `exam_attempts_user_certification_id_fkey` FOREIGN KEY (`user_certification_id`) REFERENCES `user_certifications`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `certificates` ADD CONSTRAINT `certificates_user_certification_id_fkey` FOREIGN KEY (`user_certification_id`) REFERENCES `user_certifications`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `certificates` ADD CONSTRAINT `certificates_exam_attempt_id_fkey` FOREIGN KEY (`exam_attempt_id`) REFERENCES `exam_attempts`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
