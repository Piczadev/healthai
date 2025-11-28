import React from 'react';
import { ArrowUp, ArrowDown, Minus } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  unit?: string;
  average?: number; // 30-day average for context
  optimalRange?: { min: number; max: number }; // Optional safe zone
  status?: 'success' | 'warning' | 'danger' | 'neutral';
  icon: React.ReactNode;
  className?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({ 
  title, 
  value, 
  unit, 
  average, 
  optimalRange,
  status = 'neutral', 
  icon, 
  className = '' 
}) => {
  
  // Calculate deviation if average is provided and value is a number
  let feedback = null;
  const numericValue = typeof value === 'string' ? parseFloat(value.replace(/,/g, '')) : value;
  
  if (average && !isNaN(numericValue)) {
    const diff = numericValue - average;
    const percent = ((diff / average) * 100).toFixed(0);
    const isHigher = diff > 0;
    
    // Determine context based on the metric type (implied by optimalRange or status logic passed from parent)
    // For simplicity here, we stick to visual deviation
    feedback = (
      <div className={`flex items-center text-xs font-medium px-2 py-0.5 rounded-full mt-2 w-fit ${
        status === 'danger' ? 'bg-mat-error/10 text-mat-error' : 
        status === 'warning' ? 'bg-mat-warning/10 text-mat-warning' : 
        'bg-mat-surface-hover text-mat-on-surface-variant'
      }`}>
        {isHigher ? <ArrowUp size={12} className="mr-1" /> : <ArrowDown size={12} className="mr-1" />}
        {Math.abs(Number(percent))}% vs Avg
      </div>
    );
  }

  // Material Colors
  const iconBgStyles = {
    success: 'bg-mat-secondary/20 text-mat-secondary',
    warning: 'bg-mat-warning/20 text-mat-warning',
    danger: 'bg-mat-error/20 text-mat-error',
    neutral: 'bg-mat-primary/20 text-mat-primary',
  };

  return (
    <div className={`bg-mat-surface rounded-xl p-5 shadow-elevation-1 hover:shadow-elevation-2 transition-shadow duration-300 flex flex-col justify-between h-full ${className}`}>
      <div className="flex justify-between items-start">
        <div>
           <span className="text-sm font-medium text-mat-on-surface-variant block mb-1">{title}</span>
           <div className="flex items-baseline gap-1">
             <span className="text-3xl font-normal text-mat-on-surface">{value}</span>
             {unit && <span className="text-sm text-mat-on-surface-variant font-normal">{unit}</span>}
           </div>
        </div>
        <div className={`p-2 rounded-lg ${iconBgStyles[status]}`}>
          {icon}
        </div>
      </div>
      
      {/* Contextual Feedback Section */}
      <div className="mt-2">
        {feedback}
        {optimalRange && !isNaN(numericValue) && (
          <div className="text-[10px] text-gray-500 mt-1">
            Optimal: {optimalRange.min}-{optimalRange.max} {unit}
          </div>
        )}
      </div>
    </div>
  );
};