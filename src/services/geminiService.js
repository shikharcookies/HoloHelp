// src/services/geminiService.js - Complete Gemini AI Integration with Beautiful Formatting
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini AI
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  console.warn('⚠️ VITE_GEMINI_API_KEY not found. Please add it to your .env file');
}

const genAI = GEMINI_API_KEY ? new GoogleGenerativeAI(GEMINI_API_KEY) : null;

// Enhanced system prompt for beautiful, well-formatted responses
const SYSTEM_PROMPT = `You are HoloHelp Assistant, an expert in assembly instructions and device troubleshooting. You provide step-by-step guidance for building, assembling, and fixing various items.

**FORMATTING RULES:**
- Use **bold text** for titles, headings, and important terms
- Format steps as: **Step 1: Title** followed by description
- Include time estimates in parentheses: (5 minutes)
- Use bullet points with • for lists
- Use numbered lists (1., 2., 3.) for sequential steps
- Separate sections with double line breaks

**Your Capabilities:**
1. Generate step-by-step assembly instructions for ANY item (furniture, electronics, appliances, toys, etc.)
2. Provide device troubleshooting help
3. Answer questions with helpful, practical advice
4. Maintain a friendly, encouraging tone

**Response Guidelines:**
- Always provide detailed, actionable steps
- Include estimated time for each step when relevant
- Suggest tools needed in a **Tools Needed** section
- Add helpful tips and warnings in a **Safety Tips** section
- For assembly requests, generate 4-8 logical steps
- For "thank you" messages, respond warmly and offer additional help
- Be encouraging and supportive

**Assembly Response Format:**
**[Item Name] Assembly Instructions**

**Tools Needed:**
• Tool 1
• Tool 2
• Tool 3

**Step 1: [Title]** (estimated time)
Description of what to do in this step.

**Step 2: [Title]** (estimated time)
Description of what to do in this step.

**Safety Tips:**
• Important safety consideration
• Another safety tip

**Troubleshooting Response Format:**
**Troubleshooting: [Device Problem]**

**Quick Safety Check:**
• Safety item 1
• Safety item 2

**Step 1: [Solution Title]** (estimated time)
Detailed solution description.

**Step 2: [Solution Title]** (estimated time)
Detailed solution description.

Remember: You can help with ANY assembly or device, not just predefined ones. Be creative, helpful, and always format responses beautifully!`;

class GeminiService {
  constructor() {
    this.model = genAI ? genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" }) : null;
    this.conversationHistory = [];
    
    // Debug: Test connection on startup
    if (this.model) {
      this.testGeminiConnection();
    } else {
      console.warn('⚠️ Gemini not available - add VITE_GEMINI_API_KEY to .env');
    }
  }

  // Debug function to test Gemini connection
  async testGeminiConnection() {
    console.log('🔍 Testing Gemini connection...');
    console.log('API Key available:', !!import.meta.env.VITE_GEMINI_API_KEY);
    console.log('Model initialized:', !!this.model);
    
    if (!this.model) {
      console.error('❌ Gemini model not initialized - check API key');
      return false;
    }
    
    try {
      const result = await this.model.generateContent('Say hello briefly');
      console.log('✅ Gemini test successful:', result.response.text());
      return true;
    } catch (error) {
      console.error('❌ Gemini test failed:', error);
      return false;
    }
  }

  // Check if Gemini is available
  isAvailable() {
    return !!this.model;
  }

