"use client";

import React, { useEffect, useRef } from "react";

export default function DarkMapBackgroundInner() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !mapRef.current) return;

    const initMap = async () => {
      try {
        console.log('Initializing dark map background...');
        
        // Check if Leaflet is available
        if (typeof window === "undefined") {
          console.log('Window not available, skipping map initialization');
          return;
        }
        
        // Dynamically import Leaflet
        let L;
        try {
          L = await import("leaflet");
          console.log('Leaflet imported successfully');
        } catch (importError) {
          console.error('Failed to import Leaflet:', importError);
          throw new Error('Leaflet library not available');
        }
        
        // Import Leaflet CSS
        if (!document.querySelector('link[href*="leaflet.css"]')) {
          const link = document.createElement('link');
          link.rel = 'stylesheet';
          link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
          document.head.appendChild(link);
          console.log('Leaflet CSS added to head');
          
          // Wait for CSS to load
          await new Promise(resolve => {
            link.onload = resolve;
            link.onerror = () => {
              console.error('Failed to load Leaflet CSS');
              resolve(null);
            };
            // Fallback timeout
            setTimeout(resolve, 500);
          });
        } else {
          console.log('Leaflet CSS already loaded');
        }

        // Additional wait to ensure CSS is applied
        await new Promise(resolve => setTimeout(resolve, 200));

        if (!mapRef.current) {
          console.error('Map ref is null after CSS load');
          return;
        }

        // Debug: Check container dimensions
        const container = mapRef.current;
        const rect = container.getBoundingClientRect();
        console.log('Container dimensions before map init:', rect.width, 'x', rect.height);
        console.log('Container styles:', container.style.width, container.style.height);
        console.log('Container classes:', container.className);

        // Ensure container has dimensions
        if (rect.width === 0 || rect.height === 0) {
          console.warn('Container has zero dimensions, setting explicit size');
          container.style.width = '100vw';
          container.style.height = '100vh';
          container.style.minHeight = '100vh';
        }

        console.log('Creating map instance...');
        
        // Initialize map with basic settings
        const map = L.map(mapRef.current, {
          center: [20.5937, 78.9629], // Center of India
          zoom: 5,
          zoomControl: false,
          attributionControl: false,
          dragging: false,
          touchZoom: false,
          scrollWheelZoom: false,
          doubleClickZoom: false,
          boxZoom: false,
          keyboard: false,
          tap: false,
        });

        console.log('Map instance created');

        // Debug: Check if Leaflet classes are applied
        setTimeout(() => {
          if (container) {
            const afterRect = container.getBoundingClientRect();
            console.log('Container dimensions after map init:', afterRect.width, 'x', afterRect.height);
            console.log('Container classes after map init:', container.className);
            console.log('Container children:', container.children.length);
            
            // Check if Leaflet classes are present
            const hasLeafletClass = container.className.includes('leaflet');
            console.log('Has Leaflet class:', hasLeafletClass);
          }
        }, 100);

        // Add basic tiles first to test
        try {
          const basicTiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            opacity: 0.4,
          });
          basicTiles.addTo(map);
          console.log('Basic tiles added successfully');
          
          // Store map instance
          mapInstanceRef.current = map;
          
          // Force refresh
          setTimeout(() => {
            if (map && map.invalidateSize) {
              map.invalidateSize();
              console.log('Map size invalidated');
            }
          }, 200);
          
          console.log('Map initialization completed successfully');
          
        } catch (error) {
          console.error('Failed to add tiles:', error);
          throw error;
        }

      } catch (error) {
        console.error('Failed to initialize dark map background:', error);
        // Fallback to gradient background
        if (mapRef.current) {
          mapRef.current.innerHTML = '';
          mapRef.current.className = 'fixed inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 z-0';
          console.log('Fallback gradient background applied');
        }
      }
    };

    // Add a small delay to ensure DOM is ready
    const timer = setTimeout(initMap, 100);
    
    return () => {
      clearTimeout(timer);
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove();
        } catch (error) {
          console.error('Error removing map:', error);
        }
      }
    };
  }, []);

  return (
    <>
      <div
        ref={mapRef}
        className="fixed inset-0 z-0"
        style={{
          width: '100vw',
          height: '100vh',
          minHeight: '100vh',
          backgroundColor: '#0f172a', // Fallback color while loading
        }}
        aria-hidden="true"
      />
      {/* Subtle gradient overlay for better content readability */}
      <div className="fixed inset-0 z-0 bg-gradient-to-br from-slate-950/20 via-transparent to-slate-900/30 pointer-events-none" />
      
      {/* Fallback background pattern */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 opacity-60"></div>
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 25% 25%, rgba(59, 130, 246, 0.1) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(147, 51, 234, 0.1) 0%, transparent 50%)',
        }}></div>
      </div>
      
      {/* Loading indicator */}
      <div className="fixed inset-0 z-0 flex items-center justify-center pointer-events-none">
        <div className="text-slate-500 text-xs opacity-70">Loading dark map...</div>
      </div>
    </>
  );
}
