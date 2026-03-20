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

    // Add contact to SendGrid Marketing contacts
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
        subject: "You're in. Here's what to expect.",
        content: [
          {
            type: "text/html",
            value: `
<div style="font-family: Georgia, 'Times New Roman', serif; max-width: 560px; margin: 0 auto; color: #1a1a1a; padding: 20px;">
  <p style="font-family: Arial, sans-serif; font-size: 13px; color: #0d7680; letter-spacing: 0.05em; text-transform: uppercase; margin-bottom: 20px;">&#9670; The Cooling Report</p>

  <h1 style="font-size: 24px; font-weight: 700; line-height: 1.3; margin-bottom: 20px;">Welcome.</h1>

  <p style="font-size: 15px; line-height: 1.75; color: #4a4a4a; margin-bottom: 16px;">You just signed up for the only publication covering the business of data center cooling as a dedicated beat.</p>

  <p style="font-size: 15px; line-height: 1.75; color: #4a4a4a; margin-bottom: 16px;">Here is what lands in your inbox:</p>

  <p style="font-size: 15px; line-height: 1.75; color: #4a4a4a; margin-bottom: 6px;"><strong style="color: #1a1a1a;">Cooling Bytes</strong> (weekly)</p>
  <p style="font-size: 14px; line-height: 1.65; color: #807060; margin-bottom: 16px; margin-top: 0;">The deals, moves, and signals that matter. Scannable. No filler.</p>

  <p style="font-size: 15px; line-height: 1.75; color: #4a4a4a; margin-bottom: 6px;"><strong style="color: #1a1a1a;">This Week in Cooling</strong> (Friday)</p>
  <p style="font-size: 14px; line-height: 1.65; color: #807060; margin-bottom: 16px; margin-top: 0;">A dispatch covering what happened and what to watch next.</p>

  <p style="font-size: 15px; line-height: 1.75; color: #4a4a4a; margin-bottom: 6px;"><strong style="color: #1a1a1a;">Intel</strong> (free articles)</p>
  <p style="font-size: 14px; line-height: 1.65; color: #807060; margin-bottom: 16px; margin-top: 0;">Analysis and editorial on what is shaping the data center cooling industry.</p>

  <p style="font-size: 15px; line-height: 1.75; color: #4a4a4a; margin-bottom: 24px;">If you want access to our weekly deep dives, competitive landscapes, and market maps, paid subscriptions start at <a href="https://thecoolingreport.com/#pricing" style="color: #0d7680;">$19/month</a>.</p>

  <p style="font-size: 15px; line-height: 1.75; color: #4a4a4a; margin-bottom: 24px;">In the meantime, check out the latest on the <a href="https://thecoolingreport.com/intel.html" style="color: #0d7680;">Intel page</a>.</p>

  <p style="font-size: 15px; line-height: 1.75; color: #4a4a4a;">Talk soon.</p>

  <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e0cdb8;">
    <p style="font-size: 13px; color: #807060; margin: 0;">The Cooling Report</p>
    <p style="font-size: 13px; color: #807060; margin: 4px 0 0;">Business intelligence for data center cooling.</p>
    <p style="font-size: 13px; margin: 8px 0 0;"><a href="https://thecoolingreport.com" style="color: #0d7680;">thecoolingreport.com</a></p>
  </div>
</div>
            `,
          },
        ],
      }),
    });

    if (!mailRes.ok) {
      const err = await mailRes.text();
      console.error("SendGrid mail error:", err);
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
