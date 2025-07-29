#!/bin/bash

# Deployment script for NodeScape Graph Visualizer

set -e

# Configuration
IMAGE_NAME="nodescape-graph-visualizer"
CONTAINER_NAME="nodescape-app"
PORT="3000"
DOCKERHUB_USERNAME="${DOCKERHUB_USERNAME:-asifmahmoud414}"
IMAGE_TAG="${IMAGE_TAG:-latest}"

echo "🚀 Starting NodeScape deployment..."

# Check if we're using a remote image or building locally
if [[ "$1" == "--remote" ]] || [[ "$IMAGE_TAG" != "latest" ]]; then
    echo "📦 Using remote Docker image: $DOCKERHUB_USERNAME/$IMAGE_NAME:$IMAGE_TAG"
    
    # Pull the latest image
    docker pull $DOCKERHUB_USERNAME/$IMAGE_NAME:$IMAGE_TAG
    
    # Stop and remove existing container if it exists
    echo "🛑 Stopping existing container..."
    docker stop $CONTAINER_NAME 2>/dev/null || true
    docker rm $CONTAINER_NAME 2>/dev/null || true
    
    # Run the container
    echo "🏃 Starting new container..."
    docker run -d \
      --name $CONTAINER_NAME \
      -p $PORT:80 \
      --restart unless-stopped \
      $DOCKERHUB_USERNAME/$IMAGE_NAME:$IMAGE_TAG
else
    echo "📦 Building Docker image locally..."
    
    # Build the Docker image
    docker build -t $IMAGE_NAME .
    
    # Stop and remove existing container if it exists
    echo "🛑 Stopping existing container..."
    docker stop $CONTAINER_NAME 2>/dev/null || true
    docker rm $CONTAINER_NAME 2>/dev/null || true
    
    # Run the new container
    echo "🏃 Starting new container..."
    docker run -d \
      --name $CONTAINER_NAME \
      -p $PORT:80 \
      --restart unless-stopped \
      $IMAGE_NAME
fi

echo "✅ Deployment complete!"
echo "🌐 Application is running at http://localhost:$PORT"
echo "📊 Container status:"
docker ps --filter "name=$CONTAINER_NAME"

echo ""
echo "Usage examples:"
echo "  ./scripts/deploy.sh                    # Build and run locally"
echo "  ./scripts/deploy.sh --remote           # Use latest remote image"
echo "  IMAGE_TAG=1.0.5 ./scripts/deploy.sh   # Use specific version"
echo "  DOCKERHUB_USERNAME=yourname IMAGE_TAG=dev ./scripts/deploy.sh  # Custom image" 