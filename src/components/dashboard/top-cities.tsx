"use client";

import React, { useMemo, useState, useEffect } from "react";
import { Shield, AirVent, Wind, Home, HeartPulse, Activity, Pill, Baby, MapIcon, Maximize2, Loader2, Newspaper, ExternalLink, Calendar } from "lucide-react";
import AQILivePreview from "./aqi-live-preview";

export type TopState = {
  state: string;
  aqi: number;
};

// News article type
type NewsArticle = {
  title: string;
  description: string;
  url: string;
  publishedAt: string;
  source: string;
};

function getAqiThemeInfo(aqi: number) {
  if (aqi <= 50) return { level: 'Good', color: '#22c55e' };
  if (aqi <= 100) return { level: 'Moderate', color: '#eab308' };
  if (aqi <= 150) return { level: 'USG', color: '#f97316' };
  if (aqi <= 200) return { level: 'Unhealthy', color: '#ef4444' };
  if (aqi <= 300) return { level: 'Very Unhealthy', color: '#a855f7' };
  return { level: 'Hazardous', color: '#7f1d1d' };
}

function MiniAqiMeter({ aqi }: { aqi: number }) {
  const pct = Math.max(0, Math.min(100, (aqi / 500) * 100));
  return (
    <div className="w-28 h-2.5 rounded-full bg-slate-700 overflow-hidden">
      <div
        className="h-full w-full"
        style={{
          background: 'linear-gradient(90deg, #22c55e 0%, #eab308 20%, #f97316 40%, #ef4444 60%, #a855f7 80%, #7f1d1d 100%)',
          position: 'relative'
        }}
      >
        <div
          style={{ left: `${pct}%` }}
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-white shadow"
        />
      </div>
    </div>
  );
}

function getAqiCategory(aqi: number) {
  if (aqi <= 50) return 'Good';
  if (aqi <= 100) return 'Moderate';
  if (aqi <= 150) return 'USG';
  if (aqi <= 200) return 'Unhealthy';
  if (aqi <= 300) return 'Very Unhealthy';
  return 'Hazardous';
}

type SolutionCard = { title: string; subtitle: string; icon: JSX.Element };

function buildSolutions(aqi: number, healthConditions?: string | null): SolutionCard[] {
  const cat = getAqiCategory(aqi);
  const hc = (healthConditions || '').toLowerCase();
  const isAsthma = hc.includes('asthma') || hc.includes('copd');
  const isHeart = hc.includes('heart');
  const isPreg = hc.includes('preg');
  const isChild = hc.includes('child');
  const isElder = hc.includes('elder');
  const isAllergy = hc.includes('allerg');

  const solutions: SolutionCard[] = [];

  if (cat === 'Unhealthy' || cat === 'Very Unhealthy' || cat === 'Hazardous') {
    solutions.push({ title: 'Wear N95 Mask', subtitle: 'When outdoors, use a well-fitting N95/FFP2.', icon: <Shield className="h-5 w-5 text-cyan-300"/> });
    solutions.push({ title: 'Use Air Purifier', subtitle: 'Run HEPA purifier in living/sleep areas.', icon: <AirVent className="h-5 w-5 text-cyan-300"/> });
    solutions.push({ title: 'Stay Indoors', subtitle: 'Keep windows closed; avoid traffic-heavy routes.', icon: <Home className="h-5 w-5 text-cyan-300"/> });
  } else if (cat === 'USG') {
    solutions.push({ title: 'Limit Outdoor Activity', subtitle: 'Prefer light indoor exercise today.', icon: <Activity className="h-5 w-5 text-cyan-300"/> });
    solutions.push({ title: 'Mask if Sensitive', subtitle: 'Sensitive groups should wear a mask outside.', icon: <Shield className="h-5 w-5 text-cyan-300"/> });
    solutions.push({ title: 'Ventilate Wisely', subtitle: 'Air out rooms when AQI briefly improves.', icon: <Wind className="h-5 w-5 text-cyan-300"/> });
  } else if (cat === 'Moderate') {
    solutions.push({ title: 'Time Your Outdoors', subtitle: 'Prefer mornings; avoid peak traffic hours.', icon: <Activity className="h-5 w-5 text-cyan-300"/> });
    solutions.push({ title: 'Sensitive Precautions', subtitle: 'Mask optional for sensitive individuals.', icon: <Shield className="h-5 w-5 text-cyan-300"/> });
  } else {
    solutions.push({ title: 'Enjoy Outdoor Time', subtitle: 'Great day for outdoor activities.', icon: <Activity className="h-5 w-5 text-cyan-300"/> });
  }

  if (isAsthma) {
    solutions.push({ title: 'Keep Inhaler Handy', subtitle: 'Use as prescribed; consider pre-exercise puff.', icon: <Pill className="h-5 w-5 text-cyan-300"/> });
  }
  if (isHeart) {
    solutions.push({ title: 'Avoid Strenuous Effort', subtitle: 'Opt for light activity; monitor symptoms.', icon: <HeartPulse className="h-5 w-5 text-cyan-300"/> });
  }
  if (isPreg || isChild || isElder) {
    solutions.push({ title: 'Extra Caution', subtitle: 'Limit exposure; prioritize clean indoor air.', icon: <Baby className="h-5 w-5 text-cyan-300"/> });
  }
  if (isAllergy) {
    solutions.push({ title: 'Allergy Control', subtitle: 'Rinse nasal passages; follow antihistamine plan.', icon: <Pill className="h-5 w-5 text-cyan-300"/> });
  }

  // Deduplicate by title and cap to 4-5 items
  const uniq = new Map<string, SolutionCard>();
  for (const s of solutions) if (!uniq.has(s.title)) uniq.set(s.title, s);
  return Array.from(uniq.values()).slice(0, 5);
}

