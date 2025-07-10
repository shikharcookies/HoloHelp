// Simple Asset Loader for HoloHelp
import * as THREE from 'three';

export class AssetLoader {
  // Create 3D text
  create3DText(text, options = {}) {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    
    const fontSize = options.fontSize || 32;
    context.font = `${fontSize}px Arial, sans-serif`;
    const textWidth = context.measureText(text).width;
    
    canvas.width = textWidth + 40;
    canvas.height = fontSize + 20;
    
    // Background
    context.fillStyle = options.backgroundColor || 'rgba(59, 130, 246, 0.9)';
    this.roundRect(context, 0, 0, canvas.width, canvas.height, 10);
    context.fill();
    
    // Text
    context.font = `${fontSize}px Arial, sans-serif`;
    context.fillStyle = options.textColor || '#ffffff';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(text, canvas.width / 2, canvas.height / 2);

    const texture = new THREE.CanvasTexture(canvas);
    const material = new THREE.MeshBasicMaterial({ map: texture, transparent: true });
    const geometry = new THREE.PlaneGeometry(2, 0.5);
    
    return new THREE.Mesh(geometry, material);
  }

  // Create microwave model
  createMicrowaveModel() {
    const group = new THREE.Group();

    // Main body
    const bodyGeometry = new THREE.BoxGeometry(0.8, 0.5, 0.6);
    const bodyMaterial = new THREE.MeshLambertMaterial({ color: 0xcccccc });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    group.add(body);

    // Door
    const doorGeometry = new THREE.BoxGeometry(0.6, 0.4, 0.02);
    const doorMaterial = new THREE.MeshLambertMaterial({ color: 0x888888 });
    const door = new THREE.Mesh(doorGeometry, doorMaterial);
    door.position.set(0, 0, 0.31);
    group.add(door);

    // Handle
    const handleGeometry = new THREE.BoxGeometry(0.1, 0.03, 0.03);
    const handleMaterial = new THREE.MeshLambertMaterial({ color: 0x444444 });
    const handle = new THREE.Mesh(handleGeometry, handleMaterial);
    handle.position.set(0.25, 0, 0.32);
    group.add(handle);

    return group;
  }

  // Create router model
  createRouterModel() {
    const group = new THREE.Group();

    // Main body
    const bodyGeometry = new THREE.BoxGeometry(0.4, 0.1, 0.3);
    const bodyMaterial = new THREE.MeshLambertMaterial({ color: 0x222222 });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    group.add(body);

    // Antennas
    for (let i = 0; i < 2; i++) {
      const antennaGeometry = new THREE.CylinderGeometry(0.005, 0.005, 0.2, 8);
      const antennaMaterial = new THREE.MeshLambertMaterial({ color: 0x333333 });
      const antenna = new THREE.Mesh(antennaGeometry, antennaMaterial);
      antenna.position.set(-0.15 + i * 0.3, 0.15, 0);
      group.add(antenna);
    }

    // Status lights
    const lightColors = [0xff0000, 0x00ff00, 0x0000ff];
    for (let i = 0; i < 3; i++) {
      const lightGeometry = new THREE.SphereGeometry(0.01, 8, 8);
      const lightMaterial = new THREE.MeshLambertMaterial({ 
        color: lightColors[i],
        emissive: lightColors[i],
        emissiveIntensity: 0.5
      });
      const light = new THREE.Mesh(lightGeometry, lightMaterial);
      light.position.set(-0.1 + i * 0.1, 0.055, 0.15);
      group.add(light);
    }

    return group;
  }

  // Create water filter model
  createWaterFilterModel() {
    const group = new THREE.Group();

    // Main housing
    const housingGeometry = new THREE.CylinderGeometry(0.15, 0.15, 0.6, 16);
    const housingMaterial = new THREE.MeshLambertMaterial({ color: 0xffffff });
    const housing = new THREE.Mesh(housingGeometry, housingMaterial);
    group.add(housing);

    // Filter cartridge
    const cartridgeGeometry = new THREE.CylinderGeometry(0.12, 0.12, 0.4, 16);
    const cartridgeMaterial = new THREE.MeshLambertMaterial({ color: 0x4444ff });
    const cartridge = new THREE.Mesh(cartridgeGeometry, cartridgeMaterial);
    cartridge.position.y = 0.1;
    group.add(cartridge);

    return group;
  }

  // Helper for rounded rectangles
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
}

export const assetLoader = new AssetLoader();
export default assetLoader;