// Room Tracking System for BeatSpace Mixed Reality
class RoomTracker {
    constructor() {
        this.isTracking = false;
        this.roomBounds = null;
        this.floorHeight = 0;
        this.anchors = [];
        this.planes = [];
        this.referenceSpace = null;
        this.session = null;
        
        // Room detection settings
        this.minRoomSize = { width: 2, depth: 2 }; // Minimum 2x2 meters
        this.maxRoomSize = { width: 10, depth: 10 }; // Maximum 10x10 meters
        
        this.init();
    }

    init() {
        console.log('📐 Initializing Room Tracker...');
        
        // Check for WebXR plane detection support
        this.checkPlaneDetectionSupport();
        
        console.log('✅ Room Tracker initialized');
    }

    async checkPlaneDetectionSupport() {
        if (!navigator.xr) {
            console.warn('⚠️ WebXR not available');
            return false;
        }

        try {
            // Check if plane detection is supported
            const supported = await navigator.xr.isSessionSupported('immersive-ar');
            
            if (supported) {
                console.log('✅ Plane detection supported');
                return true;
            } else {
                console.log('ℹ️ Plane detection not supported, using fallback');
                return false;
            }
            
        } catch (error) {
            console.error('❌ Plane detection check failed:', error);
            return false;
        }
    }

    async startTracking() {
        if (this.isTracking) return;
        
        console.log('📐 Starting room tracking...');
        
        try {
            // Get current WebXR session
            const scene = document.querySelector('a-scene');
            if (scene && scene.xrSession) {
                this.session = scene.xrSession;
                this.setupRoomTracking();
            } else {
                // Fallback to manual room setup
                this.setupManualRoom();
            }
            
            this.isTracking = true;
            
        } catch (error) {
            console.error('❌ Failed to start room tracking:', error);
            this.setupManualRoom();
        }
    }

    setupRoomTracking() {
        if (!this.session) return;
        
        // Request reference space
        this.session.requestReferenceSpace('local-floor').then(refSpace => {
            this.referenceSpace = refSpace;
            console.log('📍 Local floor reference space acquired');
            
            // Start plane detection
            this.startPlaneDetection();
            
        }).catch(error => {
            console.log('ℹ️ Local-floor not available, using local space');
            
            // Fallback to regular local space
            this.session.requestReferenceSpace('local').then(refSpace => {
                this.referenceSpace = refSpace;
                this.estimateFloorHeight();
            });
        });
    }

    startPlaneDetection() {
        if (!this.session) return;
        
        // Listen for plane detection events
        this.session.addEventListener('select', (event) => {
            this.handlePlaneDetection(event);
        });
        
        // Start detecting horizontal planes (floor/tables)
        const frameRequestCallback = (time, frame) => {
            if (!this.isTracking) return;
            
            if (frame.detectedPlanes) {
                this.updateDetectedPlanes(frame.detectedPlanes);
            }
            
            this.session.requestAnimationFrame(frameRequestCallback);
        };
        
        this.session.requestAnimationFrame(frameRequestCallback);
        
        console.log('🔍 Plane detection started');
    }

    updateDetectedPlanes(detectedPlanes) {
        this.planes = Array.from(detectedPlanes);
        
        // Find the largest horizontal plane (likely the floor)
        const floorPlane = this.findFloorPlane(this.planes);
        
        if (floorPlane) {
            this.processFloorPlane(floorPlane);
        }
        
        // Update room visualization
        this.updateRoomVisualization();
    }

    findFloorPlane(planes) {
        let largestPlane = null;
        let largestArea = 0;
        
        planes.forEach(plane => {
            // Check if plane is roughly horizontal (floor-like)
            const normal = plane.orientation;
            const isHorizontal = Math.abs(normal[1]) > 0.8; // Y-axis dominant
            
            if (isHorizontal) {
                const polygon = plane.polygon;
                const area = this.calculatePolygonArea(polygon);
                
                if (area > largestArea) {
                    largestArea = area;
                    largestPlane = plane;
                }
            }
        });
        
        return largestPlane;
    }

    calculatePolygonArea(polygon) {
        if (polygon.length < 3) return 0;
        
        let area = 0;
        for (let i = 0; i < polygon.length; i++) {
            const j = (i + 1) % polygon.length;
            area += polygon[i].x * polygon[j].z;
            area -= polygon[j].x * polygon[i].z;
        }
        
        return Math.abs(area) / 2;
    }

    processFloorPlane(floorPlane) {
        // Extract floor height and bounds
        this.floorHeight = floorPlane.position[1];
        
        // Calculate room bounds from floor plane polygon
        const polygon = floorPlane.polygon;
        this.roomBounds = this.calculateRoomBounds(polygon);
        
        console.log('🏠 Floor detected:', {
            height: this.floorHeight,
            bounds: this.roomBounds
        });
        
        // Update floor reference in scene
        this.updateFloorReference();
        
        // Notify that room is ready
        this.onRoomReady();
    }

