// src/components/ARCanvas.jsx - SMOOTH ANIMATION AR IMPLEMENTATION
import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { Button } from '@/components/ui/button';
import { 
  Play, 
  Pause, 
  SkipForward, 
  SkipBack, 
  RotateCcw, 
  Volume2, 
  VolumeX,
  CheckCircle,
  Circle,
  Target,
  Smartphone,
  Zap,
  Battery,
  Settings
} from 'lucide-react';

// Mock voice guidance utility
const voiceGuidance = {
  speak: (text) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      speechSynthesis.speak(utterance);
    }
  },
  stop: () => {
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
    }
  }
};

const ARCanvas = ({ 
  detectedObject = "phone", 
  instructions = {
    steps: [
      {
        id: 1,
        title: "Check Battery Usage",
        description: "Go to Settings > Battery to see which apps are draining battery",
        duration: 5000
      },
      {
        id: 2,
        title: "Close Background Apps",
        description: "Disable background app refresh for unused applications",
        duration: 4000
      },
      {
        id: 3,
        title: "Enable Battery Saver",
        description: "Turn on low power mode to extend battery life",
        duration: 3000
      },
      {
        id: 4,
        title: "Restart Device",
        description: "Power cycle your device to refresh system processes",
        duration: 6000
      }
    ]
  }, 
  selectedProblem = "battery_drain",
  onStepComplete = () => {},
  onInstructionComplete = () => {}
}) => {
  const containerRef = useRef(null);
  const rendererRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const animationFrameRef = useRef(null);
  
  // State management
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(true);
  const [stepProgress, setStepProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isCompleted, setIsCompleted] = useState(false);
  const [is3DReady, setIs3DReady] = useState(false);

  // 3D Objects and AR elements
  const phoneModelRef = useRef(null);
  const arElementsRef = useRef([]);
  const stepTimerRef = useRef(null);
  const clockRef = useRef(new THREE.Clock());

  // Animation variables for smooth rotation
  const animationState = useRef({
    phoneRotationY: 0,
    phoneRotationX: 0,
    phonePositionY: 0,
    time: 0
  });

  // Validation
  const validInstructions = instructions && instructions.steps && instructions.steps.length > 0;
  const currentStepData = validInstructions ? instructions.steps[currentStep] : null;
  const totalSteps = validInstructions ? instructions.steps.length : 0;

  // Initialize AR experience
  useEffect(() => {
    if (!containerRef.current || !validInstructions) {
      console.error('❌ Container or instructions missing');
      return;
    }

    console.log('🚀 Initializing Smooth AR Experience...');
    initializeARScene();
    
    return () => cleanup();
  }, [validInstructions]);

  // PHONE SCREEN CONTENT CREATION
  const createDynamicPhoneScreen = useCallback((stepType = 'home') => {
    const canvas = document.createElement('canvas');
    canvas.width = 540;
    canvas.height = 1080;
    const ctx = canvas.getContext('2d');

    // Dynamic background based on step
    const backgrounds = {
      home: { start: '#667eea', end: '#764ba2' },
      settings: { start: '#2c3e50', end: '#3498db' },
      battery: { start: '#27ae60', end: '#2ecc71' },
      restart: { start: '#e74c3c', end: '#c0392b' }
    };

    const bg = backgrounds[stepType] || backgrounds.home;
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, bg.start);
    gradient.addColorStop(1, bg.end);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Status bar
    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
    ctx.font = 'bold 28px -apple-system, BlinkMacSystemFont, Arial';
    ctx.textAlign = 'left';
    ctx.fillText('13:10', 30, 50);
    ctx.textAlign = 'right';
    ctx.fillText('📶 🔋85%', canvas.width - 30, 50);

    // Notch
    ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
    ctx.beginPath();
    if (ctx.roundRect) {
      ctx.roundRect(canvas.width/2 - 80, 0, 160, 40, 20);
    } else {
      ctx.rect(canvas.width/2 - 80, 0, 160, 40);
    }
    ctx.fill();

    // Content based on step type
    switch (stepType) {
      case 'settings':
        drawSettingsScreen(ctx, canvas);
        break;
      case 'battery':
        drawBatteryScreen(ctx, canvas);
        break;
      case 'restart':
        drawRestartScreen(ctx, canvas);
        break;
      default:
        drawHomeScreen(ctx, canvas);
    }

    // Bottom home indicator
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.beginPath();
    if (ctx.roundRect) {
      ctx.roundRect(canvas.width/2 - 60, canvas.height - 20, 120, 4, 2);
    } else {
      ctx.rect(canvas.width/2 - 60, canvas.height - 20, 120, 4);
    }
    ctx.fill();

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    
    return texture;
  }, [currentStep]);

  const drawHomeScreen = (ctx, canvas) => {
    // App title
    ctx.fillStyle = 'white';
    ctx.font = 'bold 36px -apple-system, BlinkMacSystemFont, Arial';
    ctx.textAlign = 'center';
    ctx.fillText('HoloHelp AR', canvas.width/2, 180);

    // Problem indicator
    ctx.fillStyle = 'rgba(255, 87, 87, 0.9)';
    ctx.beginPath();
    if (ctx.roundRect) {
      ctx.roundRect(30, 250, canvas.width - 60, 80, 15);
    } else {
      ctx.rect(30, 250, canvas.width - 60, 80);
    }
    ctx.fill();
    
    ctx.fillStyle = 'white';
    ctx.font = 'bold 28px Arial';
    ctx.fillText(`⚠️ ${selectedProblem?.replace('_', ' ').toUpperCase() || 'BATTERY ISSUE'}`, canvas.width/2, 300);

    // App icons
    drawAppIcons(ctx, canvas);
  };

  const drawSettingsScreen = (ctx, canvas) => {
    ctx.fillStyle = 'white';
    ctx.font = 'bold 42px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('⚙️ Settings', canvas.width/2, 180);

    const settings = [
      { icon: '🔋', name: 'Battery', highlight: true },
      { icon: '📶', name: 'WiFi', highlight: false },
      { icon: '🔊', name: 'Sound', highlight: false },
      { icon: '📱', name: 'Display', highlight: false },
      { icon: '🔒', name: 'Privacy', highlight: false }
    ];

    settings.forEach((setting, index) => {
      const y = 300 + index * 120;
      
      ctx.fillStyle = setting.highlight ? 'rgba(0, 255, 136, 0.3)' : 'rgba(255, 255, 255, 0.1)';
      ctx.beginPath();
      if (ctx.roundRect) {
        ctx.roundRect(40, y - 40, canvas.width - 80, 80, 15);
      } else {
        ctx.rect(40, y - 40, canvas.width - 80, 80);
      }
      ctx.fill();

      if (setting.highlight) {
        ctx.strokeStyle = 'rgba(0, 255, 136, 0.8)';
        ctx.lineWidth = 3;
        ctx.stroke();
      }

      ctx.fillStyle = 'white';
      ctx.font = '36px Arial';
      ctx.textAlign = 'left';
      ctx.fillText(setting.icon, 80, y + 10);
      
      ctx.font = 'bold 28px Arial';
      ctx.fillText(setting.name, 150, y + 10);
    });
  };

  const drawBatteryScreen = (ctx, canvas) => {
    ctx.fillStyle = 'white';
    ctx.font = 'bold 42px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('🔋 Battery Usage', canvas.width/2, 180);

    const centerX = canvas.width / 2;
    const centerY = 400;
    const radius = 100;

    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.fill();

    ctx.beginPath();
    ctx.arc(centerX, centerY, radius - 10, -Math.PI/2, -Math.PI/2 + (Math.PI * 2 * 0.85));
    ctx.strokeStyle = '#27ae60';
    ctx.lineWidth = 20;
    ctx.stroke();

    ctx.fillStyle = 'white';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('85%', centerX, centerY + 15);

    const apps = [
      { name: 'Background App Refresh', usage: '35%', color: '#e74c3c' },
      { name: 'Screen', usage: '25%', color: '#f39c12' },
      { name: 'System Services', usage: '15%', color: '#3498db' },
      { name: 'Games', usage: '25%', color: '#9b59b6' }
    ];

    apps.forEach((app, index) => {
      const y = 600 + index * 80;
      
      ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.beginPath();
      if (ctx.roundRect) {
        ctx.roundRect(40, y - 25, canvas.width - 80, 60, 10);
      } else {
        ctx.rect(40, y - 25, canvas.width - 80, 60);
      }
      ctx.fill();

      ctx.fillStyle = 'white';
      ctx.font = 'bold 24px Arial';
      ctx.textAlign = 'left';
      ctx.fillText(app.name, 60, y + 5);
      
      ctx.textAlign = 'right';
      ctx.fillStyle = app.color;
      ctx.fillText(app.usage, canvas.width - 60, y + 5);
    });
  };

  const drawRestartScreen = (ctx, canvas) => {
    ctx.fillStyle = 'white';
    ctx.font = 'bold 42px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('⚡ Power Options', canvas.width/2, 180);

    const options = [
      { icon: '🔄', name: 'Restart', description: 'Recommended for battery issues' },
      { icon: '⏽️', name: 'Power Off', description: 'Turn off device completely' },
      { icon: '😴', name: 'Sleep Mode', description: 'Low power standby mode' }
    ];

    options.forEach((option, index) => {
      const y = 350 + index * 150;
      
      ctx.fillStyle = index === 0 ? 'rgba(0, 255, 136, 0.3)' : 'rgba(255, 255, 255, 0.1)';
      ctx.beginPath();
      if (ctx.roundRect) {
        ctx.roundRect(40, y - 50, canvas.width - 80, 120, 15);
      } else {
        ctx.rect(40, y - 50, canvas.width - 80, 120);
      }
      ctx.fill();

      if (index === 0) {
        ctx.strokeStyle = 'rgba(0, 255, 136, 0.8)';
        ctx.lineWidth = 3;
        ctx.stroke();
      }

      ctx.fillStyle = 'white';
      ctx.font = '48px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(option.icon, canvas.width/2, y - 5);
      
      ctx.font = 'bold 28px Arial';
      ctx.fillText(option.name, canvas.width/2, y + 35);
      
      ctx.font = '20px Arial';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.fillText(option.description, canvas.width/2, y + 65);
    });
  };

  const drawAppIcons = (ctx, canvas) => {
    const iconSize = 80;
    const iconSpacing = 40;
    const iconsPerRow = 4;
    const iconStartX = (canvas.width - (iconsPerRow * iconSize + (iconsPerRow - 1) * iconSpacing)) / 2;
    
    const apps = [
      { emoji: '⚙️', name: 'Settings', color: '#8E8E93', highlight: false },
      { emoji: '🔋', name: 'Battery', color: '#34C759', highlight: true },
      { emoji: '📶', name: 'WiFi', color: '#007AFF', highlight: false },
      { emoji: '💾', name: 'Storage', color: '#FF9500', highlight: false },
      { emoji: '📱', name: 'Phone', color: '#34C759', highlight: false },
      { emoji: '🎵', name: 'Music', color: '#FF2D92', highlight: false },
      { emoji: '📷', name: 'Camera', color: '#8E8E93', highlight: false },
      { emoji: '🌐', name: 'Safari', color: '#007AFF', highlight: false }
    ];

    apps.forEach((app, index) => {
      const row = Math.floor(index / iconsPerRow);
      const col = index % iconsPerRow;
      const x = iconStartX + col * (iconSize + iconSpacing);
      const y = 400 + row * (iconSize + iconSpacing);

      if (app.highlight) {
        ctx.shadowColor = '#00ff88';
        ctx.shadowBlur = 20;
      } else {
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
      }

      ctx.fillStyle = app.color;
      ctx.beginPath();
      if (ctx.roundRect) {
        ctx.roundRect(x, y, iconSize, iconSize, 18);
      } else {
        ctx.rect(x, y, iconSize, iconSize);
      }
      ctx.fill();

      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;

      ctx.font = '40px Arial';
      ctx.textAlign = 'center';
      ctx.fillStyle = 'white';
      ctx.fillText(app.emoji, x + iconSize/2, y + iconSize/2 + 10);

      ctx.font = '16px -apple-system, BlinkMacSystemFont, Arial';
      ctx.fillStyle = app.highlight ? '#00ff88' : 'rgba(255, 255, 255, 0.9)';
      ctx.fillText(app.name, x + iconSize/2, y + iconSize + 20);
    });
  };

  // CREATE ENHANCED 3D PHONE MODEL
  const createEnhancedPhoneModel = useCallback(() => {
    const phoneGroup = new THREE.Group();

    // Main phone body - larger size for better visibility
    const bodyGeometry = new THREE.BoxGeometry(2.5, 5.0, 0.25);
    const bodyMaterial = new THREE.MeshPhysicalMaterial({ 
      color: 0x2a2a2a,
      metalness: 0.9,
      roughness: 0.1,
      clearcoat: 1.0,
      clearcoatRoughness: 0.05
    });
    const phoneBody = new THREE.Mesh(bodyGeometry, bodyMaterial);
    phoneBody.castShadow = true;
    phoneBody.receiveShadow = true;
    phoneGroup.add(phoneBody);

    // Screen with dynamic content - larger screen
    const screenGeometry = new THREE.BoxGeometry(2.2, 4.5, 0.02);
    const screenMaterial = new THREE.MeshBasicMaterial({ 
      map: createDynamicPhoneScreen('home'),
      transparent: true,
      opacity: 0.95
    });
    const screen = new THREE.Mesh(screenGeometry, screenMaterial);
    screen.position.z = 0.14;
    screen.userData = { type: 'screen', material: screenMaterial };
    phoneGroup.add(screen);

    // Camera module
    const cameraModuleGeometry = new THREE.BoxGeometry(0.5, 0.25, 0.06);
    const cameraModuleMaterial = new THREE.MeshPhysicalMaterial({ 
      color: 0x1a1a1a,
      metalness: 0.8,
      roughness: 0.2
    });
    const cameraModule = new THREE.Mesh(cameraModuleGeometry, cameraModuleMaterial);
    cameraModule.position.set(-0.8, 2.0, -0.15);
    phoneGroup.add(cameraModule);

    // Camera lenses
    const lensPositions = [[-0.85, 2.1, -0.12], [-0.75, 2.1, -0.12], [-0.85, 1.9, -0.12]];
    lensPositions.forEach(pos => {
      const lensGeometry = new THREE.CylinderGeometry(0.04, 0.04, 0.02, 16);
      const lensMaterial = new THREE.MeshPhysicalMaterial({
        color: 0x000000,
        metalness: 0.0,
        roughness: 0.0,
        transmission: 0.9,
        thickness: 0.01,
        ior: 1.5
      });
      const lens = new THREE.Mesh(lensGeometry, lensMaterial);
      lens.position.set(...pos);
      lens.rotation.x = Math.PI / 2;
      phoneGroup.add(lens);
    });

    // Interactive buttons
    const buttonMaterial = new THREE.MeshPhysicalMaterial({ 
      color: 0x666666,
      metalness: 0.7,
      roughness: 0.3
    });

    // Power button
    const powerGeometry = new THREE.BoxGeometry(0.05, 0.3, 0.08);
    const powerButton = new THREE.Mesh(powerGeometry, buttonMaterial);
    powerButton.position.set(1.3, 1.2, 0);
    powerButton.userData = { type: 'power_button' };
    phoneGroup.add(powerButton);

    // Volume buttons
    const volumeGeometry = new THREE.BoxGeometry(0.05, 0.25, 0.06);
    const volumeUp = new THREE.Mesh(volumeGeometry, buttonMaterial);
    volumeUp.position.set(-1.3, 1.0, 0);
    volumeUp.userData = { type: 'volume_up' };
    phoneGroup.add(volumeUp);
    
    const volumeDown = new THREE.Mesh(volumeGeometry, buttonMaterial);
    volumeDown.position.set(-1.3, 0.5, 0);
    volumeDown.userData = { type: 'volume_down' };
    phoneGroup.add(volumeDown);

    // Home button
    const homeGeometry = new THREE.CylinderGeometry(0.18, 0.18, 0.05, 32);
    const homeButton = new THREE.Mesh(homeGeometry, buttonMaterial);
    homeButton.position.set(0, -2.0, 0.15);
    homeButton.rotation.x = Math.PI / 2;
    homeButton.userData = { type: 'home_button' };
    phoneGroup.add(homeButton);

    return phoneGroup;
  }, [createDynamicPhoneScreen]);

  // CREATE AR OVERLAYS
  const createSmoothAROverlay = useCallback(() => {
    const overlayGroup = new THREE.Group();

    // Progress ring positioned away from phone
    const progressRing = createProgressRing();
    progressRing.position.set(4.5, 2.5, 0);
    overlayGroup.add(progressRing);

    // Component highlight
    const componentHighlight = createComponentHighlight();
    overlayGroup.add(componentHighlight);

    return overlayGroup;
  }, [currentStep, stepProgress, totalSteps]);

  const createProgressRing = () => {
    const group = new THREE.Group();
    
    // Background ring
    const bgGeometry = new THREE.RingGeometry(0.3, 0.35, 64);
    const bgMaterial = new THREE.MeshBasicMaterial({ 
      color: 0x333333, 
      transparent: true, 
      opacity: 0.4,
      side: THREE.DoubleSide
    });
    const bgRing = new THREE.Mesh(bgGeometry, bgMaterial);
    group.add(bgRing);
    
    // Progress ring
    const progress = (currentStep + stepProgress / 100) / totalSteps;
    const progressGeometry = new THREE.RingGeometry(0.3, 0.35, 64, 1, 0, progress * Math.PI * 2);
    const progressMaterial = new THREE.MeshBasicMaterial({ 
      color: progress < 0.5 ? 0xff6b6b : progress < 0.8 ? 0xffd93d : 0x6bcf7f,
      transparent: true,
      opacity: 0.9,
      side: THREE.DoubleSide
    });
    const progressRing = new THREE.Mesh(progressGeometry, progressMaterial);
    group.add(progressRing);
    
    // Center text
    const canvas = document.createElement('canvas');
    canvas.width = 200;
    canvas.height = 200;
    const ctx = canvas.getContext('2d');
    
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 60px Arial';
    ctx.textAlign = 'center';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = 4;
    ctx.fillText(`${currentStep + 1}`, canvas.width/2, canvas.height/2 - 10);
    
    ctx.font = 'bold 30px Arial';
    ctx.fillText(`of ${totalSteps}`, canvas.width/2, canvas.height/2 + 30);
    
    const textTexture = new THREE.CanvasTexture(canvas);
    const textMaterial = new THREE.MeshBasicMaterial({ map: textTexture, transparent: true });
    const textGeometry = new THREE.PlaneGeometry(0.5, 0.5);
    const textMesh = new THREE.Mesh(textGeometry, textMaterial);
    
    group.add(textMesh);
    group.userData = { type: 'progress_ring', progressRing, bgRing };
    
    return group;
  };

  const createComponentHighlight = () => {
    const group = new THREE.Group();
    const targetPos = getStepTargetPosition();
    
    // Highlight ring
    const ringGeometry = new THREE.RingGeometry(0.25, 0.3, 32);
    const ringMaterial = new THREE.MeshBasicMaterial({
      color: 0x00ff88,
      transparent: true,
      opacity: 0.6,
      side: THREE.DoubleSide
    });
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    group.add(ring);
    
    // Pulse effect
    const pulseGeometry = new THREE.CircleGeometry(0.2, 32);
    const pulseMaterial = new THREE.MeshBasicMaterial({
      color: 0x00ff88,
      transparent: true,
      opacity: 0.4
    });
    const pulse = new THREE.Mesh(pulseGeometry, pulseMaterial);
    group.add(pulse);
    
    group.position.copy(targetPos);
    group.userData = { type: 'component_highlight', ring, pulse };
    
    return group;
  };

  // GET TARGET POSITION FOR STEPS
  const getStepTargetPosition = () => {
    if (!currentStepData) return new THREE.Vector3(0, 0, 0.2);
    
    const title = currentStepData.title.toLowerCase();
    
    if (title.includes('battery') || title.includes('usage')) {
      return new THREE.Vector3(0.5, -0.6, 0.2);
    }
    if (title.includes('settings')) {
      return new THREE.Vector3(-0.5, -0.6, 0.2);
    }
    if (title.includes('restart') || title.includes('power')) {
      return new THREE.Vector3(1.3, 1.2, 0);
    }
    if (title.includes('app') || title.includes('close')) {
      return new THREE.Vector3(0, -2.0, 0.2);
    }
    
    return new THREE.Vector3(0, 0, 0.2);
  };

  // INITIALIZE AR SCENE
  const initializeARScene = () => {
    try {
      console.log('🎯 Initializing smooth AR scene...');
      
      const container = containerRef.current;
      if (!container) throw new Error('No container');
      
      // Scene setup
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0x000a1a);
      sceneRef.current = scene;

      // Camera setup - positioned for full phone view
      const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
      camera.position.set(0, 0, 10);
      camera.lookAt(0, 0, 0);
      cameraRef.current = camera;

      // Renderer setup
      const renderer = new THREE.WebGLRenderer({ 
        antialias: true,
        alpha: true,
        powerPreference: "high-performance"
      });
      renderer.setSize(container.clientWidth, container.clientHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      
      container.innerHTML = '';
      container.appendChild(renderer.domElement);
      rendererRef.current = renderer;

      // Lighting setup
      setupLighting(scene);

      // Create phone model
      const phoneModel = createEnhancedPhoneModel();
      phoneModel.position.set(0, 0, 0);
      phoneModel.rotation.x = -0.1;
      phoneModel.scale.set(1, 1, 1);
      scene.add(phoneModel);
      phoneModelRef.current = phoneModel;

      // Create AR overlays
      const arOverlays = createSmoothAROverlay();
      scene.add(arOverlays);
      arElementsRef.current.push(arOverlays);

      // Start animation
      startSmoothAnimation();

      setIs3DReady(true);
      setIsLoading(false);
      
      console.log('✅ Smooth AR scene initialized successfully!');

    } catch (error) {
      console.error('💥 AR initialization failed:', error);
      setIsLoading(false);
      createFallbackView();
    }
  };

  // LIGHTING SETUP
  const setupLighting = (scene) => {
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    scene.add(ambientLight);

    // Main directional light
    const keyLight = new THREE.DirectionalLight(0xffffff, 1.2);
    keyLight.position.set(5, 5, 5);
    keyLight.castShadow = true;
    scene.add(keyLight);

    // Fill light
    const fillLight = new THREE.DirectionalLight(0x87ceeb, 0.4);
    fillLight.position.set(-3, 2, 4);
    scene.add(fillLight);

    // AR accent light
    const arLight = new THREE.PointLight(0x00ff88, 0.5, 10);
    arLight.position.set(2, 2, 2);
    scene.add(arLight);
  };

  // SMOOTH ANIMATION SYSTEM
  const startSmoothAnimation = () => {
    console.log('🎬 Starting smooth animation system...');
    
    const animate = () => {
      if (!rendererRef.current || !sceneRef.current || !cameraRef.current) return;

      const deltaTime = clockRef.current.getDelta();
      animationState.current.time += deltaTime;

      // Smooth phone rotation and movement
      if (phoneModelRef.current) {
        // Continuous smooth rotation
        animationState.current.phoneRotationY += deltaTime * 0.5;
        phoneModelRef.current.rotation.y = animationState.current.phoneRotationY;
        
        // Gentle X rotation with sine wave
        animationState.current.phoneRotationX = -0.1 + Math.sin(animationState.current.time * 0.8) * 0.05;
        phoneModelRef.current.rotation.x = animationState.current.phoneRotationX;
        
        // Floating Y movement
        animationState.current.phonePositionY = Math.sin(animationState.current.time * 1.2) * 0.1;
        phoneModelRef.current.position.y = animationState.current.phonePositionY;
      }

      // Animate AR elements
      arElementsRef.current.forEach(arGroup => {
        arGroup.children.forEach(element => {
          animateARElement(element, animationState.current.time, deltaTime);
        });
      });

      // Update screen content
      updatePhoneScreen();

      // Render the scene
      rendererRef.current.render(sceneRef.current, cameraRef.current);
      
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();
  };

  // ANIMATE AR ELEMENTS
  const animateARElement = (element, time, deltaTime) => {
    const userData = element.userData;
    
    switch (userData.type) {
      case 'progress_ring':
        // Smooth rotation
        element.rotation.z += deltaTime * 0.8;
        
        // Update progress ring geometry
        if (userData.progressRing) {
          const targetProgress = (currentStep + stepProgress / 100) / totalSteps;
          const currentGeometry = userData.progressRing.geometry;
          currentGeometry.dispose();
          
          userData.progressRing.geometry = new THREE.RingGeometry(
            0.3, 0.35, 64, 1, 0, targetProgress * Math.PI * 2
          );
          
          // Update color based on progress
          const progress = targetProgress;
          const color = progress < 0.5 ? 0xff6b6b : progress < 0.8 ? 0xffd93d : 0x6bcf7f;
          userData.progressRing.material.color.setHex(color);
        }
        break;

      case 'component_highlight':
        // Pulsing animation
        if (userData.ring) {
          const scale = 1 + Math.sin(time * 4) * 0.15;
          userData.ring.scale.setScalar(scale);
          userData.ring.rotation.z += deltaTime * 1.0;
        }
        
        if (userData.pulse) {
          const pulseScale = 1 + Math.sin(time * 6) * 0.25;
          userData.pulse.scale.setScalar(pulseScale);
          userData.pulse.material.opacity = 0.4 + Math.sin(time * 6) * 0.2;
        }
        break;

      default:
        // Generic gentle rotation
        element.rotation.y += deltaTime * 0.3;
    }
  };

  // UPDATE PHONE SCREEN
  const updatePhoneScreen = () => {
    if (!phoneModelRef.current || !currentStepData) return;

    const screen = phoneModelRef.current.children.find(child => 
      child.userData && child.userData.type === 'screen'
    );

    if (screen) {
      const title = currentStepData.title.toLowerCase();
      let screenType = 'home';

      if (title.includes('settings')) screenType = 'settings';
      else if (title.includes('battery')) screenType = 'battery';
      else if (title.includes('restart') || title.includes('power')) screenType = 'restart';

      // Only update if screen type changed
      if (screen.userData.currentScreenType !== screenType) {
        const newTexture = createDynamicPhoneScreen(screenType);
        screen.userData.material.map = newTexture;
        screen.userData.material.needsUpdate = true;
        screen.userData.currentScreenType = screenType;
      }
    }
  };

  // STEP PROGRESSION
  useEffect(() => {
    if (!isPlaying || !currentStepData || isCompleted) return;

    const duration = currentStepData.duration || 5000;
    let elapsed = 0;
    const interval = 50;
    
    stepTimerRef.current = setInterval(() => {
      elapsed += interval;
      const progress = Math.min((elapsed / duration) * 100, 100);
      setStepProgress(progress);
      
      if (elapsed >= duration) {
        clearInterval(stepTimerRef.current);
        handleStepCompletion();
      }
    }, interval);

    return () => {
      if (stepTimerRef.current) {
        clearInterval(stepTimerRef.current);
      }
    };
  }, [currentStep, isPlaying, isCompleted]);

  // UPDATE AR ELEMENTS WHEN STEP CHANGES
  useEffect(() => {
    if (is3DReady && sceneRef.current && arElementsRef.current.length > 0) {
      // Remove old AR elements
      arElementsRef.current.forEach(element => {
        sceneRef.current.remove(element);
        element.traverse((child) => {
          if (child.geometry) child.geometry.dispose();
          if (child.material) {
            if (Array.isArray(child.material)) {
              child.material.forEach(material => material.dispose());
            } else {
              child.material.dispose();
            }
          }
        });
      });
      arElementsRef.current = [];

      // Create new AR elements
      const newAROverlays = createSmoothAROverlay();
      sceneRef.current.add(newAROverlays);
      arElementsRef.current.push(newAROverlays);
    }
  }, [currentStep, is3DReady, createSmoothAROverlay]);

  // STEP COMPLETION HANDLER
  const handleStepCompletion = useCallback(() => {
    if (currentStep < totalSteps - 1) {
      const nextStep = currentStep + 1;
      console.log(`➡️ Moving to step ${nextStep + 1}`);
      
      setCurrentStep(nextStep);
      setStepProgress(0);
      
      if (onStepComplete) onStepComplete(nextStep);
      
      if (isVoiceEnabled && instructions.steps[nextStep]) {
        setTimeout(() => {
          voiceGuidance.speak(`Step ${nextStep + 1}. ${instructions.steps[nextStep].title}`);
        }, 500);
      }
    } else {
      console.log('🎉 All steps completed!');
      setIsCompleted(true);
      setIsPlaying(false);
      
      if (onInstructionComplete) onInstructionComplete();
      
      if (isVoiceEnabled) {
        setTimeout(() => {
          voiceGuidance.speak(`Congratulations! All troubleshooting steps completed successfully!`);
        }, 500);
      }
    }
  }, [currentStep, totalSteps, isVoiceEnabled, onStepComplete, onInstructionComplete]);

  // CONTROL HANDLERS
  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
    if (!isPlaying && isVoiceEnabled && currentStepData) {
      voiceGuidance.speak(`Step ${currentStep + 1}. ${currentStepData.title}`);
    }
  };

  const handleNextStep = () => {
    if (stepTimerRef.current) clearInterval(stepTimerRef.current);
    handleStepCompletion();
  };

  const handlePrevStep = () => {
    if (currentStep > 0 && !isCompleted) {
      if (stepTimerRef.current) clearInterval(stepTimerRef.current);
      setCurrentStep(currentStep - 1);
      setStepProgress(0);
    }
  };

  const handleRestart = () => {
    if (stepTimerRef.current) clearInterval(stepTimerRef.current);
    setCurrentStep(0);
    setIsCompleted(false);
    setStepProgress(0);
  };

  const toggleVoice = () => {
    setIsVoiceEnabled(!isVoiceEnabled);
    if (!isVoiceEnabled) {
      voiceGuidance.speak("Voice guidance activated");
    } else {
      voiceGuidance.stop();
    }
  };

  // FALLBACK VIEW
  const createFallbackView = () => {
    const container = containerRef.current;
    if (!container) return;

    container.innerHTML = `
      <div style="
        width: 100%; 
        height: 100%; 
        background: linear-gradient(135deg, #667eea, #764ba2);
        display: flex; 
        flex-direction: column;
        align-items: center; 
        justify-content: center;
        color: white;
        font-family: -apple-system, BlinkMacSystemFont, Arial;
        text-align: center;
        padding: 20px;
      ">
        <div style="font-size: 72px; margin-bottom: 20px;">📱</div>
        <h2 style="font-size: 32px; margin-bottom: 16px; font-weight: bold;">
          AR System Active
        </h2>
        <p style="font-size: 18px; margin-bottom: 24px; opacity: 0.9;">
          Enhanced mobile troubleshooting guide ready
        </p>
        <div style="
          background: rgba(255,255,255,0.2);
          padding: 16px 24px;
          border-radius: 12px;
          backdrop-filter: blur(10px);
        ">
          Step ${currentStep + 1} of ${totalSteps}: ${currentStepData?.title || 'Loading...'}
        </div>
      </div>
    `;
    
    setIs3DReady(true);
    setIsLoading(false);
  };

  // CLEANUP
  const cleanup = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    if (stepTimerRef.current) {
      clearInterval(stepTimerRef.current);
    }
    
    if (rendererRef.current && containerRef.current) {
      try {
        containerRef.current.removeChild(rendererRef.current.domElement);
        rendererRef.current.dispose();
      } catch (e) {
        console.log('Cleanup completed');
      }
    }
    voiceGuidance.stop();
  };

  // HANDLE WINDOW RESIZE
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current && rendererRef.current && cameraRef.current) {
        const width = containerRef.current.clientWidth;
        const height = containerRef.current.clientHeight;
        
        cameraRef.current.aspect = width / height;
        cameraRef.current.updateProjectionMatrix();
        rendererRef.current.setSize(width, height);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!validInstructions) {
    return (
      <div className="w-full h-screen bg-red-500 flex items-center justify-center text-white text-2xl font-bold">
        ❌ NO VALID INSTRUCTIONS PROVIDED
      </div>
    );
  }

  return (
    <div className="relative w-full h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 overflow-hidden">
      {/* Loading Screen */}
      {isLoading && (
        <div className="absolute inset-0 bg-black/95 flex items-center justify-center z-50">
          <div className="text-center text-white">
            <div className="text-8xl mb-6 animate-bounce">📱</div>
            <h2 className="text-4xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Initializing AR Experience
            </h2>
            <div className="relative w-32 h-32 mx-auto mb-6">
              <div className="absolute inset-0 border-4 border-blue-500/30 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-transparent border-t-blue-500 rounded-full animate-spin"></div>
            </div>
            <p className="text-lg text-blue-200">
              Creating smooth 3D phone model with animations...
            </p>
          </div>
        </div>
      )}

      {/* Main AR Canvas - Full Screen for phone visibility */}
      <div
        ref={containerRef}
        className="w-full h-full"
        style={{ 
          background: 'transparent',
          minHeight: '100vh',
          minWidth: '100vw'
        }}
      />

      {/* Status Indicators - Top Left */}
      <div className="absolute top-4 left-4 z-50 space-y-2">
        <div className="bg-gradient-to-r from-emerald-500 to-green-600 text-white px-4 py-2 rounded-xl font-bold shadow-xl border border-emerald-400/50">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-300 rounded-full animate-pulse"></div>
            <span>AR: {is3DReady ? '✅ ACTIVE' : '⏳ Loading'}</span>
          </div>
        </div>
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-xl font-bold shadow-xl border border-blue-400/50">
          <div className="flex items-center gap-2">
            <Smartphone className="w-4 h-4" />
            <span>3D Model: {phoneModelRef.current ? '📱 Ready' : '❌ Loading'}</span>
          </div>
        </div>
      </div>

      {/* Control Panel - Bottom Center - Away from phone */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-50">
        <div className="bg-gradient-to-r from-slate-800/95 via-blue-900/95 to-slate-800/95 backdrop-blur-xl rounded-3xl shadow-2xl p-6 border border-blue-400/30 min-w-[32rem]">
          
          {/* Step Information */}
          <div className="text-center mb-6">
            <div className="flex items-center justify-center gap-3 mb-3">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl shadow-lg">
                <Smartphone className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white">
                {currentStepData?.title || 'Loading Step...'}
              </h3>
              <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl shadow-lg animate-pulse">
                <Zap className="w-4 h-4 text-white" />
              </div>
            </div>
            
            <p className="text-blue-200 mb-3 px-4">
              {currentStepData?.description || 'Preparing AR instructions...'}
            </p>
            
            {/* Progress Bar */}
            <div className="relative w-full h-4 bg-slate-800 rounded-full overflow-hidden mb-2 border border-blue-400/30 shadow-inner">
              <div 
                className="relative h-full bg-gradient-to-r from-emerald-400 via-blue-500 to-purple-600 transition-all duration-300 rounded-full"
                style={{ width: `${stepProgress}%` }}
              >
                <div className="absolute inset-0 bg-white/20 rounded-full"></div>
              </div>
            </div>
            
            <div className="text-sm text-blue-300 font-medium">
              {Math.round(stepProgress)}% Complete • Step {currentStep + 1} of {totalSteps}
              {isCompleted && <span className="ml-2 text-green-400 font-bold">🎉 COMPLETED!</span>}
            </div>
          </div>

          {/* Control Buttons */}
          <div className="flex items-center justify-center gap-4">
            <Button 
              onClick={handleRestart} 
              className="bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white rounded-full p-3 shadow-xl hover:scale-105 transition-all duration-200 border border-slate-500/50" 
              size="sm" 
              title="Restart"
            >
              <RotateCcw className="w-5 h-5" />
            </Button>
            
            <Button 
              onClick={handlePrevStep} 
              disabled={currentStep === 0} 
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-full p-3 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl hover:scale-105 transition-all duration-200 border border-blue-500/50" 
              size="sm" 
              title="Previous"
            >
              <SkipBack className="w-5 h-5" />
            </Button>
            
            <Button 
              onClick={handlePlayPause} 
              className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white rounded-full p-6 shadow-2xl transform hover:scale-110 transition-all duration-300 border-2 border-emerald-400/50" 
              title={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8" />}
            </Button>
            
            <Button 
              onClick={handleNextStep} 
              disabled={isCompleted} 
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-full p-3 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl hover:scale-105 transition-all duration-200 border border-blue-500/50" 
              size="sm" 
              title="Next"
            >
              <SkipForward className="w-5 h-5" />
            </Button>
            
            <Button 
              onClick={toggleVoice} 
              className={`rounded-full p-3 shadow-xl hover:scale-105 transition-all duration-200 border ${
                isVoiceEnabled 
                  ? 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 border-orange-400/50' 
                  : 'bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 border-slate-500/50'
              } text-white`} 
              size="sm" 
              title={isVoiceEnabled ? "Disable voice" : "Enable voice"}
            >
              {isVoiceEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Step Progress Sidebar - Right Side */}
      <div className="absolute right-6 top-1/2 transform -translate-y-1/2 z-50">
        <div className="bg-gradient-to-b from-slate-800/95 via-blue-900/95 to-slate-800/95 backdrop-blur-xl rounded-2xl shadow-2xl p-4 border border-blue-400/30 max-w-xs">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
              <Smartphone className="w-4 h-4 text-white" />
            </div>
            <h4 className="text-lg font-bold text-white">Progress</h4>
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          </div>
          
          <div className="space-y-3">
            {instructions.steps.map((step, index) => (
              <div
                key={step.id || index}
                className={`flex items-center gap-3 cursor-pointer p-3 rounded-xl transition-all duration-300 hover:bg-blue-800/30 ${
                  index === currentStep 
                    ? 'bg-blue-600/50 border border-blue-400 shadow-lg' 
                    : index < currentStep || isCompleted
                    ? 'bg-green-600/40 border border-green-400/50'
                    : 'bg-slate-800/60 border border-slate-600/50 hover:border-blue-500/50'
                }`}
                onClick={() => {
                  if (!isCompleted && index !== currentStep) {
                    if (stepTimerRef.current) clearInterval(stepTimerRef.current);
                    setCurrentStep(index);
                    setStepProgress(0);
                  }
                }}
              >
                <div className="flex-shrink-0">
                  {index < currentStep || isCompleted ? (
                    <CheckCircle className="w-5 h-5 text-green-400" />
                  ) : index === currentStep ? (
                    <Target className="w-5 h-5 text-blue-400 animate-pulse" />
                  ) : (
                    <Circle className="w-5 h-5 text-slate-400" />
                  )}
                </div>
                
                <div className="min-w-0 flex-1">
                  <span className={`text-sm font-semibold block truncate ${
                    index === currentStep 
                      ? 'text-blue-200' 
                      : index < currentStep || isCompleted
                      ? 'text-green-200'
                      : 'text-slate-400'
                  }`}>
                    {step.title}
                  </span>
                  
                  {index === currentStep && !isCompleted && (
                    <div className="w-full h-1 bg-blue-900/50 rounded-full mt-1 overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-blue-400 to-green-400 transition-all duration-300 rounded-full"
                        style={{ width: `${stepProgress}%` }}
                      />
                    </div>
                  )}
                </div>
                
                <div className={`text-xs font-bold px-2 py-1 rounded-full ${
                  index === currentStep 
                    ? 'bg-blue-500 text-white' 
                    : index < currentStep || isCompleted
                    ? 'bg-green-500 text-white'
                    : 'bg-slate-600 text-slate-300'
                }`}>
                  {index + 1}
                </div>
              </div>
            ))}
          </div>
          
          {/* Problem summary */}
          <div className="mt-4 p-3 bg-gradient-to-r from-purple-600/30 to-pink-600/30 rounded-xl border border-purple-400/30">
            <div className="flex items-center gap-2 mb-1">
              <Battery className="w-4 h-4 text-purple-400" />
              <span className="text-sm font-semibold text-purple-200">Issue:</span>
            </div>
            <span className="text-sm text-white font-medium">
              {selectedProblem?.replace('_', ' ').toUpperCase() || 'BATTERY ISSUE'}
            </span>
          </div>
        </div>
      </div>

      {/* Voice Status Indicator - Bottom Left */}
      {isVoiceEnabled && (
        <div className="absolute bottom-8 left-6 z-50 bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 rounded-full shadow-xl animate-pulse border border-orange-400/50">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Volume2 className="w-4 h-4" />
            <span>Voice Active</span>
          </div>
        </div>
      )}

      {/* Completion Celebration */}
      {isCompleted && (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-gradient-to-br from-emerald-900 via-green-800 to-emerald-900 rounded-3xl p-8 text-center shadow-2xl transform scale-105 animate-pulse border-2 border-emerald-400/50 max-w-xl">
            <div className="text-6xl mb-4 animate-bounce">🎉📱✅</div>
            
            <h2 className="text-3xl font-bold text-white mb-3">
              <span className="bg-gradient-to-r from-emerald-400 to-green-300 bg-clip-text text-transparent">
                Phone Optimized!
              </span>
            </h2>
            
            <div className="bg-emerald-800/50 rounded-2xl p-4 mb-4 border border-emerald-400/30">
              <p className="text-emerald-200 mb-2">
                ✅ Completed all <strong className="text-white">{totalSteps} steps</strong> for:
              </p>
              <div className="text-xl font-bold text-white bg-gradient-to-r from-emerald-600 to-green-600 px-3 py-2 rounded-xl">
                {selectedProblem?.replace('_', ' ').toUpperCase() || 'BATTERY OPTIMIZATION'}
              </div>
            </div>
            
            <p className="text-emerald-300 mb-4">
              Your phone should now be performing optimally! 🚀
            </p>
            
            <div className="flex gap-4 justify-center">
              <Button 
                onClick={handleRestart} 
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-2xl flex items-center gap-2 font-semibold shadow-xl hover:scale-105 transition-all duration-200"
              >
                <RotateCcw className="w-5 h-5" />
                Fix Another Issue
              </Button>
              
              <Button 
                onClick={() => setIsCompleted(false)} 
                className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white px-6 py-3 rounded-2xl flex items-center gap-2 font-semibold shadow-xl hover:scale-105 transition-all duration-200"
              >
                <Settings className="w-5 h-5" />
                Review Steps
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Performance Monitor - Bottom Right */}
      <div className="absolute bottom-4 right-4 z-40 bg-black/70 text-white px-3 py-2 rounded-xl text-xs border border-gray-600 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <span>🎯 AR: <span className={isLoading ? 'text-yellow-400' : 'text-green-400'}>{isLoading ? 'Loading' : 'Active'}</span></span>
          <span>🔊: <span className={isVoiceEnabled ? 'text-green-400' : 'text-red-400'}>{isVoiceEnabled ? 'ON' : 'OFF'}</span></span>
          <span>📱: <span className={phoneModelRef.current ? 'text-green-400' : 'text-yellow-400'}>{phoneModelRef.current ? 'Ready' : 'Loading'}</span></span>
        </div>
      </div>
    </div>
  );
};

export default ARCanvas;