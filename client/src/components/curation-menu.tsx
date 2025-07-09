import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { 
  MoreHorizontal, 
  Bookmark, 
  Star, 
  EyeOff, 
  Flag,
  BookmarkCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";

interface CurationMenuProps {
  postId: number;
  isCurated?: boolean;
  className?: string;
}

export default function CurationMenu({ 
  postId, 
  isCurated = false, 
  className 
}: CurationMenuProps) {
  const { toast } = useToast();
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [reportReason, setReportReason] = useState('');

  // Curation mutation
  const curationMutation = useMutation({
    mutationFn: async ({ curationType, reason }: { curationType: string; reason?: string }) => {
      return await apiRequest(`/api/posts/${postId}/curate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ curationType, reason }),
      });
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['/api/posts'] });
      queryClient.invalidateQueries({ queryKey: ['/api/curations'] });
      
      const actionMessages = {
        bookmark: 'Post bookmarked successfully',
        feature: 'Post featured for the community',
        hide: 'Post hidden from your feed',
        report: 'Post reported. Thank you for helping keep the community safe.',
      };
      
      toast({
        title: "Success",
        description: actionMessages[variables.curationType as keyof typeof actionMessages],
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
        title: "Action failed",
        description: "Failed to perform action. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleCuration = (curationType: string, reason?: string) => {
    curationMutation.mutate({ curationType, reason });
  };

  const handleReport = () => {
    if (!reportReason.trim()) {
      toast({
        title: "Reason required",
        description: "Please provide a reason for reporting this post.",
        variant: "destructive",
      });
      return;
    }
    
    handleCuration('report', reportReason);
    setReportDialogOpen(false);
    setReportReason('');
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className={className}>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem 
            onClick={() => handleCuration('bookmark')}
            disabled={curationMutation.isPending}
          >
            <Bookmark className="h-4 w-4 mr-2" />
            Bookmark
          </DropdownMenuItem>
          
          <DropdownMenuItem 
            onClick={() => handleCuration('feature')}
            disabled={curationMutation.isPending || isCurated}
          >
            {isCurated ? (
              <>
                <BookmarkCheck className="h-4 w-4 mr-2" />
                Featured
              </>
            ) : (
              <>
                <Star className="h-4 w-4 mr-2" />
                Feature Post
              </>
            )}
          </DropdownMenuItem>

          <DropdownMenuSeparator />
          
          <DropdownMenuItem 
            onClick={() => handleCuration('hide')}
            disabled={curationMutation.isPending}
          >
            <EyeOff className="h-4 w-4 mr-2" />
            Hide
          </DropdownMenuItem>
          
          <DropdownMenuItem 
            onClick={() => setReportDialogOpen(true)}
            disabled={curationMutation.isPending}
            className="text-red-600 focus:text-red-600"
          >
            <Flag className="h-4 w-4 mr-2" />
            Report
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={reportDialogOpen} onOpenChange={setReportDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Report Post</DialogTitle>
            <DialogDescription>
              Please provide a reason for reporting this post. This helps our moderators review content.
            </DialogDescription>
          </DialogHeader>
          
          <Textarea
            placeholder="Please describe why you're reporting this post..."
            value={reportReason}
            onChange={(e) => setReportReason(e.target.value)}
            className="min-h-[100px]"
          />
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setReportDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleReport}
              disabled={!reportReason.trim() || curationMutation.isPending}
            >
              Submit Report
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}