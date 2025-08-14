"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import type { AlertLog } from "../actions";

import { AqiCard } from "@/components/dashboard/aqi-card";
import { PollutantDetails } from "@/components/dashboard/pollutant-details";
import { WeatherDetails } from "@/components/dashboard/weather-details";
import { HealthRecommendations } from "@/components/dashboard/health-recommendations";
import { AlertHistory } from "@/components/dashboard/alert-history";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, MapPin, Heart, Share2, LogOut, Sun, Cloud, Wind, Droplets, Waves, X } from "lucide-react";
import { UVIndex } from "@/components/dashboard/uv-index";
import { Input } from "@/components/ui/input";
import dynamic from "next/dynamic";
const AQIHeatmap = dynamic(() => import("@/components/dashboard/aqi-heatmap"), { ssr: false });
import AQISimple from "@/components/dashboard/aqi-simple";
import CitySilhouetteBackground from "@/components/dashboard/city-silhouette";
import { AqiHistoryChart } from "@/components/dashboard/aqi-history";
import { AqiForecastChart } from "@/components/dashboard/aqi-forecast";
import { Mascot } from "@/components/dashboard/mascot";
import { WeatherAnimation } from "@/components/dashboard/weather-animation";
import { TopStatesSidebar } from "@/components/dashboard/top-cities";
import type { TopState } from "@/components/dashboard/top-cities";
import { AccountMenu } from "@/components/dashboard/account-menu";


const MOCK_DATA = {
    location: "Kolkata, West Bengal, India",
    aqi: 82,
    weatherConditions: "31°C, 75% Humidity, 14 km/h Wind, Thunder. Cloudy.",
};

interface User {
  name: string;
  username: string;
  healthConditions?: string;
}

