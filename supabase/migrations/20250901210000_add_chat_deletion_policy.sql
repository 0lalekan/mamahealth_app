-- Enable cascade delete for chat messages when a conversation is deleted
ALTER TABLE public.chat_messages
DROP CONSTRAINT IF EXISTS chat_messages_conversation_id_fkey,
ADD CONSTRAINT chat_messages_conversation_id_fkey
  FOREIGN KEY (conversation_id)
  REFERENCES public.chat_conversations(id)
  ON DELETE CASCADE;

-- Allow users to delete their own conversations
DROP POLICY IF EXISTS "Users can delete their own conversations" ON public.chat_conversations;
CREATE POLICY "Users can delete their own conversations"
ON public.chat_conversations
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);