    calculateRoomBounds(polygon) {
        let minX = Infinity, maxX = -Infinity;
        let minZ = Infinity, maxZ = -Infinity;
        
        polygon.forEach(point => {
            minX = Math.min(minX, point.x);
            maxX = Math.max(maxX, point.x);
            minZ = Math.min(minZ, point.z);
            maxZ = Math.max(maxZ, point.z);
        });
        
        return {
            minX, maxX, minZ, maxZ,
            width: maxX - minX,
            depth: maxZ - minZ,
            center: {
                x: (minX + maxX) / 2,
                z: (minZ + maxZ) / 2
            }
        };
    }

    updateFloorReference() {
        const floorReference = document.querySelector('#floor-reference');
        if (!floorReference || !this.roomBounds) return;
        
        // Position and size floor reference
        floorReference.setAttribute('position', `${this.roomBounds.center.x} ${this.floorHeight} ${this.roomBounds.center.z}`);
        floorReference.setAttribute('width', this.roomBounds.width);
        floorReference.setAttribute('height', this.roomBounds.depth);
        floorReference.setAttribute('visible', 'true');
        
        // Add subtle grid pattern
        floorReference.setAttribute('material', `
            color: #7BC8A4; 
            opacity: 0.1; 
            transparent: true;
            shader: grid;
            grid-size: 0.5
        `);
    }

    setupManualRoom() {
        console.log('🏠 Setting up manual room (fallback mode)');
        
        // Estimate room size based on user movement
        this.estimateRoomFromMovement();
        
        // Set default floor height
        this.floorHeight = 0;
        
        // Create default room bounds
        this.roomBounds = {
            minX: -3, maxX: 3,
            minZ: -3, maxZ: 3,
            width: 6, depth: 6,
            center: { x: 0, z: 0 }
        };
        
        this.updateFloorReference();
        this.onRoomReady();
    }

    estimateRoomFromMovement() {
        // Track user head movement to estimate room bounds
        const camera = document.querySelector('#camera');
        if (!camera) return;
        
        let minX = 0, maxX = 0, minZ = 0, maxZ = 0;
        let positions = [];
        
        const trackMovement = () => {
            const position = camera.getAttribute('position');
            positions.push(position);
            
            minX = Math.min(minX, position.x);
            maxX = Math.max(maxX, position.x);
            minZ = Math.min(minZ, position.z);
            maxZ = Math.max(maxZ, position.z);
            
            // Update room bounds if movement detected
            if (positions.length > 10) {
                this.roomBounds = {
                    minX: minX - 1, maxX: maxX + 1,
                    minZ: minZ - 1, maxZ: maxZ + 1,
                    width: (maxX - minX) + 2,
                    depth: (maxZ - minZ) + 2,
                    center: {
                        x: (minX + maxX) / 2,
                        z: (minZ + minZ) / 2
                    }
                };
                
                this.updateFloorReference();
            }
        };
        
        // Track movement for 30 seconds
        const trackingInterval = setInterval(trackMovement, 1000);
        setTimeout(() => {
            clearInterval(trackingInterval);
            console.log('📐 Room estimation complete:', this.roomBounds);
        }, 30000);
    }

    estimateFloorHeight() {
        // Estimate floor height based on camera height
        const camera = document.querySelector('#camera');
        if (!camera) return;
        
        const cameraPosition = camera.getAttribute('position');
        // Assume average person height is 1.7m, floor is 1.7m below camera
        this.floorHeight = cameraPosition.y - 1.7;
        
        console.log('📏 Estimated floor height:', this.floorHeight);
    }

    getOptimalDJPosition(userPosition) {
        if (!this.roomBounds) return { x: 0, y: this.floorHeight, z: -2 };
        
        // Calculate optimal DJ position based on room layout
        const roomCenter = this.roomBounds.center;
        const userPos = userPosition || { x: 0, z: 0 };
        
        // Place DJ opposite to user position, but not too far
        const optimalX = roomCenter.x + (roomCenter.x - userPos.x) * 0.3;
        const optimalZ = roomCenter.z + (roomCenter.z - userPos.z) * 0.3;
        
        // Ensure DJ stays within room bounds
        const clampedX = Math.max(this.roomBounds.minX + 0.5, 
                                 Math.min(this.roomBounds.maxX - 0.5, optimalX));
        const clampedZ = Math.max(this.roomBounds.minZ + 0.5,
                                 Math.min(this.roomBounds.maxZ - 0.5, optimalZ));
        
        return {
            x: clampedX,
            y: this.floorHeight,
            z: clampedZ
        };
    }

    createAnchor(position) {
        if (!this.session || !this.referenceSpace) return null;
        
        try {
            // Create spatial anchor at position
            const pose = new XRRigidTransform(position);
            return this.session.requestHitTestSource({ space: this.referenceSpace })
                .then(hitTestSource => {
                    return { position, hitTestSource };
                });
                
        } catch (error) {
            console.error('❌ Failed to create anchor:', error);
            return null;
        }
    }

