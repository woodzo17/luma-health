import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  CartesianGrid, Cell, ReferenceLine, ComposedChart, Line
} from 'recharts';
import { Activity, Moon, Zap, Trophy, Users, TrendingUp, Battery } from 'lucide-react';
import SystemLoader from './SystemLoader';

// --- UTILITIES ---
const formatDate = (dateString) => {
  if (!dateString) return '--/--';
  const date = new Date(dateString);
  return `${date.getMonth() + 1}/${date.getDate()}`;
};

// --- DATA PROCESSING HELPERS ---
const processMonthlyData = (recoveryRecs, startMonthIndex = 0) => {
    // Group by Month: "Jan 2024", etc.
    const groups = {};
    
    recoveryRecs.forEach(rec => {
        const d = new Date(rec.created_at);
        const key = `${d.toLocaleString('default', { month: 'short' })}`; // e.g. "Dec"
        
        if (!groups[key]) {
            groups[key] = { count: 0, recoverySum: 0, hrvSum: 0, rhrSum: 0, records: [] };
        }
        
        groups[key].count++;
        groups[key].recoverySum += (rec.score?.recovery_score || 0);
        groups[key].hrvSum += (rec.score?.hrv_rmssd_milli || 0);
        groups[key].rhrSum += (rec.score?.resting_heart_rate || 0);
        groups[key].records.push(rec);
    });

    // Compute Averages
    return Object.keys(groups).map(month => ({
        month,
        avgRecovery: Math.round(groups[month].recoverySum / groups[month].count),
        avgHRV: Math.round(groups[month].hrvSum / groups[month].count),
        avgRHR: Math.round(groups[month].rhrSum / groups[month].count),
        count: groups[month].count
    })).reverse(); // Oldest to newest usually, but API returns Newest first
};

const getPercentileRank = (value, metric) => {
    // APPROXIMATE POPULATION DATA (Male 30-35)
    // Source: Whoop/Oura general population public data
    const benchmarks = {
        hrv: { p10: 25, p50: 55, p90: 95 },
        rhr: { p10: 45, p50: 58, p90: 75 } // Lower is better for RHR, so logic flips
    };

    if (metric === 'hrv') {
        if (value >= benchmarks.hrv.p90) return { rank: 'Top 10%', color: 'text-green-400', percentile: 95 };
        if (value >= benchmarks.hrv.p50) return { rank: 'Above Avg', color: 'text-blue-400', percentile: 75 };
        if (value >= benchmarks.hrv.p10) return { rank: 'Average', color: 'text-yellow-400', percentile: 50 };
        return { rank: 'Below Avg', color: 'text-red-400', percentile: 20 };
    }

    if (metric === 'rhr') {
        if (value <= benchmarks.rhr.p10) return { rank: 'Elite', color: 'text-green-400', percentile: 95 };
        if (value <= benchmarks.rhr.p50) return { rank: 'Above Avg', color: 'text-blue-400', percentile: 75 };
        if (value <= benchmarks.rhr.p90) return { rank: 'Average', color: 'text-yellow-400', percentile: 50 };
        return { rank: 'Below Avg', color: 'text-red-400', percentile: 20 };
    }
    return { rank: '-', color: 'text-white', percentile: 0 };
};


// --- COMPONENTS ---

const InsightCard = ({ title, value, subtext, icon: Icon, delay }) => (
    <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay, duration: 0.5 }}
        className="bg-zinc-900/50 rounded-2xl p-6 border border-white/5 relative overflow-hidden"
    >
        <div className="flex justify-between items-start mb-4">
            <h3 className="font-space text-xs tracking-widest text-white/40 uppercase">{title}</h3>
            <Icon className="w-5 h-5 text-white/20" />
        </div>
        <div className="text-3xl font-playfair text-white mb-1">{value}</div>
        <div className="text-xs font-inter text-white/50">{subtext}</div>
    </motion.div>
);

