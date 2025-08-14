import { config } from 'dotenv';
config();

import '@/ai/flows/generate-health-recommendations.ts';
import '@/ai/flows/log-personalized-alerts.ts';