  // Retry logic for API calls
  async makeRequestWithRetry(prompt, maxRetries = 3) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const result = await this.model.generateContent(prompt);
        return result.response.text();
      } catch (error) {
        console.warn(`Gemini attempt ${attempt}/${maxRetries} failed:`, error.message);
        
        if (attempt < maxRetries && (error.message.includes('503') || error.message.includes('overloaded'))) {
          const waitTime = attempt * 1000; // 1s, 2s, 3s
          console.log(`Waiting ${waitTime}ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
        } else {
          throw error;
        }
      }
    }
  }

  // Generate assembly instructions for any item
  async generateAssemblyInstructions(itemName, userContext = '') {
    if (!this.model) {
      throw new Error('Gemini API not available. Please add VITE_GEMINI_API_KEY to your environment.');
    }

    const prompt = `Generate beautiful, well-formatted step-by-step assembly instructions for: ${itemName}

Context: ${userContext}

Please provide a comprehensive guide using the exact formatting specified in the system prompt:
1. **Tools Needed** section with bullet points
2. **Step-by-step instructions** with time estimates
3. **Safety Tips** section
4. Use proper **bold formatting** for titles and important terms
5. Include realistic time estimates for each step
6. Make it practical and easy to follow

Format the response exactly as specified in the system prompt for assembly instructions.`;

    try {
      const response = await this.makeRequestWithRetry(prompt);
      
      return {
        type: 'assembly_instructions',
        text: response,
        itemName,
        timestamp: Date.now()
      };
    } catch (error) {
      console.error('Gemini assembly generation error:', error);
      throw error;
    }
  }

  // Generate troubleshooting steps for any device
  async generateTroubleshootingSteps(deviceName, problem, userContext = '') {
    if (!this.model) {
      throw new Error('Gemini API not available. Please add VITE_GEMINI_API_KEY to your environment.');
    }

    const prompt = `Generate beautiful, well-formatted troubleshooting steps for: ${deviceName}
Problem: ${problem}
Context: ${userContext}

Please provide a comprehensive troubleshooting guide using the exact formatting specified in the system prompt:
1. **Quick Safety Check** section with bullet points
2. **Step-by-step solutions** with time estimates
3. **When to seek professional help** if needed
4. Use proper **bold formatting** for titles and important terms
5. Include realistic time estimates for each step
6. Make solutions safe and practical for users to follow

Format the response exactly as specified in the system prompt for troubleshooting.`;

    try {
      const response = await this.makeRequestWithRetry(prompt);
      
      return {
        type: 'troubleshooting',
        text: response,
        deviceName,
        problem,
        timestamp: Date.now()
      };
    } catch (error) {
      console.error('Gemini troubleshooting generation error:', error);
      throw error;
    }
  }

  // General chat with context awareness and beautiful formatting
  async chat(message, context = {}) {
    if (!this.model) {
      throw new Error('Gemini API not available. Please add VITE_GEMINI_API_KEY to your environment.');
    }

    // Build context string
    const contextString = Object.entries(context)
      .filter(([key, value]) => value)
      .map(([key, value]) => `${key}: ${value}`)
      .join('\n');

    const fullPrompt = `${SYSTEM_PROMPT}

Current Context:
${contextString}

Conversation History:
${this.conversationHistory.slice(-6).map(msg => `${msg.role}: ${msg.content}`).join('\n')}

User: ${message}

Please respond as HoloHelp Assistant with beautiful formatting. Use **bold text** for important terms, proper sections, and make the response visually appealing and easy to read.`;

    try {
      const response = await this.makeRequestWithRetry(fullPrompt);
      
      // Add to conversation history
      this.conversationHistory.push(
        { role: 'user', content: message },
        { role: 'assistant', content: response }
      );

      // Keep only last 10 messages
      if (this.conversationHistory.length > 10) {
        this.conversationHistory = this.conversationHistory.slice(-10);
      }
      
      return {
        type: 'chat',
        text: response,
        timestamp: Date.now()
      };
    } catch (error) {
      console.error('Gemini chat error:', error);
      throw error;
    }
  }

  // Smart message processing - determines intent and routes accordingly
  async processMessage(message, context = {}) {
    if (!this.model) {
      return this.getFallbackResponse(message);
    }

    const lowerMessage = message.toLowerCase();

    try {
      // Check for assembly requests
      if (this.isAssemblyRequest(lowerMessage)) {
        const itemName = this.extractItemName(message);
        if (itemName) {
          return await this.generateAssemblyInstructions(itemName, JSON.stringify(context));
        }
      }

      // Check for troubleshooting requests
      if (this.isTroubleshootingRequest(lowerMessage)) {
        const deviceInfo = this.extractDeviceAndProblem(message);
        if (deviceInfo.device) {
          return await this.generateTroubleshootingSteps(
            deviceInfo.device, 
            deviceInfo.problem, 
            JSON.stringify(context)
          );
        }
      }

      // General chat
      return await this.chat(message, context);

    } catch (error) {
      console.error('Gemini processing error:', error);
      return this.getFallbackResponse(message);
    }
  }

  // Helper methods
  isAssemblyRequest(message) {
    const assemblyKeywords = [
      'build', 'assemble', 'assembly', 'put together', 'construct', 
      'install', 'setup', 'how to make', 'build a', 'assemble a'
    ];
    return assemblyKeywords.some(keyword => message.includes(keyword));
  }

  isTroubleshootingRequest(message) {
    const troubleKeywords = [
      'fix', 'repair', 'broken', 'not working', 'problem', 'issue', 
      'troubleshoot', 'help with', 'wrong with'
    ];
    return troubleKeywords.some(keyword => message.includes(keyword));
  }

  extractItemName(message) {
    // Remove common assembly words to get the item name
    const cleaned = message
      .toLowerCase()
      .replace(/how to |build |assemble |put together |construct |install |setup |a |an |the |my /g, '')
      .replace(/\?|!|\./g, '')
      .trim();
    
    return cleaned || null;
  }

  extractDeviceAndProblem(message) {
    // Simple extraction - can be enhanced with NLP
    const lowerMessage = message.toLowerCase();
    
    // Common devices
    const devices = [
      'tv', 'television', 'samsung tv', 'lg tv', 'sony tv',
      'router', 'wifi router', 'modem',
      'microwave', 'oven',
      'phone', 'smartphone', 'iphone', 'android',
      'computer', 'pc', 'laptop',
      'printer', 'washing machine', 'dishwasher',
      'air conditioner', 'ac', 'heater'
    ];

    let device = null;
    for (const d of devices) {
      if (lowerMessage.includes(d)) {
        device = d;
        break;
      }
    }

    return {
      device,
      problem: device ? message : 'general issue'
    };
  }

  getFallbackResponse(message) {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('thank')) {
      return {
        type: 'chat',
        text: "You're very welcome! 😊\n\nI'm here whenever you need help with assembly instructions, troubleshooting, or any other questions.\n\n**What I can help with:**\n• **Assembly instructions** for ANY item\n• **Device troubleshooting** for electronics\n• **Repair guidance** and maintenance tips\n• **Tool recommendations** and safety advice\n\nFeel free to ask about anything - I can help with ANY item or device!",
        timestamp: Date.now()
      };
    }

    if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
      return {
        type: 'chat',
        text: "Hello! 👋 I'm HoloHelp Assistant!\n\n**I can help you with:**\n• Assembly instructions for any item\n• Troubleshooting devices and electronics\n• Repair and maintenance guidance\n• Tool and safety recommendations\n\n**Try asking:**\n• \"How to build a Samsung TV stand?\"\n• \"Fix my WiFi router\"\n• \"Assemble IKEA desk\"\n\nWhat would you like help with today?",
        timestamp: Date.now()
      };
    }

    return {
      type: 'chat',
      text: "I'd love to help! 🔧\n\n**What I can do:**\n• Provide step-by-step assembly instructions for furniture, electronics, appliances, and more\n• Help troubleshoot device issues with detailed solutions\n• Offer repair guidance and maintenance tips\n• Recommend tools and provide safety advice\n\n**Just ask me something like:**\n• \"How to build a Samsung TV stand?\"\n• \"Fix my WiFi router\"\n• \"Troubleshoot my microwave\"\n\nWhat would you like help with?",
      timestamp: Date.now()
    };
  }

  // Clear conversation history
  clearHistory() {
    this.conversationHistory = [];
  }
}

// Export singleton instance
export const geminiService = new GeminiService();

// Export the class for direct instantiation if needed
export default GeminiService;