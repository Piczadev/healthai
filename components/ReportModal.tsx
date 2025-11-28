import React, { useState, useEffect } from 'react';
import { X, Calendar, Activity, TrendingUp, TrendingDown, Minus, Download, FileText, CheckCircle2, Volume2, StopCircle } from 'lucide-react';
import { DailyMetric, ReportResponse, ReportTimeframe } from '../types';
import { generateProgressReport, generateVoiceBriefing, playPCMAudio } from '../services/geminiService';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: DailyMetric[];
}

export const ReportModal: React.FC<ReportModalProps> = ({ isOpen, onClose, data }) => {
  const [timeframe, setTimeframe] = useState<ReportTimeframe>('WEEKLY');
  const [report, setReport] = useState<ReportResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [audioLoading, setAudioLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadReport(timeframe);
    } else {
      setIsPlaying(false); // Reset audio state when closed
    }
  }, [isOpen, timeframe]);

  const loadReport = async (tf: ReportTimeframe) => {
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

  const handleReadAudit = async () => {
    if (!report) return;

    if (isPlaying) {
      setIsPlaying(false);
      return;
    }

    setAudioLoading(true);
    const textToSpeak = `
      Performance Audit for ${report.periodLabel}.
      Overall Grade: ${report.overallGrade}.
      Overview: ${report.comparisonSummary}.
      Actionable Items: ${report.optimizationTips.join('. ')}.
    `;

    try {
      const base64Audio = await generateVoiceBriefing(textToSpeak);
      if (base64Audio) {
        setIsPlaying(true);
        await playPCMAudio(base64Audio);
        setTimeout(() => setIsPlaying(false), 20000);
      }
    } catch (e) {
      console.error(e);
      setIsPlaying(false);
    } finally {
      setAudioLoading(false);
    }
  };

  if (!isOpen) return null;

  const getGradeColor = (grade: string) => {
    if (['A', 'B'].includes(grade)) return 'bg-mat-secondary/20 text-mat-secondary border-mat-secondary';
    if (['C'].includes(grade)) return 'bg-mat-warning/20 text-mat-warning border-mat-warning';
    return 'bg-mat-error/20 text-mat-error border-mat-error';
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
      
      <div className="relative bg-mat-surface w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-2xl shadow-elevation-3 flex flex-col border border-white/10 animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-6 border-b border-white/5 flex justify-between items-center bg-mat-surface">
          <div className="flex items-center gap-4">
             <div>
               <h2 className="text-xl font-medium text-mat-on-surface">Performance Audit</h2>
               <p className="text-xs text-mat-on-surface-variant mt-1">Generated via Gemini Core</p>
             </div>
             {report && (
               <button
                 onClick={handleReadAudit}
                 disabled={audioLoading}
                 className={`p-2 rounded-full transition-colors text-mat-on-surface-variant hover:bg-white/5 ${audioLoading ? 'animate-pulse' : ''} ${isPlaying ? 'text-mat-primary bg-mat-primary/10' : ''}`}
                 title="Read Audit Report"
               >
                 {isPlaying ? <StopCircle size={20} /> : <Volume2 size={20} />}
               </button>
             )}
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-mat-on-surface-variant transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="px-6 py-2 border-b border-white/5 bg-mat-bg flex gap-2">
          {['WEEKLY', 'MONTHLY'].map((t) => (
             <button 
              key={t}
              onClick={() => setTimeframe(t as ReportTimeframe)}
              className={`px-4 py-2 text-xs font-medium rounded-full transition-all ${timeframe === t ? 'bg-mat-primary text-black' : 'text-mat-on-surface-variant hover:bg-white/5'}`}
            >
              {t === 'WEEKLY' ? 'Weekly Sprint' : 'Monthly Review'}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 bg-mat-bg/50">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-64 space-y-4">
              <div className="w-10 h-10 border-4 border-mat-primary border-t-transparent rounded-full animate-spin"></div>
              <p className="text-sm text-mat-on-surface-variant">Analyzing biometric logs...</p>
            </div>
          ) : report ? (
            <div className="space-y-8">
              
              {/* Report Card */}
              <div className="bg-mat-surface rounded-xl p-6 shadow-elevation-1 flex flex-col md:flex-row gap-6 items-center md:items-start">
                <div className={`flex flex-col items-center justify-center w-24 h-24 rounded-full border-4 ${getGradeColor(report.overallGrade)}`}>
                  <span className="text-4xl font-bold">{report.overallGrade}</span>
                </div>
                <div className="flex-1 text-center md:text-left">
                  <div className="flex items-center justify-center md:justify-start gap-2 text-mat-primary text-xs font-bold uppercase mb-2">
                    <Calendar size={14} />
                    {report.periodLabel}
                  </div>
                  <h3 className="text-lg font-medium text-mat-on-surface mb-2">Period Overview</h3>
                  <p className="text-sm text-mat-on-surface-variant leading-relaxed">
                    {report.comparisonSummary}
                  </p>
                </div>
              </div>

              {/* Trends Grid */}
              <div>
                <h3 className="text-xs font-bold text-mat-on-surface-variant uppercase mb-4 tracking-wider">Telemetry Shifts</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {report.trends.map((trend, i) => (
                    <div key={i} className="bg-mat-surface p-4 rounded-xl border border-white/5 shadow-sm">
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-medium text-sm text-mat-on-surface">{trend.metric}</span>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${trend.direction === 'improving' ? 'bg-mat-secondary/10 text-mat-secondary' : 'bg-mat-error/10 text-mat-error'}`}>
                          {trend.changePercentage}
                        </span>
                      </div>
                      <p className="text-xs text-mat-on-surface-variant leading-snug">{trend.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Optimization Section */}
              <div className="bg-mat-surface rounded-xl p-6 border-l-4 border-mat-primary shadow-elevation-1">
                <h3 className="text-sm font-medium text-mat-on-surface mb-4 flex items-center gap-2">
                  <CheckCircle2 size={18} className="text-mat-primary" /> 
                  Actionable Items
                </h3>
                <ul className="space-y-3">
                  {report.optimizationTips.map((tip, i) => (
                    <li key={i} className="flex gap-3 text-sm text-mat-on-surface-variant">
                      <span className="text-mat-primary font-bold">•</span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>

            </div>
          ) : (
            <div className="text-center text-mat-on-surface-variant py-10">
              Unable to generate report. Please try again.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};