-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS handle_new_profile ON profiles;

-- Create or replace trigger function
CREATE OR REPLACE FUNCTION public.handle_new_profile()
RETURNS TRIGGER AS $$
BEGIN
  -- Set default values if not provided
  NEW.created_at = COALESCE(NEW.created_at, NOW());
  NEW.updated_at = COALESCE(NEW.updated_at, NOW());
  NEW.role = COALESCE(NEW.role, 'user');
  NEW.display_name = COALESCE(NEW.display_name, NEW.username);
  NEW.avatar_url = COALESCE(
    NEW.avatar_url, 
    'https://api.dicebear.com/7.x/avataaars/svg?seed=' || NEW.username
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger
CREATE TRIGGER handle_new_profile
  BEFORE INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_profile();
