import { GoogleGenAI, Schema, Type } from "@google/genai";
import { DailyMetric, AnalysisResponse, ReportResponse, ReportTimeframe } from "../types";

// Initialize Gemini
// CRITICAL: process.env.API_KEY is handled by the environment
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeBioSystem = async (data: DailyMetric[]): Promise<AnalysisResponse> => {
  // We only send the last 7 days to keep context manageable, plus a summary of the 30 days
  const recentData = data.slice(-7);
  const avgSteps = Math.floor(data.reduce((acc, curr) => acc + curr.steps, 0) / data.length);
  const minHRV = Math.min(...data.map(d => d.hrv));

  const prompt = `
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

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json'
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    return JSON.parse(text) as AnalysisResponse;

  } catch (error) {
    console.error("Gemini Analysis Failed:", error);
    return {
      summary: "System Error: Unable to connect to diagnostic server. Please verify API key and network connection.",
      anomalyDetected: false,
      actionableSteps: ["Check API Key", "Retry Analysis"],
      systemStatus: 'WARNING',
      burnoutRisk: 0,
      predictiveAnalysis: "Unable to calculate heuristics.",
      preventativePatches: []
    };
  }
};

export const generateProgressReport = async (data: DailyMetric[], timeframe: ReportTimeframe): Promise<ReportResponse> => {
  // Determine slice based on timeframe
  const days = timeframe === 'WEEKLY' ? 7 : 30;
  // We need current period vs previous period for comparison
  const currentPeriodData = data.slice(-days);
  const previousPeriodData = data.slice(-(days * 2), -days);

  const prompt = `
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

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json'
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    return JSON.parse(text) as ReportResponse;

  } catch (error) {
    console.error("Report Generation Failed:", error);
    return {
      periodLabel: "Unknown Period",
      overallGrade: "F",
      trends: [],
      comparisonSummary: "Error generating audit report.",
      optimizationTips: ["Retry connection"]
    };
  }
};

/**
 * Text-to-Speech functionality using Gemini 2.5 Flash TTS
 */
export const generateVoiceBriefing = async (text: string): Promise<string | null> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: text }] }],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Kore' },
            },
        },
      },
    });
    
    // The response contains raw PCM data in base64
    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    return base64Audio || null;
  } catch (error) {
    console.error("TTS Failed:", error);
    return null;
  }
};

// --- PCM Audio Decoding & Playback Utilities ---

// Base64 decoding
function decodeBase64(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

// Convert PCM Int16 to AudioBuffer
async function decodePcmAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number = 24000,
  numChannels: number = 1
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      // Normalize Int16 to Float32 [-1.0, 1.0]
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

let activeAudioSource: AudioBufferSourceNode | null = null;

export const playPCMAudio = async (base64String: string) => {
  // Stop existing audio if playing
  if (activeAudioSource) {
    try {
      activeAudioSource.stop();
    } catch(e) {}
    activeAudioSource = null;
  }

  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
  const rawBytes = decodeBase64(base64String);
  const audioBuffer = await decodePcmAudioData(rawBytes, audioContext);
  
  const source = audioContext.createBufferSource();
  source.buffer = audioBuffer;
  source.connect(audioContext.destination);
  source.start(0);
  
  activeAudioSource = source;
  
  source.onended = () => {
    activeAudioSource = null;
    audioContext.close();
  };
  
  return source;
};