import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import type { Analytics } from "@shared/schema";

interface StatsBarProps {
  categorySlug?: string;
}

export default function StatsBar({ categorySlug }: StatsBarProps) {
  const { data: analytics } = useQuery<Analytics>({
    queryKey: ['/api/categories', categorySlug, 'analytics'],
    enabled: !!categorySlug,
  });

  // Default stats if no analytics available
  const stats = analytics || {
    hotTopics: 124,
    trendingNow: 23,
    activeForums: 8,
    totalPosts: 2400
  };

  return (
    <Card className="border border-neutral-200 mb-6">
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{stats.hotTopics}</div>
            <div className="text-sm text-neutral-600">Hot Topics</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-success">{stats.trendingNow}</div>
            <div className="text-sm text-neutral-600">Trending Now</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-accent-orange">{stats.activeForums}</div>
            <div className="text-sm text-neutral-600">Active Forums</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-neutral-700">{stats.totalPosts}</div>
            <div className="text-sm text-neutral-600">Total Posts</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
