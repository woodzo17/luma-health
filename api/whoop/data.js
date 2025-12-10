import axios from 'axios';

export default async function handler(req, res) {
  const { whoop_token } = req.cookies || {};

  if (!whoop_token) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  try {
    const config = { headers: { Authorization: `Bearer ${whoop_token}` } };
    
    // Fetch V2 Data
    // We add 'limit=1' to just get the latest data for the demo
    const [recovery, sleep, cycle] = await Promise.all([
      axios.get('https://api.prod.whoop.com/developer/v2/recovery?limit=1', config),
      axios.get('https://api.prod.whoop.com/developer/v2/activity/sleep?limit=1', config),
      axios.get('https://api.prod.whoop.com/developer/v2/cycle?limit=1', config)
    ]);

    res.status(200).json({
      recovery: recovery.data.records?.[0] || null,
      sleep: sleep.data.records?.[0] || null,
      cycle: cycle.data.records?.[0] || null
    });
  } catch (error) {
    console.error('Error fetching V2 data:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to fetch data' });
  }
}
