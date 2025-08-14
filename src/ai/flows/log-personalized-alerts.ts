'use server';

/**
 * @fileOverview This flow logs personalized health alerts, including weather conditions and recommendations from the Gemini tool.
 *
 * - logPersonalizedAlert - A function that logs the personalized alert information.
 * - LogPersonalizedAlertInput - The input type for the logPersonalizedAlert function.
 * - LogPersonalizedAlertOutput - The return type for the logPersonalizedAlert function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const LogPersonalizedAlertInputSchema = z.object({
  location: z.string().describe('The location for which the alert is generated.'),
  aqi: z.number().describe('The Air Quality Index value.'),
  weatherConditions: z.string().describe('The current weather conditions.'),
  recommendation: z.string().describe('The health recommendation provided by the Gemini tool.'),
});
export type LogPersonalizedAlertInput = z.infer<typeof LogPersonalizedAlertInputSchema>;

const LogPersonalizedAlertOutputSchema = z.object({
  success: z.boolean().describe('Indicates whether the alert was successfully logged.'),
  message: z.string().describe('A message indicating the result of the logging operation.'),
});
export type LogPersonalizedAlertOutput = z.infer<typeof LogPersonalizedAlertOutputSchema>;

export async function logPersonalizedAlert(input: LogPersonalizedAlertInput): Promise<LogPersonalizedAlertOutput> {
  return logPersonalizedAlertFlow(input);
}

const logPersonalizedAlertFlow = ai.defineFlow(
  {
    name: 'logPersonalizedAlertFlow',
    inputSchema: LogPersonalizedAlertInputSchema,
    outputSchema: LogPersonalizedAlertOutputSchema,
  },
  async input => {
    // Simulate logging the alert information (replace with actual logging mechanism)
    console.log('Logging personalized alert:', input);

    // In a real application, you would save this data to a database or other storage
    // For now, we just return a success message
    return {
      success: true,
      message: 'Personalized alert logged successfully.',
    };
  }
);
