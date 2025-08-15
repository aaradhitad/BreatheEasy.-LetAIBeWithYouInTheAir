"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Heart, 
  Activity, 
  Eye, 
  Shield, 
  Zap, 
  Sun, 
  Cloud, 
  Wind,
  Droplets,
  Thermometer,
  AlertTriangle,
  CheckCircle,
  Lightbulb,
  Brain,
  Stethoscope,
  Pill,
  Leaf,
  Home,
  Car,
  Clock
} from "lucide-react";

interface PersonalizedSolution {
  id: string;
  title: string;
  description: string;
  category: string;
  icon: React.ReactNode;
  priority: 'high' | 'medium' | 'low';
  actionable: boolean;
}

interface PersonalizedAISolutionsProps {
  aqi: number;
  weather: string;
  healthConditions?: string;
  location: string;
}

const getHealthConditionIcon = (condition: string): React.ReactNode => {
  const conditionLower = condition.toLowerCase();
  
  if (conditionLower.includes('asthma') || conditionLower.includes('respiratory')) {
    return <Stethoscope className="h-4 w-4 text-blue-400" />;
  }
  if (conditionLower.includes('heart') || conditionLower.includes('cardiovascular')) {
    return <Heart className="h-4 w-4 text-red-400" />;
  }
  if (conditionLower.includes('diabetes')) {
    return <Pill className="h-4 w-4 text-green-400" />;
  }
  if (conditionLower.includes('eye') || conditionLower.includes('vision')) {
    return <Eye className="h-4 w-4 text-purple-400" />;
  }
  if (conditionLower.includes('brain') || conditionLower.includes('neurological')) {
    return <Brain className="h-4 w-4 text-indigo-400" />;
  }
  if (conditionLower.includes('immune') || conditionLower.includes('allergy')) {
    return <Shield className="h-4 w-4 text-yellow-400" />;
  }
  
  return <Heart className="h-4 w-4 text-cyan-400" />;
};

const getWeatherIcon = (weather: string): React.ReactNode => {
  const weatherLower = weather.toLowerCase();
  
  if (weatherLower.includes('sun') || weatherLower.includes('clear')) {
    return <Sun className="h-3 w-3 text-yellow-400" />;
  }
  if (weatherLower.includes('cloud') || weatherLower.includes('overcast')) {
    return <Cloud className="h-3 w-3 text-gray-400" />;
  }
  if (weatherLower.includes('wind') || weatherLower.includes('breezy')) {
    return <Wind className="h-3 w-3 text-blue-400" />;
  }
  if (weatherLower.includes('rain') || weatherLower.includes('drizzle')) {
    return <Droplets className="h-3 w-3 text-blue-400" />;
  }
  if (weatherLower.includes('hot') || weatherLower.includes('high')) {
    return <Thermometer className="h-3 w-3 text-red-400" />;
  }
  
  return <Cloud className="h-3 w-3 text-gray-400" />;
};

const getAQIIcon = (aqi: number): React.ReactNode => {
  if (aqi <= 50) return <CheckCircle className="h-3 w-3 text-green-400" />;
  if (aqi <= 100) return <Lightbulb className="h-3 w-3 text-yellow-400" />;
  if (aqi <= 150) return <AlertTriangle className="h-3 w-3 text-orange-400" />;
  if (aqi <= 200) return <AlertTriangle className="h-3 w-3 text-red-400" />;
  if (aqi <= 300) return <Zap className="h-3 w-3 text-purple-400" />;
  return <Zap className="h-3 w-3 text-red-600" />;
};

