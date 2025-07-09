import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, MessageCircle, ArrowUp, Eye, ExternalLink, Bookmark } from "lucide-react";
import type { Post } from "@shared/schema";

interface TopicCardProps {
  post: Post;
  priorityColor: string;
  priorityIcon: string;
}

export default function TopicCard({ post, priorityColor, priorityIcon }: TopicCardProps) {
  const [isBookmarked, setIsBookmarked] = useState(false);

  const formatTimeAgo = (date: Date | string | null) => {
    if (!date) return "Unknown";
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - dateObj.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    return `${Math.floor(diffInHours / 24)} days ago`;
  };

  const getSourceIcon = (sourceName: string) => {
    switch (sourceName) {
      case 'Reddit': return '🟠';
      case 'MavicPilots': return '🌐';
      case 'PhantomPilots': return '🌐';
      case 'DronePilots.community': return '🌍';
      default: return '📄';
    }
  };

  // Find source name by ID (in real app, this would be joined data)
  const getSourceName = (sourceId: number | null) => {
    const sourceMap: { [key: number]: string } = {
      1: 'Reddit',
      2: 'MavicPilots', 
      3: 'PhantomPilots',
      4: 'DronePilots.community'
    };
    return sourceMap[sourceId || 0] || 'Unknown';
  };

  const sourceName = getSourceName(post.sourceId);

  return (
    <Card className="border border-neutral-200 hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Badge className={`${priorityColor} text-xs font-medium`}>
              <span className="mr-1">{priorityIcon}</span>
              {post.priority?.toUpperCase() || 'NORMAL'}
            </Badge>
            <div className="text-xs text-neutral-500 flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              {formatTimeAgo(post.publishedAt)}
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsBookmarked(!isBookmarked)}
            className="text-neutral-400 hover:text-neutral-600"
          >
            <Bookmark className={`h-4 w-4 ${isBookmarked ? 'fill-current' : ''}`} />
          </Button>
        </div>

        <h3 className="text-lg font-semibold text-neutral-900 mb-2 line-clamp-2">
          {post.title}
        </h3>
        
        <p className="text-neutral-700 mb-4 line-clamp-3">
          {post.summary || post.content}
        </p>

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {post.tags.slice(0, 4).map((tag, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Sources and Engagement */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 text-sm text-neutral-600">
            <span className="flex items-center">
              <span className="mr-1">{getSourceIcon(sourceName)}</span>
              {sourceName}
            </span>
            {post.engagement && (
              <>
                <span className="flex items-center">
                  <MessageCircle className="h-3 w-3 mr-1" />
                  {post.engagement.comments} comments
                </span>
                {post.engagement.upvotes > 0 && (
                  <span className="flex items-center">
                    <ArrowUp className="h-3 w-3 mr-1" />
                    {post.engagement.upvotePercentage}% upvoted
                  </span>
                )}
                {post.engagement.views > 0 && (
                  <span className="flex items-center">
                    <Eye className="h-3 w-3 mr-1" />
                    {post.engagement.views > 1000 
                      ? `${(post.engagement.views / 1000).toFixed(1)}k` 
                      : post.engagement.views} views
                  </span>
                )}
              </>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="link" size="sm" className="text-primary hover:text-blue-700 p-0">
              View Discussion
            </Button>
            <Button variant="ghost" size="sm" className="text-neutral-400 hover:text-neutral-600">
              <ExternalLink className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
