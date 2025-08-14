#!/usr/bin/env bash

#
# This script deploys the Preference Visualization application to a web server.
# @author Mehtab "Shahan" Iqbal
# @version 1.0.0
# @date 2025-08-14
# Note: The echo messages were generated using Gemini AI. I like the emojis!


set -e

echo "🚀 Starting deployment..."

echo "📦 Building the application..."
npm run build

echo "🚚 Syncing files to /var/www/preference-visualization/..."
sudo rsync -av --delete ./build/ /var/www/preference-visualization/

echo "🔐 Setting file permissions..."
sudo chown -R www-data:www-data /var/www/preference-visualization/

echo "✅ Deployment complete!"