import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { filterSchema, type FilterOptions } from "@shared/schema";
import { analyzeForumContent, summarizeTopics } from "./services/openai";
import { forumScraper } from "./services/scraper";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all categories
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch categories" });
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

  const httpServer = createServer(app);
  return httpServer;
}
