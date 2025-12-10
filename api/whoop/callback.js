import axios from 'axios';
import { serialize } from 'cookie';

export default async function handler(req, res) {
  const { code } = req.query;
  const { WHOOP_CLIENT_ID, WHOOP_CLIENT_SECRET, WHOOP_REDIRECT_URI } = process.env;

  // DEBUGGING: If code is missing, tell us what we DID get.
  if (!code) {
    return res.status(400).send(`
      <html>
        <body style="font-family: monospace; padding: 20px; background: #333; color: #fff;">
          <h1 style="color: #ff5555">OAuth Error: Missing Code</h1>
          <p>The Whoop callback was triggered, but no 'code' parameter was found.</p>
          <hr/>
          <h3>Debug Info:</h3>
          <ul>
            <li><strong>Request URL:</strong> ${req.url}</li>
            <li><strong>Query Params:</strong> ${JSON.stringify(req.query, null, 2)}</li>
            <li><strong>WHOOP_REDIRECT_URI Configured:</strong> ${WHOOP_REDIRECT_URI}</li>
          </ul>
        </body>
      </html>
    `);
  }

  try {
    const tokenResponse = await axios.post('https://api.prod.whoop.com/oauth/oauth2/token', new URLSearchParams({
      grant_type: 'authorization_code',
      code: code,
      client_id: WHOOP_CLIENT_ID,
      client_secret: WHOOP_CLIENT_SECRET,
      redirect_uri: WHOOP_REDIRECT_URI,
    }), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    const { access_token, refresh_token, expires_in } = tokenResponse.data;

    res.setHeader('Set-Cookie', serialize('whoop_token', access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: expires_in
    }));

    // Redirect to the test page so they can see it worked
    res.redirect('/test.html');
  } catch (error) {
    console.error('Error exchanging token:', error.response?.data || error.message);
    // Print the API error clearly
    res.status(500).send(`
        <html>
        <body style="font-family: monospace; padding: 20px; background: #333; color: #fff;">
            <h1 style="color: #ff5555">Token Exchange Failed</h1>
            <p>We got the code, but Whoop rejected it.</p>
            <pre>${JSON.stringify(error.response?.data || error.message, null, 2)}</pre>
        </body>
        </html>
    `);
  }
}
