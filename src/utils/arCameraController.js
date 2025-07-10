// src/utils/arCameraController.js - Advanced AR Camera Controls

import * as THREE from 'three';

export class ARCameraController {
  constructor(camera, domElement) {
    this.camera = camera;
    this.domElement = domElement;
    
    // Camera state
    this.enabled = true;
    this.autoRotate = false;
    this.autoRotateSpeed = 2.0;
    
    // Interaction state
    this.isUserInteracting = false;
    this.rotateStart = new THREE.Vector2();
    this.rotateEnd = new THREE.Vector2();
    this.rotateDelta = new THREE.Vector2();
    
    // Touch state
    this.touchStart = new THREE.Vector2();
    this.touchEnd = new THREE.Vector2();
    this.touchDelta = new THREE.Vector2();
    
    // Camera limits
    this.minDistance = 1;
    this.maxDistance = 10;
    this.minPolarAngle = 0;
    this.maxPolarAngle = Math.PI;
    this.minAzimuthAngle = -Infinity;
    this.maxAzimuthAngle = Infinity;
    
    // Camera position in spherical coordinates
    this.spherical = new THREE.Spherical();
    this.sphericalDelta = new THREE.Spherical();
    this.target = new THREE.Vector3();
    
    // Performance
    this.enableDamping = true;
    this.dampingFactor = 0.05;
    
    this.bindEvents();
    this.update();
  }

  bindEvents() {
    // Mouse events
    this.domElement.addEventListener('mousedown', this.onMouseDown.bind(this));
    this.domElement.addEventListener('mousemove', this.onMouseMove.bind(this));
    this.domElement.addEventListener('mouseup', this.onMouseUp.bind(this));
    this.domElement.addEventListener('wheel', this.onMouseWheel.bind(this));
    
    // Touch events
    this.domElement.addEventListener('touchstart', this.onTouchStart.bind(this));
    this.domElement.addEventListener('touchmove', this.onTouchMove.bind(this));
    this.domElement.addEventListener('touchend', this.onTouchEnd.bind(this));
    
    // Prevent context menu
    this.domElement.addEventListener('contextmenu', (event) => {
      event.preventDefault();
    });
  }

  onMouseDown(event) {
    if (!this.enabled) return;
    
    event.preventDefault();
    
    this.isUserInteracting = true;
    this.rotateStart.set(event.clientX, event.clientY);
    
    this.domElement.style.cursor = 'grabbing';
  }

  onMouseMove(event) {
    if (!this.enabled || !this.isUserInteracting) return;
    
    event.preventDefault();
    
    this.rotateEnd.set(event.clientX, event.clientY);
    this.rotateDelta.subVectors(this.rotateEnd, this.rotateStart);
    
    const element = this.domElement;
    
    // Rotate around Y axis (horizontal movement)
    this.sphericalDelta.theta -= 2 * Math.PI * this.rotateDelta.x / element.clientHeight;
    
    // Rotate around X axis (vertical movement)
    this.sphericalDelta.phi -= 2 * Math.PI * this.rotateDelta.y / element.clientHeight;
    
    this.rotateStart.copy(this.rotateEnd);
  }

  onMouseUp() {
    if (!this.enabled) return;
    
    this.isUserInteracting = false;
    this.domElement.style.cursor = 'grab';
  }

  onMouseWheel(event) {
    if (!this.enabled) return;
    
    event.preventDefault();
    
    if (event.deltaY < 0) {
      this.dollyIn(this.getZoomScale());
    } else if (event.deltaY > 0) {
      this.dollyOut(this.getZoomScale());
    }
  }

  onTouchStart(event) {
    if (!this.enabled) return;
    
    event.preventDefault();
    
    if (event.touches.length === 1) {
      this.isUserInteracting = true;
      this.touchStart.set(event.touches[0].pageX, event.touches[0].pageY);
    }
  }

  onTouchMove(event) {
    if (!this.enabled || !this.isUserInteracting) return;
    
    event.preventDefault();
    
    if (event.touches.length === 1) {
      this.touchEnd.set(event.touches[0].pageX, event.touches[0].pageY);
      this.touchDelta.subVectors(this.touchEnd, this.touchStart);
      
      const element = this.domElement;
      
      this.sphericalDelta.theta -= 2 * Math.PI * this.touchDelta.x / element.clientHeight;
      this.sphericalDelta.phi -= 2 * Math.PI * this.touchDelta.y / element.clientHeight;
      
      this.touchStart.copy(this.touchEnd);
    }
  }

  onTouchEnd() {
    if (!this.enabled) return;
    
    this.isUserInteracting = false;
  }

  dollyIn(dollyScale) {
    this.spherical.radius /= dollyScale;
  }

  dollyOut(dollyScale) {
    this.spherical.radius *= dollyScale;
  }

  getZoomScale() {
    return Math.pow(0.95, 1);
  }

