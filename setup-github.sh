#!/bin/bash

# Using your actual GitHub repository
GITHUB_USERNAME="sosnickm"
REPO_NAME="mapsonmaps"

echo "🚀 Setting up GitHub repository..."

# Add remote origin
git remote add origin https://github.com/$GITHUB_USERNAME/$REPO_NAME.git

# Push to GitHub
git branch -M main
git push -u origin main

echo "✅ Repository pushed to GitHub!"
echo "🌐 Visit: https://github.com/$GITHUB_USERNAME/$REPO_NAME"
