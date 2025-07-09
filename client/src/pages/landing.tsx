import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, TrendingUp, Users, Zap, MessageCircle, Star } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Search className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-900">ForumScope</h1>
          </div>
          <Button onClick={() => window.location.href = '/api/login'}>
            Sign In with Replit
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-4xl mx-auto">
          <Badge variant="secondary" className="mb-4">
            <Zap className="h-3 w-3 mr-1" />
            AI-Powered Forum Aggregation
          </Badge>
          
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Stay Connected to Your
            <span className="text-blue-600"> Hobby Communities</span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            ForumScope aggregates discussions from drone forums, RC car communities, and other hobby sites, 
            using AI to surface trending topics and important conversations you might miss.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              onClick={() => window.location.href = '/api/login'}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Get Started Free
            </Button>
            <Button size="lg" variant="outline">
              View Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Everything You Need to Stay Updated
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            From automated content aggregation to intelligent prioritization, 
            ForumScope helps you never miss important discussions in your hobby communities.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <TrendingUp className="h-10 w-10 text-blue-600 mb-2" />
              <CardTitle>AI-Powered Analysis</CardTitle>
              <CardDescription>
                Our AI analyzes posts to identify trending topics, priority levels, and sentiment
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Automatic content summarization</li>
                <li>• Smart priority classification</li>
                <li>• Sentiment analysis</li>
                <li>• Trending score calculation</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader>
              <MessageCircle className="h-10 w-10 text-green-600 mb-2" />
              <CardTitle>Multi-Platform Aggregation</CardTitle>
              <CardDescription>
                Connect all your favorite hobby forums and communities in one place
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Reddit integration</li>
                <li>• Specialized hobby forums</li>
                <li>• Real-time content updates</li>
                <li>• Custom source management</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader>
              <Users className="h-10 w-10 text-purple-600 mb-2" />
              <CardTitle>Community Features</CardTitle>
              <CardDescription>
                Vote, curate, and engage with content alongside other community members
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Upvote and downvote posts</li>
                <li>• Bookmark interesting content</li>
                <li>• Feature important discussions</li>
                <li>• Community moderation tools</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="bg-blue-600 rounded-2xl p-12 text-center text-white">
          <Star className="h-12 w-12 mx-auto mb-4 text-yellow-300" />
          <h2 className="text-3xl font-bold mb-4">
            Ready to Transform Your Hobby Research?
          </h2>
          <p className="text-xl mb-8 text-blue-100 max-w-2xl mx-auto">
            Join thousands of hobbyists who use ForumScope to stay connected 
            to their communities and never miss important discussions.
          </p>
          <Button 
            size="lg" 
            variant="secondary"
            onClick={() => window.location.href = '/api/login'}
          >
            Start Using ForumScope
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-6 h-6 bg-blue-600 rounded-lg flex items-center justify-center">
                <Search className="h-4 w-4 text-white" />
              </div>
              <span className="font-semibold text-gray-900">ForumScope</span>
            </div>
            <p className="text-sm text-gray-600">
              © 2025 ForumScope. Built for hobby enthusiasts everywhere.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}