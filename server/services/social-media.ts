import axios from 'axios';
import * as cheerio from 'cheerio';
import Parser from 'rss-parser';
import { analyzeForumContent } from './openai';
import { storage } from '../storage';
import type { InsertPost } from '@shared/schema';

interface SocialMediaPost {
  id: string;
  title: string;
  content: string;
  author: string;
  url: string;
  publishedAt: Date;
  platform: 'reddit' | 'twitter' | 'youtube' | 'rss';
  subreddit?: string;
  score?: number;
  comments?: number;
  thumbnail?: string;
}

interface RedditPost {
  id: string;
  title: string;
  selftext: string;
  author: string;
  permalink: string;
  created_utc: number;
  subreddit: string;
  score: number;
  num_comments: number;
  thumbnail: string;
  url: string;
}

export class SocialMediaIntegrator {
  private rssParser: Parser;
  
  constructor() {
    this.rssParser = new Parser({
      timeout: 10000,
      headers: {
        'User-Agent': 'ForumScope Bot 1.0'
      }
    });
  }

  // Reddit JSON API (no authentication required for public data)
  async scrapeRedditSubreddit(subreddit: string, limit: number = 25): Promise<SocialMediaPost[]> {
    try {
      const url = `https://www.reddit.com/r/${subreddit}/hot.json?limit=${limit}`;
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'ForumScope Bot 1.0 (for hobby forum aggregation)'
        },
        timeout: 15000
      });

      const posts = response.data.data.children.map((child: any) => {
        const post: RedditPost = child.data;
        return {
          id: `reddit_${post.id}`,
          title: post.title,
          content: post.selftext || `Posted to r/${post.subreddit}`,
          author: post.author,
          url: `https://reddit.com${post.permalink}`,
          publishedAt: new Date(post.created_utc * 1000),
          platform: 'reddit' as const,
          subreddit: post.subreddit,
          score: post.score,
          comments: post.num_comments,
          thumbnail: post.thumbnail !== 'self' ? post.thumbnail : undefined
        };
      });

      return posts;
    } catch (error) {
      console.error(`Failed to scrape r/${subreddit}:`, error);
      return [];
    }
  }

  // YouTube RSS feeds for hobby channels
  async scrapeYouTubeChannel(channelId: string): Promise<SocialMediaPost[]> {
    try {
      const rssUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;
      const feed = await this.rssParser.parseURL(rssUrl);
      
      const posts = feed.items?.slice(0, 10).map(item => ({
        id: `youtube_${item.guid?.split(':').pop()}`,
        title: item.title || 'Untitled Video',
        content: item.contentSnippet || item.content || 'YouTube video content',
        author: item.author || feed.title || 'Unknown',
        url: item.link || '',
        publishedAt: new Date(item.pubDate || item.isoDate || Date.now()),
        platform: 'youtube' as const,
        thumbnail: this.extractYouTubeThumbnail(item.link || '')
      })) || [];

      return posts;
    } catch (error) {
      console.error(`Failed to scrape YouTube channel ${channelId}:`, error);
      return [];
    }
  }

  private extractYouTubeThumbnail(videoUrl: string): string | undefined {
    const videoId = videoUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
    return videoId ? `https://img.youtube.com/vi/${videoId[1]}/mqdefault.jpg` : undefined;
  }

  // RSS feeds for hobby blogs and forums
  async scrapeRSSFeed(feedUrl: string, sourceName: string): Promise<SocialMediaPost[]> {
    try {
      const feed = await this.rssParser.parseURL(feedUrl);
      
      const posts = feed.items?.slice(0, 15).map(item => ({
        id: `rss_${Buffer.from(item.link || item.guid || '').toString('base64').slice(0, 16)}`,
        title: item.title || 'Untitled Post',
        content: item.contentSnippet || item.content || 'RSS feed content',
        author: item.creator || item.author || sourceName,
        url: item.link || '',
        publishedAt: new Date(item.pubDate || item.isoDate || Date.now()),
        platform: 'rss' as const
      })) || [];

      return posts;
    } catch (error) {
      console.error(`Failed to scrape RSS feed ${feedUrl}:`, error);
      return [];
    }
  }

  // Aggregate all social media sources
  async aggregateAllSources(): Promise<void> {
    console.log('Starting social media aggregation...');
    
    const sources = [
      // Reddit hobby subreddits
      { type: 'reddit', identifier: 'drones', category: 'drones' },
      { type: 'reddit', identifier: 'radiocontrol', category: 'rc-cars' },
      { type: 'reddit', identifier: 'fpv', category: 'drones' },
      { type: 'reddit', identifier: 'Multicopter', category: 'drones' },
      { type: 'reddit', identifier: 'rccars', category: 'rc-cars' },
      { type: 'reddit', identifier: 'radiocontrol', category: 'rc-cars' },
      { type: 'reddit', identifier: 'woodworking', category: 'woodworking' },
      { type: 'reddit', identifier: 'DIY', category: 'diy' },
      
      // YouTube channels (example hobby channels)
      { type: 'youtube', identifier: 'UCiVmHW7d57ICmEf9WGIp1CA', category: 'drones' }, // Peter McKinnon
      { type: 'youtube', identifier: 'UC3ioIOr3tH6Yz8qzr418R-g', category: 'drones' }, // Drone Valley
      
      // RSS feeds for hobby sites
      { type: 'rss', identifier: 'https://www.rcgroups.com/forums/-/index.rss', category: 'rc-cars', name: 'RC Groups' },
      { type: 'rss', identifier: 'https://blog.dronedeploy.com/feed', category: 'drones', name: 'DroneDeploy Blog' },
    ];

    const allPosts: SocialMediaPost[] = [];

    for (const source of sources) {
      try {
        let posts: SocialMediaPost[] = [];
        
        switch (source.type) {
          case 'reddit':
            posts = await this.scrapeRedditSubreddit(source.identifier);
            break;
          case 'youtube':
            posts = await this.scrapeYouTubeChannel(source.identifier);
            break;
          case 'rss':
            posts = await this.scrapeRSSFeed(source.identifier, source.name || 'RSS Feed');
            break;
        }

        // Add category information
        posts.forEach(post => {
          (post as any).categorySlug = source.category;
        });

        allPosts.push(...posts);
        
        // Add delay between API calls to be respectful
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (error) {
        console.error(`Failed to process source ${source.identifier}:`, error);
      }
    }

    console.log(`Collected ${allPosts.length} posts from social media sources`);
    
    // Process and store posts
    await this.processAndStorePosts(allPosts);
  }

  private async processAndStorePosts(socialPosts: SocialMediaPost[]): Promise<void> {
    const categories = await storage.getCategories();
    const categoryMap = new Map(categories.map(cat => [cat.slug, cat.id]));

    for (const socialPost of socialPosts) {
      try {
        // Check if post already exists
        const existingPosts = await storage.getPosts();
        const exists = existingPosts.some(p => p.url === socialPost.url);
        if (exists) continue;

        // Get category ID
        const categorySlug = (socialPost as any).categorySlug || 'general';
        const categoryId = categoryMap.get(categorySlug);
        if (!categoryId) continue;

        // Analyze content with AI
        const analysis = await analyzeForumContent(socialPost.title, socialPost.content);
        
        // Create post object
        const newPost: InsertPost = {
          title: socialPost.title,
          content: socialPost.content,
          summary: analysis.summary,
          author: socialPost.author,
          url: socialPost.url,
          source: this.getPlatformDisplayName(socialPost.platform),
          categoryId: categoryId,
          publishedAt: socialPost.publishedAt,
          tags: analysis.tags,
          priority: analysis.priority,
          trendingScore: analysis.trendingScore,
          sentiment: analysis.sentiment,
          engagement: socialPost.score || socialPost.comments ? {
            upvotes: socialPost.score || 0,
            comments: socialPost.comments || 0,
            views: 0,
            upvotePercentage: 85 // Default for social media
          } : undefined
        };

        await storage.createPost(newPost);
        console.log(`Added social media post: ${socialPost.title} from ${socialPost.platform}`);
        
        // Small delay between AI calls
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`Failed to process post ${socialPost.title}:`, error);
      }
    }
  }

  private getPlatformDisplayName(platform: string): string {
    const names: Record<string, string> = {
      reddit: 'Reddit',
      youtube: 'YouTube',
      twitter: 'Twitter/X',
      rss: 'RSS Feed'
    };
    return names[platform] || platform;
  }

  // Get trending topics across all social platforms
  async getTrendingTopics(timeRange: string = '24h'): Promise<any> {
    const posts = await storage.getPosts({ 
      timeRange: timeRange as any,
      sortBy: 'popular'
    });

    // Filter social media posts
    const socialPosts = posts.filter(post => 
      ['Reddit', 'YouTube', 'Twitter/X', 'RSS Feed'].includes(post.source)
    );

    // Analyze trending topics
    const topicFrequency: Record<string, number> = {};
    const platformBreakdown: Record<string, number> = {};

    socialPosts.forEach(post => {
      // Count platform sources
      platformBreakdown[post.source] = (platformBreakdown[post.source] || 0) + 1;
      
      // Count tag frequency
      post.tags?.forEach(tag => {
        topicFrequency[tag.toLowerCase()] = (topicFrequency[tag.toLowerCase()] || 0) + 1;
      });
    });

    const trendingTags = Object.entries(topicFrequency)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([tag, count]) => ({ tag, count }));

    return {
      totalPosts: socialPosts.length,
      platformBreakdown,
      trendingTags,
      timeRange,
      lastUpdated: new Date()
    };
  }
}

export const socialMediaIntegrator = new SocialMediaIntegrator();