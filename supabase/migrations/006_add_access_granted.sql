-- Add access_granted column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'cases' AND column_name = 'access_granted'
  ) THEN
    ALTER TABLE cases ADD COLUMN access_granted boolean DEFAULT false;
  END IF;
END $$;
