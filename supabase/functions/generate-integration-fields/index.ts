import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
};

Deno.serve(async (req) => {
  // CORS Preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { status: 200, headers: corsHeaders });
  }

  try {
    console.log("🔹 Request received");

    // קבלת שם
    let name;
    try {
      const body = await req.json();
      console.log("🔸 Request body:", body);
      name = body.name;
    } catch (e) {
      console.log("❌ Failed to parse JSON", e);
      return new Response(JSON.stringify({ error: "Invalid JSON" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!name) {
      console.log("❗ No name provided");
      return new Response(JSON.stringify({ error: "Missing name" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!OPENAI_API_KEY) {
      console.log("❗ Missing OPENAI_API_KEY");
      return new Response(JSON.stringify({ error: "No API key" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const prompt = `You are an API metadata assistant.

    Return a valid JSON object only (no explanation), for the integration "${name}" with the following fields:
    
    {
      "description": "...",
      "api_docs_url": "...",
      "sample_config": "..."
    }
    
    Do not include any text before or after the JSON.
    Only return a valid, parseable JSON object.`;


    console.log("📤 Sending prompt to OpenAI:", prompt);

    const completion = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
      }),
    });

    const data = await completion.json();
    console.log("📥 Response from OpenAI:", data);

    const message = data.choices?.[0]?.message?.content || "";
    console.log("🧾 Message content:", message);

    let result;
    try {
      result = JSON.parse(message);
    } catch {
      const match = message.match(/\{[\s\S]*\}/);

      if (match) {
        try {
          const cleaned = match[0]
            .replace(/[“”]/g, '"')        
            .replace(/\\n/g, '')          
            .replace(/\s+/g, ' ')        

          console.log("🧹 Cleaned matched string:", cleaned);
          result = JSON.parse(cleaned);
        } catch (e) {
          console.log("⚠️ Failed to parse cleaned JSON:", match[0]);
          result = { description: "", api_docs_url: "", sample_config: "" };
        }
      } else {
        console.log("❌ No JSON object found at all in message:", message);
        result = { description: "", api_docs_url: "", sample_config: "" };
      }
    }



    return new Response(JSON.stringify({ result }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.log("🔥 Unhandled error:", e);
    return new Response(JSON.stringify({ error: "Internal server error." }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
