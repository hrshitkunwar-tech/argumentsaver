export default {
  async fetch(request, env) {
    // 1. CORS Preflight
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, X-App-Secret",
        },
      });
    }

    if (request.method !== "POST") {
      return new Response("Method not allowed", { status: 405 });
    }

    try {
      // 2. Parse request body
      const body = await request.json();

      // 3. Security: Check for App Secret handshake
      const authHeader = request.headers.get("X-App-Secret");
      if (authHeader !== env.APP_X_SECRET) {
        return new Response("Unauthorized", { 
          status: 401,
          headers: { "Access-Control-Allow-Origin": "*" }
        });
      }

      // 4. Forward to Grok API
      const grokResponse = await fetch(`${env.GROK_API_BASE}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${env.GROK_API_KEY}`,
        },
        body: JSON.stringify(body),
      });

      // 5. Proxy response back to app
      const data = await grokResponse.text();
      return new Response(data, {
        status: grokResponse.status,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Content-Type": "application/json",
        },
      });
    } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), {
        status: 500,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Content-Type": "application/json",
        },
      });
    }
  },
};
