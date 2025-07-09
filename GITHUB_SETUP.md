# GitHub Repository Setup Guide

## 1. Repository Setup

Your repository is already created at: https://github.com/andyfreed/forum-scope.git

## 2. Push Code to GitHub

Run these commands in your terminal:

```bash
git init
git add .
git commit -m "Initial commit: ForumScope AI-powered forum aggregator"
git branch -M main
git remote add origin https://github.com/andyfreed/forum-scope.git
git push -u origin main
```

## 3. Environment Variables

Create a `.env` file locally (don't commit this):

```env
DATABASE_URL=your_postgresql_connection_string
OPENAI_API_KEY=your_openai_api_key
NODE_ENV=development
SESSION_SECRET=your_random_session_secret
```

## 4. Deploy to Vercel

1. **Connect to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Sign in with your GitHub account
   - Click "New Project"
   - Import your `forum-scope` repository

2. **Configure Environment Variables**:
   - In Vercel project settings → Environment Variables, add:
     - `DATABASE_URL`: Your PostgreSQL connection string
     - `OPENAI_API_KEY`: Your OpenAI API key
     - `NODE_ENV`: `production`
     - `SESSION_SECRET`: A random string for session encryption

3. **Deploy**:
   - Vercel will automatically deploy from your `main` branch
   - The build process is configured in `vercel.json`

## 5. Database Setup

### Option A: Supabase (Recommended)
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Get your database URL from Settings → Database
4. Use this as your `DATABASE_URL` in Vercel

### Option B: Railway
1. Go to [railway.app](https://railway.app)
2. Create a new PostgreSQL database
3. Get the connection string
4. Use this as your `DATABASE_URL` in Vercel

### Option C: Neon (Current)
- You're already using Neon, just ensure the DATABASE_URL is set in Vercel

## 6. Push Schema to Database

After deployment, your database tables will be created automatically when the app starts.

## 7. Custom Domain (Optional)

In Vercel project settings → Domains, you can add a custom domain like:
- `forumscope.app`
- `forum-scope.com`

## 8. Monitoring

Your app will be available at:
- `https://your-project-name.vercel.app`
- Monitor logs in Vercel dashboard
- Check database in Supabase/Railway dashboard

## 9. Updates

Future updates are automatic:
- Push to `main` branch → Vercel auto-deploys
- No downtime deployments
- Rollback available if needed

## Features Ready for Production

✅ **Real Database**: PostgreSQL with persistent storage
✅ **AI Analysis**: OpenAI GPT-4o content analysis
✅ **Community Features**: Voting, curation, trending
✅ **Responsive Design**: Mobile-friendly interface
✅ **Error Handling**: Comprehensive error management
✅ **Performance**: Optimized queries and caching
✅ **Security**: Session management and validation