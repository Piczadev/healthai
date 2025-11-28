import React, { useState, useEffect } from 'react';
import { X, Calendar, CheckCircle2, Volume2 } from 'lucide-react';
import { DailyMetric, ReportResponse, ReportTimeframe, SystemProfile } from '../types';
import { generateProgressReport, generateVoiceBriefing, playPCMAudio, analyzeSystemProfile } from '../services/geminiService';
import { SystemIdentityCard } from './SystemIdentityCard';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: DailyMetric[];
}

export const ReportModal: React.FC<ReportModalProps> = ({ isOpen, onClose, data }) => {
  const [activeTab, setActiveTab] = useState<'AUDIT' | 'RESUME'>('AUDIT');
  const [timeframe, setTimeframe] = useState<ReportTimeframe>('WEEKLY');
  
  const [report, setReport] = useState<ReportResponse | null>(null);
  const [profile, setProfile] = useState<SystemProfile | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [audioLoading, setAudioLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (activeTab === 'AUDIT') {
        loadReport(timeframe);
      } else {
        loadProfile();
      }
    } else {
      setIsPlaying(false); 
    }
  }, [isOpen, timeframe, activeTab]);

  const loadReport = async (tf: ReportTimeframe) => {
    if (report && timeframe === tf) return;
    setLoading(true);
    try {
      const result = await generateProgressReport(data, tf);
      setReport(result);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const loadProfile = async () => {
    if (profile) return;
    setLoading(true);
    try {
      const result = await analyzeSystemProfile(data);
      setProfile(result);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleRead = async () => {
    if (isPlaying) return;

    let textToSpeak = '';

    if (activeTab === 'AUDIT' && report) {
      textToSpeak = `
        Performance Audit for ${report.periodLabel}.
        Overall Grade: ${report.overallGrade}.
        Overview: ${report.comparisonSummary}.
        Actionable Items: ${report.optimizationTips.join('. ')}.
      `;
    } else if (activeTab === 'RESUME' && profile) {
      textToSpeak = `
        System Profile Generated.
        Archetype: ${profile.archetype}.
        Bio Summary: ${profile.bio}.
        Attributes analysis complete.
      `;
    }

    if (!textToSpeak) return;

    setAudioLoading(true);
    try {
      const base64Audio = await generateVoiceBriefing(textToSpeak);
      if (base64Audio) {
        setIsPlaying(true);
        await playPCMAudio(base64Audio, () => setIsPlaying(false));
      }
    } catch (e) {
      console.error(e);
      setIsPlaying(false);
    } finally {
      setAudioLoading(false);
    }
  };

  if (!isOpen) return null;

  const getGradeStyles = (grade: string) => {
    if (['A', 'B'].includes(grade)) return 'text-accent-emerald border-accent-emerald bg-accent-emerald/5 shadow-[0_0_40px_rgba(105,240,174,0.15)]';
    if (['C'].includes(grade)) return 'text-accent-amber border-accent-amber bg-accent-amber/5 shadow-[0_0_40px_rgba(255,215,64,0.15)]';
    return 'text-accent-pink border-accent-pink bg-accent-pink/5 shadow-[0_0_40px_rgba(255,64,129,0.15)]';
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Dark overlay with heavy blur */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity duration-500" onClick={onClose}></div>
      
      {/* Modal Container with Liquid Glass feel */}
      <div className="relative bg-glass-surface/90 backdrop-blur-3xl w-full max-w-4xl max-h-[85vh] overflow-hidden rounded-[2rem] shadow-2xl flex flex-col border border-white/5 border-t-white/10 animate-in zoom-in-95 duration-500">
        
        {/* Decorative top glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>

        {/* Header */}
        <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/5 relative z-10">
          <div className="flex items-center gap-5">
             <div>
               <h2 className="text-2xl font-extralight tracking-tight text-white drop-shadow-md">
                 {activeTab === 'AUDIT' ? 'Performance Audit' : 'System Identity'}
               </h2>
               <p className="text-[9px] text-accent-cyan uppercase tracking-[0.3em] mt-1 font-bold">AI Generated Diagnostic</p>
             </div>
             {(report || profile) && (
               <button
                 onClick={handleRead}
                 disabled={audioLoading || isPlaying}
                 className={`p-2.5 rounded-full transition-all border border-transparent hover:border-white/10 hover:bg-white/5 ${audioLoading ? 'animate-pulse text-accent-cyan' : ''} ${isPlaying ? 'text-accent-cyan bg-accent-cyan/10 border-accent-cyan/20 shadow-[0_0_15px_rgba(0,229,255,0.2)]' : 'text-white/30'}`}
               >
                 {isPlaying ? <Volume2 size={18} className="animate-pulse" /> : <Volume2 size={18} />}
               </button>
             )}
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-white/40 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-white/5 bg-black/20">
          <button
            onClick={() => setActiveTab('AUDIT')}
            className={`flex-1 py-5 text-xs font-bold tracking-[0.2em] uppercase transition-all duration-300 relative overflow-hidden group ${activeTab === 'AUDIT' ? 'text-accent-cyan' : 'text-white/30 hover:text-white/60'}`}
          >
            <span className="relative z-10">System Audit</span>
            {activeTab === 'AUDIT' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-accent-cyan shadow-[0_0_10px_#00E5FF]"></div>}
            <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </button>
          <button
            onClick={() => setActiveTab('RESUME')}
            className={`flex-1 py-5 text-xs font-bold tracking-[0.2em] uppercase transition-all duration-300 relative overflow-hidden group ${activeTab === 'RESUME' ? 'text-accent-cyan' : 'text-white/30 hover:text-white/60'}`}
          >
            <span className="relative z-10">Bio-Resume</span>
            {activeTab === 'RESUME' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-accent-cyan shadow-[0_0_10px_#00E5FF]"></div>}
            <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </button>
        </div>

        {/* Sub-Tabs */}
        {activeTab === 'AUDIT' && (
          <div className="px-6 py-4 border-b border-white/5 bg-black/10 flex gap-6 justify-center backdrop-blur-sm">
            {['WEEKLY', 'MONTHLY'].map((t) => (
               <button 
                key={t}
                onClick={() => setTimeframe(t as ReportTimeframe)}
                className={`text-[10px] font-bold tracking-[0.15em] uppercase transition-all relative px-2 py-1 ${timeframe === t ? 'text-white' : 'text-white/30 hover:text-white/60'}`}
              >
                {t}
                {timeframe === t && <span className="absolute -bottom-1 left-0 w-full h-px bg-white/50"></span>}
              </button>
            ))}
          </div>
        )}

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-8 relative">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-64 space-y-6 opacity-60">
              <div className="relative">
                <div className="w-16 h-16 border-2 border-accent-cyan/30 border-t-accent-cyan rounded-full animate-spin"></div>
                <div className="absolute inset-0 w-16 h-16 border-2 border-accent-cyan/10 rounded-full animate-ping delay-300"></div>
              </div>
              <p className="text-xs tracking-[0.3em] text-white/50 font-medium">ANALYZING BIOMETRICS...</p>
            </div>
          ) : activeTab === 'AUDIT' && report ? (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
              
              {/* Report Hero */}
              <div className="bg-gradient-to-br from-white/5 to-transparent rounded-[2rem] p-8 border border-white/10 flex flex-col md:flex-row gap-8 items-center md:items-start relative overflow-hidden group hover:border-white/20 transition-colors duration-500">
                {/* Background Ambient Light */}
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-accent-cyan/10 rounded-full blur-[80px]"></div>
                
                <div className={`flex flex-col items-center justify-center w-32 h-32 shrink-0 rounded-full border-2 backdrop-blur-xl relative z-10 ${getGradeStyles(report.overallGrade)}`}>
                  <span className="text-6xl font-thin tracking-tighter drop-shadow-lg">{report.overallGrade}</span>
                </div>
                <div className="flex-1 text-center md:text-left relative z-10">
                  <div className="flex items-center justify-center md:justify-start gap-2 text-accent-cyan text-[9px] font-bold uppercase tracking-[0.2em] mb-4">
                    <Calendar size={12} />
                    {report.periodLabel}
                  </div>
                  <h3 className="text-xl font-light text-white mb-4 tracking-wide">Period Overview</h3>
                  <p className="text-sm text-glass-muted font-light leading-7">
                    {report.comparisonSummary}
                  </p>
                </div>
              </div>

              {/* Trends */}
              <div>
                <h3 className="text-[10px] font-bold text-white/30 uppercase mb-5 tracking-[0.2em] pl-2">Telemetry Shifts</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {report.trends.map((trend, i) => (
                    <div 
                      key={i} 
                      className="bg-white/5 p-6 rounded-2xl border border-white/5 hover:border-white/10 transition-all duration-300 hover:-translate-y-1 hover:bg-white/[0.07]"
                      style={{ animationDelay: `${i * 100}ms` }}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <span className="font-medium text-xs text-white/90 tracking-wide">{trend.metric}</span>
                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border backdrop-blur-sm ${trend.direction === 'improving' ? 'bg-accent-emerald/10 text-accent-emerald border-accent-emerald/20' : 'bg-accent-pink/10 text-accent-pink border-accent-pink/20'}`}>
                          {trend.changePercentage}
                        </span>
                      </div>
                      <p className="text-[11px] text-white/50 leading-relaxed font-light">{trend.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actionable Items */}
              <div className="bg-gradient-to-br from-accent-cyan/5 to-transparent rounded-[2rem] p-8 border border-accent-cyan/10 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-b from-accent-cyan/5 to-transparent opacity-30 pointer-events-none"></div>
                <h3 className="text-xs font-bold text-accent-cyan mb-6 flex items-center gap-3 uppercase tracking-[0.2em] relative z-10">
                  <CheckCircle2 size={16} /> 
                  Optimisation Protocols
                </h3>
                <ul className="space-y-4 relative z-10">
                  {report.optimizationTips.map((tip, i) => (
                    <li key={i} className="flex gap-4 text-sm text-white/80 font-light items-start">
                      <span className="text-accent-cyan/60 text-lg leading-none mt-[-2px]">•</span>
                      <span className="leading-relaxed">{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>

            </div>
          ) : activeTab === 'RESUME' && profile ? (
            <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
              <SystemIdentityCard profile={profile} />
            </div>
          ) : (
            <div className="text-center text-white/30 py-20 text-xs tracking-[0.3em]">
              NO DATA AVAILABLE
            </div>
          )}
        </div>
      </div>
    </div>
  );
};