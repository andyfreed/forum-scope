# Supabase Database Setup Guide

This guide will help you set up a Supabase database for ForumScope so you can deploy it anywhere.

## 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/sign in
2. Click "New Project"
3. Choose an organization or create one
4. Set project name: `forumscope-db`
5. Set database password (save this!)
6. Choose a region close to your users
7. Click "Create new project"

## 2. Get Database Connection Details

1. In your Supabase dashboard, go to **Settings** → **Database**
2. Under "Connection string", copy the **URI** value
3. Replace `[YOUR-PASSWORD]` with the database password you set
4. Your connection string should look like:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
   ```

## 3. Update Environment Variables

Add this to your `.env` file (or environment variables in your deployment):

```env
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
OPENAI_API_KEY=your_openai_api_key_here
NODE_ENV=production
```

## 4. Initialize Database Schema

Run this command to create all the necessary tables:

```bash
npm run db:push
```

This will create:
- Categories table (for forum categories like "Drones", "RC Cars")
- Sources table (for data sources like Reddit, forums)
- Posts table (for aggregated forum posts)
- Analytics table (for category statistics)
- User votes table (for community voting)
- User curations table (for bookmarks, features, etc.)
- Users table (for user accounts)
- Sessions table (for authentication)

## 5. Verify Setup

1. Go to your Supabase dashboard → **Table Editor**
2. You should see all the tables listed above
3. The app will automatically populate with demo data when you first run it

## 6. Deploy Anywhere

With Supabase, you can now deploy ForumScope to:
- **Vercel** (recommended for frontend apps)
- **Railway** (great for full-stack apps)
- **Render** (simple deployment)
- **DigitalOcean App Platform**
- **AWS** / **Google Cloud** / **Azure**
- Any hosting service that supports Node.js

Just make sure to set the `DATABASE_URL` environment variable to your Supabase connection string.

## Benefits of Using Supabase

✅ **Persistent Database** - Your data survives across deployments
✅ **Real-time Features** - Built-in real-time subscriptions
✅ **Built-in Auth** - Can easily add user authentication later
✅ **REST API** - Automatic API generation from your schema
✅ **Dashboard** - Visual database management
✅ **Backups** - Automatic daily backups
✅ **Scaling** - Automatic scaling as your app grows

## Optional: Add Authentication

Later, you can add Supabase authentication by:
1. Installing `@supabase/supabase-js`
2. Setting up Supabase Auth in your project
3. Replacing the mock authentication with real user auth
4. Using Supabase's built-in user management

The database schema is already ready for real user authentication!