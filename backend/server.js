// Import required packages
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import multer from "multer";
import process from "process";

// Initialize Express app
const app = express();

// Enable CORS for all origins (adjust if needed for production)
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:3000'],
  credentials: true
}));

// Parse incoming JSON data with increased limit for image uploads
app.use(bodyParser.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Multer for image uploads
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Enhanced mobile phone troubleshooting instructions database with AR components
const mobileInstructions = {
  "battery_drain": {
    device_model: "Mobile_Phone_Battery_Fix",
    device_type: "mobile_phone", 
    instruction_set_id: "phone-battery-001",
    ar_enhanced: true,
    steps: [
      {
        step: 1,
        title: "Check Battery Usage",
        description: "Go to Settings > Battery to see which apps are draining battery",
        asset: "phone_settings.glb",
        voiceover: "First, let's check which apps are using the most battery. Go to Settings, then Battery. Look for the Settings app icon on your phone screen.",
        highlight: "SettingsIcon",
        position: [0, 0.05, 0.01], // Enhanced positioning for AR
        component_target: "settings",
        ar_effects: ["highlight_component", "floating_arrow", "progress_ring"],
        duration: 10000
      },
      {
        step: 2,
        title: "Close Background Apps",
        description: "Swipe up and close apps running in background",
        asset: "phone_multitask.glb", 
        voiceover: "Now swipe up from the bottom of your phone screen to see all open apps, then swipe up on each app to close it. This will stop apps from draining battery in the background.",
        highlight: "HomeButton",
        position: [0, -0.13, 0.01],
        component_target: "home_button",
        ar_effects: ["highlight_component", "swipe_animation", "particle_trail"],
        duration: 12000
      },
      {
        step: 3,
        title: "Enable Battery Saver",
        description: "Turn on battery saver mode in Settings",
        asset: "phone_battery_saver.glb",
        voiceover: "Go back to Battery settings and turn on Battery Saver or Low Power Mode. This will optimize your phone's performance to save battery.",
        highlight: "BatterySaver",
        position: [0, 0.05, 0.01],
        component_target: "battery",
        ar_effects: ["highlight_component", "success_celebration"],
        duration: 8000
      }
    ]
  },
  "slow_performance": {
    device_model: "Mobile_Phone_Speed_Fix",
    device_type: "mobile_phone",
    instruction_set_id: "phone-speed-001", 
    ar_enhanced: true,
    steps: [
      {
        step: 1,
        title: "Restart Your Phone",
        description: "Hold power button and restart to clear memory",
        asset: "phone_restart.glb",
        voiceover: "First, let's restart your phone to clear the memory and improve performance. Hold the power button on the side of your phone and select restart.",
        highlight: "PowerButton",
        position: [0.084, 0.05, 0],
        component_target: "power_button",
        ar_effects: ["highlight_component", "pulsing_highlight", "instruction_text"],
        duration: 12000
      },
      {
        step: 2,
        title: "Clear Cache",
        description: "Go to Settings > Storage > Clear Cache",
        asset: "phone_storage.glb",
        voiceover: "Now go to Settings, then Storage, and tap Clear Cache to free up memory. This will remove temporary files that may be slowing down your phone.",
        highlight: "StorageSettings",
        position: [0, 0.05, 0.01],
        component_target: "storage",
        ar_effects: ["highlight_component", "floating_arrow", "progress_indicator"],
        duration: 15000
      },
      {
        step: 3,
        title: "Update Apps",
        description: "Check app store for pending updates",
        asset: "phone_updates.glb",
        voiceover: "Finally, open your app store and update any apps that have pending updates. Updated apps often run faster and more efficiently.",
        highlight: "AppStore",
        position: [0, -0.1, 0.01],
        component_target: "apps",
        ar_effects: ["highlight_component", "update_animation", "completion_burst"],
        duration: 10000
      }
    ]
  },
  "overheating": {
    device_model: "Mobile_Phone_Cooling_Fix",
    device_type: "mobile_phone",
    instruction_set_id: "phone-heat-001",
    ar_enhanced: true,
    steps: [
      {
        step: 1,
        title: "Remove Phone Case",
        description: "Take off any protective case to allow cooling",
        asset: "phone_case.glb",
        voiceover: "First, remove your phone case to help it cool down faster. The case can trap heat and prevent proper ventilation.",
        highlight: "PhoneCase",
        position: [0, 0, -0.01],
        component_target: "case",
        ar_effects: ["highlight_component", "cooling_animation", "temperature_indicator"],
        duration: 8000
      },
      {
        step: 2,
        title: "Close Heavy Apps",
        description: "Close games, camera, or video apps that use lots of processing",
        asset: "phone_apps.glb", 
        voiceover: "Close any games, camera, or video apps that might be causing the overheating. These apps use intensive processing power which generates heat.",
        highlight: "AppIcons",
        position: [0, -0.1, 0.01],
        component_target: "apps",
        ar_effects: ["highlight_component", "heat_visualization", "app_closing_animation"],
        duration: 12000
      },
      {
        step: 3,
        title: "Cool Down Period",
        description: "Let phone rest in cool area for 10-15 minutes",
        asset: "phone_cooling.glb",
        voiceover: "Place your phone in a cool area and let it rest for 10 to 15 minutes. Avoid direct sunlight and keep it away from heat sources.",
        highlight: "CoolingArea",
        position: [0, 0, 0],
        component_target: "cooling",
        ar_effects: ["highlight_component", "cooling_effects", "timer_visualization"],
        duration: 10000
      }
    ]
  },
  "wifi_issues": {
    device_model: "Mobile_Phone_WiFi_Fix", 
    device_type: "mobile_phone",
    instruction_set_id: "phone-wifi-001",
    ar_enhanced: true,
    steps: [
      {
        step: 1,
        title: "Toggle WiFi Off/On",
        description: "Turn WiFi off, wait 10 seconds, then turn back on",
        asset: "phone_wifi.glb",
        voiceover: "First, turn off WiFi, wait 10 seconds, then turn it back on. This simple reset can resolve many connection issues.",
        highlight: "WiFiToggle",
        position: [0, 0.15, 0.01],
        component_target: "wifi",
        ar_effects: ["highlight_component", "wifi_signal_animation", "toggle_visualization"],
        duration: 15000
      },
      {
        step: 2,
        title: "Forget and Reconnect",
        description: "Forget the WiFi network and reconnect with password",
        asset: "phone_wifi_forget.glb",
        voiceover: "Now forget the WiFi network and reconnect by entering the password again. This clears any corrupted connection data.",
        highlight: "WiFiSettings",
        position: [0, 0.05, 0.01],
        component_target: "wifi_settings",
        ar_effects: ["highlight_component", "connection_visualization", "password_prompt"],
        duration: 18000
      },
      {
        step: 3,
        title: "Reset Network Settings",
        description: "If still not working, reset all network settings",
        asset: "phone_network_reset.glb",
        voiceover: "If WiFi still doesn't work, go to Settings and reset network settings. This will restore all network configurations to default.",
        highlight: "NetworkReset",
        position: [0, 0.05, 0.01],
        component_target: "network_settings",
        ar_effects: ["highlight_component", "reset_animation", "success_confirmation"],
        duration: 15000
      }
    ]
  },
  "storage_full": {
    device_model: "Mobile_Phone_Storage_Fix",
    device_type: "mobile_phone", 
    instruction_set_id: "phone-storage-001",
    ar_enhanced: true,
    steps: [
      {
        step: 1,
        title: "Check Storage Usage",
        description: "Go to Settings > Storage to see what's using space",
        asset: "phone_storage_check.glb",
        voiceover: "Let's check what's using your storage. Go to Settings, then Storage to see a breakdown of what's taking up space on your phone.",
       highlight: "StorageMenu",
       position: [0, 0.05, 0.01],
       component_target: "storage",
       ar_effects: ["highlight_component", "storage_visualization", "usage_chart"],
       duration: 12000
     },
     {
       step: 2,
       title: "Delete Photos/Videos",
       description: "Remove old photos and videos, or backup to cloud",
       asset: "phone_photos.glb",
       voiceover: "Delete old photos and videos, or backup them to cloud storage like Google Photos or iCloud. Photos and videos often take up the most space.",
       highlight: "PhotosApp",
       position: [0, -0.1, 0.01],
       component_target: "photos",
       ar_effects: ["highlight_component", "photo_cleanup_animation", "cloud_backup_visual"],
       duration: 15000
     },
     {
       step: 3,
       title: "Clear App Data",
       description: "Clear cache and data from large apps",
       asset: "phone_app_data.glb",
       voiceover: "Go to app settings and clear cache and data from large apps you don't use often. This will free up significant storage space.",
       highlight: "AppData",
       position: [0, -0.1, 0.01],
       component_target: "app_storage",
       ar_effects: ["highlight_component", "cache_clearing_animation", "storage_freed_celebration"],
       duration: 12000
     }
   ]
 }
};

// Enhanced device classification with confidence scoring
const classifyDevice = (detectedObjects) => {
 console.log('🔍 Enhanced AR device classification:', detectedObjects);

 const phoneMappings = {
   'cell phone': 0.95,
   'phone': 0.90,
   'smartphone': 0.95,
   'mobile phone': 0.95,
   'iphone': 0.90,
   'android': 0.85,
   'mobile': 0.80
 };

 let bestMatch = null;
 let highestConfidence = 0;

 for (const obj of detectedObjects) {
   const confidence = phoneMappings[obj.toLowerCase()];
   if (confidence && confidence > highestConfidence) {
     highestConfidence = confidence;
     bestMatch = obj;
   }
 }

 if (bestMatch) {
   console.log(`✅ Enhanced AR phone detected: "${bestMatch}" (confidence: ${highestConfidence})`);
   return { type: 'mobile_phone', confidence: highestConfidence, detectedAs: bestMatch };
 }
 
 console.log('❌ No mobile phone detected for AR mode:', detectedObjects);
 return null;
};

// Root route for health check (important for Render to detect server is alive)
app.get("/", (req, res) => {
  res.send("HoloHelp AR Backend is live 🚀📱");
});

// Enhanced health check with AR capabilities
app.get('/health', (req, res) => {
 res.json({ 
   status: 'OK', 
   timestamp: new Date().toISOString(),
   version: '2.0.0',
   service: 'HoloHelp Enhanced AR Mobile Troubleshooting',
   features: {
     ar_enabled: true,
     voice_guidance: true,
     component_highlighting: true,
     particle_effects: true,
     enhanced_3d_models: true
   }
 });
});

// Example API route
app.post("/api/getRes", (req, res) => {
  const { data } = req.body;
  console.log("Received data:", data);
  // Respond back
  res.json({ response: "Hello from HoloHelp AR backend" });
});

// Enhanced device recognition endpoint with AR metadata
app.post('/api/recognize-device', upload.single('image'), async (req, res) => {
 try {
   const { detectedObjects } = req.body;
   
   console.log('📱 Enhanced AR device recognition request:', { detectedObjects });
   
   if (!detectedObjects) {
     return res.status(400).json({ 
       error: 'No detected objects provided',
       example: { detectedObjects: ['cell phone'] },
       ar_features_available: true
     });
   }

   const objects = JSON.parse(detectedObjects);
   const deviceClassification = classifyDevice(objects);
   
   if (!deviceClassification || deviceClassification.type !== 'mobile_phone') {
     return res.status(404).json({ 
       error: 'Please scan a mobile phone for enhanced AR troubleshooting!',
       detected: objects,
       supported: ['cell phone', 'smartphone', 'mobile phone', 'iphone', 'android'],
       message: 'Point your camera at a mobile phone to experience 3D AR diagnostics with voice guidance.',
       ar_features: {
         available: true,
         requires_phone: true,
         features: ['3D phone models', 'component highlighting', 'voice guidance', 'particle effects']
       }
     });
   }

   // Enhanced response for mobile phones with AR metadata
   console.log('✅ Enhanced AR mobile phone detected, sending enriched response');
   
   res.json({
     success: true,
     device_model: "Enhanced_AR_Mobile_Phone",
     device_type: "mobile_phone", 
     instruction_set_id: "enhanced-phone-problem-selector",
     detected_objects: objects,
     confidence: deviceClassification.confidence,
     detected_as: deviceClassification.detectedAs,
     next_step: "enhanced_problem_selection",
     message: "Mobile phone detected! Enhanced AR diagnostics ready with 3D models and voice guidance.",
     ar_capabilities: {
       enhanced_3d_models: true,
       component_highlighting: true,
       voice_guidance: true,
       particle_effects: true,
       progress_visualization: true,
       step_completion_celebration: true
     }
   });

 } catch (error) {
   console.error('Enhanced AR recognition error:', error);
   res.status(500).json({ 
     error: 'Internal server error',
     message: error.message,
     ar_status: 'error'
   });
 }
});

// Enhanced endpoint: Select mobile phone problem with AR context
app.post('/api/phone-problem', (req, res) => {
 try {
   const { problem, ar_enhanced = true } = req.body;
   
   console.log('📱 Enhanced AR problem selection request:', { problem, ar_enhanced });
   
   if (!problem || !mobileInstructions[problem]) {
     return res.status(400).json({
       error: 'Please select a valid problem for enhanced AR troubleshooting',
       available_problems: Object.keys(mobileInstructions),
       problems: {
         'battery_drain': 'Battery drains too fast - AR guided battery optimization',
         'slow_performance': 'Phone is slow/laggy - AR performance enhancement', 
         'overheating': 'Phone gets too hot - AR cooling assistance',
         'wifi_issues': 'WiFi connection problems - AR network diagnostics',
         'storage_full': 'Storage space full - AR cleanup guidance'
       },
       ar_features: true
     });
   }

   const instructions = mobileInstructions[problem];
   
   // Enhanced response with AR metadata
   const enhancedResponse = {
     success: true,
     problem: problem,
     device_model: instructions.device_model,
     device_type: instructions.device_type,
     instruction_set_id: instructions.instruction_set_id,
     ar_enhanced: instructions.ar_enhanced || false,
     steps: instructions.steps.map(step => ({
       ...step,
       ar_metadata: {
         component_target: step.component_target || 'screen',
         ar_effects: step.ar_effects || ['highlight_component'],
         enhanced_voiceover: step.voiceover,
         position_optimized: true
       }
     })),
     total_steps: instructions.steps.length,
     estimated_time: instructions.steps.reduce((sum, step) => sum + step.duration, 0),
     ar_capabilities: {
       component_highlighting: true,
       voice_guidance: true,
       step_by_step_visualization: true,
       progress_tracking: true,
       completion_celebration: true
     }
   };
   
   console.log('✅ Enhanced AR instructions prepared for problem:', problem);
   
   res.json(enhancedResponse);

 } catch (error) {
   console.error('Enhanced AR problem selection error:', error);
   res.status(500).json({
     error: 'Internal server error', 
     message: error.message,
     ar_status: 'error'
   });
 }
});

// Enhanced instruction set endpoint with AR features
app.get('/api/instructions/:id', (req, res) => {
 try {
   const { id } = req.params;
   
   if (id === 'enhanced-phone-problem-selector') {
     return res.json({
       success: true,
       instruction_set_id: id,
       device_model: "Enhanced_AR_Mobile_Phone",
       device_type: "mobile_phone",
       total_steps: 1,
       estimated_time: 5000,
       ar_enhanced: true,
       steps: [{
         step: 1,
         title: "What's the problem?",
         description: "Select your phone issue for enhanced AR troubleshooting",
         asset: "enhanced_phone_question.glb", 
         voiceover: "I can see you have a mobile phone. What problem would you like me to help you fix with enhanced AR guidance?",
         highlight: "PhoneScreen",
         position: [0, 0, 0.01],
         duration: 5000,
         problem_selection: true,
         ar_metadata: {
           component_target: 'screen',
           ar_effects: ['welcome_animation', 'problem_selector_highlight'],
           enhanced_voiceover: true
         }
       }]
     });
   }
   
   // Find instruction set by ID in enhanced mobile instructions
   const problem = Object.keys(mobileInstructions).find(key => 
     mobileInstructions[key].instruction_set_id === id
   );
   
   if (!problem) {
     return res.status(404).json({ 
       error: 'Enhanced AR instruction set not found',
       available: Object.keys(mobileInstructions).map(key => 
         mobileInstructions[key].instruction_set_id
       ),
       ar_status: 'instruction_not_found'
     });
   }

   const instructions = mobileInstructions[problem];
   
   res.json({
     success: true,
     instruction_set_id: id,
     device_model: instructions.device_model,
     device_type: instructions.device_type,
     ar_enhanced: instructions.ar_enhanced || false,
     total_steps: instructions.steps.length,
     estimated_time: instructions.steps.reduce((sum, step) => sum + step.duration, 0),
     steps: instructions.steps,
     ar_capabilities: {
       enhanced_3d_models: true,
       component_highlighting: true,
       voice_guidance: true,
       particle_effects: true
     }
   });

 } catch (error) {
   console.error('Enhanced AR instructions error:', error);
   res.status(500).json({ 
     error: 'Internal server error',
     message: error.message,
     ar_status: 'error'
   });
 }
});

// Enhanced supported devices endpoint with AR capabilities
app.get('/api/devices', (req, res) => {
 const devices = [{
   device_type: 'mobile_phone',
   device_model: 'Enhanced AR Mobile Phone Troubleshooting',
   instruction_set_id: 'enhanced-phone-problem-selector',
   supported_problems: Object.keys(mobileInstructions),
   problems_description: {
     'battery_drain': 'Battery drains too fast - Enhanced AR battery optimization with component highlighting',
     'slow_performance': 'Phone is slow/laggy - AR-guided performance enhancement with visual feedback',
     'overheating': 'Phone gets too hot - 3D cooling assistance with temperature visualization', 
     'wifi_issues': 'WiFi connection problems - AR network diagnostics with signal visualization',
     'storage_full': 'Storage space full - AR cleanup guidance with storage visualization'
   },
   ar_features: {
     enhanced_3d_models: true,
     component_highlighting: true,
     voice_guidance: true,
     particle_effects: true,
     progress_visualization: true,
     step_completion_celebration: true
   }
 }];

 res.json({
   success: true,
   supported_devices: devices,
   total_count: devices.length,
   message: "Enhanced AR mobile phone troubleshooting available! Scan your phone for 3D diagnostics with voice guidance.",
   ar_capabilities: {
     version: "2.0.0",
     enhanced_features: true,
     voice_guidance: true,
     component_targeting: true
   }
 });
});

// Enhanced chat endpoint with AR context awareness
app.post('/api/chat', async (req, res) => {
 try {
   const { message, context, deviceType, ar_mode = false } = req.body;
   
   if (!message) {
     return res.status(400).json({ error: 'Message is required' });
   }

   // Enhanced mobile phone responses with AR context
   const lowerMessage = message.toLowerCase();
   let response = "I specialize in enhanced AR mobile phone troubleshooting! Try scanning your phone for 3D guided repairs with voice assistance.";

   if (lowerMessage.includes('battery')) {
     response = "For battery issues with AR guidance: I'll show you 3D highlights of Settings > Battery, guide you to close background apps with visual indicators, and help enable battery saver mode with component highlighting.";
   } else if (lowerMessage.includes('slow') || lowerMessage.includes('lag')) {
     response = "For performance issues with enhanced AR: I'll guide you through phone restart with power button highlighting, cache clearing with visual storage indicators, and app updates with 3D animations.";
   } else if (lowerMessage.includes('hot') || lowerMessage.includes('heat')) {
     response = "For overheating with AR cooling assistance: I'll show you case removal techniques, highlight heavy apps to close, and provide visual cooling guidance with temperature indicators.";
   } else if (lowerMessage.includes('wifi') || lowerMessage.includes('internet')) {
     response = "For WiFi problems with AR network diagnostics: I'll highlight WiFi toggles with signal visualization, guide network reconnection with 3D indicators, and show network reset procedures.";
   } else if (lowerMessage.includes('storage') || lowerMessage.includes('space')) {
     response = "For storage issues with AR cleanup guidance: I'll show storage visualization, highlight photos/videos for cleanup, and guide app data clearing with progress indicators.";
   } else if (lowerMessage.includes('ar') || lowerMessage.includes('3d')) {
     response = "Enhanced AR features include: 3D phone models with realistic components, holographic highlighting of specific parts, voice-guided step-by-step instructions, particle effects for celebrations, and progress visualization!";
   }

   res.json({
     success: true,
     response,
     timestamp: new Date().toISOString(),
     context_used: !!context,
     ar_enhanced: ar_mode,
     ai_powered: false,
     device_type: deviceType,
     enhanced_features: {
       ar_context_aware: true,
       voice_guidance_available: true,
       component_highlighting: true
     }
   });

 } catch (error) {
   console.error('Enhanced AR chat error:', error);
   res.status(500).json({ 
     error: 'Internal server error',
     message: error.message,
     ar_status: 'chat_error'
   });
 }
});

// New endpoint: Get AR capabilities
app.get('/api/ar-capabilities', (req, res) => {
 res.json({
   success: true,
   ar_version: "2.0.0",
   capabilities: {
     enhanced_3d_models: {
       enabled: true,
       description: "Realistic phone models with detailed components"
     },
     component_highlighting: {
       enabled: true,
       description: "Highlights specific phone parts during instructions"
     },
     voice_guidance: {
       enabled: true,
       description: "AI-powered voice instructions for each step"
     },
     particle_effects: {
       enabled: true,
       description: "Celebration effects and visual feedback"
     },
     progress_visualization: {
       enabled: true,
       description: "Real-time progress tracking with visual indicators"
     },
     step_completion_celebration: {
       enabled: true,
       description: "Animated celebrations when steps are completed"
     }
   },
   supported_problems: Object.keys(mobileInstructions),
   performance: {
     target_fps: 60,
     optimized_rendering: true,
     efficient_animations: true
   }
 });
});

// Use dynamic port (Render sets PORT environment variable)
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Enhanced HoloHelp AR Mobile Troubleshooting API running on port ${PORT}`);
  console.log(`📱 Health check: http://localhost:${PORT}/health`);
  console.log(`🔍 Enhanced API docs: http://localhost:${PORT}/api/devices`);
  console.log(`📞 AR phone detection: http://localhost:${PORT}/api/recognize-device`);
  console.log(`✨ AR capabilities: http://localhost:${PORT}/api/ar-capabilities`);
  console.log(`🎯 Features: 3D Models, Component Highlighting, Voice Guidance, Particle Effects`);
});

export default app;