export function PersonalizedAISolutions({ aqi, weather, healthConditions, location }: PersonalizedAISolutionsProps) {
  const [solutions, setSolutions] = useState<PersonalizedSolution[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const generateSolutions = () => {
      setIsLoading(true);
      
      // Simulate API call delay
      setTimeout(() => {
        const newSolutions: PersonalizedSolution[] = [];
        
        // Base solutions based on AQI
        if (aqi > 150) {
          newSolutions.push({
            id: 'aqi-high-1',
            title: 'Limit Outdoor Activities',
            description: 'Stay indoors during peak pollution hours. Use air purifiers.',
            category: 'Air Quality',
            icon: <Shield className="h-4 w-4 text-red-400" />,
            priority: 'high',
            actionable: true
          });
          
          newSolutions.push({
            id: 'aqi-high-2',
            title: 'Use N95 Masks',
            description: 'Wear N95 masks when going outside to filter particles.',
            category: 'Protection',
            icon: <Shield className="h-4 w-4 text-orange-400" />,
            priority: 'high',
            actionable: true
          });
        } else if (aqi > 100) {
          newSolutions.push({
            id: 'aqi-moderate-1',
            title: 'Moderate Outdoor Time',
            description: 'Limit strenuous outdoor activities. Consider indoor alternatives.',
            category: 'Activity',
            icon: <Activity className="h-4 w-4 text-yellow-400" />,
            priority: 'medium',
            actionable: true
          });
        }
        
        // Weather-based solutions
        if (weather.toLowerCase().includes('hot') || weather.toLowerCase().includes('high')) {
          newSolutions.push({
            id: 'weather-hot-1',
            title: 'Stay Hydrated',
            description: 'Drink plenty of water and avoid peak heat hours.',
            category: 'Weather',
            icon: <Droplets className="h-4 w-4 text-blue-400" />,
            priority: 'medium',
            actionable: true
          });
        }
        
        if (weather.toLowerCase().includes('wind')) {
          newSolutions.push({
            id: 'weather-wind-1',
            title: 'Protect Eyes',
            description: 'Wear sunglasses to prevent wind-borne particle irritation.',
            category: 'Protection',
            icon: <Eye className="h-4 w-4 text-indigo-400" />,
            priority: 'medium',
            actionable: true
          });
        }
        
        // Health condition specific solutions
        if (healthConditions) {
          const conditions = healthConditions.toLowerCase();
          
          if (conditions.includes('asthma') || conditions.includes('respiratory')) {
            newSolutions.push({
              id: 'health-asthma-1',
              title: 'Monitor Breathing',
              description: 'Keep rescue inhalers handy. Avoid outdoor exercise when AQI is high.',
              category: 'Respiratory',
              icon: <Stethoscope className="h-4 w-4 text-blue-400" />,
              priority: 'high',
              actionable: true
            });
            
            newSolutions.push({
              id: 'health-asthma-2',
              title: 'Indoor Air Quality',
              description: 'Use HEPA air purifiers and maintain clean environment.',
              category: 'Environment',
              icon: <Home className="h-4 w-4 text-green-400" />,
              priority: 'high',
              actionable: true
            });
          }
          
          if (conditions.includes('heart') || conditions.includes('cardiovascular')) {
            newSolutions.push({
              id: 'health-heart-1',
              title: 'Cardiac Monitoring',
              description: 'Monitor heart rate. Avoid strenuous activities during poor air quality.',
              category: 'Cardiovascular',
              icon: <Heart className="h-4 w-4 text-red-400" />,
              priority: 'high',
              actionable: true
            });
          }
          
          if (conditions.includes('diabetes')) {
            newSolutions.push({
              id: 'health-diabetes-1',
              title: 'Blood Sugar Management',
              description: 'Monitor glucose levels more frequently during poor air quality days.',
              category: 'Diabetes',
              icon: <Pill className="h-4 w-4 text-green-400" />,
              priority: 'medium',
              actionable: true
            });
          }
          
          if (conditions.includes('eye') || conditions.includes('vision')) {
            newSolutions.push({
              id: 'health-eye-1',
              title: 'Eye Protection',
              description: 'Use lubricating eye drops and avoid rubbing eyes.',
              category: 'Vision',
              icon: <Eye className="h-4 w-4 text-purple-400" />,
              priority: 'medium',
              actionable: true
            });
          }
        }
        
        // General wellness solutions
        newSolutions.push({
          id: 'general-wellness-1',
          title: 'Indoor Exercise',
          description: 'Switch to indoor workouts when outdoor air quality is poor.',
          category: 'Wellness',
          icon: <Activity className="h-4 w-4 text-cyan-400" />,
          priority: 'medium',
          actionable: true
        });
        
        newSolutions.push({
          id: 'general-wellness-2',
          title: 'Air Quality Monitoring',
          description: 'Check AQI levels regularly and plan activities accordingly.',
          category: 'Monitoring',
          icon: <Lightbulb className="h-4 w-4 text-yellow-400" />,
          priority: 'low',
          actionable: false
        });
        
        setSolutions(newSolutions);
        setIsLoading(false);
      }, 1000);
    };
    
    generateSolutions();
  }, [aqi, weather, healthConditions]);
  
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500/20 text-red-300 border-red-500/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'low': return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      default: return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };
  
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Air Quality': return 'bg-red-500/10 text-red-200 border-red-500/20';
      case 'Protection': return 'bg-blue-500/10 text-blue-200 border-blue-500/20';
      case 'Activity': return 'bg-green-500/10 text-green-200 border-green-500/20';
      case 'Weather': return 'bg-yellow-500/10 text-yellow-200 border-yellow-500/20';
      case 'Respiratory': return 'bg-cyan-500/10 text-cyan-200 border-cyan-500/20';
      case 'Cardiovascular': return 'bg-pink-500/10 text-pink-200 border-pink-500/20';
      case 'Diabetes': return 'bg-emerald-500/10 text-emerald-200 border-emerald-500/20';
      case 'Vision': return 'bg-purple-500/10 text-purple-200 border-purple-500/20';
      case 'Wellness': return 'bg-indigo-500/10 text-indigo-200 border-indigo-500/20';
      case 'Monitoring': return 'bg-gray-500/10 text-gray-200 border-gray-500/20';
      case 'Environment': return 'bg-green-500/10 text-green-200 border-green-500/20';
      default: return 'bg-gray-500/10 text-gray-200 border-gray-500/20';
    }
  };

  return (
    <Card className="bg-slate-900/80 backdrop-blur-lg border-slate-700 rounded-2xl shadow-2xl">
      <CardHeader className="pb-3">
        <CardTitle className="text-white flex items-center gap-2 text-base">
          <Zap className="h-4 w-4 text-cyan-400" />
          AI Solutions for You
          {healthConditions && (
            <Badge variant="outline" className="ml-2 bg-cyan-500/20 text-cyan-300 border-cyan-500/30 text-xs">
              Personalized
            </Badge>
          )}
        </CardTitle>
        <div className="flex items-center gap-3 text-xs text-slate-400">
          <div className="flex items-center gap-1">
            {getAQIIcon(aqi)}
            <span>AQI: {aqi}</span>
          </div>
          <div className="flex items-center gap-1">
            {getWeatherIcon(weather)}
            <span className="max-w-24 truncate" title={weather}>{weather}</span>
          </div>
          {healthConditions && (
            <div className="flex items-center gap-1">
              {getHealthConditionIcon(healthConditions)}
              <span className="max-w-16 truncate" title={healthConditions}>
                {healthConditions.length > 16 ? `${healthConditions.substring(0, 16)}...` : healthConditions}
              </span>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-start gap-2 p-2 bg-slate-700/30 rounded-lg">
                <Skeleton className="h-6 w-6 rounded-full bg-slate-600" />
                <div className="flex-1 space-y-1">
                  <Skeleton className="h-3 w-3/4 bg-slate-600" />
                  <Skeleton className="h-2 w-full bg-slate-600" />
                  <div className="flex gap-1">
                    <Skeleton className="h-3 w-12 bg-slate-600" />
                    <Skeleton className="h-3 w-16 bg-slate-600" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {solutions.map((solution) => (
              <div 
                key={solution.id} 
                className={`flex items-start gap-2 p-2 rounded-lg border transition-all hover:scale-[1.02] ${
                  solution.actionable 
                    ? 'bg-slate-700/40 hover:bg-slate-700/60 cursor-pointer' 
                    : 'bg-slate-700/20'
                }`}
              >
                <div className="flex-shrink-0 p-1 bg-slate-600/50 rounded-full">
                  {solution.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-1 mb-1">
                    <h4 className="font-medium text-white text-xs leading-tight">
                      {solution.title}
                    </h4>
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${getPriorityColor(solution.priority)}`}
                    >
                      {solution.priority}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed mb-1">
                    {solution.description}
                  </p>
                  <div className="flex items-center gap-1">
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${getCategoryColor(solution.category)}`}
                    >
                      {solution.category}
                    </Badge>
                    {solution.actionable && (
                      <Badge variant="outline" className="text-xs bg-green-500/20 text-green-300 border-green-500/30">
                        Actionable
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {!isLoading && solutions.length === 0 && (
          <div className="text-center py-4 text-slate-400">
            <Lightbulb className="h-8 w-8 mx-auto mb-2 text-slate-600" />
            <p className="text-xs">No specific recommendations for current conditions.</p>
            <p className="text-xs">Air quality and weather are within safe ranges.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
