# Accessibility Analyzer with AI Chat

A web application that analyzes website accessibility and provides an AI-powered chat assistant for accessibility guidance.

## Features

- 🔍 **Website Accessibility Analysis**: Analyze websites for accessibility issues
- 🤖 **AI Chat Assistant**: Get help with accessibility questions and web development
- 📊 **Visual Reports**: View accessibility analysis results in charts
- 🔐 **User Authentication**: Secure login system
- 💬 **Conversation History**: Maintain chat context across sessions

## Chat API Features

The AI chat assistant provides:

- **Web Accessibility Guidance**: WCAG 2.1, Section 508 compliance help
- **Code Examples**: Accessibility improvements and best practices
- **Technical Support**: Web development, HTML, CSS, JavaScript help
- **SEO & Performance**: Optimization suggestions
- **UX Design**: User experience principles

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Configuration

Create a `.env` file in the root directory:

```env
# Google Gemini API Configuration
GEMINI_API_KEY=your_gemini_api_key_here

# Server Configuration
PORT=3000
SESSION_SECRET=your_session_secret_here
```

### 3. Get Google Gemini API Key

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the API key and paste it in your `.env` file

**Benefits of Gemini API:**
- ✅ **No usage limits** - Free tier with generous quotas
- ✅ **Better performance** - Faster response times
- ✅ **Advanced features** - Multi-modal capabilities
- ✅ **Cost-effective** - More affordable than alternatives

### 4. Start the Application

```bash
npm start
```

The application will be available at `http://localhost:3000`

## API Endpoints

### Chat API

- **POST** `/api/chat` - Send a message to the AI assistant
  ```json
  {
    "message": "How can I make my website more accessible?",
    "sessionId": "optional_session_id"
  }
  ```

- **POST** `/api/chat/clear` - Clear conversation history
  ```json
  {
    "sessionId": "optional_session_id"
  }
  ```

- **GET** `/api/chat/history/:sessionId` - Get conversation history

### Authentication

- **GET** `/login` - Login page
- **POST** `/login` - Authenticate user
- **GET** `/logout` - Logout user
- **GET** `/signup` - Registration page

### Pages

- **GET** `/` - Main accessibility analyzer
- **GET** `/chat` - AI chat interface
- **GET** `/chart` - Analysis results visualization

## Usage

### 1. Login

Use the default credentials:
- Username: `admin`
- Password: `password123`

Or register a new account at `/signup`

### 2. Website Analysis

1. Go to the main page (`/`)
2. Enter a website URL
3. Click "Analyze" to check for accessibility issues

### 3. AI Chat Assistant

1. Navigate to `/chat`
2. Ask questions about:
   - Web accessibility guidelines
   - Code improvements
   - Technical issues
   - Best practices

## Example Chat Prompts

- "How can I make images accessible for screen readers?"
- "What are the most important WCAG 2.1 guidelines?"
- "How do I test my website for accessibility?"
- "What's the best way to handle keyboard navigation?"
- "Can you help me fix this HTML code for accessibility?"

## Technical Details

### Dependencies

- **Express.js** - Web framework
- **Puppeteer** - Web scraping and analysis
- **Google Generative AI** - AI chat functionality (Gemini)
- **EJS** - Template engine
- **Axe-core** - Accessibility testing

### File Structure

```
accessibility-analyzer/
├── app.js                 # Main application file
├── utils/
│   ├── analyzeAccessibility.js  # Accessibility analysis
│   └── chatUtils.js            # Chat service utilities
├── public/
│   ├── style.css              # Styles
│   └── chat.html              # Chat interface
├── views/                     # EJS templates
└── package.json
```

## Security Notes

- Store API keys securely in environment variables
- Use HTTPS in production
- Implement proper session management
- Consider rate limiting for API endpoints
- Use a database for conversation history in production

## Troubleshooting

### Common Issues

1. **Gemini API Key Error**
   - Ensure your API key is correctly set in `.env`
   - Check if you have sufficient API credits (Gemini has generous free tier)

2. **Port Already in Use**
   - Change the PORT in `.env` file
   - Or kill the process using the current port

3. **Puppeteer Issues**
   - Ensure Chrome is installed
   - On Windows, update the Chrome path in `app.js`

### Error Messages

- `API quota exceeded` - Check your Gemini account usage
- `Rate limit exceeded` - Wait a moment and try again
- `Invalid API key` - Check your Gemini API key configuration
- `Content blocked by safety filters` - Rephrase your question

## Why Google Gemini?

- 🚀 **No Usage Limits**: Generous free tier with no strict limits
- ⚡ **Fast Performance**: Optimized for quick responses
- 💰 **Cost Effective**: More affordable than OpenAI
- 🔒 **Privacy Focused**: Google's privacy standards
- 🛠️ **Advanced Features**: Multi-modal capabilities for future enhancements

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the ISC License.

## Support

For issues and questions:
1. Check the troubleshooting section
2. Review the API documentation
3. Create an issue on GitHub 