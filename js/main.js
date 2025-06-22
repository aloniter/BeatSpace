// BeatSpace - Main Application Logic
class BeatSpaceApp {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.isVRActive = false;
        this.isPassthroughActive = false;
        this.djCharacter = null;
        this.audioManager = null;
        this.roomTracker = null;
        
        this.init();
    }

    init() {
        console.log('🎧 Initializing BeatSpace...');
        
        // Initialize immediately if DOM is already loaded
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.initializeApp();
            });
        } else {
            this.initializeApp();
        }
    }

    initializeApp() {
        console.log('🚀 Starting BeatSpace initialization...');
        this.setupScene();
        this.setupUI();
        this.setupWebXR();
        this.setupAudio();
        this.setupRoomTracking();
        console.log('✅ BeatSpace initialization complete');
    }

    setupScene() {
        this.scene = document.querySelector('a-scene');
        this.camera = document.querySelector('#camera');
        
        // Scene loaded event
        this.scene.addEventListener('loaded', () => {
            console.log('✅ A-Frame scene loaded');
            this.onSceneReady();
        });

        // VR mode events
        this.scene.addEventListener('enter-vr', () => {
            console.log('🥽 Entering VR mode');
            this.isVRActive = true;
            this.onEnterVR();
        });

        this.scene.addEventListener('exit-vr', () => {
            console.log('👋 Exiting VR mode');
            this.isVRActive = false;
            this.onExitVR();
        });
    }

    setupUI() {
        console.log('🎮 Setting up UI...');
        
        const startButton = document.getElementById('start-button');
        const enableAudioButton = document.getElementById('enable-audio');
        const spawnDjButton = document.getElementById('spawn-dj');
        const changeMusicButton = document.getElementById('change-music');
        const toggleEffectsButton = document.getElementById('toggle-effects');

        if (!startButton || !enableAudioButton) {
            console.error('❌ UI buttons not found!');
            return;
        }

        // Start VR experience
        startButton.addEventListener('click', (e) => {
            console.log('🎯 Start button clicked');
            e.preventDefault();
            this.startVRExperience();
        });

        // Enable audio
        enableAudioButton.addEventListener('click', async (e) => {
            console.log('🔊 Enable audio button clicked');
            e.preventDefault();
            await this.enableAudio();
        });

        // Spawn DJ
        if (spawnDjButton) {
            spawnDjButton.addEventListener('click', (e) => {
                console.log('🎤 Spawn DJ button clicked');
                e.preventDefault();
                this.spawnDJ();
            });
        }

        // Change music
        if (changeMusicButton) {
            changeMusicButton.addEventListener('click', (e) => {
                console.log('🎵 Change music button clicked');
                e.preventDefault();
                this.changeMusic();
            });
        }

        // Toggle effects
        if (toggleEffectsButton) {
            toggleEffectsButton.addEventListener('click', (e) => {
                console.log('✨ Toggle effects button clicked');
                e.preventDefault();
                this.toggleEffects();
            });
        }

        console.log('✅ UI setup complete');
    }

    async setupWebXR() {
        // Check WebXR support
        if (!navigator.xr) {
            console.warn('⚠️ WebXR not supported');
            this.showNotification('WebXR not supported on this device', 'warning');
            return;
        }

        try {
            // Check for immersive-ar support (passthrough)
            const arSupported = await navigator.xr.isSessionSupported('immersive-ar');
            if (arSupported) {
                console.log('✅ Mixed Reality (AR) supported');
                this.setupPassthrough();
            }

            // Check for immersive-vr support
            const vrSupported = await navigator.xr.isSessionSupported('immersive-vr');
            if (vrSupported) {
                console.log('✅ Virtual Reality supported');
            }

        } catch (error) {
            console.error('❌ WebXR check failed:', error);
        }
    }

    setupPassthrough() {
        // Enable passthrough for mixed reality
        const scene = document.querySelector('a-scene');
        
        // Force transparent background for passthrough
        scene.setAttribute('background', 'color: transparent');
        scene.removeAttribute('environment');
        
        // Add WebXR session attributes for passthrough
        scene.setAttribute('webxr', 'requiredFeatures: local-floor,hand-tracking; optionalFeatures: plane-detection,depth-sensing,anchors');
        
        // Create passthrough indicator
        this.createPassthroughIndicator();
        
        console.log('🔍 Passthrough mode configured');
    }

    setupAudio() {
        // Initialize audio manager
        if (window.AudioManager) {
            this.audioManager = new AudioManager();
            console.log('🎵 Audio manager initialized');
        }
    }

    setupRoomTracking() {
        // Initialize room tracking
        if (window.RoomTracker) {
            this.roomTracker = new RoomTracker();
            console.log('📐 Room tracking initialized');
        }
    }

    onSceneReady() {
        // Scene is ready, initialize DJ character
        if (window.DJCharacter) {
            this.djCharacter = new DJCharacter();
            console.log('🎤 DJ character system ready');
        }
        
        // Show ready notification
        this.showNotification('BeatSpace is ready! Put on your Quest 3 and click "Enter VR Party"', 'success');
    }

    async startVRExperience() {
        try {
            // Hide start screen
            document.getElementById('start-screen').style.display = 'none';
            document.getElementById('controls').style.display = 'flex';

            // Enter VR mode
            if (this.scene) {
                await this.scene.enterVR();
            }

            // Enable passthrough if supported
            await this.enablePassthrough();

            // Start audio context
            if (this.audioManager && !this.audioManager.isStarted) {
                await this.audioManager.start();
            }

            this.showNotification('Welcome to BeatSpace! Look around to spawn your DJ!', 'info');

        } catch (error) {
            console.error('❌ Failed to start VR experience:', error);
            this.showNotification('Failed to start VR. Please check your headset connection.', 'error');
        }
    }

    async enablePassthrough() {
        console.log('🔍 Attempting to enable passthrough...');
        
        if (!navigator.xr) {
            console.log('❌ WebXR not available');
            return;
        }

        try {
            // Check if immersive-ar is supported
            const arSupported = await navigator.xr.isSessionSupported('immersive-ar');
            console.log('AR supported:', arSupported);

            if (arSupported) {
                // Request AR session with passthrough
                const session = await navigator.xr.requestSession('immersive-ar', {
                    requiredFeatures: ['local'],
                    optionalFeatures: ['local-floor', 'hand-tracking', 'depth-sensing', 'plane-detection', 'anchors']
                });

                this.isPassthroughActive = true;
                this.showPassthroughIndicator();
                
                console.log('✅ Passthrough enabled successfully');
                
                // Position DJ in room
                if (this.djCharacter) {
                    this.djCharacter.enableRoomIntegration();
                }
            } else {
                console.log('ℹ️ AR not supported, trying passthrough in VR mode');
                await this.enablePassthroughInVR();
            }

        } catch (error) {
            console.log('ℹ️ Passthrough not available:', error);
            console.log('🥽 Using regular VR mode');
            // Fallback to regular VR
        }
    }

    async enablePassthroughInVR() {
        try {
            // Try to enable passthrough in VR mode
            const scene = document.querySelector('a-scene');
            const renderer = scene.renderer;
            
            if (renderer && renderer.xr) {
                // Force passthrough background
                renderer.setClearColor(0x000000, 0);
                scene.object3D.background = null;
                
                console.log('🔍 Passthrough configured in VR mode');
            }
        } catch (error) {
            console.log('ℹ️ VR passthrough not available:', error);
        }
    }

    async enableAudio() {
        try {
            // Request audio permissions
            await navigator.mediaDevices.getUserMedia({ audio: true });
            
            // Initialize Tone.js
            await Tone.start();
            
            // Enable audio button
            document.getElementById('enable-audio').style.display = 'none';
            
            this.showNotification('Audio enabled! Ready to party! 🎵', 'success');
            
            console.log('🎵 Audio system enabled');

        } catch (error) {
            console.error('❌ Audio permission denied:', error);
            this.showNotification('Audio permission needed for the full experience', 'warning');
        }
    }

    spawnDJ() {
        if (!this.djCharacter) {
            console.error('❌ DJ character not initialized');
            return;
        }

        // Get camera position for DJ placement
        const cameraPosition = this.camera.getAttribute('position');
        const cameraRotation = this.camera.getAttribute('rotation');

        // Calculate position in front of user
        const distance = 2; // 2 meters in front
        const radians = (cameraRotation.y * Math.PI) / 180;
        
        const djPosition = {
            x: cameraPosition.x + Math.sin(radians) * distance,
            y: 0, // Floor level
            z: cameraPosition.z - Math.cos(radians) * distance
        };

        // Spawn DJ at calculated position
        this.djCharacter.spawn(djPosition);
        
        // Start DJ performance
        if (this.audioManager) {
            this.audioManager.startPerformance();
        }

        this.showNotification('🎤 DJ spawned! Let the party begin!', 'success');
        console.log('🎤 DJ spawned at position:', djPosition);
    }

    changeMusic() {
        if (this.audioManager) {
            this.audioManager.nextTrack();
            this.showNotification('🎵 Switching tracks...', 'info');
        }

        // Update DJ animations
        if (this.djCharacter) {
            this.djCharacter.changePerformanceStyle();
        }
    }

    toggleEffects() {
        if (this.audioManager) {
            this.audioManager.toggleEffects();
        }

        // Toggle party lights
        this.togglePartyLights();
        
        this.showNotification('✨ Effects toggled!', 'info');
    }

    togglePartyLights() {
        const lights = document.querySelectorAll('[id^="party-light"]');
        lights.forEach(light => {
            const isVisible = light.getAttribute('visible') !== 'false';
            light.setAttribute('visible', !isVisible);
        });
    }

    onEnterVR() {
        document.body.classList.add('vr-mode');
        
        // Enable hand tracking if available
        this.enableHandTracking();
        
        // Start room tracking
        if (this.roomTracker) {
            this.roomTracker.startTracking();
        }
    }

    onExitVR() {
        document.body.classList.remove('vr-mode');
        
        // Show UI again
        document.getElementById('start-screen').style.display = 'block';
        document.getElementById('controls').style.display = 'none';
        
        // Stop room tracking
        if (this.roomTracker) {
            this.roomTracker.stopTracking();
        }
    }

    enableHandTracking() {
        // Enable hand tracking if supported
        const leftHand = document.getElementById('leftHand');
        const rightHand = document.getElementById('rightHand');

        if (leftHand && rightHand) {
            leftHand.setAttribute('hand-tracking-controls', '');
            rightHand.setAttribute('hand-tracking-controls', '');
            
            this.showHandTrackingIndicator();
            console.log('👋 Hand tracking enabled');
        }
    }

    // UI Helper Methods
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // Auto remove after 3 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 3000);
    }

    createPassthroughIndicator() {
        if (document.querySelector('.passthrough-active')) return;
        
        const indicator = document.createElement('div');
        indicator.className = 'passthrough-active';
        indicator.textContent = '🔍 Mixed Reality';
        document.body.appendChild(indicator);
    }

    showPassthroughIndicator() {
        const indicator = document.querySelector('.passthrough-active');
        if (indicator) {
            indicator.style.display = 'block';
        }
    }

    showHandTrackingIndicator() {
        if (document.querySelector('.hand-tracking-active')) return;
        
        const indicator = document.createElement('div');
        indicator.className = 'hand-tracking-active';
        indicator.textContent = '👋 Hand Tracking Active';
        document.body.appendChild(indicator);
    }

    // Beat synchronization
    onBeat() {
        // Pulse DJ character
        if (this.djCharacter) {
            this.djCharacter.onBeat();
        }

        // Pulse UI elements
        document.body.classList.add('beat-pulse');
        setTimeout(() => {
            document.body.classList.remove('beat-pulse');
        }, 100);
    }
}

// Initialize the app when everything loads
let beatSpaceApp;

// Multiple initialization triggers to ensure it works
function initializeBeatSpace() {
    if (beatSpaceApp) return; // Already initialized
    
    console.log('🎧 Creating BeatSpace app instance...');
    beatSpaceApp = new BeatSpaceApp();
    window.beatSpaceApp = beatSpaceApp; // Make globally accessible
}

// Try to initialize as soon as possible
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeBeatSpace);
} else {
    initializeBeatSpace();
}

// Fallback initialization after a short delay
setTimeout(() => {
    if (!beatSpaceApp) {
        console.log('🔄 Fallback initialization...');
        initializeBeatSpace();
    }
}, 1000);

// Export for other modules
window.BeatSpaceApp = BeatSpaceApp;

// Debug information
console.log('📋 BeatSpace Debug Info:');
console.log('- Location:', window.location.href);
console.log('- User Agent:', navigator.userAgent);
console.log('- WebXR Available:', !!navigator.xr);
console.log('- HTTPS:', location.protocol === 'https:'); 