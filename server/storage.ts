import { categories, sources, posts, analytics, userVotes, userCurations, users, type Category, type Source, type Post, type Analytics, type InsertCategory, type InsertSource, type InsertPost, type InsertAnalytics, type FilterOptions, type UserVote, type UserCuration, type InsertUserVote, type InsertUserCuration, type User, type UpsertUser } from "@shared/schema";

export interface IStorage {
  // Categories
  getCategories(includeInactive?: boolean): Promise<Category[]>;
  getCategoryBySlug(slug: string): Promise<Category | undefined>;
  getCategoryById(id: number): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(id: number, updates: Partial<InsertCategory>): Promise<Category>;

  // Sources
  getSources(): Promise<Source[]>;
  getSourcesByCategory(categoryId: number): Promise<Source[]>;
  createSource(source: InsertSource): Promise<Source>;

  // Posts
  getPosts(filters?: FilterOptions): Promise<Post[]>;
  getPostById(id: number): Promise<Post | undefined>;
  getPostsByCategory(categoryId: number, filters?: FilterOptions): Promise<Post[]>;
  createPost(post: InsertPost): Promise<Post>;
  updatePost(id: number, updates: Partial<InsertPost>): Promise<Post>;
  deletePost(id: number): Promise<void>;

  // Analytics
  getAnalyticsByCategory(categoryId: number): Promise<Analytics | undefined>;
  updateAnalytics(categoryId: number, analytics: InsertAnalytics): Promise<Analytics>;

  // Search
  searchPosts(query: string, filters?: FilterOptions): Promise<Post[]>;

  // Voting and Curation
  votePost(userId: string, postId: number, voteType: 'upvote' | 'downvote'): Promise<void>;
  getUserVote(userId: string, postId: number): Promise<UserVote | undefined>;
  curatePost(userId: string, postId: number, curationType: string, reason?: string): Promise<void>;
  getUserCurations(userId: string): Promise<UserCuration[]>;

  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: UpsertUser): Promise<User>;
  upsertUser(user: UpsertUser): Promise<User>;
}

export class MemStorage implements IStorage {
  private categories: Map<number, Category>;
  private sources: Map<number, Source>;
  private posts: Map<number, Post>;
  private analytics: Map<number, Analytics>;
  private votes: Map<string, UserVote>; // key: userId-postId
  private curations: Map<number, UserCuration>;
  private users: Map<string, User>;
  private currentId: number;

  constructor() {
    this.categories = new Map();
    this.sources = new Map();
    this.posts = new Map();
    this.analytics = new Map();
    this.votes = new Map();
    this.curations = new Map();
    this.users = new Map();
    this.currentId = 1;

    // Initialize with sample data
    this.initializeData();
  }

