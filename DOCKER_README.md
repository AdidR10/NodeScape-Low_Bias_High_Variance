# NodeScape Docker Deployment Guide

This guide explains how to deploy the NodeScape application using Docker and Docker Compose.

## Project Structure

```
NodeScape-Low_Bias_High_Variance/
├── frontend/                 # React frontend application
│   ├── Dockerfile           # Frontend Docker configuration
│   ├── docker-compose.yml   # Frontend-only compose file
│   ├── nginx.conf          # Nginx configuration for production
│   └── src/
├── backend/                  # Python Flask backend
│   ├── Dockerfile           # Backend Docker configuration
│   ├── docker-compose.yml   # Backend-only compose file
│   ├── requirements.txt     # Python dependencies
│   └── lightgin_model_weights.h5  # ML model weights
└── docker-compose.yml       # Root compose file for full stack
```

## Quick Start

### Full Stack Deployment (Recommended)

```bash
# Build and start both frontend and backend
docker-compose up --build

# Run in detached mode
docker-compose up -d --build

# Stop services
docker-compose down

# Test API connection
node test-api.js
```

### Development Mode

```bash
# Run with development configuration
docker-compose -f docker-compose.dev.yml up --build
```

### Individual Service Deployment

#### Frontend Only
```bash
cd frontend
docker-compose up --build
```

#### Backend Only
```bash
cd backend
docker-compose up --build
```

## Services

### Frontend (Port 3000)
- **Technology**: React with Nginx
- **URL**: http://localhost:3000
- **Features**: 
  - React Router support
  - API proxy to backend
  - Static asset optimization
  - Security headers

### Backend (Port 5000)
- **Technology**: Python Flask with TensorFlow
- **URL**: http://localhost:5000
- **Features**:
  - ML model inference
  - REST API endpoints
  - Health checks
  - Model weights mounted as volume

## Environment Variables

### Frontend
- `REACT_APP_API_URL`: Backend API URL (default: http://localhost:5000)

### Backend
- `FLASK_ENV`: Flask environment (production/development)
- `FLASK_APP`: Flask application entry point

## API Endpoints

### Backend API
- `POST /predict`: Graph prediction endpoint
  - **Request**: `{"edgelist": "0,1;1,2;2,3"}`
  - **Response**: `{"prediction": 2}`

## Docker Images

### Frontend Image
- **Base**: Node.js 18 Alpine (build) + Nginx Alpine (production)
- **Size**: ~50MB (optimized)
- **Features**: Multi-stage build, static asset optimization

### Backend Image
- **Base**: Python 3.10 Slim
- **Size**: ~800MB (includes TensorFlow)
- **Features**: ML model support, health checks

## CI/CD Pipeline

The GitHub Actions workflow includes:

1. **Change Detection**: Automatically detects frontend/backend changes
2. **Conditional Testing**: Only runs tests for changed components
3. **Docker Builds**: Builds and pushes Docker images to Docker Hub
4. **Security Scanning**: Trivy vulnerability scanning
5. **Docker Compose Validation**: Validates compose configurations

### Secrets Required
- `DOCKERHUB_USERNAME`: Docker Hub username
- `DOCKERHUB_TOKEN`: Docker Hub access token

## Troubleshooting

### Common Issues

1. **Port Conflicts**
   ```bash
   # Check if ports are in use
   netstat -tulpn | grep :3000
   netstat -tulpn | grep :5000
   ```

2. **Model Loading Issues**
   ```bash
   # Check if model file exists
   ls -la backend/lightgin_model_weights.h5
   ```

3. **Network Issues**
   ```bash
   # Check Docker networks
   docker network ls
   docker network inspect nodescape-network
   ```

### Logs
```bash
# View all logs
docker-compose logs

# View specific service logs
docker-compose logs frontend
docker-compose logs backend

# Follow logs in real-time
docker-compose logs -f
```

## Development

### Local Development
```bash
# Frontend development
cd frontend
npm start

# Backend development
cd backend
python app.py
```

### Docker Development
```bash
# Build with no cache
docker-compose build --no-cache

# Run with volume mounts for development
docker-compose -f docker-compose.dev.yml up
```

## Production Deployment

### Environment Setup
1. Set production environment variables
2. Configure reverse proxy (Nginx/Apache)
3. Set up SSL certificates
4. Configure monitoring and logging

### Scaling
```bash
# Scale backend service
docker-compose up -d --scale backend=3

# Scale frontend service
docker-compose up -d --scale frontend=2
```

## Security Considerations

1. **Model Security**: Model weights are mounted as read-only
2. **Network Isolation**: Services communicate via Docker network
3. **Security Headers**: Nginx configuration includes security headers
4. **Vulnerability Scanning**: CI/CD includes Trivy security scanning

## Monitoring

### Health Checks
- Backend: `/predict` endpoint health check
- Frontend: Nginx status monitoring

### Metrics
- Container resource usage
- API response times
- Error rates

## Backup and Recovery

### Model Backup
```bash
# Backup model weights
docker cp backend:/app/lightgin_model_weights.h5 ./backup/
```

### Database Backup (if applicable)
```bash
# Backup any persistent data
docker-compose exec backend tar -czf /backup/data.tar.gz /app/data
``` 