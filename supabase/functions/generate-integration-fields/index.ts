import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
};

// Helper to check if a URL is valid (returns 200)
async function isValidImageUrl(url: string): Promise<boolean> {
  try {
    const res = await fetch(url, { method: "HEAD" });
    return res.ok && res.headers.get("content-type")?.startsWith("image/");
  } catch {
    return false;
  }
}

Deno.serve(async (req) => {
  // CORS Preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { status: 200, headers: corsHeaders });
  }

  try {
    console.log("🔹 Request received");

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

    const prompt = `Return a valid JSON object only (no explanation), for the integration "${name}" with the following fields:

    {
      "name": (the name of the integration),
      "description": (a short description of the integration),
      "api_docs_url": (a direct URL to the API documentation),
      "sample_config": (an example of a configuration string),
      "logo_url": (a direct URL to a logo image),
      "tags": (a comma-separated string, e.g., "email,communication,Google"),
      "supplier": (name of the provider/supplier),
      "integration_type": (one of the following: "Invoicing & Billing", "SMS & Messaging", "Chat & Instant Messaging", "Major CRMs", "Email Services", or "Payment Processors")
    }
    
    Make sure:
    - All fields are filled with meaningful data based on the integration.
    - "integration_type" must exactly match one of the allowed values above.
    - "tags" must be a string, not an array.
    - Do not include any explanation or text before/after the JSON.
    Return only valid JSON.`;
    


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
            .replace(/[""]/g, '"')
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

    // After parsing the AI result:
    if (result.logo_url && !(await isValidImageUrl(result.logo_url))) {
      // Fallback to a default logo if the AI's logo_url is invalid
      result.logo_url = "https://ui-avatars.com/api/?name=" + encodeURIComponent(result.name || "Integration");
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
