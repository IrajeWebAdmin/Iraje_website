-- ===========================================================================
-- One-time data fix: normalise `certification_enrollment.certifications` to
-- the canonical, URL-safe certification codes.
--
-- Context: src/data/certification.js used to store display strings as the
-- identifier, and /api/enroll wrote whatever `certStep` said. Three spellings
-- of the same two CyberTantra certifications were accumulating:
--     "CT 101"  /  "CyberTantra 101"  /  "CT101"
-- Once these codes become Sanity references and prerequisite lookups, the
-- mismatch breaks silently. The data layer now stores `code` (stable) and
-- `label` (display) separately; this brings existing rows in line.
--
-- Canonical set: PAM101 PAM201 EPM101 EPM201 CT101 CT201
--
-- Safe to run more than once: REPLACE finds nothing on already-migrated rows.
-- Run AFTER deploying the src/data/certification.js change, so no new rows
-- land in the old format between the update and the deploy.
-- ===========================================================================

-- ---- 1. Dry run: see exactly which rows will change ------------------------
SELECT id, email, certifications AS before_value
FROM certification_enrollment
WHERE certifications LIKE '%PAM 101%'
   OR certifications LIKE '%PAM 201%'
   OR certifications LIKE '%EPM 101%'
   OR certifications LIKE '%EPM 201%'
   OR certifications LIKE '%CT 101%'
   OR certifications LIKE '%CT 201%'
   OR certifications LIKE '%CyberTantra 101%'
   OR certifications LIKE '%CyberTantra 201%';

-- ---- 2. Apply -------------------------------------------------------------
-- Longest tokens first: "CyberTantra 101" must collapse before "CT 101" is
-- considered, or a partial rewrite could leave a half-converted value.
START TRANSACTION;

UPDATE certification_enrollment
SET certifications =
  REPLACE(
  REPLACE(
  REPLACE(
  REPLACE(
  REPLACE(
  REPLACE(
  REPLACE(
  REPLACE(certifications,
    'CyberTantra 101', 'CT101'),
    'CyberTantra 201', 'CT201'),
    'CT 101',          'CT101'),
    'CT 201',          'CT201'),
    'PAM 101',         'PAM101'),
    'PAM 201',         'PAM201'),
    'EPM 101',         'EPM101'),
    'EPM 201',         'EPM201')
WHERE certifications LIKE '%PAM 101%'
   OR certifications LIKE '%PAM 201%'
   OR certifications LIKE '%EPM 101%'
   OR certifications LIKE '%EPM 201%'
   OR certifications LIKE '%CT 101%'
   OR certifications LIKE '%CT 201%'
   OR certifications LIKE '%CyberTantra 101%'
   OR certifications LIKE '%CyberTantra 201%';

COMMIT;

-- ---- 3. Verify: this must return zero rows --------------------------------
SELECT id, email, certifications
FROM certification_enrollment
WHERE certifications REGEXP '(PAM|EPM|CT) [0-9]'
   OR certifications LIKE '%CyberTantra%';
