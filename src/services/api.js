// src/services/api.js - Enhanced API Service Layer for HoloHelp with Gemini Integration

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

console.log('API Base URL:', API_BASE_URL); // Debug log

class APIError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = 'APIError';
    this.status = status;
    this.data = data;
  }
}

// Generic API request handler with better error handling
async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  console.log('Making API request to:', url); // Debug log
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    console.log('API response status:', response.status); // Debug log
    
    const data = await response.json();
    console.log('API response data:', data); // Debug log

    if (!response.ok) {
      throw new APIError(
        data.error || `HTTP ${response.status}`,
        response.status,
        data
      );
    }

    return data;
  } catch (error) {
    console.error('API request error:', error); // Debug log
    
    if (error instanceof APIError) {
      throw error;
    }
    
    // Network or other errors
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new APIError(
        'Cannot connect to backend server. Using local/AI capabilities instead.',
        0,
        { originalError: error.message }
      );
    }
    
    throw new APIError(
      'Network error. Please check your connection and try again.',
      0,
      { originalError: error.message }
    );
  }
}

// Device Recognition API
export const deviceAPI = {
  // Recognize device from detected objects
  async recognizeDevice(detectedObjects) {
    console.log('Recognizing device with objects:', detectedObjects);
    return apiRequest('/recognize-device', {
      method: 'POST',
      body: JSON.stringify({
        detectedObjects: JSON.stringify(detectedObjects)
      })
    });
  },

  // Get instruction set by ID
  async getInstructions(instructionSetId) {
    console.log('Getting instructions for:', instructionSetId);
    return apiRequest(`/instructions/${instructionSetId}`);
  },

  // Get all supported devices
  async getSupportedDevices() {
    return apiRequest('/devices');
  },

  // Get phone problem instructions (enhanced)
  async getPhoneProblemInstructions(problemId) {
    console.log('Getting phone problem instructions for:', problemId);
    return apiRequest('/phone-problem', {
      method: 'POST',
      body: JSON.stringify({ problem: problemId })
    });
  }
};

// Enhanced Chat API with Gemini fallback support
export const chatAPI = {
  // Send message to chat AI (backend or Gemini)
  async sendMessage(message, context = null, deviceType = null) {
    console.log('Sending chat message:', { message, context, deviceType });
    
    try {
      const response = await apiRequest('/chat', {
        method: 'POST',
        body: JSON.stringify({
          message,
          context,
          deviceType,
          timestamp: new Date().toISOString()
        })
      });
      
      return response;
    } catch (error) {
      // If backend fails, we'll let the calling code handle Gemini fallback
      console.log('Backend chat failed, falling back to Gemini/local');
      throw error;
    }
  },

  // Enhanced chat with assembly context
  async sendAssemblyQuery(itemName, userContext = '') {
    console.log('Sending assembly query:', itemName);
    return this.sendMessage(
      `How to assemble: ${itemName}`,
      JSON.stringify({ type: 'assembly', item: itemName, context: userContext }),
      'assembly_request'
    );
  },

  // Enhanced troubleshooting query
  async sendTroubleshootingQuery(deviceName, problem, userContext = '') {
    console.log('Sending troubleshooting query:', deviceName, problem);
    return this.sendMessage(
      `Fix ${deviceName}: ${problem}`,
      JSON.stringify({ type: 'troubleshooting', device: deviceName, problem, context: userContext }),
      'troubleshooting_request'
    );
  }
};

// Health Check API
export const healthAPI = {
  async checkStatus() {
    // Use direct health endpoint instead of API prefix
    const url = `http://localhost:3001/health`;
    console.log('Checking health at:', url);
    
    try {
      const response = await fetch(url, { timeout: 5000 });
      const data = await response.json();
      console.log('Health check response:', data);
      
      if (!response.ok) {
        throw new Error(`Health check failed: ${response.status}`);
      }
      
      return data;
    } catch (error) {
      console.error('Health check error:', error);
      throw error;
    }
  }
};

