// Enhanced AR Effects for HoloHelp Phone Diagnostics
import * as THREE from 'three';

export class ARVisualEffects {
  constructor(scene) {
    this.scene = scene;
    this.animatedObjects = new Map();
    this.particleSystems = new Map();
  }

  // Create pulsing highlight ring with enhanced effects
  createPulsingHighlight(position, color = 0xfbbf24) {
    const highlightGroup = new THREE.Group();

    // Main ring
    const geometry = new THREE.RingGeometry(0.2, 0.4, 64);
    const material = new THREE.MeshBasicMaterial({
      color: color,
      transparent: true,
      opacity: 0.6,
      side: THREE.DoubleSide
    });
    const highlight = new THREE.Mesh(geometry, material);

    // Inner glow
    const glowGeometry = new THREE.CircleGeometry(0.15, 32);
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: color,
      transparent: true,
      opacity: 0.3,
      side: THREE.DoubleSide
    });
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);

    // Outer pulse ring
    const pulseGeometry = new THREE.RingGeometry(0.5, 0.6, 64);
    const pulseMaterial = new THREE.MeshBasicMaterial({
      color: color,
      transparent: true,
      opacity: 0.2,
      side: THREE.DoubleSide
    });
    const pulse = new THREE.Mesh(pulseGeometry, pulseMaterial);

    highlightGroup.add(highlight);
    highlightGroup.add(glow);
    highlightGroup.add(pulse);
    highlightGroup.position.copy(position);

    highlightGroup.userData = {
      type: 'enhanced_pulsing_highlight',
      highlight: highlight,
      glow: glow,
      pulse: pulse,
      pulseSpeed: 2,
      originalOpacity: 0.6,
      color: color
    };

    this.scene.add(highlightGroup);
    this.animatedObjects.set(highlightGroup.uuid, highlightGroup);
    return highlightGroup;
  }

  // Create enhanced animated arrow with trail effect
  createAnimatedArrow(position, color = 0x10b981) {
    const arrowGroup = new THREE.Group();

    // Main arrow shaft
    const shaftGeometry = new THREE.CylinderGeometry(0.015, 0.015, 0.4, 16);
    const shaftMaterial = new THREE.MeshLambertMaterial({ 
      color: color,
      emissive: color,
      emissiveIntensity: 0.3
    });
    const shaft = new THREE.Mesh(shaftGeometry, shaftMaterial);
    shaft.rotation.z = Math.PI / 2;

    // Arrow head
    const headGeometry = new THREE.ConeGeometry(0.05, 0.15, 16);
    const headMaterial = new THREE.MeshLambertMaterial({ 
      color: color,
      emissive: color,
      emissiveIntensity: 0.4
    });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.x = 0.25;
    head.rotation.z = -Math.PI / 2;

    // Energy trail effect
    const trailGeometry = new THREE.RingGeometry(0.02, 0.06, 32);
    const trailMaterial = new THREE.MeshBasicMaterial({
      color: color,
      transparent: true,
      opacity: 0.4,
      side: THREE.DoubleSide
    });
    
    const trailRings = [];
    for (let i = 0; i < 5; i++) {
      const ring = new THREE.Mesh(trailGeometry, trailMaterial.clone());
      ring.position.x = -0.1 - (i * 0.08);
      ring.material.opacity = 0.4 - (i * 0.08);
      trailRings.push(ring);
      arrowGroup.add(ring);
    }

    arrowGroup.add(shaft);
    arrowGroup.add(head);
    arrowGroup.position.copy(position);

    arrowGroup.userData = {
      type: 'enhanced_animated_arrow',
      pulseSpeed: 2,
      trailRings: trailRings,
      color: color
    };

    this.scene.add(arrowGroup);
    this.animatedObjects.set(arrowGroup.uuid, arrowGroup);
    return arrowGroup;
  }

  // Create phone component highlight for specific parts
  createPhoneComponentHighlight(componentName, position, color = 0xff6b35) {
    const componentGroup = new THREE.Group();

    // Component-specific shapes
    let geometry;
    switch (componentName) {
      case 'battery':
        geometry = new THREE.BoxGeometry(0.12, 0.25, 0.01);
        break;
      case 'screen':
        geometry = new THREE.BoxGeometry(0.14, 0.28, 0.01);
        break;
      case 'camera':
        geometry = new THREE.CircleGeometry(0.03, 32);
        break;
      case 'speaker':
        geometry = new THREE.BoxGeometry(0.08, 0.02, 0.01);
        break;
      case 'power_button':
        geometry = new THREE.BoxGeometry(0.01, 0.04, 0.01);
        break;
      default:
        geometry = new THREE.BoxGeometry(0.1, 0.1, 0.01);
    }

    // Outline highlight
    const outlineMaterial = new THREE.MeshBasicMaterial({
      color: color,
      transparent: true,
      opacity: 0.7,
      wireframe: true
    });
    const outline = new THREE.Mesh(geometry, outlineMaterial);

    // Filled highlight
    const fillMaterial = new THREE.MeshBasicMaterial({
      color: color,
      transparent: true,
      opacity: 0.2,
      side: THREE.DoubleSide
    });
    const fill = new THREE.Mesh(geometry, fillMaterial);

    // Label
    const label = this.createComponentLabel(componentName, color);
    label.position.set(0, 0.2, 0);

    componentGroup.add(outline);
    componentGroup.add(fill);
    componentGroup.add(label);
    componentGroup.position.copy(position);

    componentGroup.userData = {
      type: 'phone_component_highlight',
      componentName: componentName,
      outline: outline,
      fill: fill,
      label: label,
      pulseSpeed: 1.8
    };

    this.scene.add(componentGroup);
    this.animatedObjects.set(componentGroup.uuid, componentGroup);
    return componentGroup;
  }

  // Create component label
  createComponentLabel(componentName, color) {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');

    // Background
    ctx.fillStyle = `rgba(${(color >> 16) & 255}, ${(color >> 8) & 255}, ${color & 255}, 0.9)`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Text
    ctx.font = 'bold 20px Arial';
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(componentName.replace('_', ' ').toUpperCase(), canvas.width/2, canvas.height/2);

    const texture = new THREE.CanvasTexture(canvas);
    const material = new THREE.MeshBasicMaterial({ map: texture, transparent: true });
    const geometry = new THREE.PlaneGeometry(0.5, 0.125);
    
    return new THREE.Mesh(geometry, material);
  }

  // Create progress ring for steps
  createProgressRing(progress, position, size = 0.15) {
    const ringGroup = new THREE.Group();

    // Background ring
    const bgGeometry = new THREE.RingGeometry(size * 0.8, size, 64);
    const bgMaterial = new THREE.MeshBasicMaterial({
      color: 0x333333,
      transparent: true,
      opacity: 0.3,
      side: THREE.DoubleSide
    });
    const bgRing = new THREE.Mesh(bgGeometry, bgMaterial);

    // Progress ring
    const progressAngle = (progress / 100) * Math.PI * 2;
    const progressGeometry = new THREE.RingGeometry(size * 0.8, size, 64, 1, 0, progressAngle);
    const progressMaterial = new THREE.MeshBasicMaterial({
      color: progress < 30 ? 0xff4444 : progress < 70 ? 0xffaa44 : 0x44ff44,
      transparent: true,
      opacity: 0.8,
      side: THREE.DoubleSide
    });
    const progressRing = new THREE.Mesh(progressGeometry, progressMaterial);

    // Center text
    const centerText = this.createProgressText(`${Math.round(progress)}%`);
    centerText.scale.setScalar(0.3);

    ringGroup.add(bgRing);
    ringGroup.add(progressRing);
    ringGroup.add(centerText);
    ringGroup.position.copy(position);

    ringGroup.userData = {
      type: 'progress_ring',
      progress: progress,
      progressRing: progressRing,
      centerText: centerText
    };

    this.scene.add(ringGroup);
    return ringGroup;
  }

  // Create progress text
  createProgressText(text) {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');

    ctx.font = 'bold 48px Arial';
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, canvas.width/2, canvas.height/2);

    const texture = new THREE.CanvasTexture(canvas);
    const material = new THREE.MeshBasicMaterial({ map: texture, transparent: true });
    const geometry = new THREE.PlaneGeometry(1, 1);
    
    return new THREE.Mesh(geometry, material);
  }

  // Create step completion celebration
  createStepCompletionEffect(position) {
    const celebrationGroup = new THREE.Group();

    // Success checkmark
    const checkmark = this.createCheckmarkMesh();
    checkmark.position.copy(position);
    checkmark.scale.setScalar(0);

    // Particle burst
    const particles = this.createSuccessParticles(position);

    // Success ring expansion
    const successRing = this.createSuccessRing(position);

    celebrationGroup.add(checkmark);
    celebrationGroup.add(particles);
    celebrationGroup.add(successRing);

    celebrationGroup.userData = {
      type: 'step_completion_effect',
      checkmark: checkmark,
      particles: particles,
      successRing: successRing,
      startTime: performance.now()
    };

    this.scene.add(celebrationGroup);
    this.animatedObjects.set(celebrationGroup.uuid, celebrationGroup);

    // Auto-remove after animation
    setTimeout(() => {
      this.scene.remove(celebrationGroup);
      this.animatedObjects.delete(celebrationGroup.uuid);
    }, 3000);

    return celebrationGroup;
  }

  // Create checkmark mesh
  createCheckmarkMesh() {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');

    // Draw checkmark
    ctx.strokeStyle = '#00ff00';
    ctx.lineWidth = 8;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    ctx.beginPath();
    ctx.moveTo(25, 65);
    ctx.lineTo(50, 85);
    ctx.lineTo(100, 35);
    ctx.stroke();

    const texture = new THREE.CanvasTexture(canvas);
    const material = new THREE.MeshBasicMaterial({ map: texture, transparent: true });
   const geometry = new THREE.PlaneGeometry(0.3, 0.3);
   
   return new THREE.Mesh(geometry, material);
 }

 // Create success particles
 createSuccessParticles(position) {
   const particleGroup = new THREE.Group();
   
   for (let i = 0; i < 15; i++) {
     const particleGeometry = new THREE.SphereGeometry(0.01, 8, 8);
     const particleMaterial = new THREE.MeshBasicMaterial({
       color: 0x00ff00,
       transparent: true,
       opacity: 1.0
     });
     const particle = new THREE.Mesh(particleGeometry, particleMaterial);
     
     const angle = (i / 15) * Math.PI * 2;
     const radius = 0.1;
     particle.position.set(
       Math.cos(angle) * radius,
       Math.sin(angle) * radius,
       0
     );
     
     particle.userData = {
       velocity: new THREE.Vector3(
         Math.cos(angle) * 0.02,
         Math.sin(angle) * 0.02,
         Math.random() * 0.02
       ),
       life: 1.0
     };
     
     particleGroup.add(particle);
   }
   
   particleGroup.position.copy(position);
   return particleGroup;
 }

 // Create success ring
 createSuccessRing(position) {
   const ringGeometry = new THREE.RingGeometry(0.05, 0.08, 32);
   const ringMaterial = new THREE.MeshBasicMaterial({
     color: 0x00ff00,
     transparent: true,
     opacity: 0.8,
     side: THREE.DoubleSide
   });
   const ring = new THREE.Mesh(ringGeometry, ringMaterial);
   ring.position.copy(position);
   
   return ring;
 }

 // Update all animations
 updateAnimations() {
   const time = performance.now() * 0.001;

   this.animatedObjects.forEach((obj) => {
     const userData = obj.userData;

     switch (userData.type) {
       case 'enhanced_pulsing_highlight':
         const scale = 1 + Math.sin(time * userData.pulseSpeed) * 0.3;
         userData.highlight.scale.setScalar(scale);
         userData.glow.scale.setScalar(scale * 1.2);
         userData.pulse.scale.setScalar(1 + Math.sin(time * userData.pulseSpeed * 0.7) * 0.5);
         
         userData.highlight.rotation.z += 0.01;
         userData.glow.rotation.z -= 0.015;
         userData.pulse.rotation.z += 0.005;
         break;

       case 'enhanced_animated_arrow':
         const bounceY = Math.sin(time * userData.pulseSpeed) * 0.02;
         obj.position.y += bounceY;
         
         userData.trailRings.forEach((ring, index) => {
           ring.scale.setScalar(1 + Math.sin(time * 3 + index) * 0.2);
           ring.rotation.z += 0.02 + (index * 0.005);
         });
         break;

       case 'phone_component_highlight':
         const pulseScale = 1 + Math.sin(time * userData.pulseSpeed) * 0.15;
         userData.outline.scale.setScalar(pulseScale);
         userData.fill.material.opacity = 0.2 + Math.sin(time * userData.pulseSpeed) * 0.1;
         userData.label.position.y = 0.2 + Math.sin(time * 2) * 0.02;
         break;

       case 'step_completion_effect':
         const elapsed = performance.now() - userData.startTime;
         const progress = Math.min(elapsed / 2000, 1); // 2 second animation
         
         // Animate checkmark scale
         if (progress < 0.3) {
           userData.checkmark.scale.setScalar(progress / 0.3);
         }
         
         // Animate particles
         userData.particles.children.forEach(particle => {
           particle.position.add(particle.userData.velocity);
           particle.userData.life -= 0.02;
           particle.material.opacity = particle.userData.life;
         });
         
         // Animate success ring
         const ringScale = 1 + progress * 2;
         userData.successRing.scale.setScalar(ringScale);
         userData.successRing.material.opacity = 0.8 - progress * 0.8;
         break;
     }
   });
 }

 // Remove all effects
 cleanup() {
   this.animatedObjects.forEach((obj) => {
     this.scene.remove(obj);
   });
   this.animatedObjects.clear();
   this.particleSystems.clear();
 }
}

export default ARVisualEffects;