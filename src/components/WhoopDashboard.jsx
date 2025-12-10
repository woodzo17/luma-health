import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  CartesianGrid, ScatterChart, Scatter, ZAxis, ReferenceLine
} from 'recharts';
import { Activity, Moon, Zap, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';
import SystemLoader from './SystemLoader';

// --- UTILITIES ---
const formatDate = (dateString, includeYear = false) => {
  if (!dateString) return '--/--';
  const date = new Date(dateString);
  const m = date.getMonth() + 1;
  const d = date.getDate();
  return includeYear ? `${m}/${d}/${date.getFullYear().toString().substr(-2)}` : `${m}/${d}`;
};

// Calculate percent change
const getTrend = (current, previous) => {
    if (!previous) return 0;
    return Math.round(((current - previous) / previous) * 100);
};

// --- COMPONENTS ---

const StatCard = ({ title, value, label, icon: Icon, color, delay }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.5 }}
    className="backdrop-blur-xl bg-white/10 rounded-3xl p-6 border border-white/20 shadow-2xl relative overflow-hidden group"
  >
    <div className={`absolute top-4 right-4 w-10 h-10 rounded-full bg-${color}-500/20 flex items-center justify-center`}>
      <Icon className={`w-5 h-5 text-${color}-400`} />
    </div>
    <h3 className="font-space text-xs tracking-wider text-white/60 mb-2 uppercase">{title}</h3>
    <div className="flex items-end gap-3">
        <span className="text-5xl font-playfair text-white">{value}</span>
        <span className="text-sm font-space text-white/60 pb-2">{label}</span>
    </div>
  </motion.div>
);

const ChartCard = ({ title, children, delay, className }) => (
    <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay, duration: 0.6 }}
        className={`backdrop-blur-xl bg-black/40 rounded-3xl p-8 border border-white/10 shadow-2xl ${className}`}
    >
        <h3 className="font-playfair text-2xl text-white mb-6">{title}</h3>
        <div className="h-[300px] w-full">
            {children}
        </div>
    </motion.div>
);

