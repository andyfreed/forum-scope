import express, { type Request, Response, NextFunction } from "express";
import cookieParser from "cookie-parser";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { schedulerService } from "./services/scheduler";
import { seedDatabase } from "./seed-database";

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Don't crash the application, just log the error
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

// Initialize app for serverless
let initialized = false;
async function initializeApp() {
  if (initialized) return;
  initialized = true;
  
  console.log('🚀 Initializing app for Vercel serverless...');
  console.log('Environment:', { 
    NODE_ENV: process.env.NODE_ENV,
    VERCEL: process.env.VERCEL,
    hasJWT: !!process.env.JWT_SECRET,
    hasDB: !!process.env.DATABASE_URL
  });
  
  await registerRoutes(app);
  
  // Add error handler
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    console.error('Express error handler:', err);
    res.status(status).json({ message });
  });
  
  // Serve static files in production (but not in Vercel)
  if (process.env.NODE_ENV === "production" && !process.env.VERCEL) {
    serveStatic(app);
  }
}

// Only run the full server setup if not in Vercel environment
if (!process.env.VERCEL) {
  (async () => {
    const server = await registerRoutes(app);

    // Seed database with initial data
    try {
      await seedDatabase();
      log('Database seeded successfully');
    } catch (error: any) {
      log('Failed to seed database: ' + error.message);
    }

    // Start scheduled tasks for social media aggregation
    try {
      schedulerService.startAllScheduledTasks();
      log('Scheduled tasks started successfully');
    } catch (error: any) {
      log('Failed to start scheduled tasks: ' + error.message);
    }

    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";

      res.status(status).json({ message });
      throw err;
    });

    // importantly only setup vite in development and after
    // setting up all the other routes so the catch-all route
    // doesn't interfere with the other routes
    if (app.get("env") === "development") {
      await setupVite(app, server);
    } else {
      serveStatic(app);
    }

    // ALWAYS serve the app on port 5000
    // this serves both the API and the client.
    // It is the only port that is not firewalled.
    const port = 5000;
    server.listen({
      port,
      host: "0.0.0.0",
      reusePort: true,
    }, () => {
      log(`serving on port ${port}`);
    });
  })();
}

// Export app and initialization for Vercel serverless functions
export { app, initializeApp };
