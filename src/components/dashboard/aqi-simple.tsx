"use client";

import { useEffect, useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';

const AQISimple = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [aqiData, setAqiData] = useState<any[]>([]);
  const [mapError, setMapError] = useState<string | null>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    let isMounted = true;
    let mapInitialized = false;

    const fetchAQIData = async () => {
      try {
        console.log('Fetching real-time AQI data...');
        
        // Try to fetch real AQI data first
        const token = process.env.NEXT_PUBLIC_WAQI_TOKEN || 'demo';
        if (token !== 'demo') {
          try {
            const response = await fetch(
              `https://api.waqi.info/map/bounds/?token=${token}&latlng=-90,-180,90,180&lang=en`
            );
            
            if (response.ok) {
              const data = await response.json();
              if (data.data && Array.isArray(data.data)) {
                const validPoints = data.data
                  .filter((item: any) => 
                    item.aqi && 
                    item.lat && 
                    item.lon && 
                    item.station && 
                    item.station.name
                  )
                  .slice(0, 300); // Show more data points
                
                if (isMounted && validPoints.length > 0) {
                  setAqiData(validPoints);
                  console.log(`Loaded ${validPoints.length} real-time AQI data points`);
                  return;
                }
              }
            }
          } catch (error) {
            console.log('Real-time API failed, using sample data');
          }
        }
        
        // Fallback to comprehensive sample data
        if (isMounted) {
          const sampleData = getComprehensiveSampleData();
          setAqiData(sampleData);
          console.log(`Using ${sampleData.length} sample AQI data points`);
        }
        
      } catch (error) {
        console.error('Failed to fetch AQI data:', error);
        if (isMounted) {
          setAqiData(getComprehensiveSampleData());
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    const initMap = async () => {
      // Prevent multiple initializations
      if (mapInitialized || mapInstanceRef.current) {
        console.log('Map already initialized, skipping...');
        return;
      }

      try {
        console.log('Initializing map...');
        mapInitialized = true;
        
        // Import Leaflet
        const L = await import('leaflet');
        
        // Import Leaflet CSS with better error handling
        const loadLeafletCSS = () => {
          return new Promise<void>((resolve, reject) => {
            if (document.querySelector('link[href*="leaflet.css"]')) {
              resolve();
              return;
            }

            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
            
            link.onload = () => {
              console.log('Leaflet CSS loaded successfully');
              resolve();
            };
            
            link.onerror = () => {
              console.log('Failed to load Leaflet CSS from CDN, trying alternative...');
              // Try alternative CDN
              const altLink = document.createElement('link');
              altLink.rel = 'stylesheet';
              altLink.href = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.css';
              
              altLink.onload = () => {
                console.log('Leaflet CSS loaded from alternative CDN');
                resolve();
              };
              
              altLink.onerror = () => {
                console.log('All CDN attempts failed, using inline styles');
                // Add minimal inline styles as fallback
                const style = document.createElement('style');
                style.textContent = `
                  .leaflet-container { height: 100%; width: 100%; }
                  .leaflet-control-zoom { display: none; }
                  .leaflet-control-attribution { display: none; }
                `;
                document.head.appendChild(style);
                resolve();
              };
              
              document.head.appendChild(altLink);
            };
            
            document.head.appendChild(link);
          });
        };

        // Wait for CSS to load
        await loadLeafletCSS();
        await new Promise(resolve => setTimeout(resolve, 300));

        // Check if component is still mounted
        if (!isMounted || !mapRef.current) {
          console.log('Component unmounted during initialization, aborting...');
          return;
        }

        // Ensure container is properly sized
        if (mapRef.current) {
          mapRef.current.style.width = '100%';
          mapRef.current.style.height = '100%';
          mapRef.current.style.minHeight = '100vh';
          mapRef.current.style.backgroundColor = '#1e293b'; // Dark background
          
          console.log('Map container dimensions:', {
            width: mapRef.current.offsetWidth,
            height: mapRef.current.offsetHeight,
            style: mapRef.current.style.cssText
          });
        }

        // Create map with proper configuration
        const map = L.map(mapRef.current, {
          center: [20, 0],
          zoom: 2,
          zoomControl: true,
          attributionControl: false, // Hide attribution to avoid conflicts
          minZoom: 1,
          maxZoom: 18,
          preferCanvas: false,
          worldCopyJump: true,
          zoomSnap: 0.5,
          zoomDelta: 0.5,
        });

        if (!isMounted) {
          map.remove();
          return;
        }
        
        mapInstanceRef.current = map;

        // Create a completely self-contained map without external dependencies
        console.log('Creating self-contained map...');
        
        // Create a custom tile layer that generates its own tiles
        const createCustomTile = (coords: any) => {
          const canvas = document.createElement('canvas');
          canvas.width = 256;
          canvas.height = 256;
          const ctx = canvas.getContext('2d');
          
          if (ctx) {
            // Fill with dark background
            ctx.fillStyle = '#1e293b';
            ctx.fillRect(0, 0, 256, 256);
            
            // Draw grid lines
            ctx.strokeStyle = '#475569';
            ctx.lineWidth = 1;
            ctx.globalAlpha = 0.3;
            
            // Vertical lines
            for (let x = 0; x <= 256; x += 32) {
              ctx.beginPath();
              ctx.moveTo(x, 0);
              ctx.lineTo(x, 256);
              ctx.stroke();
            }
            
            // Horizontal lines
            for (let y = 0; y <= 256; y += 32) {
              ctx.beginPath();
              ctx.moveTo(0, y);
              ctx.lineTo(256, y);
              ctx.stroke();
            }
            
            // Add some subtle dots at intersections
            ctx.fillStyle = '#64748b';
            ctx.globalAlpha = 0.4;
            for (let x = 16; x < 256; x += 32) {
              for (let y = 16; y < 256; y += 32) {
                ctx.beginPath();
                ctx.arc(x, y, 1, 0, 2 * Math.PI);
                ctx.fill();
              }
            }
            
            // Add some continent-like shapes based on coordinates
            ctx.fillStyle = '#334155';
            ctx.globalAlpha = 0.2;
            
            // Simple continent representation
            const centerX = 128;
            const centerY = 128;
            const size = 80;
            
            ctx.beginPath();
            ctx.arc(centerX, centerY, size, 0, 2 * Math.PI);
            ctx.fill();
            
            // Add some variation based on coordinates
            if (coords.z > 3) {
              ctx.fillStyle = '#475569';
              ctx.globalAlpha = 0.1;
              ctx.beginPath();
              ctx.arc(centerX + 40, centerY - 30, 20, 0, 2 * Math.PI);
              ctx.fill();
              ctx.beginPath();
              ctx.arc(centerX - 50, centerY + 40, 25, 0, 2 * Math.PI);
              ctx.fill();
            }
          }
          
          return canvas.toDataURL();
        };
        
        // Create the custom tile layer
        const customTileLayer = L.tileLayer('', {
          tileSize: 256,
          maxZoom: 18,
          minZoom: 1,
          tms: false,
          zoomOffset: 0,
          detectRetina: false,
          getTileUrl: function(coords: any) {
            return createCustomTile(coords);
          }
        });
        
        // Add the custom layer to the map
        customTileLayer.addTo(map);
        console.log('Custom tile layer added successfully');

        // Try to add AQI overlay if token is available
        const token = process.env.NEXT_PUBLIC_WAQI_TOKEN;
        if (token && token !== 'demo') {
          try {
            const aqiLayer = L.tileLayer(
              `https://tiles.waqi.info/tiles/usepa-aqi/{z}/{x}/{y}.png?token=${token}`,
              {
                maxZoom: 15,
                opacity: 0.7,
                crossOrigin: true
              }
            );
            aqiLayer.addTo(map);
            console.log('AQI overlay layer added successfully');
          } catch (error) {
            console.log('AQI overlay tiles not available:', error);
          }
        }

        // Force map refresh multiple times
        const refreshMap = () => {
          if (map && isMounted && mapInstanceRef.current === map) {
            try {
              map.invalidateSize();
              map.setView(map.getCenter(), map.getZoom());
              console.log('Map refreshed successfully');
            } catch (error) {
              console.log('Error refreshing map:', error);
            }
          }
        };

        // Refresh map multiple times with delays
        setTimeout(refreshMap, 300);
        setTimeout(refreshMap, 800);
        setTimeout(refreshMap, 1500);

        // Add error handling for tile loading
        map.on('tileerror', (error: any) => {
          console.log('Tile loading error:', error);
          // Don't set error state since we're using custom tiles
        });

        map.on('load', () => {
          console.log('Map loaded successfully');
          setMapError(null);
        });

        // Debug: Check if map container has Leaflet classes
        setTimeout(() => {
          if (mapRef.current && isMounted) {
            const hasLeafletClasses = mapRef.current.classList.contains('leaflet-container');
            const hasTilePane = mapRef.current.querySelector('.leaflet-tile-pane');
            console.log('Map container check:', {
              hasLeafletClasses,
              hasTilePane: !!hasTilePane,
              containerHTML: mapRef.current.innerHTML.substring(0, 200) + '...'
            });
          }
        }, 1000);

        console.log('Map initialization completed');

      } catch (error) {
        console.error('Failed to initialize map:', error);
        mapInitialized = false;
        if (isMounted) {
          setMapError('Failed to load map. Please check your internet connection.');
          setIsLoading(false);
        }
      }
    };

    // Initialize map first, then fetch data
    initMap().then(() => {
      if (isMounted) {
        fetchAQIData();
      }
    });

    return () => {
      isMounted = false;
      mapInitialized = false;
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove();
          mapInstanceRef.current = null;
        } catch (error) {
          console.log('Error cleaning up map:', error);
        }
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
        const size = Math.max(8, Math.min(20, aqi / 25));
        
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
        const cityName = point.station?.name || point.city || 'Unknown City';
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

  const getComprehensiveSampleData = () => [
    // India
    { lat: 22.5726, lon: 88.3639, aqi: 279, station: { name: 'Kolkata' } },
    { lat: 28.6139, lon: 77.2090, aqi: 256, station: { name: 'Delhi' } },
    { lat: 19.0760, lon: 72.8777, aqi: 268, station: { name: 'Mumbai' } },
    { lat: 12.9716, lon: 77.5946, aqi: 227, station: { name: 'Bangalore' } },
    { lat: 13.0827, lon: 80.2707, aqi: 249, station: { name: 'Chennai' } },
    { lat: 17.3850, lon: 78.4867, aqi: 198, station: { name: 'Hyderabad' } },
    { lat: 26.8467, lon: 80.9462, aqi: 234, station: { name: 'Lucknow' } },
    { lat: 23.0225, lon: 72.5714, aqi: 189, station: { name: 'Ahmedabad' } },
    { lat: 25.2048, lon: 55.2708, aqi: 156, station: { name: 'Dubai' } },
    
    // Asia
    { lat: 35.6762, lon: 139.6503, aqi: 42, station: { name: 'Tokyo' } },
    { lat: 39.9042, lon: 116.4074, aqi: 89, station: { name: 'Beijing' } },
    { lat: 31.2304, lon: 121.4737, aqi: 67, station: { name: 'Shanghai' } },
    { lat: 37.5665, lon: 126.9780, aqi: 78, station: { name: 'Seoul' } },
    { lat: 1.3521, lon: 103.8198, aqi: 45, station: { name: 'Singapore' } },
    { lat: 13.7563, lon: 100.5018, aqi: 123, station: { name: 'Bangkok' } },
    { lat: 14.0583, lon: 108.2772, aqi: 145, station: { name: 'Hanoi' } },
    { lat: 10.8231, lon: 106.6297, aqi: 134, station: { name: 'Ho Chi Minh City' } },
    
    // Europe
    { lat: 51.5074, lon: -0.1278, aqi: 38, station: { name: 'London' } },
    { lat: 48.8566, lon: 2.3522, aqi: 52, station: { name: 'Paris' } },
    { lat: 52.5200, lon: 13.4050, aqi: 41, station: { name: 'Berlin' } },
    { lat: 41.9028, lon: 12.4964, aqi: 67, station: { name: 'Rome' } },
    { lat: 40.4168, lon: -3.7038, aqi: 58, station: { name: 'Madrid' } },
    { lat: 52.3676, lon: 4.9041, aqi: 43, station: { name: 'Amsterdam' } },
    { lat: 55.6761, lon: 12.5683, aqi: 39, station: { name: 'Copenhagen' } },
    { lat: 59.3293, lon: 18.0686, aqi: 35, station: { name: 'Stockholm' } },
    { lat: 60.1699, lon: 24.9384, aqi: 32, station: { name: 'Helsinki' } },
    
    // North America
    { lat: 40.7128, lon: -74.0060, aqi: 45, station: { name: 'New York' } },
    { lat: 34.0522, lon: -118.2437, aqi: 67, station: { name: 'Los Angeles' } },
    { lat: 41.8781, lon: -87.6298, aqi: 58, station: { name: 'Chicago' } },
    { lat: 29.7604, lon: -95.3698, aqi: 72, station: { name: 'Houston' } },
    { lat: 33.7490, lon: -84.3880, aqi: 63, station: { name: 'Atlanta' } },
    { lat: 43.6532, lon: -79.3832, aqi: 41, station: { name: 'Toronto' } },
    { lat: 45.5017, lon: -73.5673, aqi: 38, station: { name: 'Montreal' } },
    { lat: 49.2827, lon: -123.1207, aqi: 35, station: { name: 'Vancouver' } },
    
    // South America
    { lat: -23.5505, lon: -46.6333, aqi: 89, station: { name: 'São Paulo' } },
    { lat: -34.6118, lon: -58.3960, aqi: 76, station: { name: 'Buenos Aires' } },
    { lat: -12.9716, lon: -77.0046, aqi: 67, station: { name: 'Lima' } },
    { lat: 4.7110, lon: -74.0721, aqi: 78, station: { name: 'Bogotá' } },
    { lat: -33.4489, lon: -70.6693, aqi: 72, station: { name: 'Santiago' } },
    
    // Africa
    { lat: -26.2041, lon: 28.0473, aqi: 89, station: { name: 'Johannesburg' } },
    { lat: 30.0444, lon: 31.2357, aqi: 134, station: { name: 'Cairo' } },
    { lat: 6.5244, lon: 3.3792, aqi: 156, station: { name: 'Lagos' } },
    { lat: -1.2921, lon: 36.8219, aqi: 123, station: { name: 'Nairobi' } },
    { lat: 33.9716, lon: -6.8498, aqi: 98, station: { name: 'Rabat' } },
    
    // Oceania
    { lat: -33.8688, lon: 151.2093, aqi: 45, station: { name: 'Sydney' } },
    { lat: -37.8136, lon: 144.9631, aqi: 52, station: { name: 'Melbourne' } },
    { lat: -41.2866, lon: 174.7756, aqi: 38, station: { name: 'Wellington' } },
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

      {mapError && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-950/80 z-20">
          <div className="text-center text-white bg-red-900/50 p-6 rounded-lg">
            <p className="text-lg font-semibold text-red-200 mb-2">Map Loading Error</p>
            <p className="text-sm text-red-100 mb-4">{mapError}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-md text-white font-medium"
            >
              Refresh Page
            </button>
          </div>
        </div>
      )}
      
      <div 
        ref={mapRef} 
        className="aqi-map-container"
        style={{
          width: '100%',
          height: '100%',
          minHeight: '100vh',
          backgroundColor: '#1e293b'
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
