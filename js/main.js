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
        
        // Wait for A-Frame to load
        document.addEventListener('DOMContentLoaded', () => {
            this.setupScene();
            this.setupUI();
            this.setupWebXR();
            this.setupAudio();
            this.setupRoomTracking();
        });
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
        const startButton = document.getElementById('start-button');
        const enableAudioButton = document.getElementById('enable-audio');
        const spawnDjButton = document.getElementById('spawn-dj');
        const changeMusicButton = document.getElementById('change-music');
        const toggleEffectsButton = document.getElementById('toggle-effects');

        // Start VR experience
        startButton.addEventListener('click', () => {
            this.startVRExperience();
        });

        // Enable audio
        enableAudioButton.addEventListener('click', async () => {
            await this.enableAudio();
        });

        // Spawn DJ
        spawnDjButton.addEventListener('click', () => {
            this.spawnDJ();
        });

        // Change music
        changeMusicButton.addEventListener('click', () => {
            this.changeMusic();
        });

        // Toggle effects
        toggleEffectsButton.addEventListener('click', () => {
            this.toggleEffects();
        });
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
        
        // Add passthrough component
        scene.setAttribute('background', 'color: transparent');
        
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
        if (!navigator.xr) return;

        try {
            // Request AR session with passthrough
            const session = await navigator.xr.requestSession('immersive-ar', {
                requiredFeatures: ['local'],
                optionalFeatures: ['depth-sensing', 'plane-detection']
            });

            this.isPassthroughActive = true;
            this.showPassthroughIndicator();
            
            console.log('🔍 Passthrough enabled');
            
            // Position DJ in room
            if (this.djCharacter) {
                this.djCharacter.enableRoomIntegration();
            }

        } catch (error) {
            console.log('ℹ️ Passthrough not available, using VR mode');
            // Fallback to regular VR
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

// Initialize the app when page loads
let beatSpaceApp;
document.addEventListener('DOMContentLoaded', () => {
    beatSpaceApp = new BeatSpaceApp();
});

// Export for other modules
window.BeatSpaceApp = BeatSpaceApp; 