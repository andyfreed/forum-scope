// Vercel serverless function to handle all API routes
let app;
let initPromise;

async function getApp() {
  if (!initPromise) {
    initPromise = import('../dist/index.js').then(module => {
      app = module.app;
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
    res.status(500).json({ error: 'Internal server error' });
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
};