  update() {
    const offset = new THREE.Vector3();
    const quat = new THREE.Quaternion().setFromUnitVectors(
      this.camera.up,
      new THREE.Vector3(0, 1, 0)
    );
    const quatInverse = quat.clone().invert();
    
    const position = this.camera.position;
    
    offset.copy(position).sub(this.target);
    offset.applyQuaternion(quat);
    
    this.spherical.setFromVector3(offset);
    
    if (this.autoRotate && !this.isUserInteracting) {
      this.sphericalDelta.theta += 2 * Math.PI / 60 / 60 * this.autoRotateSpeed;
    }
    
    this.spherical.theta += this.sphericalDelta.theta;
    this.spherical.phi += this.sphericalDelta.phi;
    
    // Restrict theta and phi to be within desired limits
    this.spherical.theta = Math.max(
      this.minAzimuthAngle,
      Math.min(this.maxAzimuthAngle, this.spherical.theta)
    );
    
    this.spherical.phi = Math.max(
      this.minPolarAngle,
      Math.min(this.maxPolarAngle, this.spherical.phi)
    );
    
    this.spherical.makeSafe();
    
    this.spherical.radius = Math.max(
      this.minDistance,
      Math.min(this.maxDistance, this.spherical.radius)
    );
    
    offset.setFromSpherical(this.spherical);
    offset.applyQuaternion(quatInverse);
    
    position.copy(this.target).add(offset);
    this.camera.lookAt(this.target);
    
    if (this.enableDamping) {
      this.sphericalDelta.theta *= (1 - this.dampingFactor);
      this.sphericalDelta.phi *= (1 - this.dampingFactor);
    } else {
      this.sphericalDelta.set(0, 0, 0);
    }
    
    return false;
  }

  // Focus camera on specific object
  focusOn(object, transition = true) {
    const box = new THREE.Box3().setFromObject(object);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    
    const maxDim = Math.max(size.x, size.y, size.z);
    const fov = this.camera.fov * (Math.PI / 180);
    const cameraZ = Math.abs(maxDim / 2 / Math.tan(fov / 2));
    
    if (transition) {
      this.animateToPosition(
        new THREE.Vector3(center.x, center.y, center.z + cameraZ * 1.5),
        center,
        1000
      );
    } else {
      this.camera.position.set(center.x, center.y, center.z + cameraZ * 1.5);
      this.target.copy(center);
      this.camera.lookAt(center);
    }
  }

  // Smooth camera animation
  animateToPosition(targetPosition, lookAtTarget, duration = 1000) {
    const startPosition = this.camera.position.clone();
    const startTarget = this.target.clone();
    const startTime = performance.now();
    
    const animate = () => {
      const currentTime = performance.now();
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function (ease-out)
      const easeOut = 1 - Math.pow(1 - progress, 3);
      
      // Interpolate position
      this.camera.position.lerpVectors(startPosition, targetPosition, easeOut);
      this.target.lerpVectors(startTarget, lookAtTarget, easeOut);
      
      this.camera.lookAt(this.target);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    animate();
  }

  // Set camera to AR mode (looking down at device)
  setARMode(devicePosition, deviceType = 'microwave') {
    const positions = {
      microwave: new THREE.Vector3(0, 1, 2),
      router: new THREE.Vector3(0, 0.5, 1.5),
      water_filter: new THREE.Vector3(0, 0.8, 1.8)
    };
    
    const cameraPosition = positions[deviceType] || positions.microwave;
    cameraPosition.add(devicePosition);
    
    this.animateToPosition(cameraPosition, devicePosition, 1500);
  }

  // Cinematic camera movement for step transitions
  cinematicTransition(fromStep, toStep, duration = 800) {
    // Create a sweeping camera movement
    const currentPos = this.camera.position.clone();
    const currentTarget = this.target.clone();
    
    // Move camera in an arc
    const midPoint = new THREE.Vector3().addVectors(currentPos, this.target).multiplyScalar(0.5);
    midPoint.y += 0.5; // Arc upward
    
    const startTime = performance.now();
    
    const animate = () => {
      const elapsed = performance.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      let cameraPos;
      if (progress < 0.5) {
        // First half: move to mid-point
        cameraPos = new THREE.Vector3().lerpVectors(currentPos, midPoint, progress * 2);
      } else {
        // Second half: move to final position
        cameraPos = new THREE.Vector3().lerpVectors(midPoint, currentPos, (progress - 0.5) * 2);
      }
      
      this.camera.position.copy(cameraPos);
      this.camera.lookAt(this.target);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    animate();
  }

  // Reset camera to default position
  reset() {
    this.camera.position.set(0, 0, 5);
    this.target.set(0, 0, 0);
    this.camera.lookAt(this.target);
    this.spherical.setFromVector3(this.camera.position);
    this.sphericalDelta.set(0, 0, 0);
  }

  // Enable/disable controls
  setEnabled(enabled) {
    this.enabled = enabled;
    if (!enabled) {
      this.isUserInteracting = false;
    }
  }

  // Dispose of event listeners
  dispose() {
    this.domElement.removeEventListener('mousedown', this.onMouseDown);
    this.domElement.removeEventListener('mousemove', this.onMouseMove);
    this.domElement.removeEventListener('mouseup', this.onMouseUp);
    this.domElement.removeEventListener('wheel', this.onMouseWheel);
    this.domElement.removeEventListener('touchstart', this.onTouchStart);
    this.domElement.removeEventListener('touchmove', this.onTouchMove);
    this.domElement.removeEventListener('touchend', this.onTouchEnd);
    this.domElement.removeEventListener('contextmenu', this.onContextMenu);
  }
}

export default ARCameraController;