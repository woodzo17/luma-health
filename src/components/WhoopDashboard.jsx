import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  CartesianGrid, ScatterChart, Scatter, ZAxis, ReferenceLine, Cell
} from 'recharts';
import { Activity, Moon, Zap, TrendingUp, Brain, Battery } from 'lucide-react';
import SystemLoader from './SystemLoader';

// --- UTILITIES ---
const formatDate = (dateString, includeYear = false) => {
  if (!dateString) return '--/--';
  const date = new Date(dateString);
  const m = date.getMonth() + 1;
  const d = date.getDate();
  return includeYear ? `${m}/${d}/${date.getFullYear().toString().substr(-2)}` : `${m}/${d}`;
};

const msToHrs = (ms) => {
    if (!ms) return '0h 0m';
    const hrs = Math.floor(ms / 3600000);
    const mins = Math.round((ms % 3600000) / 60000);
    return `${hrs}h ${mins}m`;
};

// Calculate percent change
const getTrend = (current, previous) => {
    if (!previous) return 0;
    return Math.round(((current - previous) / previous) * 100);
};

// --- COMPONENTS ---

const DirectiveCard = ({ recovery, strain, sleep, delay }) => {
    // Logic for actionable advice
    let title = "Maintain Baseline";
    let advice = "Your biomarkers are stable. Continue current training load.";
    let type = "neutral"; // neutral, warning, prime

    if (recovery >= 67) {
        title = "Prime to Perform";
        advice = "System is primed for high strain. Push intensity today.";
        type = "prime";
    } else if (recovery <= 33) {
        title = "Prioritize Recovery";
        advice = "Autonomic nervous system is suppressed. Focus on sleep and breathwork.";
        type = "warning";
    } else if (strain > 16 && recovery < 50) {
        title = "Reduce Load";
        advice = "High recent strain with moderate recovery. Consider active recovery.";
        type = "warning";
    }

    const colors = {
        prime: "border-green-500/50 bg-green-900/10 text-green-400",
        warning: "border-red-500/50 bg-red-900/10 text-red-400",
        neutral: "border-blue-500/50 bg-blue-900/10 text-blue-400"
    };

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, duration: 0.6 }}
            className={`rounded-3xl p-8 border backdrop-blur-xl mb-8 ${colors[type]} relative overflow-hidden`}
        >
            <div className="absolute top-0 right-0 p-32 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
            <h3 className="font-playfair text-3xl mb-2 text-white">{title}</h3>
            <p className="font-inter text-white/80 text-lg font-light leading-relaxed max-w-2xl">
                {advice}
            </p>
        </motion.div>
    );
};

const StatCard = ({ title, value, label, icon: Icon, color, delay, subValue }) => (
  <motion.div 
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ delay, duration: 0.4 }}
    className="bg-zinc-900/50 rounded-2xl p-5 border border-white/5 hover:border-white/10 transition-colors group"
  >
    <div className="flex justify-between items-start mb-4">
        <div className={`p-2 rounded-lg bg-${color}-500/10 text-${color}-400 group-hover:bg-${color}-500/20 transition-colors`}>
            <Icon className="w-5 h-5" />
        </div>
        {subValue && <span className="text-xs font-mono text-white/30">{subValue}</span>}
    </div>
    
    <div className="flex items-baseline gap-2">
        <span className="text-3xl font-playfair text-white">{value}</span>
        <span className="text-xs font-space text-white/40">{label}</span>
    </div>
    <h3 className="font-space text-[10px] tracking-widest text-white/40 mt-1 uppercase">{title}</h3>
  </motion.div>
);

const ChartCard = ({ title, children, delay, className }) => (
    <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay, duration: 0.6 }}
        className={`bg-zinc-900/30 rounded-3xl p-6 border border-white/5 ${className}`}
    >
        <h3 className="font-playfair text-xl text-white/90 mb-6">{title}</h3>
        <div className="h-[250px] w-full">
            {children}
        </div>
    </motion.div>
);

const WhoopDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/whoop/data');
        if (res.status === 401) {
            window.location.href = '/api/whoop/auth';
            return;
        }
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error(err);
        setData({ error: err.message });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <SystemLoader />;

  if (!data) return null;

  if (data.error) {
      return (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
            <h2 className="text-red-500 font-playfair text-3xl mb-4">Data Stream Corrupted</h2>
            <p className="text-white/60 font-inter mb-8">{data.error}</p>
            <a href="/api/whoop/auth" className="text-holo-blue hover:text-white underline">Reconnect Interface</a>
        </div>
      );
  }

  const latest = data.latest || {};
  const history = data.history || {};
  const recoveryRecs = history.recovery || [];
  
  // --- DATA PROCESSING ---

  // 1. Strain Map for Scatter
  const strainMap = new Map();
  (history.cycle || []).forEach(c => {
      // Logic to ensure we match days correctly (approx)
      const d = formatDate(c.created_at);
      strainMap.set(d, c.score?.strain || 0);
  });

  // 2. Prepare Scatter Data (Last 30 Days ONLY)
  // FILTER: Only keep days where Strain > 1.0 (removes "0" strain days)
  const scatterData = recoveryRecs.slice(0, 30).map(req => {
     const date = formatDate(req.created_at);
     const strain = strainMap.get(date) || 0;
     return {
         date,
         recovery: req.score?.recovery_score || 0,
         strain: strain,
     };
  }).filter(item => item.strain > 1.0); 

  // 3. Detailed Metrics
  const deepSleep = latest.sleep?.score?.stage_summary?.total_deep_sleep_milli || 0;
  const remSleep = latest.sleep?.score?.stage_summary?.total_rem_sleep_milli || 0;
  const rhr = latest.recovery?.score?.resting_heart_rate ?? '--';
  const hrv = latest.recovery?.score?.hrv_rmssd_milli ?? '--';

  // 4. Area Chart Data
  const areaData = recoveryRecs.slice(0, 30).reverse().map(req => ({
      date: formatDate(req.created_at),
      recovery: req.score?.recovery_score || 0,
      hrv: req.score?.hrv_rmssd_milli || 0
  }));

  // Safe Accessors
  const recoveryScore = latest.recovery?.score?.recovery_score ?? 0;
  const strainScore = latest.cycle?.score?.strain ? Math.round(latest.cycle.score.strain) : 0;
  const sleepScore = latest.sleep?.score?.sleep_performance_percentage ?? 0;

  return (
    <div className="min-h-screen bg-[#050505] text-white p-6 md:p-12 font-inter selection:bg-indigo-500/30">
        
        {/* HEADER */}
        <header className="max-w-6xl mx-auto mb-12 flex justify-between items-center">
            <h1 className="font-playfair text-3xl text-white/90">
                Daily Biometrics <span className="text-indigo-500">.</span>
            </h1>
            <p className="font-mono text-xs text-white/30">{formatDate(new Date(), true)}</p>
        </header>

        <div className="max-w-6xl mx-auto">
            
            {/* ACTIONABLE DIRECTIVE */}
            <DirectiveCard 
                recovery={recoveryScore} 
                strain={strainScore} 
                sleep={sleepScore} 
                delay={0.1}
            />

            {/* METRICS GRID */}
            <h4 className="font-space text-xs text-white/40 uppercase tracking-widest mb-6">Current Status</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-12">
                <StatCard 
                    title="Recovery" value={`${recoveryScore}%`} label="Capacity"
                    icon={Battery} color={recoveryScore >= 67 ? 'green' : recoveryScore <= 33 ? 'red' : 'yellow'} delay={0.2}
                />
                 <StatCard 
                    title="Day Strain" value={strainScore} label="/ 21"
                    icon={Zap} color="blue" delay={0.25}
                />
                 <StatCard 
                    title="Sleep Perf" value={`${sleepScore}%`} label="Quality"
                    icon={Moon} color="purple" delay={0.3}
                />
                 <StatCard 
                    title="HRV" value={hrv} label="ms"
                    icon={Activity} color="emerald" delay={0.35}
                />
                 <StatCard 
                    title="Deep Sleep" value={msToHrs(deepSleep).split(' ')[0]} label="Hours"
                    icon={Brain} color="indigo" delay={0.4}
                    subValue={msToHrs(deepSleep)}
                />
                 <StatCard 
                    title="REM Sleep" value={msToHrs(remSleep).split(' ')[0]} label="Hours"
                    icon={TrendingUp} color="pink" delay={0.45}
                    subValue={msToHrs(remSleep)}
                />
            </div>

            {/* CHARTS ROW */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* SCATTER: TRAINING BALANCE */}
                <ChartCard title="Training Impact (30 Day)" delay={0.5}>
                    <ResponsiveContainer width="100%" height="100%">
                        <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: -20 }}>
                             <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                             <XAxis type="number" dataKey="recovery" name="Recovery" unit="%" stroke="#444" tick={{fontSize: 10}} domain={[0, 100]} />
                             <YAxis type="number" dataKey="strain" name="Strain" stroke="#444" tick={{fontSize: 10}} domain={[0, 21]} />
                             <Tooltip 
                                cursor={{ strokeDasharray: '3 3' }}
                                content={({ active, payload }) => {
                                    if (active && payload && payload.length) {
                                      return (
                                        <div className="bg-zinc-900 border border-white/10 p-3 rounded-lg shadow-xl">
                                          <p className="text-xs text-white/50 mb-1">{payload[0].payload.date}</p>
                                          <div className="flex gap-4">
                                              <div>
                                                  <span className="text-[10px] uppercase text-white/40 block">Rec</span>
                                                  <span className="font-bold text-white">{payload[0].value}%</span>
                                              </div>
                                              <div>
                                                  <span className="text-[10px] uppercase text-white/40 block">Str</span>
                                                  <span className="font-bold text-blue-400">{payload[1].value}</span>
                                              </div>
                                          </div>
                                        </div>
                                      );
                                    }
                                    return null;
                                  }}
                             />
                             <ReferenceLine x={33} stroke="#ef4444" strokeDasharray="3 3" strokeOpacity={0.2} />
                             <ReferenceLine x={66} stroke="#22c55e" strokeDasharray="3 3" strokeOpacity={0.2} />
                             <Scatter name="Training Load" data={scatterData}>
                                {scatterData.map((entry, index) => (
                                    <Cell 
                                        key={`cell-${index}`} 
                                        fill={entry.recovery < 33 ? '#ef4444' : entry.recovery > 66 ? '#22c55e' : '#eab308'} 
                                        strokeWidth={0}
                                    />
                                ))}
                             </Scatter>
                        </ScatterChart>
                    </ResponsiveContainer>
                </ChartCard>

                {/* LINE: HRV TREND */}
                <ChartCard title="HRV Baseline" delay={0.6}>
                    <ResponsiveContainer width="100%" height="100%">
                         <AreaChart data={areaData}>
                            <defs>
                                <linearGradient id="colorHrv" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                            <XAxis dataKey="date" stroke="#444" tick={{opacity: 0}} tickLine={false} axisLine={false} />
                            <YAxis stroke="#444" tick={{fontSize: 10, fill:'#666'}} tickLine={false} axisLine={false} domain={['dataMin - 10', 'dataMax + 10']} />
                            <Tooltip 
                                contentStyle={{ backgroundColor: '#09090b', border: '1px solid #27272a', borderRadius: '8px' }}
                                itemStyle={{ color: '#fff' }}
                            />
                            <Area 
                                type="monotone" 
                                dataKey="hrv" 
                                stroke="#10b981" 
                                strokeWidth={2}
                                fillOpacity={1} 
                                fill="url(#colorHrv)" 
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </ChartCard>
            </div>
            
            <div className="mt-8 text-center">
                 <a href="/" className="text-xs font-mono text-white/20 hover:text-white transition-colors">
                    SYNC_ID: {latest.recovery?.id || 'UNKNOWN'}
                </a>
            </div>

        </div>
    </div>
  );
};

export default WhoopDashboard;
