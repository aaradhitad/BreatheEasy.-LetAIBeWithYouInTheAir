'use server';

/**
 * @fileOverview A flow that generates personalized health recommendations based on the current AQI and weather conditions.
 *
 * - generateHealthRecommendations - A function that generates health recommendations.
 * - GenerateHealthRecommendationsInput - The input type for the generateHealthRecommendations function.
 * - GenerateHealthRecommendationsOutput - The return type for the generateHealthRecommendations function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateHealthRecommendationsInputSchema = z.object({
  location: z.string().describe('The location for which to generate health recommendations.'),
  aqi: z.string().describe('The current air quality index (AQI).'),
  weatherConditions: z.string().describe('The current weather conditions.'),
  healthConditions: z.string().optional().describe('The user\'s existing health conditions.'),
  geminiApiKey: z.string().optional().describe('The Gemini API key to use. Optional, defaults to AIzaSyC43XTT5Z03_2te_PKxEJxJi_Uau-sBJ2w'),
});
export type GenerateHealthRecommendationsInput = z.infer<
  typeof GenerateHealthRecommendationsInputSchema
>;

const GenerateHealthRecommendationsOutputSchema = z.object({
  recommendations: z.string().describe('The personalized health recommendations.'),
});
export type GenerateHealthRecommendationsOutput = z.infer<
  typeof GenerateHealthRecommendationsOutputSchema
>;

export async function generateHealthRecommendations(
  input: GenerateHealthRecommendationsInput
): Promise<GenerateHealthRecommendationsOutput> {
  return generateHealthRecommendationsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateHealthRecommendationsPrompt',
  input: {schema: GenerateHealthRecommendationsInputSchema},
  output: {schema: GenerateHealthRecommendationsOutputSchema},
  prompt: `You are a health expert providing personalized health recommendations based on the current air quality and weather conditions for a given location.

  Location: {{location}}
  AQI: {{aqi}}
  Weather Conditions: {{weatherConditions}}
  {{#if healthConditions}}
  User's Health Conditions: {{healthConditions}}
  {{/if}}

  Provide specific and actionable recommendations tailored to the provided conditions. Consider the potential impact on vulnerable groups such as children, the elderly, and individuals with respiratory or cardiovascular conditions. If the user has provided specific health conditions, tailor the advice to them.

  Format the recommendations as a concise paragraph.
  `,
  config: {
    safetySettings: [
      {
        category: 'HARM_CATEGORY_HATE_SPEECH',
        threshold: 'BLOCK_ONLY_HIGH',
      },
      {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_NONE',
      },
      {
        category: 'HARM_CATEGORY_HARASSMENT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
      {
        category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
        threshold: 'BLOCK_LOW_AND_ABOVE',
      },
    ],
  },
});

const generateHealthRecommendationsFlow = ai.defineFlow(
  {
    name: 'generateHealthRecommendationsFlow',
    inputSchema: GenerateHealthRecommendationsInputSchema,
    outputSchema: GenerateHealthRecommendationsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
