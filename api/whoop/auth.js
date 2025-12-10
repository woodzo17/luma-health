export default function handler(req, res) {
  const { WHOOP_CLIENT_ID, WHOOP_REDIRECT_URI } = process.env;

  const scopes = [
    'read:recovery',
    'read:sleep',
    'read:cycles',
    'read:workout',
    'read:profile',
    'read:body_measurement'
  ].join(' ');

  const authUrl = `https://api.prod.whoop.com/oauth/oauth2/auth?client_id=${WHOOP_CLIENT_ID}&redirect_uri=${encodeURIComponent(WHOOP_REDIRECT_URI)}&scope=${encodeURIComponent(scopes)}&response_type=code`;

  // DEBUG MODE: Render values to screen instead of redirecting
  res.status(200).send(`
    <html>
      <body style="font-family: sans-serif; padding: 40px; background: #f0f0f0; max-width: 800px; margin: 0 auto;">
        <h1>OAuth Debugger</h1>
        <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h3>1. What Vercel Sent Us:</h3>
            <ul>
              <li>
                <strong>WHOOP_CLIENT_ID:</strong> 
                ${WHOOP_CLIENT_ID ? `"${WHOOP_CLIENT_ID.substring(0, 4)}..." (Length: ${WHOOP_CLIENT_ID.length})` : '<span style="color:red">UNDEFINED</span>'}
              </li>
              <li>
                <strong>WHOOP_REDIRECT_URI:</strong> 
                ${WHOOP_REDIRECT_URI ? `"${WHOOP_REDIRECT_URI}" (Length: ${WHOOP_REDIRECT_URI.length})` : '<span style="color:red">UNDEFINED</span>'}
              </li>
            </ul>
            
            <p><em>Check for extra spaces! A standard Client ID is usually around 36-40 chars.</em></p>

            <h3>2. Generated Link:</h3>
            <p style="word-break: break-all; background: #eee; padding: 10px; border-radius: 4px; font-family: monospace;">${authUrl}</p>
            
            <div style="margin-top: 20px;">
              <a href="${authUrl}" style="display: inline-block; padding: 15px 30px; background: #E63E43; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">
                Test Connection Again &rarr;
              </a>
            </div>
        </div>
      </body>
    </html>
  `);
}
