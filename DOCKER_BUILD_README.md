# NodeScape Docker Build and Push Script

This script automates the process of building and pushing Docker images for the NodeScape frontend and backend services to Docker Hub.

## Prerequisites

1. **Docker**: Make sure Docker is installed and running on your system
2. **Docker Hub Account**: You need a Docker Hub account to push images
3. **Docker Hub Access Token**: For automated login (optional, you can login manually)

## Usage

### Basic Usage

```bash
./build-and-push.sh
```

The script will:
1. Check if Docker is running
2. Prompt for your Docker Hub username
3. Prompt for Docker Hub login credentials
4. Build both frontend and backend images
5. Push images to Docker Hub with version and latest tags
6. Display image information and usage instructions

### Advanced Usage

You can set the Docker Hub username as an environment variable:

```bash
export DOCKER_HUB_USERNAME="your-username"
./build-and-push.sh
```

## Image Naming Convention

The script creates images with the following naming convention:

- **Frontend**: `{username}/nodescape-frontend:{version}` and `{username}/nodescape-frontend:latest`
- **Backend**: `{username}/nodescape-backend:{version}` and `{username}/nodescape-backend:latest`

Version format: `YYYYMMDD-HHMMSS` (timestamp-based)

## What the Script Does

### 1. Prerequisites Check
- Verifies Docker is running
- Prompts for Docker Hub username if not provided

### 2. Authentication
- Logs in to Docker Hub (interactive)

### 3. Building Images
- **Frontend**: Builds React app with production optimizations using nginx
- **Backend**: Builds Python Flask application with all dependencies

### 4. Pushing Images
- Pushes both versioned and latest tags to Docker Hub
- Provides detailed feedback on push status

### 5. Cleanup (Optional)
- Offers to remove local images to save disk space

## Using the Pushed Images

### Pull Images
```bash
docker pull {username}/nodescape-frontend:latest
docker pull {username}/nodescape-backend:latest
```

### Update docker-compose.yml
Replace the build sections with image references:

```yaml
version: '3.8'

services:
  frontend:
    image: {username}/nodescape-frontend:latest
    ports:
      - "3000:80"
    environment:
      - NODE_ENV=production
      - REACT_APP_API_URL=http://localhost:5000
    depends_on:
      - backend
    restart: unless-stopped
    networks:
      - nodescape-network

  backend:
    image: {username}/nodescape-backend:latest
    ports:
      - "5000:5000"
    environment:
      - FLASK_ENV=production
      - FLASK_APP=app.py
    volumes:
      - ./backend/lightgin_model_weights.h5:/app/lightgin_model_weights.h5:ro
    restart: unless-stopped
    networks:
      - nodescape-network

networks:
  nodescape-network:
    driver: bridge
```

## Troubleshooting

### Common Issues

1. **Docker not running**
   - Start Docker Desktop or Docker daemon
   - Run `docker info` to verify

2. **Authentication failed**
   - Check your Docker Hub credentials
   - Use `docker login` manually if needed

3. **Build fails**
   - Check that all required files are present
   - Verify Dockerfile syntax
   - Check disk space

4. **Push fails**
   - Verify internet connection
   - Check Docker Hub repository permissions
   - Ensure you're logged in to Docker Hub

### Debug Mode

To see more detailed output, you can modify the script to remove `set -e` or add `set -x` for verbose output.

## Security Notes

- The script prompts for credentials interactively
- No credentials are stored in the script
- Consider using Docker Hub access tokens for automated deployments

## Customization

You can modify the script to:
- Change image naming convention
- Add additional build arguments
- Modify versioning strategy
- Add additional validation steps

## Support

For issues or questions:
1. Check the troubleshooting section
2. Verify all prerequisites are met
3. Review Docker and Docker Hub documentation 