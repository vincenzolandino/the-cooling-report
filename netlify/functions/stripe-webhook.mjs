export default async (req) => {
  try {
    const body = await req.text();
    const event = JSON.parse(body);

    // Only handle successful checkout completions
    if (event.type !== "checkout.session.completed") {
      return new Response("OK", { status: 200 });
    }

    const session = event.data.object;
    const email = session.customer_details?.email || session.customer_email;

    if (!email) {
      console.error("No email found in checkout session");
      return new Response("OK", { status: 200 });
    }

    const apiKey = Netlify.env.get("SENDGRID_API_KEY");
    const senderEmail = Netlify.env.get("SENDER_EMAIL");

    // Add to SendGrid contacts with premium tag
    await fetch("https://api.sendgrid.com/v3/marketing/contacts", {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contacts: [{
          email,
          custom_fields: {},
        }],
      }),
    });

    // Send premium welcome email
    await fetch("https://api.sendgrid.com/v3/mail/send", {
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
        subject: "Welcome to The Cooling Report Premium.",
        content: [
          {
            type: "text/html",
            value: `
<div style="font-family: Georgia, 'Times New Roman', serif; max-width: 560px; margin: 0 auto; color: #1a1a1a; padding: 20px;">
  <p style="font-family: Arial, sans-serif; font-size: 13px; color: #0d7680; letter-spacing: 0.05em; text-transform: uppercase; margin-bottom: 20px;">&#9670; The Cooling Report</p>

  <h1 style="font-size: 24px; font-weight: 700; line-height: 1.3; margin-bottom: 20px;">Your premium subscription is active.</h1>

  <p style="font-size: 15px; line-height: 1.75; color: #4a4a4a; margin-bottom: 16px;">You now have full access to everything The Cooling Report publishes.</p>

  <p style="font-size: 15px; line-height: 1.75; color: #4a4a4a; margin-bottom: 6px;"><strong style="color: #1a1a1a;">Weekly Deep Dives</strong></p>
  <p style="font-size: 14px; line-height: 1.65; color: #807060; margin-bottom: 16px; margin-top: 0;">Long-form analysis on the business of data center cooling. Competitive landscapes, M&A breakdowns, market maps, and regulatory analysis.</p>

  <p style="font-size: 15px; line-height: 1.75; color: #4a4a4a; margin-bottom: 6px;"><strong style="color: #1a1a1a;">Cooling Bytes</strong></p>
  <p style="font-size: 14px; line-height: 1.65; color: #807060; margin-bottom: 16px; margin-top: 0;">The weekly news roundup. Deals, moves, and signals. Scannable.</p>

  <p style="font-size: 15px; line-height: 1.75; color: #4a4a4a; margin-bottom: 6px;"><strong style="color: #1a1a1a;">This Week in Cooling</strong></p>
  <p style="font-size: 14px; line-height: 1.65; color: #807060; margin-bottom: 16px; margin-top: 0;">Friday dispatch covering what happened and what to watch next.</p>

  <p style="font-size: 15px; line-height: 1.75; color: #4a4a4a; margin-bottom: 6px;"><strong style="color: #1a1a1a;">Full Archive</strong></p>
  <p style="font-size: 14px; line-height: 1.65; color: #807060; margin-bottom: 16px; margin-top: 0;">Every deep dive and report we have published. Yours to read anytime.</p>

  <p style="font-size: 15px; line-height: 1.75; color: #4a4a4a; margin-bottom: 24px;">Start with the latest on the <a href="https://thecoolingreport.com/intel.html" style="color: #0d7680;">Intel page</a>.</p>

  <p style="font-size: 15px; line-height: 1.75; color: #4a4a4a;">Welcome aboard.</p>

  <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e0cdb8;">
    <p style="font-size: 13px; color: #807060; margin: 0;">The Cooling Report</p>
    <p style="font-size: 13px; color: #807060; margin: 4px 0 0;">Business intelligence for data center cooling.</p>
    <p style="font-size: 13px; margin: 8px 0 0;"><a href="https://thecoolingreport.com" style="color: #0d7680;">thecoolingreport.com</a></p>
    <p style="font-size: 12px; color: #807060; margin: 12px 0 0;">Questions about your subscription? Reply to this email or contact <a href="mailto:premium@thecoolingreport.com" style="color: #0d7680;">premium@thecoolingreport.com</a></p>
  </div>
</div>
            `,
          },
        ],
      }),
    });

    return new Response("OK", { status: 200 });
  } catch (err) {
    console.error("Stripe webhook error:", err);
    return new Response("Error", { status: 500 });
  }
};
