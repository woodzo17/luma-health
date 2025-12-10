import axios from 'axios';

export default async function handler(req, res) {
  const { whoop_token } = req.cookies || {};
  // Whoop V2 Max Limit is 25. We will cap at 25 for this demo to avoid pagination complexity.
  const { days = 25 } = req.query;

  if (!whoop_token) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  try {
    const config = { headers: { Authorization: `Bearer ${whoop_token}` } };
    
    const limit = 25; // MAX allowed by Whoop
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));
    const startIso = startDate.toISOString();

    // Fetch collections in parallel
    // NOTE: Limit is capped at 25 by Whoop API.
    const [recovery, sleep, cycle] = await Promise.all([
      axios.get(`https://api.prod.whoop.com/developer/v2/recovery?start=${startIso}&limit=${limit}`, config),
      axios.get(`https://api.prod.whoop.com/developer/v2/activity/sleep?start=${startIso}&limit=${limit}`, config),
      axios.get(`https://api.prod.whoop.com/developer/v2/cycle?start=${startIso}&limit=${limit}`, config)
    ]);

    const recoveryRecs = recovery.data.records || [];
    const sleepRecs = sleep.data.records || [];
    const cycleRecs = cycle.data.records || [];

    res.status(200).json({
      latest: {
        recovery: recoveryRecs[0] || null,
        sleep: sleepRecs[0] || null,
        cycle: cycleRecs[0] || null
      },
      history: {
        recovery: recoveryRecs,
        sleep: sleepRecs,
        cycle: cycleRecs
      }
    });
  } catch (error) {
    console.error('Error fetching V2 data:', error.response?.data || error.message);
    
    // Send the ACTUAL error details to the frontend
    const errorMsg = error.response?.data?.errors?.[0]?.message || error.message || 'Unknown API Error';
    res.status(500).json({ error: `Whoop API Error: ${errorMsg}` });
  }
}
