
import React, { useState, useMemo } from 'react';
import { 
  ResponsiveContainer, 
  ComposedChart, 
  Line, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  AreaChart, 
  Area,
  ReferenceLine,
  ReferenceArea
} from 'recharts';
import { DailyMetric } from '../types';
import { GitCompare, Calendar } from 'lucide-react';

interface ChartProps {
  data: DailyMetric[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-black/60 backdrop-blur-xl border border-white/10 p-3 rounded-2xl shadow-2xl z-50 min-w-[150px]">
        <p className="text-white/60 text-[10px] mb-2 font-medium uppercase tracking-wider">{label}</p>
        {payload.map((entry: any, index: number) => {
          // Skip the shadow/background bars if any
          if (entry.dataKey === 'prevSteps' || entry.dataKey === 'prevHrv') {
             return (
               <div key={index} className="flex items-center gap-2 mb-1 opacity-50">
                 <span className="w-1.5 h-1.5 rounded-full border border-current" style={{ color: entry.color }}></span>
                 <p className="text-xs text-white">
                   Prev {entry.name}: <span className="font-mono">{entry.value}</span>
                 </p>
               </div>
             );
          }
          return (
            <div key={index} className="flex items-center gap-2 mb-1">
              <span className="w-1.5 h-1.5 rounded-full shadow-[0_0_5px_currentColor]" style={{ backgroundColor: entry.color, color: entry.color }}></span>
              <p className="text-xs text-white">
                {entry.name}: <span className="font-semibold">{entry.value}</span>
              </p>
            </div>
          );
        })}
        {payload.find((p: any) => p.dataKey === 'hrv')?.value < 30 && (
          <div className="mt-2 pt-2 border-t border-white/10 text-[10px] text-accent-pink font-medium flex items-center gap-1">
            ⚠ Critical Zone
          </div>
        )}
      </div>
    );
  }
  return null;
};

