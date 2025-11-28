export interface DailyMetric {
  date: string;
  steps: number;
  restingHeartRate: number; // RHR
  hrv: number; // Heart Rate Variability (ms)
  sleepScore: number; // 0-100
  stressLevel: number; // 1-10 self reported or derived
  caloriesBurned: number;
  moodScore: number; // 1-10 (1 = Critical/Depressed, 10 = Optimal/Manic)
  emotionalTags: string[]; // e.g. ["Anxious", "Focused", "Numb"]
  notes?: string;
}

export interface AnalysisResponse {
  summary: string;
  anomalyDetected: boolean;
  actionableSteps: string[];
  systemStatus: 'OPTIMAL' | 'WARNING' | 'CRITICAL' | 'REBOOT_REQUIRED';
  // New Predictive Fields
  burnoutRisk: number; // 0-100 probability
  predictiveAnalysis: string; // "If trends continue..."
  preventativePatches: string[]; // Proactive measures
}

export enum TabView {
  DASHBOARD = 'DASHBOARD',
  LOGS = 'LOGS',
  SETTINGS = 'SETTINGS'
}

export type ReportTimeframe = 'WEEKLY' | 'MONTHLY';

export interface TrendItem {
  metric: string;
  direction: 'improving' | 'declining' | 'stable';
  changePercentage: string; // e.g. "+15%"
  description: string;
}

export interface ReportResponse {
  periodLabel: string; // e.g., "Week of Nov 10 - Nov 17"
  overallGrade: 'A' | 'B' | 'C' | 'D' | 'F';
  trends: TrendItem[];
  comparisonSummary: string; // Comparison vs previous period
  optimizationTips: string[];
}