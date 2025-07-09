import { db } from './db';
import { eq, and, desc, asc, like, sql, count } from 'drizzle-orm';
import {
  categories,
  sources,
  posts,
  analytics,
  userVotes,
  userCurations,
  users,
  type Category,
  type Source,
  type Post,
  type Analytics,
  type InsertCategory,
  type InsertSource,
  type InsertPost,
  type InsertAnalytics,
  type FilterOptions,
  type UserVote,
  type UserCuration,
  type InsertUserVote,
  type InsertUserCuration,
  type User,
  type UpsertUser,
} from '@shared/schema';
import { IStorage } from './storage';

export class DatabaseStorage implements IStorage {
  // Categories
  async getCategories(includeInactive: boolean = false): Promise<Category[]> {
    const result = await db.select().from(categories).orderBy(categories.name);
    return includeInactive ? result : result.filter(c => c.isActive);
  }

  async getCategoryBySlug(slug: string): Promise<Category | undefined> {
    const result = await db.select().from(categories).where(eq(categories.slug, slug));
    return result[0];
  }

  async getCategoryById(id: number): Promise<Category | undefined> {
    const result = await db.select().from(categories).where(eq(categories.id, id));
    return result[0];
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const result = await db.insert(categories).values(category).returning();
    return result[0];
  }

