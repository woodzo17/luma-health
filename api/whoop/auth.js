import crypto from 'crypto';

export default function handler(req, res) {
  const { WHOOP_CLIENT_ID, WHOOP_REDIRECT_URI } = process.env;

  // SAFETY CHECK
  if (!WHOOP_CLIENT_ID || !WHOOP_REDIRECT_URI) {
    return res.status(500).send(`
      <html>
        <body style="font-family: monospace; padding: 20px; background: #333; color: #fff;">
          <h1 style="color: #ff5555">Configuration Error</h1>
          <p>Environment Variables are missing.</p>
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

  // Generate a random state string (> 8 characters required by Whoop)
  const state = crypto.randomBytes(16).toString('hex');

  const authUrl = `https://api.prod.whoop.com/oauth/oauth2/auth?client_id=${WHOOP_CLIENT_ID}&redirect_uri=${encodeURIComponent(WHOOP_REDIRECT_URI)}&scope=${encodeURIComponent(scopes)}&state=${state}&response_type=code`;

  res.redirect(authUrl);
}
