import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Mail, Calendar, Settings, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export default function Profile() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-neutral-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <h2 className="text-xl font-semibold mb-4">Account Required</h2>
          <p className="text-neutral-600 mb-6">Please sign in to view your profile.</p>
          <Button onClick={() => window.location.href = '/api/login'}>
            Sign In
          </Button>
        </Card>
      </div>
    );
  }

  const initials = user.firstName && user.lastName 
    ? `${user.firstName[0]}${user.lastName[0]}` 
    : user.email?.[0]?.toUpperCase() || 'U';

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              onClick={() => window.location.href = '/'}
              className="p-2"
            >
              ← Back to Home
            </Button>
            <h1 className="text-2xl font-bold text-neutral-900">My Account</h1>
          </div>
          <Button 
            variant="outline" 
            onClick={() => window.location.href = '/api/logout'}
            className="flex items-center space-x-2"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign Out</span>
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <Card className="p-6">
              <div className="text-center">
                <Avatar className="h-20 w-20 mx-auto mb-4">
                  <AvatarImage src={user.profileImageUrl || undefined} alt="Profile" />
                  <AvatarFallback className="text-lg">{initials}</AvatarFallback>
                </Avatar>
                
                <h2 className="text-xl font-semibold text-neutral-900 mb-2">
                  {user.firstName && user.lastName 
                    ? `${user.firstName} ${user.lastName}`
                    : user.email?.split('@')[0] || 'User'
                  }
                </h2>
                
                {user.email && (
                  <p className="text-neutral-600 mb-4 flex items-center justify-center">
                    <Mail className="h-4 w-4 mr-2" />
                    {user.email}
                  </p>
                )}
                
                <Badge variant="secondary" className="mb-4">
                  Forum Member
                </Badge>
              </div>
            </Card>
          </div>

          {/* Account Details */}
          <div className="lg:col-span-2">
            <Card className="p-6">
              <div className="flex items-center space-x-2 mb-6">
                <User className="h-5 w-5 text-neutral-600" />
                <h3 className="text-lg font-semibold">Account Information</h3>
              </div>
              
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      First Name
                    </label>
                    <div className="p-3 bg-neutral-50 rounded-lg text-neutral-900">
                      {user.firstName || 'Not provided'}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Last Name
                    </label>
                    <div className="p-3 bg-neutral-50 rounded-lg text-neutral-900">
                      {user.lastName || 'Not provided'}
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Email Address
                  </label>
                  <div className="p-3 bg-neutral-50 rounded-lg text-neutral-900">
                    {user.email || 'Not provided'}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Account Created
                  </label>
                  <div className="p-3 bg-neutral-50 rounded-lg text-neutral-900 flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-neutral-600" />
                    {user.createdAt 
                      ? new Date(user.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })
                      : 'Unknown'
                    }
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Activity Summary */}
        <Card className="p-6 mt-8">
          <div className="flex items-center space-x-2 mb-6">
            <Settings className="h-5 w-5 text-neutral-600" />
            <h3 className="text-lg font-semibold">Account Activity</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-neutral-50 rounded-lg">
              <div className="text-2xl font-bold text-primary mb-2">Active</div>
              <div className="text-sm text-neutral-600">Account Status</div>
            </div>
            
            <div className="text-center p-4 bg-neutral-50 rounded-lg">
              <div className="text-2xl font-bold text-primary mb-2">
                {user.updatedAt 
                  ? new Date(user.updatedAt).toLocaleDateString()
                  : 'Recently'
                }
              </div>
              <div className="text-sm text-neutral-600">Last Updated</div>
            </div>
            
            <div className="text-center p-4 bg-neutral-50 rounded-lg">
              <div className="text-2xl font-bold text-primary mb-2">Forum</div>
              <div className="text-sm text-neutral-600">Subscription Type</div>
            </div>
          </div>
        </Card>

        {/* Actions */}
        <Card className="p-6 mt-8">
          <h3 className="text-lg font-semibold mb-4">Account Actions</h3>
          <div className="space-y-3">
            <p className="text-sm text-neutral-600">
              Need to update your profile information? You can manage your account settings through your Replit profile.
            </p>
            <Button 
              variant="outline"
              onClick={() => window.open('https://replit.com/account', '_blank')}
            >
              Manage Replit Account
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}