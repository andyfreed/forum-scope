import { pgTable, text, serial, integer, boolean, timestamp, json, varchar, jsonb, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  isActive: boolean("is_active").default(true),
});

export const sources = pgTable("sources", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  url: text("url").notNull(),
  type: text("type").notNull(), // 'reddit', 'forum', 'community'
  isActive: boolean("is_active").default(true),
});

export const posts = pgTable("posts", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  summary: text("summary"),
  sourceId: integer("source_id").references(() => sources.id),
  categoryId: integer("category_id").references(() => categories.id),
  url: text("url"),
  source: text("source"),
  sentiment: text("sentiment"),
  author: text("author"),
  publishedAt: timestamp("published_at"),
  scrapedAt: timestamp("scraped_at").defaultNow(),
  engagement: json("engagement").$type<{
    comments: number;
    upvotes: number;
    views: number;
    upvotePercentage: number;
  }>(),
  tags: text("tags").array(),
  trendingScore: integer("trending_score").default(0),
  priority: text("priority").default("normal"), // 'hot', 'trending', 'news', 'help', 'market', 'normal'
  upvotes: integer("upvotes").default(0),
  downvotes: integer("downvotes").default(0),
  userScore: integer("user_score").default(0), // Community-driven score
  isCurated: boolean("is_curated").default(false),
  curatedBy: text("curated_by"),
  curatedAt: timestamp("curated_at"),
});

export const analytics = pgTable("analytics", {
  id: serial("id").primaryKey(),
  categoryId: integer("category_id").references(() => categories.id),
  totalPosts: integer("total_posts").default(0),
  hotTopics: integer("hot_topics").default(0),
  trendingNow: integer("trending_now").default(0),
  activeForums: integer("active_forums").default(0),
  lastUpdated: timestamp("last_updated").defaultNow(),
});

export const insertCategorySchema = createInsertSchema(categories).omit({ id: true });
export const insertSourceSchema = createInsertSchema(sources).omit({ id: true });
export const insertPostSchema = createInsertSchema(posts).omit({ id: true, scrapedAt: true });
export const insertAnalyticsSchema = createInsertSchema(analytics).omit({ id: true, lastUpdated: true });

export type Category = typeof categories.$inferSelect;
export type Source = typeof sources.$inferSelect;
export type Post = typeof posts.$inferSelect;
export type Analytics = typeof analytics.$inferSelect;

export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type InsertSource = z.infer<typeof insertSourceSchema>;
export type InsertPost = z.infer<typeof insertPostSchema>;
export type InsertAnalytics = z.infer<typeof insertAnalyticsSchema>;

// Filter types for API
export const filterSchema = z.object({
  categories: z.array(z.string()).optional(),
  sources: z.array(z.string()).optional(),
  priorities: z.array(z.string()).optional(),
  timeRange: z.enum(['24h', '7d', '30d', 'all']).optional(),
  sortBy: z.enum(['recent', 'popular', 'discussed', 'community']).optional(),
  search: z.string().optional(),
  curationFilter: z.enum(['all', 'curated', 'uncurated']).optional(),
});

export type FilterOptions = z.infer<typeof filterSchema>;

// Category creation form schema
export const createCategoryFormSchema = insertCategorySchema.extend({
  name: z.string().min(1, "Category name is required").max(50, "Name too long"),
  slug: z.string().min(1, "Slug is required").max(50, "Slug too long").regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens"),
  description: z.string().max(200, "Description too long").optional(),
});

export type CreateCategoryForm = z.infer<typeof createCategoryFormSchema>;

// User votes table
export const userVotes = pgTable("user_votes", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  postId: integer("post_id").references(() => posts.id).notNull(),
  voteType: text("vote_type").notNull(), // 'upvote', 'downvote'
  createdAt: timestamp("created_at").defaultNow(),
});

// User content curation table
export const userCurations = pgTable("user_curations", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  postId: integer("post_id").references(() => posts.id).notNull(),
  curationType: text("curation_type").notNull(), // 'bookmark', 'feature', 'hide', 'report'
  reason: text("reason"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserVoteSchema = createInsertSchema(userVotes).omit({ id: true, createdAt: true });
export const insertUserCurationSchema = createInsertSchema(userCurations).omit({ id: true, createdAt: true });

export type UserVote = typeof userVotes.$inferSelect;
export type UserCuration = typeof userCurations.$inferSelect;
export type InsertUserVote = z.infer<typeof insertUserVoteSchema>;
export type InsertUserCuration = z.infer<typeof insertUserCurationSchema>;

// Session storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
);

// User storage table.
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique().notNull(),
  passwordHash: varchar("password_hash"),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