  private initializeData() {
    // Create categories
    const dronesCategory = this.createCategorySync({
      name: "Drones",
      slug: "drones",
      description: "Consumer and commercial drone discussions",
      isActive: true,
    });

    const rcCarsCategory = this.createCategorySync({
      name: "RC Cars",
      slug: "rc-cars",
      description: "Remote control car enthusiasts",
      isActive: true,
    });

    const rcPlanesCategory = this.createCategorySync({
      name: "RC Planes",
      slug: "rc-planes",
      description: "Radio controlled aircraft discussions",
      isActive: true,
    });

    const fpvCategory = this.createCategorySync({
      name: "FPV Racing",
      slug: "fpv-racing",
      description: "First person view racing discussions",
      isActive: true,
    });

    // Create sources
    const redditSource = this.createSourceSync({
      name: "Reddit",
      url: "https://reddit.com/r/drones",
      type: "reddit",
      isActive: true,
    });

    const mavicPilotsSource = this.createSourceSync({
      name: "MavicPilots",
      url: "https://mavicpilots.com",
      type: "forum",
      isActive: true,
    });

    const phantomPilotsSource = this.createSourceSync({
      name: "PhantomPilots",
      url: "https://phantompilots.com",
      type: "forum",
      isActive: true,
    });

    const dronePilotsSource = this.createSourceSync({
      name: "DronePilots.community",
      url: "https://dronepilots.community",
      type: "community",
      isActive: true,
    });

    // Create sample posts based on the attached forum data
    this.createPostSync({
      title: "DJI Mavic 4 Pro Release Delays and US Availability Issues",
      content: "Major discussions around continued delays of the Mavic 4 Pro in US markets, with users debating firmware availability and comparing performance against FPV rigs. Key concerns include ND filter setups and panning stutter issues compared to FPV alternatives.",
      summary: "Major discussions around continued delays of the Mavic 4 Pro in US markets, with users debating firmware availability and comparing performance against FPV rigs. Key concerns include ND filter setups and panning stutter issues.",
      sourceId: redditSource.id,
      categoryId: dronesCategory.id,
      url: "https://reddit.com/r/drones/mavic-4-pro-delays",
      source: "Reddit",
      sentiment: "neutral",
      author: "DroneEnthusiast2024",
      publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      engagement: {
        comments: 156,
        upvotes: 89,
        views: 2100,
        upvotePercentage: 89,
      },
      tags: ["DJI", "Mavic 4 Pro", "Firmware", "US Market"],
      trendingScore: 95,
      priority: "hot",
    });

    this.createPostSync({
      title: "FAA Part 107 Renewal Experience - \"Fairly Basic\" Exam Focus",
      content: "Commercial pilots sharing insights on the latest Part 107 renewal exam. Reports indicate focus on logistics, crowd rules, and weather patterns, with notably no sectional chart questions appearing on recent tests. One poster described the revision exam as 'fairly basic'.",
      summary: "Commercial pilots sharing insights on the latest Part 107 renewal exam. Reports indicate focus on logistics, crowd rules, and weather patterns, with notably no sectional chart questions appearing on recent tests.",
      sourceId: redditSource.id,
      categoryId: dronesCategory.id,
      url: "https://reddit.com/r/drones/part-107-renewal",
      source: "Reddit",
      sentiment: "positive",
      author: "CommercialPilot",
      publishedAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
      engagement: {
        comments: 43,
        upvotes: 92,
        views: 1200,
        upvotePercentage: 92,
      },
      tags: ["FAA", "Part 107", "Commercial", "Regulations"],
      trendingScore: 88,
      priority: "trending",
    });

    this.createPostSync({
      title: "Amazon Delivery Drone Emergency Landing in Arizona Neighborhood",
      content: "Community analyzing the technical and regulatory implications of an Amazon Prime Air drone's emergency landing in a residential Arizona area. Discussion covers safety protocols, technical failures, and regulatory responses from both FAA and local authorities.",
      summary: "Community analyzing the technical and regulatory implications of an Amazon Prime Air drone's emergency landing in a residential Arizona area. Discussion covers safety protocols, technical failures, and regulatory responses.",
      sourceId: mavicPilotsSource.id,
      categoryId: dronesCategory.id,
      url: "https://mavicpilots.com/amazon-drone-emergency",
      source: "MavicPilots",
      sentiment: "negative",
      author: "AviationNews",
      publishedAt: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
      engagement: {
        comments: 78,
        upvotes: 0,
        views: 2100,
        upvotePercentage: 0,
      },
      tags: ["Amazon", "Delivery", "Emergency", "Arizona"],
      trendingScore: 82,
      priority: "news",
    });

    this.createPostSync({
      title: "BetaFPV Cetus X Battery Compatibility Crisis",
      content: "New FPV pilot seeking urgent advice on battery compatibility after losing included batteries for BetaFPV Cetus X. Community discussing third-party battery options and potential damage risks for beginners. User frantically asking about alternative battery options and damage prevention.",
      summary: "New FPV pilot seeking urgent advice on battery compatibility after losing included batteries for BetaFPV Cetus X. Community discussing third-party battery options and potential damage risks for beginners.",
      sourceId: redditSource.id,
      categoryId: fpvCategory.id,
      url: "https://reddit.com/r/drones/cetus-x-battery",
      source: "Reddit",
      sentiment: "neutral",
      author: "FPVNewbie",
      publishedAt: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 hours ago
      engagement: {
        comments: 29,
        upvotes: 85,
        views: 650,
        upvotePercentage: 85,
      },
      tags: ["BetaFPV", "Cetus X", "Batteries", "Beginner"],
      trendingScore: 75,
      priority: "help",
    });

    this.createPostSync({
      title: "DJI Market Dominance and Upcoming Release Rumors",
      content: "Analysis of DJI's continued market leadership (80% US, 60% global) alongside speculation about upcoming releases: Mini 5 Pro with 1\" sensor + LiDAR (Summer 2025), Mavic 4 Pro launch rumors (May 13, 2025), and new Action 6 camera. Discussion includes Power 2000 dock rumors.",
      summary: "Analysis of DJI's continued market leadership (80% US, 60% global) alongside speculation about upcoming releases: Mini 5 Pro with 1\" sensor + LiDAR (Summer 2025), Mavic 4 Pro launch rumors (May 13, 2025), and new Action 6 camera.",
      sourceId: dronePilotsSource.id,
      categoryId: dronesCategory.id,
      url: "https://dronepilots.community/dji-market-analysis",
      source: "DronePilots.community",
      sentiment: "positive",
      author: "MarketAnalyst",
      publishedAt: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
      engagement: {
        comments: 95,
        upvotes: 0,
        views: 3400,
        upvotePercentage: 0,
      },
      tags: ["DJI", "Market Share", "Mini 5 Pro", "2025 Releases"],
      trendingScore: 70,
      priority: "market",
    });

    // Initialize analytics
    this.updateAnalyticsSync(dronesCategory.id, {
      categoryId: dronesCategory.id,
      totalPosts: 2400,
      hotTopics: 124,
      trendingNow: 23,
      activeForums: 8,
    });
  }

