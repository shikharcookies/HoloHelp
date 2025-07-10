// src/utils/voiceGuidance.js - Complete Voice Implementation
export class VoiceGuidanceManager {
  constructor() {
    this.isEnabled = true;
    this.currentUtterance = null;
    this.isInitialized = false;
    this.speechQueue = [];
    this.isSpeaking = false;
    this.initializeVoices();
  }

  initializeVoices() {
    if ('speechSynthesis' in window) {
      const loadVoices = () => {
        const voices = speechSynthesis.getVoices();
        if (voices.length > 0) {
          this.isInitialized = true;
          console.log('🎙️ Voice synthesis initialized with', voices.length, 'voices');
          
          // Log available voices for debugging
          voices.forEach((voice, index) => {
            console.log(`Voice ${index}: ${voice.name} (${voice.lang})`);
          });
        }
      };

      // Load voices immediately if available
      loadVoices();
      
      // Also listen for the voices changed event
      speechSynthesis.addEventListener('voiceschanged', loadVoices);
    } else {
      console.warn('❌ Speech synthesis not supported in this browser');
    }
  }

  async speak(text, options = {}) {
    if (!this.isEnabled || !text || typeof text !== 'string') {
      console.warn('🎙️ Voice guidance skipped:', { enabled: this.isEnabled, text: !!text });
      return Promise.resolve();
    }

    return new Promise((resolve) => {
      try {
        // Stop current speech if interrupting
        if (options.interrupt !== false) {
          this.stop();
        }

        console.log('🎙️ Speaking:', text.substring(0, 50) + '...');
        
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = options.rate || 0.85;
        utterance.pitch = options.pitch || 1.0;
        utterance.volume = options.volume || 0.9;
        
        // Select the best available voice
        const voices = speechSynthesis.getVoices();
        const preferredVoice = this.selectBestVoice(voices);
        
        if (preferredVoice) {
          utterance.voice = preferredVoice;
          console.log('🎙️ Using voice:', preferredVoice.name);
        }
        
        utterance.onstart = () => {
          console.log('🎙️ Speech started');
          this.isSpeaking = true;
        };
        
        utterance.onend = () => {
          console.log('🎙️ Speech ended');
          this.isSpeaking = false;
          this.currentUtterance = null;
          resolve();
        };
        
        utterance.onerror = (event) => {
          console.error('🎙️ Speech error:', event.error);
          this.isSpeaking = false;
          this.currentUtterance = null;
          resolve(); // Resolve anyway to continue flow
        };
        
        this.currentUtterance = utterance;
        speechSynthesis.speak(utterance);
        
      } catch (error) {
        console.error('🎙️ Voice guidance failed:', error);
        resolve(); // Resolve to continue flow
      }
    });
  }

  selectBestVoice(voices) {
    // Priority order for voice selection
    const priorities = [
      (voice) => voice.name.includes('Google') && voice.lang.startsWith('en'),
      (voice) => voice.name.includes('Microsoft') && voice.lang.startsWith('en'),
      (voice) => voice.name.includes('Alex') && voice.lang.startsWith('en'),
      (voice) => voice.name.includes('Samantha') && voice.lang.startsWith('en'),
      (voice) => voice.lang.startsWith('en-US') && voice.localService,
      (voice) => voice.lang.startsWith('en') && voice.localService,
      (voice) => voice.lang.startsWith('en-US'),
      (voice) => voice.lang.startsWith('en')
    ];

    for (const priority of priorities) {
      const voice = voices.find(priority);
      if (voice) return voice;
    }

    return voices[0]; // Fallback to first available voice
  }

  async speakStepInstruction(step, stepNumber, totalSteps) {
    if (!step) {
      console.warn('🎙️ No step provided for voice instruction');
      return;
    }

    const stepText = `Step ${stepNumber} of ${totalSteps}. ${step.title}. ${step.description || ''} ${step.voiceover || ''}`;
    return this.speak(stepText, { rate: 0.85 });
  }

