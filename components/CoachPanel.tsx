import React, { useState, useEffect } from 'react';
import { DailyMetric, AnalysisResponse } from '../types';
import { analyzeBioSystem } from '../services/geminiService';
import { Terminal, Cpu, AlertTriangle, CheckCircle, RefreshCw, FileText, Zap, Shield, ArrowRight } from 'lucide-react';

interface CoachPanelProps {
  data: DailyMetric[];
  onOpenReport: () => void;
}

export const CoachPanel: React.FC<CoachPanelProps> = ({ data, onOpenReport }) => {
  const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const runDiagnostics = async () => {
    setLoading(true);
    try {
      const result = await analyzeBioSystem(data);
      setAnalysis(result);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runDiagnostics();
  }, []);

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'OPTIMAL': return 'bg-mat-secondary/20 text-mat-secondary border-mat-secondary/50';
      case 'WARNING': return 'bg-mat-warning/20 text-mat-warning border-mat-warning/50';
      case 'CRITICAL': 
      case 'REBOOT_REQUIRED': return 'bg-mat-error/20 text-mat-error border-mat-error/50';
      default: return 'bg-gray-800 text-gray-400 border-gray-600';
    }
  };

  const getRiskColor = (risk: number) => {
    if (risk < 30) return 'bg-mat-secondary';
    if (risk < 70) return 'bg-mat-warning';
    return 'bg-mat-error';
  };

  return (
    <div className="flex flex-col h-full bg-mat-surface">
      {/* Header */}
      <div className="p-6 border-b border-white/5 flex justify-between items-center">
        <h2 className="text-mat-primary font-medium flex items-center gap-2 tracking-wide text-sm uppercase">
          <Terminal size={18} />
          Diagnostic Assistant
        </h2>
        <button 
          onClick={runDiagnostics} 
          disabled={loading}
          className="p-2 hover:bg-white/5 rounded-full transition-colors disabled:opacity-50 text-mat-on-surface-variant"
        >
          <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        {loading ? (
          <div className="space-y-4 animate-pulse">
            <div className="h-20 bg-mat-bg rounded-xl"></div>
            <div className="h-40 bg-mat-bg rounded-xl"></div>
            <div className="h-4 bg-mat-bg rounded w-3/4"></div>
          </div>
        ) : analysis ? (
          <>
            {/* System Status Banner */}
            <div className={`p-4 border rounded-xl flex flex-col items-center justify-center text-center gap-2 ${getStatusColor(analysis.systemStatus)}`}>
              <div className="text-xs uppercase font-bold tracking-wider opacity-80">Current State</div>
              <div className="text-xl font-bold tracking-widest">{analysis.systemStatus}</div>
            </div>

            {/* Burnout Meter */}
            <div className="bg-mat-bg p-5 rounded-xl border border-white/5 shadow-inner">
              <div className="flex justify-between items-end mb-2">
                <span className="text-xs font-medium text-mat-on-surface flex items-center gap-2">
                  <Zap size={14} className="text-mat-warning" /> Burnout Risk
                </span>
                <span className="text-xs font-bold text-mat-on-surface">{analysis.burnoutRisk}%</span>
              </div>
              <div className="h-2 w-full bg-gray-800 rounded-full overflow-hidden mb-4">
                <div 
                  className={`h-full ${getRiskColor(analysis.burnoutRisk)} transition-all duration-1000 ease-out`} 
                  style={{ width: `${analysis.burnoutRisk}%` }}
                ></div>
              </div>
              <p className="text-xs text-mat-on-surface-variant leading-relaxed italic">
                "{analysis.predictiveAnalysis}"
              </p>
            </div>

            {/* Analysis Summary */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-mat-on-surface-variant uppercase flex items-center gap-2">
                <Cpu size={14} /> Kernel Analysis
              </h3>
              <p className="text-sm text-mat-on-surface leading-relaxed">
                {analysis.summary}
              </p>
            </div>

            {/* Preventative Patches */}
            {analysis.preventativePatches && analysis.preventativePatches.length > 0 && (
              <div className="space-y-3">
                 <h3 className="text-xs font-bold text-mat-primary uppercase flex items-center gap-2">
                  <Shield size={14} /> Recommended Patches
                </h3>
                <ul className="space-y-2">
                  {analysis.preventativePatches.map((patch, idx) => (
                    <li key={idx} className="text-sm bg-mat-primary/10 text-mat-on-surface px-4 py-3 rounded-lg border-l-2 border-mat-primary flex gap-2">
                      {patch}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Actions */}
            <div className="space-y-3">
               <h3 className="text-xs font-bold text-mat-on-surface-variant uppercase flex items-center gap-2">
                <CheckCircle size={14} /> Optimization Protocols
              </h3>
              <ul className="space-y-2">
                {analysis.actionableSteps.map((step, idx) => (
                  <li key={idx} className="p-3 bg-mat-bg rounded-lg border border-white/5 text-sm flex gap-3 items-start text-mat-on-surface-variant">
                    <span className="font-mono text-xs text-mat-on-surface opacity-50 pt-0.5">0{idx + 1}</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-mat-on-surface-variant gap-4 opacity-50">
             <Terminal size={48} />
             <p className="text-sm">System ready. Run diagnostics.</p>
          </div>
        )}
      </div>

      <div className="p-6 border-t border-white/5">
         <button 
           onClick={onOpenReport}
           className="w-full py-3 bg-mat-primary hover:bg-blue-400 text-black font-medium text-sm rounded-lg shadow-elevation-2 hover:shadow-elevation-3 flex items-center justify-center gap-2 transition-all active:scale-95"
         >
           <FileText size={18} />
           Generate System Audit
           <ArrowRight size={16} className="opacity-60" />
         </button>
      </div>
    </div>
  );
};