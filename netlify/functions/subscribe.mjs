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

    const apiKey = Netlify.env.get("RESEND_API_KEY");
    const audienceId = Netlify.env.get("RESEND_AUDIENCE_ID");
    const senderEmail = Netlify.env.get("SENDER_EMAIL");

    // Add contact to Resend audience
    const contactRes = await fetch(`https://api.resend.com/audiences/${audienceId}/contacts`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });

    if (!contactRes.ok) {
      const err = await contactRes.text();
      console.error("Resend contact error:", err);
      return new Response(JSON.stringify({ error: "Failed to add contact" }), {
        status: 500,
        headers,
      });
    }

    // Send welcome email
    const mailRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: `The Cooling Report <${senderEmail}>`,
        to: [email],
        subject: "You're in.",
        html: freeWelcomeEmail(),
      }),
    });

    if (!mailRes.ok) {
      const err = await mailRes.text();
      console.error("Resend mail error:", err);
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

function freeWelcomeEmail() {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin: 0; padding: 0; background-color: #fff1e5; font-family: Georgia, 'Times New Roman', serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fff1e5; padding: 40px 20px;">
<tr><td align="center">
<table width="560" cellpadding="0" cellspacing="0" style="max-width: 560px; width: 100%;">

  <!-- Header bar -->
  <tr><td style="background-color: #0d7680; height: 4px; font-size: 0;">&nbsp;</td></tr>

  <!-- Logo -->
  <tr><td style="padding: 32px 0 28px; font-family: Georgia, serif; font-size: 18px; font-weight: 700; color: #0d7680;">
    &#9670;&nbsp; The Cooling Report
  </td></tr>

  <!-- Headline -->
  <tr><td style="font-family: Georgia, serif; font-size: 32px; font-weight: 700; color: #1a1a1a; line-height: 1.2; padding-bottom: 24px;">
    Welcome to The Cooling Report.
  </td></tr>

  <!-- Body -->
  <tr><td style="font-size: 16px; line-height: 1.75; color: #4a4a4a; padding-bottom: 28px;">
    You signed up for the only publication that covers the business of data center cooling as a dedicated beat. Land deals, M&A, liquid cooling, immersion, regulation, supply chain. We track the competitive moves shaping thermal management infrastructure.
  </td></tr>

  <!-- Divider -->
  <tr><td style="border-top: 1px solid #e0cdb8; padding-top: 28px;"></td></tr>

  <!-- What you get heading -->
  <tr><td style="font-family: Arial, Helvetica, sans-serif; font-size: 11px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: #0d7680; padding-bottom: 20px;">
    WHAT YOU RECEIVE
  </td></tr>

  <!-- Item 1 -->
  <tr><td style="padding-bottom: 20px;">
    <table cellpadding="0" cellspacing="0" width="100%"><tr>
      <td width="40" valign="top" style="font-family: Georgia, serif; font-size: 22px; font-weight: 700; color: #0d7680; padding-top: 2px;">01</td>
      <td style="padding-left: 16px;">
        <p style="margin: 0 0 4px; font-family: Georgia, serif; font-size: 16px; font-weight: 700; color: #1a1a1a;">Cooling Bytes</p>
        <p style="margin: 0; font-size: 14px; color: #807060; line-height: 1.6;">Monday morning roundup. The deals, partnerships, regulation, and technology moves shaping data center cooling that week.</p>
      </td>
    </tr></table>
  </td></tr>

  <!-- Item 2 -->
  <tr><td style="padding-bottom: 20px;">
    <table cellpadding="0" cellspacing="0" width="100%"><tr>
      <td width="40" valign="top" style="font-family: Georgia, serif; font-size: 22px; font-weight: 700; color: #0d7680; padding-top: 2px;">02</td>
      <td style="padding-left: 16px;">
        <p style="margin: 0 0 4px; font-family: Georgia, serif; font-size: 16px; font-weight: 700; color: #1a1a1a;">Intel Articles</p>
        <p style="margin: 0; font-size: 14px; color: #807060; line-height: 1.6;">Deep analysis and editorial on what is shaping the data center cooling industry. Published throughout the week.</p>
      </td>
    </tr></table>
  </td></tr>

  <!-- Item 3 -->
  <tr><td style="padding-bottom: 28px;">
    <table cellpadding="0" cellspacing="0" width="100%"><tr>
      <td width="40" valign="top" style="font-family: Georgia, serif; font-size: 22px; font-weight: 700; color: #0d7680; padding-top: 2px;">03</td>
      <td style="padding-left: 16px;">
        <p style="margin: 0 0 4px; font-family: Georgia, serif; font-size: 16px; font-weight: 700; color: #1a1a1a;">Major Deal Alerts</p>
        <p style="margin: 0; font-size: 14px; color: #807060; line-height: 1.6;">When something big moves in the cooling market, you hear about it.</p>
      </td>
    </tr></table>
  </td></tr>

  <!-- Divider -->
  <tr><td style="border-top: 1px solid #e0cdb8; padding-top: 28px;"></td></tr>

  <!-- Start reading CTA -->
  <tr><td style="font-size: 16px; line-height: 1.75; color: #4a4a4a; padding-bottom: 8px;">
    Start with the latest on the <a href="https://thecoolingreport.com/intel.html" style="color: #0d7680; font-weight: 600;">Intel page</a>.
  </td></tr>

  <tr><td style="font-size: 16px; color: #4a4a4a; padding-bottom: 32px;">Talk soon.</td></tr>

  <!-- Footer -->
  <tr><td style="border-top: 2px solid #0d7680; padding-top: 20px;">
    <p style="margin: 0; font-family: Georgia, serif; font-size: 14px; font-weight: 700; color: #0d7680;">&#9670;&nbsp; The Cooling Report</p>
    <p style="margin: 6px 0 0; font-size: 12px; color: #807060;">Business intelligence for data center cooling.</p>
    <p style="margin: 4px 0 0; font-size: 12px;"><a href="https://thecoolingreport.com" style="color: #0d7680;">thecoolingreport.com</a></p>
  </td></tr>

</table>
</td></tr>
</table>
</body>
</html>`;
}
