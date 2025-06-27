const { GoogleGenerativeAI } = require('@google/generative-ai');

class ChatService {
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    // In-memory conversation history (in production, use a database)
    this.conversationHistory = new Map();
  }

  /**
   * Process a chat message and return AI response
   * @param {string} message - User message
   * @param {string} sessionId - Session identifier
   * @returns {Promise<Object>} Response object
   */
  async processMessage(message, sessionId = 'default') {
    if (!message || message.trim().length === 0) {
      throw new Error('Message is required');
    }

    if (!process.env.GEMINI_API_KEY) {
      throw new Error('Gemini API key not configured');
    }

    try {
      // Get conversation history for this session
      let history = this.conversationHistory.get(sessionId) || [];
      
      // Add user message to history
      history.push({ role: 'user', content: message.trim() });
      
      console.log(`🤖 Processing chat request for session: ${sessionId}`);
      
      // Build context from conversation history
      const context = this.buildContext(history.slice(-10));
      const fullPrompt = `${this.getSystemPrompt()}\n\n${context}\n\nUser: ${message.trim()}\n\nAssistant:`;
      
      // Generate response using simple generateContent
      const result = await this.model.generateContent(fullPrompt);
      const response = await result.response;
      const reply = response.text();
      
      // Add assistant response to history
      history.push({ role: 'assistant', content: reply });
      
      // Update conversation history (keep last 20 messages)
      this.conversationHistory.set(sessionId, history.slice(-20));
      
      console.log(`✅ Chat response generated successfully`);
      
      return {
        reply,
        sessionId,
        messageCount: history.length,
        success: true
      };
      
    } catch (error) {
      console.error('❌ Gemini API error:', error.message);
      throw this.handleGeminiError(error);
    }
  }

  /**
   * Build context from conversation history
   * @param {Array} history - Conversation history
   * @returns {string} Formatted context
   */
  buildContext(history) {
    if (history.length === 0) return '';
    
    return history.map(msg => 
      `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`
    ).join('\n');
  }

  /**
   * Get system prompt for the AI assistant
   * @returns {string} System prompt
   */
  getSystemPrompt() {
    return `You are an expert AI assistant specializing in web accessibility and website analysis. You help users with:

1. Web accessibility guidelines and best practices (WCAG 2.1, Section 508, etc.)
2. Website analysis and improvement suggestions
3. Technical questions about web development (HTML, CSS, JavaScript, React, etc.)
4. General programming and technology questions
5. SEO and performance optimization
6. User experience (UX) design principles

Key capabilities:
- Explain accessibility concepts in simple terms
- Provide code examples for accessibility improvements
- Suggest tools and resources for accessibility testing
- Help with responsive design and mobile accessibility
- Guide users through accessibility audits

Always provide helpful, accurate, and actionable advice. If you're not sure about something, say so rather than guessing. Keep responses concise but informative. Use markdown formatting when appropriate for better readability.`;
  }

  /**
   * Handle Gemini API errors
   * @param {Error} error - Gemini error
   * @returns {Error} Formatted error
   */
  handleGeminiError(error) {
    let errorMessage = 'Sorry, there was an error contacting the AI service.';
    
    if (error.message.includes('quota')) {
      errorMessage = 'API quota exceeded. Please check your Gemini account.';
    } else if (error.message.includes('invalid')) {
      errorMessage = 'Invalid API key. Please check your Gemini API key configuration.';
    } else if (error.message.includes('rate')) {
      errorMessage = 'Rate limit exceeded. Please try again in a moment.';
    } else if (error.message.includes('safety')) {
      errorMessage = 'Content blocked by safety filters. Please rephrase your question.';
    } else if (error.message.includes('timeout')) {
      errorMessage = 'Request timed out. Please try again.';
    }
    
    return new Error(errorMessage);
  }

  /**
   * Clear conversation history for a session
   * @param {string} sessionId - Session identifier
   */
  clearHistory(sessionId = 'default') {
    this.conversationHistory.delete(sessionId);
    return { message: 'Conversation history cleared successfully' };
  }

  /**
   * Get conversation history for a session
   * @param {string} sessionId - Session identifier
   * @returns {Array} Conversation history
   */
  getHistory(sessionId = 'default') {
    const history = this.conversationHistory.get(sessionId) || [];
    return {
      history,
      messageCount: history.length
    };
  }

  /**
   * Get all active sessions
   * @returns {Array} List of session IDs
   */
  getActiveSessions() {
    return Array.from(this.conversationHistory.keys());
  }

  /**
   * Clean up old conversations (older than 24 hours)
   * This is a simple implementation - in production, use a proper database
   */
  cleanupOldConversations() {
    // For now, we'll just clear all conversations
    // In a real app, you'd check timestamps
    this.conversationHistory.clear();
    console.log('🧹 Cleaned up old conversations');
  }

  /**
   * Generate content with Gemini (alternative method)
   * @param {string} prompt - The prompt to generate content for
   * @returns {Promise<string>} Generated content
   */
  async generateContent(prompt) {
    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('❌ Content generation error:', error.message);
      throw this.handleGeminiError(error);
    }
  }
}

module.exports = ChatService; 