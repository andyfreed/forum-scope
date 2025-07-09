import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import Header from "@/components/header";
import SidebarFilters from "@/components/sidebar-filters";
import StatsBar from "@/components/stats-bar";
import TopicCard from "@/components/topic-card";
import LiveFeed from "@/components/live-feed";
import SocialMediaDashboard from "@/components/social-media-dashboard";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Grid3x3, List, Loader2 } from "lucide-react";
import type { Post, Category, FilterOptions } from "@shared/schema";

export default function Home() {
  const [location] = useLocation();
  const categorySlug = location.split('/')[2]; // Extract slug from /category/:slug
  
  const [filters, setFilters] = useState<FilterOptions>({
    categories: categorySlug ? [categorySlug] : ['drones'],
    timeRange: '24h',
    sortBy: 'recent'
  });
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [showSocialMedia, setShowSocialMedia] = useState(false);
  const [displayLimit, setDisplayLimit] = useState(10);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Fetch categories
  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });

  // Fetch posts with filters
  const { data: posts = [], isLoading } = useQuery<Post[]>({
    queryKey: ['/api/posts', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.categories?.length) params.set('categories', filters.categories.join(','));
      if (filters.sources?.length) params.set('sources', filters.sources.join(','));
      if (filters.priorities?.length) params.set('priorities', filters.priorities.join(','));
      if (filters.timeRange) params.set('timeRange', filters.timeRange);
      if (filters.sortBy) params.set('sortBy', filters.sortBy);
      if (filters.search) params.set('search', filters.search);
      
      const response = await fetch(`/api/posts?${params}`);
      if (!response.ok) throw new Error('Failed to fetch posts');
      return response.json();
    },
  });

  // Get current category for display
  const currentCategory = categories.find(c => c.slug === (filters.categories?.[0] || 'drones'));

  const updateFilters = (newFilters: Partial<FilterOptions>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setDisplayLimit(10); // Reset display limit when filters change
  };

  const handleLoadMore = async () => {
    setIsLoadingMore(true);
    // Simulate loading delay for better UX
    await new Promise(resolve => setTimeout(resolve, 500));
    setDisplayLimit(prev => prev + 10);
    setIsLoadingMore(false);
  };

  const priorityColors = {
    hot: 'bg-accent-orange text-white',
    trending: 'bg-success text-white', 
    news: 'bg-yellow-500 text-white',
    help: 'bg-purple-500 text-white',
    market: 'bg-indigo-500 text-white',
    normal: 'bg-neutral-400 text-white'
  };

  const priorityIcons = {
    hot: '🔥',
    trending: '📈',
    news: '⚠️',
    help: '❓',
    market: '📊',
    normal: '📄'
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <Header onSearch={(query) => updateFilters({ search: query })} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <Header onSearch={(query) => updateFilters({ search: query })} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 sm:py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar - Hidden on mobile, shown on desktop */}
          <div className="hidden lg:block w-64 flex-shrink-0 space-y-6">
            <SidebarFilters 
              filters={filters}
              onFiltersChange={updateFilters}
              categories={categories}
            />
            
            {/* Social Media Toggle */}
            <Card className="p-4">
              <h3 className="font-semibold text-sm mb-3">Social Media</h3>
              <Button
                variant={showSocialMedia ? "default" : "outline"}
                size="sm"
                onClick={() => setShowSocialMedia(!showSocialMedia)}
                className="w-full"
              >
                {showSocialMedia ? "Hide" : "Show"} Social Dashboard
              </Button>
            </Card>
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Mobile Filters */}
            <div className="lg:hidden mb-4">
              <SidebarFilters 
                filters={filters}
                onFiltersChange={updateFilters}
                categories={categories}
              />
            </div>
            
            {/* Social Media Dashboard */}
            {showSocialMedia && (
              <div className="mb-6">
                <SocialMediaDashboard />
              </div>
            )}
            
            {/* Live Feed */}
            <LiveFeed />
            
            {/* Stats Bar */}
            <StatsBar categorySlug={currentCategory?.slug} />

            {/* Content Controls */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                <h2 className="text-lg sm:text-xl font-semibold text-neutral-900">
                  Trending in {currentCategory?.name || 'All Categories'}
                </h2>
                <span className="bg-primary text-white px-3 py-1 rounded-full text-sm w-fit">Live</span>
              </div>
              <div className="flex items-center space-x-2 w-full sm:w-auto">
                <Select value={filters.sortBy} onValueChange={(value: any) => updateFilters({ sortBy: value })}>
                  <SelectTrigger className="w-full sm:w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recent">Most Recent</SelectItem>
                    <SelectItem value="popular">Most Popular</SelectItem>
                    <SelectItem value="discussed">Most Discussed</SelectItem>
                    <SelectItem value="community">Community Score</SelectItem>
                  </SelectContent>
                </Select>
                <div className="hidden sm:flex items-center space-x-2">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                  >
                    <Grid3x3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Topic Cards */}
            {posts.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-neutral-600">No posts found matching your filters.</p>
              </Card>
            ) : (
              <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 gap-4' : 'space-y-4'}>
                {posts.slice(0, displayLimit).map((post) => (
                  <TopicCard 
                    key={post.id} 
                    post={post}
                    priorityColor={priorityColors[post.priority || 'normal']}
                    priorityIcon={priorityIcons[post.priority || 'normal']}
                  />
                ))}
              </div>
            )}

            {/* Load More */}
            {posts.length > displayLimit && (
              <div className="text-center mt-8">
                <Button 
                  className="bg-primary text-white hover:bg-blue-700"
                  onClick={handleLoadMore}
                  disabled={isLoadingMore}
                >
                  {isLoadingMore ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Loading...
                    </>
                  ) : (
                    `Load More Topics (${posts.length - displayLimit} remaining)`
                  )}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
