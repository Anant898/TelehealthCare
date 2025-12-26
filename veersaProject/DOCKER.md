# Docker Setup for MongoDB

This guide explains how to run MongoDB using Docker for the Telehealth Solution project.

## Prerequisites

- Docker installed on your system
- Docker Compose installed (usually comes with Docker Desktop)

## Quick Start

### 1. Start MongoDB Container

```bash
# From the project root directory
docker-compose up -d
```

This will:
- Pull the MongoDB 7.0 image (if not already present)
- Create and start a MongoDB container
- Expose MongoDB on port 27017
- Create persistent volumes for data storage

### 2. Verify MongoDB is Running

```bash
# Check container status
docker-compose ps

# View logs
docker-compose logs mongodb

# Test connection
docker exec -it telehealth-mongodb mongosh -u admin -p password
```

### 3. Update Backend Configuration

Update your `backend/.env` file to use the Docker MongoDB instance:

```env
MONGODB_URI=mongodb://admin:password@localhost:27017/telehealth?authSource=admin
```

Or if you prefer to connect without authentication (for development only):

```env
MONGODB_URI=mongodb://localhost:27017/telehealth
```

**Note:** The default credentials are:
- Username: `admin`
- Password: `password`

**⚠️ IMPORTANT:** Change these credentials in production!

## Docker Commands

### Start MongoDB
```bash
docker-compose up -d
```

### Stop MongoDB
```bash
docker-compose down
```

### Stop and Remove Volumes (⚠️ This deletes all data)
```bash
docker-compose down -v
```

### View Logs
```bash
docker-compose logs -f mongodb
```

### Access MongoDB Shell
```bash
docker exec -it telehealth-mongodb mongosh -u admin -p password
```

### Restart MongoDB
```bash
docker-compose restart mongodb
```

## Customizing MongoDB Configuration

To change MongoDB settings, edit the `docker-compose.yml` file:

### Change Port
If port 27017 is already in use, change it in `docker-compose.yml`:
```yaml
ports:
  - "27018:27017"  # Use 27018 on host, 27017 in container
```

Then update your `.env`:
```env
MONGODB_URI=mongodb://admin:password@localhost:27018/telehealth?authSource=admin
```

### Change Credentials
Update the environment variables in `docker-compose.yml`:
```yaml
environment:
  MONGO_INITDB_ROOT_USERNAME: your_username
  MONGO_INITDB_ROOT_PASSWORD: your_password
```

**Note:** Changing credentials after the first run requires removing volumes:
```bash
docker-compose down -v
docker-compose up -d
```

### Change Database Name
Update `MONGO_INITDB_DATABASE` in `docker-compose.yml` and your `.env` file.

## Data Persistence

MongoDB data is stored in Docker volumes:
- `mongodb_data`: Database files
- `mongodb_config`: Configuration files

Data persists even if you stop the container. To completely remove data:
```bash
docker-compose down -v
```

## Troubleshooting

### Port Already in Use
If port 27017 is already in use:
1. Stop the existing MongoDB service
2. Or change the port in `docker-compose.yml`

### Connection Refused
- Make sure the container is running: `docker-compose ps`
- Check logs: `docker-compose logs mongodb`
- Verify the connection string in your `.env` file

### Permission Issues
On Linux, you might need to run Docker commands with `sudo` or add your user to the docker group.

## Production Considerations

For production use:
1. Change default credentials
2. Use environment variables for sensitive data
3. Set up proper backup strategies
4. Configure MongoDB authentication properly
5. Use a MongoDB replica set for high availability
6. Set resource limits in docker-compose.yml

Example with resource limits:
```yaml
services:
  mongodb:
    # ... other config ...
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G
        reservations:
          cpus: '1'
          memory: 1G
```

