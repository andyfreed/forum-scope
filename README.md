# ForumScope - AI-Powered Forum Aggregator

ForumScope is an intelligent forum discussion aggregator that automatically monitors and curates content from hobby forums (drones, RC cars, etc.), providing users with AI-analyzed trending topics and discussions.

## Features

- **AI-Powered Content Analysis**: Uses OpenAI GPT-4o to automatically analyze and summarize forum posts
- **Dynamic Category Management**: Create and manage custom hobby categories through the interface
- **Priority Classification**: Intelligent categorization (hot, trending, news, help, market, normal)
- **Live Trending Feed**: Real-time AI-generated summaries of hot topics
- **Smart Notifications**: Priority-based alerts for important discussions
- **Advanced Filtering**: Filter by category, source, time range, priority, and search terms
- **Responsive Design**: Mobile-first design with modern UI components

## Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, Radix UI
- **Backend**: Node.js, Express, TypeScript
- **AI**: OpenAI GPT-4o for content analysis and summarization
- **Database**: PostgreSQL with Drizzle ORM
- **State Management**: TanStack Query (React Query)
- **Build Tools**: Vite, ESBuild

## Deployment

### Environment Variables

Set up the following environment variables in Vercel:

```
OPENAI_API_KEY=your_openai_api_key
DATABASE_URL=your_postgresql_connection_string
NODE_ENV=production
```

### Deploy to Vercel

1. Connect your GitHub repository to Vercel
2. Set the environment variables in Vercel dashboard
3. Deploy with automatic builds on push

```bash
# Or deploy via Vercel CLI
npm i -g vercel
vercel --prod
```

## Local Development

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   # Add your OPENAI_API_KEY and DATABASE_URL
   ```

4. Start development server:
   ```bash
   npm run dev
   ```

## Project Structure

```
├── client/              # React frontend
│   ├── src/
│   │   ├── components/  # UI components
│   │   ├── pages/       # Route pages
│   │   ├── hooks/       # Custom hooks
│   │   └── lib/         # Utilities
├── server/              # Express backend
│   ├── services/        # Business logic
│   └── routes.ts        # API routes
├── shared/              # Shared types and schemas
└── dist/                # Build output
```

## Key Components

- **Live Feed**: Real-time trending summaries with AI analysis
- **Category Manager**: Dynamic category creation and management
- **Priority Filters**: Filter posts by priority levels
- **Topic Cards**: Rich post display with engagement metrics
- **Notification System**: Smart alerts for important content

## API Endpoints

- `GET /api/categories` - Get all categories
- `GET /api/posts` - Get posts with filtering
- `GET /api/trending-summary` - Get AI-generated trending summary
- `POST /api/categories` - Create new category
- `POST /api/scrape` - Trigger manual forum scraping

## License

MIT License - see LICENSE file for details