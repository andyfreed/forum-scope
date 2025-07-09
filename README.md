# ForumScope 🔍

**AI-Powered Hobby Forum Aggregator**

ForumScope intelligently aggregates and analyzes discussions from multiple hobby forums (drones, RC cars, etc.), using AI to surface trending topics and important conversations you might otherwise miss.

![ForumScope Demo](https://via.placeholder.com/800x400/4F46E5/ffffff?text=ForumScope+Demo)

## ✨ Features

### 🤖 AI-Powered Content Analysis
- **Smart Summarization**: GPT-4o generates concise summaries of forum posts
- **Priority Classification**: Automatically categorizes posts as hot, trending, news, help, market, or normal
- **Sentiment Analysis**: Detects positive, neutral, or negative sentiment
- **Tag Generation**: Automatic extraction of relevant tags from content
- **Trending Score**: Algorithmic scoring for content popularity

### 🌐 Multi-Platform Aggregation
- **Reddit Integration**: Pull posts from hobby subreddits
- **Forum Scraping**: Support for specialized hobby forums
- **Real-time Updates**: Automated content refresh and analysis
- **Custom Sources**: Add your own forum sources

### 👥 Community Features
- **Voting System**: Upvote and downvote posts with real-time counts
- **Content Curation**: Bookmark, feature, hide, or report posts
- **Community Scoring**: Sort posts by community voting patterns
- **Featured Content**: Highlight important discussions with crown badges

### 🎯 Smart Filtering & Search
- **Category Management**: Create custom hobby categories
- **Priority Filters**: Filter by post importance level
- **Time Range**: Focus on recent or historical content
- **Advanced Search**: Find specific topics and discussions

### 📊 Analytics & Insights
- **Trending Summaries**: AI-generated overviews of hot topics
- **Community Stats**: Track engagement and activity metrics
- **Real-time Notifications**: Alerts for hot topics and breaking news

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- PostgreSQL database (we recommend Supabase)
- OpenAI API key

### 1. Clone & Install
```bash
git clone https://github.com/your-username/forumscope.git
cd forumscope
npm install
```

### 2. Set Up Database
Follow our [Supabase Setup Guide](SUPABASE_SETUP.md) to create a free PostgreSQL database.

### 3. Configure Environment
Create `.env` file:
```env
DATABASE_URL=postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres
OPENAI_API_KEY=sk-your-openai-api-key-here
NODE_ENV=development
```

### 4. Initialize Database
```bash
npm run db:push
```

### 5. Start Development Server
```bash
npm run dev
```

Visit `http://localhost:5000` to see ForumScope in action!

## 🏗️ Architecture

### Frontend
- **React 18** with TypeScript for type safety
- **Vite** for lightning-fast development and building
- **Tailwind CSS** for beautiful, responsive styling
- **shadcn/ui** for accessible, polished components
- **TanStack Query** for powerful data fetching and caching
- **Wouter** for lightweight client-side routing

### Backend
- **Express.js** with TypeScript for the API server
- **Drizzle ORM** for type-safe database operations
- **PostgreSQL** for reliable data storage
- **OpenAI GPT-4o** for intelligent content analysis
- **Node-cron** for automated content aggregation

### Database Schema
- **Categories** - Forum categories (drones, RC cars, etc.)
- **Sources** - Data sources (Reddit, forums, etc.)
- **Posts** - Aggregated content with AI analysis
- **Analytics** - Category statistics and metrics
- **User Votes** - Community voting data
- **User Curations** - Bookmarks and content moderation

## 📦 Deployment

ForumScope can be deployed to any platform that supports Node.js:

### Quick Deploy Options
- **Vercel** (Recommended) - [Deploy Now](https://vercel.com/new/clone?repository-url=https://github.com/your-username/forumscope)
- **Railway** - One-click deployment with database
- **Render** - Simple hosting with PostgreSQL addon
- **DigitalOcean App Platform** - Scalable container hosting
- **Netlify** - Serverless functions deployment

See our detailed [Deployment Guide](DEPLOYMENT.md) for step-by-step instructions.

## 🔧 Configuration

### Adding New Forum Sources
```typescript
// In server/storage.ts - add to initializeData()
this.createSourceSync({
  name: "Your Forum",
  url: "https://yourforum.com/api",
  type: "rss", // or "scrape"
  categoryId: 1,
  isActive: true
});
```

### Customizing AI Analysis
```typescript
// In server/services/openai.ts - modify the prompt
const prompt = `Analyze this forum post about ${category}:
Title: ${title}
Content: ${content}

Provide analysis in JSON format with your custom requirements...`;
```

### Adding New Categories
Use the built-in category management UI, or add programmatically:
```typescript
// Through the API
POST /api/categories
{
  "name": "Custom Category",
  "slug": "custom-category", 
  "description": "Description of your category",
  "isActive": true
}
```

## 🤝 Contributing

We welcome contributions! Here's how to get started:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Make your changes** and add tests
4. **Commit your changes**: `git commit -m 'Add amazing feature'`
5. **Push to the branch**: `git push origin feature/amazing-feature`
6. **Open a Pull Request**

### Development Guidelines
- Use TypeScript for all new code
- Follow the existing code style
- Add tests for new features
- Update documentation as needed
- Keep commits atomic and well-described

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **OpenAI** for GPT-4o API
- **Drizzle Team** for the excellent ORM
- **Vercel** for hosting and deployment platform
- **Supabase** for PostgreSQL database hosting
- **shadcn/ui** for beautiful React components
- **Hobby Communities** everywhere for inspiring this project

## 📊 Project Stats

- **Tech Stack**: React, TypeScript, Node.js, PostgreSQL
- **AI Model**: OpenAI GPT-4o
- **Database**: Drizzle ORM with PostgreSQL
- **Deployment**: Vercel, Railway, Render compatible
- **License**: MIT

## 🔮 Roadmap

- [ ] **Real User Authentication** (Supabase Auth integration)
- [ ] **Mobile App** (React Native)
- [ ] **Advanced Analytics** (Charts and insights)
- [ ] **Content Scheduling** (Automated posting)
- [ ] **Multi-language Support** (i18n)
- [ ] **API Access** (Public API for developers)
- [ ] **Plugin System** (Custom integrations)

---

**Built with ❤️ by hobby enthusiasts, for hobby enthusiasts.**

[Live Demo](https://forumscope.vercel.app) • [Documentation](https://docs.forumscope.com) • [Discord](https://discord.gg/forumscope)