// Enhanced utility functions
export const utils = {
  // Check if backend is reachable
  async isBackendOnline() {
    try {
      console.log('Checking if backend is online...');
      await healthAPI.checkStatus();
      console.log('Backend is online!');
      return true;
    } catch (error) {
      console.log('Backend is offline:', error.message);
      return false;
    }
  },

  // Check if Gemini AI is available
  isGeminiAvailable() {
    try {
      // This will be imported dynamically if available
      const geminiKey = import.meta.env.VITE_GEMINI_API_KEY;
      return !!geminiKey;
    } catch (error) {
      return false;
    }
  },

  // Format device detection results
  formatDetectionResult(result) {
    return {
      deviceModel: result.device_model,
      deviceType: result.device_type,
      instructionSetId: result.instruction_set_id,
      confidence: result.confidence,
      detectedObjects: result.detected_objects
    };
  },

  // Format instruction steps for AR
  formatInstructionsForAR(instructions) {
    return {
      totalSteps: instructions.total_steps,
      estimatedTime: instructions.estimated_time,
      steps: instructions.steps.map((step, index) => ({
        id: step.step,
        title: step.title,
        description: step.description,
        position: step.position || [0, 0, -1],
        asset: step.asset,
        voiceover: step.voiceover,
        highlight: step.highlight,
        duration: step.duration || 3000,
        isCompleted: false,
        isActive: index === 0
      }))
    };
  },

  // Enhanced assembly instruction parser for Gemini responses
  parseAssemblyInstructions(geminiResponse) {
    const lines = geminiResponse.split('\n');
    const steps = [];
    let currentStep = null;
    let stepCounter = 1;

    for (const line of lines) {
      const trimmed = line.trim();
      
      // Look for step patterns
      if (trimmed.match(/^(step|#)\s*\d+/i) || trimmed.match(/^\d+\./)) {
        if (currentStep) {
          steps.push(currentStep);
        }
        
        currentStep = {
          step: stepCounter++,
          title: trimmed.replace(/^(step|#)\s*\d+[:.]/i, '').replace(/^\d+\./, '').trim(),
          description: '',
          duration: 5000 // Default 5 seconds
        };
      } else if (currentStep && trimmed && !trimmed.startsWith('**') && !trimmed.startsWith('#')) {
        // Add to description
        currentStep.description += (currentStep.description ? ' ' : '') + trimmed;
      }
    }
    
    if (currentStep) {
      steps.push(currentStep);
    }

    return {
      totalSteps: steps.length,
      estimatedTime: steps.reduce((sum, step) => sum + step.duration, 0),
      steps
    };
  },

  // Service availability status
  getServiceStatus() {
    return {
      gemini: this.isGeminiAvailable(),
      backend: false, // Will be set by health check
      local: true
    };
  }
};

// Enhanced error handling utilities
export const errorHandler = {
  // Handle API errors gracefully with Gemini context
  handleError(error) {
    console.error('Handling API Error:', error);
    
    if (error instanceof APIError) {
      switch (error.status) {
        case 404:
          return 'The requested information was not found. Let me try to help with general guidance.';
        case 400:
          return 'Invalid request. Please rephrase your question and try again.';
        case 500:
          return 'Server error. Trying alternative AI assistance...';
        case 0:
          return 'Backend unavailable. Using AI-powered assistance instead.';
        default:
          return error.message || 'An unexpected error occurred. Trying alternative assistance...';
      }
    }
    
    // Gemini-specific errors
    if (error.message?.includes('API_KEY')) {
      return 'AI service configuration needed. Add your Gemini API key for enhanced features.';
    }
    
    if (error.message?.includes('quota') || error.message?.includes('limit')) {
      return 'AI service temporarily unavailable due to usage limits. Please try again later.';
    }
    
    return 'Service temporarily unavailable. Trying backup assistance...';
  },

  // Show user-friendly error messages
  getErrorMessage(error) {
    if (typeof error === 'string') return error;
    return this.handleError(error);
  },

  // Get appropriate fallback message based on error type
  getFallbackMessage(error, hasGemini = false, hasBackend = false) {
    if (hasGemini) {
      return 'Using AI assistance for your request...';
    } else if (hasBackend) {
      return 'Using backend services for basic assistance...';
    } else {
      return 'Using local guidance. Add Gemini API key for enhanced AI assistance!';
    }
  }
};

// Enhanced assembly service
export const assemblyAPI = {
  // Request assembly instructions for any item
  async getAssemblyInstructions(itemName, context = {}) {
    console.log('Getting assembly instructions for:', itemName);
    
    try {
      // Try backend first
      const response = await chatAPI.sendAssemblyQuery(itemName, JSON.stringify(context));
      return {
        success: true,
        source: 'backend',
        instructions: response.response
      };
    } catch (error) {
      // Backend failed, caller should try Gemini
      throw error;
    }
  },

  // Get predefined assembly instructions (fallback)
  getPredefinedInstructions(itemType) {
    const predefined = {
      'tv': {
        name: 'TV Stand Assembly',
        steps: [
          { step: 1, title: 'Unpack Components', description: 'Remove all parts and organize hardware', duration: '5 minutes' },
          { step: 2, title: 'Attach Base', description: 'Secure stand base with provided screws', duration: '10 minutes' },
          { step: 3, title: 'Mount TV', description: 'Carefully attach TV to stand', duration: '8 minutes' },
          { step: 4, title: 'Connect Cables', description: 'Route and connect all cables', duration: '5 minutes' }
        ],
        tools: ['Phillips screwdriver', 'Level'],
        tips: ['Have someone help with TV mounting', 'Don\'t fully tighten until all parts are attached']
      }
      // Add more predefined types as needed
    };

    return predefined[itemType.toLowerCase()] || null;
  }
};

// Export default API object with enhanced capabilities
export default {
  device: deviceAPI,
  chat: chatAPI,
  health: healthAPI,
  assembly: assemblyAPI,
  utils,
  errorHandler
};