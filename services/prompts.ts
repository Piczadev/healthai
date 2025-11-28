import { DailyMetric, ReportTimeframe } from "../types";

export const getAnalysisPrompt = (avgSteps: number, minHRV: number, recentData: DailyMetric[]) => `
    You are a Senior Bio-Systems Engineer and this is a "System Log" of a human body.
    
    SYSTEM CONTEXT:
    - User is a high-performance individual (likely Dev/Researcher).
    - Current 30-day Avg Load (Steps): ${avgSteps} / day.
    - Critical Low HRV detected: ${minHRV}ms.
    
    RECENT LOGS (Last 7 days):
    ${JSON.stringify(recentData)}

    TASK:
    Analyze this data including the new "Emotional Telemetry" (Mood Score & Tags).
    Perform a HEURISTIC PREDICTION based on the trajectory.
    
    Identify:
    1. The core system anomaly.
    2. A technical summary of the crash.
    3. Calculate "Burnout Risk" (0-100%) based on the gap between Load (Steps) and Recovery (HRV/Sleep).
    4. Provide a "Predictive Analysis": What happens to the system in 7 days if no changes are made?
    5. Provide 2 specific "Preventative Patches" (Small, high-impact changes to avoid the predicted crash).

    Return the response in strictly valid JSON format matching this schema:
    {
      "summary": "string",
      "anomalyDetected": boolean,
      "actionableSteps": ["string", "string", "string"],
      "systemStatus": "OPTIMAL" | "WARNING" | "CRITICAL" | "REBOOT_REQUIRED",
      "burnoutRisk": number,
      "predictiveAnalysis": "string (short prediction of future state)",
      "preventativePatches": ["string", "string"]
    }
`;

export const getProgressReportPrompt = (timeframe: ReportTimeframe, days: number, currentPeriodData: DailyMetric[], previousPeriodData: DailyMetric[]) => `
    You are generating a specialized "System Audit Report" (Bio-OS) for the user.
    
    TIMEFRAME: ${timeframe} (Last ${days} days).
    
    CURRENT PERIOD DATA:
    ${JSON.stringify(currentPeriodData)}
    
    PREVIOUS PERIOD DATA (For comparison):
    ${JSON.stringify(previousPeriodData)}

    TASK:
    Generate a progress report.
    Focus on:
    1. Exercise Trends.
    2. Vital Signs.
    3. Emotional Telemetry (Are mood scores stabilizing?).
    
    Maintain the Cyberpunk/Developer persona (refer to body as Hardware/Software).

    Return JSON matching this schema:
    {
      "periodLabel": "string (e.g., 'Oct 12 - Oct 19')",
      "overallGrade": "A" | "B" | "C" | "D" | "F",
      "trends": [
        {
          "metric": "string (e.g. 'Metabolic Load' or 'HRV Stability')",
          "direction": "improving" | "declining" | "stable",
          "changePercentage": "string (e.g. '+12%')",
          "description": "string (short technical explanation)"
        }
      ],
      "comparisonSummary": "string (A paragraph comparing this period to the last one)",
      "optimizationTips": ["string", "string", "string"]
    }
`;

export const getSystemProfilePrompt = (data: DailyMetric[]) => `
    Analyze the following 30 days of biometric data to create a "System Identity Profile" (Resume).
    
    DATA:
    ${JSON.stringify(data)}

    TASK:
    1. Define a creative "Bio-Archetype" (e.g., "Overclocked Engine", "Hibernating Bear", "Balanced Monk").
    2. Write a short, professional "Bio/Resume" summary (2-3 sentences) explaining how this system operates.
    3. Score the system (0-100) on these 5 attributes based on the data:
       - Stamina (Based on Steps/Activity volume)
       - Stability (Based on HRV consistency and Mood stability)
       - Recovery (Based on Sleep scores)
       - Efficiency (Based on Resting Heart Rate - lower is better)
       - Resilience (Based on Stress levels and Mood)

    Return JSON matching this schema:
    {
      "archetype": "string",
      "bio": "string",
      "attributes": [
        { "subject": "Stamina", "A": number (0-100), "fullMark": 100 },
        { "subject": "Stability", "A": number (0-100), "fullMark": 100 },
        { "subject": "Recovery", "A": number (0-100), "fullMark": 100 },
        { "subject": "Efficiency", "A": number (0-100), "fullMark": 100 },
        { "subject": "Resilience", "A": number (0-100), "fullMark": 100 }
      ]
    }
`;

export const getRecoveryZonesPrompt = (context: string) => `Find ${context} near me. Provide a short helpful advice string about these places for my recovery.`;
