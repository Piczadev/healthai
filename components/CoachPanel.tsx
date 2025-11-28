import React, { useState, useEffect } from 'react';
import { DailyMetric, AnalysisResponse, RecoveryZoneResult } from '../types';
import { analyzeBioSystem, generateVoiceBriefing, playPCMAudio, findRecoveryZones } from '../services/geminiService';
import { Terminal, Cpu, Zap, Shield, ArrowRight, Volume2, RefreshCw, CheckCircle, MapPin, ExternalLink, SlidersHorizontal, Save } from 'lucide-react';

interface CoachPanelProps {
  data: DailyMetric[];
  onOpenReport: () => void;
  onLogUpdate?: (mood: number, tags: string[]) => void;
}

const AVAILABLE_TAGS = ['Flow', 'Anxious', 'High Friction', 'Optimized', 'Drained', 'Recovering', 'Manic', 'Numb'];

export const CoachPanel: React.FC<CoachPanelProps> = ({ data, onOpenReport, onLogUpdate }) => {
  const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [audioLoading, setAudioLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  // Geolocation & Map State
  const [geoLoading, setGeoLoading] = useState(false);
  const [recoveryZones, setRecoveryZones] = useState<RecoveryZoneResult | null>(null);

  // Manual Input State
  const [inputMood, setInputMood] = useState(5);
  const [inputTags, setInputTags] = useState<string[]>([]);

  useEffect(() => {
    setMounted(true);
    // Initialize input state with latest data if available
    if (data.length > 0) {
        const last = data[data.length - 1];
        setInputMood(last.moodScore || 5);
        setInputTags(last.emotionalTags || []);
    }
    runDiagnostics();
  }, []);

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

  const handleVoiceBriefing = async () => {
    if (!analysis) return;
    
    if (isPlaying) {
      return; 
    }

    setAudioLoading(true);
    const textToSpeak = `
      System Status: ${analysis.systemStatus}.
      Burnout Risk is at ${analysis.burnoutRisk} percent.
      Kernel Analysis: ${analysis.summary}.
      Predictive Heuristics: ${analysis.predictiveAnalysis}.
      Recommended Patches: ${analysis.preventativePatches.join('. ')}.
    `;
    
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

  const handleScanEnvironment = async () => {
    if (navigator.geolocation) {
        setGeoLoading(true);
        navigator.geolocation.getCurrentPosition(async (position) => {
            const { latitude, longitude } = position.coords;
            try {
                // Determine context from current biometric state with granular logic
                const currentData = data[data.length - 1];
                let queryContext = "quiet places to relax"; // fallback

                // 1. Critical System Failure (Nervous System Overload)
                if (currentData.hrv < 35 || currentData.stressLevel >= 8 || currentData.moodScore <= 3) {
                    queryContext = "quiet nature reserves, meditation gardens, or sensory deprivation tanks for deep nervous system recovery";
                } 
                // 2. Physical Burnout (Muscular/Structural Load)
                else if (currentData.steps > 20000 || currentData.caloriesBurned > 3500) {
                    queryContext = "spas with saunas, cryotherapy centers, or restorative yoga studios for physical recovery";
                }
                // 3. Stagnation / Depressive State (Need Activation)
                else if (currentData.steps < 4000 && currentData.moodScore < 6) {
                    queryContext = "scenic walking trails, botanical gardens, or sunny public parks for light activation";
                }
                // 4. Optimal Maintenance (Refueling)
                else if (currentData.hrv > 50 && currentData.sleepScore > 75) {
                    queryContext = "organic health food cafes, matcha bars, or high-quality wellness centers";
                }

                const result = await findRecoveryZones(latitude, longitude, queryContext);
                setRecoveryZones(result);
            } catch (error) {
                console.error("Geo scan failed", error);
            } finally {
                setGeoLoading(false);
            }
        }, (error) => {
            console.error("Geolocation error", error);
            setGeoLoading(false);
        });
    }
  };

  const toggleTag = (tag: string) => {
    if (inputTags.includes(tag)) {
        setInputTags(inputTags.filter(t => t !== tag));
    } else {
        if (inputTags.length < 3) {
            setInputTags([...inputTags, tag]);
        }
    }
  };

  const handleSyncLog = () => {
      if (onLogUpdate) {
          onLogUpdate(inputMood, inputTags);
          // Optional: Visual feedback or toast could go here
      }
  };

  const getStatusStyles = (status: string) => {
    switch(status) {
      case 'OPTIMAL': return 'text-accent-emerald bg-accent-emerald/5 border-accent-emerald/20 shadow-[0_0_30px_rgba(105,240,174,0.1)]';
      case 'WARNING': return 'text-accent-amber bg-accent-amber/5 border-accent-amber/20 shadow-[0_0_30px_rgba(255,215,64,0.1)]';
      case 'CRITICAL': 
      case 'REBOOT_REQUIRED': return 'text-accent-pink bg-accent-pink/5 border-accent-pink/20 shadow-[0_0_30px_rgba(255,64,129,0.2)] animate-pulse';
      default: return 'text-glass-muted bg-white/5 border-white/5';
    }
  };

  return (
    <div className="flex flex-col h-full bg-glass-surface/80 backdrop-blur-2xl border-l border-white/5 shadow-2xl relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-accent-cyan/5 blur-[80px] rounded-full pointer-events-none animate-pulse duration-[4000ms]"></div>

      {/* Header */}
      <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/5 relative z-10 backdrop-blur-xl">
        <h2 className="text-accent-cyan font-semibold flex items-center gap-2.5 tracking-wider text-xs uppercase drop-shadow-md">
          <Terminal size={14} className="animate-pulse" />
          Diagnostic Core
        </h2>
        <div className="flex gap-2">
          {analysis && (
            <button
              onClick={handleVoiceBriefing}
              disabled={audioLoading || isPlaying}
              className={`p-2 rounded-full transition-all border border-transparent hover:border-white/10 hover:bg-white/5 ${audioLoading ? 'animate-pulse text-accent-cyan' : 'text-glass-muted'} ${isPlaying ? 'text-accent-cyan bg-accent-cyan/10 border-accent-cyan/20 shadow-[0_0_15px_rgba(0,229,255,0.2)]' : ''}`}
            >
               {isPlaying ? <Volume2 size={16} className="animate-pulse" /> : <Volume2 size={16} />}
            </button>
          )}
          <button 
            onClick={runDiagnostics} 
            disabled={loading}
            className="p-2 hover:bg-white/5 rounded-full transition-colors disabled:opacity-50 text-glass-muted hover:text-white"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-hide relative z-10">
        
        {/* Telemetric Input Section (Manual Override) */}
        {!loading && (
            <div className="bg-white/5 rounded-3xl p-5 border border-white/10 shadow-glass animate-in fade-in slide-in-from-top-4 duration-700">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-[10px] font-bold text-accent-violet uppercase tracking-[0.2em] flex items-center gap-2 opacity-90">
                        <SlidersHorizontal size={12} /> Telemetric Input
                    </h3>
                    <span className="text-[9px] text-white/30 uppercase tracking-wider">Manual Override</span>
                </div>
                
                <div className="space-y-5">
                    {/* Mood Slider */}
                    <div>
                        <div className="flex justify-between text-xs text-white/60 mb-2 font-mono">
                            <span>Mood Index</span>
                            <span className="text-accent-violet font-bold">{inputMood}/10</span>
                        </div>
                        <input 
                            type="range" 
                            min="1" 
                            max="10" 
                            value={inputMood} 
                            onChange={(e) => setInputMood(parseInt(e.target.value))}
                            className="w-full h-1.5 bg-black/40 rounded-lg appearance-none cursor-pointer accent-accent-violet"
                        />
                        <div className="flex justify-between text-[8px] text-white/20 mt-1 uppercase tracking-wider">
                            <span>Critical</span>
                            <span>Optimal</span>
                        </div>
                    </div>

                    {/* Tag Selector */}
                    <div>
                        <p className="text-[9px] text-white/40 mb-2 uppercase tracking-wider">Emotional Tags (Max 3)</p>
                        <div className="flex flex-wrap gap-2">
                            {AVAILABLE_TAGS.map(tag => {
                                const isSelected = inputTags.includes(tag);
                                return (
                                    <button
                                        key={tag}
                                        onClick={() => toggleTag(tag)}
                                        className={`text-[9px] px-2.5 py-1.5 rounded-lg border transition-all duration-300 ${isSelected 
                                            ? 'bg-accent-violet/20 border-accent-violet/40 text-white shadow-[0_0_10px_rgba(124,77,255,0.2)]' 
                                            : 'bg-white/5 border-white/5 text-white/40 hover:bg-white/10 hover:text-white/70'}`}
                                    >
                                        {tag}
                                    </button>
                                )
                            })}
                        </div>
                    </div>

                    <button 
                        onClick={handleSyncLog}
                        className="w-full py-2.5 bg-white/5 hover:bg-accent-violet/10 border border-white/10 hover:border-accent-violet/30 rounded-xl text-xs font-bold text-white/70 hover:text-accent-violet transition-all flex items-center justify-center gap-2 uppercase tracking-widest shadow-lg"
                    >
                        <Save size={12} /> Sync Log
                    </button>
                </div>
            </div>
        )}

        {loading ? (
          <div className="space-y-4 animate-pulse opacity-50">
            <div className="h-20 bg-white/5 rounded-2xl border border-white/5"></div>
            <div className="h-40 bg-white/5 rounded-2xl border border-white/5"></div>
            <div className="h-4 bg-white/5 rounded w-2/3"></div>
          </div>
        ) : analysis ? (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500 space-y-8">
            {/* Status Banner */}
            <div className={`p-6 rounded-3xl flex flex-col items-center justify-center text-center gap-3 border backdrop-blur-md transition-all duration-700 ${getStatusStyles(analysis.systemStatus)}`}>
              <div className="text-[9px] uppercase font-bold tracking-[0.3em] opacity-60">System Integrity</div>
              <div className="text-xl font-bold tracking-[0.2em] drop-shadow-sm">{analysis.systemStatus}</div>
            </div>

            {/* Burnout Meter */}
            <div className="bg-gradient-to-b from-white/5 to-transparent p-6 rounded-3xl border border-white/10 shadow-lg relative overflow-hidden group">
              <div className="flex justify-between items-end mb-4 relative z-10">
                <span className="text-xs font-bold text-glass-text flex items-center gap-2 uppercase tracking-wider">
                  <Zap size={14} className="text-accent-amber drop-shadow-md" /> Load Index
                </span>
                <span className="text-sm font-mono text-glass-text font-bold">{analysis.burnoutRisk}%</span>
              </div>
              <div className="h-2 w-full bg-black/40 rounded-full overflow-hidden mb-5 relative z-10 border border-white/5">
                <div 
                  className={`h-full shadow-[0_0_15px_currentColor] transition-all duration-[1500ms] ease-out rounded-full ${analysis.burnoutRisk > 60 ? 'bg-accent-pink text-accent-pink' : 'bg-accent-cyan text-accent-cyan'}`} 
                  style={{ width: mounted ? `${analysis.burnoutRisk}%` : '0%' }}
                ></div>
              </div>
              <p className="text-xs text-glass-muted leading-relaxed font-light relative z-10 border-l-2 border-white/10 pl-3 italic">
                "{analysis.predictiveAnalysis}"
              </p>
            </div>

            {/* Analysis Summary */}
            <div className="space-y-4">
              <h3 className="text-[10px] font-bold text-glass-muted uppercase tracking-[0.2em] flex items-center gap-2 opacity-80">
                <Cpu size={12} /> Kernel Log
              </h3>
              <p className="text-sm text-glass-text/90 font-light leading-7 bg-white/5 p-4 rounded-2xl border border-white/5">
                {analysis.summary}
              </p>
            </div>

            {/* Patches */}
            {analysis.preventativePatches && analysis.preventativePatches.length > 0 && (
              <div className="space-y-3">
                 <h3 className="text-[10px] font-bold text-accent-cyan uppercase tracking-[0.2em] flex items-center gap-2 opacity-90">
                  <Shield size={12} /> Security Patches
                </h3>
                <ul className="space-y-2.5">
                  {analysis.preventativePatches.map((patch, idx) => (
                    <li 
                      key={idx} 
                      className="text-xs bg-accent-cyan/5 text-glass-text px-4 py-3.5 rounded-2xl border border-accent-cyan/10 shadow-[0_0_10px_rgba(0,229,255,0.05)] hover:bg-accent-cyan/10 transition-colors animate-in fade-in slide-in-from-bottom-2 fill-mode-forwards"
                      style={{ animationDelay: `${idx * 150}ms` }}
                    >
                      {patch}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Map Integration */}
            <div className="space-y-3">
                <div className="flex justify-between items-center">
                    <h3 className="text-[10px] font-bold text-glass-muted uppercase tracking-[0.2em] flex items-center gap-2 opacity-80">
                        <MapPin size={12} /> Recovery Zones
                    </h3>
                    <button 
                        onClick={handleScanEnvironment}
                        disabled={geoLoading}
                        className="text-[9px] bg-white/5 hover:bg-white/10 px-2 py-1 rounded border border-white/5 transition-colors uppercase tracking-wider text-accent-emerald disabled:opacity-50"
                    >
                        {geoLoading ? 'Scanning...' : 'Scan Env'}
                    </button>
                </div>
                
                {recoveryZones && (
                    <div className="bg-glass-surface p-4 rounded-2xl border border-glass-border animate-in fade-in zoom-in-95">
                        <p className="text-xs font-light text-white/80 mb-3 leading-relaxed">{recoveryZones.advice}</p>
                        <div className="flex flex-col gap-2">
                            {recoveryZones.locations.map((loc, i) => (
                                <a 
                                    key={i}
                                    href={loc.uri} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-between p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors border border-white/5 group"
                                >
                                    <span className="text-[10px] font-bold text-accent-cyan group-hover:text-white transition-colors truncate max-w-[180px]">{loc.title}</span>
                                    <ExternalLink size={10} className="text-white/30 group-hover:text-white" />
                                </a>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Optimizations */}
            <div className="space-y-3">
               <h3 className="text-[10px] font-bold text-glass-muted uppercase tracking-[0.2em] flex items-center gap-2 opacity-80">
                <CheckCircle size={12} /> Optimization
              </h3>
              <ul className="space-y-2">
                {analysis.actionableSteps.map((step, idx) => (
                  <li 
                    key={idx} 
                    className="px-3 py-2 text-xs flex gap-3 items-start text-glass-text/80 font-light animate-in fade-in slide-in-from-bottom-1 fill-mode-forwards"
                    style={{ animationDelay: `${(idx + 2) * 150}ms` }}
                  >
                    <span className="font-mono text-[9px] text-accent-emerald bg-accent-emerald/10 px-1.5 py-0.5 rounded border border-accent-emerald/20 mt-0.5">0{idx + 1}</span>
                    <span className="leading-5">{step}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-glass-muted gap-4 opacity-30 animate-pulse">
             <Terminal size={40} />
             <p className="text-xs tracking-[0.3em]">AWAITING INPUT</p>
          </div>
        )}
      </div>

      <div className="p-6 border-t border-white/5 bg-white/5 relative z-10 backdrop-blur-xl">
         <button 
           onClick={onOpenReport}
           className="group w-full py-3.5 bg-gradient-to-r from-white/5 to-transparent hover:from-accent-cyan/20 hover:to-accent-cyan/5 hover:border-accent-cyan/30 text-glass-text hover:text-accent-cyan font-bold text-[10px] tracking-[0.2em] uppercase rounded-xl border border-white/10 flex items-center justify-center gap-3 transition-all duration-500 shadow-lg hover:shadow-[0_0_20px_rgba(0,229,255,0.1)]"
         >
           Full System Audit
           <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform duration-300" />
         </button>
      </div>
    </div>
  );
};