  private createCategorySync(category: InsertCategory): Category {
    const id = this.currentId++;
    const newCategory: Category = { 
      ...category, 
      id,
      description: category.description || null,
      isActive: category.isActive !== undefined ? category.isActive : true
    };
    this.categories.set(id, newCategory);
    return newCategory;
  }

  private createSourceSync(source: InsertSource): Source {
    const id = this.currentId++;
    const newSource: Source = { 
      ...source, 
      id,
      isActive: source.isActive !== undefined ? source.isActive : true
    };
    this.sources.set(id, newSource);
    return newSource;
  }

  private createPostSync(post: InsertPost): Post {
    const id = this.currentId++;
    const newPost: Post = { 
      ...post, 
      id, 
      scrapedAt: new Date(),
      summary: post.summary || null,
      sourceId: post.sourceId || null,
      categoryId: post.categoryId || null,
      url: post.url || null,
      source: post.source || null,
      sentiment: post.sentiment || null,
      author: post.author || null,
      publishedAt: post.publishedAt || null,
      priority: post.priority || null,
      engagement: post.engagement || null,
      tags: post.tags || null,
      trendingScore: post.trendingScore || 0,
      upvotes: post.upvotes || 0,
      downvotes: post.downvotes || 0,
      userScore: post.userScore || 0,
      isCurated: post.isCurated || false,
      curatedBy: post.curatedBy || null,
      curatedAt: post.curatedAt || null
    };
    this.posts.set(id, newPost);
    return newPost;
  }

  private updateAnalyticsSync(categoryId: number, analytics: InsertAnalytics): Analytics {
    const id = this.currentId++;
    const newAnalytics: Analytics = { 
      ...analytics, 
      id, 
      lastUpdated: new Date(),
      categoryId: analytics.categoryId || null,
      totalPosts: analytics.totalPosts || null,
      hotTopics: analytics.hotTopics || null,
      trendingNow: analytics.trendingNow || null,
      activeForums: analytics.activeForums || null
    };
    this.analytics.set(categoryId, newAnalytics);
    return newAnalytics;
  }

  async getCategories(includeInactive: boolean = false): Promise<Category[]> {
    const allCategories = Array.from(this.categories.values());
    return includeInactive ? allCategories : allCategories.filter(c => c.isActive);
  }

  async getCategoryBySlug(slug: string): Promise<Category | undefined> {
    return Array.from(this.categories.values()).find(c => c.slug === slug);
  }

