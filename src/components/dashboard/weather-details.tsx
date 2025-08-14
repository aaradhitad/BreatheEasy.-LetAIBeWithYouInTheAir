import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Thermometer, Wind, Droplets, CloudRain } from "lucide-react";

type WeatherData = {
  temp: number;
  humidity: number;
  wind: number;
  precipitation: number;
};

const weatherData: WeatherData = {
  temp: 18,
  humidity: 60,
  wind: 10,
  precipitation: 5,
};

export function WeatherDetails() {
  return (
    <Card className="bg-card/70 backdrop-blur-sm shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Thermometer className="h-5 w-5" />
          Weather
        </CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
        <div className="flex flex-col items-center p-2 rounded-lg bg-background/50 border">
            <Thermometer className="h-6 w-6 text-primary mb-2" />
            <span className="text-xl font-bold">{weatherData.temp}°C</span>
            <span className="text-xs text-muted-foreground">Temperature</span>
        </div>
        <div className="flex flex-col items-center p-2 rounded-lg bg-background/50 border">
            <Droplets className="h-6 w-6 text-primary mb-2" />
            <span className="text-xl font-bold">{weatherData.humidity}%</span>
            <span className="text-xs text-muted-foreground">Humidity</span>
        </div>
        <div className="flex flex-col items-center p-2 rounded-lg bg-background/50 border">
            <Wind className="h-6 w-6 text-primary mb-2" />
            <span className="text-xl font-bold">{weatherData.wind} <span className="text-sm">km/h</span></span>
            <span className="text-xs text-muted-foreground">Wind</span>
        </div>
        <div className="flex flex-col items-center p-2 rounded-lg bg-background/50 border">
            <CloudRain className="h-6 w-6 text-primary mb-2" />
            <span className="text-xl font-bold">{weatherData.precipitation}%</span>
            <span className="text-xs text-muted-foreground">Rain</span>
        </div>
      </CardContent>
    </Card>
  );
}
