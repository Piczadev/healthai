
import React from 'react';
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

interface ChartProps {
  data: DailyMetric[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-black/60 backdrop-blur-xl border border-white/10 p-3 rounded-2xl shadow-2xl z-50">
        <p className="text-white/60 text-[10px] mb-2 font-medium uppercase tracking-wider">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2 mb-1">
            <span className="w-1.5 h-1.5 rounded-full shadow-[0_0_5px_currentColor]" style={{ backgroundColor: entry.color, color: entry.color }}></span>
            <p className="text-xs text-white">
              {entry.name}: <span className="font-semibold">{entry.value}</span>
            </p>
          </div>
        ))}
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
  const avgSteps = data.reduce((acc, curr) => acc + curr.steps, 0) / data.length;
  const avgHRV = data.reduce((acc, curr) => acc + curr.hrv, 0) / data.length;

  return (
    <div className="h-[340px] w-full bg-glass-surface backdrop-blur-xl border border-glass-border rounded-3xl shadow-glass p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-sm font-medium text-glass-text tracking-wide">System Load vs. Recovery</h3>
        <div className="flex gap-4 text-[10px] text-glass-muted uppercase tracking-wider font-semibold">
           <div className="flex items-center gap-1.5"><span className="w-2 h-2 bg-accent-cyan/50 rounded-sm"></span> Load (Steps)</div>
           <div className="flex items-center gap-1.5"><span className="w-2 h-2 bg-accent-pink rounded-full"></span> HRV</div>
           <div className="flex items-center gap-1.5"><span className="w-2 h-2 bg-accent-violet rounded-full"></span> Mood</div>
        </div>
      </div>
      
      <ResponsiveContainer width="100%" height="85%">
        <ComposedChart data={data} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="stepGradientGlass" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#00E5FF" stopOpacity={0.4}/>
              <stop offset="95%" stopColor="#00E5FF" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
          <XAxis 
            dataKey="date" 
            tick={{fontSize: 10, fill: 'rgba(255,255,255,0.4)'}} 
            tickFormatter={(value) => value.slice(8)} 
            axisLine={false}
            tickLine={false}
            interval={6}
          />
          {/* Axis for Steps */}
          <YAxis yAxisId="left" tick={{fontSize: 10, fill: 'rgba(255,255,255,0.4)'}} axisLine={false} tickLine={false} />
          {/* Axis for HRV */}
          <YAxis yAxisId="right" orientation="right" tick={{fontSize: 10, fill: 'rgba(255,255,255,0.4)'}} domain={[0, 100]} axisLine={false} tickLine={false}/>
          {/* Hidden Axis for Mood (0-10) */}
          <YAxis yAxisId="mood" orientation="right" domain={[0, 12]} hide />

          <Tooltip content={<CustomTooltip />} cursor={{fill: 'rgba(255,255,255,0.03)'}} />
          
          <ReferenceLine yAxisId="left" y={avgSteps} stroke="#00E5FF" strokeDasharray="3 3" strokeOpacity={0.3} />
          <ReferenceLine yAxisId="right" y={avgHRV} stroke="#FF4081" strokeDasharray="3 3" strokeOpacity={0.3} />
          <ReferenceArea yAxisId="right" y1={0} y2={30} fill="#FF4081" fillOpacity={0.05} />

          <Bar yAxisId="left" dataKey="steps" fill="url(#stepGradientGlass)" radius={[2, 2, 0, 0]} name="Steps" barSize={6} />
          
          <Line 
            yAxisId="right" 
            type="monotone" 
            dataKey="hrv" 
            stroke="#FF4081" 
            strokeWidth={2} 
            dot={false} 
            activeDot={{r: 4, strokeWidth: 0, fill: '#FF4081'}}
            name="HRV (ms)" 
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
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};

export const StressZoneChart: React.FC<ChartProps> = ({ data }) => {
  return (
    <div className="h-[280px] w-full bg-glass-surface backdrop-blur-xl border border-glass-border rounded-3xl shadow-glass p-6">
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

          <Area type="monotone" dataKey="restingHeartRate" stroke="#FFD740" strokeWidth={2} fillOpacity={1} fill="url(#rhrColorGlass)" name="RHR" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