const InsightPill = ({ label, value, type, delay }) => {
    const colors = {
        positive: 'text-green-400 border-green-500/30 bg-green-500/10',
        negative: 'text-red-400 border-red-500/30 bg-red-500/10',
        neutral: 'text-blue-400 border-blue-500/30 bg-blue-500/10'
    };
    
    return (
        <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay }}
            className={`px-4 py-3 rounded-xl border flex items-center justify-between ${colors[type]}`}
        >
            <span className="text-xs font-space tracking-wider opacity-80">{label}</span>
            <span className="font-bold">{value}</span>
        </motion.div>
    );
};

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
  
  // --- DATA PROCESSING & INSIGHTS ---

  // 1. Scatter Plot Data (Recovery vs Strain)
  // Merge by 'created_at' date.
  const strainMap = new Map();
  (history.cycle || []).forEach(c => {
      const d = formatDate(c.created_at);
      strainMap.set(d, c.score?.strain || 0);
  });

  // Limit scatter to 30 days for cleanliness, or 100 if user wants density
  const scatterData = recoveryRecs.slice(0, 50).map(req => {
     const date = formatDate(req.created_at);
     return {
         date,
         recovery: req.score?.recovery_score || 0,
         strain: strainMap.get(date) || 0,
         amt: 1 
     };
  });

  // 2. Trend Analysis (Last 7 days vs Previous 7 days)
  const last7Rec = recoveryRecs.slice(0, 7).reduce((acc, curr) => acc + (curr.score?.recovery_score || 0), 0) / 7;
  const prev7Rec = recoveryRecs.slice(7, 14).reduce((acc, curr) => acc + (curr.score?.recovery_score || 0), 0) / 7;
  const recTrend = getTrend(last7Rec, prev7Rec);

  const last7HRV = recoveryRecs.slice(0, 7).reduce((acc, curr) => acc + (curr.score?.hrv_rmssd_milli || 0), 0) / 7;
  const prev7HRV = recoveryRecs.slice(7, 14).reduce((acc, curr) => acc + (curr.score?.hrv_rmssd_milli || 0), 0) / 7;
  const hrvTrend = getTrend(last7HRV, prev7HRV);

  // 3. Transformation for Area Charts
  const chartData = (recoveryRecs.length > 0) ? recoveryRecs.slice(0, 30).reverse().map(req => {
     return {
        date: formatDate(req.created_at),
        recovery: req.score?.recovery_score || 0,
        hrv: req.score?.hrv_rmssd_milli || 0,
        rhr: req.score?.resting_heart_rate || 0,
     };
  }) : [];


  // Safe Accessors
  const recoveryScore = latest.recovery?.score?.recovery_score ?? '--';
  const strainScore = latest.cycle?.score?.strain ? Math.round(latest.cycle.score.strain) : '--';
  const sleepScore = latest.sleep?.score?.sleep_performance_percentage ?? '--';

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-4 md:p-8 font-inter selection:bg-red-500/30">
        
        {/* HEADER */}
        <motion.header 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="max-w-7xl mx-auto mb-12 flex justify-between items-end border-b border-white/10 pb-8"
        >
            <div>
                <h1 className="font-playfair text-4xl md:text-6xl text-white mb-2">
                    Digital Twin <span className="text-red-500">.</span>
                </h1>
                <p className="font-space text-xs tracking-widest text-white/50 uppercase flex gap-4">
                    <span>Sync Complete</span>
                    <span className="text-white/20">|</span>
                    <span>{history.recovery?.length || 0} Cycles Analyzed</span>
                </p>
            </div>
            
             <a href="/" className="text-sm font-space text-white/40 hover:text-white transition-colors">
                EXIT SIMULATION
            </a>
        </motion.header>

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
            
            {/* LEFT COLUMN: STATS & INSIGHTS (4/12) */}
            <div className="lg:col-span-4 space-y-6">
                <StatCard 
                    title="Recovery" 
                    value={recoveryScore} 
                    label="%" 
                    icon={Activity} 
                    color="green" 
                    delay={0.1} 
                />
                
                {/* AI INSIGHTS BOX */}
                <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="backdrop-blur-xl bg-white/5 rounded-3xl p-8 border border-white/10"
                >
                    <div className="flex items-center gap-3 mb-6">
                        <TrendingUp className="w-5 h-5 text-holo-blue" />
                        <h3 className="font-playfair text-2xl text-white">Twin Insights</h3>
                    </div>
                    
                    <div className="space-y-3">
                        <InsightPill 
                            label="HRV Trend (7d)" 
                            value={`${hrvTrend > 0 ? '+' : ''}${hrvTrend}%`} 
                            type={hrvTrend >= 0 ? 'positive' : 'negative'}
                            delay={0.4}
                        />
                         <InsightPill 
                            label="Recovery Stability" 
                            value={`${recTrend > 0 ? '+' : ''}${recTrend}%`} 
                            type={Math.abs(recTrend) < 10 ? 'positive' : 'negative'}
                            delay={0.5}
                        />
                         <div className="pt-4 border-t border-white/10">
                            <p className="text-sm font-inter text-white/60 leading-relaxed font-light">
                                <span className="text-holo-blue font-bold">Analysis:</span> {recTrend < -5 
                                    ? "Your system is under load. Recovery markers are trending down compared to last week." 
                                    : "Biometric stability is high. You are effectively absorbing current training loads."}
                            </p>
                        </div>
                    </div>
                </motion.div>

                <div className="grid grid-cols-2 gap-6">
                    <StatCard 
                        title="Strain" 
                        value={strainScore} 
                        label="/ 21" 
                        icon={Zap} 
                        color="blue" 
                        delay={0.2} 
                    />
                    <StatCard 
                        title="Sleep" 
                        value={sleepScore} 
                        label="%" 
                        icon={Moon} 
                        color="purple" 
                        delay={0.3} 
                    />
                </div>
            </div>

            {/* RIGHT COLUMN: VISUALIZATIONS (8/12) */}
            <div className="lg:col-span-8 space-y-8">
                
                {/* 1. SCATTER PLOT (Training Balance) */}
                <ChartCard title="Training Balance (Recovery vs Strain)" delay={0.4} className="bg-gradient-to-tr from-black/60 to-blue-900/10 border-blue-500/20">
                    <ResponsiveContainer width="100%" height="100%">
                        <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 10 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                            <XAxis type="number" dataKey="recovery" name="Recovery" unit="%" stroke="#555" domain={[0, 100]} />
                            <YAxis type="number" dataKey="strain" name="Strain" stroke="#555" domain={[0, 21]} />
                            <Tooltip 
                                cursor={{ strokeDasharray: '3 3' }}
                                content={({ active, payload }) => {
                                    if (active && payload && payload.length) {
                                      return (
                                        <div className="bg-black/90 border border-white/20 p-3 rounded-xl backdrop-blur-md">
                                          <p className="text-xs text-white/60">{payload[0].payload.date}</p>
                                          <p className="text-sm font-bold text-white">Rec: {payload[0].value}%</p>
                                          <p className="text-sm font-bold text-blue-400">Strain: {payload[1].value}</p>
                                        </div>
                                      );
                                    }
                                    return null;
                                  }}
                            />
                            <ReferenceLine x={33} stroke="#ef4444" strokeDasharray="3 3" strokeOpacity={0.3} />
                            <ReferenceLine x={66} stroke="#22c55e" strokeDasharray="3 3" strokeOpacity={0.3} />
                            <Scatter name="Training Load" data={scatterData} fill="#3b82f6" fillOpacity={0.6}>
                                {scatterData.map((entry, index) => (
                                    <cell key={`cell-${index}`} fill={entry.recovery < 33 ? '#ef4444' : entry.recovery > 66 ? '#22c55e' : '#eab308'} />
                                ))}
                            </Scatter>
                        </ScatterChart>
                    </ResponsiveContainer>
                    <div className="flex justify-between items-center mt-4 px-4">
                        <p className="text-xs text-white/30">Each dot represents a day.</p>
                        <div className="flex gap-4 text-xs font-space">
                            <span className="text-green-500 flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500"></span> Primed</span>
                            <span className="text-yellow-500 flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-500"></span> Baseline</span>
                            <span className="text-red-500 flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500"></span> Depleted</span>
                        </div>
                    </div>
                </ChartCard>

                {/* 2. RECOVERY TREND */}
                <ChartCard title="30-Day Recovery" delay={0.5}>
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData}>
                            <defs>
                                <linearGradient id="colorRecovery" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                            <XAxis dataKey="date" stroke="#666" tick={{fill: '#666', fontSize: 10}} tickLine={false} axisLine={false} minTickGap={20} />
                            <YAxis stroke="#666" tick={{fill: '#666', fontSize: 10}} tickLine={false} axisLine={false} />
                            <Tooltip 
                                contentStyle={{ backgroundColor: '#000', border: '1px solid #333', borderRadius: '12px' }}
                                itemStyle={{ color: '#fff' }}
                            />
                            <Area 
                                type="monotone" 
                                dataKey="recovery" 
                                stroke="#22c55e" 
                                strokeWidth={3}
                                fillOpacity={1} 
                                fill="url(#colorRecovery)" 
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </ChartCard>
            </div>
        </div>
    </div>
  );
};

export default WhoopDashboard;
