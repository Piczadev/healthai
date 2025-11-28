import { DailyMetric } from './types';

// Generating data that simulates the "Flight Response" scenario:
// High Steps (30k-40k), Low HRV (<30ms), High RHR.
export const MOCK_USER_NAME = "Piczadev";

const generateMockData = (): DailyMetric[] => {
  const data: DailyMetric[] = [];
  const today = new Date();
  
  // Create 30 days of data
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    
    // Simulating the "Crash" scenario described in the PDF
    // Days 0-10: Pre-crisis (Normal-ish)
    // Days 11-25: Crisis (Flight mode - High steps, dropping HRV)
    // Days 26-30: Current state (Critical)
    
    let steps, rhr, hrv, sleep, moodScore, tags;

    if (i > 20) {
      // Normal baseline
      steps = 8000 + Math.random() * 4000;
      rhr = 55 + Math.random() * 5;
      hrv = 65 + Math.random() * 15;
      sleep = 85 + Math.random() * 10;
      moodScore = 7 + Math.floor(Math.random() * 2);
      tags = ["Stable", "Balanced"];
    } else if (i > 5) {
      // The "Flight Response" / 40k steps phase
      steps = 25000 + Math.random() * 15000; // Peaks of 40k
      rhr = 68 + Math.random() * 8; // Elevating
      hrv = 40 - (Math.random() * 10); // Dropping
      sleep = 50 + Math.random() * 20; // Poor sleep
      moodScore = 4 + Math.floor(Math.random() * 3);
      tags = ["Hyper-focused", "Agitated", "Restless"];
    } else {
      // The "Crash" / Current state
      steps = 15000 + Math.random() * 5000; // Trying to slow down but still high
      rhr = 76 + Math.random() * 4; // High RHR mentioned in text
      hrv = 29 + Math.random() * 5; // The critical 29ms mentioned
      sleep = 45 + Math.random() * 10;
      moodScore = 2 + Math.floor(Math.random() * 2);
      tags = ["Numb", "Overwhelmed", "Brain Fog"];
    }

    data.push({
      date: d.toISOString().split('T')[0],
      steps: Math.floor(steps),
      restingHeartRate: Math.floor(rhr),
      hrv: Math.floor(hrv),
      sleepScore: Math.floor(sleep),
      stressLevel: i < 5 ? 9 : (i < 20 ? 8 : 4),
      caloriesBurned: Math.floor(steps * 0.04 + 1800),
      moodScore: moodScore,
      emotionalTags: tags
    });
  }
  return data;
};

export const HEALTH_DATA = generateMockData();