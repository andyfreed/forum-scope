import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ChevronUp, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { cn } from "@/lib/utils";
import { isUnauthorizedError } from "@/lib/authUtils";

interface VotingButtonsProps {
  postId: number;
  initialUpvotes?: number;
  initialDownvotes?: number;
  initialUserScore?: number;
  className?: string;
}

export default function VotingButtons({
  postId,
  initialUpvotes = 0,
  initialDownvotes = 0,
  initialUserScore = 0,
  className
}: VotingButtonsProps) {
  const { toast } = useToast();
  const [upvotes, setUpvotes] = useState(initialUpvotes);
  const [downvotes, setDownvotes] = useState(initialDownvotes);
  const [userScore, setUserScore] = useState(initialUserScore);

  // Get user's current vote
  const { data: userVote } = useQuery({
    queryKey: [`/api/posts/${postId}/vote`],
    retry: false,
  });

  // Vote mutation
  const voteMutation = useMutation({
    mutationFn: async (voteType: 'upvote' | 'downvote') => {
      return await apiRequest(`/api/posts/${postId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ voteType }),
      });
    },
    onSuccess: (data) => {
      setUpvotes(data.upvotes);
      setDownvotes(data.downvotes);
      setUserScore(data.userScore);
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: [`/api/posts/${postId}/vote`] });
      queryClient.invalidateQueries({ queryKey: ['/api/posts'] });
      
      toast({
        title: "Vote recorded",
        description: "Your vote has been recorded successfully.",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Vote failed",
        description: "Failed to record your vote. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleVote = (voteType: 'upvote' | 'downvote') => {
    voteMutation.mutate(voteType);
  };

  const currentVote = userVote?.vote;
  const isUpvoted = currentVote === 'upvote';
  const isDownvoted = currentVote === 'downvote';

  return (
    <div className={cn("flex items-center gap-1", className)}>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleVote('upvote')}
        disabled={voteMutation.isPending}
        className={cn(
          "flex items-center gap-1 px-2 py-1 h-8",
          isUpvoted && "text-green-600 bg-green-50 hover:bg-green-100"
        )}
      >
        <ChevronUp className={cn("h-4 w-4", isUpvoted && "fill-current")} />
        <span className="text-sm font-medium">{upvotes}</span>
      </Button>

      <div className="flex items-center px-2 py-1 text-sm font-medium text-muted-foreground">
        {userScore >= 0 ? '+' : ''}{userScore}
      </div>

      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleVote('downvote')}
        disabled={voteMutation.isPending}
        className={cn(
          "flex items-center gap-1 px-2 py-1 h-8",
          isDownvoted && "text-red-600 bg-red-50 hover:bg-red-100"
        )}
      >
        <ChevronDown className={cn("h-4 w-4", isDownvoted && "fill-current")} />
        <span className="text-sm font-medium">{downvotes}</span>
      </Button>
    </div>
  );
}