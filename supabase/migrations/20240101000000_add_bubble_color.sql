-- Add bubble_color column to messages table
ALTER TABLE public.messages
ADD COLUMN IF NOT EXISTS bubble_color text;