  async getCategoryById(id: number): Promise<Category | undefined> {
    return this.categories.get(id);
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    return this.createCategorySync(category);
  }

  async updateCategory(id: number, updates: Partial<InsertCategory>): Promise<Category> {
    const existing = this.categories.get(id);
    if (!existing) throw new Error("Category not found");
    
    const updated: Category = { 
      ...existing, 
      ...updates,
      description: updates.description !== undefined ? updates.description : existing.description,
      isActive: updates.isActive !== undefined ? updates.isActive : existing.isActive
    };
    this.categories.set(id, updated);
    return updated;
  }

  async getSources(): Promise<Source[]> {
    return Array.from(this.sources.values()).filter(s => s.isActive);
  }

  async getSourcesByCategory(categoryId: number): Promise<Source[]> {
    // For simplicity, return all sources (in real implementation, you'd filter by category)
    return this.getSources();
  }

  async createSource(source: InsertSource): Promise<Source> {
    return this.createSourceSync(source);
  }

  async getPosts(filters?: FilterOptions): Promise<Post[]> {
    let posts = Array.from(this.posts.values());
    
    if (filters) {
      if (filters.categories?.length) {
        const categoryIds = await this.getCategoryIdsBySlug(filters.categories);
        posts = posts.filter(p => categoryIds.includes(p.categoryId!));
      }
      
      if (filters.priorities?.length) {
        posts = posts.filter(p => filters.priorities!.includes(p.priority || 'normal'));
      }
      
      if (filters.timeRange) {
        const timeLimit = this.getTimeLimit(filters.timeRange);
        posts = posts.filter(p => p.publishedAt && p.publishedAt > timeLimit);
      }

      if (filters.search) {
        const query = filters.search.toLowerCase();
        posts = posts.filter(p => 
          p.title.toLowerCase().includes(query) ||
          p.content.toLowerCase().includes(query) ||
          p.tags?.some(tag => tag.toLowerCase().includes(query))
        );
      }
    }

    return this.sortPosts(posts, filters?.sortBy || 'recent');
  }

  async getPostById(id: number): Promise<Post | undefined> {
    return this.posts.get(id);
  }

  async getPostsByCategory(categoryId: number, filters?: FilterOptions): Promise<Post[]> {
    let posts = Array.from(this.posts.values()).filter(p => p.categoryId === categoryId);
    
    if (filters) {
      if (filters.timeRange) {
        const timeLimit = this.getTimeLimit(filters.timeRange);
        posts = posts.filter(p => p.publishedAt && p.publishedAt > timeLimit);
      }

      if (filters.search) {
        const query = filters.search.toLowerCase();
        posts = posts.filter(p => 
          p.title.toLowerCase().includes(query) ||
          p.content.toLowerCase().includes(query)
        );
      }
    }

    return this.sortPosts(posts, filters?.sortBy || 'recent');
  }

  async createPost(post: InsertPost): Promise<Post> {
    return this.createPostSync(post);
  }

  async updatePost(id: number, updates: Partial<InsertPost>): Promise<Post> {
    const existing = this.posts.get(id);
    if (!existing) throw new Error("Post not found");
    
    const updated = { ...existing, ...updates };
    this.posts.set(id, updated);
    return updated;
  }

  async deletePost(id: number): Promise<void> {
    this.posts.delete(id);
  }

  async getAnalyticsByCategory(categoryId: number): Promise<Analytics | undefined> {
    return this.analytics.get(categoryId);
  }

  async updateAnalytics(categoryId: number, analytics: InsertAnalytics): Promise<Analytics> {
    return this.updateAnalyticsSync(categoryId, analytics);
  }

  async searchPosts(query: string, filters?: FilterOptions): Promise<Post[]> {
    return this.getPosts({ ...filters, search: query });
  }

  private async getCategoryIdsBySlug(slugs: string[]): Promise<number[]> {
    const categories = await this.getCategories();
    return categories
      .filter(c => slugs.includes(c.slug))
      .map(c => c.id);
  }

