import { useState, useEffect } from "react";
import { Clock, Globe } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface TimeZoneInfo {
  country: string;
  timezone: string;
  flag: string;
  city: string;
}

const COMMON_COUNTRIES: TimeZoneInfo[] = [
  { country: "USA", timezone: "America/New_York", flag: "🇺🇸", city: "New York" },
  { country: "UK", timezone: "Europe/London", flag: "🇬🇧", city: "London" },
  { country: "Germany", timezone: "Europe/Berlin", flag: "🇩🇪", city: "Berlin" },
  { country: "China", timezone: "Asia/Shanghai", flag: "🇨🇳", city: "Shanghai" },
  { country: "UAE", timezone: "Asia/Dubai", flag: "🇦🇪", city: "Dubai" },
];

export function WorldClock() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date, timezone?: string) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZone: timezone,
      hour12: false,
    }).format(date);
  };

  const getUserTimezone = () => {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  };

  const getUserCountry = () => {
    const timezone = getUserTimezone();
    if (timezone.includes('America/New_York') || timezone.includes('America/Los_Angeles')) return '🇺🇸 USA';
    if (timezone.includes('Europe/London')) return '🇬🇧 UK';
    if (timezone.includes('Europe/Berlin') || timezone.includes('Europe/Paris')) return '🇪🇺 Europe';
    if (timezone.includes('Asia/Shanghai') || timezone.includes('Asia/Tokyo')) return '🌏 Asia';
    if (timezone.includes('Asia/Dubai')) return '🇦🇪 UAE';
    return '🌍 Local';
  };

  return (
    <div className="fixed bottom-4 left-4 z-50">
      <Card className="bg-background/95 backdrop-blur-sm border-border/50 shadow-lg">
        <CardContent className="p-3">
          <div 
            className="flex items-center gap-2 cursor-pointer select-none"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <Clock className="h-4 w-4 text-primary" />
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">{getUserCountry()}</span>
                <Badge variant="outline" className="text-xs px-1.5 py-0.5">
                  {formatTime(currentTime)}
                </Badge>
              </div>
              {isExpanded && (
                <div className="mt-2 space-y-1">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                    <Globe className="h-3 w-3" />
                    <span>Global Times</span>
                  </div>
                  {COMMON_COUNTRIES.map((country) => (
                    <div key={country.timezone} className="flex items-center justify-between gap-2 text-xs">
                      <span className="flex items-center gap-1">
                        <span>{country.flag}</span>
                        <span className="text-muted-foreground">{country.city}</span>
                      </span>
                      <Badge variant="secondary" className="text-xs px-1.5 py-0.5 font-mono">
                        {formatTime(currentTime, country.timezone)}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          {!isExpanded && (
            <div className="text-xs text-muted-foreground mt-1 opacity-60">
              Click to expand
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}