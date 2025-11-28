import React, { useState, useMemo } from 'react';
import { Activity, Heart, Zap, Battery, Menu, X, BrainCircuit, ActivitySquare, AlertCircle } from 'lucide-react';
import { HEALTH_DATA, MOCK_USER_NAME } from './constants';
import { MetricCard } from './components/MetricCard';
import { ActivityVsBiometricsChart, StressZoneChart } from './components/Charts';
import { CoachPanel } from './components/CoachPanel';
import { ReportModal } from './components/ReportModal';

const App = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);

  // Calculate current stats (most recent day)
  const current = HEALTH_DATA[HEALTH_DATA.length - 1];

  // Calculate 30-day averages for context
  const averages = useMemo(() => {
    const total = HEALTH_DATA.length;
    return {
      steps: Math.floor(HEALTH_DATA.reduce((acc, curr) => acc + curr.steps, 0) / total),
      hrv: Math.floor(HEALTH_DATA.reduce((acc, curr) => acc + curr.hrv, 0) / total),
      rhr: Math.floor(HEALTH_DATA.reduce((acc, curr) => acc + curr.restingHeartRate, 0) / total),
      sleep: Math.floor(HEALTH_DATA.reduce((acc, curr) => acc + curr.sleepScore, 0) / total),
    };
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-mat-bg font-sans text-mat-on-surface">
      
      {/* Report Modal */}
      <ReportModal 
        isOpen={reportModalOpen} 
        onClose={() => setReportModalOpen(false)} 
        data={HEALTH_DATA} 
      />

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full relative overflow-hidden transition-all duration-300">
        
        {/* Material AppBar */}
        <header className="h-16 bg-mat-surface shadow-elevation-2 flex items-center justify-between px-6 z-30 sticky top-0">
          <div className="flex items-center gap-4">
             <button 
              className="lg:hidden text-mat-on-surface hover:text-white"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
             <div className="flex items-center gap-2">
                <div className="bg-mat-primary/20 p-1.5 rounded-lg">
                  <Activity size={20} className="text-mat-primary" />
                </div>
                <h1 className="text-lg font-medium tracking-wide text-mat-on-surface">BioSystem<span className="font-light opacity-70">Debugger</span></h1>
             </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex flex-col items-end mr-2">
               <span className="text-xs font-medium text-mat-on-surface">{MOCK_USER_NAME}</span>
               <div className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${current.hrv < 30 ? 'bg-mat-error' : 'bg-mat-secondary'}`}></span>
                  <span className="text-[10px] uppercase text-mat-on-surface-variant">
                    {current.hrv < 30 ? 'High Latency' : 'System Stable'}
                  </span>
               </div>
            </div>
            <div className="w-8 h-8 rounded-full bg-mat-surface-hover flex items-center justify-center text-xs font-bold text-mat-primary border border-white/5">
              PZ
            </div>
          </div>
        </header>

        <div className="flex flex-1 overflow-hidden relative">
          
          {/* Dashboard Scrollable Area */}
          <main className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-6 scroll-smooth pb-24 lg:pb-8">
            
            {/* Top Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <MetricCard 
                title="Daily Load" 
                value={current.steps.toLocaleString()} 
                unit="steps"
                average={averages.steps}
                optimalRange={{min: 8000, max: 12000}}
                status={current.steps > 25000 ? 'danger' : current.steps > 15000 ? 'warning' : 'neutral'}
                icon={<Activity size={20} />} 
              />
               <MetricCard 
                title="HRV Status" 
                value={current.hrv} 
                unit="ms"
                average={averages.hrv}
                optimalRange={{min: 40, max: 100}}
                status={current.hrv < 30 ? 'danger' : current.hrv < 45 ? 'warning' : 'success'}
                icon={<Heart size={20} />} 
              />
               <MetricCard 
                title="Resting Heart Rate" 
                value={current.restingHeartRate} 
                unit="bpm"
                average={averages.rhr}
                optimalRange={{min: 50, max: 70}}
                status={current.restingHeartRate > 75 ? 'warning' : 'neutral'}
                icon={<Zap size={20} />} 
              />
               <MetricCard 
                title="Sleep Recharge" 
                value={current.sleepScore} 
                unit="%"
                average={averages.sleep}
                optimalRange={{min: 80, max: 100}}
                status={current.sleepScore < 60 ? 'danger' : 'neutral'}
                icon={<Battery size={20} />} 
              />
            </div>

            {/* Emotional Telemetry Section */}
            <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-1 bg-mat-surface rounded-xl p-5 shadow-elevation-1 border-t-4 border-mat-primary">
                <div className="flex justify-between items-start mb-4">
                   <div>
                     <h3 className="text-sm font-medium text-mat-on-surface flex items-center gap-2">
                       <BrainCircuit size={16} className="text-mat-primary" /> Emotional State
                     </h3>
                     <p className="text-xs text-mat-on-surface-variant mt-1">Daily psychological buffer</p>
                   </div>
                   <div className={`flex flex-col items-center justify-center w-10 h-10 rounded-full font-bold text-sm ${current.moodScore < 5 ? 'bg-mat-error/20 text-mat-error' : 'bg-mat-secondary/20 text-mat-secondary'}`}>
                      {current.moodScore}
                   </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {current.emotionalTags.map((tag, i) => (
                    <span key={i} className="text-xs px-2.5 py-1 bg-mat-bg rounded-full text-mat-on-surface-variant border border-white/5">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="lg:col-span-2 bg-mat-surface rounded-xl p-5 shadow-elevation-1 border-t-4 border-mat-warning flex flex-col justify-center">
                <div className="flex items-start gap-3">
                  <div className="bg-mat-warning/10 p-2 rounded-full shrink-0">
                    <ActivitySquare size={18} className="text-mat-warning" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-mat-on-surface uppercase tracking-wide mb-1">Feedback Loop Analysis</h3>
                    <p className="text-sm text-mat-on-surface-variant leading-relaxed">
                       "Biometric mismatch detected. You are running high-intensity processes (Steps > {current.steps}) on low battery (HRV {current.hrv}ms). 
                       <span className="text-mat-warning font-medium"> Warning:</span> This specific pattern correlates with your historical 'Flight Response' data."
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Main Charts */}
            <div className="grid grid-cols-1 gap-6">
              <ActivityVsBiometricsChart data={HEALTH_DATA} />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <StressZoneChart data={HEALTH_DATA} />
                
                {/* Raw Logs Table - Material */}
                <div className="bg-mat-surface rounded-xl shadow-elevation-1 overflow-hidden">
                  <div className="px-5 py-4 border-b border-white/5 flex justify-between items-center">
                    <h3 className="text-sm font-medium text-mat-on-surface">Recent Data Entries</h3>
                    <span className="text-[10px] text-mat-on-surface-variant bg-mat-bg px-2 py-1 rounded">LAST 5 DAYS</span>
                  </div>
                  <table className="w-full text-left text-xs">
                    <thead className="bg-mat-bg text-mat-on-surface-variant font-medium">
                      <tr>
                        <th className="px-5 py-3">Date</th>
                        <th className="px-5 py-3">Steps</th>
                        <th className="px-5 py-3">HRV</th>
                        <th className="px-5 py-3">Mood</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-mat-on-surface">
                      {[...HEALTH_DATA].reverse().slice(0, 5).map((row, i) => (
                        <tr key={i} className="hover:bg-mat-surface-hover transition-colors">
                          <td className="px-5 py-3 text-mat-on-surface-variant">{row.date.slice(5)}</td>
                          <td className="px-5 py-3 font-medium">{row.steps.toLocaleString()}</td>
                          <td className="px-5 py-3">
                             <div className={`flex items-center gap-1.5 ${row.hrv < 30 ? 'text-mat-error font-bold' : ''}`}>
                               {row.hrv < 30 && <AlertCircle size={10} />}
                               {row.hrv}ms
                             </div>
                          </td>
                          <td className="px-5 py-3 opacity-80">
                             {row.emotionalTags[0]}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

          </main>

          {/* Right Sidebar: Coach Panel */}
          <aside className={`
            fixed inset-y-0 right-0 w-80 lg:w-96 bg-mat-surface shadow-elevation-3 transform transition-transform duration-300 z-50 lg:relative lg:transform-none lg:block lg:shadow-none lg:border-l border-white/5
            ${sidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
          `}>
            <CoachPanel 
              data={HEALTH_DATA} 
              onOpenReport={() => setReportModalOpen(true)}
            />
          </aside>

        </div>
      </div>
    </div>
  );
};

export default App;