"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, Share2, MapIcon, X, TrendingUp, Brain } from "lucide-react";
import { AQILivePreview } from "./aqi-live-preview";

interface SavedItem {
  id: string;
  location: string;
  aqi: number;
  weather: string;
  recommendations: string[];
  timestamp: Date;
}

interface TopStatesSidebarProps {
  savedItems: SavedItem[];
  onRemoveSavedItem: (id: string) => void;
}

export function TopStatesSidebar({ savedItems, onRemoveSavedItem }: TopStatesSidebarProps) {

  return (
    <aside className="w-full lg:w-80 space-y-6">
      {/* AQI Live Preview Card */}
      <Card className="bg-slate-900/80 backdrop-blur-lg border-slate-700 shadow-2xl">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg text-cyan-400 flex items-center gap-2">
            <MapIcon className="h-5 w-5" />
            AQI Live Preview
          </CardTitle>
          <CardDescription className="text-slate-400 text-sm">
            Real-time air quality data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <AQILivePreview />
          <Button 
            onClick={() => window.dispatchEvent(new CustomEvent('show-aqi-heatmap'))}
            className="w-full bg-cyan-600 hover:bg-cyan-700 text-white"
          >
            View Full Heatmap
          </Button>
        </CardContent>
      </Card>

      {/* Top 10 AQI States */}
      <Card className="bg-slate-900/80 backdrop-blur-lg border-slate-700 shadow-2xl">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg text-cyan-400 flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Top 10 AQI States
          </CardTitle>
          <CardDescription className="text-slate-400 text-sm">
            States with highest air quality index
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            { state: "Delhi", aqi: 456, status: "Hazardous" },
            { state: "Mumbai", aqi: 389, status: "Very Unhealthy" },
            { state: "Kolkata", aqi: 345, status: "Very Unhealthy" },
            { state: "Chennai", aqi: 298, status: "Unhealthy" },
            { state: "Hyderabad", aqi: 267, status: "Unhealthy" },
            { state: "Bangalore", aqi: 234, status: "Unhealthy" },
            { state: "Pune", aqi: 198, status: "Unhealthy" },
            { state: "Ahmedabad", aqi: 187, status: "Unhealthy" },
            { state: "Jaipur", aqi: 176, status: "Unhealthy" },
            { state: "Lucknow", aqi: 165, status: "Unhealthy" }
          ].map((item, index) => {
            // Get AQI color based on value
            const getAQIColor = (aqi: number) => {
              if (aqi <= 50) return { bg: 'bg-green-500', text: 'text-green-500' };
              if (aqi <= 100) return { bg: 'bg-yellow-500', text: 'text-yellow-500' };
              if (aqi <= 150) return { bg: 'bg-orange-500', text: 'text-orange-500' };
              if (aqi <= 200) return { bg: 'bg-red-500', text: 'text-red-500' };
              if (aqi <= 300) return { bg: 'bg-purple-500', text: 'text-purple-500' };
              return { bg: 'bg-red-600', text: 'text-red-600' };
            };

            const aqiColor = getAQIColor(item.aqi);
            
            return (
              <div key={index} className="flex items-center justify-between p-2 rounded-lg bg-slate-800/50 border border-slate-700">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <span className="text-slate-400 text-sm font-mono w-6 flex-shrink-0">{index + 1}</span>
                  <span className="text-white font-medium truncate">{item.state}</span>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Badge className={`${aqiColor.bg} text-white text-xs px-2 py-1`}>
                    {item.aqi}
                  </Badge>
                  {/* Rainbow AQI meter */}
                  <div className="flex items-center gap-1">
                    <div className="w-12 h-2 bg-slate-700 rounded-full overflow-hidden relative">
                      {/* Rainbow gradient background */}
                      <div className="absolute inset-0 bg-gradient-to-r from-green-500 via-yellow-500 via-orange-500 via-red-500 to-purple-500 rounded-full opacity-20"></div>
                      {/* AQI level indicator */}
                      <div 
                        className={`h-full ${aqiColor.bg} rounded-full transition-all duration-300 relative z-10`}
                        style={{ 
                          width: `${Math.min(100, (item.aqi / 500) * 100)}%`,
                          boxShadow: `0 0 6px ${aqiColor.bg.replace('bg-', '#').replace('-500', '')}60`
                        }}
                      ></div>
                    </div>
                    <span className="text-slate-400 text-xs truncate max-w-16">{item.status}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* AI Solutions for You */}
      <Card className="bg-slate-900/80 backdrop-blur-lg border-slate-700 shadow-2xl">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg text-cyan-400 flex items-center gap-2">
            <Brain className="h-5 w-5" />
            AI Solutions for You
          </CardTitle>
          <CardDescription className="text-slate-400 text-sm">
            Personalized recommendations based on your location
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            {
              icon: "🌱",
              title: "Indoor Air Purification",
              description: "Consider using HEPA air purifiers in your home, especially in bedrooms and living areas."
            },
            {
              icon: "🚶",
              title: "Outdoor Activity Timing",
              description: "Limit outdoor activities during peak pollution hours (6-9 AM and 6-9 PM)."
            },
            {
              icon: "🏠",
              title: "Ventilation Strategy",
              description: "Open windows during low-pollution periods and use exhaust fans in kitchens and bathrooms."
            },
            {
              icon: "🌿",
              title: "Natural Air Filters",
              description: "Add indoor plants like Peace Lily, Spider Plant, and Aloe Vera to naturally purify air."
            },
            {
              icon: "🚗",
              title: "Transportation Choices",
              description: "Use public transport or carpool when possible to reduce personal vehicle emissions."
            }
          ].map((solution, index) => (
            <div key={index} className="p-3 rounded-lg bg-slate-800/50 border border-slate-700 hover:border-cyan-500/50 transition-colors">
              <div className="flex items-start gap-3">
                <span className="text-2xl">{solution.icon}</span>
                <div className="flex-1">
                  <h4 className="font-medium text-white text-sm mb-1">{solution.title}</h4>
                  <p className="text-slate-400 text-xs leading-relaxed">{solution.description}</p>
                </div>
              </div>
        </div>
          ))}
        </CardContent>
      </Card>

      {/* Saved Items */}
      {savedItems.length > 0 && (
        <Card className="bg-slate-900/80 backdrop-blur-lg border-slate-700 shadow-2xl">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-cyan-400 flex items-center gap-2">
              <Heart className="h-5 w-5" />
              Saved Items
            </CardTitle>
            <CardDescription className="text-slate-400 text-sm">
              Your saved AQI data and recommendations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {savedItems.slice(0, 3).map((item) => (
              <div key={item.id} className="p-3 rounded-lg border border-slate-700 bg-slate-800/50">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h4 className="font-medium text-white text-sm">{item.location}</h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemoveSavedItem(item.id)}
                    className="h-6 w-6 p-0 text-slate-400 hover:text-red-400 hover:bg-red-500/20"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
                <div className="space-y-1 text-xs">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs bg-slate-700 text-slate-300">
                      AQI: {item.aqi}
                    </Badge>
                    <span className="text-slate-400">{item.weather}</span>
                  </div>
                  {item.recommendations.length > 0 && (
                    <p className="text-slate-400 line-clamp-2">
                      💡 {item.recommendations[0]}
                    </p>
                  )}
                  <p className="text-slate-500 text-xs">
                    {item.timestamp.toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
        )}
    </aside>
  );
}


