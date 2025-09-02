-- supabase/migrations/20250902100000_create_chat_tables.sql

-- Create a table for chat conversations
CREATE TABLE public.chat_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) NOT NULL,
    nurse_id UUID REFERENCES public.profiles(id), -- The nurse who claimed the chat
    status TEXT NOT NULL DEFAULT 'open', -- 'open', 'active', 'closed'
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add RLS policies for conversations
ALTER TABLE public.chat_conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own conversations"
ON public.chat_conversations FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create conversations"
ON public.chat_conversations FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Nurses would need broader access, typically handled via a service role key on the backend
-- or a custom function that checks if the user has a 'nurse' role.
-- For now, we'll assume a secure backend will handle nurse interactions.


-- Create a table for chat messages
CREATE TABLE public.chat_messages (
    id BIGSERIAL PRIMARY KEY,
    conversation_id UUID REFERENCES public.chat_conversations(id) ON DELETE CASCADE NOT NULL,
    sender_id UUID REFERENCES public.profiles(id), -- Can be null for AI messages
    sender_type TEXT NOT NULL, -- 'user', 'nurse', 'ai'
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add RLS policies for messages
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view messages in their own conversations"
ON public.chat_messages FOR SELECT
USING (
    conversation_id IN (
        SELECT id FROM public.chat_conversations WHERE user_id = auth.uid()
    )
);

CREATE POLICY "Users can insert messages in their own conversations"
ON public.chat_messages FOR INSERT
WITH CHECK (
    sender_id = auth.uid() AND
    sender_type = 'user' AND
    conversation_id IN (
        SELECT id FROM public.chat_conversations WHERE user_id = auth.uid() AND status != 'closed'
    )
);

-- Enable real-time notifications for new messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_conversations;

-- Function to create a new conversation and send an initial AI message
CREATE OR REPLACE FUNCTION create_conversation_with_ai_message(
    user_message TEXT
) RETURNS UUID AS $$
DECLARE
    new_conversation_id UUID;
    user_id UUID := auth.uid();
BEGIN
    -- Create a new conversation
    INSERT INTO public.chat_conversations (user_id)
    VALUES (user_id)
    RETURNING id INTO new_conversation_id;

    -- Insert the user's first message
    INSERT INTO public.chat_messages (conversation_id, sender_id, sender_type, content)
    VALUES (new_conversation_id, user_id, 'user', user_message);

    -- Here you would typically trigger a call to an edge function for an AI response.
    -- For now, we'll just insert a placeholder AI response.
    INSERT INTO public.chat_messages (conversation_id, sender_type, content)
    VALUES (new_conversation_id, 'ai', 'Thank you for your message. An AI assistant will be with you shortly. If you need to speak to a nurse, please let us know.');

    RETURN new_conversation_id;
END;
$$ LANGUAGE plpgsql;
