#!/bin/bash

echo "Starting PostgreSQL database with Docker..."
docker-compose up -d

echo "Waiting for database to be ready..."
sleep 5

echo "Database is ready!"
echo "Connection string: postgresql://asset911_user:asset911_password@localhost:5432/asset911_db"
