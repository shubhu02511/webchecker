const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

async function testModels() {
  console.log('🔍 Testing available Gemini models...\n');
  
  if (!process.env.GEMINI_API_KEY) {
    console.error('❌ GEMINI_API_KEY not found in environment variables');
    return;
  }

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  
  try {
    // Test different model names
    const models = [
      'gemini-pro',
      'gemini-1.5-pro',
      'gemini-1.5-flash',
      'gemini-1.0-pro'
    ];

    for (const modelName of models) {
      console.log(`🧪 Testing model: ${modelName}`);
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent('Hello, can you respond with "Model works"?');
        const response = await result.response;
        console.log(`✅ ${modelName} - SUCCESS: ${response.text()}`);
        console.log('');
      } catch (error) {
        console.log(`❌ ${modelName} - FAILED: ${error.message}`);
        console.log('');
      }
    }
    
  } catch (error) {
    console.error('❌ Error testing models:', error.message);
  }
}

testModels(); 