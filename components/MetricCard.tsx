import React from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  unit?: string;
  average?: number; 
  optimalRange?: { min: number; max: number };
  status?: 'success' | 'warning' | 'danger' | 'neutral';
  icon: React.ReactNode;
  className?: string;
  delay?: number; // Animation delay index
}

export const MetricCard: React.FC<MetricCardProps> = ({ 
  title, 
  value, 
  unit, 
  average, 
  optimalRange,
  status = 'neutral', 
  icon, 
  className = '',
  delay = 0
}) => {
  
  let feedback = null;
  const numericValue = typeof value === 'string' ? parseFloat(value.replace(/,/g, '')) : value;
  
  if (average && !isNaN(numericValue)) {
    const diff = numericValue - average;
    const percent = ((diff / average) * 100).toFixed(0);
    const isHigher = diff > 0;
    
    // Minimalist feedback pill with glass background
    feedback = (
      <div className={`flex items-center text-[10px] font-medium px-2.5 py-1 rounded-full mt-3 w-fit backdrop-blur-md border shadow-sm transition-transform group-hover:scale-105 ${
        status === 'danger' ? 'bg-accent-pink/10 border-accent-pink/20 text-accent-pink' : 
        status === 'warning' ? 'bg-accent-amber/10 border-accent-amber/20 text-accent-amber' : 
        'bg-white/5 border-white/10 text-glass-muted'
      }`}>
        {isHigher ? <ArrowUp size={10} className="mr-1" /> : <ArrowDown size={10} className="mr-1" />}
        {Math.abs(Number(percent))}%
      </div>
    );
  }

  // Liquid/Glass Gradients based on status
  const iconWrapperStyles = {
    success: 'bg-gradient-to-br from-accent-emerald/20 to-transparent text-accent-emerald shadow-[0_0_20px_rgba(105,240,174,0.2)]',
    warning: 'bg-gradient-to-br from-accent-amber/20 to-transparent text-accent-amber shadow-[0_0_20px_rgba(255,215,64,0.2)]',
    danger: 'bg-gradient-to-br from-accent-pink/20 to-transparent text-accent-pink shadow-[0_0_20px_rgba(255,64,129,0.3)] animate-pulse',
    neutral: 'bg-gradient-to-br from-accent-cyan/20 to-transparent text-accent-cyan shadow-[0_0_20px_rgba(0,229,255,0.2)]',
  };

  const borderStyles = {
    success: 'group-hover:border-accent-emerald/30',
    warning: 'group-hover:border-accent-amber/30',
    danger: 'group-hover:border-accent-pink/40 border-accent-pink/20', // Critical always has a slight border hint
    neutral: 'group-hover:border-accent-cyan/30',
  };

  return (
    <div 
      className={`relative overflow-hidden bg-glass-surface backdrop-blur-xl border border-white/5 border-t-white/10 rounded-3xl p-6 shadow-glass transition-all duration-500 hover:shadow-[0_8px_32px_rgba(0,0,0,0.3)] hover:-translate-y-1 group ${borderStyles[status]} ${className}`}
      style={{ animationDelay: `${delay * 100}ms` }}
    >
      {/* Entrance Animation Class applied via style/global or generic utility if available, 
          using generic Tailwind animate-in for now */}
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-forwards">
        
        {/* Subtle shine effect on hover */}
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
        
        {/* Status Glow for Danger */}
        {status === 'danger' && (
          <div className="absolute -right-10 -top-10 w-32 h-32 bg-accent-pink/20 blur-[50px] rounded-full pointer-events-none opacity-50 group-hover:opacity-80 transition-opacity"></div>
        )}

        <div className="flex justify-between items-start relative z-10">
          <div>
             <span className="text-[10px] font-bold text-glass-muted block mb-1.5 tracking-[0.15em] uppercase opacity-70 group-hover:opacity-100 transition-opacity">{title}</span>
             <div className="flex items-baseline gap-1.5">
               <span className="text-3xl lg:text-4xl font-light text-glass-text tracking-tight drop-shadow-sm">{value}</span>
               {unit && <span className="text-xs text-glass-muted font-normal uppercase tracking-wider opacity-60">{unit}</span>}
             </div>
          </div>
          <div className={`p-3 rounded-2xl ${iconWrapperStyles[status]} transition-all duration-300 group-hover:scale-110`}>
            {icon}
          </div>
        </div>
        
        <div className="mt-1 relative z-10 pl-1">
          {feedback}
          {optimalRange && !isNaN(numericValue) && (
            <div className="text-[9px] text-glass-muted/40 mt-2 font-mono tracking-wide">
              Target: {optimalRange.min}-{optimalRange.max}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};