#!/bin/bash

# Resume Optimizer Deployment Script
# This script automates the deployment process to Firebase

set -e  # Exit on any error

echo "🚀 Resume Optimizer Deployment Script"
echo "======================================"

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

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    print_error "Firebase CLI is not installed. Please install it first:"
    echo "npm install -g firebase-tools"
    exit 1
fi

# Check if we're in the right directory
if [ ! -f "firebase.json" ]; then
    print_error "firebase.json not found. Please run this script from the project root."
    exit 1
fi

# Check if user is logged in to Firebase
if ! firebase projects:list &> /dev/null; then
    print_warning "Not logged in to Firebase. Please login first:"
    echo "firebase login"
    exit 1
fi

print_status "Starting deployment process..."

# Step 1: Install dependencies
print_status "Installing frontend dependencies..."
cd frontend
if [ -f "package.json" ]; then
    npm install
    print_success "Frontend dependencies installed"
else
    print_error "Frontend package.json not found"
    exit 1
fi

# Step 2: Build frontend
print_status "Building frontend application..."
npm run build
if [ $? -eq 0 ]; then
    print_success "Frontend build completed"
else
    print_error "Frontend build failed"
    exit 1
fi

cd ..

# Step 3: Install backend dependencies
print_status "Installing backend dependencies..."
cd backend/functions
if [ -f "package.json" ]; then
    npm install
    print_success "Backend dependencies installed"
else
    print_error "Backend package.json not found"
    exit 1
fi

cd ../..

# Step 4: Deploy to Firebase
print_status "Deploying to Firebase..."

# Deploy functions first
print_status "Deploying Firebase Functions..."
firebase deploy --only functions
if [ $? -eq 0 ]; then
    print_success "Functions deployed successfully"
else
    print_error "Functions deployment failed"
    exit 1
fi

# Deploy Firestore rules
print_status "Deploying Firestore rules..."
firebase deploy --only firestore:rules
if [ $? -eq 0 ]; then
    print_success "Firestore rules deployed successfully"
else
    print_warning "Firestore rules deployment failed (continuing...)"
fi

# Deploy Storage rules
print_status "Deploying Storage rules..."
firebase deploy --only storage
if [ $? -eq 0 ]; then
    print_success "Storage rules deployed successfully"
else
    print_warning "Storage rules deployment failed (continuing...)"
fi

# Deploy hosting
print_status "Deploying to Firebase Hosting..."
firebase deploy --only hosting
if [ $? -eq 0 ]; then
    print_success "Hosting deployed successfully"
else
    print_error "Hosting deployment failed"
    exit 1
fi

# Step 5: Get deployment info
print_status "Getting deployment information..."
PROJECT_ID=$(firebase use --current)
HOSTING_URL="https://${PROJECT_ID}.web.app"

print_success "🎉 Deployment completed successfully!"
echo ""
echo "📋 Deployment Summary:"
echo "======================"
echo "Project ID: ${PROJECT_ID}"
echo "Hosting URL: ${HOSTING_URL}"
echo "Functions URL: https://us-central1-${PROJECT_ID}.cloudfunctions.net/api"
echo ""
echo "🔧 Next Steps:"
echo "1. Test the deployed application"
echo "2. Configure custom domain (optional)"
echo "3. Set up monitoring and alerts"
echo "4. Update DNS records if using custom domain"
echo ""
echo "📚 Documentation:"
echo "- Deployment Guide: docs/deployment.md"
echo "- Architecture: docs/architecture.md"
echo ""

# Optional: Open the deployed app
read -p "Would you like to open the deployed application? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    if command -v open &> /dev/null; then
        open "$HOSTING_URL"
    elif command -v xdg-open &> /dev/null; then
        xdg-open "$HOSTING_URL"
    else
        echo "Please open $HOSTING_URL in your browser"
    fi
fi

print_success "Deployment script completed!"

