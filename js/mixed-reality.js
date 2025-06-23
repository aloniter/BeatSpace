// Mixed Reality Manager for Quest 3 - Places DJ in Real Room
class MixedRealityManager {
    constructor() {
        this.isActive = false;
        this.spatialAnchors = [];
        this.roomBounds = null;
        this.djPlacementPosition = null;
        this.passthroughActive = false;
        this.handTrackingActive = false;
        
        // Room scanning
        this.scannedSurfaces = [];
        this.floorLevel = 0;
        
        this.init();
    }

    init() {
        console.log('🏠 Initializing Mixed Reality Manager...');
        this.setupMixedReality();
        console.log('✅ Mixed Reality Manager initialized');
    }

    async setupMixedReality() {
        console.log('🔍 Setting up Quest 3 Mixed Reality...');
        
        // Check WebXR AR support
        if (!navigator.xr) {
            console.log('❌ WebXR not supported');
            return false;
        }

        try {
            const arSupported = await navigator.xr.isSessionSupported('immersive-ar');
            console.log('AR Support:', arSupported);
            
            if (arSupported) {
                await this.requestARSession();
                return true;
            } else {
                console.log('⚠️ AR not supported, using VR fallback');
                this.setupVRFallback();
                return false;
            }
        } catch (error) {
            console.error('❌ Mixed Reality setup failed:', error);
            return false;
        }
    }

    // Emergency function to force DJ placement
    forceDJPlacement() {
        console.log('🚨 Force placing DJ in room...');
        
        // Place DJ 2 meters in front of user at floor level
        const djPosition = { x: 0, y: 0, z: -2 };
        
        const scene = document.querySelector('a-scene');
        let djCharacter = scene.querySelector('#dj-character');
        
        if (!djCharacter) {
            // Create DJ if it doesn't exist
            if (window.beatSpaceApp) {
                window.beatSpaceApp.spawnDJ();
                djCharacter = scene.querySelector('#dj-character');
            }
        }
        
        if (djCharacter) {
            djCharacter.setAttribute('position', `${djPosition.x} ${djPosition.y} ${djPosition.z}`);
            djCharacter.setAttribute('visible', 'true');
            djCharacter.setAttribute('scale', '0.8 0.8 0.8');
            
            console.log('✅ DJ placed in room!');
            
            // Start music if not playing
            if (window.beatSpaceApp && window.beatSpaceApp.audioManager) {
                window.beatSpaceApp.audioManager.startPerformance();
            }
        }
        
        return true;
    }

    setupVRFallback() {
        console.log('🥽 Setting up VR fallback mode...');
        
        // Auto-place DJ in front of user after delay
        setTimeout(() => {
            this.forceDJPlacement();
        }, 2000);
    }
}

// Export for global use
window.MixedRealityManager = MixedRealityManager;