export const ActivityVsBiometricsChart: React.FC<ChartProps> = ({ data }) => {
  const [showComparison, setShowComparison] = useState(false);

  const avgSteps = data.reduce((acc, curr) => acc + curr.steps, 0) / data.length;
  const avgHRV = data.reduce((acc, curr) => acc + curr.hrv, 0) / data.length;

  const chartData = useMemo(() => {
    if (!showComparison) return data;

    // Get last 7 days
    const currentWeek = data.slice(-7);
    // Get 7 days before that
    const prevWeek = data.slice(-14, -7);

    return currentWeek.map((item, index) => {
      const prev = prevWeek[index];
      const dateObj = new Date(item.date);
      const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
      
      return {
        ...item,
        displayLabel: dayName,
        prevSteps: prev?.steps,
        prevHrv: prev?.hrv,
        prevMood: prev?.moodScore
      };
    });
  }, [data, showComparison]);

  return (
    <div className="h-[340px] w-full bg-glass-surface backdrop-blur-xl border border-glass-border rounded-3xl shadow-glass p-6 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <h3 className="text-sm font-medium text-glass-text tracking-wide">
            {showComparison ? 'Week-over-Week Analysis' : 'System Load vs. Recovery'}
          </h3>
          <button 
            onClick={() => setShowComparison(!showComparison)}
            className={`
              flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider border transition-all duration-300
              ${showComparison 
                ? 'bg-accent-cyan/10 border-accent-cyan/30 text-accent-cyan shadow-[0_0_10px_rgba(0,229,255,0.2)]' 
                : 'bg-white/5 border-white/10 text-white/40 hover:text-white hover:bg-white/10'}
            `}
          >
            {showComparison ? <GitCompare size={12} /> : <Calendar size={12} />}
            {showComparison ? 'Vs Last Week' : 'Timeline'}
          </button>
        </div>

        <div className="flex gap-4 text-[10px] text-glass-muted uppercase tracking-wider font-semibold">
           {showComparison && (
             <div className="flex items-center gap-1.5 opacity-50"><span className="w-2 h-2 border border-white/60 rounded-sm"></span> Previous</div>
           )}
           <div className="flex items-center gap-1.5"><span className="w-2 h-2 bg-accent-cyan/50 rounded-sm"></span> Load (Steps)</div>
           <div className="flex items-center gap-1.5"><span className="w-2 h-2 bg-accent-pink rounded-full"></span> HRV</div>
           <div className="flex items-center gap-1.5"><span className="w-2 h-2 bg-accent-violet rounded-full"></span> Mood</div>
        </div>
      </div>
      
      <ResponsiveContainer width="100%" height="85%">
        <ComposedChart data={chartData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="stepGradientGlass" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#00E5FF" stopOpacity={0.4}/>
              <stop offset="95%" stopColor="#00E5FF" stopOpacity={0}/>
            </linearGradient>
            <pattern id="diagonalHatch" patternUnits="userSpaceOnUse" width="4" height="4">
              <path d="M-1,1 l2,-2 M0,4 l4,-4 M3,5 l2,-2" style={{stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1}} />
            </pattern>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
          
          <XAxis 
            dataKey={showComparison ? "displayLabel" : "date"} 
            tick={{fontSize: 10, fill: 'rgba(255,255,255,0.4)'}} 
            tickFormatter={(value) => showComparison ? value : value.slice(8)} 
            axisLine={false}
            tickLine={false}
            interval={showComparison ? 0 : 6}
          />
          
          {/* Axis for Steps */}
          <YAxis yAxisId="left" tick={{fontSize: 10, fill: 'rgba(255,255,255,0.4)'}} axisLine={false} tickLine={false} />
          {/* Axis for HRV */}
          <YAxis yAxisId="right" orientation="right" tick={{fontSize: 10, fill: 'rgba(255,255,255,0.4)'}} domain={[0, 100]} axisLine={false} tickLine={false}/>
          {/* Hidden Axis for Mood (0-10) */}
          <YAxis yAxisId="mood" orientation="right" domain={[0, 12]} hide />

          <Tooltip content={<CustomTooltip />} cursor={{fill: 'rgba(255,255,255,0.03)'}} />
          
          {!showComparison && (
            <>
              <ReferenceLine yAxisId="left" y={avgSteps} stroke="#00E5FF" strokeDasharray="3 3" strokeOpacity={0.3} />
              <ReferenceLine yAxisId="right" y={avgHRV} stroke="#FF4081" strokeDasharray="3 3" strokeOpacity={0.3} />
            </>
          )}
          <ReferenceArea yAxisId="right" y1={0} y2={30} fill="#FF4081" fillOpacity={0.05} />

          {/* Previous Period Data (Ghost) */}
          {showComparison && (
            <Bar 
              yAxisId="left" 
              dataKey="prevSteps" 
              fill="url(#diagonalHatch)" 
              stroke="rgba(255,255,255,0.2)"
              radius={[2, 2, 0, 0]} 
              name="Steps" 
              barSize={6}
              isAnimationActive={true}
              animationDuration={1500}
            />
          )}

          {/* Current Period Data */}
          <Bar 
            yAxisId="left" 
            dataKey="steps" 
            fill="url(#stepGradientGlass)" 
            radius={[2, 2, 0, 0]} 
            name="Steps" 
            barSize={6} 
            isAnimationActive={true}
            animationDuration={2000}
            animationBegin={0}
            animationEasing="ease-out"
          />
          
          {/* Previous HRV (Ghost) */}
          {showComparison && (
            <Line 
              yAxisId="right" 
              type="monotone" 
              dataKey="prevHrv" 
              stroke="#FF4081" 
              strokeWidth={1} 
              strokeDasharray="4 4"
              strokeOpacity={0.4}
              dot={false} 
              name="HRV"
              isAnimationActive={true}
              animationDuration={1500}
            />
          )}

          <Line 
            yAxisId="right" 
            type="monotone" 
            dataKey="hrv" 
            stroke="#FF4081" 
            strokeWidth={2} 
            dot={false} 
            activeDot={{r: 4, strokeWidth: 0, fill: '#FF4081'}}
            name="HRV (ms)" 
            isAnimationActive={true}
            animationDuration={2500}
            animationBegin={300}
            animationEasing="ease-in-out"
          />

          <Line 
            yAxisId="mood" 
            type="monotone" 
            dataKey="moodScore" 
            stroke="#7C4DFF" 
            strokeWidth={2} 
            strokeDasharray="4 4"
            dot={{r: 2, fill: '#7C4DFF', strokeWidth: 0}}
            activeDot={{r: 4, strokeWidth: 0, fill: '#7C4DFF'}}
            name="Mood (1-10)"
            isAnimationActive={true}
            animationDuration={2500}
            animationBegin={600}
            animationEasing="ease-in-out"
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};

export const StressZoneChart: React.FC<ChartProps> = ({ data }) => {
  return (
    <div className="h-[280px] w-full bg-glass-surface backdrop-blur-xl border border-glass-border rounded-3xl shadow-glass p-6 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-200">
      <h3 className="text-sm font-medium text-glass-text mb-6 tracking-wide">Resting Heart Rate</h3>
      <ResponsiveContainer width="100%" height="80%">
        <AreaChart data={data} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="rhrColorGlass" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#FFD740" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#FFD740" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
          <XAxis dataKey="date" hide />
          <YAxis domain={['dataMin - 5', 'dataMax + 5']} tick={{fontSize: 10, fill: 'rgba(255,255,255,0.4)'}} axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltip />} cursor={{stroke: 'rgba(255,255,255,0.1)'}} />
          
          <ReferenceLine y={70} stroke="#FF4081" strokeDasharray="3 3" strokeOpacity={0.5} label={{ position: 'insideTopLeft', value: '70bpm Limit', fill: '#FF4081', fontSize: 9, opacity: 0.7 }} />

          <Area 
            type="monotone" 
            dataKey="restingHeartRate" 
            stroke="#FFD740" 
            strokeWidth={2} 
            fillOpacity={1} 
            fill="url(#rhrColorGlass)" 
            name="RHR" 
            isAnimationActive={true}
            animationDuration={2500}
            animationEasing="ease-in-out"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
