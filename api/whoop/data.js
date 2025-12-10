import axios from 'axios';

export default async function handler(req, res) {
  const { whoop_token } = req.cookies || {};
  const { days = 30 } = req.query;

  if (!whoop_token) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  try {
    const config = { headers: { Authorization: `Bearer ${whoop_token}` } };
    
    // Calculate start date (default 30 days ago)
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));
    const startIso = startDate.toISOString();

    // Fetch collections in parallel
    const [recovery, sleep, cycle] = await Promise.all([
      axios.get(`https://api.prod.whoop.com/developer/v2/recovery?start=${startIso}&limit=100`, config),
      axios.get(`https://api.prod.whoop.com/developer/v2/activity/sleep?start=${startIso}&limit=100`, config),
      axios.get(`https://api.prod.whoop.com/developer/v2/cycle?start=${startIso}&limit=100`, config)
    ]);

    const recoveryRecs = recovery.data.records || [];
    const sleepRecs = sleep.data.records || [];
    const cycleRecs = cycle.data.records || [];

    res.status(200).json({
      // Latest data point for the "Now" view
      latest: {
        recovery: recoveryRecs[0] || null,
        sleep: sleepRecs[0] || null,
        cycle: cycleRecs[0] || null
      },
      // Full history for charts
      history: {
        recovery: recoveryRecs,
        sleep: sleepRecs,
        cycle: cycleRecs
      }
    });
  } catch (error) {
    console.error('Error fetching V2 data:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to fetch data' });
  }
}
