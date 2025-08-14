"use client";

import { useEffect, useRef } from 'react';

const AQIHeatmap = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    let isMounted = true;
    let baseLayer: any;
    let aqiLayer: any;

    const init = async () => {
      if (!containerRef.current || mapRef.current) return;
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

      const handleResize = () => {
        map.invalidateSize();
      };
      window.addEventListener('resize', handleResize);

      const handleFocusMap = (e: Event) => {
        const evt = e as CustomEvent<{ lat: number; lon: number; zoom?: number }>;
        const { lat, lon, zoom } = (evt.detail || {}) as any;
        if (typeof lat === 'number' && typeof lon === 'number') {
          map.setView([lat, lon], typeof zoom === 'number' ? zoom : Math.max(map.getZoom(), 8));
        }
      };
      window.addEventListener('focus-map', handleFocusMap as EventListener);

      return () => {
        window.removeEventListener('resize', handleResize);
        window.removeEventListener('focus-map', handleFocusMap as EventListener);
      };
    };

    const cleanupPromise = init();

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
          map.remove();
        }
      } finally {
        mapRef.current = null;
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{ position: 'fixed', inset: 0, zIndex: 0 }}
      aria-hidden="true"
    />
  );
};

export default AQIHeatmap;
