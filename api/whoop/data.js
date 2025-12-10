import axios from 'axios';

// Helper to fetch all pages for a specific endpoint
const fetchAllPages = async (url, config, maxPages = 4) => {
  let allRecords = [];
  let nextToken = null;
  let pageCount = 0;

  do {
    try {
      // Append nextToken if it exists
      const pageUrl = nextToken 
        ? `${url}&nextToken=${nextToken}` 
        : url;
      
      console.log(`Fetching page ${pageCount + 1}: ${pageUrl}`);
      const response = await axios.get(pageUrl, config);
      
      const records = response.data.records || [];
      allRecords = [...allRecords, ...records];
      
      nextToken = response.data.next_token;
      pageCount++;

    } catch (err) {
      console.error('Error in pagination loop:', err.message);
      break; 
    }
  } while (nextToken && pageCount < maxPages);

  return allRecords;
};

export default async function handler(req, res) {
  const { whoop_token } = req.cookies || {};
  // Default to ~100 days (approx 4 pages of 25)
  const { days = 100 } = req.query;

  if (!whoop_token) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  try {
    const config = { headers: { Authorization: `Bearer ${whoop_token}` } };
    const limit = 25; // Max allowed by Whoop
    
    // We start from X days ago to Now.
    // Actually, for "Collection", we usually just want the most recent X records.
    // So we don't strictly need 'start' if we just want "last 100 entries". 
    // Whoop returns newest first by default. 
    // But if we want specific range, we can use start. 
    // Let's rely on default "newest first" and just paginate back.
    
    // Fetch 3 collections in parallel chains
    const [recoveryRecs, sleepRecs, cycleRecs] = await Promise.all([
      fetchAllPages(`https://api.prod.whoop.com/developer/v2/recovery?limit=${limit}`, config),
      fetchAllPages(`https://api.prod.whoop.com/developer/v2/activity/sleep?limit=${limit}`, config),
      fetchAllPages(`https://api.prod.whoop.com/developer/v2/cycle?limit=${limit}`, config)
    ]);

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
      },
      meta: {
        count: recoveryRecs.length,
        pages_fetched: Math.ceil(recoveryRecs.length / 25)
      }
    });
  } catch (error) {
    console.error('Error fetching V2 data:', error.response?.data || error.message);
    const errorMsg = error.response?.data?.errors?.[0]?.message || error.message || 'Unknown API Error';
    res.status(500).json({ error: `Whoop API Error: ${errorMsg}` });
  }
}
