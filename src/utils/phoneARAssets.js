// src/utils/phoneARAssets.js - Enhanced Phone AR Assets & Detection
import * as THREE from 'three';

export class PhoneARAssets {
  constructor() {
    this.phoneModels = new Map();
    this.animatedObjects = new Map();
    this.currentAnimations = [];
  }

  // Create realistic 3D phone model
  createPhoneModel(detectedObject) {
    const phoneGroup = new THREE.Group();
    
    // Phone body
    const bodyGeometry = new THREE.BoxGeometry(0.16, 0.32, 0.008);
    const bodyMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x1a1a1a,
      metalness: 0.8,
      roughness: 0.2,
      clearcoat: 1.0
    });
    const phoneBody = new THREE.Mesh(bodyGeometry, bodyMaterial);
    phoneGroup.add(phoneBody);

    // Screen
    const screenGeometry = new THREE.BoxGeometry(0.14, 0.28, 0.002);
    const screenMaterial = new THREE.MeshBasicMaterial({ color: 0x000033 });
    const screen = new THREE.Mesh(screenGeometry, screenMaterial);
    screen.position.z = 0.005;
    phoneGroup.add(screen);

    // Screen content
    const contentTexture = this.createPhoneScreenTexture();
    const contentMaterial = new THREE.MeshBasicMaterial({ 
      map: contentTexture,
      transparent: true,
      opacity: 0.9
    });
    const screenContent = new THREE.Mesh(new THREE.PlaneGeometry(0.13, 0.26), contentMaterial);
    screenContent.position.z = 0.006;
    phoneGroup.add(screenContent);

    // Camera module
    const cameraGeometry = new THREE.BoxGeometry(0.04, 0.06, 0.004);
    const cameraMaterial = new THREE.MeshLambertMaterial({ color: 0x333333 });
    const camera = new THREE.Mesh(cameraGeometry, cameraMaterial);
    camera.position.set(-0.05, 0.1, -0.006);
    phoneGroup.add(camera);

    // Power button
    const powerGeometry = new THREE.BoxGeometry(0.008, 0.04, 0.003);
    const powerMaterial = new THREE.MeshLambertMaterial({ color: 0x666666 });
    const powerButton = new THREE.Mesh(powerGeometry, powerMaterial);
    powerButton.position.set(0.084, 0.05, 0);
    phoneGroup.add(powerButton);

    // Volume buttons
    const volumeGeometry = new THREE.BoxGeometry(0.008, 0.03, 0.002);
    const volumeMaterial = new THREE.MeshLambertMaterial({ color: 0x666666 });
    const volumeUp = new THREE.Mesh(volumeGeometry, volumeMaterial);
    volumeUp.position.set(-0.084, 0.08, 0);
    phoneGroup.add(volumeUp);
    
    const volumeDown = new THREE.Mesh(volumeGeometry, volumeMaterial);
    volumeDown.position.set(-0.084, 0.04, 0);
    phoneGroup.add(volumeDown);

    // Home button
    const homeGeometry = new THREE.CylinderGeometry(0.015, 0.015, 0.002, 32);
    const homeMaterial = new THREE.MeshLambertMaterial({ color: 0x444444 });
    const homeButton = new THREE.Mesh(homeGeometry, homeMaterial);
    homeButton.position.set(0, -0.13, 0.005);
    homeButton.rotation.x = Math.PI / 2;
    phoneGroup.add(homeButton);

    phoneGroup.position.set(0, 0, 0);
    phoneGroup.rotation.x = -0.2;
    phoneGroup.userData = {
      deviceType: 'mobile_phone',
      model: detectedObject?.deviceModel || 'Smartphone'
    };

    return phoneGroup;
  }

  // Create phone screen texture
  createPhoneScreenTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');

    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#1e3a8a');
    gradient.addColorStop(0.5, '#3b82f6');
    gradient.addColorStop(1, '#1e40af');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Status bar
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.font = 'bold 28px Arial';
    ctx.fillText('📶 5G    🔋 85%    12:34', 30, 50);

    // Title
    ctx.fillStyle = 'white';
    ctx.font = 'bold 36px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('HoloHelp Diagnostics', canvas.width/2, 150);

    // App icons
    const apps = [
      { emoji: '⚙️', name: 'Settings', pos: [128, 220] },
      { emoji: '🔋', name: 'Battery', pos: [384, 220] },
      { emoji: '📶', name: 'WiFi', pos: [128, 350] },
      { emoji: '🌡️', name: 'Monitor', pos: [384, 350] },
      { emoji: '💾', name: 'Storage', pos: [128, 480] },
      { emoji: '🔧', name: 'Tools', pos: [384, 480] }
    ];

    apps.forEach(app => {
      // App background
      ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.fillRect(app.pos[0] - 50, app.pos[1] - 50, 100, 100);
      
      // App emoji
      ctx.font = '48px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(app.emoji, app.pos[0], app.pos[1] + 10);
      
      // App name
      ctx.font = '20px Arial';
      ctx.fillStyle = 'white';
      ctx.fillText(app.name, app.pos[0], app.pos[1] + 65);
    });

    // Problem indicators
    ctx.fillStyle = 'rgba(255, 0, 0, 0.8)';
    ctx.fillRect(50, 650, canvas.width - 100, 80);
    ctx.fillStyle = 'white';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('⚠️ Diagnostic Mode Active', canvas.width/2, 700);

    return new THREE.CanvasTexture(canvas);
  }

  // Create floating 3D text
  create3DFloatingText(text, options = {}) {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    
    const fontSize = options.fontSize || 48;
    const padding = 20;
    
    context.font = `bold ${fontSize}px Arial, sans-serif`;
    const textWidth = context.measureText(text).width;
    
    canvas.width = textWidth + padding * 2;
    canvas.height = fontSize + padding * 2;
    
    // Background with gradient
    const gradient = context.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, options.backgroundColor || 'rgba(59, 130, 246, 0.95)');
    gradient.addColorStop(1, options.backgroundColorEnd || 'rgba(29, 78, 216, 0.95)');
    context.fillStyle = gradient;
    this.roundRect(context, 0, 0, canvas.width, canvas.height, 15);
    context.fill();
    
    // Border
    context.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    context.lineWidth = 2;
    this.roundRect(context, 1, 1, canvas.width - 2, canvas.height - 2, 14);
    context.stroke();
    
    // Text with shadow
    context.shadowColor = 'rgba(0, 0, 0, 0.5)';
    context.shadowBlur = 4;
    context.shadowOffsetX = 2;
    context.shadowOffsetY = 2;
    
    context.font = `bold ${fontSize}px Arial, sans-serif`;
    context.fillStyle = options.textColor || '#ffffff';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(text, canvas.width / 2, canvas.height / 2);

    const texture = new THREE.CanvasTexture(canvas);
    const material = new THREE.MeshBasicMaterial({ 
      map: texture, 
      transparent: true,
      alphaTest: 0.1
    });
    const geometry = new THREE.PlaneGeometry(
      (canvas.width / canvas.height) * 1.5, 
      1.5
    );
    
    const textMesh = new THREE.Mesh(geometry, material);
    textMesh.userData = {
      type: 'floating_text',
      originalText: text,
      floatSpeed: options.floatSpeed || 1.0
    };
    
    return textMesh;
  }

  // Create enhanced animated arrow
  createEnhancedArrow(position, targetPosition, color = 0x10b981) {
    const arrowGroup = new THREE.Group();

    // Arrow shaft with gradient effect
    const shaftGeometry = new THREE.CylinderGeometry(0.015, 0.015, 0.4, 16);
    const shaftMaterial = new THREE.MeshLambertMaterial({ 
      color: color,
      emissive: color,
      emissiveIntensity: 0.2
    });
    const shaft = new THREE.Mesh(shaftGeometry, shaftMaterial);
    shaft.rotation.z = Math.PI / 2;

    // Arrow head
    const headGeometry = new THREE.ConeGeometry(0.04, 0.15, 16);
    const headMaterial = new THREE.MeshLambertMaterial({ 
      color: color,
      emissive: color,
      emissiveIntensity: 0.3
    });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.x = 0.25;
    head.rotation.z = -Math.PI / 2;

    // Pulsing ring around arrow
    const ringGeometry = new THREE.RingGeometry(0.05, 0.08, 32);
    const ringMaterial = new THREE.MeshBasicMaterial({
      color: color,
      transparent: true,
      opacity: 0.5,
      side: THREE.DoubleSide
    });
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    ring.position.x = 0.25;

    arrowGroup.add(shaft);
    arrowGroup.add(head);
    arrowGroup.add(ring);
    arrowGroup.position.copy(position);

    // Calculate rotation to point at target
    if (targetPosition) {
      const direction = new THREE.Vector3().subVectors(targetPosition, position).normalize();
      const up = new THREE.Vector3(0, 1, 0);
      const quaternion = new THREE.Quaternion().setFromUnitVectors(
        new THREE.Vector3(1, 0, 0), 
        direction
      );
      arrowGroup.setRotationFromQuaternion(quaternion);
    }

    arrowGroup.userData = {
      type: 'enhanced_arrow',
      targetPosition: targetPosition,
      pulseSpeed: 2.0,
      ring: ring
    };

    return arrowGroup;
  }

  // Create holographic highlight
  createHolographicHighlight(position, size = 0.3, color = 0xfbbf24) {
    const highlightGroup = new THREE.Group();

    // Main highlight ring
    const ringGeometry = new THREE.RingGeometry(size * 0.6, size, 64);
    const ringMaterial = new THREE.MeshBasicMaterial({
      color: color,
      transparent: true,
      opacity: 0.7,
      side: THREE.DoubleSide
    });
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);

    // Inner pulsing circle
    const innerGeometry = new THREE.CircleGeometry(size * 0.4, 32);
    const innerMaterial = new THREE.MeshBasicMaterial({
      color: color,
      transparent: true,
      opacity: 0.3,
      side: THREE.DoubleSide
    });
    const inner = new THREE.Mesh(innerGeometry, innerMaterial);

    // Outer expanding ring
    const outerGeometry = new THREE.RingGeometry(size * 1.2, size * 1.4, 64);
    const outerMaterial = new THREE.MeshBasicMaterial({
      color: color,
      transparent: true,
      opacity: 0.2,
      side: THREE.DoubleSide
    });
    const outer = new THREE.Mesh(outerGeometry, outerMaterial);

    highlightGroup.add(ring);
    highlightGroup.add(inner);
    highlightGroup.add(outer);
    highlightGroup.position.copy(position);

    highlightGroup.userData = {
      type: 'holographic_highlight',
      ring: ring,
      inner: inner,
      outer: outer,
      pulseSpeed: 1.5,
      size: size
    };

    return highlightGroup;
  }

  // Create particle burst effect
  createParticleBurst(position, count = 20, color = 0x00ff00) {
    const particleGroup = new THREE.Group();
    const particles = [];

    for (let i = 0; i < count; i++) {
      const particleGeometry = new THREE.SphereGeometry(0.01, 8, 8);
      const particleMaterial = new THREE.MeshBasicMaterial({
        color: color,
        transparent: true,
        opacity: 1.0
      });
      const particle = new THREE.Mesh(particleGeometry, particleMaterial);
      
      // Random direction
      const direction = new THREE.Vector3(
        (Math.random() - 0.5) * 2,
        (Math.random() - 0.5) * 2,
        (Math.random() - 0.5) * 2
      ).normalize();
      
      particle.userData = {
        velocity: direction.multiplyScalar(0.02),
        life: 1.0,
        decay: 0.02
      };
      
      particleGroup.add(particle);
      particles.push(particle);
    }

    particleGroup.position.copy(position);
    particleGroup.userData = {
      type: 'particle_burst',
      particles: particles,
      startTime: performance.now()
    };

    return particleGroup;
  }

  // Update all animations
  updateAnimations() {
    const time = performance.now() * 0.001;

    this.animatedObjects.forEach((obj) => {
      const userData = obj.userData;

      switch (userData.type) {
        case 'floating_text':
          obj.position.y += Math.sin(time * userData.floatSpeed) * 0.002;
          obj.rotation.y += 0.005;
          break;

        case 'enhanced_arrow':
          if (userData.ring) {
            const scale = 1 + Math.sin(time * userData.pulseSpeed) * 0.3;
            userData.ring.scale.setScalar(scale);
            userData.ring.rotation.z += 0.02;
          }
          obj.position.y += Math.sin(time * 2) * 0.01;
          break;

        case 'holographic_highlight':
          const pulseScale = 1 + Math.sin(time * userData.pulseSpeed) * 0.2;
          userData.ring.scale.setScalar(pulseScale);
          userData.inner.scale.setScalar(1 + Math.sin(time * userData.pulseSpeed * 1.5) * 0.3);
          userData.outer.scale.setScalar(1 + Math.sin(time * userData.pulseSpeed * 0.8) * 0.1);
          
          userData.ring.rotation.z += 0.01;
          userData.inner.rotation.z -= 0.02;
          userData.outer.rotation.z += 0.005;
          break;

        case 'particle_burst':
          userData.particles.forEach(particle => {
            particle.position.add(particle.userData.velocity);
            particle.userData.life -= particle.userData.decay;
            particle.material.opacity = particle.userData.life;
            
            if (particle.userData.life <= 0) {
              obj.remove(particle);
            }
          });
          break;
      }
    });
  }

  // Helper function for rounded rectangles
  roundRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  }

  // Add object to animation loop
  addAnimatedObject(object) {
    this.animatedObjects.set(object.uuid, object);
  }

  // Remove object from animation loop
  removeAnimatedObject(object) {
    this.animatedObjects.delete(object.uuid);
  }

  // Clean up all objects
  cleanup() {
    this.animatedObjects.clear();
    this.phoneModels.clear();
    this.currentAnimations = [];
  }
}

export const phoneARAssets = new PhoneARAssets();
export default phoneARAssets;