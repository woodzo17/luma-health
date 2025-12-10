export default function handler(req, res) {
  const keys = Object.keys(process.env).sort();
  const critical = {
    WHOOP_CLIENT_ID: process.env.WHOOP_CLIENT_ID ? 'Set' : 'MISSING',
    WHOOP_REDIRECT_URI: process.env.WHOOP_REDIRECT_URI ? 'Set' : 'MISSING',
    WHOOP_CLIENT_SECRET: process.env.WHOOP_CLIENT_SECRET ? 'Set' : 'MISSING'
  };

  res.status(200).send(`
    <html>
      <body style="font-family: monospace; background: #222; color: #0f0; padding: 20px;">
        <h1>Environment Debugger</h1>
        <h3>Critical Variables:</h3>
        <pre>${JSON.stringify(critical, null, 2)}</pre>
        <hr/>
        <h3>All Available Keys:</h3>
        <ul style="color: #888">
          ${keys.map(k => `<li>${k}</li>`).join('')}
        </ul>
      </body>
    </html>
  `);
}
