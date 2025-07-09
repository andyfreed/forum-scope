# Vercel Deployment Guide for ForumScope

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **OpenAI API Key**: Get from [platform.openai.com](https://platform.openai.com)
3. **PostgreSQL Database**: Use Neon, Supabase, or another PostgreSQL provider

## Step-by-Step Deployment

### 1. Prepare Your Repository

Ensure your repository has these files:
- `vercel.json` - Vercel configuration
- `.vercelignore` - Files to exclude from deployment
- `README.md` - Documentation

### 2. Connect to Vercel

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your repository from GitHub/GitLab
4. Choose the repository containing ForumScope

### 3. Configure Environment Variables

In Vercel dashboard, go to Project Settings > Environment Variables and add:

```
OPENAI_API_KEY=sk-your-openai-api-key-here
DATABASE_URL=postgresql://username:password@host:port/database
NODE_ENV=production
```

### 4. Configure Build Settings

Vercel should auto-detect the settings, but verify:
- **Framework Preset**: Other
- **Root Directory**: `./`
- **Build Command**: `npm run build`
- **Output Directory**: `dist/public`
- **Install Command**: `npm install`

### 5. Deploy

1. Click "Deploy"
2. Wait for build to complete
3. Your app will be available at `your-project-name.vercel.app`

## Database Setup

### Using Neon (Recommended)

1. Go to [neon.tech](https://neon.tech)
2. Create a new project
3. Copy the connection string
4. Add it as `DATABASE_URL` in Vercel environment variables

### Using Supabase

1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Go to Settings > Database
4. Copy the connection string (use the pooling one)
5. Add it as `DATABASE_URL` in Vercel environment variables

## Post-Deployment Checklist

- [ ] Environment variables are set correctly
- [ ] Build completes successfully
- [ ] API endpoints respond (test `/api/categories`)
- [ ] Frontend loads properly
- [ ] OpenAI integration works (check trending summary)
- [ ] Database connections work

## Troubleshooting

### Build Failures

1. Check build logs in Vercel dashboard
2. Ensure all dependencies are in package.json
3. Verify environment variables are set

### API Errors

1. Check function logs in Vercel dashboard
2. Verify DATABASE_URL format
3. Confirm OPENAI_API_KEY is valid

### Frontend Issues

1. Check browser console for errors
2. Verify API routes are accessible
3. Check network tab for failed requests

## Custom Domain (Optional)

1. In Vercel dashboard, go to Project Settings > Domains
2. Add your custom domain
3. Configure DNS records as instructed
4. Enable SSL (automatic)

## Monitoring

- View deployment logs in Vercel dashboard
- Monitor function performance and errors
- Set up Vercel Analytics for usage insights

## Scaling Considerations

- Vercel functions have a 30-second timeout limit
- Database connection pooling recommended for high traffic
- Consider caching strategies for OpenAI API calls
- Monitor OpenAI API usage and costs