export function TopStatesSidebar({
  countryName,
  topStates,
  aqi,
  healthConditions,
}: {
  countryName?: string | null;
  topStates: TopState[];
  aqi: number;
  healthConditions?: string | null;
}) {
  const solutions = useMemo(() => buildSolutions(aqi, healthConditions), [aqi, healthConditions]);
  const [isHeatmapLoading, setIsHeatmapLoading] = useState(false);
  const [newsArticles, setNewsArticles] = useState<NewsArticle[]>([]);
  const [isNewsLoading, setIsNewsLoading] = useState(true);

  // Fetch news articles related to air quality and AQI
  useEffect(() => {
    const fetchNews = async () => {
      try {
        setIsNewsLoading(true);
        
        // Using NewsAPI.org (free tier - requires API key but limited requests)
        // Alternative: Using a free RSS feed or mock data for now
        // You can replace this with your preferred news API
        
        // Mock data for demonstration (replace with actual API call)
        const mockNews: NewsArticle[] = [
          {
            title: "Air Quality Index: Understanding the Impact on Health",
            description: "Recent studies show correlation between poor air quality and respiratory health issues. Experts recommend monitoring AQI levels daily.",
            url: "https://www.who.int/news-room/fact-sheets/detail/ambient-(outdoor)-air-quality-and-health",
            publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
            source: "WHO"
          },
          {
            title: "New Air Purification Technologies Show Promise",
            description: "Innovative HEPA filters and smart air purifiers are helping improve indoor air quality in polluted urban areas.",
            url: "https://www.sciencedaily.com/news/earth_climate/air_quality/",
            publishedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
            source: "Science Daily"
          },
          {
            title: "Government Announces New Air Quality Standards",
            description: "Updated regulations aim to reduce pollution levels and protect public health across major cities.",
            url: "https://www.epa.gov/air-quality",
            publishedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), // 12 hours ago
            source: "EPA"
          },
          {
            title: "How to Protect Yourself During High AQI Days",
            description: "Practical tips for staying safe when air quality reaches unhealthy levels, including mask usage and indoor activities.",
            url: "https://www.lung.org/clean-air/outdoors/air-quality-index",
            publishedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
            source: "American Lung Association"
          },
          {
            title: "Global Air Quality Monitoring: Latest Trends and Data",
            description: "Comprehensive analysis of worldwide air quality patterns and emerging monitoring technologies.",
            url: "https://waqi.info/",
            publishedAt: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(), // 1.5 days ago
            source: "WAQI"
          }
        ];

        setNewsArticles(mockNews);
        
        // Uncomment and modify the code below if you have a NewsAPI key
        /*
        const apiKey = process.env.NEXT_PUBLIC_NEWS_API_KEY;
        if (apiKey) {
          const response = await fetch(
            `https://newsapi.org/v2/everything?q=air+quality+AQI+pollution&language=en&sortBy=publishedAt&pageSize=5&apiKey=${apiKey}`
          );
          
          if (response.ok) {
            const data = await response.json();
            const articles = data.articles.map((article: any) => ({
              title: article.title,
              description: article.description || article.content?.substring(0, 150) + '...',
              url: article.url,
              publishedAt: article.publishedAt,
              source: article.source.name
            }));
            setNewsArticles(articles);
          }
        }
        */
        
      } catch (error) {
        console.error('Failed to fetch news:', error);
        // Keep mock data as fallback
      } finally {
        setIsNewsLoading(false);
      }
    };

    fetchNews();
  }, []);

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  return (
    <aside className="sticky top-4 self-start bg-slate-900/70 backdrop-blur-md border border-slate-700 rounded-xl p-4 text-white">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold">Best AQI States Today</h3>
        <span className="text-xs text-slate-400">{countryName || '—'}</span>
      </div>
      {topStates.length === 0 ? (
        <p className="text-sm text-slate-400">No data available.</p>
      ) : (
        <ul className="space-y-3">
          {topStates.map((s, idx) => {
            const t = getAqiThemeInfo(s.aqi);
            return (
              <li key={`${s.state}-${idx}`} className="flex items-center justify-between gap-3 p-2 rounded-lg bg-slate-800/60 border border-slate-700">
                <div className="min-w-0 text-sm font-medium truncate">{s.state}</div>
                <div className="flex items-center gap-3">
                  <MiniAqiMeter aqi={s.aqi} />
                  <div className="text-right">
                    <div className="text-sm font-semibold" style={{ color: t.color }}>{s.aqi}</div>
                    <div className="text-[10px] text-slate-400">{t.level}</div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
      <div className="mt-4">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-semibold text-white">AI Solutions for You</h4>
          <span className="text-[10px] text-slate-400">AQI {aqi}</span>
        </div>
        {solutions.length === 0 ? (
          <p className="text-xs text-slate-400">No special actions needed today.</p>
        ) : (
          <div className="grid grid-cols-1 gap-2">
            {solutions.map((sol) => (
              <div key={sol.title} className="flex items-center gap-3 p-2 rounded-md bg-slate-800/70 border border-slate-700">
                <div className="shrink-0 rounded-md bg-slate-900/60 border border-slate-700 p-1.5">
                  {sol.icon}
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-cyan-200 truncate">{sol.title}</div>
                  <div className="text-[11px] text-slate-400 truncate">{sol.subtitle}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* AQI Heat Map Card */}
      <div className="mt-4">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-semibold text-white flex items-center gap-2">
            <MapIcon className="h-4 w-4 text-cyan-300" />
            AQI Heat Map
          </h4>
          <button 
            onClick={() => {
              setIsHeatmapLoading(true);
              // This will be handled by the parent component
              window.dispatchEvent(new CustomEvent('show-aqi-heatmap'));
              // Reset loading state after a short delay
              setTimeout(() => setIsHeatmapLoading(false), 1000);
            }}
            className="text-slate-400 hover:text-white transition-colors"
            disabled={isHeatmapLoading}
          >
            {isHeatmapLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Maximize2 className="h-4 w-4" />
            )}
          </button>
        </div>
        <div className="aspect-video bg-slate-800/70 rounded-lg border border-slate-700 overflow-hidden">
          <AQILivePreview />
        </div>
        <div className="mt-2 text-[10px] text-slate-400">
          Shows real-time air quality data across different regions
        </div>
      </div>

      {/* News and Articles Dashboard */}
      <div className="mt-4">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-semibold text-white flex items-center gap-2">
            <Newspaper className="h-4 w-4 text-cyan-300" />
            Latest News
          </h4>
          <span className="text-[10px] text-slate-400">AQI Related</span>
        </div>
        
        {isNewsLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-slate-700 rounded mb-2"></div>
                <div className="h-3 bg-slate-700 rounded mb-1"></div>
                <div className="h-3 bg-slate-700 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        ) : newsArticles.length > 0 ? (
          <div className="space-y-3">
            {newsArticles.map((article, index) => (
              <a 
                key={index} 
                href={article.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="block p-3 rounded-lg bg-slate-800/70 border border-slate-700 hover:bg-slate-800/90 hover:border-cyan-500/50 transition-all duration-200 cursor-pointer group"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h5 className="text-xs font-semibold text-cyan-200 group-hover:text-cyan-100 line-clamp-2 leading-tight transition-colors">
                    {article.title}
                  </h5>
                  <div className="shrink-0 text-slate-400 group-hover:text-cyan-300 transition-colors">
                    <ExternalLink className="h-3 w-3" />
                  </div>
                </div>
                <p className="text-[10px] text-slate-400 group-hover:text-slate-300 line-clamp-2 mb-2 leading-tight transition-colors">
                  {article.description}
                </p>
                <div className="flex items-center justify-between text-[9px] text-slate-500 group-hover:text-slate-400 transition-colors">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-2.5 w-2.5" />
                    {formatTimeAgo(article.publishedAt)}
                  </span>
                  <span className="truncate max-w-[80px]">{article.source}</span>
                </div>
              </a>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-400">No news available at the moment.</p>
        )}
        
        <div className="mt-2 text-[10px] text-slate-400">
          Stay updated with latest air quality news and research
        </div>
      </div>
    </aside>
  );
}


