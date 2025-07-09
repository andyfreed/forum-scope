import { db } from './db';
import { categories, sources, posts, analytics } from '@shared/schema';
import { eq } from 'drizzle-orm';

export async function seedDatabase() {
  try {
    console.log('Seeding database with initial data...');

    // Check if posts already exist
    const existingPosts = await db.select().from(posts);
    if (existingPosts.length > 0) {
      console.log('Database already seeded, skipping...');
      return;
    }

    // Get or create categories
    let dronesCategory = await db.select().from(categories).where(eq(categories.slug, 'drones'));
    if (dronesCategory.length === 0) {
      dronesCategory = await db.insert(categories).values({
        name: "Drones",
        slug: "drones",
        description: "Drone enthusiasts, FPV racing, aerial photography, and commercial drone applications",
        color: "#3B82F6",
        isActive: true
      }).returning();
    }

    let rcCategory = await db.select().from(categories).where(eq(categories.slug, 'rc-cars'));
    if (rcCategory.length === 0) {
      rcCategory = await db.insert(categories).values({
        name: "RC Cars",
        slug: "rc-cars",
        description: "Remote control cars, trucks, racing, modifications, and hobby discussions",
        color: "#EF4444",
        isActive: true
      }).returning();
    }

    let woodworkingCategory = await db.select().from(categories).where(eq(categories.slug, 'woodworking'));
    if (woodworkingCategory.length === 0) {
      woodworkingCategory = await db.insert(categories).values({
        name: "Woodworking",
        slug: "woodworking",
        description: "Woodworking projects, tools, techniques, and craftsmanship discussions",
        color: "#8B5CF6",
        isActive: true
      }).returning();
    }

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
      },
      // Additional posts for drones category
      {
        title: "Best Budget Drones Under $300 for Photography",
        content: "Looking for affordable drone options that don't compromise on camera quality. After testing several models, here are my top recommendations for budget-conscious photographers.",
        summary: "Expert review of budget-friendly drones under $300 that deliver excellent photography capabilities without breaking the bank.",
        author: "AerialPhotoGuy",
        url: "https://mavicpilots.com/budget-drones-photography",
        source: "MavicPilots",
        categoryId: dronesCategory[0].id,
        publishedAt: new Date(Date.now() - 10 * 60 * 60 * 1000),
        tags: ["budget drones", "photography", "under $300", "review", "affordable"],
        priority: "trending",
        trendingScore: 82,
        sentiment: "positive",
        upvotes: 124,
        downvotes: 8,
        commentCount: 56,
        viewCount: 1876,
        isCurated: false
      },
      {
        title: "Drone Battery Safety: Preventing LiPo Fires and Explosions",
        content: "Critical safety information about lithium polymer batteries used in drones. Recent incidents highlight the importance of proper charging, storage, and handling procedures.",
        summary: "Essential safety guide for drone LiPo battery management to prevent dangerous fires and explosions.",
        author: "SafetyFirst_Pilot",
        url: "https://reddit.com/r/drones/lipo_safety_guide",
        source: "Reddit",
        categoryId: dronesCategory[0].id,
        publishedAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
        tags: ["battery safety", "LiPo", "fire prevention", "charging", "storage"],
        priority: "hot",
        trendingScore: 95,
        sentiment: "neutral",
        upvotes: 287,
        downvotes: 5,
        commentCount: 73,
        viewCount: 3245,
        isCurated: true,
        curatedBy: "1",
        curatedAt: new Date()
      },
      {
        title: "New FAA Drone Regulations: What Changes in 2025",
        content: "The FAA has announced new regulations for recreational and commercial drone operators effective 2025. Here's what you need to know about registration, flight restrictions, and certification requirements.",
        summary: "Comprehensive overview of new FAA drone regulations taking effect in 2025, covering registration and flight restrictions.",
        author: "CommercialPilot_Pro",
        url: "https://reddit.com/r/drones/faa_regulations_2025",
        source: "Reddit",
        categoryId: dronesCategory[0].id,
        publishedAt: new Date(Date.now() - 14 * 60 * 60 * 1000),
        tags: ["FAA", "regulations", "2025", "commercial", "registration"],
        priority: "news",
        trendingScore: 88,
        sentiment: "neutral",
        upvotes: 198,
        downvotes: 23,
        commentCount: 87,
        viewCount: 2567,
        isCurated: false
      },
      // Additional posts for RC cars
      {
        title: "Upgrading RC Car Suspension: Springs vs Shocks Guide",
        content: "Detailed comparison of different suspension upgrade options for RC cars. Learn when to upgrade springs versus shocks and how each affects handling and performance.",
        summary: "Technical guide comparing RC car suspension upgrades, focusing on springs versus shocks for improved performance.",
        author: "SuspensionTech",
        url: "https://rcgroups.com/suspension-upgrades-guide",
        source: "RC Groups",
        categoryId: rcCategory[0].id,
        publishedAt: new Date(Date.now() - 16 * 60 * 60 * 1000),
        tags: ["suspension", "upgrades", "springs", "shocks", "performance"],
        priority: "normal",
        trendingScore: 68,
        sentiment: "positive",
        upvotes: 45,
        downvotes: 2,
        commentCount: 28,
        viewCount: 987,
        isCurated: false
      },
      {
        title: "Electric vs Nitro RC Cars: Complete Comparison 2025",
        content: "Comprehensive comparison between electric and nitro-powered RC cars. Covering performance, maintenance, cost, and which is better for different types of racing and bashing.",
        summary: "In-depth comparison of electric versus nitro RC cars, helping enthusiasts choose the right power source for their needs.",
        author: "PowerPlant_RC",
        url: "https://rcgroups.com/electric-vs-nitro-2025",
        source: "RC Groups",
        categoryId: rcCategory[0].id,
        publishedAt: new Date(Date.now() - 18 * 60 * 60 * 1000),
        tags: ["electric", "nitro", "comparison", "performance", "maintenance"],
        priority: "trending",
        trendingScore: 76,
        sentiment: "positive",
        upvotes: 92,
        downvotes: 7,
        commentCount: 41,
        viewCount: 1456,
        isCurated: false
      },
      // Additional posts for woodworking
      {
        title: "Table Saw Safety: Preventing Kickback and Injuries",
        content: "Table saw accidents are serious and often preventable. Learn proper techniques, safety equipment, and setup procedures to avoid dangerous kickback and injuries in your workshop.",
        summary: "Critical safety guide for table saw operation, focusing on kickback prevention and injury avoidance techniques.",
        author: "SafetyWoodworker",
        url: "https://reddit.com/r/woodworking/table_saw_safety",
        source: "Woodworking Reddit",
        categoryId: woodworkingCategory[0].id,
        publishedAt: new Date(Date.now() - 20 * 60 * 60 * 1000),
        tags: ["table saw", "safety", "kickback", "injuries", "workshop"],
        priority: "hot",
        trendingScore: 91,
        sentiment: "neutral",
        upvotes: 234,
        downvotes: 3,
        commentCount: 67,
        viewCount: 2789,
        isCurated: true,
        curatedBy: "1",
        curatedAt: new Date()
      },
      {
        title: "Dovetail Joints: Hand Tools vs Router Jigs Comparison",
        content: "Traditional hand-cut dovetails versus modern router jig methods. Examining the pros and cons, time investment, and final quality of each approach for furniture making.",
        summary: "Detailed comparison of hand-cut dovetails versus router jig methods for furniture makers and woodworking enthusiasts.",
        author: "JointMaster_Pro",
        url: "https://reddit.com/r/woodworking/dovetail_methods",
        source: "Woodworking Reddit",
        categoryId: woodworkingCategory[0].id,
        publishedAt: new Date(Date.now() - 22 * 60 * 60 * 1000),
        tags: ["dovetails", "hand tools", "router jigs", "furniture", "joinery"],
        priority: "normal",
        trendingScore: 74,
        sentiment: "positive",
        upvotes: 156,
        downvotes: 12,
        commentCount: 89,
        viewCount: 2134,
        isCurated: false
      },
      {
        title: "Wood Finishing: Oil vs Polyurethane for Dining Tables",
        content: "Choosing the right finish for dining tables that will see daily use. Comparing oil finishes versus polyurethane in terms of durability, appearance, and maintenance requirements.",
        summary: "Guide to selecting appropriate wood finishes for dining tables, comparing oil and polyurethane options.",
        author: "FinishExpert_Wood",
        url: "https://reddit.com/r/woodworking/dining_table_finishes",
        source: "Woodworking Reddit",
        categoryId: woodworkingCategory[0].id,
        publishedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
        tags: ["wood finishing", "oil finish", "polyurethane", "dining tables", "durability"],
        priority: "normal",
        trendingScore: 69,
        sentiment: "positive",
        upvotes: 78,
        downvotes: 4,
        commentCount: 34,
        viewCount: 1567,
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