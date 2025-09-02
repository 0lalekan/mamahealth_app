import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const TELEGRAM_BOT_TOKEN = Deno.env.get("TELEGRAM_BOT_TOKEN");
const TELEGRAM_GROUP_ID = Deno.env.get("TELEGRAM_GROUP_ID");
const TELEGRAM_BOT_USERNAME = Deno.env.get("TELEGRAM_BOT_USERNAME");

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_GROUP_ID || !TELEGRAM_BOT_USERNAME) {
      throw new Error("Telegram environment variables (TELEGRAM_BOT_TOKEN, TELEGRAM_GROUP_ID, TELEGRAM_BOT_USERNAME) are not set.");
    }

    const { message, conversation_id, user_id } = await req.json();

    if (!message || !conversation_id || !user_id) {
      throw new Error("`message`, `conversation_id`, and `user_id` are required.");
    }

    // The text includes metadata that the webhook will parse from a nurse's reply.
    const text = `User: ${user_id}\nConversation: ${conversation_id}\n\nMessage: ${message}`;

    const replyMarkup = {
      inline_keyboard: [
        [
          {
            text: "✍️ Reply Privately",
            url: `https://t.me/${TELEGRAM_BOT_USERNAME}?start=${conversation_id}`
          }
        ]
      ]
    };

    const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: TELEGRAM_GROUP_ID,
        text: text,
        reply_markup: replyMarkup
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Telegram API error: ${response.statusText} - ${errorBody}`);
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("Error in telegram-chat function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
