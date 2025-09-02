import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseAdmin = createClient(
  Deno.env.get("SUPABASE_URL") ?? '',
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ''
);

serve(async (req) => {
  try {
    const payload = await req.json();
    const botToken = Deno.env.get("TELEGRAM_BOT_TOKEN");

    // Helper function to send a message back to the nurse
    const sendToNurse = async (chatId, text) => {
      await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: chatId, text: text, parse_mode: 'MarkdownV2' }),
      });
    };

    // Scenario 1: A nurse replies directly in the group (fallback)
    if (payload.message && payload.message.reply_to_message && payload.message.text) {
      const originalMessage = payload.message.reply_to_message.text;
      const nurseReply = payload.message.text;
      const conversationIdMatch = originalMessage.match(/Conversation: (\S+)/);
      
      if (conversationIdMatch && conversationIdMatch[1]) {
        const conversation_id = conversationIdMatch[1];
        const { error } = await supabaseAdmin.from("chat_messages").insert({
          conversation_id: conversation_id,
          content: nurseReply,
          sender_type: "nurse",
        });
        if (error) throw new Error(`Failed to save group reply: ${error.message}`);
      }
    
    // Scenario 2: A nurse interacts with the bot in a private chat
    } else if (payload.message && payload.message.chat.type === 'private' && payload.message.text) {
      const text = payload.message.text;
      const nurseId = payload.message.chat.id;

      // A nurse clicks "Reply Privately", starting a session
      if (text.startsWith('/start ')) {
        const conversation_id = text.split(' ')[1];
        
        // Store the session in the database
        const { error } = await supabaseAdmin
          .from('telegram_nurse_sessions')
          .upsert({ nurse_telegram_id: nurseId, active_conversation_id: conversation_id }, { onConflict: 'nurse_telegram_id' });

        if (error) throw new Error(`Failed to create nurse session: ${error.message}`);

        await sendToNurse(nurseId, `You are now replying to conversation \`${conversation_id}\`\\. All messages you send here will be forwarded to the user\\. Send \`/end\` to stop.`);
      
      // A nurse wants to end the current session
      } else if (text.trim().toLowerCase() === '/end') {
          const { error } = await supabaseAdmin.from('telegram_nurse_sessions').delete().eq('nurse_telegram_id', nurseId);
          if (error) throw new Error(`Failed to end session: ${error.message}`);
          await sendToNurse(nurseId, "Session ended\\. You can now reply to another conversation from the group\\.");

      // A nurse sends a regular message, which we treat as a reply
      } else {
        // Find the nurse's active session
        const { data: session, error: sessionError } = await supabaseAdmin
          .from('telegram_nurse_sessions')
          .select('active_conversation_id')
          .eq('nurse_telegram_id', nurseId)
          .single();

        if (sessionError || !session) {
          await sendToNurse(nurseId, "I don't have an active conversation for you\\. Please go to the group and click 'Reply Privately' on a user's message first\\.");
          return new Response("ok");
        }

        // Forward the nurse's message to the user
        const { error: insertError } = await supabaseAdmin.from("chat_messages").insert({
          conversation_id: session.active_conversation_id,
          content: text,
          sender_type: "nurse",
        });

        if (insertError) throw new Error(`Failed to save private reply: ${insertError.message}`);
        
        // Optionally, confirm to the nurse that the message was sent
        // await sendToNurse(nurseId, "✅ Sent"); 
      }
    }

    return new Response("ok", { status: 200 });

  } catch (error) {
    console.error("Error in telegram-webhook:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
});
