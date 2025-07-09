#!/bin/bash

# Option 1: Reset to the commit before the problematic one
# First, let's see the recent commits
echo "Recent commits:"
git log --oneline -5

echo ""
echo "To fix this, run these commands in the Shell:"
echo ""
echo "# Reset to the commit before the one with the token"
echo "git reset --hard HEAD~1"
echo ""
echo "# Force push to overwrite the remote history"
echo "git push origin main --force"
echo ""
echo "Alternative: If you want to keep your changes but remove the bad commit:"
echo ""
echo "# Reset softly to keep your changes"
echo "git reset --soft HEAD~1"
echo ""
echo "# Re-commit without the problematic file"
echo "git add ."
echo "git commit -m 'Production-ready ForumScope with PostgreSQL database, voting system, and load more pagination'"
echo ""
echo "# Force push"
echo "git push origin main --force"