import axios from 'axios';
import { serialize } from 'cookie';

export default async function handler(req, res) {
  const { code } = req.query;
  const { WHOOP_CLIENT_ID, WHOOP_CLIENT_SECRET, WHOOP_REDIRECT_URI } = process.env;

  if (!code) {
    return res.status(400).json({ error: 'Missing code' });
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

    // Set cookie
    res.setHeader('Set-Cookie', serialize('whoop_token', access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: expires_in
    }));

    res.redirect('/');
  } catch (error) {
    console.error('Error exchanging token:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to exchange token' });
  }
}