  private getTimeLimit(timeRange: string): Date {
    const now = new Date();
    switch (timeRange) {
      case '24h': return new Date(now.getTime() - 24 * 60 * 60 * 1000);
      case '7d': return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      case '30d': return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      default: return new Date(0);
    }
  }

  private sortPosts(posts: Post[], sortBy: string): Post[] {
    switch (sortBy) {
      case 'popular':
        return posts.sort((a, b) => (b.trendingScore || 0) - (a.trendingScore || 0));
      case 'discussed':
        return posts.sort((a, b) => (b.engagement?.comments || 0) - (a.engagement?.comments || 0));
      case 'community':
        return posts.sort((a, b) => (b.userScore || 0) - (a.userScore || 0));
      case 'recent':
      default:
        return posts.sort((a, b) => 
          (b.publishedAt?.getTime() || 0) - (a.publishedAt?.getTime() || 0)
        );
    }
  }

  // Voting and Curation Methods
  async votePost(userId: string, postId: number, voteType: 'upvote' | 'downvote'): Promise<void> {
    const voteKey = `${userId}-${postId}`;
    const existingVote = this.votes.get(voteKey);
    const post = this.posts.get(postId);
    
    if (!post) throw new Error("Post not found");

    // Remove existing vote if any
    if (existingVote) {
      if (existingVote.voteType === 'upvote') {
        post.upvotes = Math.max(0, (post.upvotes || 0) - 1);
      } else {
        post.downvotes = Math.max(0, (post.downvotes || 0) - 1);
      }
      this.votes.delete(voteKey);
    }

    // Add new vote if different from existing
    if (!existingVote || existingVote.voteType !== voteType) {
      const newVote: UserVote = {
        id: this.currentId++,
        userId,
        postId,
        voteType,
        createdAt: new Date()
      };
      
      this.votes.set(voteKey, newVote);
      
      if (voteType === 'upvote') {
        post.upvotes = (post.upvotes || 0) + 1;
      } else {
        post.downvotes = (post.downvotes || 0) + 1;
      }
    }

    // Update community score
    post.userScore = (post.upvotes || 0) - (post.downvotes || 0);
    this.posts.set(postId, post);
  }

  async getUserVote(userId: string, postId: number): Promise<UserVote | undefined> {
    const voteKey = `${userId}-${postId}`;
    return this.votes.get(voteKey);
  }

  async curatePost(userId: string, postId: number, curationType: string, reason?: string): Promise<void> {
    const post = this.posts.get(postId);
    if (!post) throw new Error("Post not found");

    const curation: UserCuration = {
      id: this.currentId++,
      userId,
      postId,
      curationType,
      reason: reason || null,
      createdAt: new Date()
    };

    this.curations.set(curation.id, curation);

    // Update post curation status if this is a feature action
    if (curationType === 'feature') {
      post.isCurated = true;
      post.curatedBy = userId;
      post.curatedAt = new Date();
      this.posts.set(postId, post);
    }
  }

  async getUserCurations(userId: string): Promise<UserCuration[]> {
    return Array.from(this.curations.values()).filter(c => c.userId === userId);
  }

  // User operations
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(u => u.email === email);
  }

  async createUser(userData: UpsertUser): Promise<User> {
    const user: User = {
      ...userData,
      createdAt: new Date(),
      updatedAt: new Date(),
      email: userData.email || null,
      firstName: userData.firstName || null,
      lastName: userData.lastName || null,
      profileImageUrl: userData.profileImageUrl || null,
      passwordHash: userData.passwordHash || null,
    };
    this.users.set(userData.id, user);
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const existingUser = this.users.get(userData.id);
    const user: User = {
      ...userData,
      createdAt: existingUser?.createdAt || new Date(),
      updatedAt: new Date(),
      email: userData.email || null,
      firstName: userData.firstName || null,
      lastName: userData.lastName || null,
      profileImageUrl: userData.profileImageUrl || null,
      passwordHash: userData.passwordHash !== undefined ? userData.passwordHash : existingUser?.passwordHash || null,
    };
    this.users.set(userData.id, user);
    return user;
  }
}

import { DatabaseStorage } from './database-storage';

// Switch to database storage for production
export const storage = new DatabaseStorage();
