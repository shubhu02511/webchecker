# Google Gemini API Setup Guide

## Step-by-Step Instructions

### 1. Get Your Gemini API Key

1. **Visit Google AI Studio**
   - Go to: https://makersuite.google.com/app/apikey
   - Sign in with your Google account

2. **Create API Key**
   - Click "Create API Key" button
   - Choose "Create API Key in new project" or select existing project
   - Copy the generated API key (it starts with "AIza...")

3. **Set Up Environment**
   - Create a `.env` file in your project root
   - Add your API key:
   ```env
   GEMINI_API_KEY=AIzaSyYourActualAPIKeyHere
   ```

### 2. Benefits of Gemini API

✅ **No Usage Limits**: Generous free tier with 15 requests per minute
✅ **Cost Effective**: Much cheaper than OpenAI
✅ **Fast Performance**: Optimized for quick responses
✅ **Advanced Features**: Multi-modal capabilities
✅ **Privacy Focused**: Google's enterprise-grade security

### 3. API Usage Limits

- **Free Tier**: 15 requests per minute
- **Paid Tier**: Higher limits available
- **No Daily Limits**: Unlike OpenAI's strict daily caps

### 4. Test Your Setup

Run the test script to verify everything works:

```bash
node test-chat.js
```

### 5. Troubleshooting

**Common Issues:**

1. **"Invalid API Key"**
   - Make sure you copied the full API key
   - Check that it starts with "AIza"

2. **"Rate Limit Exceeded"**
   - Wait a minute and try again
   - Free tier allows 15 requests per minute

3. **"API Key Not Configured"**
   - Ensure `.env` file exists in project root
   - Check that `GEMINI_API_KEY` is set correctly

### 6. Alternative Setup Methods

**Using Google Cloud Console:**
1. Go to https://console.cloud.google.com/
2. Enable the Generative Language API
3. Create credentials (API key)
4. Use the generated key

**Using Google AI Studio (Recommended):**
- Easier setup process
- Better documentation
- Direct access to latest features

### 7. Security Best Practices

- Never commit your API key to version control
- Use environment variables
- Rotate keys regularly
- Monitor usage in Google Cloud Console

### 8. Next Steps

Once your API key is configured:

1. Start the server: `npm start`
2. Login with: `admin` / `password123`
3. Navigate to `/chat` for the AI assistant
4. Start asking accessibility questions!

## Support

If you encounter issues:
1. Check the troubleshooting section above
2. Visit [Google AI Studio Documentation](https://ai.google.dev/docs)
3. Review the main README.md file 