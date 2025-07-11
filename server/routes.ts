import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { filterSchema, createCategoryFormSchema, type FilterOptions, type CreateCategoryForm } from "@shared/schema";
import { analyzeForumContent, summarizeTopics } from "./services/openai";
import { forumScraper } from "./services/scraper";
import { socialMediaIntegrator } from "./services/social-media";
import { signup, login, authenticateToken, optionalAuth, type AuthRequest } from "./auth";


export async function registerRoutes(app: Express): Promise<Server | void> {
  // Auth endpoints
  app.post('/api/auth/signup', async (req, res) => {
    try {
      const { email, password, firstName, lastName } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }
      
      const { user, token } = await signup(email, password, firstName, lastName);
      
      // Set token as httpOnly cookie
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });
      
      res.json({ user, token });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }
      
      const { user, token } = await login(email, password);
      
      // Set token as httpOnly cookie
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });
      
      res.json({ user, token });
    } catch (error: any) {
      res.status(401).json({ error: error.message });
    }
  });

  app.post('/api/auth/logout', authenticateToken, async (req, res) => {
    res.clearCookie('token');
    res.json({ success: true });
  });

  app.get('/api/auth/user', optionalAuth, async (req: AuthRequest, res) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    const user = await storage.getUser(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Don't send password hash to client
    const { passwordHash, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  });

  // Legacy redirect endpoints for compatibility
  app.get('/api/login', (req, res) => {
    res.redirect('/');
  });
  
  app.get('/api/logout', (req, res) => {
    res.clearCookie('token');
    res.redirect('/');
  });

  // Get all categories
  app.get("/api/categories", async (req, res) => {
    try {
      const includeInactive = req.query.includeInactive === 'true';
      const categories = await storage.getCategories(includeInactive);
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  // Create new category
  app.post("/api/categories", async (req, res) => {
    try {
      const categoryData = createCategoryFormSchema.parse(req.body);
      
      // Check if slug already exists
      const existingCategory = await storage.getCategoryBySlug(categoryData.slug);
      if (existingCategory) {
        return res.status(400).json({ message: "Category with this slug already exists" });
      }
      
      const newCategory = await storage.createCategory(categoryData);
      res.status(201).json(newCategory);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ message: "Invalid category data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create category" });
    }
  });

  // Toggle category active status
  app.patch("/api/categories/:id/toggle", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const category = await storage.getCategoryById(id);
      
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
      
      const updated = await storage.updateCategory(id, { isActive: !category.isActive });
      res.json(updated);
    } catch (error) {
      res.status(500).json({ message: "Failed to update category" });
    }
  });

  // Get all sources
  app.get("/api/sources", async (req, res) => {
    try {
      const sources = await storage.getSources();
      res.json(sources);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch sources" });
    }
  });

  // Get posts with filters
  app.get("/api/posts", async (req, res) => {
    try {
      const filters = filterSchema.parse({
        categories: req.query.categories ? String(req.query.categories).split(',') : undefined,
        sources: req.query.sources ? String(req.query.sources).split(',') : undefined,
        priorities: req.query.priorities ? String(req.query.priorities).split(',') : undefined,
        timeRange: req.query.timeRange as any,
        sortBy: req.query.sortBy as any,
        search: req.query.search as string
      });

      const posts = await storage.getPosts(filters);
      res.json(posts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch posts" });
    }
  });

  // Get posts by category
  app.get("/api/categories/:slug/posts", async (req, res) => {
    try {
      const category = await storage.getCategoryBySlug(req.params.slug);
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }

      const filters = filterSchema.parse({
        timeRange: req.query.timeRange as any,
        sortBy: req.query.sortBy as any,
        search: req.query.search as string
      });

      const posts = await storage.getPostsByCategory(category.id, filters);
      res.json(posts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch category posts" });
    }
  });

  // Get single post
  app.get("/api/posts/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const post = await storage.getPostById(id);
      
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }

      res.json(post);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch post" });
    }
  });

  // Get analytics for category
  app.get("/api/categories/:slug/analytics", async (req, res) => {
    try {
      const category = await storage.getCategoryBySlug(req.params.slug);
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }

      const analytics = await storage.getAnalyticsByCategory(category.id);
      res.json(analytics);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });

  // Search posts
  app.get("/api/search", async (req, res) => {
    try {
      const query = req.query.q as string;
      if (!query) {
        return res.status(400).json({ message: "Search query required" });
      }

      const filters = filterSchema.parse({
        categories: req.query.categories ? String(req.query.categories).split(',') : undefined,
        timeRange: req.query.timeRange as any,
        sortBy: req.query.sortBy as any
      });

      const posts = await storage.searchPosts(query, filters);
      res.json(posts);
    } catch (error) {
      res.status(500).json({ message: "Search failed" });
    }
  });

  // Analyze content with AI
  app.post("/api/analyze", async (req, res) => {
    try {
      const { title, content } = req.body;
      if (!title || !content) {
        return res.status(400).json({ message: "Title and content required" });
      }

      const analysis = await analyzeForumContent(title, content);
      res.json(analysis);
    } catch (error) {
      res.status(500).json({ message: "Content analysis failed" });
    }
  });

  // Get trending summary
  app.get("/api/trending-summary", async (req, res) => {
    try {
      const categorySlug = req.query.category as string;
      let posts;

      if (categorySlug) {
        const category = await storage.getCategoryBySlug(categorySlug);
        if (!category) {
          return res.status(404).json({ message: "Category not found" });
        }
        posts = await storage.getPostsByCategory(category.id, { sortBy: 'popular' });
      } else {
        posts = await storage.getPosts({ sortBy: 'popular' });
      }

      const topPosts = posts.slice(0, 10);
      const summary = await summarizeTopics(topPosts);
      
      res.json({ summary, postsAnalyzed: topPosts.length });
    } catch (error) {
      res.status(500).json({ message: "Failed to generate trending summary" });
    }
  });

  // Trigger manual scraping (for development)
  app.post("/api/scrape", async (req, res) => {
    try {
      await forumScraper.scrapeAndAnalyze();
      res.json({ message: "Scraping initiated" });
    } catch (error) {
      res.status(500).json({ message: "Scraping failed" });
    }
  });

  // Trigger social media aggregation
  app.post("/api/social-media/aggregate", async (req, res) => {
    try {
      await socialMediaIntegrator.aggregateAllSources();
      res.json({ message: "Social media aggregation completed" });
    } catch (error) {
      console.error("Social media aggregation failed:", error);
      res.status(500).json({ message: "Social media aggregation failed" });
    }
  });

  // Get social media trending topics
  app.get("/api/social-media/trending", async (req, res) => {
    try {
      const timeRange = req.query.timeRange as string || '24h';
      const trending = await socialMediaIntegrator.getTrendingTopics(timeRange);
      res.json(trending);
    } catch (error) {
      console.error("Failed to get social media trending:", error);
      res.status(500).json({ message: "Failed to get social media trending topics" });
    }
  });



  // Vote on a post
  app.post('/api/posts/:id/vote', authenticateToken, async (req: AuthRequest, res) => {
    try {
      const postId = parseInt(req.params.id);
      const { voteType } = req.body;
      const userId = req.user!.id;

      if (!voteType || !['upvote', 'downvote'].includes(voteType)) {
        return res.status(400).json({ message: 'Invalid vote type' });
      }

      await storage.votePost(userId, postId, voteType);
      const post = await storage.getPostById(postId);
      
      res.json({ 
        success: true, 
        upvotes: post?.upvotes || 0,
        downvotes: post?.downvotes || 0,
        userScore: post?.userScore || 0
      });
    } catch (error) {
      console.error('Vote error:', error);
      res.status(500).json({ message: 'Failed to vote on post' });
    }
  });

  // Get user's vote for a post
  app.get('/api/posts/:id/vote', optionalAuth, async (req: AuthRequest, res) => {
    try {
      const postId = parseInt(req.params.id);
      if (!req.user) {
        return res.json({ vote: null });
      }
      const userId = req.user.id;

      const vote = await storage.getUserVote(userId, postId);
      res.json({ vote: vote?.voteType || null });
    } catch (error) {
      console.error('Get vote error:', error);
      res.status(500).json({ message: 'Failed to get vote' });
    }
  });

  // Curate a post
  app.post('/api/posts/:id/curate', authenticateToken, async (req: AuthRequest, res) => {
    try {
      const postId = parseInt(req.params.id);
      const { curationType, reason } = req.body;
      const userId = req.user!.id;

      if (!curationType || !['bookmark', 'feature', 'hide', 'report'].includes(curationType)) {
        return res.status(400).json({ message: 'Invalid curation type' });
      }

      await storage.curatePost(userId, postId, curationType, reason);
      res.json({ success: true });
    } catch (error) {
      console.error('Curation error:', error);
      res.status(500).json({ message: 'Failed to curate post' });
    }
  });

  // Get user's curations
  app.get('/api/curations', authenticateToken, async (req: AuthRequest, res) => {
    try {
      const userId = req.user!.id;
      const curations = await storage.getUserCurations(userId);
      res.json(curations);
    } catch (error) {
      console.error('Get curations error:', error);
      res.status(500).json({ message: 'Failed to get curations' });
    }
  });

  // Only create server if not in Vercel environment
  if (!process.env.VERCEL) {
    const httpServer = createServer(app);
    return httpServer;
  }
}
