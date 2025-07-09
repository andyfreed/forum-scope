import { db } from './db';
import { categories, sources, posts, analytics } from '@shared/schema';

export async function seedDatabase() {
  try {
    console.log('Seeding database with initial data...');

    // Check if data already exists
    const existingCategories = await db.select().from(categories);
    if (existingCategories.length > 0) {
      console.log('Database already seeded, skipping...');
      return;
    }

    // Create categories
    const dronesCategory = await db.insert(categories).values({
      name: "Drones",
      slug: "drones",
      description: "Drone enthusiasts, FPV racing, aerial photography, and commercial drone applications",
      color: "#3B82F6",
      isActive: true
    }).returning();

    const rcCategory = await db.insert(categories).values({
      name: "RC Cars",
      slug: "rc-cars",
      description: "Remote control cars, trucks, racing, modifications, and hobby discussions",
      color: "#EF4444",
      isActive: true
    }).returning();

    const woodworkingCategory = await db.insert(categories).values({
      name: "Woodworking",
      slug: "woodworking",
      description: "Woodworking projects, tools, techniques, and craftsmanship discussions",
      color: "#8B5CF6",
      isActive: true
    }).returning();

    // Create sources
    await db.insert(sources).values([
      {
        name: "Reddit",
        url: "https://reddit.com/r/drones",
        type: "reddit",
        categoryId: dronesCategory[0].id,
        isActive: true
      },
      {
        name: "MavicPilots",
        url: "https://mavicpilots.com",
        type: "forum",
        categoryId: dronesCategory[0].id,
        isActive: true
      },
      {
        name: "RC Groups",
        url: "https://rcgroups.com",
        type: "forum",
        categoryId: rcCategory[0].id,
        isActive: true
      },
      {
        name: "Woodworking Reddit",
        url: "https://reddit.com/r/woodworking",
        type: "reddit",
        categoryId: woodworkingCategory[0].id,
        isActive: true
      }
    ]);

    // Create sample posts
    await db.insert(posts).values([
      {
        title: "DJI Mavic 4 Pro Release Delays and US Availability",
        content: "There's been significant discussion about the DJI Mavic 4 Pro delays due to regulatory issues in the US market. The drone community is concerned about the impact on commercial operations and hobby flying.",
        summary: "DJI Mavic 4 Pro faces delays due to US regulatory challenges, affecting both commercial and hobbyist drone operators.",
        author: "DroneExpert42",
        url: "https://reddit.com/r/drones/mavic4pro_delays",
        source: "Reddit",
        categoryId: dronesCategory[0].id,
        publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        tags: ["DJI", "Mavic 4 Pro", "regulations", "US market", "delays"],
        priority: "news",
        trendingScore: 85,
        sentiment: "negative",
        upvotes: 156,
        downvotes: 12,
        commentCount: 43,
        viewCount: 2341,
        isCurated: false
      },
      {
        title: "FPV Racing: New Indoor Track Designs and Competition Rules",
        content: "The FPV racing community is evolving with innovative indoor track designs that challenge pilots with technical obstacles and creative layouts. New safety regulations are being implemented.",
        summary: "FPV racing advances with creative indoor track designs and updated safety regulations for competitive events.",
        author: "FPVRacer_Mike",
        url: "https://reddit.com/r/fpv/indoor_racing_2024",
        source: "Reddit",
        categoryId: dronesCategory[0].id,
        publishedAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
        tags: ["FPV", "racing", "indoor tracks", "competition", "safety"],
        priority: "trending",
        trendingScore: 78,
        sentiment: "positive",
        upvotes: 89,
        downvotes: 3,
        commentCount: 27,
        viewCount: 1567,
        isCurated: true,
        curatedBy: "1",
        curatedAt: new Date()
      },
      {
        title: "RC Car Motor Overheating: Troubleshooting and Solutions",
        content: "Help needed with my Traxxas Rustler - the motor keeps overheating during long runs. I've tried different batteries and checked the gearing, but the issue persists.",
        summary: "RC car enthusiast seeks help with motor overheating issues on Traxxas Rustler, exploring various troubleshooting approaches.",
        author: "RCTech_Sam",
        url: "https://rcgroups.com/forums/motor-overheating-help",
        source: "RC Groups",
        categoryId: rcCategory[0].id,
        publishedAt: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
        tags: ["Traxxas", "Rustler", "motor", "overheating", "troubleshooting"],
        priority: "help",
        trendingScore: 65,
        sentiment: "neutral",
        upvotes: 34,
        downvotes: 1,
        commentCount: 18,
        viewCount: 892,
        isCurated: false
      },
      {
        title: "Woodworking Workshop Setup: Essential Tools for Beginners",
        content: "Starting a woodworking workshop can be overwhelming. Here's a comprehensive guide to the essential tools every beginner needs, from basic hand tools to power tools.",
        summary: "Comprehensive guide covering essential woodworking tools for beginners setting up their first workshop.",
        author: "WoodCrafter_Joe",
        url: "https://reddit.com/r/woodworking/beginner_tools_guide",
        source: "Woodworking Reddit",
        categoryId: woodworkingCategory[0].id,
        publishedAt: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 hours ago
        tags: ["woodworking", "beginner", "tools", "workshop", "guide"],
        priority: "normal",
        trendingScore: 72,
        sentiment: "positive",
        upvotes: 67,
        downvotes: 2,
        commentCount: 31,
        viewCount: 1234,
        isCurated: false
      }
    ]);

    // Create analytics
    await db.insert(analytics).values([
      {
        categoryId: dronesCategory[0].id,
        totalPosts: 2,
        totalViews: 3908,
        totalComments: 70,
        totalUpvotes: 245,
        avgTrendingScore: 81.5,
        topTags: ["DJI", "FPV", "racing", "regulations", "Mavic 4 Pro"],
        lastUpdated: new Date()
      },
      {
        categoryId: rcCategory[0].id,
        totalPosts: 1,
        totalViews: 892,
        totalComments: 18,
        totalUpvotes: 34,
        avgTrendingScore: 65,
        topTags: ["Traxxas", "Rustler", "motor", "overheating", "troubleshooting"],
        lastUpdated: new Date()
      },
      {
        categoryId: woodworkingCategory[0].id,
        totalPosts: 1,
        totalViews: 1234,
        totalComments: 31,
        totalUpvotes: 67,
        avgTrendingScore: 72,
        topTags: ["woodworking", "beginner", "tools", "workshop", "guide"],
        lastUpdated: new Date()
      }
    ]);

    console.log('Database seeded successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
}