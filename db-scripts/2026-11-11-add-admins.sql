-- ============================================================================
-- Iraje website: add two admin accounts
-- Date:    2026-11-11
-- Target:  the website's production MySQL database (Cloud SQL), table `users`
--
-- Adds:
--   sam@iraje.com            (Sam)
--   kaushal.mehta@iraje.com  (Kaushal Mehta)
--
-- Each account gets a TEMPORARY password (stored only as a bcrypt hash below).
-- The temporary passwords are sent to the two people separately, never in this
-- file. On first sign-in at https://iraje.com/admin/login the website forces
-- them to choose their own password. The temporary password expires 14 days
-- after this script runs.
--
-- How to run:
--   1. Select the website's database (the one that has the `users` table),
--      e.g. uncomment and edit:   -- USE your_database_name;
--   2. Run the whole file. Expected result: "2 rows affected" on the INSERT,
--      and the final SELECT lists the admins, including these two.
--
-- If it fails with "Duplicate entry ... for key 'users_email_key'":
--   that email already has an account. Nothing is changed (the transaction is
--   rolled back automatically on error in most clients; otherwise run ROLLBACK).
--   Report back which email it was; do not edit the row by hand.
--
-- Safe to review: no table structure changes, no updates or deletes.
-- ============================================================================

-- USE your_database_name;

START TRANSACTION;

INSERT INTO users
  (email, name, password_hash, role, status, must_change_password,
   temp_password_expires_at, login_count, created_at, updated_at)
VALUES
  ('sam@iraje.com', 'Sam',
   '$2b$12$18sW1QbW1p0CahHPzzGIpeqpJmLAnf9lsSIKogctiLRck7VeyBaJq',
   'admin', 'active', 1,
   DATE_ADD(UTC_TIMESTAMP(), INTERVAL 14 DAY), 0, UTC_TIMESTAMP(), UTC_TIMESTAMP()),

  ('kaushal.mehta@iraje.com', 'Kaushal Mehta',
   '$2b$12$GNdMCGlugU2HMQgwVL9jMuIW2S4YtH29OiZHOhmFyGrNasSLjwprW',
   'admin', 'active', 1,
   DATE_ADD(UTC_TIMESTAMP(), INTERVAL 14 DAY), 0, UTC_TIMESTAMP(), UTC_TIMESTAMP());

COMMIT;

-- Verification: should list every admin, including the two above with
-- must_change_password = 1.
SELECT id, email, name, role, status, must_change_password, temp_password_expires_at
FROM users
WHERE role = 'admin'
ORDER BY id;
