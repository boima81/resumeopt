#!/bin/bash

# Environment Setup Script for Resume Optimizer
# This script helps configure the application for different environments

set -e

echo "🔧 Resume Optimizer Environment Setup"
echo "====================================="

# Function to prompt for input with default value
prompt_with_default() {
    local prompt="$1"
    local default="$2"
    local result
    
    read -p "$prompt [$default]: " result
    echo "${result:-$default}"
}

# Function to validate Firebase project ID
validate_project_id() {
    local project_id="$1"
    if [[ ! "$project_id" =~ ^[a-z0-9-]+$ ]]; then
        echo "Invalid project ID. Must contain only lowercase letters, numbers, and hyphens."
        return 1
    fi
    return 0
}

echo "This script will help you configure the Resume Optimizer for deployment."
echo ""

# Get Firebase project ID
while true; do
    PROJECT_ID=$(prompt_with_default "Enter your Firebase Project ID" "resume-optimizer-app")
    if validate_project_id "$PROJECT_ID"; then
        break
    fi
done

# Get Gemini API key
echo ""
echo "Get your Gemini API key from: https://makersuite.google.com/app/apikey"
GEMINI_API_KEY=$(prompt_with_default "Enter your Gemini API key" "your_gemini_api_key_here")

# Get custom domain (optional)
echo ""
CUSTOM_DOMAIN=$(prompt_with_default "Enter custom domain (optional)" "")

# Choose environment
echo ""
echo "Select environment:"
echo "1) Development"
echo "2) Production"
read -p "Choose environment [1]: " ENV_CHOICE
ENV_CHOICE=${ENV_CHOICE:-1}

if [ "$ENV_CHOICE" = "2" ]; then
    ENVIRONMENT="production"
    API_BASE="https://us-central1-${PROJECT_ID}.cloudfunctions.net/api"
else
    ENVIRONMENT="development"
    API_BASE="http://127.0.0.1:5001/${PROJECT_ID}/us-central1/api"
fi

echo ""
echo "📝 Configuration Summary:"
echo "========================"
echo "Project ID: $PROJECT_ID"
echo "Environment: $ENVIRONMENT"
echo "API Base URL: $API_BASE"
echo "Custom Domain: ${CUSTOM_DOMAIN:-"None"}"
echo ""

read -p "Proceed with this configuration? (y/n): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Configuration cancelled."
    exit 1
fi

# Update .firebaserc
echo "🔧 Updating Firebase configuration..."
cat > .firebaserc << EOF
{
  "projects": {
    "default": "$PROJECT_ID"
  },
  "targets": {
    "$PROJECT_ID": {
      "hosting": {
        "frontend": [
          "$PROJECT_ID"
        ]
      }
    }
  },
  "etags": {}
}
EOF

# Update frontend API configuration
echo "🔧 Updating frontend configuration..."
if [ "$ENVIRONMENT" = "production" ]; then
    # Update App.jsx for production
    sed -i.bak "s|const API_BASE = .*|const API_BASE = '$API_BASE'|" frontend/src/App.jsx
    echo "Frontend configured for production"
else
    # Update App.jsx for development
    sed -i.bak "s|const API_BASE = .*|const API_BASE = '$API_BASE'|" frontend/src/App.jsx
    echo "Frontend configured for development"
fi

# Create environment file for functions
echo "🔧 Creating environment configuration..."
cat > backend/functions/.env << EOF
GEMINI_API_KEY=$GEMINI_API_KEY
FIREBASE_PROJECT_ID=$PROJECT_ID
NODE_ENV=$ENVIRONMENT
EOF

# Set Firebase Functions config (for production)
if [ "$ENVIRONMENT" = "production" ] && [ "$GEMINI_API_KEY" != "your_gemini_api_key_here" ]; then
    echo "🔧 Setting Firebase Functions configuration..."
    firebase functions:config:set gemini.api_key="$GEMINI_API_KEY" 2>/dev/null || echo "Note: Run 'firebase login' first to set function config"
fi

# Create deployment info file
cat > deployment-info.json << EOF
{
  "projectId": "$PROJECT_ID",
  "environment": "$ENVIRONMENT",
  "apiBaseUrl": "$API_BASE",
  "customDomain": "$CUSTOM_DOMAIN",
  "hostingUrl": "https://$PROJECT_ID.web.app",
  "functionsUrl": "https://us-central1-$PROJECT_ID.cloudfunctions.net/api",
  "configuredAt": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
}
EOF

echo ""
echo "✅ Configuration completed successfully!"
echo ""
echo "📋 Next Steps:"
echo "=============="
if [ "$ENVIRONMENT" = "production" ]; then
    echo "1. Run 'firebase login' if not already logged in"
    echo "2. Run './deploy.sh' to deploy to Firebase"
    echo "3. Test the deployed application"
    if [ -n "$CUSTOM_DOMAIN" ]; then
        echo "4. Configure custom domain: $CUSTOM_DOMAIN"
    fi
else
    echo "1. Run 'firebase emulators:start' to start local development"
    echo "2. Open http://localhost:5000 to test locally"
    echo "3. Run './deploy.sh' when ready to deploy"
fi

echo ""
echo "📁 Files created/updated:"
echo "- .firebaserc"
echo "- frontend/src/App.jsx"
echo "- backend/functions/.env"
echo "- deployment-info.json"
echo ""
echo "🔐 Security Note:"
echo "Make sure to add .env files to .gitignore to protect your API keys!"

# Create .gitignore entries if not present
if ! grep -q "backend/functions/.env" .gitignore 2>/dev/null; then
    echo "" >> .gitignore
    echo "# Environment files" >> .gitignore
    echo "backend/functions/.env" >> .gitignore
    echo "deployment-info.json" >> .gitignore
    echo "Added environment files to .gitignore"
fi

echo ""
echo "🎉 Setup completed! Your Resume Optimizer is ready for $ENVIRONMENT."

