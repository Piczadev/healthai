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
      <div className="bg-mat-surface border border-gray-700 p-3 rounded shadow-elevation-3 z-50">
        <p className="text-mat-on-surface-variant text-xs mb-2 font-medium">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }}></span>
            <p className="text-sm text-mat-on-surface">
              {entry.name}: <span className="font-bold">{entry.value}</span>
            </p>
          </div>
        ))}
        {/* Contextual Warning in Tooltip */}
        {payload.find((p: any) => p.dataKey === 'hrv')?.value < 30 && (
          <div className="mt-2 pt-2 border-t border-gray-700 text-xs text-mat-error font-medium flex items-center gap-1">
            ⚠ Critical Recovery Zone
          </div>
        )}
      </div>
    );
  }
  return null;
};

export const ActivityVsBiometricsChart: React.FC<ChartProps> = ({ data }) => {
  // Calculate average steps for reference line
  const avgSteps = data.reduce((acc, curr) => acc + curr.steps, 0) / data.length;
  // Calculate average HRV
  const avgHRV = data.reduce((acc, curr) => acc + curr.hrv, 0) / data.length;

  return (
    <div className="h-[340px] w-full bg-mat-surface rounded-xl shadow-elevation-1 p-5">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-base font-medium text-mat-on-surface">Activity vs. Recovery</h3>
        <div className="flex gap-4 text-xs text-mat-on-surface-variant">
           <div className="flex items-center gap-1"><span className="w-3 h-3 bg-mat-primary/50 rounded-sm"></span> Steps</div>
           <div className="flex items-center gap-1"><span className="w-3 h-3 bg-mat-error rounded-full"></span> HRV</div>
        </div>
      </div>
      
      <ResponsiveContainer width="100%" height="85%">
        <ComposedChart data={data} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="stepGradientMat" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#90CAF9" stopOpacity={0.6}/>
              <stop offset="95%" stopColor="#90CAF9" stopOpacity={0.1}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
          <XAxis 
            dataKey="date" 
            tick={{fontSize: 11, fill: '#B0BEC5'}} 
            tickFormatter={(value) => value.slice(8)} // Show day only
            axisLine={false}
            tickLine={false}
            interval={6}
          />
          <YAxis yAxisId="left" tick={{fontSize: 11, fill: '#B0BEC5'}} axisLine={false} tickLine={false} />
          <YAxis yAxisId="right" orientation="right" tick={{fontSize: 11, fill: '#B0BEC5'}} domain={[0, 100]} axisLine={false} tickLine={false}/>
          <Tooltip content={<CustomTooltip />} />
          
          {/* Reference Line for Average Steps */}
          <ReferenceLine yAxisId="left" y={avgSteps} stroke="#90CAF9" strokeDasharray="3 3" strokeOpacity={0.5} label={{ position: 'insideTopLeft', value: 'Avg Load', fill: '#90CAF9', fontSize: 10 }} />
          
          {/* Reference Line for Average HRV */}
          <ReferenceLine yAxisId="right" y={avgHRV} stroke="#EF9A9A" strokeDasharray="3 3" strokeOpacity={0.5} label={{ position: 'insideTopRight', value: 'Avg HRV', fill: '#EF9A9A', fontSize: 10 }} />
          
          {/* Critical Zone for HRV */}
          <ReferenceArea yAxisId="right" y1={0} y2={30} fill="#EF9A9A" fillOpacity={0.1} />

          <Bar yAxisId="left" dataKey="steps" fill="url(#stepGradientMat)" radius={[4, 4, 0, 0]} name="Steps" barSize={8} />
          <Line yAxisId="right" type="monotone" dataKey="hrv" stroke="#EF9A9A" strokeWidth={2.5} dot={false} name="HRV (ms)" />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};

export const StressZoneChart: React.FC<ChartProps> = ({ data }) => {
  // Average RHR
  const avgRHR = data.reduce((acc, curr) => acc + curr.restingHeartRate, 0) / data.length;

  return (
    <div className="h-[280px] w-full bg-mat-surface rounded-xl shadow-elevation-1 p-5">
      <h3 className="text-base font-medium text-mat-on-surface mb-6">Resting Heart Rate Trend</h3>
      <ResponsiveContainer width="100%" height="80%">
        <AreaChart data={data} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="rhrColorMat" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#FFE082" stopOpacity={0.4}/>
              <stop offset="95%" stopColor="#FFE082" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
          <XAxis dataKey="date" hide />
          <YAxis domain={['dataMin - 5', 'dataMax + 5']} tick={{fontSize: 11, fill: '#B0BEC5'}} axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltip />} />
          
          {/* Warning Zone RHR > 70 */}
          <ReferenceLine y={70} stroke="#EF9A9A" strokeDasharray="3 3" label={{ position: 'insideTopLeft', value: 'Stress Threshold (70bpm)', fill: '#EF9A9A', fontSize: 10 }} />

          <Area type="monotone" dataKey="restingHeartRate" stroke="#FFE082" strokeWidth={2} fillOpacity={1} fill="url(#rhrColorMat)" name="RHR" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};