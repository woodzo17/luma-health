import React, { useState, useEffect } from 'react'; // turbo
import { motion } from 'framer-motion';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  LineChart, Line, BarChart, Bar, CartesianGrid 
} from 'recharts';
import { Activity, Moon, Zap } from 'lucide-react';

// --- UTILITIES ---
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return `${date.getMonth() + 1}/${date.getDate()}`;
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

const ChartCard = ({ title, children, delay }) => (
    <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay, duration: 0.6 }}
        className="backdrop-blur-xl bg-black/40 rounded-3xl p-8 border border-white/10 shadow-2xl"
    >
        <h3 className="font-playfair text-2xl text-white mb-6">{title}</h3>
        <div className="h-[300px] w-full">
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
        const res = await fetch('/api/whoop/data?days=30');
        if (res.status === 401) {
            window.location.href = '/api/whoop/auth';
            return;
        }
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return (
    <div className="min-h-screen bg-neutral-900 flex items-center justify-center">
        <div className="animate-pulse text-white font-space tracking-widest">INITIALIZING LINK...</div>
    </div>
  );

  if (!data) return null;

  const { latest, history } = data;
  
  // Transform Data for Charts
  // We need to match recovery, sleep, strain by date. 
  // Whoop dates are usually in specific formats, here we assume mapped by index or we align them.
  // For simplicity V2, let's just reverse the recovery array (newest first -> oldest) to plot timeline oldest -> newest.
  const chartData = history.recovery?.slice().reverse().map(req => {
     // Find matching strain (cycle)
     // This is a naive match, usually you match by 'cycle_id', but for visual demo this is okay.
     return {
        date: formatDate(req.created_at),
        recovery: req.score?.recovery_score || 0,
        hrv: req.score?.hrv_rmssd_milli || 0,
        rhr: req.score?.resting_heart_rate || 0,
     };
  }) || [];

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
                <p className="font-space text-xs tracking-widest text-white/50 uppercase">
                    Biometric Synchronization Active
                </p>
            </div>
            
             <a href="/" className="text-sm font-space text-white/40 hover:text-white transition-colors">
                EXIT SIMULATION
            </a>
        </motion.header>

        {/* HERO STATS */}
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <StatCard 
                title="Recovery" 
                value={latest.recovery?.score?.recovery_score || 0} 
                label="%" 
                icon={Activity} 
                color="green" 
                delay={0.1} 
            />
            <StatCard 
                title="Strain" 
                value={Math.round(latest.cycle?.score?.strain || 0)} 
                label="/ 21" 
                icon={Zap} 
                color="blue" 
                delay={0.2} 
            />
             <StatCard 
                title="Sleep" 
                value={latest.sleep?.score?.sleep_performance_percentage || 0} 
                label="PERFORMANCE" 
                icon={Moon} 
                color="purple" 
                delay={0.3} 
            />
        </div>

        {/* CHARTS */}
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            
            {/* RECOVERY TREND */}
            <ChartCard title="30-Day Recovery Trend" delay={0.4}>
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                        <defs>
                            <linearGradient id="colorRecovery" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                        <XAxis dataKey="date" stroke="#666" tick={{fill: '#666', fontSize: 10}} tickLine={false} axisLine={false} />
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

            {/* HRV vs RHR */}
            <ChartCard title="Heart Rate Variability" delay={0.5}>
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                        <defs>
                            <linearGradient id="colorHrv" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                        <XAxis dataKey="date" stroke="#666" tick={{fill: '#666', fontSize: 10}} tickLine={false} axisLine={false} />
                        <YAxis stroke="#666" tick={{fill: '#666', fontSize: 10}} tickLine={false} axisLine={false} />
                        <Tooltip 
                             contentStyle={{ backgroundColor: '#000', border: '1px solid #333', borderRadius: '12px' }}
                             itemStyle={{ color: '#fff' }}
                        />
                        <Area 
                            type="monotone" 
                            dataKey="hrv" 
                            stroke="#3b82f6" 
                            strokeWidth={3}
                            fillOpacity={1} 
                            fill="url(#colorHrv)" 
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </ChartCard>

        </div>
    </div>
  );
};

export default WhoopDashboard;
