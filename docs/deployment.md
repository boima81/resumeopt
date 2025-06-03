# Firebase Deployment Guide

## Prerequisites

1. **Firebase CLI**: Install globally
   ```bash
   npm install -g firebase-tools
   ```

2. **Firebase Project**: Create a new project at [Firebase Console](https://console.firebase.google.com/)

3. **Google Cloud Project**: Enable required APIs
   - Cloud Functions API
   - Cloud Firestore API
   - Cloud Storage API
   - Firebase Hosting API

## Deployment Steps

### 1. Firebase Authentication

```bash
firebase login
```

### 2. Initialize Firebase Project

```bash
firebase use --add
# Select your Firebase project ID
# Choose an alias (e.g., "production")
```

### 3. Configure Environment Variables

Set the Gemini API key for Firebase Functions:

```bash
firebase functions:config:set gemini.api_key="YOUR_GEMINI_API_KEY"
```

### 4. Update Configuration Files

Update `.firebaserc` with your project ID:

```json
{
  "projects": {
    "default": "your-project-id",
    "production": "your-project-id"
  },
  "targets": {
    "your-project-id": {
      "hosting": {
        "frontend": [
          "your-project-id"
        ]
      }
    }
  }
}
```

Update `firebase.json` hosting target:

```json
{
  "hosting": [
    {
      "target": "frontend",
      "public": "frontend/dist",
      "ignore": [
        "firebase.json",
        "**/.*",
        "**/node_modules/**"
      ],
      "rewrites": [
        {
          "source": "**",
          "destination": "/index.html"
        }
      ]
    }
  ]
}
```

### 5. Build Frontend

```bash
cd frontend
npm run build
cd ..
```

### 6. Deploy Functions

```bash
firebase deploy --only functions
```

### 7. Deploy Hosting

```bash
firebase deploy --only hosting
```

### 8. Deploy Storage Rules

```bash
firebase deploy --only storage
```

### 9. Deploy Firestore Rules

```bash
firebase deploy --only firestore
```

### 10. Full Deployment

```bash
firebase deploy
```

## Production Configuration

### Environment Variables

Create `backend/functions/.env` for local development:

```env
GEMINI_API_KEY=your_gemini_api_key_here
FIREBASE_PROJECT_ID=your-project-id
```

### Frontend API Configuration

Update `frontend/src/App.jsx` API base URL for production:

```javascript
const API_BASE = `https://us-central1-your-project-id.cloudfunctions.net/api`
```

### Security Rules

#### Firestore Rules (`backend/firestore.rules`)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /sessions/{sessionId} {
      allow read, write: if true; // Update for authentication
    }
  }
}
```

#### Storage Rules (`backend/storage/storage.rules`)

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /resumes/{allPaths=**} {
      allow read, write: if true; // Update for authentication
    }
  }
}
```

## Monitoring and Analytics

### 1. Enable Firebase Analytics

```bash
firebase analytics:enable
```

### 2. Set up Error Reporting

Add to `backend/functions/index.js`:

```javascript
const { ErrorReporting } = require('@google-cloud/error-reporting');
const errors = new ErrorReporting();
```

### 3. Performance Monitoring

Add to `frontend/src/main.jsx`:

```javascript
import { getPerformance } from 'firebase/performance';
const perf = getPerformance(app);
```

## Custom Domain (Optional)

### 1. Add Custom Domain

```bash
firebase hosting:sites:create your-domain-name
firebase target:apply hosting frontend your-domain-name
```

### 2. Configure DNS

Add the provided DNS records to your domain provider.

### 3. Deploy to Custom Domain

```bash
firebase deploy --only hosting:frontend
```

## Troubleshooting

### Common Issues

1. **Functions Timeout**: Increase timeout in `firebase.json`
2. **CORS Issues**: Ensure proper CORS configuration
3. **API Key Issues**: Verify Gemini API key configuration
4. **Build Errors**: Check Node.js version compatibility

### Logs

```bash
# View function logs
firebase functions:log

# View hosting logs
firebase hosting:logs

# View all logs
firebase logs
```

## Backup and Recovery

### 1. Firestore Backup

```bash
gcloud firestore export gs://your-backup-bucket
```

### 2. Storage Backup

```bash
gsutil -m cp -r gs://your-project-id.appspot.com gs://your-backup-bucket
```

## Cost Optimization

1. **Functions**: Use appropriate memory allocation
2. **Storage**: Set up lifecycle policies
3. **Firestore**: Optimize queries and indexes
4. **Hosting**: Enable compression and caching

## Security Checklist

- [ ] Update security rules for production
- [ ] Enable authentication if required
- [ ] Set up API key restrictions
- [ ] Configure CORS properly
- [ ] Enable audit logging
- [ ] Set up monitoring alerts

