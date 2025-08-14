"use client";

import { useEffect, useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';

const AQIFullscreen = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    let baseLayer: any;
    let aqiLayer: any;
    let markersLayer: any;

    const initMap = async () => {
      if (!containerRef.current || mapRef.current) return;
      
      console.log('Initializing fullscreen AQI heatmap...');
      console.log('Container dimensions:', {
        width: containerRef.current.offsetWidth,
        height: containerRef.current.offsetHeight,
        clientWidth: containerRef.current.clientWidth,
        clientHeight: containerRef.current.clientHeight
      });
      setIsLoading(true);
      
      try {
        const L = await import('leaflet');
        console.log('Leaflet loaded, creating map...');
        
        const map = L.map(containerRef.current, {
          zoomControl: true,
          attributionControl: true,
          center: [20, 0],
          zoom: 2,
          preferCanvas: false, // Changed to false for better compatibility
          worldCopyJump: true,
          maxZoom: 15,
          minZoom: 1,
          maxBounds: [[-90, -180], [90, 180]],
          maxBoundsViscosity: 1.0
        });

        if (!isMounted) return;
        mapRef.current = map;
        
        console.log('Map created successfully:', map);

        // Base map layer with fallback
        try {
          baseLayer = L.tileLayer(
            'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
            {
              subdomains: 'abcd',
              maxZoom: 15,
              opacity: 0.6
            }
          ).addTo(map);
        } catch (error) {
          console.log('Falling back to OpenStreetMap tiles');
          baseLayer = L.tileLayer(
            'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
            {
              maxZoom: 15,
              opacity: 0.8
            }
          ).addTo(map);
        }

        // AQI tile layer
        const token = process.env.NEXT_PUBLIC_WAQI_TOKEN || 'demo';
        aqiLayer = L.tileLayer(
          `https://tiles.waqi.info/tiles/usepa-aqi/{z}/{x}/{y}.png?token=${token}`,
          {
            maxZoom: 15,
            opacity: 0.85
          }
        ).addTo(map);

        // Add live AQI data points
        try {
          console.log('Fetching AQI data points...');
          const boundsUrl = `https://api.waqi.info/map/bounds/?token=${token}&latlng=-90,-180,90,180`;
          const response = await fetch(boundsUrl);
          if (response.ok) {
            const data = await response.json();
            if (data.data && Array.isArray(data.data)) {
              const points = data.data
                .filter((item: any) => item.aqi && item.lat && item.lon)
                .slice(0, 100);
              
              console.log(`Found ${points.length} AQI data points`);
              
              markersLayer = L.layerGroup();
              
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
              console.log('AQI markers added to map');
            }
          }
        } catch (error) {
          console.error('Failed to fetch AQI data:', error);
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
              map.setView([20, 0], 2);
              console.log('Map using fallback view: [20, 0]');
            },
            { enableHighAccuracy: false, timeout: 3000 }
          );
        } else {
          map.setView([20, 0], 2);
          console.log('Map using default view: [20, 0]');
        }

        setIsLoading(false);
        console.log('Map initialization complete');

        // Force map refresh multiple times to ensure proper display
        setTimeout(() => {
          if (map && isMounted) {
            map.invalidateSize();
            console.log('Map size invalidated - first attempt');
          }
        }, 100);
        
        setTimeout(() => {
          if (map && isMounted) {
            map.invalidateSize();
            map.setView(map.getCenter(), map.getZoom());
            console.log('Map size invalidated - second attempt');
          }
        }, 500);
        
        setTimeout(() => {
          if (map && isMounted) {
            map.invalidateSize();
            console.log('Map size invalidated - final attempt');
          }
        }, 1000);

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
            width: '100vw', 
            height: '100vh',
            position: 'absolute',
            top: 0,
            left: 0
          }}
        />
    </div>
  );
};

export default AQIFullscreen;
