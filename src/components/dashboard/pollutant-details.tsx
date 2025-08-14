import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Thermometer, Wind, Droplets, CloudRain } from "lucide-react";

type Pollutant = {
  name: string;
  fullName: string;
  value: number;
  unit: string;
};

const pollutants: Pollutant[] = [
    { name: 'PM2.5', fullName: 'Fine Particulate Matter', value: 26, unit: 'µg/m³' },
    { name: 'PM10', fullName: 'Particulate Matter', value: 52, unit: 'µg/m³' },
    { name: 'O₃', fullName: 'Ozone', value: 40, unit: 'ppb' },
    { name: 'CO', fullName: 'Carbon Monoxide', value: 5, unit: 'ppm' },
    { name: 'SO₂', fullName: 'Sulfur Dioxide', value: 12, unit: 'ppb' },
    { name: 'NO₂', fullName: 'Nitrogen Dioxide', value: 25, unit: 'ppb' },
];

export function PollutantDetails() {
  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
        <h3 className="font-semibold mb-4 text-white">Pollutant Breakdown</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {pollutants.map((pollutant) => (
            <div key={pollutant.name} className="p-3 rounded-lg bg-slate-700/50 border border-slate-600 text-center">
              <div className="text-sm font-semibold text-slate-300">{pollutant.name}</div>
              <div className="text-2xl font-bold text-white mt-1">{pollutant.value}</div>
              <div className="text-xs text-slate-400">{pollutant.unit}</div>
            </div>
          ))}
        </div>
    </div>
  );
}
