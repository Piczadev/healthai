import React from 'react';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Tooltip } from 'recharts';
import { SystemProfile } from '../types';
import { Fingerprint } from 'lucide-react';

interface SystemIdentityCardProps {
  profile: SystemProfile;
}

export const SystemIdentityCard: React.FC<SystemIdentityCardProps> = ({ profile }) => {
  return (
    <div className="bg-white/5 rounded-[2.5rem] p-8 md:p-12 border border-white/10 flex flex-col items-center relative overflow-hidden group">
      
      {/* Background glow - Animated Liquid Blob */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-accent-cyan/5 blur-[80px] rounded-full pointer-events-none animate-spin-slow opacity-60"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-accent-violet/5 blur-[100px] rounded-full pointer-events-none animate-pulse duration-[5000ms]"></div>

      <div className="flex items-center gap-3 mb-8 text-accent-cyan relative z-10 opacity-90">
        <Fingerprint size={32} strokeWidth={1.5} />
        <h3 className="text-2xl font-extralight tracking-[0.3em] uppercase">System Identity</h3>
      </div>

      <div className="text-center mb-10 relative z-10 w-full max-w-lg">
        <div className="inline-block mb-6 px-8 py-3 rounded-full border border-accent-cyan/30 bg-accent-cyan/10 text-accent-cyan text-sm font-bold tracking-[0.2em] uppercase shadow-[0_0_25px_rgba(0,229,255,0.15)] backdrop-blur-md">
          {profile.archetype}
        </div>
        <p className="text-sm text-glass-muted font-light italic leading-7 px-4">
          "{profile.bio}"
        </p>
      </div>

      <div className="w-full h-[400px] relative z-10">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="75%" data={profile.attributes}>
            <PolarGrid stroke="rgba(255,255,255,0.1)" />
            <PolarAngleAxis 
              dataKey="subject" 
              tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 10, fontWeight: 600, letterSpacing: '0.1em' }} 
            />
            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
            <Radar
              name="Attributes"
              dataKey="A"
              stroke="#00E5FF"
              strokeWidth={3}
              fill="#00E5FF"
              fillOpacity={0.15}
              isAnimationActive={true}
              animationDuration={1500}
              animationEasing="ease-out"
            />
            <Tooltip 
              contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '16px', backdropFilter: 'blur(20px)', padding: '12px' }}
              itemStyle={{ color: '#00E5FF', fontSize: '12px', fontWeight: 500 }}
              labelStyle={{ color: 'rgba(255,255,255,0.5)', fontSize: '10px', textTransform: 'uppercase', marginBottom: '4px' }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      <div className="w-full mt-8 grid grid-cols-2 sm:grid-cols-5 gap-4 relative z-10">
        {profile.attributes.map((attr, i) => (
          <div key={i} className="flex flex-col items-center justify-center p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-white/10 transition-colors group/stat">
            <span className="text-[9px] text-white/40 uppercase tracking-[0.15em] mb-2 group-hover/stat:text-white/60 transition-colors">{attr.subject}</span>
            <span className={`text-xl font-light tracking-wide ${attr.A > 80 ? 'text-accent-emerald drop-shadow-[0_0_8px_rgba(105,240,174,0.3)]' : attr.A < 40 ? 'text-accent-pink' : 'text-white'}`}>
              {attr.A}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};