  async speakProblemIntroduction(problemType) {
    const introductions = {
      battery_drain: "I'll help you fix your phone's battery drain issues with step-by-step AR guidance. We'll identify power-hungry apps and optimize your battery settings.",
      slow_performance: "Let's improve your phone's performance with visual AR instructions. We'll clear cache, close background apps, and optimize your device speed.",
      overheating: "I'll guide you through cooling down your phone safely with AR assistance. We'll identify heat sources and prevent overheating.",
      wifi_issues: "Let's troubleshoot your WiFi connection problems together using AR guidance. We'll reset network settings and restore connectivity.",
      storage_full: "I'll help you free up storage space on your phone with visual AR guidance. We'll identify large files and clean up unnecessary data."
    };
    
    const introduction = introductions[problemType] || "Let's start troubleshooting your phone issue with AR guidance.";
    return this.speak(introduction);
  }

  async speakCompletionMessage(problemType) {
    const completionMessages = {
      battery_drain: "Excellent work! You've completed all battery optimization steps. Your phone should now have significantly better battery life. The changes you made will help your device run more efficiently.",
      slow_performance: "Outstanding! Your phone's performance should now be greatly improved. The cache clearing and app updates will make your device run much faster and smoother.",
      overheating: "Perfect! These cooling steps should prevent your phone from overheating in the future. Monitor the temperature over the next few hours to see the improvement.",
      wifi_issues: "Wonderful! Your WiFi connectivity should now be fully restored. Try connecting to your network again to test the improved connection.",
      storage_full: "Fantastic! You've successfully freed up valuable storage space. Your phone should now run more smoothly with the additional available memory."
    };
    
    const message = completionMessages[problemType] || "Congratulations! You've successfully completed all troubleshooting steps.";
    const additionalMessage = " Your phone should be working much better now. Would you like to try fixing another issue or repeat these steps?";
    
    return this.speak(message + additionalMessage);
  }

  async speakStepProgress(currentStep, totalSteps, isCompleted = false) {
    if (isCompleted) {
      return this.speak(`All ${totalSteps} steps have been completed successfully! Your phone troubleshooting is now finished.`);
    } else {
      return this.speak(`You are currently on step ${currentStep + 1} of ${totalSteps}. ${totalSteps - currentStep - 1} steps remaining.`);
    }
  }

  async speakRepeatInstructions(problemType, steps) {
    const intro = `Here's a summary of all steps for ${problemType.replace('_', ' ')} troubleshooting: `;
    const stepsSummary = steps.map((step, index) => 
      `Step ${index + 1}: ${step.title}`
    ).join('. ');
    const outro = ". Would you like me to guide you through these steps again with AR assistance?";
    
    return this.speak(intro + stepsSummary + outro);
  }

  setEnabled(enabled) {
    this.isEnabled = enabled;
    console.log('🎙️ Voice guidance', enabled ? 'enabled' : 'disabled');
    if (!enabled) {
      this.stop();
    } else {
      this.speak("Voice guidance is now enabled");
    }
  }

  stop() {
    if (speechSynthesis.speaking) {
      speechSynthesis.cancel();
    }
    this.currentUtterance = null;
    this.isSpeaking = false;
  }

  pause() {
    if (speechSynthesis.speaking) {
      speechSynthesis.pause();
    }
  }

  resume() {
    if (speechSynthesis.paused) {
      speechSynthesis.resume();
    }
  }

  // Test voice functionality
  test() {
    return this.speak("Voice guidance is working correctly. You can now use AR phone diagnostics with comprehensive audio instructions. All features are functioning properly.");
  }

  // Get voice status
  getStatus() {
    return {
      enabled: this.isEnabled,
      initialized: this.isInitialized,
      speaking: this.isSpeaking,
      supported: 'speechSynthesis' in window,
      voiceCount: speechSynthesis.getVoices().length
    };
  }
}

export const voiceGuidance = new VoiceGuidanceManager();

// Auto-test voice on load (for development)
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  window.voiceGuidance = voiceGuidance;
  console.log('🎙️ Voice guidance available globally as window.voiceGuidance');
}