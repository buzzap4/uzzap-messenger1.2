-- Add bubble_color column to direct_messages table
ALTER TABLE public.direct_messages
ADD COLUMN IF NOT EXISTS bubble_color text;
