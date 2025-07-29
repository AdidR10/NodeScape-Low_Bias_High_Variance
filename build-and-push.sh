#!/bin/bash

# NodeScape Docker Build and Push Script
# This script builds and pushes frontend and backend Docker images to Docker Hub

set -e  # Exit on any error

# Configuration
DOCKER_HUB_USERNAME="asifmahmoud414"
IMAGE_NAME_PREFIX="nodescape"
FRONTEND_IMAGE_NAME="${IMAGE_NAME_PREFIX}-frontend"
BACKEND_IMAGE_NAME="${IMAGE_NAME_PREFIX}-backend"
VERSION=$(date +%Y%m%d-%H%M%S)  # Timestamp-based versioning
LATEST_TAG="latest"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if Docker is running
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker and try again."
        exit 1
    fi
    print_success "Docker is running"
}

# Function to get Docker Hub username
get_docker_hub_username() {
    if [ -z "$DOCKER_HUB_USERNAME" ]; then
        echo -n "Enter your Docker Hub username: "
        read DOCKER_HUB_USERNAME
        if [ -z "$DOCKER_HUB_USERNAME" ]; then
            print_error "Docker Hub username is required"
            exit 1
        fi
    fi
}

# Function to login to Docker Hub
login_to_docker_hub() {
    print_status "Logging in to Docker Hub..."
    if docker login; then
        print_success "Successfully logged in to Docker Hub"
    else
        print_error "Failed to login to Docker Hub"
        exit 1
    fi
}

# Function to build frontend image
build_frontend() {
    print_status "Building frontend Docker image..."
    
    cd frontend
    
    # Build with build args
    docker build \
        --build-arg REACT_APP_API_URL=http://localhost:5000 \
        -t "${DOCKER_HUB_USERNAME}/${FRONTEND_IMAGE_NAME}:${VERSION}" \
        -t "${DOCKER_HUB_USERNAME}/${FRONTEND_IMAGE_NAME}:${LATEST_TAG}" \
        .
    
    if [ $? -eq 0 ]; then
        print_success "Frontend image built successfully"
    else
        print_error "Failed to build frontend image"
        exit 1
    fi
    
    cd ..
}

# Function to build backend image
build_backend() {
    print_status "Building backend Docker image..."
    
    cd backend
    
    # Build the image
    docker build \
        -t "${DOCKER_HUB_USERNAME}/${BACKEND_IMAGE_NAME}:${VERSION}" \
        -t "${DOCKER_HUB_USERNAME}/${BACKEND_IMAGE_NAME}:${LATEST_TAG}" \
        .
    
    if [ $? -eq 0 ]; then
        print_success "Backend image built successfully"
    else
        print_error "Failed to build backend image"
        exit 1
    fi
    
    cd ..
}

# Function to push images to Docker Hub
push_images() {
    print_status "Pushing images to Docker Hub..."
    
    # Push frontend images
    print_status "Pushing frontend image..."
    docker push "${DOCKER_HUB_USERNAME}/${FRONTEND_IMAGE_NAME}:${VERSION}"
    docker push "${DOCKER_HUB_USERNAME}/${FRONTEND_IMAGE_NAME}:${LATEST_TAG}"
    
    if [ $? -eq 0 ]; then
        print_success "Frontend images pushed successfully"
    else
        print_error "Failed to push frontend images"
        exit 1
    fi
    
    # Push backend images
    print_status "Pushing backend image..."
    docker push "${DOCKER_HUB_USERNAME}/${BACKEND_IMAGE_NAME}:${VERSION}"
    docker push "${DOCKER_HUB_USERNAME}/${BACKEND_IMAGE_NAME}:${LATEST_TAG}"
    
    if [ $? -eq 0 ]; then
        print_success "Backend images pushed successfully"
    else
        print_error "Failed to push backend images"
        exit 1
    fi
}

# Function to display image information
display_image_info() {
    print_success "Build and push completed successfully!"
    echo ""
    echo "Image Information:"
    echo "=================="
    echo "Frontend Image: ${DOCKER_HUB_USERNAME}/${FRONTEND_IMAGE_NAME}"
    echo "  - Version: ${VERSION}"
    echo "  - Latest: ${LATEST_TAG}"
    echo ""
    echo "Backend Image: ${DOCKER_HUB_USERNAME}/${BACKEND_IMAGE_NAME}"
    echo "  - Version: ${VERSION}"
    echo "  - Latest: ${LATEST_TAG}"
    echo ""
    echo "To pull these images:"
    echo "  docker pull ${DOCKER_HUB_USERNAME}/${FRONTEND_IMAGE_NAME}:${VERSION}"
    echo "  docker pull ${DOCKER_HUB_USERNAME}/${BACKEND_IMAGE_NAME}:${VERSION}"
    echo ""
    echo "To run with docker-compose, update your docker-compose.yml:"
    echo "  frontend:"
    echo "    image: ${DOCKER_HUB_USERNAME}/${FRONTEND_IMAGE_NAME}:${VERSION}"
    echo "  backend:"
    echo "    image: ${DOCKER_HUB_USERNAME}/${BACKEND_IMAGE_NAME}:${VERSION}"
}

# Function to clean up local images (optional)
cleanup_local_images() {
    read -p "Do you want to remove local images to save space? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_status "Removing local images..."
        docker rmi "${DOCKER_HUB_USERNAME}/${FRONTEND_IMAGE_NAME}:${VERSION}" || true
        docker rmi "${DOCKER_HUB_USERNAME}/${FRONTEND_IMAGE_NAME}:${LATEST_TAG}" || true
        docker rmi "${DOCKER_HUB_USERNAME}/${BACKEND_IMAGE_NAME}:${VERSION}" || true
        docker rmi "${DOCKER_HUB_USERNAME}/${BACKEND_IMAGE_NAME}:${LATEST_TAG}" || true
        print_success "Local images removed"
    fi
}

# Main execution
main() {
    echo "=========================================="
    echo "NodeScape Docker Build and Push Script"
    echo "=========================================="
    echo ""
    
    # Check prerequisites
    check_docker
    get_docker_hub_username
    login_to_docker_hub
    
    # Build images
    build_frontend
    build_backend
    
    # Push images
    push_images
    
    # Display results
    display_image_info
    
    # Optional cleanup
    cleanup_local_images
    
    print_success "Script completed successfully!"
}

# Run main function
main "$@" 