"use client";

import { useEffect, useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';

const AQISimple = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [aqiData, setAqiData] = useState<any[]>([]);

  useEffect(() => {
    if (!mapRef.current) return;

    let isMounted = true;

    const fetchAQIData = async () => {
      try {
        const token = process.env.NEXT_PUBLIC_WAQI_TOKEN || 'demo';
        
        console.log('Fetching real-time AQI data...');
        
        // Fetch AQI data for the entire world
        const response = await fetch(
          `https://api.waqi.info/map/bounds/?token=${token}&latlng=-90,-180,90,180&lang=en`
        );
        
        if (response.ok) {
          const data = await response.json();
          if (data.data && Array.isArray(data.data)) {
            // Filter valid data points with station names
            const validPoints = data.data
              .filter((item: any) => 
                item.aqi && 
                item.lat && 
                item.lon && 
                item.station && 
                item.station.name
              )
              .slice(0, 200); // Limit to avoid overwhelming the map
            
            if (isMounted) {
              setAqiData(validPoints);
              console.log(`Loaded ${validPoints.length} real-time AQI data points`);
            }
          }
        } else {
          console.log('Using fallback sample data');
          if (isMounted) {
            setAqiData(getSampleData());
          }
        }
        
      } catch (error) {
        console.error('Failed to fetch AQI data:', error);
        // Fallback to sample data if API fails
        if (isMounted) {
          setAqiData(getSampleData());
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    const initMap = async () => {
      try {
        // Import Leaflet
        const L = await import('leaflet');
        
        // Import Leaflet CSS
        if (!document.querySelector('link[href*="leaflet.css"]')) {
          const link = document.createElement('link');
          link.rel = 'stylesheet';
          link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
          document.head.appendChild(link);
        }

        // Wait a bit for CSS to load
        await new Promise(resolve => setTimeout(resolve, 100));

        // Create map with explicit dimensions
        const map = L.map(mapRef.current, {
          center: [20, 0],
          zoom: 2,
          zoomControl: true,
          attributionControl: true,
        });

        if (!isMounted) return;
        
        // Store map instance
        mapInstanceRef.current = map;

        // Add tile layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 18,
          attribution: '© OpenStreetMap contributors'
        }).addTo(map);

        // Add AQI overlay layer
        const token = process.env.NEXT_PUBLIC_WAQI_TOKEN || 'demo';
        try {
          L.tileLayer(
            `https://tiles.waqi.info/tiles/usepa-aqi/{z}/{x}/{y}.png?token=${token}`,
            {
              maxZoom: 15,
              opacity: 0.6
            }
          ).addTo(map);
        } catch (error) {
          console.log('AQI overlay tiles not available, using markers only');
        }

        // Force map to refresh
        setTimeout(() => {
          if (map && isMounted) {
            map.invalidateSize();
          }
        }, 200);

      } catch (error) {
        console.error('Failed to initialize map:', error);
        setIsLoading(false);
      }
    };

    // Initialize map first, then fetch data
    initMap().then(() => {
      fetchAQIData();
    });

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Add markers when AQI data changes
  useEffect(() => {
    if (aqiData.length > 0 && mapInstanceRef.current) {
      addAQIMarkers(mapInstanceRef.current, aqiData);
    }
  }, [aqiData]);

  const addAQIMarkers = (map: any, data: any[]) => {
    if (!map || !data.length) return;

    try {
      // Clear existing markers
      map.eachLayer((layer: any) => {
        if (layer instanceof (window as any).L.Marker || layer instanceof (window as any).L.CircleMarker) {
          map.removeLayer(layer);
        }
      });

      // Add new markers
      data.forEach((point: any) => {
        const aqi = Number(point.aqi);
        const color = getAQIColor(aqi);
        const size = Math.max(6, Math.min(16, aqi / 30));
        
        // Create circle marker
        const marker = (window as any).L.circleMarker([point.lat, point.lon], {
          radius: size,
          fillColor: color,
          color: '#fff',
          weight: 2,
          opacity: 1,
          fillOpacity: 0.8
        });

        // Add popup with detailed AQI info
        const cityName = point.station?.name || 'Unknown City';
        const time = point.time ? new Date(point.time.v * 1000).toLocaleString() : 'Recent';
        
        marker.bindPopup(`
          <div style="text-align: center; min-width: 200px;">
            <strong style="color: ${color}; font-size: 16px;">${cityName}</strong><br>
            <div style="margin: 8px 0;">
              <span style="
                background: ${color}; 
                color: white; 
                padding: 4px 8px; 
                border-radius: 12px; 
                font-weight: bold;
                font-size: 18px;
              ">AQI: ${aqi}</span>
            </div>
            <div style="margin: 4px 0; font-size: 14px;">
              <strong>${getAQIDescription(aqi)}</strong>
            </div>
            <div style="margin: 4px 0; font-size: 12px; color: #666;">
              Last updated: ${time}
            </div>
            ${point.station?.url ? `<br><a href="${point.station.url}" target="_blank" style="color: #007bff;">View Details</a>` : ''}
          </div>
        `);

        marker.addTo(map);
      });

      console.log(`Added ${data.length} AQI markers to map`);
    } catch (error) {
      console.error('Failed to add markers:', error);
    }
  };

  const getAQIColor = (aqi: number): string => {
    if (aqi <= 50) return '#22c55e';      // Good - Green
    if (aqi <= 100) return '#eab308';     // Moderate - Yellow
    if (aqi <= 150) return '#f97316';     // USG - Orange
    if (aqi <= 200) return '#ef4444';     // Unhealthy - Red
    if (aqi <= 300) return '#a855f7';     // Very Unhealthy - Purple
    return '#7f1d1d';                     // Hazardous - Dark Red
  };

  const getAQIDescription = (aqi: number): string => {
    if (aqi <= 50) return 'Good';
    if (aqi <= 100) return 'Moderate';
    if (aqi <= 150) return 'Unhealthy for Sensitive Groups';
    if (aqi <= 200) return 'Unhealthy';
    if (aqi <= 300) return 'Very Unhealthy';
    return 'Hazardous';
  };

  const getSampleData = () => [
    { lat: 22.5726, lon: 88.3639, aqi: 279, station: { name: 'Kolkata' } },
    { lat: 28.6139, lon: 77.2090, aqi: 256, station: { name: 'Delhi' } },
    { lat: 19.0760, lon: 72.8777, aqi: 268, station: { name: 'Mumbai' } },
    { lat: 12.9716, lon: 77.5946, aqi: 227, station: { name: 'Bangalore' } },
    { lat: 13.0827, lon: 80.2707, aqi: 249, station: { name: 'Chennai' } },
    { lat: 40.7128, lon: -74.0060, aqi: 45, station: { name: 'New York' } },
    { lat: 51.5074, lon: -0.1278, aqi: 38, station: { name: 'London' } },
    { lat: 35.6762, lon: 139.6503, aqi: 42, station: { name: 'Tokyo' } },
  ];

  return (
    <div className="relative w-full h-full">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-950/80 z-20">
          <div className="text-center text-white">
            <Loader2 className="h-12 w-12 mx-auto mb-4 animate-spin text-cyan-400" />
            <p className="text-lg font-semibold">Loading AQI Heatmap...</p>
            <p className="text-sm text-slate-400 mt-2">Fetching real-time air quality data worldwide</p>
          </div>
        </div>
      )}
      
      <div 
        ref={mapRef} 
        style={{
          width: '100%',
          height: '100%',
          minHeight: '100vh',
          backgroundColor: '#f0f0f0'
        }}
      />
      
      {/* AQI Legend */}
      <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg p-4 shadow-lg z-10">
        <h3 className="font-semibold text-sm mb-2 text-gray-800">AQI Levels</h3>
        <div className="space-y-1 text-xs">
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
            <span className="text-gray-700">Good (0-50)</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
            <span className="text-gray-700">Moderate (51-100)</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-orange-500 mr-2"></div>
            <span className="text-gray-700">USG (101-150)</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
            <span className="text-gray-700">Unhealthy (151-200)</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-purple-500 mr-2"></div>
            <span className="text-gray-700">Very Unhealthy (201-300)</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-red-800 mr-2"></div>
            <span className="text-gray-700">Hazardous (300+)</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AQISimple;
