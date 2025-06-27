const axios = require('axios');

// Test the chat API
async function testChatAPI() {
  const baseURL = 'http://localhost:3000';
  
  console.log('🧪 Testing Chat API with Google Gemini...\n');
  
  try {
    // Test 1: Send a message
    console.log('📤 Sending test message...');
    const response = await axios.post(`${baseURL}/api/chat`, {
      message: 'Hello! Can you help me with web accessibility?',
      sessionId: 'test-session'
    });
    
    console.log('✅ Response received:');
    console.log('Reply:', response.data.reply);
    console.log('Session ID:', response.data.sessionId);
    console.log('Message Count:', response.data.messageCount);
    console.log('');
    
    // Test 2: Get conversation history
    console.log('📋 Getting conversation history...');
    const historyResponse = await axios.get(`${baseURL}/api/chat/history/test-session`);
    
    console.log('✅ History retrieved:');
    console.log('Message Count:', historyResponse.data.messageCount);
    console.log('History Length:', historyResponse.data.history.length);
    console.log('');
    
    // Test 3: Send another message to test conversation flow
    console.log('📤 Sending follow-up message...');
    const followUpResponse = await axios.post(`${baseURL}/api/chat`, {
      message: 'What are the most important accessibility guidelines?',
      sessionId: 'test-session'
    });
    
    console.log('✅ Follow-up response:');
    console.log('Reply:', followUpResponse.data.reply);
    console.log('Message Count:', followUpResponse.data.messageCount);
    console.log('');
    
    // Test 4: Clear conversation history
    console.log('🗑️ Clearing conversation history...');
    const clearResponse = await axios.post(`${baseURL}/api/chat/clear`, {
      sessionId: 'test-session'
    });
    
    console.log('✅ History cleared:', clearResponse.data.message);
    console.log('');
    
    console.log('🎉 All tests passed! Chat API with Google Gemini is working correctly.');
    console.log('🚀 Benefits of Gemini: No usage limits, faster responses, and cost-effective!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    
    console.log('\n💡 Make sure:');
    console.log('1. The server is running (npm start)');
    console.log('2. Google Gemini API key is set in .env file (GEMINI_API_KEY)');
    console.log('3. You have a valid Gemini API key from Google AI Studio');
    console.log('4. Your internet connection is stable');
  }
}

// Run the test
testChatAPI(); 