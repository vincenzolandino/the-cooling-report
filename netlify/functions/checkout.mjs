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
    const { plan } = await req.json();
    const stripeKey = Netlify.env.get("STRIPE_SECRET_KEY");

    const priceIds = {
      monthly: "price_1TCtAaIpc6CxXNhqVaYns26h",
      annual: "price_1TCtBIIpc6CxXNhqA8I0CJpv",
    };

    const priceId = priceIds[plan];
    if (!priceId) {
      return new Response(JSON.stringify({ error: "Invalid plan" }), {
        status: 400,
        headers,
      });
    }

    // Create Stripe Checkout session
    const params = new URLSearchParams();
    params.append("mode", "subscription");
    params.append("success_url", "https://thecoolingreport.com/success.html");
    params.append("cancel_url", "https://thecoolingreport.com/#pricing");
    params.append("line_items[0][price]", priceId);
    params.append("line_items[0][quantity]", "1");
    params.append("allow_promotion_codes", "true");

    const res = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        Authorization: `Basic ${btoa(stripeKey + ":")}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });

    const session = await res.json();

    if (session.error) {
      console.error("Stripe error:", session.error.message);
      return new Response(JSON.stringify({ error: session.error.message }), {
        status: 400,
        headers,
      });
    }

    return new Response(JSON.stringify({ url: session.url }), {
      status: 200,
      headers,
    });
  } catch (err) {
    console.error("Checkout error:", err);
    return new Response(JSON.stringify({ error: "Server error" }), {
      status: 500,
      headers,
    });
  }
};
