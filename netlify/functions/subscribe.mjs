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

    const apiKey = Netlify.env.get("SENDGRID_API_KEY");
    const senderEmail = Netlify.env.get("SENDER_EMAIL");

    // Add contact to SendGrid Marketing list
    const contactRes = await fetch("https://api.sendgrid.com/v3/marketing/contacts", {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contacts: [{ email }],
      }),
    });

    if (!contactRes.ok) {
      const err = await contactRes.text();
      console.error("SendGrid contact error:", err);
      return new Response(JSON.stringify({ error: "Failed to add contact" }), {
        status: 500,
        headers,
      });
    }

    // Send welcome email
    const mailRes = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email }] }],
        from: {
          email: senderEmail,
          name: "The Cooling Report",
        },
        subject: "Welcome to The Cooling Report",
        content: [
          {
            type: "text/html",
            value: `
              <div style="font-family: Georgia, serif; max-width: 560px; margin: 0 auto; color: #1a1a1a;">
                <h1 style="font-size: 22px; font-weight: 700; margin-bottom: 16px;">Welcome to The Cooling Report.</h1>
                <p style="font-size: 15px; line-height: 1.7; color: #4a4a4a;">You are now on the list. Every week you will receive Cooling Bytes (our news roundup) and The Week Ahead (our Monday briefing on what to watch).</p>
                <p style="font-size: 15px; line-height: 1.7; color: #4a4a4a;">We cover the business of data center cooling. Land deals, M&A, competitive moves, regulation, and supply chain intelligence across liquid cooling, immersion cooling, and thermal management.</p>
                <p style="font-size: 15px; line-height: 1.7; color: #4a4a4a;">If you want access to our weekly deep dives, competitive landscapes, and market maps, you can upgrade to a paid subscription at <a href="https://thecoolingreport.com/#pricing" style="color: #0d7680;">thecoolingreport.com</a>.</p>
                <p style="font-size: 15px; line-height: 1.7; color: #4a4a4a;">Talk soon.</p>
                <p style="font-size: 13px; color: #807060; margin-top: 32px; padding-top: 16px; border-top: 1px solid #e0cdb8;">The Cooling Report<br>Business intelligence for data center cooling.</p>
              </div>
            `,
          },
        ],
      }),
    });

    if (!mailRes.ok) {
      const err = await mailRes.text();
      console.error("SendGrid mail error:", err);
      // Contact was still added, so we don't fail completely
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
