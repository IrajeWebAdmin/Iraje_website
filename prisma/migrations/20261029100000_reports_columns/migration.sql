-- Admin reports: two filter/group columns on requests, last-login on users,
-- and date indexes for period filters. Additive only; nothing is renamed or
-- dropped.

-- AlterTable
ALTER TABLE `certification_enrollment` ADD COLUMN `certification_code` VARCHAR(10) NULL,
    ADD COLUMN `organization_key` VARCHAR(150) NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE `users` ADD COLUMN `last_login_at` DATETIME(0) NULL,
    ADD COLUMN `login_count` INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE INDEX `certification_enrollment_created_at_idx` ON `certification_enrollment`(`created_at`);

-- CreateIndex
CREATE INDEX `certification_enrollment_organization_key_idx` ON `certification_enrollment`(`organization_key`);

-- CreateIndex
CREATE INDEX `certification_enrollment_certification_code_idx` ON `certification_enrollment`(`certification_code`);

-- CreateIndex
CREATE INDEX `users_role_created_at_idx` ON `users`(`role`, `created_at`);

-- CreateIndex
CREATE INDEX `user_certifications_started_at_idx` ON `user_certifications`(`started_at`);

-- CreateIndex
CREATE INDEX `exam_attempts_started_at_idx` ON `exam_attempts`(`started_at`);

-- CreateIndex
CREATE INDEX `exam_attempts_submitted_at_idx` ON `exam_attempts`(`submitted_at`);

-- CreateIndex
CREATE INDEX `certificates_issued_at_idx` ON `certificates`(`issued_at`);

-- CreateIndex
CREATE INDEX `certificates_expires_at_idx` ON `certificates`(`expires_at`);

-- CreateIndex
CREATE INDEX `certificates_certification_code_idx` ON `certificates`(`certification_code`);

-- Baseline the new request columns so no existing row is blank. The backfill
-- script (scripts/backfill-report-columns.mjs) then applies the full
-- organisation-key rule and canonical codes (e.g. "CyberTantra 101" -> CT100).
UPDATE `certification_enrollment`
SET `organization_key` = LOWER(TRIM(`organization`)),
    `certification_code` = CASE
      WHEN CHAR_LENGTH(UPPER(REPLACE(SUBSTRING_INDEX(`certifications`, ',', 1), ' ', ''))) <= 10
      THEN UPPER(REPLACE(SUBSTRING_INDEX(`certifications`, ',', 1), ' ', ''))
      ELSE NULL
    END
WHERE `organization_key` = '' OR `certification_code` IS NULL;
