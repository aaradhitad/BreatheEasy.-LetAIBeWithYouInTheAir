"use client";

import React from "react";
import { Sun, Cloud, CloudRain, Wind, CloudLightning } from "lucide-react";

export type WeatherAnimationProps = {
  code?: number;
  isDay?: boolean;
  wind?: number;
  humidity?: number;
};

function classifyWeather(code?: number, wind?: number, humidity?: number):
  | "clear"
  | "cloudy"
  | "rain"
  | "thunder"
  | "windy" {
  if (typeof code === "number") {
    if (code === 0) return "clear";
    if ([1, 2, 3, 45, 48].includes(code)) return "cloudy";
    if ([51, 53, 55, 61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return "rain";
    if ([95, 96, 99].includes(code)) return "thunder";
    if ([71, 73, 75, 85, 86].includes(code)) return "cloudy";
  }
  if (typeof wind === "number" && wind >= 25) return "windy";
  if (typeof humidity === "number" && humidity >= 85) return "rain";
  return "clear";
}

export function WeatherAnimation({ code, isDay = true, wind, humidity }: WeatherAnimationProps) {
  const type = classifyWeather(code, wind, humidity);
  const iconColor = isDay ? "#fde68a" : "#93c5fd";

  return (
    <div className="relative w-40 h-28 flex items-center justify-center select-none" aria-label="Weather animation">
      {type === "clear" && (
        <Sun className="h-16 w-16 text-yellow-300 animate-pulse" />
      )}
      {type === "cloudy" && (
        <div className="relative">
          <Cloud className="h-14 w-14 text-slate-200/80" />
          <div className="absolute inset-0 animate-[drift_6s_ease-in-out_infinite]" style={{ opacity: 0.3 }}>
            <Cloud className="h-14 w-14 text-slate-300/60" />
          </div>
        </div>
      )}
      {type === "rain" && (
        <div className="relative">
          <CloudRain className="h-14 w-14 text-sky-300" />
          <div className="absolute left-1/2 top-8 -translate-x-1/2 flex gap-1">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="w-1 h-4 bg-sky-300/80 rounded-full animate-[fall_0.9s_linear_infinite]" style={{ animationDelay: `${i * 0.15}s` }} />
            ))}
          </div>
        </div>
      )}
      {type === "thunder" && (
        <div className="relative">
          <CloudLightning className="h-14 w-14 text-yellow-300" />
          <div className="absolute inset-0 animate-[flash_2s_ease-in-out_infinite] rounded" style={{ boxShadow: `0 0 20px ${iconColor}` }} />
        </div>
      )}
      {type === "windy" && (
        <div className="relative">
          <Wind className="h-14 w-14 text-cyan-300" />
          <div className="absolute -bottom-2 left-0 right-0 flex gap-2 justify-center">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-1 w-10 bg-cyan-300/50 rounded-full animate-[sway_2s_ease-in-out_infinite]" style={{ animationDelay: `${i * 0.2}s` }} />
            ))}
          </div>
        </div>
      )}
      <style jsx>{`
        @keyframes drift { 0%, 100% { transform: translateX(-6px); } 50% { transform: translateX(6px); } }
        @keyframes fall { 0% { transform: translateY(0); opacity: 0.9; } 100% { transform: translateY(14px); opacity: 0.1; } }
        @keyframes flash { 0%, 100% { opacity: 0.2; } 10% { opacity: 0.8; } 20% { opacity: 0.2; } 30% { opacity: 0.7; } 40% { opacity: 0.2; } }
        @keyframes sway { 0%, 100% { transform: translateX(-4px); } 50% { transform: translateX(4px); } }
      `}</style>
    </div>
  );
}


