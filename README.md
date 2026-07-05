
# AffectX AI - Deployment Guide

## Quick Start with Docker

### Prerequisites
- Docker & Docker Compose installed
- Git installed

### Local Deployment (Development)

```bash
# Clone the repository
git clone <your-repo>
cd affectx-ai

# Build and run with Docker Compose
docker-compose up --build

# Access the application
# Frontend: http://localhost:3000
# Backend: http://localhost:5000
# AI Service: http://localhost:5001
