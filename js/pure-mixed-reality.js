// Pure Mixed Reality System - ONLY Mixed Reality, NO VR Mode
class PureMixedRealityApp {
    constructor() {
        this.arSession = null;
        this.djPlaced = false;
        this.audioManager = null;
        this.isPassthroughActive = false;
        
        this.init();
    }

    init() {
        console.log('🏠 Initializing PURE Mixed Reality App...');
        this.setupUI();
        this.setupAudio();
        console.log('✅ Pure Mixed Reality App ready');
    }

    setupUI() {
        // Hide VR button, only show Mixed Reality button
        const startButton = document.getElementById('start-button');
        if (startButton) {
            startButton.textContent = '🏠 Start Mixed Reality';
            startButton.addEventListener('click', (e) => {
                e.preventDefault();
                this.startMixedReality();
            });
        }

        // Update other buttons
        const enableAudioBtn = document.getElementById('enable-audio');
        if (enableAudioBtn) {
            enableAudioBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.enableAudio();
            });
        }

        // Place DJ button
        const placeDjBtn = document.getElementById('place-dj-here');
        if (placeDjBtn) {
            placeDjBtn.textContent = '📍 PLACE DJ IN MY ROOM';
            placeDjBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.placeDJInRoom();
            });
        }
    }

    async setupAudio() {
        // Initialize audio with gameplay music
        if (window.AudioManager) {
            this.audioManager = new AudioManager();
            console.log('🎵 Audio manager ready for mixed reality');
        }
    }

    async startMixedReality() {
        console.log('🏠 Starting PURE Mixed Reality Mode...');
        
        // Check WebXR AR support
        if (!navigator.xr) {
            this.showError('WebXR not supported. Please use Meta Quest 3 browser.');
            return;
        }

        try {
            // FORCE AR mode only
            const arSupported = await navigator.xr.isSessionSupported('immersive-ar');
            
            if (!arSupported) {
                this.showError('Mixed Reality not supported. Please enable passthrough on Quest 3 and try again.');
                return;
            }

            // Request AR session (this enables passthrough)
            this.arSession = await navigator.xr.requestSession('immersive-ar', {
                requiredFeatures: ['local'],
                optionalFeatures: ['local-floor', 'hand-tracking', 'plane-detection', 'anchors']
            });

            console.log('✅ Mixed Reality session created!');
            this.isPassthroughActive = true;
            
            // Setup the AR session
            this.setupARSession();
            
            // Hide start screen, show controls
            document.getElementById('start-screen').style.display = 'none';
            document.getElementById('controls').style.display = 'flex';
            
            // Start audio immediately
            if (this.audioManager) {
                await this.audioManager.start();
                await this.audioManager.startPerformance();
            }
            
            this.showNotification('🏠 Mixed Reality Active! You should see your room now!', 'success');
            
            // Auto-place DJ after 3 seconds
            setTimeout(() => {
                this.placeDJInRoom();
            }, 3000);

        } catch (error) {
            console.error('❌ Mixed Reality failed:', error);
            this.showError('Failed to start Mixed Reality. Please enable passthrough on your Quest 3 and try again.');
        }
    }

    setupARSession() {
        console.log('🔧 Setting up AR session for real room...');
        
        const scene = document.querySelector('a-scene');
        
        // FORCE complete transparency
        this.forcePassthroughRendering(scene);
        
        // Setup reference space for room tracking
        this.arSession.requestReferenceSpace('local-floor').then(referenceSpace => {
            console.log('🏠 Got room reference space');
            this.setupRoomInteraction(referenceSpace);
        }).catch(() => {
            // Fallback to local space
            this.arSession.requestReferenceSpace('local').then(referenceSpace => {
                console.log('🏠 Got local reference space');
                this.setupRoomInteraction(referenceSpace);
            });
        });

        // Listen for session end
        this.arSession.addEventListener('end', () => {
            console.log('Mixed Reality session ended');
            this.isPassthroughActive = false;
            this.showNotification('Mixed Reality session ended', 'info');
        });
    }

    forcePassthroughRendering(scene) {
        console.log('👁️ FORCING passthrough rendering...');
        
        // Remove ALL backgrounds and environments
        scene.removeAttribute('background');
        scene.removeAttribute('environment');
        
        // Remove any sky elements
        const skies = scene.querySelectorAll('a-sky');
        skies.forEach(sky => sky.remove());
        
        // Force renderer to be completely transparent
        if (scene.renderer) {
            const renderer = scene.renderer;
            
            // Make background completely transparent
            renderer.setClearColor(0x000000, 0); // Transparent black
            renderer.domElement.style.background = 'transparent';
            renderer.domElement.style.backgroundColor = 'transparent';
            
            // Disable auto-clearing to see through
            renderer.autoClear = false;
            renderer.autoClearColor = false;
            renderer.autoClearDepth = false;
            renderer.autoClearStencil = false;
        }
        
        // Set scene canvas to transparent
        const canvas = scene.canvas;
        if (canvas) {
            canvas.style.background = 'transparent';
            canvas.style.backgroundColor = 'transparent';
        }
        
        console.log('✅ Passthrough rendering forced - you should see your room!');
    }

    setupRoomInteraction(referenceSpace) {
        console.log('🏠 Setting up room interaction...');
        this.referenceSpace = referenceSpace;
        
        // Show room scanning message
        this.showRoomScanMessage();
    }

    showRoomScanMessage() {
        const scene = document.querySelector('a-scene');
        
        // Create floating text in your room
        const scanText = document.createElement('a-text');
        scanText.id = 'room-scan-text';
        scanText.setAttribute('position', '0 1.5 -1');
        scanText.setAttribute('value', 'MIXED REALITY ACTIVE!\nLook around your room\nDJ will appear shortly...');
        scanText.setAttribute('align', 'center');
        scanText.setAttribute('color', '#00ff00');
        scanText.setAttribute('width', '8');
        scanText.setAttribute('material', 'emissive: #00ff00; emissiveIntensity: 0.5');
        
        scene.appendChild(scanText);
        
        // Remove after 5 seconds
        setTimeout(() => {
            if (scanText.parentNode) {
                scanText.remove();
            }
        }, 5000);
    }

    placeDJInRoom() {
        console.log('🎤 Placing DJ in your real room...');
        
        const scene = document.querySelector('a-scene');
        
        // Remove existing DJ
        const existingDJ = scene.querySelector('#dj-character');
        if (existingDJ) {
            existingDJ.remove();
        }
        
        // Create DJ for mixed reality
        const djCharacter = this.createMixedRealityDJ();
        scene.appendChild(djCharacter);
        
        // Position DJ in room (2 meters in front, at floor level)
        djCharacter.setAttribute('position', '0 0 -2');
        djCharacter.setAttribute('visible', 'true');
        djCharacter.setAttribute('scale', '0.6 0.6 0.6'); // Smaller for real room
        
        this.djPlaced = true;
        
        // Add room lighting effects
        this.addRoomLights();
        
        // Show success message
        this.showSuccessMessage();
        
        console.log('✅ DJ placed in your real room!');
    }

    createMixedRealityDJ() {
        console.log('🎤 Creating DJ for your real room...');
        
        // Create DJ character optimized for mixed reality
        const djCharacter = document.createElement('a-entity');
        djCharacter.id = 'dj-character';
        
        // DJ Body (glowing for visibility in real room)
        const djBody = document.createElement('a-cylinder');
        djBody.setAttribute('geometry', 'height: 2; radius: 0.3');
        djBody.setAttribute('material', 'color: #4CC3D9; emissive: #4CC3D9; emissiveIntensity: 0.3');
        djBody.setAttribute('position', '0 1 0');
        djBody.setAttribute('animation', 'property: rotation; to: 0 360 0; loop: true; dur: 8000');
        
        // DJ Head (bright and visible)
        const djHead = document.createElement('a-sphere');
        djHead.setAttribute('geometry', 'radius: 0.25');
        djHead.setAttribute('material', 'color: #FFC65D; emissive: #FFC65D; emissiveIntensity: 0.2');
        djHead.setAttribute('position', '0 1.2 0');
        
        // DJ Headphones (glowing)
        const headphones = document.createElement('a-torus');
        headphones.setAttribute('geometry', 'radiusOuter: 0.3; radiusInner: 0.25');
        headphones.setAttribute('material', 'color: #ff0080; emissive: #ff0080; emissiveIntensity: 0.4');
        headphones.setAttribute('position', '0 0.1 0');
        headphones.setAttribute('rotation', '90 0 0');
        
        // DJ Deck (visible in real room)
        const djDeck = document.createElement('a-box');
        djDeck.setAttribute('geometry', 'width: 1.5; height: 0.15; depth: 0.8');
        djDeck.setAttribute('material', 'color: #333; emissive: #333; emissiveIntensity: 0.1');
        djDeck.setAttribute('position', '0 0.8 0.4');
        
        // Turntables (animated)
        const turntable1 = document.createElement('a-cylinder');
        turntable1.setAttribute('geometry', 'radius: 0.2; height: 0.03');
        turntable1.setAttribute('material', 'color: #222; emissive: #0080ff; emissiveIntensity: 0.2');
        turntable1.setAttribute('position', '-0.4 0.02 0');
        turntable1.setAttribute('animation', 'property: rotation; to: 0 360 0; loop: true; dur: 3000');
        
        const turntable2 = document.createElement('a-cylinder');
        turntable2.setAttribute('geometry', 'radius: 0.2; height: 0.03');
        turntable2.setAttribute('material', 'color: #222; emissive: #ff0080; emissiveIntensity: 0.2');
        turntable2.setAttribute('position', '0.4 0.02 0');
        turntable2.setAttribute('animation', 'property: rotation; to: 0 -360 0; loop: true; dur: 2800');
        
        // Assemble DJ
        djHead.appendChild(headphones);
        djBody.appendChild(djHead);
        djDeck.appendChild(turntable1);
        djDeck.appendChild(turntable2);
        djCharacter.appendChild(djBody);
        djCharacter.appendChild(djDeck);
        
        return djCharacter;
    }

    addRoomLights() {
        console.log('💡 Adding party lights to your room...');
        
        const scene = document.querySelector('a-scene');
        const colors = ['#ff0080', '#0080ff', '#00ff80', '#ff8000'];
        
        // Add floating party lights around the DJ
        for (let i = 0; i < 4; i++) {
            const light = document.createElement('a-light');
            light.id = `room-party-light-${i}`;
            light.setAttribute('type', 'point');
            light.setAttribute('color', colors[i]);
            light.setAttribute('intensity', '2');
            light.setAttribute('distance', '8');
            
            // Position lights around the DJ in your room
            const angle = (i / 4) * Math.PI * 2;
            const x = Math.cos(angle) * 3;
            const z = Math.sin(angle) * 3 - 2; // Offset for DJ position
            light.setAttribute('position', `${x} 2 ${z}`);
            
            // Animate light colors
            light.setAttribute('animation', `property: color; to: ${colors[(i + 1) % colors.length]}; dir: alternate; loop: true; dur: ${1000 + i * 200}`);
            
            scene.appendChild(light);
        }
    }

    showSuccessMessage() {
        const scene = document.querySelector('a-scene');
        
        const success = document.createElement('a-text');
        success.id = 'success-message';
        success.setAttribute('position', '0 2.5 -1.5');
        success.setAttribute('value', '🎉 DJ IN YOUR ROOM!\nMixed Reality Party Started!');
        success.setAttribute('align', 'center');
        success.setAttribute('color', '#00ff00');
        success.setAttribute('width', '8');
        success.setAttribute('material', 'emissive: #00ff00; emissiveIntensity: 0.5');
        
        scene.appendChild(success);
        
        // Auto-remove after 4 seconds
        setTimeout(() => {
            if (success.parentNode) {
                success.remove();
            }
        }, 4000);
    }

    async enableAudio() {
        console.log('🔊 Enabling audio for mixed reality...');
        
        if (this.audioManager) {
            await this.audioManager.start();
            this.showNotification('🎵 Audio enabled! Your gameplay music is ready!', 'success');
        }
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'};
            color: white;
            padding: 15px;
            border-radius: 5px;
            z-index: 1000;
            max-width: 300px;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 4000);
    }

    showError(message) {
        this.showNotification(message, 'error');
        console.error('❌', message);
    }
}

// Initialize Pure Mixed Reality App
window.addEventListener('DOMContentLoaded', () => {
    console.log('🏠 Starting Pure Mixed Reality App...');
    window.pureMRApp = new PureMixedRealityApp();
});

// Export for global access
window.PureMixedRealityApp = PureMixedRealityApp;
