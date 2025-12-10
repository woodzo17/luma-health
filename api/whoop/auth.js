export default function handler(req, res) {
  const { WHOOP_CLIENT_ID, WHOOP_REDIRECT_URI } = process.env;

  // SAFETY CHECK: If keys are missing, stop here.
  if (!WHOOP_CLIENT_ID || !WHOOP_REDIRECT_URI) {
    return res.status(500).send(`
      <html>
        <body style="font-family: monospace; padding: 20px; background: #333; color: #fff;">
          <h1 style="color: #ff5555">Configuration Error</h1>
          <p><strong>Environment Variables are still missing.</strong></p>
          <p>Vercel did not inject WHOOP_CLIENT_ID or WHOOP_REDIRECT_URI.</p>
          <hr/>
          <p><strong>Solution:</strong> You must trigger a <strong>New Deployment</strong> in Vercel <em>after</em> saving the keys.</p>
        </body>
      </html>
    `);
  }

  const scopes = [
    'read:recovery',
    'read:sleep',
    'read:cycles',
    'read:workout',
    'read:profile',
    'read:body_measurement'
  ].join(' ');

  const authUrl = `https://api.prod.whoop.com/oauth/oauth2/auth?client_id=${WHOOP_CLIENT_ID}&redirect_uri=${encodeURIComponent(WHOOP_REDIRECT_URI)}&scope=${encodeURIComponent(scopes)}&response_type=code`;

  res.redirect(authUrl);
}
