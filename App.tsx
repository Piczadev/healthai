import React, { useState, useMemo } from 'react';
import { Activity, Heart, Zap, Battery, Menu, X, BrainCircuit, SquareActivity, AlertCircle, Download } from 'lucide-react';
import { HEALTH_DATA, MOCK_USER_NAME } from './constants';
import { MetricCard } from './components/MetricCard';
import { ActivityVsBiometricsChart, StressZoneChart } from './components/Charts';
import { CoachPanel } from './components/CoachPanel';
import { ReportModal } from './components/ReportModal';

const App = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);

  // Lift data to state to allow updates from CoachPanel
  const [healthData, setHealthData] = useState(HEALTH_DATA);

  const current = healthData[healthData.length - 1];

  const averages = useMemo(() => {
    const total = healthData.length;
    return {
      steps: Math.floor(healthData.reduce((acc, curr) => acc + curr.steps, 0) / total),
      hrv: Math.floor(healthData.reduce((acc, curr) => acc + curr.hrv, 0) / total),
      rhr: Math.floor(healthData.reduce((acc, curr) => acc + curr.restingHeartRate, 0) / total),
      sleep: Math.floor(healthData.reduce((acc, curr) => acc + curr.sleepScore, 0) / total),
    };
  }, [healthData]);

  const handleLogUpdate = (mood: number, tags: string[]) => {
    const newData = [...healthData];
    const lastIndex = newData.length - 1;

    // Update the latest entry
    newData[lastIndex] = {
      ...newData[lastIndex],
      moodScore: mood,
      emotionalTags: tags
    };

    setHealthData(newData);
  };

  const downloadCSV = () => {
    const headers = ['Date', 'Steps', 'Resting Heart Rate', 'HRV', 'Sleep Score', 'Stress Level', 'Calories Burned', 'Mood Score', 'Emotional Tags'];
    const rows = healthData.map(d => [
      d.date,
      d.steps,
      d.restingHeartRate,
      d.hrv,
      d.sleepScore,
      d.stressLevel,
      d.caloriesBurned,
      d.moodScore,
      `"${d.emotionalTags.join(', ')}"`
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(r => r.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `bio_system_data_export.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex h-screen overflow-hidden font-sans text-glass-text">

      <ReportModal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        data={healthData}
      />

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full relative overflow-hidden transition-all duration-300">

        {/* Transparent Header */}
        <header className="h-20 flex items-center justify-between px-8 z-30 sticky top-0 backdrop-blur-sm">
          <div className="flex items-center gap-4">
            <button
              className="lg:hidden text-white hover:text-accent-cyan transition-colors"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <div className="flex items-center gap-3">
              <div className="bg-white/5 backdrop-blur-md border border-white/10 p-2 rounded-xl">
                <Activity size={20} className="text-accent-cyan" />
              </div>
              <h1 className="text-xl font-light tracking-wide text-white">BioSystem <span className="font-medium text-accent-cyan">Liquid</span></h1>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="hidden md:flex flex-col items-end">
              <span className="text-xs font-bold tracking-widest uppercase text-white/50">{MOCK_USER_NAME}</span>
              <div className="flex items-center gap-2 mt-0.5">
                <span className={`w-1.5 h-1.5 rounded-full shadow-[0_0_8px_currentColor] ${current.hrv < 30 ? 'bg-accent-pink text-accent-pink' : 'bg-accent-emerald text-accent-emerald'}`}></span>
                <span className="text-[10px] uppercase tracking-wider text-white/80">
                  {current.hrv < 30 ? 'High Latency' : 'Stable'}
                </span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-white/10 to-transparent border border-white/20 flex items-center justify-center text-xs font-bold text-accent-cyan backdrop-blur-md shadow-glass">
              PZ
            </div>
          </div>
        </header>

        <div className="flex flex-1 overflow-hidden relative">

          <main className="flex-1 overflow-y-auto p-4 lg:p-8 space-y-8 scroll-smooth pb-24 lg:pb-8">

            {/* Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <MetricCard
                title="Daily Load"
                value={current.steps.toLocaleString()}
                unit="steps"
                average={averages.steps}
                optimalRange={{ min: 8000, max: 12000 }}
                status={current.steps > 25000 ? 'danger' : current.steps > 15000 ? 'warning' : 'neutral'}
                icon={<Activity size={24} />}
              />
              <MetricCard
                title="HRV Status"
                value={current.hrv}
                unit="ms"
                average={averages.hrv}
                optimalRange={{ min: 40, max: 100 }}
                status={current.hrv < 30 ? 'danger' : current.hrv < 45 ? 'warning' : 'success'}
                icon={<Heart size={24} />}
              />
              <MetricCard
                title="RHR"
                value={current.restingHeartRate}
                unit="bpm"
                average={averages.rhr}
                optimalRange={{ min: 50, max: 70 }}
                status={current.restingHeartRate > 75 ? 'warning' : 'neutral'}
                icon={<Zap size={24} />}
              />
              <MetricCard
                title="Sleep"
                value={current.sleepScore}
                unit="%"
                average={averages.sleep}
                optimalRange={{ min: 80, max: 100 }}
                status={current.sleepScore < 60 ? 'danger' : 'neutral'}
                icon={<Battery size={24} />}
              />
            </div>

            {/* Emotional & Feedback */}
            <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1 bg-glass-surface backdrop-blur-xl border border-glass-border rounded-3xl p-6 shadow-glass relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <BrainCircuit size={80} />
                </div>
                <div className="flex justify-between items-start mb-6 relative z-10">
                  <div>
                    <h3 className="text-xs font-bold text-accent-cyan uppercase tracking-widest mb-1">Emotional State</h3>
                    <p className="text-[10px] text-white/40">Daily psychological buffer</p>
                  </div>
                  <div className={`flex flex-col items-center justify-center w-12 h-12 rounded-2xl font-light text-xl border backdrop-blur-md shadow-lg ${current.moodScore < 5 ? 'border-accent-pink/30 text-accent-pink bg-accent-pink/5' : 'border-accent-emerald/30 text-accent-emerald bg-accent-emerald/5'}`}>
                    {current.moodScore}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 relative z-10">
                  {current.emotionalTags.map((tag, i) => (
                    <span key={i} className="text-[10px] uppercase font-bold px-3 py-1.5 bg-white/5 rounded-lg text-white/70 border border-white/5 hover:bg-white/10 hover:border-white/20 transition-all cursor-default">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="lg:col-span-2 bg-gradient-to-r from-accent-amber/5 to-transparent backdrop-blur-xl border border-accent-amber/10 rounded-3xl p-6 shadow-glass flex flex-col justify-center relative">
                <div className="absolute top-0 left-0 w-1 h-full bg-accent-amber/50"></div>
                <div className="flex items-start gap-4">
                  <div className="bg-accent-amber/10 p-3 rounded-2xl shrink-0 border border-accent-amber/20 shadow-[0_0_15px_rgba(255,215,64,0.1)]">
                    <SquareActivity size={24} className="text-accent-amber" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-accent-amber uppercase tracking-widest mb-2">Feedback Loop Analysis</h3>
                    <p className="text-sm text-white/80 font-light leading-relaxed">
                      "Biometric mismatch detected. You are running high-intensity processes (Steps &gt; {current.steps}) on low battery (HRV {current.hrv}ms).
                      <span className="text-accent-amber font-normal border-b border-accent-amber/50 ml-1">Warning: Flight Response pattern detected.</span>"
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Charts */}
            <div className="grid grid-cols-1 gap-8">
              <ActivityVsBiometricsChart data={healthData} />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <StressZoneChart data={healthData} />

                {/* Minimalist Log Table */}
                <div className="bg-glass-surface backdrop-blur-xl border border-glass-border rounded-3xl shadow-glass overflow-hidden flex flex-col">
                  <div className="px-6 py-5 border-b border-glass-border flex justify-between items-center bg-white/5">
                    <div className="flex items-center gap-4">
                      <h3 className="text-sm font-medium text-white tracking-wide">Data Log</h3>
                      <button
                        onClick={downloadCSV}
                        className="flex items-center gap-1.5 text-[10px] font-bold text-accent-cyan hover:text-white transition-colors uppercase tracking-wider"
                        title="Export full history"
                      >
                        <Download size={12} />
                        Export CSV
                      </button>
                    </div>
                  </div>
                  <div className="flex-1 overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="text-white/40 font-bold uppercase tracking-wider text-[10px]">
                        <tr>
                          <th className="px-6 py-4 font-bold">Date</th>
                          <th className="px-6 py-4 font-bold">Steps</th>
                          <th className="px-6 py-4 font-bold">HRV</th>
                          <th className="px-6 py-4 font-bold">Mood</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 text-white/80">
                        {[...healthData].reverse().slice(0, 5).map((row, i) => (
                          <tr key={i} className="hover:bg-white/5 transition-colors group">
                            <td className="px-6 py-4 text-white/50 group-hover:text-white transition-colors">{row.date.slice(5)}</td>
                            <td className="px-6 py-4 font-light">{row.steps.toLocaleString()}</td>
                            <td className="px-6 py-4">
                              <div className={`flex items-center gap-2 ${row.hrv < 30 ? 'text-accent-pink' : ''}`}>
                                {row.hrv < 30 && <AlertCircle size={12} />}
                                {row.hrv}
                              </div>
                            </td>
                            <td className="px-6 py-4 opacity-60">
                              {row.emotionalTags[0]}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>

          </main>

          {/* Floating Sidebar */}
          <aside className={`
            fixed inset-y-0 right-0 w-80 lg:w-96 transform transition-transform duration-300 z-50 lg:relative lg:transform-none lg:block
            ${sidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
          `}>
            <CoachPanel
              data={healthData}
              onOpenReport={() => setReportModalOpen(true)}
              onLogUpdate={handleLogUpdate}
            />
          </aside>

        </div>
      </div>
    </div>
  );
};

export default App;