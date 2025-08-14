"use client";

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Map, X, Maximize2 } from 'lucide-react';

const AQIHeatmapCard = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const [mapInitialized, setMapInitialized] = useState(false);

  useEffect(() => {
    let isMounted = true;
    let baseLayer: any;
    let aqiLayer: any;

    const initMap = async () => {
      if (!containerRef.current || mapRef.current || !isExpanded) return;
      
      try {
        const L = await import('leaflet');
        
        const map = L.map(containerRef.current, {
          zoomControl: false,
          attributionControl: false,
          center: [20, 0],
          zoom: 2,
          preferCanvas: true,
          worldCopyJump: true
        });

        if (!isMounted) return;
        mapRef.current = map;

        baseLayer = L.tileLayer(
          'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
          {
            subdomains: 'abcd',
            maxZoom: 19,
            opacity: 0.6
          }
        ).addTo(map);

        const token = process.env.NEXT_PUBLIC_WAQI_TOKEN || 'demo';
        aqiLayer = L.tileLayer(
          `https://tiles.waqi.info/tiles/usepa-aqi/{z}/{x}/{y}.png?token=${token}`,
          {
            maxZoom: 19,
            opacity: 0.85
          }
        ).addTo(map);

        // Add zoom controls
        L.control.zoom({
          position: 'bottomright'
        }).addTo(map);

        // Add attribution
        L.control.attribution({
          position: 'bottomleft'
        }).addTo(map);

        if ('geolocation' in navigator) {
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              const { latitude, longitude } = pos.coords;
              map.setView([latitude, longitude], 8);
            },
            () => {},
            { enableHighAccuracy: true, timeout: 5000 }
          );
        }

        setMapInitialized(true);

        const handleResize = () => {
          map.invalidateSize();
        };
        window.addEventListener('resize', handleResize);

        return () => {
          window.removeEventListener('resize', handleResize);
        };
      } catch (error) {
        console.error('Failed to initialize map:', error);
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

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  if (isExpanded) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-950">
        <div className="absolute top-4 right-4 z-10 flex gap-2">
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
        <div
          ref={containerRef}
          className="w-full h-full"
          style={{ position: 'absolute', inset: 0 }}
        />
      </div>
    );
  }

  return (
    <Card className="bg-slate-900/70 backdrop-blur-md border-slate-700">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg text-cyan-400 flex items-center gap-2">
            <Map className="h-5 w-5" />
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
            <Map className="h-12 w-12 mx-auto mb-2 opacity-50" />
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

export default AQIHeatmapCard;
