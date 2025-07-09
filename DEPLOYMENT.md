# ForumScope Deployment Guide

This guide shows you how to deploy ForumScope to various platforms with Supabase database.

## Prerequisites

1. **Supabase Database** - Follow `SUPABASE_SETUP.md` to create your database
2. **OpenAI API Key** - Get one from [platform.openai.com](https://platform.openai.com)
3. **Git Repository** - Fork or clone this project

## Environment Variables

All platforms need these environment variables:

```env
DATABASE_URL=postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres
OPENAI_API_KEY=sk-your-openai-api-key
NODE_ENV=production
```

---

## Deploy to Vercel (Recommended)

Vercel is perfect for full-stack React apps like ForumScope.

### Quick Deploy
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/forumscope)

### Manual Setup
1. **Connect Repository**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project" → "Import Git Repository"
   - Connect your GitHub/GitLab account
   - Select the ForumScope repository

2. **Configure Build Settings**
   - Framework: `Other` (we have custom build setup)
   - Build Command: `npm run build`
   - Output Directory: `dist/public`

3. **Add Environment Variables**
   - In project settings → Environment Variables
   - Add `DATABASE_URL` and `OPENAI_API_KEY`

4. **Deploy**
   - Click "Deploy"
   - Wait for build to complete (~2-3 minutes)
   - Your app will be live at `your-project.vercel.app`

---

## Deploy to Railway

Railway is excellent for full-stack apps with automatic database setup.

1. **Connect Repository**
   - Go to [railway.app](https://railway.app)
   - Click "New Project" → "Deploy from GitHub repo"
   - Select ForumScope repository

2. **Configure Service**
   - Railway auto-detects Node.js
   - Build Command: `npm run build`
   - Start Command: `npm start`

3. **Add Environment Variables**
   - In project dashboard → Variables tab
   - Add `DATABASE_URL` and `OPENAI_API_KEY`

4. **Deploy**
   - Railway automatically deploys on git push
   - Domain provided at `your-app.railway.app`

---

## Deploy to Render

Render offers simple deployment with built-in PostgreSQL.

1. **Create Web Service**
   - Go to [render.com](https://render.com)
   - Click "New" → "Web Service"
   - Connect your repository

2. **Configure Service**
   - Name: `forumscope`
   - Environment: `Node`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`

3. **Add Environment Variables**
   - In service settings → Environment
   - Add `DATABASE_URL` and `OPENAI_API_KEY`

4. **Deploy**
   - Click "Deploy"
   - Live at `your-app.onrender.com`

---

## Deploy to DigitalOcean App Platform

1. **Create App**
   - Go to [cloud.digitalocean.com](https://cloud.digitalocean.com)
   - Apps → Create App → GitHub

2. **Configure App**
   - Select repository and branch
   - App Tier: Basic ($5/month)
   - Build Command: `npm run build`
   - Run Command: `npm start`

3. **Environment Variables**
   - Add `DATABASE_URL` and `OPENAI_API_KEY`

4. **Deploy**
   - Review and create
   - Live at `your-app.ondigitalocean.app`

---

## Deploy to Netlify + Serverless Functions

For a more advanced setup with serverless backend:

1. **Build Configuration**
   - Build command: `npm run build:netlify`
   - Publish directory: `dist/public`
   - Functions directory: `dist/functions`

2. **Environment Variables**
   - Add in Netlify dashboard → Site settings → Environment variables

3. **Netlify Configuration**
   Create `netlify.toml`:
   ```toml
   [build]
     command = "npm run build"
     publish = "dist/public"
     functions = "dist/functions"

   [[redirects]]
     from = "/api/*"
     to = "/.netlify/functions/server"
     status = 200
   ```

---

## Custom Server Deployment

For VPS or dedicated servers:

### Using PM2 (Process Manager)

1. **Install PM2**
   ```bash
   npm install -g pm2
   ```

2. **Create ecosystem.config.js**
   ```javascript
   module.exports = {
     apps: [{
       name: 'forumscope',
       script: 'npm',
       args: 'start',
       env: {
         NODE_ENV: 'production',
         DATABASE_URL: 'your-database-url',
         OPENAI_API_KEY: 'your-api-key'
       }
     }]
   };
   ```

3. **Deploy and Start**
   ```bash
   # Clone and build
   git clone your-repo
   cd forumscope
   npm install
   npm run build

   # Start with PM2
   pm2 start ecosystem.config.js
   pm2 save
   pm2 startup
   ```

### Using Docker

1. **Create Dockerfile**
   ```dockerfile
   FROM node:18-alpine
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci --only=production
   COPY . .
   RUN npm run build
   EXPOSE 5000
   CMD ["npm", "start"]
   ```

2. **Build and Run**
   ```bash
   docker build -t forumscope .
   docker run -p 5000:5000 \
     -e DATABASE_URL="your-db-url" \
     -e OPENAI_API_KEY="your-api-key" \
     forumscope
   ```

---

## Post-Deployment Setup

After deploying to any platform:

1. **Initialize Database**
   - The app will automatically create tables on first run
   - Or manually run: `npm run db:push`

2. **Verify Functionality**
   - Visit your deployed URL
   - Check that posts load (demo data)
   - Test voting and curation features
   - Verify AI analysis is working

3. **Monitor Performance**
   - Check logs for any errors
   - Monitor database performance
   - Set up uptime monitoring

4. **Configure Domain** (Optional)
   - Most platforms allow custom domains
   - Set up SSL certificate (usually automatic)

---

## Troubleshooting

**Build Failures:**
- Check Node.js version (requires 18+)
- Verify all environment variables are set
- Check build logs for specific errors

**Database Connection Issues:**
- Verify DATABASE_URL format
- Check Supabase project is active
- Test connection with a simple query

**OpenAI API Errors:**
- Verify API key is valid
- Check rate limits and usage
- Monitor API costs

**Performance Issues:**
- Enable database connection pooling
- Implement Redis caching
- Optimize database queries

Need help? Check the logs and error messages for specific guidance.