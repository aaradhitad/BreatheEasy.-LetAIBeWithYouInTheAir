"use client";

import { useEffect, useRef, useState } from 'react';

const AQIHeatmap = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    let isMounted = true;
    let baseLayer: any;
    let aqiLayer: any;
    let resizeHandler: (() => void) | null = null;
    let focusHandler: ((e: Event) => void) | null = null;

    const init = async () => {
      // Prevent multiple initializations
      if (!containerRef.current || mapRef.current || isInitialized) {
        return;
      }

      try {
        const L = await import('leaflet');

        // Check if container already has a map
        if (containerRef.current._leaflet_id) {
          return;
        }

        const map = L.map(containerRef.current, {
          zoomControl: false,
          attributionControl: false,
          center: [20, 0],
          zoom: 2,
          preferCanvas: true,
          worldCopyJump: true
        });

        if (!isMounted) {
          map.remove();
          return;
        }

        mapRef.current = map;
        setIsInitialized(true);

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

        if ('geolocation' in navigator) {
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              if (isMounted && mapRef.current) {
                const { latitude, longitude } = pos.coords;
                mapRef.current.setView([latitude, longitude], 8);
              }
            },
            () => {},
            { enableHighAccuracy: true, timeout: 5000 }
          );
        }

        resizeHandler = () => {
          if (mapRef.current) {
            mapRef.current.invalidateSize();
          }
        };
        window.addEventListener('resize', resizeHandler);

        focusHandler = (e: Event) => {
          if (!mapRef.current) return;
          const evt = e as CustomEvent<{ lat: number; lon: number; zoom?: number }>;
          const { lat, lon, zoom } = (evt.detail || {}) as any;
          if (typeof lat === 'number' && typeof lon === 'number') {
            mapRef.current.setView([lat, lon], typeof zoom === 'number' ? zoom : Math.max(mapRef.current.getZoom(), 8));
          }
        };
        window.addEventListener('focus-map', focusHandler as EventListener);

      } catch (error) {
        console.error('Error initializing AQI heatmap:', error);
      }
    };

    init();

    return () => {
      isMounted = false;
      
      // Clean up event listeners
      if (resizeHandler) {
        window.removeEventListener('resize', resizeHandler);
      }
      if (focusHandler) {
        window.removeEventListener('focus-map', focusHandler as EventListener);
      }

      // Clean up map
      const map = mapRef.current;
      if (map) {
        try {
          if (baseLayer) {
            map.removeLayer(baseLayer);
          }
          if (aqiLayer) {
            map.removeLayer(aqiLayer);
          }
          map.remove();
        } catch (error) {
          console.error('Error cleaning up map:', error);
        } finally {
          mapRef.current = null;
          setIsInitialized(false);
        }
      }
    };
  }, [isInitialized]);

  return (
    <div
      ref={containerRef}
      style={{ position: 'fixed', inset: 0, zIndex: 0 }}
      aria-hidden="true"
    />
  );
};

export default AQIHeatmap;