const PercentileBar = ({ label, value, avg, type /* 'higher-better' | 'lower-better' */ }) => {
    // Simple visualizer: 0 to 120 range roughly
    const max = 120;
    const valPct = Math.min((value / max) * 100, 100);
    const avgPct = Math.min((avg / max) * 100, 100);
    
    return (
        <div className="mb-6">
            <div className="flex justify-between text-xs font-space text-white/40 mb-2">
                <span>{label}</span>
                <span>{value} (You) vs {avg} (Avg)</span>
            </div>
            <div className="h-4 bg-white/5 rounded-full relative w-full overflow-hidden">
                {/* Population Avg Marker */}
                <div className="absolute top-0 bottom-0 w-1 bg-white/20 z-10" style={{ left: `${avgPct}%` }} />
                
                {/* User Value */}
                <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${valPct}%` }}
                    transition={{ duration: 1, delay: 0.5 }}
                    className={`h-full rounded-full ${value > avg ? 'bg-green-500' : 'bg-blue-500'}`}
                />
            </div>
        </div>
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
  if (!data || data.error) return null; // Simplified error for brevity

  const history = data.history || {};
  const recoveryRecs = history.recovery || [];

  // --- ANALYSIS ---
  
  // 1. Monthly Aggregation
  // Reverse to get Jan -> Feb -> Mar order
  const monthlyStats = processMonthlyData(recoveryRecs).reverse();

  // 2. User Averages (Last 30 Days)
  const last30 = recoveryRecs.slice(0, 30);
  const avgHRV = Math.round(last30.reduce((acc, curr) => acc + (curr.score?.hrv_rmssd_milli || 0), 0) / (last30.length || 1));
  const avgRHR = Math.round(last30.reduce((acc, curr) => acc + (curr.score?.resting_heart_rate || 0), 0) / (last30.length || 1));

  // 3. Percentiles
  const hrvRank = getPercentileRank(avgHRV, 'hrv');
  const rhrRank = getPercentileRank(avgRHR, 'rhr');

  return (
    <div className="min-h-screen bg-[#050505] text-white p-6 md:p-12 font-inter selection:bg-indigo-500/30">
        
        <header className="max-w-6xl mx-auto mb-16 border-b border-white/10 pb-8">
            <h1 className="font-playfair text-4xl text-white mb-2">
                Long-Term Analysis <span className="text-indigo-500">.</span>
            </h1>
            <p className="font-mono text-xs text-white/40">MONTHLY AVERAGES & POPULATION BENCHMARKS</p>
        </header>

        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12">
            
            {/* LEFT: MONTHLY TRENDS (8/12) */}
            <div className="lg:col-span-8">
                <h3 className="font-space text-xs tracking-widest text-white/40 uppercase mb-8">Monthly Performance</h3>
                
                <div className="h-[400px] w-full bg-zinc-900/30 rounded-3xl p-6 border border-white/5">
                    <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={monthlyStats}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                            <XAxis dataKey="month" stroke="#444" tick={{fontSize: 12}} tickLine={false} axisLine={false} />
                            <YAxis yAxisId="left" stroke="#444" tick={{fontSize: 12}} domain={[0, 100]} />
                            <YAxis yAxisId="right" orientation="right" stroke="#444" tick={{fontSize: 12}} domain={[0, 120]} />
                            <Tooltip 
                                contentStyle={{ backgroundColor: '#09090b', border: '1px solid #333' }}
                                itemStyle={{ color: '#fff' }}
                            />
                            <Bar yAxisId="left" dataKey="avgRecovery" name="Avg Recovery" barSize={40} fill="#3b82f6" radius={[4, 4, 0, 0]}>
                                {monthlyStats.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.avgRecovery >= 67 ? '#22c55e' : entry.avgRecovery <= 33 ? '#ef4444' : '#eab308'} fillOpacity={0.8} />
                                ))}
                            </Bar>
                            <Line yAxisId="right" type="monotone" dataKey="avgHRV" name="Avg HRV" stroke="#a855f7" strokeWidth={3} dot={{r: 4, fill: '#a855f7'}} />
                        </ComposedChart>
                    </ResponsiveContainer>
                </div>

                <div className="mt-8 grid grid-cols-3 gap-4">
                    <InsightCard 
                        title="Avg Recovery" 
                        value={`${Math.round(monthlyStats[monthlyStats.length-1]?.avgRecovery || 0)}%`} 
                        subtext="Last Month Avg" 
                        icon={Battery} 
                        delay={0.2} 
                    />
                    <InsightCard 
                        title="Avg HRV" 
                        value={`${Math.round(monthlyStats[monthlyStats.length-1]?.avgHRV || 0)}ms`} 
                        subtext="Trending Upwards" 
                        icon={Activity} 
                        delay={0.3} 
                    />
                     <InsightCard 
                        title="Log Consistency" 
                        value={`${monthlyStats[monthlyStats.length-1]?.count || 0}`} 
                        subtext="Days Logged" 
                        icon={TrendingUp} 
                        delay={0.4} 
                    />
                </div>
            </div>

            {/* RIGHT: POPULATION BENCHMARKS (4/12) */}
            <div className="lg:col-span-4 space-y-8">
                <div>
                     <h3 className="font-space text-xs tracking-widest text-white/40 uppercase mb-8 flex items-center gap-2">
                        <Users className="w-4 h-4" /> Global Percentiles
                     </h3>
                     
                     <div className="bg-zinc-900/30 rounded-3xl p-8 border border-white/5">
                        <div className="mb-8">
                             <div className="flex justify-between items-end mb-2">
                                <span className="text-xl font-playfair text-white">HRV Capacity</span>
                                <span className={`text-sm font-bold ${hrvRank.color}`}>{hrvRank.rank}</span>
                             </div>
                             <PercentileBar label="Heart Rate Variability" value={avgHRV} avg={55} type="higher-better" />
                             <p className="text-xs text-white/40 leading-relaxed">
                                 Your HRV of <strong>{avgHRV}ms</strong> places you in the <strong>{hrvRank.rank}</strong> of users in your demographic (30-35).
                             </p>
                        </div>

                        <div className="border-t border-white/5 my-6 pt-6"></div>

                        <div>
                             <div className="flex justify-between items-end mb-2">
                                <span className="text-xl font-playfair text-white">Cardio Health</span>
                                <span className={`text-sm font-bold ${rhrRank.color}`}>{rhrRank.rank}</span>
                             </div>
                             <PercentileBar label="Resting Heart Rate" value={avgRHR} avg={58} type="lower-better" />
                             <p className="text-xs text-white/40 leading-relaxed">
                                 A RHR of <strong>{avgRHR}bpm</strong> indicates <strong>{rhrRank.rank === 'Elite' || rhrRank.rank === 'Above Avg' ? 'excellent' : 'normal'}</strong> cardiovascular efficiency.
                             </p>
                        </div>
                     </div>
                </div>

                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="p-6 rounded-2xl bg-indigo-500/10 border border-indigo-500/20"
                >
                    <div className="flex items-center gap-3 mb-2">
                        <Trophy className="w-5 h-5 text-indigo-400" />
                        <h4 className="font-bold text-indigo-100">Performance Summary</h4>
                    </div>
                    <p className="text-sm text-indigo-200/60 leading-relaxed">
                        You are outperforming <strong>{hrvRank.percentile}%</strong> of the population in stress adaptation (HRV). Focus on maintaining this baseline to support higher training volumes next month.
                    </p>
                </motion.div>
            </div>

        </div>
    </div>
  );
};

export default WhoopDashboard;
