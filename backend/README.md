# Environment Configuration for Resume Optimizer

## Firebase Functions Environment Variables

To set up the Gemini AI API key for Firebase Functions, run:

```bash
firebase functions:config:set gemini.api_key="YOUR_GEMINI_API_KEY_HERE"
```

## Local Development

For local development, create a `.env` file in the functions directory:

```
GEMINI_API_KEY=your_gemini_api_key_here
```

## Getting a Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Create a new API key
4. Copy the API key and set it in your environment

## Security Notes

- Never commit API keys to version control
- Use Firebase Functions config for production
- Use environment variables for local development
- Rotate API keys regularly for security

