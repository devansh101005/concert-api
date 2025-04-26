-- Drop foreign key constraint on ticket.buyer_id
ALTER TABLE ticket DROP CONSTRAINT IF EXISTS ticket_buyer_id_fkey;

-- Drop primary key constraint on buyer.buyer_id with cascade
ALTER TABLE buyer DROP CONSTRAINT IF EXISTS buyer_pkey CASCADE;

-- Create sequence if not exists
CREATE SEQUENCE IF NOT EXISTS buyer_buyer_id_seq;

-- Set default value for buyer_id
ALTER TABLE buyer ALTER COLUMN buyer_id SET DEFAULT nextval('buyer_buyer_id_seq');

-- Set sequence ownership
ALTER SEQUENCE buyer_buyer_id_seq OWNED BY buyer.buyer_id;

-- Add primary key constraint back
ALTER TABLE buyer ADD CONSTRAINT buyer_pkey PRIMARY KEY (buyer_id);

-- Recreate foreign key constraint on ticket.buyer_id
ALTER TABLE ticket ADD CONSTRAINT ticket_buyer_id_fkey FOREIGN KEY (buyer_id) REFERENCES buyer(buyer_id);

-- Reset the sequence to start from a value higher than any existing buyer_id
SELECT setval('buyer_buyer_id_seq', (SELECT COALESCE(MAX(buyer_id), 0) FROM buyer));
