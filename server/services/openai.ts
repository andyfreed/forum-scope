import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key"
});

export interface ContentAnalysis {
  summary: string;
  tags: string[];
  priority: 'hot' | 'trending' | 'news' | 'help' | 'market' | 'normal';
  trendingScore: number;
  sentiment: 'positive' | 'neutral' | 'negative';
}

export async function analyzeForumContent(title: string, content: string): Promise<ContentAnalysis> {
  try {
    const prompt = `Analyze this hobby forum post and provide detailed insights in JSON format:

Title: ${title}
Content: ${content}

Please analyze and return:
1. summary: A concise but informative 2-3 sentence summary that captures the key points
2. tags: Array of 4-6 specific, relevant tags/keywords (include brands, models, technical terms)
3. priority: Choose from 'hot', 'trending', 'news', 'help', 'market', 'normal' based on:
   - 'hot': High engagement, controversy, or urgent issues
   - 'trending': Popular topics with growing interest
   - 'news': Official announcements, releases, or breaking developments
   - 'help': Questions, troubleshooting, or advice requests
   - 'market': Product releases, pricing, availability, market analysis
   - 'normal': General discussions, opinions, experiences
4. trendingScore: Number 1-100 based on:
   - Technical innovation (20 points)
   - Community engagement potential (20 points)
   - Market impact (20 points)
   - Urgency/timeliness (20 points)
   - Controversy/discussion value (20 points)
5. sentiment: 'positive', 'neutral', or 'negative' based on overall tone and satisfaction level

Focus on hobby-specific terminology and community interests.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert analyst of hobby and enthusiast communities (drones, RC, FPV, etc.). You understand technical terminology, brand dynamics, and community concerns. Provide detailed, accurate analysis in valid JSON format."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.3, // Lower temperature for more consistent analysis
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    
    return {
      summary: result.summary || content.substring(0, 200) + "...",
      tags: result.tags || extractBasicTags(title + " " + content),
      priority: result.priority || determinePriority(title, content),
      trendingScore: Math.max(1, Math.min(100, result.trendingScore || 50)),
      sentiment: result.sentiment || 'neutral'
    };
  } catch (error) {
    console.error("Failed to analyze content:", error);
    
    // Fallback analysis
    return {
      summary: content.substring(0, 200) + "...",
      tags: extractBasicTags(title + " " + content),
      priority: determinePriority(title, content),
      trendingScore: 50,
      sentiment: 'neutral'
    };
  }
}

export async function summarizeTopics(posts: any[]): Promise<string> {
  try {
    const topicsText = posts.map(post => 
      `Title: ${post.title}\nSummary: ${post.summary || post.content.substring(0, 100)}`
    ).join("\n\n");

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert at summarizing trending topics in hobby communities. Provide a concise overview of the main themes and trends."
        },
        {
          role: "user",
          content: `Summarize the key trends and hot topics from these forum discussions:\n\n${topicsText}`
        }
      ],
    });

    return response.choices[0].message.content || "Unable to generate summary";
  } catch (error) {
    console.error("Failed to summarize topics:", error);
    return "Unable to generate summary at this time";
  }
}

// Fallback methods when OpenAI fails
function extractBasicTags(text: string): string[] {
  const commonKeywords = [
    'DJI', 'Mavic', 'Phantom', 'Mini', 'FPV', 'Battery', 'Firmware', 
    'FAA', 'Part 107', 'Drone', 'RC', 'Racing', 'Camera', 'Gimbal'
  ];
  
  const tags = commonKeywords.filter(keyword => 
    text.toLowerCase().includes(keyword.toLowerCase())
  );
  
  return tags.slice(0, 5);
}

function determinePriority(title: string, content: string): 'hot' | 'trending' | 'news' | 'help' | 'market' | 'normal' {
  const text = (title + " " + content).toLowerCase();
  
  if (text.includes('help') || text.includes('advice') || text.includes('how to')) {
    return 'help';
  }
  if (text.includes('release') || text.includes('announcement') || text.includes('market')) {
    return 'market';
  }
  if (text.includes('breaking') || text.includes('news') || text.includes('emergency')) {
    return 'news';
  }
  if (text.includes('hot') || text.includes('fire') || text.includes('urgent')) {
    return 'hot';
  }
  if (text.includes('trending') || text.includes('popular')) {
    return 'trending';
  }
  
  return 'normal';
}
