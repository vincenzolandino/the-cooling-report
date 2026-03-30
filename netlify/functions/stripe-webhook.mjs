export default async (req) => {
  try {
    const body = await req.text();
    const event = JSON.parse(body);

    if (event.type !== "checkout.session.completed") {
      return new Response("OK", { status: 200 });
    }

    const session = event.data.object;
    const email = session.customer_details?.email || session.customer_email;

    if (!email) {
      console.error("No email found in checkout session");
      return new Response("OK", { status: 200 });
    }

    const apiKey = Netlify.env.get("RESEND_API_KEY");
    const audienceId = Netlify.env.get("RESEND_AUDIENCE_ID");
    const senderEmail = Netlify.env.get("SENDER_EMAIL");

    // Add to Resend audience
    await fetch(`https://api.resend.com/audiences/${audienceId}/contacts`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });

    // Send premium welcome email
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: `The Cooling Report <${senderEmail}>`,
        to: [email],
        subject: "Your premium subscription is active.",
        html: premiumWelcomeEmail(),
      }),
    });

    return new Response("OK", { status: 200 });
  } catch (err) {
    console.error("Stripe webhook error:", err);
    return new Response("Error", { status: 500 });
  }
};

function premiumWelcomeEmail() {
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
    &#9670;&nbsp; The Cooling Report <span style="font-family: Arial, sans-serif; font-size: 11px; font-weight: 600; background: #0d7680; color: #ffffff; padding: 2px 8px; border-radius: 3px; margin-left: 8px; vertical-align: middle;">PREMIUM</span>
  </td></tr>

  <!-- Headline -->
  <tr><td style="font-family: Georgia, serif; font-size: 32px; font-weight: 700; color: #1a1a1a; line-height: 1.2; padding-bottom: 24px;">
    Welcome to Premium.
  </td></tr>

  <!-- Body -->
  <tr><td style="font-size: 16px; line-height: 1.75; color: #4a4a4a; padding-bottom: 28px;">
    Your subscription is active. You now have full access to everything The Cooling Report publishes. Deep dives, competitive landscapes, market maps, weekly roundups, and the complete archive.
  </td></tr>

  <!-- Divider -->
  <tr><td style="border-top: 1px solid #e0cdb8; padding-top: 28px;"></td></tr>

  <!-- What you get heading -->
  <tr><td style="font-family: Arial, Helvetica, sans-serif; font-size: 11px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: #0d7680; padding-bottom: 20px;">
    YOUR PREMIUM ACCESS INCLUDES
  </td></tr>

  <!-- Item 1 -->
  <tr><td style="padding-bottom: 20px;">
    <table cellpadding="0" cellspacing="0" width="100%"><tr>
      <td width="40" valign="top" style="font-family: Georgia, serif; font-size: 22px; font-weight: 700; color: #0d7680; padding-top: 2px;">01</td>
      <td style="padding-left: 16px;">
        <p style="margin: 0 0 4px; font-family: Georgia, serif; font-size: 16px; font-weight: 700; color: #1a1a1a;">Weekly Deep Dives</p>
        <p style="margin: 0; font-size: 14px; color: #807060; line-height: 1.6;">Long-form analysis on the business of data center cooling. M&A breakdowns, competitive landscapes, regulatory analysis, market maps.</p>
      </td>
    </tr></table>
  </td></tr>

  <!-- Item 2 -->
  <tr><td style="padding-bottom: 20px;">
    <table cellpadding="0" cellspacing="0" width="100%"><tr>
      <td width="40" valign="top" style="font-family: Georgia, serif; font-size: 22px; font-weight: 700; color: #0d7680; padding-top: 2px;">02</td>
      <td style="padding-left: 16px;">
        <p style="margin: 0 0 4px; font-family: Georgia, serif; font-size: 16px; font-weight: 700; color: #1a1a1a;">Cooling Bytes</p>
        <p style="margin: 0; font-size: 14px; color: #807060; line-height: 1.6;">Weekly news roundup. The deals, moves, and signals that matter. Scannable.</p>
      </td>
    </tr></table>
  </td></tr>

  <!-- Item 3 -->
  <tr><td style="padding-bottom: 20px;">
    <table cellpadding="0" cellspacing="0" width="100%"><tr>
      <td width="40" valign="top" style="font-family: Georgia, serif; font-size: 22px; font-weight: 700; color: #0d7680; padding-top: 2px;">03</td>
      <td style="padding-left: 16px;">
        <p style="margin: 0 0 4px; font-family: Georgia, serif; font-size: 16px; font-weight: 700; color: #1a1a1a;">This Week in Cooling</p>
        <p style="margin: 0; font-size: 14px; color: #807060; line-height: 1.6;">Friday dispatch covering what happened and what to watch next.</p>
      </td>
    </tr></table>
  </td></tr>

  <!-- Item 4 -->
  <tr><td style="padding-bottom: 28px;">
    <table cellpadding="0" cellspacing="0" width="100%"><tr>
      <td width="40" valign="top" style="font-family: Georgia, serif; font-size: 22px; font-weight: 700; color: #0d7680; padding-top: 2px;">04</td>
      <td style="padding-left: 16px;">
        <p style="margin: 0 0 4px; font-family: Georgia, serif; font-size: 16px; font-weight: 700; color: #1a1a1a;">Full Archive Access</p>
        <p style="margin: 0; font-size: 14px; color: #807060; line-height: 1.6;">Every deep dive and premium report we have published. Yours to read anytime.</p>
      </td>
    </tr></table>
  </td></tr>

  <!-- Divider -->
  <tr><td style="border-top: 1px solid #e0cdb8; padding-top: 28px;"></td></tr>

  <!-- Archive access block -->
  <tr><td style="background-color: #0d7680; padding: 28px; border-radius: 3px;">
    <p style="margin: 0 0 4px; font-family: Arial, sans-serif; font-size: 11px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: rgba(255,255,255,0.7);">YOUR ARCHIVE ACCESS CODE</p>
    <p style="margin: 0 0 16px; font-family: 'Courier New', monospace; font-size: 28px; font-weight: 700; color: #ffffff; letter-spacing: 0.15em;">COOLPREMIUM2026</p>
    <p style="margin: 0 0 16px; font-size: 14px; color: rgba(255,255,255,0.85); line-height: 1.6;">Use this code to access the Premium Archive at the link below. Save this email. The code is for subscribers only.</p>
    <a href="https://thecoolingreport.com/premium-archive.html" style="display: inline-block; background-color: #ffffff; color: #0d7680; padding: 10px 24px; font-family: Arial, sans-serif; font-size: 14px; font-weight: 700; text-decoration: none; border-radius: 3px;">Open Premium Archive</a>
  </td></tr>

  <!-- Spacer -->
  <tr><td style="height: 28px;"></td></tr>

  <!-- Start reading -->
  <tr><td style="font-size: 16px; line-height: 1.75; color: #4a4a4a; padding-bottom: 8px;">
    Your first premium dispatch arrives this week. In the meantime, the latest is on the <a href="https://thecoolingreport.com/intel.html" style="color: #0d7680; font-weight: 600;">Intel page</a>.
  </td></tr>

  <tr><td style="font-size: 16px; color: #4a4a4a; padding-bottom: 32px;">Welcome aboard.</td></tr>

  <!-- Footer -->
  <tr><td style="border-top: 2px solid #0d7680; padding-top: 20px;">
    <p style="margin: 0; font-family: Georgia, serif; font-size: 14px; font-weight: 700; color: #0d7680;">&#9670;&nbsp; The Cooling Report</p>
    <p style="margin: 6px 0 0; font-size: 12px; color: #807060;">Business intelligence for data center cooling.</p>
    <p style="margin: 4px 0 0; font-size: 12px;"><a href="https://thecoolingreport.com" style="color: #0d7680;">thecoolingreport.com</a></p>
    <p style="margin: 12px 0 0; font-size: 11px; color: #807060;">Questions about your subscription? Reply to this email or contact <a href="mailto:premium@thecoolingreport.com" style="color: #0d7680;">premium@thecoolingreport.com</a></p>
  </td></tr>

</table>
</td></tr>
</table>
</body>
</html>`;
}
