-- Direct messages policies
CREATE POLICY "Users can view their direct messages"
    ON direct_messages FOR SELECT
    TO authenticated
    USING (
        sender_id = auth.uid() 
        OR receiver_id = auth.uid()
    );

CREATE POLICY "Users can send direct messages"
    ON direct_messages FOR INSERT
    TO authenticated
    WITH CHECK (
        sender_id = auth.uid() 
        AND conversation_id IN (
            SELECT id FROM conversations 
            WHERE user1_id = auth.uid() 
            OR user2_id = auth.uid()
        )
    );

-- Add index for common direct message queries
CREATE INDEX IF NOT EXISTS idx_direct_messages_participants 
    ON direct_messages(sender_id, receiver_id);