export default function Dashboard() {
  const [history, setHistory] = useState<AlertLog[]>([]);
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [query, setQuery] = useState<string>("");
  const [locationName, setLocationName] = useState<string>(MOCK_DATA.location);
  const [aqi, setAqi] = useState<number>(MOCK_DATA.aqi);
  const [weatherStr, setWeatherStr] = useState<string>(MOCK_DATA.weatherConditions);
  const [weatherCurrent, setWeatherCurrent] = useState<{ temp?: number; humidity?: number; wind?: number; uv?: number; code?: number; isDay?: boolean }>({});
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [aqiHistory, setAqiHistory] = useState<{ date: string; value: number }[]>([]);
  const [aqiForecast, setAqiForecast] = useState<{ date: string; value: number }[]>([]);
  const [topStates, setTopStates] = useState<TopState[]>([]);
  const [countryName, setCountryName] = useState<string | null>(null);
  const [showHeatmap, setShowHeatmap] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('breatheEasyUser');
    if (!storedUser) {
      router.replace('/login');
    } else {
      const userData = JSON.parse(storedUser);
      
      // Handle migration for existing users who don't have username
      if (!userData.username) {
        // Generate a username from the name if it doesn't exist
        const generatedUsername = userData.name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
        const updatedUser = { ...userData, username: generatedUsername };
        localStorage.setItem('breatheEasyUser', JSON.stringify(updatedUser));
        setUser(updatedUser);
      } else {
        setUser(userData);
      }
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('breatheEasyUser');
    router.replace('/login');
  };

  const handleNewRecommendation = (log: AlertLog) => {
    setHistory((prevHistory) => [log, ...prevHistory]);
  };

  const focusMap = (lat: number, lon: number, zoom = 10) => {
    try {
      window.dispatchEvent(new CustomEvent('focus-map', { detail: { lat, lon, zoom } }));
    } catch {
      // no-op
    }
  };

  const geocodeAddress = async (address: string): Promise<{ lat: number; lon: number; display: string } | null> => {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&addressdetails=1&limit=1`;
    const res = await fetch(url, { headers: { 'Accept': 'application/json' } });
    if (!res.ok) return null;
    const data = await res.json() as any[];
    if (!Array.isArray(data) || data.length === 0) return null;
    const item = data[0] as any;
    const lat = Number(item.lat);
    const lon = Number(item.lon);
    const display = typeof item.display_name === 'string' ? item.display_name : `${lat.toFixed(3)}, ${lon.toFixed(3)}`;
    if (Number.isFinite(lat) && Number.isFinite(lon)) return { lat, lon, display };
    return null;
  };

  const fetchAqiByGeo = async (lat: number, lon: number): Promise<number | null> => {
    const token = process.env.NEXT_PUBLIC_WAQI_TOKEN || 'demo';
    const toAqi = (pmv: number) => {
      const scale = (C: number, Cl: number, Ch: number, Il: number, Ih: number) => ((Ih - Il) / (Ch - Cl)) * (C - Cl) + Il;
      if (pmv <= 12) return scale(pmv, 0, 12, 0, 50);
      if (pmv <= 35.4) return scale(pmv, 12.1, 35.4, 51, 100);
      if (pmv <= 55.4) return scale(pmv, 35.5, 55.4, 101, 150);
      if (pmv <= 150.4) return scale(pmv, 55.5, 150.4, 151, 200);
      if (pmv <= 250.4) return scale(pmv, 150.5, 250.4, 201, 300);
      if (pmv <= 350.4) return scale(pmv, 250.5, 350.4, 301, 400);
      return scale(pmv, 350.5, 500.4, 401, 500);
    };

    try {
      // Primary: WAQI feed by geo
      const url = `https://api.waqi.info/feed/geo:${lat};${lon}/?token=${token}`;
      const res = await fetch(url, { headers: { 'Accept': 'application/json' } });
      if (res.ok) {
        const json = await res.json() as any;
        const value = json?.data?.aqi;
        if (typeof value === 'number') return value;
        if (typeof value === 'string') {
          const parsed = Number(value);
          if (Number.isFinite(parsed)) return parsed;
        }
        const pm25 = json?.data?.iaqi?.pm25?.v;
        if (typeof pm25 === 'number' && Number.isFinite(pm25)) {
          return Math.round(toAqi(pm25));
        }
      }
    } catch {}

    try {
      // Fallback: nearest station within a small bounding box
      const south = lat - 0.3;
      const north = lat + 0.3;
      const west = lon - 0.3;
      const east = lon + 0.3;
      const boundsUrl = `https://api.waqi.info/map/bounds/?token=${token}&latlng=${south},${west},${north},${east}`;
      const r = await fetch(boundsUrl, { headers: { 'Accept': 'application/json' } });
      if (r.ok) {
        const j = await r.json() as any;
        const arr: any[] = Array.isArray(j?.data) ? j.data : [];
        if (arr.length > 0) {
          // pick nearest
          let best: { aqi: number } | null = null;
          let bestDist = Infinity;
          for (const s of arr) {
            const aqiNum = Number(s?.aqi);
            if (!Number.isFinite(aqiNum)) continue;
            const dlat = (s?.lat ?? 0) - lat;
            const dlon = (s?.lon ?? 0) - lon;
            const dist = dlat * dlat + dlon * dlon;
            if (dist < bestDist) { bestDist = dist; best = { aqi: Math.round(aqiNum) }; }
          }
          if (best) return best.aqi;
        }
      }
    } catch {}

    return null;
  };

  const reverseGeocode = async (lat: number, lon: number): Promise<string | null> => {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`;
    const res = await fetch(url, { headers: { 'Accept': 'application/json' } });
    if (!res.ok) return null;
    const json = await res.json() as any;
    const name = json?.display_name;
    return typeof name === 'string' ? name : null;
  };

  const fetchWeatherSummary = async (lat: number, lon: number): Promise<{ summary: string | null; current: { temp?: number; humidity?: number; wind?: number; uv?: number; code?: number; isDay?: boolean } }> => {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,uv_index,weather_code,is_day&timezone=auto`;
    const res = await fetch(url, { headers: { 'Accept': 'application/json' } });
    if (!res.ok) return { summary: null, current: {} };
    const json = await res.json() as any;
    const c = json?.current ?? {};
    const temp = typeof c.temperature_2m === 'number' ? Math.round(c.temperature_2m) : undefined;
    const rh = typeof c.relative_humidity_2m === 'number' ? Math.round(c.relative_humidity_2m) : undefined;
    const wind = typeof c.wind_speed_10m === 'number' ? Math.round(c.wind_speed_10m) : undefined;
    const uv = typeof c.uv_index === 'number' ? Number(c.uv_index.toFixed(1)) : undefined;
    const code = typeof c.weather_code === 'number' ? c.weather_code : undefined;
    const isDay = typeof c.is_day === 'number' ? c.is_day === 1 : undefined;
    const parts: string[] = [];
    if (typeof temp !== 'undefined') parts.push(`${temp}°C`);
    if (typeof rh !== 'undefined') parts.push(`${rh}% Humidity`);
    if (typeof wind !== 'undefined') parts.push(`${wind} km/h Wind`);
    if (typeof uv !== 'undefined') parts.push(`UV ${uv}`);
    const summary = parts.length === 0 ? null : parts.join(', ');
    return { summary, current: { temp, humidity: rh, wind, uv, code, isDay } };
  };

  const handleSearch = async () => {
    if (!query.trim()) return;
    setIsSearching(true);
    try {
      const geo = await geocodeAddress(query.trim());
      if (!geo) {
        setIsSearching(false);
        return;
      }
      setLocationName(geo.display);
      setCoords({ lat: geo.lat, lon: geo.lon });
      setCountryName(extractCountry(geo.display));
      focusMap(geo.lat, geo.lon, 10);

      const [aqiVal, weather] = await Promise.all([
        fetchAqiByGeo(geo.lat, geo.lon),
        fetchWeatherSummary(geo.lat, geo.lon)
      ]);
      if (aqiVal !== null) setAqi(aqiVal);
      if (weather.summary) setWeatherStr(weather.summary);
      setWeatherCurrent(weather.current);
    } finally {
      setIsSearching(false);
    }
  };

  const handleLocateMe = async () => {
    if (!('geolocation' in navigator)) return;
    setIsSearching(true);
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true, timeout: 8000 });
      });
      const { latitude: lat, longitude: lon } = position.coords;
      setCoords({ lat, lon });
      focusMap(lat, lon, 10);
      const [placeName, aqiVal, weather] = await Promise.all([
        reverseGeocode(lat, lon),
        fetchAqiByGeo(lat, lon),
        fetchWeatherSummary(lat, lon)
      ]);
      setLocationName(placeName || `${lat.toFixed(3)}, ${lon.toFixed(3)}`);
      setCountryName(placeName ? extractCountry(placeName) : null);
      if (aqiVal !== null) setAqi(aqiVal);
      if (weather.summary) setWeatherStr(weather.summary);
      setWeatherCurrent(weather.current);
      setQuery("");
    } catch {
      // ignore locate errors
    } finally {
      setIsSearching(false);
    }
  };

  const fetchAqiHistory = async (lat: number, lon: number) => {
    // Open-Meteo air-quality daily PM2.5 as proxy for AQI trend, then normalize approx
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - 6);
    const fmt = (d: Date) => d.toISOString().slice(0, 10);
    const url = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&start_date=${fmt(start)}&end_date=${fmt(end)}&hourly=pm2_5`;
    const res = await fetch(url, { headers: { 'Accept': 'application/json' } });
    if (!res.ok) {
      setAqiHistory([]);
      return;
    }
    const json = await res.json() as any;
    const times: string[] = json?.hourly?.time || [];
    const pm: number[] = json?.hourly?.pm2_5 || [];
    const dayMap = new Map<string, { sum: number; count: number }>();
    for (let i = 0; i < Math.min(times.length, pm.length); i++) {
      const day = times[i].slice(0, 10);
      const val = typeof pm[i] === 'number' ? pm[i] : NaN;
      if (!Number.isFinite(val)) continue;
      const prev = dayMap.get(day) || { sum: 0, count: 0 };
      dayMap.set(day, { sum: prev.sum + val, count: prev.count + 1 });
    }
    const entries: { date: string; value: number }[] = Array.from(dayMap.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, { sum, count }]) => {
        const avgPm25 = count > 0 ? sum / count : 0;
        // Rough conversion: AQI_PM25 for simplicity (US EPA) piecewise
        const pm = avgPm25;
        let aqi = 0;
        const toAqi = (C: number, Cl: number, Ch: number, Il: number, Ih: number) => ((Ih - Il) / (Ch - Cl)) * (C - Cl) + Il;
        if (pm <= 12) aqi = toAqi(pm, 0, 12, 0, 50);
        else if (pm <= 35.4) aqi = toAqi(pm, 12.1, 35.4, 51, 100);
        else if (pm <= 55.4) aqi = toAqi(pm, 35.5, 55.4, 101, 150);
        else if (pm <= 150.4) aqi = toAqi(pm, 55.5, 150.4, 151, 200);
        else if (pm <= 250.4) aqi = toAqi(pm, 150.5, 250.4, 201, 300);
        else if (pm <= 350.4) aqi = toAqi(pm, 250.5, 350.4, 301, 400);
        else aqi = toAqi(pm, 350.5, 500.4, 401, 500);
        return { date, value: Math.round(aqi) };
      });
    setAqiHistory(entries);
  };

  useEffect(() => {
    if (coords) {
      void fetchAqiHistory(coords.lat, coords.lon);
      void fetchAqiForecast(coords.lat, coords.lon);
      void fetchTopStates();
    }
  }, [coords]);

  useEffect(() => {
    const handleShowHeatmap = () => setShowHeatmap(true);
    window.addEventListener('show-aqi-heatmap', handleShowHeatmap);
    return () => window.removeEventListener('show-aqi-heatmap', handleShowHeatmap);
  }, []);

  // Initialize coords from initial location name if possible
  useEffect(() => {
    const init = async () => {
      if (!coords && locationName) {
        const geo = await geocodeAddress(locationName);
        if (geo) {
          setCoords({ lat: geo.lat, lon: geo.lon });
        }
      }
    };
    void init();
  }, [coords, locationName]);

  const extractCountry = (displayName: string): string | null => {
    const parts = displayName.split(',').map((p) => p.trim());
    return parts.length ? parts[parts.length - 1] : null;
  };

  const getCountryBoundingBox = async (country: string): Promise<{ south: number; west: number; north: number; east: number } | null> => {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(country)}&addressdetails=1&limit=1`;
    const res = await fetch(url, { headers: { 'Accept': 'application/json' } });
    if (!res.ok) return null;
    const arr = await res.json() as any[];
    if (!Array.isArray(arr) || arr.length === 0) return null;
    const bb = arr[0]?.boundingbox as [string, string, string, string] | undefined;
    if (!bb || bb.length !== 4) return null;
    const south = Number(bb[0]);
    const north = Number(bb[1]);
    const west = Number(bb[2]);
    const east = Number(bb[3]);
    if ([south, north, west, east].some((n) => !Number.isFinite(n))) return null;
    return { south, west, north, east };
  };

  const reverseStateForCoords = async (lat: number, lon: number): Promise<string | null> => {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=5&addressdetails=1`;
    const res = await fetch(url, { headers: { 'Accept': 'application/json' } });
    if (!res.ok) return null;
    const json = await res.json() as any;
    const state: string | undefined = json?.address?.state || json?.address?.region || json?.address?.county;
    return typeof state === 'string' ? state : null;
  };

  const fetchTopStates = async () => {
    try {
      const token = process.env.NEXT_PUBLIC_WAQI_TOKEN || 'demo';
      let country = countryName;
      if (!country && locationName) country = extractCountry(locationName);
      if (!country) {
        setTopStates([]);
        return;
      }
      const byState = new Map<string, { sum: number; count: number }>();

      // Prefer bounded results by country bbox to avoid cross-country leakage
      const bbox = await getCountryBoundingBox(country);
      let stations: Array<{ lat: number; lon: number; aqi: number; name?: string }> = [];
      if (bbox) {
        const { south, west, north, east } = bbox;
        const boundsUrl = `https://api.waqi.info/map/bounds/?token=${token}&latlng=${south},${west},${north},${east}`;
        const bRes = await fetch(boundsUrl, { headers: { 'Accept': 'application/json' } });
        if (bRes.ok) {
          const bJson = await bRes.json() as any;
          const data: any[] = Array.isArray(bJson?.data) ? bJson.data : [];
          stations = data.map((d) => ({ lat: d.lat, lon: d.lon, aqi: Number(d.aqi), name: d.n }))
                        .filter((s) => Number.isFinite(s.aqi));
        }
      }

      // Fallback: keyword search if bounds failed
      if (stations.length === 0) {
        const res = await fetch(`https://api.waqi.info/search/?token=${token}&keyword=${encodeURIComponent(country)}`, { headers: { 'Accept': 'application/json' } });
        if (res.ok) {
          const json = await res.json() as any;
          const results: any[] = Array.isArray(json?.data) ? json.data : [];
          stations = results.map((r): { lat: number; lon: number; aqi: number; name?: string } | null => {
            const geo = r?.station?.geo as number[] | undefined;
            const aqiRaw = r?.aqi;
            const aqiNum = typeof aqiRaw === 'number' ? aqiRaw : (typeof aqiRaw === 'string' ? Number(aqiRaw) : NaN);
            return (Array.isArray(geo) && geo.length >= 2 && Number.isFinite(aqiNum)) ? { lat: geo[0], lon: geo[1], aqi: aqiNum as number, name: r?.station?.name } : null;
          }).filter((s): s is { lat: number; lon: number; aqi: number; name?: string } => Boolean(s));
        }
      }

      // Aggregate by state using station name heuristic, then enhance via reverse geocoding
      const cache = new Map<string, string>();
      for (const s of stations) {
        let state = 'Unknown';
        if (s.name && typeof s.name === 'string') {
          const parts = s.name.split(',').map((p: string) => p.trim());
          if (parts.length >= 2) state = parts[parts.length - 2];
        }
        const prev = byState.get(state) || { sum: 0, count: 0 };
        byState.set(state, { sum: prev.sum + s.aqi, count: prev.count + 1 });
      }

      // If Unknown present or fewer than 10 states, reverse geocode subset to refine
      if (byState.size < 10 || byState.has('Unknown')) {
        const subset = stations.slice(0, 120);
        for (let i = 0; i < subset.length; i++) {
          const s = subset[i];
          const key = `${s.lat.toFixed(2)},${s.lon.toFixed(2)}`;
          let st = cache.get(key) || null;
          if (!st) {
            try {
              st = await reverseStateForCoords(s.lat, s.lon);
              if (st) cache.set(key, st);
            } catch {}
          }
          if (st) {
            const unknownBucket = byState.get('Unknown');
            const prev = byState.get(st) || { sum: 0, count: 0 };
            byState.set(st, { sum: prev.sum + s.aqi, count: prev.count + 1 });
            if (unknownBucket) byState.set('Unknown', { sum: Math.max(0, unknownBucket.sum - s.aqi), count: Math.max(0, unknownBucket.count - 1) });
          }
          if (i % 10 === 0) await new Promise((rsv) => setTimeout(rsv, 120));
        }
      }

      let stateEntries: TopState[] = Array.from(byState.entries())
        .map(([state, { sum, count }]) => ({ state, aqi: Math.round(sum / Math.max(1, count)) }))
        .sort((a, b) => a.aqi - b.aqi)
        .slice(0, 10);

      // If states are insufficient or many are 'Unknown', try enhancing by reverse geocoding a subset
      const haveEnough = stateEntries.length >= 10 && !stateEntries.some(s => s.state === 'Unknown');
      if (!haveEnough && stations.length > 0) {
        const cache2 = new Map<string, string>();
        const subset2 = stations.slice(0, 120);
        for (let i = 0; i < subset2.length; i++) {
          const s = subset2[i];
          const key = `${s.lat.toFixed(2)},${s.lon.toFixed(2)}`;
          let st = cache2.get(key) || null;
          if (!st) {
            try {
              st = await reverseStateForCoords(s.lat, s.lon);
              if (st) cache2.set(key, st);
            } catch {}
          }
          if (!st) continue;
          const prev = byState.get(st) || { sum: 0, count: 0 };
          byState.set(st, { sum: prev.sum + s.aqi, count: prev.count + 1 });
          stateEntries = Array.from(byState.entries())
            .map(([state, { sum, count }]) => ({ state, aqi: Math.round(sum / Math.max(1, count)) }))
            .sort((a, b) => a.aqi - b.aqi)
            .slice(0, 10);
          if (stateEntries.length >= 10 && !stateEntries.some(s => s.state === 'Unknown')) break;
          if (i % 10 === 0) await new Promise((rsv) => setTimeout(rsv, 120));
        }
      }

      setTopStates(stateEntries);
    } catch {
      setTopStates([]);
    }
  };

  const fetchAqiForecast = async (lat: number, lon: number) => {
    // Open-Meteo air-quality 7-day hourly forecast -> daily average PM2.5 -> approximate US AQI
    const url = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&hourly=pm2_5&forecast_days=7&timezone=auto`;
    const res = await fetch(url, { headers: { 'Accept': 'application/json' } });
    let entries: { date: string; value: number }[] = [];
    if (res.ok) {
      const json = await res.json() as any;
      const times: string[] = json?.hourly?.time || [];
      const pm: number[] = json?.hourly?.pm2_5 || [];
      const dayMap = new Map<string, { sum: number; count: number }>();
      for (let i = 0; i < Math.min(times.length, pm.length); i++) {
        const day = typeof times[i] === 'string' ? times[i].slice(0, 10) : '';
        const val = typeof pm[i] === 'number' ? pm[i] : NaN;
        if (!day || !Number.isFinite(val)) continue;
        const prev = dayMap.get(day) || { sum: 0, count: 0 };
        dayMap.set(day, { sum: prev.sum + val, count: prev.count + 1 });
      }
      entries = Array.from(dayMap.entries())
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([date, { sum, count }]) => {
          const avgPm25 = count > 0 ? sum / count : 0;
          const toAqi = (C: number, Cl: number, Ch: number, Il: number, Ih: number) => ((Ih - Il) / (Ch - Cl)) * (C - Cl) + Il;
          const pmv = avgPm25;
          let aqi = 0;
          if (pmv <= 12) aqi = toAqi(pmv, 0, 12, 0, 50);
          else if (pmv <= 35.4) aqi = toAqi(pmv, 12.1, 35.4, 51, 100);
          else if (pmv <= 55.4) aqi = toAqi(pmv, 35.5, 55.4, 101, 150);
          else if (pmv <= 150.4) aqi = toAqi(pmv, 55.5, 150.4, 151, 200);
          else if (pmv <= 250.4) aqi = toAqi(pmv, 150.5, 250.4, 201, 300);
          else if (pmv <= 350.4) aqi = toAqi(pmv, 250.5, 350.4, 301, 400);
          else aqi = toAqi(pmv, 350.5, 500.4, 401, 500);
          return { date, value: Math.round(aqi) };
        });
    }

    if (entries.length === 0) {
      try {
        const token = process.env.NEXT_PUBLIC_WAQI_TOKEN || 'demo';
        const waqiRes = await fetch(`https://api.waqi.info/feed/geo:${lat};${lon}/?token=${token}`, { headers: { 'Accept': 'application/json' } });
        if (waqiRes.ok) {
          const wjson = await waqiRes.json() as any;
          const pmDaily: Array<{ day: string; avg: number }> = wjson?.data?.forecast?.daily?.pm25 || [];
          const toAqi = (C: number, Cl: number, Ch: number, Il: number, Ih: number) => ((Ih - Il) / (Ch - Cl)) * (C - Cl) + Il;
          entries = pmDaily.slice(0, 7).map((d) => {
            const pmv = typeof d.avg === 'number' ? d.avg : NaN;
            let aqi = 0;
            if (Number.isFinite(pmv)) {
              if (pmv <= 12) aqi = toAqi(pmv, 0, 12, 0, 50);
              else if (pmv <= 35.4) aqi = toAqi(pmv, 12.1, 35.4, 51, 100);
              else if (pmv <= 55.4) aqi = toAqi(pmv, 35.5, 55.4, 101, 150);
              else if (pmv <= 150.4) aqi = toAqi(pmv, 55.5, 150.4, 151, 200);
              else if (pmv <= 250.4) aqi = toAqi(pmv, 150.5, 250.4, 201, 300);
              else if (pmv <= 350.4) aqi = toAqi(pmv, 250.5, 350.4, 301, 400);
              else aqi = toAqi(pmv, 350.5, 500.4, 401, 500);
            }
            return { date: d.day, value: Math.round(aqi) };
          }).filter((e) => Number.isFinite(e.value));
        }
      } catch {
        // ignore
      }
    }

    setAqiForecast(entries);
  };

  if (!user) {
    return <div className="min-h-screen w-full bg-background flex items-center justify-center"><p>Loading...</p></div>;
  }

  return (
    <div className="min-h-screen w-full bg-slate-950 text-white font-sans">
      <AQIHeatmap />
      <CitySilhouetteBackground />
      <header className="p-4 px-8 bg-slate-900/70 backdrop-blur-sm border-b border-slate-700 flex justify-between items-center relative z-10">
        <div className="flex items-center gap-8">
            <h1 className="text-3xl font-bold text-cyan-400">AQI</h1>
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <Input
                  placeholder="Search any Location, City, State or Country"
                  className="bg-slate-800 border-slate-700 rounded-full w-96 pl-10 pr-24"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      void handleSearch();
                    }
                  }}
                />
                <Button
                  onClick={() => void handleSearch()}
                  disabled={isSearching || !query.trim()}
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-8 px-3 rounded-full bg-cyan-500 hover:bg-cyan-600 border-cyan-500 text-white"
                >
                  {isSearching ? 'Searching...' : 'Search'}
                </Button>
            </div>
            {user && (
              <div className="text-white font-medium">
                <span className="text-slate-300">Hi, </span>
                <span className="text-cyan-300">{user.username}!</span>
              </div>
            )}
        </div>
        <div className="flex items-center gap-6 text-sm">
            <AccountMenu onProfileUpdated={(u) => {
              setUser((prev) => prev ? { ...prev, username: u.username, healthConditions: u.healthConditions } : prev);
            }} />
            <Button onClick={handleLogout} variant="outline" className="bg-cyan-500 hover:bg-cyan-600 border-cyan-500 text-white rounded-lg">
                Logout <LogOut className="ml-2 h-4 w-4" />
            </Button>
        </div>
      </header>
      <main className="p-4 md:p-8 flex justify-center items-start gap-6 relative z-10">
        <Card className="w-full max-w-5xl bg-slate-900/70 backdrop-blur-md border-slate-700 rounded-2xl shadow-2xl">
           <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <p className="text-2xl font-semibold">Real-time Air Quality Index (AQI)</p>
                        <p className="text-cyan-400 line-clamp-1" title={locationName}>{locationName}</p>
                        <p className="text-xs text-slate-400">Updated just now</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button onClick={() => void handleLocateMe()} variant="outline" className="rounded-full bg-slate-800 border-slate-700 hover:bg-slate-700">
                            <MapPin className="mr-2 h-4 w-4" /> Locate me
                        </Button>
                        <Button variant="ghost" size="icon" className="rounded-full hover:bg-slate-700">
                            <Heart className="h-5 w-5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="rounded-full hover:bg-slate-700">
                            <Share2 className="h-5 w-5" />
                        </Button>
                    </div>
                </div>

                <Tabs defaultValue="aqi" className="w-full">
                    <TabsList className="bg-slate-800/80 border border-slate-700 rounded-lg">
                        <TabsTrigger value="aqi" className="flex items-center gap-2 data-[state=active]:bg-slate-700 data-[state=active]:text-white">
                            <Cloud className="h-5 w-5"/> AQI
                        </TabsTrigger>
                        <TabsTrigger value="weather" className="flex items-center gap-2 data-[state=active]:bg-slate-700 data-[state=active]:text-white">
                            <Sun className="h-5 w-5" /> Weather
                        </TabsTrigger>
                    </TabsList>
                    <TabsContent value="aqi">
                       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
                          <div className="flex-grow">
                             <AqiCard aqi={aqi} />
                          </div>
                          <div className="relative flex items-center justify-center gap-4">
                            <Mascot aqi={aqi} />
                            <WeatherAnimation code={weatherCurrent.code} isDay={weatherCurrent.isDay} wind={weatherCurrent.wind} humidity={weatherCurrent.humidity} />
                          </div>
                       </div>
                        <div className="mt-6">
                          <AqiForecastChart data={aqiForecast} />
                        </div>
                        <div className="mt-6">
                          <PollutantDetails />
                        </div>
                    </TabsContent>
                    <TabsContent value="weather">
                        <div className="mt-4 p-6 bg-yellow-500/10 rounded-lg grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                            <div className="text-center">
                                <p className="text-5xl font-bold text-white">{typeof weatherCurrent.temp === 'number' ? `${weatherCurrent.temp}°C` : '—'}</p>
                                <p className="font-semibold text-yellow-200">{weatherStr || 'Weather unavailable'}</p>
                            </div>
                            <div className="grid grid-cols-3 gap-4 text-center">
                                <div className="flex flex-col items-center">
                                    <Droplets className="h-6 w-6 text-yellow-300"/>
                                    <p className="font-bold text-lg">{typeof weatherCurrent.humidity === 'number' ? `${weatherCurrent.humidity}%` : '—'}</p>
                                    <p className="text-xs text-yellow-200/80">Humidity</p>
                                 </div>
                                <div className="flex flex-col items-center">
                                    <Wind className="h-6 w-6 text-yellow-300"/>
                                    <p className="font-bold text-lg">{typeof weatherCurrent.wind === 'number' ? `${weatherCurrent.wind} km/h` : '—'}</p>
                                    <p className="text-xs text-yellow-200/80">Wind Speed</p>
                                </div>
                                <div className="flex flex-col items-center">
                                  <UVIndex value={typeof weatherCurrent.uv === 'number' ? weatherCurrent.uv : 1} />
                                </div>
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
                <div className="mt-6">
                    <HealthRecommendations
                        location={locationName}
                        aqi={aqi}
                        weather={weatherStr}
                        healthConditions={user.healthConditions}
                        onNewRecommendation={handleNewRecommendation}
                    />
                    <div className="mt-6">
                      <AqiHistoryChart data={aqiHistory} />
                    </div>
                </div>
           </CardContent>
        </Card>
        <div className="hidden xl:block w-80">
          <TopStatesSidebar countryName={countryName} topStates={topStates} aqi={aqi} healthConditions={user.healthConditions} />
        </div>
      </main>
      
      {/* Full-screen AQI Heatmap Overlay */}
      {showHeatmap && (
        <div className="fixed inset-0 z-50 bg-slate-950">
          <div className="absolute top-4 right-4 z-10">
            <Button
              onClick={() => setShowHeatmap(false)}
              variant="outline"
              size="sm"
              className="bg-slate-800/80 border-slate-600 text-white hover:bg-slate-700"
            >
              <X className="h-4 w-4 mr-2" />
              Close
            </Button>
          </div>
          <div className="w-full h-full">
            <AQISimple />
          </div>
        </div>
      )}
    </div>
  );
}
