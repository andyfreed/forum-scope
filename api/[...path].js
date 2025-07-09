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
  try {
    const expressApp = await getApp();
    
    // Let Express handle the request
    expressApp(req, res);
  } catch (error) {
    console.error('Error in serverless function:', error);
    console.error('Error stack:', error.stack);
    console.error('Request URL:', req.url);
    console.error('Request method:', req.method);
    
    // Send more detailed error in development
    const isDev = process.env.NODE_ENV === 'development';
    res.status(500).json({ 
      error: 'Internal server error',
      message: isDev ? error.message : undefined,
      stack: isDev ? error.stack : undefined
    });
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
};