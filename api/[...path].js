// Vercel serverless function to handle all API routes
export default async function handler(req, res) {
  // Import the Express app
  const { app } = await import('../dist/index.js');
  
  // Let Express handle the request
  app(req, res);
}

export const config = {
  api: {
    bodyParser: false,
  },
};