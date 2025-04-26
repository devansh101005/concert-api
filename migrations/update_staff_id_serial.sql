-- Drop foreign key constraints referencing staff.staff_id (if any)
-- None identified in the schema

-- Drop primary key constraint on staff.staff_id
ALTER TABLE staff DROP CONSTRAINT IF EXISTS staff_pkey;

-- Create sequence if not exists
CREATE SEQUENCE IF NOT EXISTS staff_staff_id_seq;

-- Set default value for staff_id
ALTER TABLE staff ALTER COLUMN staff_id SET DEFAULT nextval('staff_staff_id_seq');

-- Set sequence ownership
ALTER SEQUENCE staff_staff_id_seq OWNED BY staff.staff_id;

-- Add primary key constraint back
ALTER TABLE staff ADD CONSTRAINT staff_pkey PRIMARY KEY (staff_id);

-- Update the sequence to start from the maximum existing staff_id + 1
SELECT setval('staff_staff_id_seq', COALESCE((SELECT MAX(staff_id) FROM staff), 0) + 1, false);