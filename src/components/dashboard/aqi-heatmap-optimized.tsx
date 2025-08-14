"use client";

import { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapIcon, X, Maximize2, Loader2 } from 'lucide-react';

// Preload Leaflet to avoid dynamic import delay
let leafletPromise: Promise<any> | null = null;
const preloadLeaflet = () => {
  if (!leafletPromise) {
    leafletPromise = import('leaflet');
  }
  return leafletPromise;
};

const AQIHeatmapOptimized = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const [mapInitialized, setMapInitialized] = useState(false);

  // Preload Leaflet when component mounts
  useEffect(() => {
    preloadLeaflet();
  }, []);

  useEffect(() => {
    let isMounted = true;
    let baseLayer: any;
    let aqiLayer: any;

    const initMap = async () => {
      if (!containerRef.current || mapRef.current || !isExpanded) return;
      
      console.log('Initializing AQI heatmap...', { 
        container: containerRef.current, 
        expanded: isExpanded 
      });
      
      setIsLoading(true);
      
      // Small delay to ensure DOM is ready
      await new Promise(resolve => setTimeout(resolve, 100));
      
      try {
        const L = await preloadLeaflet();
        
        console.log('Leaflet loaded, creating map...');
        
        const map = L.map(containerRef.current, {
          zoomControl: false,
          attributionControl: false,
          center: [20, 0],
          zoom: 2,
          preferCanvas: true,
          worldCopyJump: true,
          // Performance optimizations
          renderer: L.canvas(),
          maxZoom: 15, // Limit max zoom for better performance
        });

        if (!isMounted) return;
        mapRef.current = map;
        
        console.log('Map created successfully:', map);

        // Use faster tile service
        baseLayer = L.tileLayer(
          'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
          {
            subdomains: 'abcd',
            maxZoom: 15,
            opacity: 0.6,
            // Performance options
            updateWhenIdle: true,
            updateWhenZooming: false,
          }
        ).addTo(map);

        const token = process.env.NEXT_PUBLIC_WAQI_TOKEN || 'demo';
        
        // Add AQI layer with performance optimizations
        aqiLayer = L.tileLayer(
          `https://tiles.waqi.info/tiles/usepa-aqi/{z}/{x}/{y}.png?token=${token}`,
          {
            maxZoom: 15,
            opacity: 0.85,
            // Performance options
            updateWhenIdle: true,
            updateWhenZooming: false,
            // Add error handling
            errorTileUrl: 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'
          }
        ).addTo(map);

        // Add live AQI data points
        try {
          const boundsUrl = `https://api.waqi.info/map/bounds/?token=${token}&latlng=-90,-180,90,180`;
          const response = await fetch(boundsUrl);
          if (response.ok) {
            const data = await response.json();
            if (data.data && Array.isArray(data.data)) {
              const points = data.data
                .filter((item: any) => item.aqi && item.lat && item.lon)
                .slice(0, 100); // Limit to 100 points for performance
              
              const markersLayer = L.layerGroup();
              
              points.forEach((point: any) => {
                const aqi = Number(point.aqi);
                const color = getAQIColor(aqi);
                const size = Math.max(6, Math.min(12, aqi / 30));
                
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
                    background: rgba(0,0,0,0.8); 
                    color: white; 
                    border-radius: 50%; 
                    width: ${size * 2}px; 
                    height: ${size * 2}px; 
                    display: flex; 
                    align-items: center; 
                    justify-content: center; 
                    font-size: ${Math.max(8, size - 2)}px; 
                    font-weight: bold;
                    border: 1px solid white;
                  ">${aqi}</div>`,
                  iconSize: [size * 2, size * 2],
                  iconAnchor: [size, size]
                });

                const textMarker = L.marker([point.lat, point.lon], { icon: text });
                markersLayer.addLayer(marker);
                markersLayer.addLayer(textMarker);
              });

              markersLayer.addTo(map);
            }
          }
        } catch (error) {
          console.error('Failed to fetch global AQI data:', error);
        }

        // Add zoom controls
        L.control.zoom({
          position: 'bottomright'
        }).addTo(map);

        // Add attribution
        L.control.attribution({
          position: 'bottomleft'
        }).addTo(map);

        // Center on user location if available
        if ('geolocation' in navigator) {
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              const { latitude, longitude } = pos.coords;
              map.setView([latitude, longitude], 8);
              console.log('Map centered on user location:', [latitude, longitude]);
            },
            () => {
              // Fallback to a good default view
              map.setView([20, 0], 2);
              console.log('Map using fallback view: [20, 0]');
            },
            { enableHighAccuracy: false, timeout: 3000 } // Reduced timeout
          );
        } else {
          // Default view if geolocation not available
          map.setView([20, 0], 2);
          console.log('Map using default view: [20, 0]');
        }

        setMapInitialized(true);
        setIsLoading(false);

        // Force map refresh to ensure proper display
        setTimeout(() => {
          if (map && isMounted) {
            map.invalidateSize();
            map.setView(map.getCenter(), map.getZoom());
          }
        }, 200);

        const handleResize = () => {
          map.invalidateSize();
        };
        window.addEventListener('resize', handleResize);

        return () => {
          window.removeEventListener('resize', handleResize);
        };
      } catch (error) {
        console.error('Failed to initialize map:', error);
        setIsLoading(false);
      }
    };

    if (isExpanded) {
      const cleanupPromise = initMap();
      return () => {
        if (cleanupPromise && typeof (cleanupPromise as any) === 'function') {
          try { (cleanupPromise as any)(); } catch {}
        }
      };
    }
  }, [isExpanded]);

  useEffect(() => {
    if (!isExpanded && mapRef.current) {
      try {
        mapRef.current.remove();
        mapRef.current = null;
        setMapInitialized(false);
      } catch (error) {
        console.error('Failed to cleanup map:', error);
      }
    }
  }, [isExpanded]);

  const getAQIColor = (aqi: number): string => {
    if (aqi <= 50) return '#22c55e';      // Good - Green
    if (aqi <= 100) return '#eab308';     // Moderate - Yellow
    if (aqi <= 150) return '#f97316';     // USG - Orange
    if (aqi <= 200) return '#ef4444';     // Unhealthy - Red
    if (aqi <= 300) return '#a855f7';     // Very Unhealthy - Purple
    return '#7f1d1d';                     // Hazardous - Dark Red
  };

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  if (isExpanded) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-950">
        <div className="absolute top-4 right-4 z-10">
          <Button
            onClick={toggleExpanded}
            variant="outline"
            size="sm"
            className="bg-slate-800/80 border-slate-600 text-white hover:bg-slate-700"
          >
            <X className="h-4 w-4 mr-2" />
            Close
          </Button>
        </div>
        
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-950/80 z-20">
            <div className="text-center text-white">
              <Loader2 className="h-12 w-12 mx-auto mb-4 animate-spin text-cyan-400" />
              <p className="text-lg font-semibold">Loading AQI Heatmap...</p>
              <p className="text-sm text-slate-400 mt-2">Fetching real-time air quality data</p>
            </div>
          </div>
        )}
        
        <div
          ref={containerRef}
          className="w-full h-full"
          style={{ 
            position: 'absolute', 
            inset: 0, 
            zIndex: 1,
            minHeight: '100vh',
            minWidth: '100vw'
          }}
        />
      </div>
    );
  }

  return (
    <Card className="bg-slate-900/70 backdrop-blur-md border-slate-700">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg text-cyan-400 flex items-center gap-2">
            <MapIcon className="h-5 w-5" />
            AQI Heat Map
          </CardTitle>
          <Button
            onClick={toggleExpanded}
            variant="ghost"
            size="sm"
            className="text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <Maximize2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="aspect-video bg-slate-800 rounded-lg flex items-center justify-center border border-slate-600">
          <div className="text-center text-slate-400">
            <MapIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Click to view full AQI heat map</p>
            <p className="text-xs mt-1">Global air quality visualization</p>
          </div>
        </div>
        <div className="mt-3 text-xs text-slate-400">
          Shows real-time air quality data across different regions
        </div>
      </CardContent>
    </Card>
  );
};

export default AQIHeatmapOptimized;
