-- Add NOT NULL constraints if not already set
DO $$ 
BEGIN 
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' 
    AND column_name = 'username' 
    AND is_nullable = 'NO'
  ) THEN
    ALTER TABLE profiles ALTER COLUMN username SET NOT NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' 
    AND column_name = 'display_name' 
    AND is_nullable = 'NO'
  ) THEN
    ALTER TABLE profiles ALTER COLUMN display_name SET NOT NULL;
  END IF;
END $$;

-- Add unique constraint if not exists
DO $$ 
BEGIN 
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'profiles_username_key'
  ) THEN
    ALTER TABLE profiles ADD CONSTRAINT profiles_username_key UNIQUE (username);
  END IF;
END $$;

-- Add missing indexes if they don't exist
DO $$ 
BEGIN 
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE indexname = 'idx_profiles_username'
  ) THEN
    CREATE INDEX idx_profiles_username ON profiles(username);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE indexname = 'idx_messages_created_at'
  ) THEN
    CREATE INDEX idx_messages_created_at ON messages(created_at);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE indexname = 'idx_direct_messages_created_at'
  ) THEN
    CREATE INDEX idx_direct_messages_created_at ON direct_messages(created_at);
  END IF;
END $$;
