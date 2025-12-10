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

  res.redirect(authUrl);
}
