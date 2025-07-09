// Simple test script to trigger social media aggregation and show results
const axios = require('axios');

async function testSocialMediaIntegration() {
  console.log('Testing Social Media Integration...\n');
  
  try {
    // 1. Get initial trending data
    console.log('1. Getting initial social media trending data...');
    const initialTrending = await axios.get('http://localhost:5000/api/social-media/trending');
    console.log('Initial posts:', initialTrending.data.totalPosts);
    console.log('Platforms:', Object.keys(initialTrending.data.platformBreakdown));
    console.log('');

    // 2. Trigger aggregation
    console.log('2. Triggering social media aggregation...');
    const aggregation = await axios.post('http://localhost:5000/api/social-media/aggregate', {
      timeout: 60000
    });
    console.log('Aggregation result:', aggregation.data.message);
    console.log('');

    // 3. Wait a moment and get updated data
    console.log('3. Getting updated trending data...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    const updatedTrending = await axios.get('http://localhost:5000/api/social-media/trending');
    console.log('Updated posts:', updatedTrending.data.totalPosts);
    console.log('Platforms:', Object.keys(updatedTrending.data.platformBreakdown));
    console.log('Trending tags:', updatedTrending.data.trendingTags?.slice(0, 5));
    console.log('');

    // 4. Get all posts to see social media content
    console.log('4. Getting recent posts including social media...');
    const posts = await axios.get('http://localhost:5000/api/posts?sortBy=recent');
    const socialPosts = posts.data.filter(post => ['Reddit', 'YouTube', 'RSS Feed'].includes(post.source));
    console.log(`Found ${socialPosts.length} social media posts out of ${posts.data.length} total posts`);
    
    if (socialPosts.length > 0) {
      console.log('\nRecent social media posts:');
      socialPosts.slice(0, 3).forEach((post, i) => {
        console.log(`${i + 1}. [${post.source}] ${post.title}`);
        console.log(`   Priority: ${post.priority} | Tags: ${post.tags?.join(', ') || 'None'}`);
      });
    }

  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

testSocialMediaIntegration();