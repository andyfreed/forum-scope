// Vercel serverless function to handle all API routes
let app;
let initPromise;

async function getApp() {
  if (!initPromise) {
    initPromise = import('../dist/index.js').then(async module => {
      app = module.app;
      // Initialize the app for serverless environment
      if (module.initializeApp) {
        await module.initializeApp();
      }
      return app;
    });
  }
  return initPromise;
}

export default async function handler(req, res) {
  console.log('API Handler called:', {
    url: req.url,
    method: req.method,
    path: req.query.path,
    headers: req.headers
  });

  try {
    const expressApp = await getApp();
    
    // Let Express handle the request
    expressApp(req, res);
  } catch (error) {
    console.error('Error in serverless function:', error);
    console.error('Error stack:', error.stack);
    console.error('Request URL:', req.url);
    console.error('Request method:', req.method);
    console.error('Environment:', {
      NODE_ENV: process.env.NODE_ENV,
      VERCEL: process.env.VERCEL,
      hasDB: !!process.env.DATABASE_URL,
      hasJWT: !!process.env.JWT_SECRET
    });
    
    // Send more detailed error in development
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message,
      url: req.url,
      method: req.method
    });
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
};