'use server';

import { generateHealthRecommendations, GenerateHealthRecommendationsInput } from '@/ai/flows/generate-health-recommendations';
import { logPersonalizedAlert } from '@/ai/flows/log-personalized-alerts';

export interface AlertLog {
  timestamp: string;
  location: string;
  aqi: number;
  weather: string;
  recommendation: string;
}

export async function getHealthRecommendationsAction(
  location: string,
  aqi: number,
  weatherConditions: string,
  healthConditions?: string,
): Promise<{ recommendation: string; log: AlertLog }> {
  const input: GenerateHealthRecommendationsInput = {
    location,
    aqi: String(aqi),
    weatherConditions,
    healthConditions,
    geminiApiKey: "AIzaSyC43XTT5Z03_2te_PKxEJxJi_Uau-sBJ2w"
  };

  try {
    const { recommendations } = await generateHealthRecommendations(input);

    await logPersonalizedAlert({
      location,
      aqi,
      weatherConditions,
      recommendation: recommendations,
    });
    
    const newLog: AlertLog = {
      timestamp: new Date().toISOString(),
      location,
      aqi,
      weather: weatherConditions,
      recommendation: recommendations,
    };

    return { recommendation: recommendations, log: newLog };
  } catch (error) {
    console.error('Error getting health recommendations:', error);
    throw new Error('Failed to generate health recommendations.');
  }
}
