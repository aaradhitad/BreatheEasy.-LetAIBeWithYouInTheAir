"use client";

import { useEffect, useRef, useState } from 'react';
import { MapIcon, Loader2 } from 'lucide-react';

interface AQIPoint {
  lat: number;
  lon: number;
  aqi: number;
  name?: string;
}

const AQILivePreview = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [aqiPoints, setAqiPoints] = useState<AQIPoint[]>([]);

  useEffect(() => {
    let isMounted = true;
    let baseLayer: any;
    let aqiLayer: any;
    let markersLayer: any;

    const initMap = async () => {
      if (!containerRef.current || mapRef.current) return;
      
      try {
        const L = await import('leaflet');
        
        const map = L.map(containerRef.current, {
          zoomControl: false,
          attributionControl: false,
          center: [22.5726, 88.3639], // Kolkata coordinates
          zoom: 10,
          preferCanvas: true,
          dragging: false,
          touchZoom: false,
          scrollWheelZoom: false,
          doubleClickZoom: false,
          boxZoom: false,
          keyboard: false,
        });

        if (!isMounted) return;
        mapRef.current = map;

        // Use a lighter base map for better visibility
        baseLayer = L.tileLayer(
          'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
          {
            subdomains: 'abcd',
            maxZoom: 15,
            opacity: 0.7
          }
        ).addTo(map);

        // Fetch live AQI data points
        const token = process.env.NEXT_PUBLIC_WAQI_TOKEN || 'demo';
        try {
          // Get AQI data for a region around Kolkata
          const boundsUrl = `https://api.waqi.info/map/bounds/?token=${token}&latlng=22.0,87.5,23.0,89.0`;
          const response = await fetch(boundsUrl);
          if (response.ok) {
            const data = await response.json();
            if (data.data && Array.isArray(data.data)) {
              const points: AQIPoint[] = data.data
                .filter((item: any) => item.aqi && item.lat && item.lon)
                .map((item: any) => ({
                  lat: item.lat,
                  lon: item.lon,
                  aqi: Number(item.aqi),
                  name: item.station?.name
                }))
                .slice(0, 20); // Limit to 20 points for performance
              
              if (isMounted) {
                setAqiPoints(points);
              }
            }
          }
        } catch (error) {
          console.error('Failed to fetch AQI data:', error);
          // Fallback to mock data
          if (isMounted) {
            setAqiPoints([
              { lat: 22.5726, lon: 88.3639, aqi: 279, name: 'Kolkata Center' },
              { lat: 22.5200, lon: 88.3500, aqi: 256, name: 'South Kolkata' },
              { lat: 22.6200, lon: 88.4000, aqi: 268, name: 'North Kolkata' },
              { lat: 22.5000, lon: 88.3000, aqi: 227, name: 'West Kolkata' },
              { lat: 22.6500, lon: 88.4500, aqi: 249, name: 'East Kolkata' },
            ]);
          }
        }

        // Create markers for AQI points
        if (isMounted) {
          markersLayer = L.layerGroup();
          
          aqiPoints.forEach((point) => {
            const color = getAQIColor(point.aqi);
            const size = Math.max(8, Math.min(16, point.aqi / 20));
            
            const marker = L.circleMarker([point.lat, point.lon], {
              radius: size,
              fillColor: color,
              color: '#fff',
              weight: 1,
              opacity: 0.8,
              fillOpacity: 0.7
            });

            // Add AQI value as text
            const text = L.divIcon({
              className: 'aqi-text-icon',
              html: `<div style="
                background: rgba(0,0,0,0.7); 
                color: white; 
                border-radius: 50%; 
                width: ${size * 2}px; 
                height: ${size * 2}px; 
                display: flex; 
                align-items: center; 
                justify-content: center; 
                font-size: ${Math.max(8, size - 4)}px; 
                font-weight: bold;
                border: 1px solid white;
              ">${point.aqi}</div>`,
              iconSize: [size * 2, size * 2],
              iconAnchor: [size, size]
            });

            const textMarker = L.marker([point.lat, point.lon], { icon: text });
            markersLayer.addLayer(marker);
            markersLayer.addLayer(textMarker);
          });

          markersLayer.addTo(map);
        }

        setIsLoading(false);

      } catch (error) {
        console.error('Failed to initialize preview map:', error);
        setIsLoading(false);
      }
    };

    const cleanupPromise = initMap();

    return () => {
      isMounted = false;
      if (cleanupPromise && typeof (cleanupPromise as any) === 'function') {
        try { (cleanupPromise as any)(); } catch {}
      }
      const map = mapRef.current as any;
      try {
        if (map) {
          if (baseLayer) map.removeLayer(baseLayer);
          if (aqiLayer) map.removeLayer(aqiLayer);
          if (markersLayer) map.removeLayer(markersLayer);
          map.remove();
        }
      } finally {
        mapRef.current = null;
      }
    };
  }, []);

  const getAQIColor = (aqi: number): string => {
    if (aqi <= 50) return '#22c55e';      // Good - Green
    if (aqi <= 100) return '#eab308';     // Moderate - Yellow
    if (aqi <= 150) return '#f97316';     // USG - Orange
    if (aqi <= 200) return '#ef4444';     // Unhealthy - Red
    if (aqi <= 300) return '#a855f7';     // Very Unhealthy - Purple
    return '#7f1d1d';                     // Hazardous - Dark Red
  };

  return (
    <div className="relative w-full h-full">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-800/80 rounded-lg z-10">
          <div className="text-center text-slate-400">
            <Loader2 className="h-6 w-6 mx-auto mb-2 animate-spin" />
            <p className="text-xs">Loading AQI data...</p>
          </div>
        </div>
      )}
      
      <div
        ref={containerRef}
        className="w-full h-full rounded-lg"
        style={{ minHeight: '200px' }}
      />
      
      {/* AQI Legend */}
      <div className="absolute bottom-2 left-2 bg-black/70 rounded px-2 py-1 text-xs text-white">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
          <span>Good</span>
          <div className="w-3 h-3 rounded-full bg-yellow-500 ml-2"></div>
          <span>Mod</span>
          <div className="w-3 h-3 rounded-full bg-orange-500 ml-2"></div>
          <span>USG</span>
          <div className="w-3 h-3 rounded-full bg-red-500 ml-2"></div>
          <span>Unh</span>
          <div className="w-3 h-3 rounded-full bg-purple-500 ml-2"></div>
          <span>VUnh</span>
        </div>
      </div>
    </div>
  );
};

export default AQILivePreview;
