"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle, Lightbulb, Loader2 } from "lucide-react";
import type { AlertLog } from "@/app/actions";
import { getHealthRecommendationsAction } from "@/app/actions";
import { Skeleton } from "../ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";

interface HealthRecommendationsProps {
  location: string;
  aqi: number;
  weather: string;
  healthConditions?: string;
  onNewRecommendation: (log: AlertLog) => void;
}

export function HealthRecommendations({
  location,
  aqi,
  weather,
  healthConditions,
  onNewRecommendation,
}: HealthRecommendationsProps) {
  const [isPending, startTransition] = useTransition();
  const [recommendation, setRecommendation] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFetchRecommendation = () => {
    startTransition(async () => {
      setError(null);
      setRecommendation(null);
      try {
        const result = await getHealthRecommendationsAction(location, aqi, weather, healthConditions);
        setRecommendation(result.recommendation);
        onNewRecommendation(result.log);
      } catch (e) {
        setError("Failed to get recommendations. Please try again.");
      }
    });
  };

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
      <div className="flex-row items-center justify-between sm:flex">
        <h3 className="font-semibold text-white flex items-center gap-2 text-lg mb-2 sm:mb-0">
          <Lightbulb className="h-5 w-5 text-cyan-400" />
          AI Health Advice
        </h3>
        <Button onClick={handleFetchRecommendation} disabled={isPending} size="sm" className="bg-cyan-500 hover:bg-cyan-600 border-cyan-500 text-white rounded-lg">
          {isPending ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...</>
          ) : (
            "Get Advice"
          )}
        </Button>
      </div>
      <div className="mt-4">
        {isPending && (
            <div className="space-y-2">
                <Skeleton className="h-4 w-full bg-slate-700" />
                <Skeleton className="h-4 w-full bg-slate-700" />
                <Skeleton className="h-4 w-3/4 bg-slate-700" />
            </div>
        )}
        {error && (
            <Alert variant="destructive" className="bg-red-500/20 border-red-500 text-red-300">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        )}
        {recommendation && (
            <Alert className="bg-cyan-500/10 border-cyan-400/30 text-cyan-200">
                <Lightbulb className="h-4 w-4 text-cyan-400" />
                <AlertTitle className="text-cyan-300">Personalized Recommendation</AlertTitle>
                <AlertDescription className="font-code">{recommendation}</AlertDescription>
            </Alert>
        )}
        {!isPending && !recommendation && !error && (
            <p className="text-sm text-slate-400 p-4 text-center bg-slate-800/70 rounded-lg border border-slate-700">
                Click "Get Advice" to receive personalized health recommendations from our AI based on the current conditions.
            </p>
        )}
      </div>
    </div>
  );
}
