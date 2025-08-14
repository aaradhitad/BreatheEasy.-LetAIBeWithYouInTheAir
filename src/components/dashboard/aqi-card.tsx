import { Badge } from "@/components/ui/badge";

export function AqiCard({ aqi }: { aqi: number }) {
  const getAqiThemeInfo = (aqi: number) => {
    if (aqi <= 50) return { level: 'Good', color: 'bg-green-500/20 text-green-300 border-green-400'};
    if (aqi <= 100) return { level: 'Moderate', color: 'bg-yellow-500/20 text-yellow-300 border-yellow-400'};
    if (aqi <= 150) return { level: 'Unhealthy for Sensitive Groups', color: 'bg-orange-500/20 text-orange-300 border-orange-400'};
    if (aqi <= 200) return { level: 'Unhealthy', color: 'bg-red-500/20 text-red-300 border-red-400'};
    if (aqi <= 300) return { level: 'Very Unhealthy', color: 'bg-purple-500/20 text-purple-300 border-purple-400'};
    return { level: 'Hazardous', color: 'bg-red-700/20 text-red-400 border-red-500' };
  };
  
  const { level, color } = getAqiThemeInfo(aqi);

  const getAqiBarWidth = (aqi: number) => {
    if (aqi > 300) return '100%';
    return `${(aqi / 300) * 100}%`;
  }

  return (
    <div className="bg-yellow-500/10 border border-yellow-400/30 p-4 rounded-lg h-full flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-center">
            <span className="text-sm text-yellow-200/80">Live AQI</span>
            <Badge className={color}>{level}</Badge>
        </div>
        <div className="text-7xl font-bold text-yellow-300 mt-2">{aqi}</div>
        <div className="text-sm text-yellow-200/80">(AQI-US)</div>
      </div>
      
      <div className="mt-4">
        <div className="flex justify-between text-xs text-white mb-1">
            <span>PM10: 52 µg/m³</span>
            <span>PM2.5: 26 µg/m³</span>
        </div>
        <div className="w-full bg-slate-700/50 rounded-full h-2.5">
          <div className="bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 h-2.5 rounded-full" style={{ width: getAqiBarWidth(aqi) }}></div>
        </div>
        <div className="flex justify-between text-xs mt-1 text-slate-400">
          <span>Good</span>
          <span>Moderate</span>
          <span>Poor</span>
          <span>Unhealthy</span>
          <span>Severe</span>
          <span>Hazardous</span>
        </div>
      </div>
    </div>
  );
}
