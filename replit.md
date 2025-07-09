# ForumScope - Forum Discussion Aggregator

## Overview

ForumScope is a React-based web application that aggregates and analyzes discussions from various hobby forums (drones, RC cars, etc.). The application scrapes forum content, uses AI to analyze and categorize posts, and presents trending topics with filtering and search capabilities.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query (React Query) for server state
- **UI Framework**: Radix UI components with shadcn/ui styling
- **Styling**: Tailwind CSS with CSS variables for theming
- **Build Tool**: Vite for development and building

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **API Style**: REST API with JSON responses
- **Database ORM**: Drizzle ORM with PostgreSQL dialect
- **AI Integration**: OpenAI GPT-4o for content analysis
- **Session Management**: Express sessions with PostgreSQL storage

### Key Components

#### Database Schema (PostgreSQL + Drizzle)
- **Categories**: Forum categories (drones, RC cars, etc.)
- **Sources**: Forum sources (Reddit, MavicPilots, etc.)
- **Posts**: Forum posts with AI-generated summaries and metadata
- **Analytics**: Category-level statistics and metrics
- **User Votes**: Community voting on posts (upvote/downvote)
- **User Curations**: Bookmarks, featured posts, hidden content
- **Users**: User profiles and authentication data
- **Sessions**: User session management

#### AI Content Analysis
- **Content Summarization**: GPT-4o generates concise summaries
- **Tag Generation**: Automatic tag extraction from content
- **Priority Classification**: Posts categorized as hot, trending, news, help, market, or normal
- **Sentiment Analysis**: Positive, neutral, or negative sentiment detection
- **Trending Score**: Algorithmic scoring for content popularity

#### Data Storage Solutions
- **Primary Database**: PostgreSQL (Supabase or any PostgreSQL provider)
- **ORM**: Drizzle with type-safe schema definitions
- **Migrations**: Drizzle Kit for schema management
- **Development Storage**: In-memory storage class for development/testing
- **Production Ready**: Supports Supabase, Railway, Render, or any PostgreSQL host

## Data Flow

1. **Content Ingestion**: Forum scraper collects posts from various sources
2. **AI Analysis**: OpenAI analyzes content for summary, tags, priority, and sentiment
3. **Database Storage**: Processed posts stored with metadata
4. **API Serving**: Express serves filtered and sorted content via REST endpoints
5. **Frontend Display**: React components render posts with real-time filtering

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL database connection
- **openai**: AI content analysis and summarization
- **drizzle-orm**: Type-safe database operations
- **@tanstack/react-query**: Server state management
- **@radix-ui/**: Accessible UI component primitives

### Development Tools
- **Vite**: Fast build tool and development server
- **TypeScript**: Type safety across frontend and backend
- **Tailwind CSS**: Utility-first styling framework
- **ESBuild**: Fast JavaScript bundling for production

## Authentication and Authorization

Currently implements session-based authentication using:
- Express sessions stored in PostgreSQL
- `connect-pg-simple` for session storage
- No user authentication implemented yet (prepared for future implementation)

## Deployment Strategy

### Development
- Vite dev server with HMR for frontend
- tsx for TypeScript execution in development
- Replit-specific plugins for development environment

### Vercel Deployment (Production)
- Vite builds optimized frontend bundle to `dist/public`
- ESBuild bundles server code to `dist/index.js`
- Vercel serverless functions for API endpoints
- Static file serving for frontend assets
- Environment-based configuration for database and API keys

### Deployment Files
- `vercel.json`: Vercel configuration with routing and build settings
- `.vercelignore`: Files to exclude from deployment
- `README.md`: Complete project documentation
- `DEPLOYMENT.md`: Step-by-step Vercel deployment guide

### Ready for Production
- Build process verified and working
- All necessary configuration files created
- Environment variables documented
- Database setup instructions provided

### Environment Configuration
- `DATABASE_URL`: PostgreSQL connection string
- `OPENAI_API_KEY`: OpenAI API access for content analysis
- `NODE_ENV`: Environment-specific behavior

## Key Features

- **Multi-source Aggregation**: Supports Reddit, specialized forums, and community sites
- **AI-Powered Analysis**: Advanced OpenAI GPT-4o content analysis with hobby-specific understanding
- **Dynamic Category Management**: Add/remove hobby categories through the interface
- **Real-time Filtering**: Filter by category, source, time range, priority, and search terms
- **Live Trending Feed**: AI-generated summaries of hot topics with manual refresh capability
- **Smart Notifications**: Real-time alerts for hot topics, news, and trending discussions
- **Priority Classification**: Intelligent categorization (hot, trending, news, help, market, normal)
- **Responsive Design**: Mobile-first design with Tailwind CSS
- **Performance Optimized**: React Query caching and optimistic updates

## Recent Changes (January 2025)

- ✓ **Dynamic Categories**: Added category management system for creating custom hobby areas
- ✓ **Priority Filtering**: Users can filter by post priority (hot, trending, news, etc.)
- ✓ **Live Feed Component**: Real-time trending summaries with refresh capability  
- ✓ **Enhanced AI Analysis**: Improved OpenAI prompts for better hobby community understanding
- ✓ **Notification System**: Smart notification bell with priority-based alerts
- ✓ **Better UI Organization**: Cleaner sidebar with priority filters and category management
- ✓ **Community Voting System**: Users can upvote/downvote posts with real-time vote counts
- ✓ **User-Generated Curation**: Bookmark, feature, hide, and report posts with community moderation
- ✓ **Community Score Sorting**: New sorting option based on community voting patterns
- ✓ **Advanced Post Management**: Featured posts display with crown badges and curation menu
- ✓ **Production Ready**: Switched to PostgreSQL database for persistent storage
- ✓ **Deployment Guides**: Created comprehensive setup and deployment documentation
- ✓ **Export Ready**: Removed platform-specific dependencies for easy project export
- ✓ **Error Handling**: Fixed unhandled promise rejections with proper API validation and fallbacks
- ✓ **Real Database**: Migrated from in-memory storage to PostgreSQL with Drizzle ORM
- ✓ **GitHub Integration**: Repository setup at https://github.com/andyfreed/forum-scope.git
- ✓ **Vercel Deployment**: Configured for automatic deployment to Vercel platform
- ✓ **Custom Branding**: Added ForumScope logo with tropical theme design