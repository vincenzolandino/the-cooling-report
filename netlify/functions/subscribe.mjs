export default async (req) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json",
  };

  if (req.method === "OPTIONS") {
    return new Response("", { status: 200, headers });
  }

  try {
    const { email } = await req.json();

    if (!email || !email.includes("@")) {
      return new Response(JSON.stringify({ error: "Valid email required" }), {
        status: 400,
        headers,
      });
    }

    // Send to GoHighLevel webhook
    const ghlRes = await fetch(
      "https://services.leadconnectorhq.com/hooks/H2bCT1cXzD1lf1aK7QAU/webhook-trigger/2fab1ef6-9ad1-4a30-a744-8687e378efd2",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          source: "thecoolingreport.com",
          tags: ["free-subscriber", "website-signup"],
        }),
      }
    );

    if (!ghlRes.ok) {
      const err = await ghlRes.text();
      console.error("GHL webhook error:", err);
      return new Response(JSON.stringify({ error: "Failed to subscribe" }), {
        status: 500,
        headers,
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers,
    });
  } catch (err) {
    console.error("Subscribe function error:", err);
    return new Response(JSON.stringify({ error: "Server error" }), {
      status: 500,
      headers,
    });
  }
};
