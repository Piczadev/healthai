

import { GoogleGenAI, Schema, Type } from "@google/genai";
import { DailyMetric, AnalysisResponse, ReportResponse, ReportTimeframe, SystemProfile, RecoveryZoneResult } from "../types";
import { getAnalysisPrompt, getProgressReportPrompt, getSystemProfilePrompt, getRecoveryZonesPrompt } from "./prompts";

// Initialize Gemini
// CRITICAL: process.env.API_KEY is handled by the environment
const apiKey = import.meta.env.VITE_GEMINI_API_KEY || process.env.API_KEY;
const ai = new GoogleGenAI({ apiKey });

export const analyzeBioSystem = async (data: DailyMetric[]): Promise<AnalysisResponse> => {
  // We only send the last 7 days to keep context manageable, plus a summary of the 30 days
  const recentData = data.slice(-7);
  const avgSteps = Math.floor(data.reduce((acc, curr) => acc + curr.steps, 0) / data.length);
  const minHRV = Math.min(...data.map(d => d.hrv));

  const prompt = getAnalysisPrompt(avgSteps, minHRV, recentData);

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

  const prompt = getProgressReportPrompt(timeframe, days, currentPeriodData, previousPeriodData);

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

export const analyzeSystemProfile = async (data: DailyMetric[]): Promise<SystemProfile> => {
  // Analyze full history
  const prompt = getSystemProfilePrompt(data.slice(-30));

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
    return JSON.parse(text) as SystemProfile;

  } catch (error) {
    console.error("Profile Analysis Failed:", error);
    // Fallback data
    return {
      archetype: "System Offline",
      bio: "Unable to generate profile.",
      attributes: [
        { subject: "Stamina", A: 0, fullMark: 100 },
        { subject: "Stability", A: 0, fullMark: 100 },
        { subject: "Recovery", A: 0, fullMark: 100 },
        { subject: "Efficiency", A: 0, fullMark: 100 },
        { subject: "Resilience", A: 0, fullMark: 100 }
      ]
    };
  }
};

export const findRecoveryZones = async (lat: number, lng: number, context: string): Promise<RecoveryZoneResult | null> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: getRecoveryZonesPrompt(context),
      config: {
        tools: [{ googleMaps: {} }],
        toolConfig: {
          retrievalConfig: {
            latLng: {
              latitude: lat,
              longitude: lng
            }
          }
        }
      },
    });

    const advice = response.text || "No advice available.";

    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const locations = chunks.reduce((acc: { title: string, uri: string }[], chunk: any) => {
      if (chunk.maps) {
        // Google Maps grounding chunk
        acc.push({ title: chunk.maps.title || "Unknown Location", uri: chunk.maps.uri });
      } else if (chunk.web) {
        // Fallback or Search grounding chunk
        acc.push({ title: chunk.web.title, uri: chunk.web.uri });
      }
      return acc;
    }, []);

    return {
      advice,
      locations
    };

  } catch (error) {
    console.error("Maps Grounding Failed:", error);
    return null;
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

export const playPCMAudio = async (base64String: string, onEnded?: () => void) => {
  // Stop existing audio if playing
  if (activeAudioSource) {
    try {
      activeAudioSource.stop();
    } catch (e) { }
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
    if (onEnded) onEnded();
  };

  return source;
};
