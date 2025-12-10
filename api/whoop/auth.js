export default function handler(req, res) {
  const { WHOOP_CLIENT_ID, WHOOP_REDIRECT_URI } = process.env;

  // DEBUG CHECK
  if (!WHOOP_CLIENT_ID) {
    return res.status(500).send(`
      <html>
        <body style="font-family: monospace; padding: 20px; background: #333; color: #fff;">
          <h1 style="color: #ff5555">Configuration Error</h1>
          <p>WHOOP_CLIENT_ID is undefined.</p>
          <p>The Environment Variable is likely missing in Vercel or the deployment hasn't updated yet.</p>
        </body>
      </html>
    `);
  }

  if (!WHOOP_REDIRECT_URI) {
      return res.status(500).send(`
      <html>
        <body style="font-family: monospace; padding: 20px; background: #333; color: #fff;">
          <h1 style="color: #ff5555">Configuration Error</h1>
          <p>WHOOP_REDIRECT_URI is undefined.</p>
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
