-- Create user_preferences table
CREATE TABLE IF NOT EXISTS user_preferences (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    notifications_enabled BOOLEAN DEFAULT true,
    theme_preference TEXT DEFAULT 'system',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own preferences"
    ON user_preferences FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY "Users can update their own preferences"
    ON user_preferences FOR UPDATE
    TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own preferences"
    ON user_preferences FOR INSERT
    TO authenticated
    WITH CHECK (user_id = auth.uid());