    updateRoomVisualization() {
        // Update room visualization in A-Frame scene
        this.createRoomBoundaryVisualization();
        this.highlightOptimalAreas();
    }

    createRoomBoundaryVisualization() {
        if (!this.roomBounds) return;
        
        // Remove existing boundary
        const existingBoundary = document.querySelector('#room-boundary');
        if (existingBoundary) {
            existingBoundary.remove();
        }
        
        // Create room boundary visualization
        const boundary = document.createElement('a-entity');
        boundary.id = 'room-boundary';
        
        // Create boundary lines
        const corners = [
            { x: this.roomBounds.minX, z: this.roomBounds.minZ },
            { x: this.roomBounds.maxX, z: this.roomBounds.minZ },
            { x: this.roomBounds.maxX, z: this.roomBounds.maxZ },
            { x: this.roomBounds.minX, z: this.roomBounds.maxZ }
        ];
        
        corners.forEach((corner, index) => {
            const nextCorner = corners[(index + 1) % corners.length];
            
            const line = document.createElement('a-box');
            line.setAttribute('position', `${(corner.x + nextCorner.x) / 2} ${this.floorHeight + 0.1} ${(corner.z + nextCorner.z) / 2}`);
            line.setAttribute('width', index % 2 === 0 ? Math.abs(nextCorner.x - corner.x) : 0.02);
            line.setAttribute('height', 0.02);
            line.setAttribute('depth', index % 2 === 1 ? Math.abs(nextCorner.z - corner.z) : 0.02);
            line.setAttribute('material', 'color: #00ff80; opacity: 0.6; transparent: true');
            
            boundary.appendChild(line);
        });
        
        document.querySelector('a-scene').appendChild(boundary);
    }

    highlightOptimalAreas() {
        // Highlight areas where DJ placement would work well
        const camera = document.querySelector('#camera');
        if (!camera || !this.roomBounds) return;
        
        const userPosition = camera.getAttribute('position');
        const optimalPos = this.getOptimalDJPosition(userPosition);
        
        // Create highlight indicator
        let highlight = document.querySelector('#optimal-area');
        if (!highlight) {
            highlight = document.createElement('a-cylinder');
            highlight.id = 'optimal-area';
            highlight.setAttribute('radius', '0.5');
            highlight.setAttribute('height', '0.02');
            highlight.setAttribute('material', 'color: #ff0080; opacity: 0.3; transparent: true');
            highlight.setAttribute('animation', 'property: rotation; to: 0 360 0; loop: true; dur: 4000');
            
            document.querySelector('a-scene').appendChild(highlight);
        }
        
        highlight.setAttribute('position', `${optimalPos.x} ${optimalPos.y + 0.01} ${optimalPos.z}`);
    }

    onRoomReady() {
        console.log('🏠 Room tracking ready!');
        
        // Notify main app
        if (window.beatSpaceApp) {
            window.beatSpaceApp.showNotification('🏠 Room detected! Ready to spawn DJ!', 'success');
        }
        
        // Enable room-aware features
        this.enableRoomAwareFeatures();
    }

    enableRoomAwareFeatures() {
        // Enable DJ room integration
        const djCharacter = window.beatSpaceApp?.djCharacter;
        if (djCharacter) {
            djCharacter.enableRoomIntegration();
        }
        
        // Enable ambient room lighting
        this.setupRoomLighting();
    }

    setupRoomLighting() {
        if (!this.roomBounds) return;
        
        // Create corner lights for ambient room lighting
        const corners = [
            { x: this.roomBounds.minX, z: this.roomBounds.minZ },
            { x: this.roomBounds.maxX, z: this.roomBounds.minZ },
            { x: this.roomBounds.maxX, z: this.roomBounds.maxZ },
            { x: this.roomBounds.minX, z: this.roomBounds.maxZ }
        ];
        
        corners.forEach((corner, index) => {
            const light = document.createElement('a-light');
            light.setAttribute('type', 'point');
            light.setAttribute('position', `${corner.x} ${this.floorHeight + 2} ${corner.z}`);
            light.setAttribute('color', index % 2 === 0 ? '#ff0080' : '#0080ff');
            light.setAttribute('intensity', '0.5');
            light.setAttribute('distance', '3');
            light.className = 'room-light';
            
            document.querySelector('a-scene').appendChild(light);
        });
    }

    stopTracking() {
        this.isTracking = false;
        
        // Clean up room visualization
        const boundary = document.querySelector('#room-boundary');
        if (boundary) boundary.remove();
        
        const highlight = document.querySelector('#optimal-area');
        if (highlight) highlight.remove();
        
        // Remove room lights
        document.querySelectorAll('.room-light').forEach(light => light.remove());
        
        console.log('⏹️ Room tracking stopped');
    }

    getRoomInfo() {
        return {
            isTracking: this.isTracking,
            bounds: this.roomBounds,
            floorHeight: this.floorHeight,
            planeCount: this.planes.length
        };
    }
}

// Export for global access
window.RoomTracker = RoomTracker; 