  async updateCategory(id: number, updates: Partial<InsertCategory>): Promise<Category> {
    const result = await db
      .update(categories)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(categories.id, id))
      .returning();
    return result[0];
  }

  // Sources
  async getSources(): Promise<Source[]> {
    return await db.select().from(sources).orderBy(sources.name);
  }

  async getSourcesByCategory(categoryId: number): Promise<Source[]> {
    return await db.select().from(sources).where(eq(sources.categoryId, categoryId));
  }

  async createSource(source: InsertSource): Promise<Source> {
    const result = await db.insert(sources).values(source).returning();
    return result[0];
  }

  // Posts
  async getPosts(filters?: FilterOptions): Promise<Post[]> {
    let query = db.select().from(posts);

    if (filters?.categories?.length) {
      const categoryIds = await this.getCategoryIdsBySlug(filters.categories);
      if (categoryIds.length) {
        query = query.where(sql`${posts.categoryId} IN (${sql.join(categoryIds.map(id => sql`${id}`), sql`, `)})`);
      }
    }

    if (filters?.sources?.length) {
      const sourceNames = filters.sources.map(s => sql`${s}`);
      query = query.where(sql`${posts.source} IN (${sql.join(sourceNames, sql`, `)})`);
    }

    if (filters?.priorities?.length) {
      const priorityValues = filters.priorities.map(p => sql`${p}`);
      query = query.where(sql`${posts.priority} IN (${sql.join(priorityValues, sql`, `)})`);
    }

    if (filters?.timeRange) {
      const timeLimit = this.getTimeLimit(filters.timeRange);
      query = query.where(sql`${posts.publishedAt} >= ${timeLimit}`);
    }

    if (filters?.search) {
      const searchTerm = `%${filters.search}%`;
      query = query.where(
        sql`${posts.title} ILIKE ${searchTerm} OR ${posts.content} ILIKE ${searchTerm}`
      );
    }

    // Apply sorting
    switch (filters?.sortBy) {
      case 'newest':
        query = query.orderBy(desc(posts.publishedAt));
        break;
      case 'oldest':
        query = query.orderBy(asc(posts.publishedAt));
        break;
      case 'popular':
        query = query.orderBy(desc(posts.upvotes));
        break;
      case 'trending':
        query = query.orderBy(desc(posts.trendingScore));
        break;
      case 'community':
        query = query.orderBy(desc(sql`${posts.upvotes} - ${posts.downvotes}`));
        break;
      default:
        query = query.orderBy(desc(posts.publishedAt));
    }

    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    return await query;
  }

  async getPostById(id: number): Promise<Post | undefined> {
    const result = await db.select().from(posts).where(eq(posts.id, id));
    return result[0];
  }

  async getPostsByCategory(categoryId: number, filters?: FilterOptions): Promise<Post[]> {
    const categoryFilters = { ...filters, categories: undefined };
    let query = db.select().from(posts).where(eq(posts.categoryId, categoryId));

    if (filters?.sources?.length) {
      const sourceNames = filters.sources.map(s => sql`${s}`);
      query = query.where(sql`${posts.source} IN (${sql.join(sourceNames, sql`, `)})`);
    }

    if (filters?.priorities?.length) {
      const priorityValues = filters.priorities.map(p => sql`${p}`);
      query = query.where(sql`${posts.priority} IN (${sql.join(priorityValues, sql`, `)})`);
    }

    if (filters?.timeRange) {
      const timeLimit = this.getTimeLimit(filters.timeRange);
      query = query.where(sql`${posts.publishedAt} >= ${timeLimit}`);
    }

    if (filters?.search) {
      const searchTerm = `%${filters.search}%`;
      query = query.where(
        sql`${posts.title} ILIKE ${searchTerm} OR ${posts.content} ILIKE ${searchTerm}`
      );
    }

    // Apply sorting
    switch (filters?.sortBy) {
      case 'newest':
        query = query.orderBy(desc(posts.publishedAt));
        break;
      case 'oldest':
        query = query.orderBy(asc(posts.publishedAt));
        break;
      case 'popular':
        query = query.orderBy(desc(posts.upvotes));
        break;
      case 'trending':
        query = query.orderBy(desc(posts.trendingScore));
        break;
      case 'community':
        query = query.orderBy(desc(sql`${posts.upvotes} - ${posts.downvotes}`));
        break;
      default:
        query = query.orderBy(desc(posts.publishedAt));
    }

    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    return await query;
  }

  async createPost(post: InsertPost): Promise<Post> {
    const result = await db.insert(posts).values(post).returning();
    return result[0];
  }

  async updatePost(id: number, updates: Partial<InsertPost>): Promise<Post> {
    const result = await db
      .update(posts)
      .set(updates)
      .where(eq(posts.id, id))
      .returning();
    return result[0];
  }

  async deletePost(id: number): Promise<void> {
    await db.delete(posts).where(eq(posts.id, id));
  }

  // Analytics
  async getAnalyticsByCategory(categoryId: number): Promise<Analytics | undefined> {
    const result = await db.select().from(analytics).where(eq(analytics.categoryId, categoryId));
    return result[0];
  }

  async updateAnalytics(categoryId: number, analyticsData: InsertAnalytics): Promise<Analytics> {
    const existing = await this.getAnalyticsByCategory(categoryId);
    
    if (existing) {
      const result = await db
        .update(analytics)
        .set({ ...analyticsData, lastUpdated: new Date() })
        .where(eq(analytics.categoryId, categoryId))
        .returning();
      return result[0];
    } else {
      const result = await db
        .insert(analytics)
        .values({ ...analyticsData, categoryId })
        .returning();
      return result[0];
    }
  }

  // Search
  async searchPosts(query: string, filters?: FilterOptions): Promise<Post[]> {
    return this.getPosts({ ...filters, search: query });
  }

  // Voting and Curation
  async votePost(userId: string, postId: number, voteType: 'upvote' | 'downvote'): Promise<void> {
    const existingVote = await db
      .select()
      .from(userVotes)
      .where(and(eq(userVotes.userId, userId), eq(userVotes.postId, postId)));

    if (existingVote.length > 0) {
      const currentVote = existingVote[0];
      if (currentVote.voteType === voteType) {
        // Remove vote if clicking the same vote type
        await db.delete(userVotes).where(eq(userVotes.id, currentVote.id));
        
        // Update post counts
        if (voteType === 'upvote') {
          await db
            .update(posts)
            .set({ upvotes: sql`${posts.upvotes} - 1` })
            .where(eq(posts.id, postId));
        } else {
          await db
            .update(posts)
            .set({ downvotes: sql`${posts.downvotes} - 1` })
            .where(eq(posts.id, postId));
        }
      } else {
        // Change vote type
        await db
          .update(userVotes)
          .set({ voteType })
          .where(eq(userVotes.id, currentVote.id));
        
        // Update post counts
        if (voteType === 'upvote') {
          await db
            .update(posts)
            .set({ 
              upvotes: sql`${posts.upvotes} + 1`,
              downvotes: sql`${posts.downvotes} - 1`
            })
            .where(eq(posts.id, postId));
        } else {
          await db
            .update(posts)
            .set({ 
              upvotes: sql`${posts.upvotes} - 1`,
              downvotes: sql`${posts.downvotes} + 1`
            })
            .where(eq(posts.id, postId));
        }
      }
    } else {
      // Create new vote
      await db.insert(userVotes).values({
        userId,
        postId,
        voteType
      });
      
      // Update post counts
      if (voteType === 'upvote') {
        await db
          .update(posts)
          .set({ upvotes: sql`${posts.upvotes} + 1` })
          .where(eq(posts.id, postId));
      } else {
        await db
          .update(posts)
          .set({ downvotes: sql`${posts.downvotes} + 1` })
          .where(eq(posts.id, postId));
      }
    }
  }

  async getUserVote(userId: string, postId: number): Promise<UserVote | undefined> {
    const result = await db
      .select()
      .from(userVotes)
      .where(and(eq(userVotes.userId, userId), eq(userVotes.postId, postId)));
    return result[0];
  }

  async curatePost(userId: string, postId: number, curationType: string, reason?: string): Promise<void> {
    await db.insert(userCurations).values({
      userId,
      postId,
      curationType,
      reason: reason || null
    });

    // Update post curation status if this is a feature action
    if (curationType === 'feature') {
      await db
        .update(posts)
        .set({
          isCurated: true,
          curatedBy: userId,
          curatedAt: new Date()
        })
        .where(eq(posts.id, postId));
    }
  }

  async getUserCurations(userId: string): Promise<UserCuration[]> {
    return await db.select().from(userCurations).where(eq(userCurations.userId, userId));
  }

  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0];
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const result = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return result[0];
  }

  // Helper methods
  private async getCategoryIdsBySlug(slugs: string[]): Promise<number[]> {
    const slugValues = slugs.map(s => sql`${s}`);
    const result = await db
      .select({ id: categories.id })
      .from(categories)
      .where(sql`${categories.slug} IN (${sql.join(slugValues, sql`, `)})`);
    return result.map(r => r.id);
  }

  private getTimeLimit(timeRange: string): Date {
    const now = new Date();
    switch (timeRange) {
      case '1h':
        return new Date(now.getTime() - 60 * 60 * 1000);
      case '24h':
        return new Date(now.getTime() - 24 * 60 * 60 * 1000);
      case '7d':
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      case '30d':
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      default:
        return new Date(now.getTime() - 24 * 60 * 60 * 1000);
    }
  }
}