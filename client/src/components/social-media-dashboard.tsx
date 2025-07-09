import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RefreshCw, TrendingUp, Users, Activity, Hash, ExternalLink } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface TrendingData {
  totalPosts: number;
  platformBreakdown: Record<string, number>;
  trendingTags: { tag: string; count: number }[];
  timeRange: string;
  lastUpdated: string;
}

export default function SocialMediaDashboard() {
  const [isAggregating, setIsAggregating] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get social media trending data
  const { data: trendingData, isLoading } = useQuery<TrendingData>({
    queryKey: ['/api/social-media/trending'],
    refetchInterval: 10 * 60 * 1000, // Refresh every 10 minutes
  });

  // Trigger social media aggregation
  const aggregateMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('/api/social-media/aggregate', { method: 'POST' });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Social media aggregation completed successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/posts'] });
      queryClient.invalidateQueries({ queryKey: ['/api/social-media/trending'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error", 
        description: error.message || "Failed to aggregate social media content",
        variant: "destructive",
      });
    },
  });

  const handleAggregateNow = async () => {
    setIsAggregating(true);
    try {
      await aggregateMutation.mutateAsync();
    } finally {
      setIsAggregating(false);
    }
  };

  const platformIcons = {
    'Reddit': '🔴',
    'YouTube': '📺',
    'Twitter/X': '🐦',
    'RSS Feed': '📡'
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <RefreshCw className="h-6 w-6 animate-spin mr-2" />
            <span>Loading social media data...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center text-lg">
              <Activity className="h-5 w-5 mr-2 text-primary" />
              Social Media Integration
            </CardTitle>
            <div className="flex items-center space-x-2">
              {trendingData?.lastUpdated && (
                <Badge variant="secondary" className="text-xs">
                  Updated: {formatTimeAgo(trendingData.lastUpdated)}
                </Badge>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={handleAggregateNow}
                disabled={isAggregating || aggregateMutation.isPending}
                className="text-primary"
              >
                <RefreshCw className={`h-4 w-4 mr-1 ${isAggregating ? 'animate-spin' : ''}`} />
                Aggregate Now
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{trendingData?.totalPosts || 0}</div>
              <div className="text-sm text-neutral-600">Social Media Posts</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {Object.keys(trendingData?.platformBreakdown || {}).length}
              </div>
              <div className="text-sm text-neutral-600">Active Platforms</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {trendingData?.trendingTags?.length || 0}
              </div>
              <div className="text-sm text-neutral-600">Trending Topics</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Analytics */}
      <Tabs defaultValue="platforms" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="platforms">Platform Breakdown</TabsTrigger>
          <TabsTrigger value="trending">Trending Topics</TabsTrigger>
          <TabsTrigger value="sources">Source Management</TabsTrigger>
        </TabsList>

        <TabsContent value="platforms" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-base">
                <Users className="h-4 w-4 mr-2" />
                Platform Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              {trendingData?.platformBreakdown && Object.keys(trendingData.platformBreakdown).length > 0 ? (
                <div className="space-y-4">
                  {Object.entries(trendingData.platformBreakdown).map(([platform, count]) => {
                    const total = trendingData.totalPosts;
                    const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
                    
                    return (
                      <div key={platform} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span className="text-lg">{platformIcons[platform as keyof typeof platformIcons] || '📄'}</span>
                            <span className="font-medium">{platform}</span>
                          </div>
                          <div className="text-sm text-neutral-600">
                            {count} posts ({percentage}%)
                          </div>
                        </div>
                        <Progress value={percentage} className="h-2" />
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-neutral-500">
                  <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No social media data available</p>
                  <p className="text-sm">Click "Aggregate Now" to start collecting data</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trending" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-base">
                <TrendingUp className="h-4 w-4 mr-2" />
                Trending Topics & Tags
              </CardTitle>
            </CardHeader>
            <CardContent>
              {trendingData?.trendingTags && trendingData.trendingTags.length > 0 ? (
                <div className="space-y-3">
                  {trendingData.trendingTags.map((item, index) => (
                    <div key={item.tag} className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center justify-center w-6 h-6 bg-primary text-white rounded-full text-xs font-bold">
                          {index + 1}
                        </div>
                        <div className="flex items-center space-x-2">
                          <Hash className="h-3 w-3 text-neutral-400" />
                          <span className="font-medium capitalize">{item.tag}</span>
                        </div>
                      </div>
                      <Badge variant="secondary">
                        {item.count} mentions
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-neutral-500">
                  <Hash className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No trending topics found</p>
                  <p className="text-sm">Aggregate social media content to see trending topics</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sources" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-base">
                <ExternalLink className="h-4 w-4 mr-2" />
                Social Media Sources
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Reddit Sources */}
                  <div className="p-4 border border-neutral-200 rounded-lg">
                    <div className="flex items-center space-x-2 mb-3">
                      <span className="text-lg">🔴</span>
                      <h3 className="font-semibold">Reddit Subreddits</h3>
                    </div>
                    <div className="space-y-2 text-sm text-neutral-600">
                      <div>• r/drones (Hot posts)</div>
                      <div>• r/radiocontrol (New & Hot)</div>
                      <div>• r/fpv (FPV Racing)</div>
                      <div>• r/Multicopter (General drones)</div>
                      <div>• r/woodworking (DIY projects)</div>
                    </div>
                  </div>

                  {/* YouTube Sources */}
                  <div className="p-4 border border-neutral-200 rounded-lg">
                    <div className="flex items-center space-x-2 mb-3">
                      <span className="text-lg">📺</span>
                      <h3 className="font-semibold">YouTube Channels</h3>
                    </div>
                    <div className="space-y-2 text-sm text-neutral-600">
                      <div>• Drone Valley (Latest videos)</div>
                      <div>• Peter McKinnon (Creative content)</div>
                      <div>• RC Groups (Community uploads)</div>
                    </div>
                  </div>

                  {/* RSS Sources */}
                  <div className="p-4 border border-neutral-200 rounded-lg">
                    <div className="flex items-center space-x-2 mb-3">
                      <span className="text-lg">📡</span>
                      <h3 className="font-semibold">RSS Feeds</h3>
                    </div>
                    <div className="space-y-2 text-sm text-neutral-600">
                      <div>• RC Groups Forums</div>
                      <div>• DroneDeploy Blog</div>
                      <div>• Hobby forum aggregates</div>
                    </div>
                  </div>

                  {/* Future Platforms */}
                  <div className="p-4 border border-dashed border-neutral-300 rounded-lg bg-neutral-50">
                    <div className="flex items-center space-x-2 mb-3">
                      <span className="text-lg">🔮</span>
                      <h3 className="font-semibold text-neutral-600">Coming Soon</h3>
                    </div>
                    <div className="space-y-2 text-sm text-neutral-500">
                      <div>• Instagram API integration</div>
                      <div>• Twitter/X API (when available)</div>
                      <div>• Facebook Groups API</div>
                      <div>• Discord server monitoring</div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">💡 How It Works</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Automatically collects posts from hobby-related social media sources</li>
                    <li>• Uses AI to analyze and categorize content by priority and sentiment</li>
                    <li>• Respects rate limits and terms of service for each platform</li>
                    <li>• Updates every few hours with fresh content and trending topics</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}