import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { diseases, symptoms, questionHistory, answerHistory } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const diseaseList = diseases.map((d: any) => `${d.name} (${d.confidence}%)`).join(', ');
    const historyContext = questionHistory.length > 0 
      ? `\nPrevious questions: ${questionHistory.join('; ')}\nPrevious answers: ${answerHistory.join('; ')}`
      : '';

    const systemPrompt = `You are a medical diagnostic assistant. Generate a yes/no question to help narrow down the diagnosis.
Return JSON with this exact structure:
{
  "question": "Your question here?",
  "diseaseImpacts": {
    "disease_id_1": 10,
    "disease_id_2": -15
  }
}
The question should help differentiate between the current possible diseases.
Impact values: positive numbers increase confidence, negative decrease it (range: -20 to +20).`;

    const userPrompt = `Current symptoms: ${symptoms}
Current possible diseases: ${diseaseList}${historyContext}

Generate a yes/no question to help narrow down the diagnosis.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limits exceeded" }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required" }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    // Extract JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    const result = jsonMatch ? JSON.parse(jsonMatch[0]) : null;

    if (!result || !result.question) {
      throw new Error("Invalid response format");
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-follow-up error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
