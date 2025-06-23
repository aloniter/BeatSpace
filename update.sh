#!/bin/bash
echo "🚀 Updating BeatSpace VR..."

git add .
if git diff --staged --quiet; then
    echo "ℹ️  No changes to commit"
else
    git commit -m "BeatSpace VR update - $(date '+%Y-%m-%d %H:%M:%S')"
    git push origin main
    echo "✅ BeatSpace updated!"
    echo "🌐 Live at: https://aloniter.github.io/BeatSpace/"
fi
