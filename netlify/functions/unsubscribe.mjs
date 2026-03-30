export default async (req) => {
  const url = new URL(req.url);
  const email = url.searchParams.get("email");

  if (!email || !email.includes("@")) {
    return new Response(unsubPage("Invalid email address."), {
      status: 400,
      headers: { "Content-Type": "text/html" },
    });
  }

  const apiKey = Netlify.env.get("RESEND_API_KEY");
  const audienceId = Netlify.env.get("RESEND_AUDIENCE_ID");

  try {
    // Remove contact from Resend audience
    const res = await fetch(
      `https://api.resend.com/audiences/${audienceId}/contacts/${email}`,
      {
        method: "DELETE",
        headers: { Authorization: `Bearer ${apiKey}` },
      }
    );

    if (res.ok || res.status === 404) {
      return new Response(unsubPage("You have been unsubscribed from The Cooling Report."), {
        status: 200,
        headers: { "Content-Type": "text/html" },
      });
    }

    return new Response(unsubPage("Something went wrong. Please try again or email us at premium@thecoolingreport.com."), {
      status: 500,
      headers: { "Content-Type": "text/html" },
    });
  } catch (err) {
    console.error("Unsubscribe error:", err);
    return new Response(unsubPage("Something went wrong. Please email premium@thecoolingreport.com to unsubscribe."), {
      status: 500,
      headers: { "Content-Type": "text/html" },
    });
  }
};

function unsubPage(message) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Unsubscribe | The Cooling Report</title>
  <style>
    body { font-family: Georgia, serif; background: #f4f3ef; margin: 0; padding: 80px 20px; text-align: center; color: #1a1a18; }
    .card { max-width: 440px; margin: 0 auto; background: #fff; padding: 40px; border-radius: 4px; border-top: 3px solid #0d7680; }
    h1 { font-size: 20px; margin: 0 0 16px; }
    p { font-size: 15px; color: #666; line-height: 1.6; margin: 0 0 20px; }
    a { color: #0d7680; }
  </style>
</head>
<body>
  <div class="card">
    <h1>The Cooling Report</h1>
    <p>${message}</p>
    <a href="https://thecoolingreport.com">Back to thecoolingreport.com</a>
  </div>
</body>
</html>`;
}
