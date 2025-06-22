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

        // Force passthrough button (emergency fix)
        const forcePassthroughButton = document.getElementById('force-passthrough');
        if (forcePassthroughButton) {
            forcePassthroughButton.addEventListener('click', (e) => {
                console.log('🔥 FORCE PASSTHROUGH BUTTON CLICKED');
                e.preventDefault();
                
                // Use the debug script
                if (window.passthroughDebug) {
                    window.passthroughDebug.forcePassthrough();
                }
                
                // Also trigger our own emergency passthrough
                this.emergencyPassthrough();
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
        console.log('🥽 Main app: Entering VR mode');
        document.body.classList.add('vr-mode');
        
        // Force show VR elements
        this.showVRElements();
        
        // Auto-spawn DJ after a short delay
        setTimeout(() => {
            if (!this.djCharacter || !this.djCharacter.isSpawned) {
                console.log('🎤 Auto-spawning DJ in VR mode');
                this.spawnDJ();
            }
        }, 2000);
        
        // Enable hand tracking if available
        this.enableHandTracking();
        
        // Start room tracking
        if (this.roomTracker) {
            this.roomTracker.startTracking();
        }
        
        // Show VR instructions
        this.showVRInstructions();
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

    showVRElements() {
        console.log('👁️ Forcing VR elements to be visible');
        
        // Make sure party lights are visible
        const lights = document.querySelectorAll('[id^="party-light"]');
        lights.forEach(light => {
            light.setAttribute('visible', 'true');
        });
        
        // Ensure DJ character is ready
        const djCharacter = document.querySelector('#dj-character');
        if (djCharacter) {
            djCharacter.setAttribute('visible', 'true');
        }
        
        // Make sure floor reference is visible
        const floorRef = document.querySelector('#floor-reference');
        if (floorRef) {
            floorRef.setAttribute('visible', 'true');
            floorRef.setAttribute('material', 'color: #7BC8A4; opacity: 0.3; transparent: true');
        }
    }

    showVRInstructions() {
        // Add instructions in VR space
        this.showNotification('🥽 VR Mode Active! Double-tap side button for passthrough', 'info');
        
        setTimeout(() => {
            this.showNotification('🎤 DJ will spawn automatically. Use hand tracking to interact!', 'info');
        }, 3000);
    }

    emergencyPassthrough() {
        console.log('🚨 EMERGENCY PASSTHROUGH ACTIVATION');
        
        const scene = document.querySelector('a-scene');
        if (!scene) {
            console.log('❌ No scene found');
            return;
        }
        
        // Method 1: Force scene transparency
        scene.removeAttribute('background');
        scene.removeAttribute('environment');
        
        // Method 2: Force renderer transparency
        if (scene.renderer) {
            scene.renderer.setClearColor(0x000000, 0);
            scene.renderer.domElement.style.background = 'transparent';
        }
        
        // Method 3: Force DJ character to spawn and be visible
        setTimeout(() => {
            this.spawnDJ();
            const djCharacter = scene.querySelector('#dj-character');
            if (djCharacter) {
                djCharacter.setAttribute('visible', 'true');
                djCharacter.setAttribute('position', '1 0 -2');
            }
        }, 500);
        
        // Method 4: Add bright test elements
        this.addEmergencyElements();
        
        // Method 5: Try to request AR session
        this.requestEmergencyAR();
        
        this.showNotification('🔥 Emergency passthrough activated! Check your headset.', 'warning');
    }

    addEmergencyElements() {
        console.log('🚨 Adding emergency test elements');
        
        const scene = document.querySelector('a-scene');
        
        // Add bright floating text
        let emergencyText = document.createElement('a-text');
        emergencyText.id = 'emergency-text';
        emergencyText.setAttribute('position', '0 2 -1.5');
        emergencyText.setAttribute('value', 'EMERGENCY MODE\nIf you see this, VR is working!\nDouble-tap side button for passthrough');
        emergencyText.setAttribute('align', 'center');
        emergencyText.setAttribute('color', '#ff0000');
        emergencyText.setAttribute('width', '8');
        emergencyText.setAttribute('material', 'emissive: #ff0000; emissiveIntensity: 0.5');
        scene.appendChild(emergencyText);
        
        // Add spinning cube
        let emergencyCube = document.createElement('a-box');
        emergencyCube.id = 'emergency-cube';
        emergencyCube.setAttribute('position', '0 1.5 -2');
        emergencyCube.setAttribute('width', '0.5');
        emergencyCube.setAttribute('height', '0.5');
        emergencyCube.setAttribute('depth', '0.5');
        emergencyCube.setAttribute('material', 'color: #00ff00; emissive: #00ff00; emissiveIntensity: 0.3');
        emergencyCube.setAttribute('animation', 'property: rotation; to: 360 360 0; loop: true; dur: 2000');
        scene.appendChild(emergencyCube);
    }

    requestEmergencyAR() {
        console.log('🚨 Requesting emergency AR session');
        
        if (!navigator.xr) {
            console.log('❌ WebXR not available');
            return;
        }
        
        navigator.xr.isSessionSupported('immersive-ar').then(supported => {
            if (supported) {
                console.log('✅ Requesting AR session...');
                
                navigator.xr.requestSession('immersive-ar', {
                    requiredFeatures: ['local'],
                    optionalFeatures: ['local-floor', 'hand-tracking']
                }).then(session => {
                    console.log('🎉 EMERGENCY AR SESSION CREATED!');
                }).catch(error => {
                    console.log('❌ Emergency AR failed:', error);
                });
            }
        }).catch(error => {
            console.log('❌ Emergency AR check failed:', error);
        });
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