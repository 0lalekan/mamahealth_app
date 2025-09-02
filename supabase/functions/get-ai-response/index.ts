import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type"
};
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
serve(async (req)=>{
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders
    });
  }
  try {
    const { message, conversation_id, is_premium, week } = await req.json();
    const groqApiKey = Deno.env.get("GROQ_API_KEY");
    if (!groqApiKey) {
      throw new Error("GROQ_API_KEY is not set in environment variables.");
    }

    // --- CHAT LOGIC ---
    if (conversation_id) {
      if (!message) {
        throw new Error("message is required for chat.");
      }
      const systemPrompt = "You are a helpful and empathetic AI assistant for an app called MamaCare, designed to support pregnant women in Nigeria. Provide concise, safe, and reassuring advice. If a question seems urgent or high-risk (e.g., mentions bleeding, severe pain, etc.), strongly advise the user to contact a healthcare professional or call 112 (emergency number) immediately. Do not provide medical diagnoses.";
      
      const response = await fetch(GROQ_API_URL, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${groqApiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "llama-3.1-70b-versatile",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: message }
          ],
          temperature: 0.7,
          max_tokens: 250
        })
      });

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`Groq API error: ${response.statusText} - ${errorBody}`);
      }

      const result = await response.json();
      const reply = result.choices[0]?.message?.content?.trim();
      if (!reply) {
        throw new Error("Failed to get a valid reply from AI.");
      }

      const supabaseAdmin = createClient(Deno.env.get("SUPABASE_URL") ?? '', Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? '');
      const { error: insertError } = await supabaseAdmin.from("chat_messages").insert({
        conversation_id: conversation_id,
        content: reply,
        sender_type: "ai"
      });

      if (insertError) {
        throw new Error(`Failed to save AI response: ${insertError.message}`);
      }

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200
      });

    // --- SYMPTOM CHECKER LOGIC ---
    } else {
      if (!message) {
        throw new Error("message is required for symptom analysis.");
      }
      
      let systemPrompt;
      if (is_premium) {
        systemPrompt = `You are an AI medical assistant for MamaCare. A user, who is ${week || 'in an unknown week of'} pregnancy, is reporting symptoms. Analyze these symptoms and provide a structured JSON response with three keys: "riskLevel" (string: "low", "medium", or "high"), "causes" (array of strings), and "recommendations" (array of strings with actionable advice). Prioritize safety; if symptoms suggest high risk, set riskLevel to "high" and advise immediate medical attention.`;
      } else {
        systemPrompt = `You are an AI medical assistant for MamaCare. A user, who is ${week || 'in an unknown week of'} pregnancy, is reporting symptoms. Provide a limited analysis as a structured JSON response with two keys: "riskLevel" (string: "low", "medium", or "high") and "recommendations" (an array with a single, concise string of general advice). Recommend upgrading for details. If symptoms suggest high risk, set riskLevel to "high" and advise immediate medical attention.`;
      }

      const response = await fetch(GROQ_API_URL, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${groqApiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "llama-3.1-70b-versatile",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: message }
          ],
          temperature: 0.7,
          max_tokens: 400,
          response_format: { type: "json_object" },
        })
      });

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`Groq API error: ${response.statusText} - ${errorBody}`);
      }

      const result = await response.json();
      const analysisText = result.choices[0]?.message?.content?.trim();
      if (!analysisText) {
        throw new Error("Failed to get a valid analysis from AI.");
      }

      // The AI is instructed to return JSON, but we parse it to be safe.
      const analysis = JSON.parse(analysisText);

      return new Response(JSON.stringify({ success: true, analysis }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200
      });
    }
  } catch (error) {
    console.error("Error in function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500
    });
  }
});
