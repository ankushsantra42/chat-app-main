#!/usr/bin/env bash
# exit on error
set -o errexit

echo "Installing backend dependencies..."
npm install --prefix backend

echo "Installing frontend dependencies..."
npm install --include=dev --prefix frontend

echo "Building frontend..."
npm run build --prefix frontend
