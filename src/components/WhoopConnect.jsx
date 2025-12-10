import React, { useState, useEffect } from 'react';

const WhoopConnect = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/whoop/data');
      if (res.status === 401) {
        // Not authenticated
        return;
      }
      if (!res.ok) throw new Error('Failed to fetch');
      const json = await res.json();
      setData(json);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) return <div className="text-white text-center font-inter">Loading Whoop V2 Data...</div>;

  if (data) {
    return (
      <div className="max-w-4xl mx-auto p-8 backdrop-blur-xl bg-white/10 rounded-3xl border border-white/20 shadow-2xl">
        <div className="flex justify-between items-center mb-8">
            <h2 className="font-playfair text-3xl text-white">Live Biometrics (V2)</h2>
            <button onClick={fetchData} className="text-sm font-space text-holo-blue hover:text-white transition-colors">REFRESH</button>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6">
          {/* RECOVERY */}
          <div className="bg-black/40 p-6 rounded-2xl border border-white/10">
            <h3 className="font-space text-xs tracking-wider text-gray-400 mb-4 uppercase">Recovery</h3>
            <div className="text-5xl font-playfair text-white mb-2">
                {data.recovery?.score?.recovery_score || '--'}%
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4 text-sm font-inter text-gray-300">
                <div>
                    <span className="block text-gray-500 text-xs">HRV</span>
                     {Math.round(data.recovery?.score?.hrv_rmssd_milli || 0)} ms
                </div>
                 <div>
                    <span className="block text-gray-500 text-xs">RHR</span>
                     {data.recovery?.score?.resting_heart_rate || '--'} bpm
                </div>
            </div>
          </div>

          {/* SLEEP */}
          <div className="bg-black/40 p-6 rounded-2xl border border-white/10">
            <h3 className="font-space text-xs tracking-wider text-gray-400 mb-4 uppercase">Sleep Performance</h3>
            <div className="text-5xl font-playfair text-white mb-2">
                {data.sleep?.score?.sleep_performance_percentage || '--'}%
            </div>
             <div className="grid grid-cols-2 gap-4 mt-4 text-sm font-inter text-gray-300">
                <div>
                    <span className="block text-gray-500 text-xs">Efficiency</span>
                     {Math.round(data.sleep?.score?.sleep_efficiency_percentage || 0)}%
                </div>
                 <div>
                    <span className="block text-gray-500 text-xs">Respiratory</span>
                     {Math.round(data.sleep?.score?.respiratory_rate || 0)} rpm
                </div>
            </div>
          </div>

           {/* CYCLE / STRAIN */}
          <div className="bg-black/40 p-6 rounded-2xl border border-white/10">
            <h3 className="font-space text-xs tracking-wider text-gray-400 mb-4 uppercase">Day Strain</h3>
            <div className="text-5xl font-playfair text-white mb-2">
                {Math.round(data.cycle?.score?.strain || 0)}
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4 text-sm font-inter text-gray-300">
                <div>
                    <span className="block text-gray-500 text-xs">Max HR</span>
                     {data.cycle?.score?.max_heart_rate || '--'} bpm
                </div>
                 <div>
                    <span className="block text-gray-500 text-xs">KiloJoule</span>
                     {Math.round(data.cycle?.score?.kilojoule / 1000) || 0} kJ
                </div>
            </div>
          </div>
        </div>

        {/* Debug View */}
        <details className="mt-8 text-xs text-gray-500 cursor-pointer">
            <summary className="hover:text-gray-300">Raw Data Payload (Debug)</summary>
            <pre className="mt-4 bg-black/50 p-4 rounded-xl overflow-auto h-48">{JSON.stringify(data, null, 2)}</pre>
        </details>
      </div>
    );
  }

  // Login State
  return (
    <div className="text-center">
      <a 
        href="/api/whoop/auth"
        className="inline-flex items-center gap-3 bg-red-600 hover:bg-red-700 text-white font-space font-bold py-4 px-8 rounded-xl transition-all hover:scale-105 shadow-xl hover:shadow-red-900/50"
      >
        <span>CONNECT WHOOP</span>
      </a>
    </div>
  );
};

export default WhoopConnect;
