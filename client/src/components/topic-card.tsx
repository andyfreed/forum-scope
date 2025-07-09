import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ExternalLink, MessageCircle, Heart, Eye } from "lucide-react";
import type { Post } from "@shared/schema";

interface TopicCardProps {
  post: Post;
  priorityColor: string;
  priorityIcon: string;
}

const priorityConfig = {
  hot: { color: 'bg-orange-500 text-white border-orange-200', icon: '🔥' },
  trending: { color: 'bg-green-500 text-white border-green-200', icon: '📈' },
  news: { color: 'bg-yellow-500 text-white border-yellow-200', icon: '⚠️' },
  help: { color: 'bg-purple-500 text-white border-purple-200', icon: '❓' },
  market: { color: 'bg-indigo-500 text-white border-indigo-200', icon: '📊' },
  normal: { color: 'bg-neutral-400 text-white border-neutral-200', icon: '📄' }
};

export default function TopicCard({ post, priorityColor, priorityIcon }: TopicCardProps) {
  const config = priorityConfig[post.priority as keyof typeof priorityConfig] || priorityConfig.normal;
  
  const formatTimeAgo = (date: Date | string | null) => {
    if (!date) return "Unknown";
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - dateObj.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'text-green-600';
      case 'negative': return 'text-red-600';
      default: return 'text-neutral-600';
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow duration-200 border border-neutral-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <Badge className={`text-xs ${config.color}`}>
                <span className="mr-1">{config.icon}</span>
                {post.priority?.toUpperCase() || 'NORMAL'}
              </Badge>
              {post.trendingScore && post.trendingScore > 70 && (
                <Badge variant="outline" className="text-xs text-orange-600 border-orange-300">
                  Trending {post.trendingScore}%
                </Badge>
              )}
            </div>
            <h3 className="text-lg font-semibold text-neutral-900 leading-tight mb-2">
              {post.title}
            </h3>
            <div className="flex items-center text-xs text-neutral-500 space-x-4">
              <span>By {post.author}</span>
              <span>{post.source}</span>
              <span>{formatTimeAgo(post.publishedAt)}</span>
              {post.sentiment && (
                <span className={getSentimentColor(post.sentiment)}>
                  {post.sentiment}
                </span>
              )}
            </div>
          </div>
          <a 
            href={post.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="ml-4 text-neutral-400 hover:text-primary transition-colors"
          >
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-neutral-700 text-sm leading-relaxed mb-4">
          {post.summary || post.content.substring(0, 200) + "..."}
        </p>
        
        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {post.tags.slice(0, 5).map((tag, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Engagement metrics */}
        {post.engagement && (
          <div className="flex items-center text-xs text-neutral-500 space-x-4 pt-2 border-t border-neutral-100">
            {post.engagement.comments && (
              <div className="flex items-center space-x-1">
                <MessageCircle className="h-3 w-3" />
                <span>{post.engagement.comments}</span>
              </div>
            )}
            {post.engagement.upvotes && (
              <div className="flex items-center space-x-1">
                <Heart className="h-3 w-3" />
                <span>{post.engagement.upvotes}</span>
              </div>
            )}
            {post.engagement.views && (
              <div className="flex items-center space-x-1">
                <Eye className="h-3 w-3" />
                <span>{post.engagement.views}</span>
              </div>
            )}
            {post.engagement.upvotePercentage && (
              <span className="text-green-600">
                {post.engagement.upvotePercentage}% upvoted
              </span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}