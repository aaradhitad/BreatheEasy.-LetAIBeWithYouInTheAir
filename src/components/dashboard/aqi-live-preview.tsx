"use client";

import { useEffect, useRef } from "react";
import { Badge } from "@/components/ui/badge";

export function AQILivePreview() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = 280;
    canvas.height = 120;

    // Create a mini map preview
    const drawMiniMap = () => {
      // Clear canvas
      ctx.fillStyle = '#0f172a'; // slate-900
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw grid pattern
      ctx.strokeStyle = '#334155'; // slate-600
      ctx.lineWidth = 0.5;
      
      // Vertical lines
      for (let x = 0; x <= canvas.width; x += 20) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      
      // Horizontal lines
      for (let y = 0; y <= canvas.height; y += 20) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // Draw some sample AQI points
      const samplePoints = [
        { x: 50, y: 30, aqi: 45, color: '#10b981' },   // Green - Good
        { x: 120, y: 45, aqi: 78, color: '#f59e0b' },  // Orange - Moderate
        { x: 200, y: 60, aqi: 125, color: '#ef4444' }, // Red - Unhealthy
        { x: 80, y: 80, aqi: 35, color: '#3b82f6' },   // Blue - Good
        { x: 180, y: 25, aqi: 95, color: '#f97316' },  // Orange - Moderate
      ];

      samplePoints.forEach(point => {
        // Draw circle
        ctx.fillStyle = point.color;
        ctx.beginPath();
        ctx.arc(point.x, point.y, 6, 0, 2 * Math.PI);
        ctx.fill();
        
        // Draw border
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 1;
        ctx.stroke();
        
        // Draw AQI number
        ctx.fillStyle = '#ffffff';
        ctx.font = '10px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(point.aqi.toString(), point.x, point.y + 3);
      });

      // Draw legend
      const legendItems = [
        { color: '#10b981', label: 'Good' },
        { color: '#f59e0b', label: 'Moderate' },
        { color: '#ef4444', label: 'Unhealthy' }
      ];

      legendItems.forEach((item, index) => {
        const y = 100 + (index * 15);
        
        // Color dot
        ctx.fillStyle = item.color;
        ctx.beginPath();
        ctx.arc(20 + (index * 80), y, 4, 0, 2 * Math.PI);
        ctx.fill();
        
        // Label
        ctx.fillStyle = '#94a3b8';
        ctx.font = '10px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(item.label, 30 + (index * 80), y + 3);
      });
    };

    drawMiniMap();
  }, []);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-300">Live AQI Data</span>
          {/* Live indicator dot */}
          <div className="relative">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            <div className="absolute inset-0 w-2 h-2 bg-red-500 rounded-full animate-ping opacity-75"></div>
            <div className="absolute -inset-1 w-4 h-4 bg-red-500/20 rounded-full blur-sm"></div>
          </div>
        </div>
        <Badge variant="secondary" className="bg-green-500/20 text-green-400 border-green-500/30">
          Live
        </Badge>
      </div>
      
      <div className="relative">
        <canvas
          ref={canvasRef}
          className="w-full h-30 rounded-lg border border-slate-600 bg-slate-900"
          style={{ height: '120px' }}
        />
        
        {/* Overlay info */}
        <div className="absolute top-2 right-2 bg-slate-900/80 backdrop-blur-sm rounded px-2 py-1">
          <span className="text-xs text-slate-300">6 cities</span>
        </div>
      </div>
      
      <div className="text-xs text-slate-400 text-center">
        Click "View Full Heatmap" for detailed map
      </div>
    </div>
  );
}
