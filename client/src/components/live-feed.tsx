import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, Zap, TrendingUp } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface TrendingSummary {
  summary: string;
  postsAnalyzed: number;
}

export default function LiveFeed() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // Get trending summary
  const { data: trendingSummary, refetch } = useQuery<TrendingSummary>({
    queryKey: ['/api/trending-summary'],
    refetchInterval: 5 * 60 * 1000, // Refresh every 5 minutes
  });

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    try {
      // Trigger scraping
      await apiRequest('/api/scrape', { method: 'POST' });
      // Refetch trending data
      await refetch();
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Failed to refresh:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  return (
    <Card className="border border-neutral-200 mb-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center text-lg">
            <Zap className="h-5 w-5 mr-2 text-primary" />
            Live Trending Summary
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Badge variant="secondary" className="text-xs">
              Last updated: {formatTime(lastUpdate)}
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={handleManualRefresh}
              disabled={isRefreshing}
              className="text-neutral-600 hover:text-primary"
            >
              <RefreshCw className={`h-4 w-4 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {trendingSummary ? (
          <div className="space-y-3">
            <div className="flex items-center text-sm text-neutral-600">
              <TrendingUp className="h-4 w-4 mr-1" />
              Analyzed {trendingSummary.postsAnalyzed} trending posts
            </div>
            <p className="text-neutral-700 leading-relaxed">
              {trendingSummary.summary}
            </p>
          </div>
        ) : (
          <div className="text-center py-4 text-neutral-500">
            Loading trending analysis...
          </div>
        )}
      </CardContent>
    </Card>
  );
}