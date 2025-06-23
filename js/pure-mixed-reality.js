// Pure Mixed Reality System - QUEST 3 ONLY
// Forces AR mode with passthrough, no VR fallback

class PureMixedReality {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.dj = null;
        this.isARActive = false;
        this.audioManager = null;
        
        console.log('🏠 Pure Mixed Reality System Initialized');
        this.init();
    }

    init() {
        // Wait for DOM and A-Frame to load
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            this.setup();
        }
    }

    setup() {
        this.scene = document.querySelector('a-scene');
        this.camera = document.querySelector('#camera');
        
        // Force AR-only mode
        this.forceARMode();
        
        // Setup UI
        this.setupUI();
        
        // Initialize audio manager
        if (window.AudioManager) {
            this.audioManager = new AudioManager();
        }
        
        console.log('✅ Pure Mixed Reality setup complete');
    }

    forceARMode() {
        if (!this.scene) return;
        
        // FORCE AR-only settings
        this.scene.setAttribute('vr-mode-ui', 'enabled: false');
        this.scene.setAttribute('ar-mode-ui', 'enabled: false');
        this.scene.setAttribute('device-orientation-permission-ui', 'enabled: false');
        
        // Force transparent background
        this.scene.setAttribute('background', 'transparent: true');
        this.scene.setAttribute('environment', 'preset: none');
        
        // Force renderer settings for transparency
        this.scene.setAttribute('renderer', 
            'alpha: true; clearColor: 0x000000; clearAlpha: 0; antialias: true; colorManagement: true'
        );
        
        console.log('🔥 FORCED AR-ONLY MODE - No VR fallback');
    }

    setupUI() {
        // FORCE Mixed Reality button text and remove all VR references
        const startButton = document.getElementById('start-button');
        if (startButton) {
            // Force update button text and style
            startButton.textContent = '🏠 Start Mixed Reality';
            startButton.innerHTML = '🏠 Start Mixed Reality';
            startButton.style.background = 'linear-gradient(45deg, #00ff80, #0080ff)';
            startButton.style.color = 'white';
            
            // Remove any existing event listeners
            const newButton = startButton.cloneNode(true);
            startButton.parentNode.replaceChild(newButton, startButton);
            
            // Add new event listener
            newButton.addEventListener('click', (e) => {
                e.preventDefault();
                this.startMixedReality();
            });
        }

        // Update page title and header
        document.title = 'BeatSpace MR - Pure Mixed Reality';
        const header = document.querySelector('h1');
        if (header) {
            header.textContent = '🏠 BeatSpace MR';
            header.style.background = 'linear-gradient(45deg, #00ff80, #0080ff)';
            header.style.webkitBackgroundClip = 'text';
            header.style.webkitTextFillColor = 'transparent';
        }

        // Update other buttons
        const enableAudioBtn = document.getElementById('enable-audio');
        if (enableAudioBtn) {
            enableAudioBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.enableAudio();
            });
        }

        // Control buttons
        const placeDJBtn = document.getElementById('place-dj-here');
        if (placeDJBtn) {
            placeDJBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.placeDJHere();
            });
        }

        const forcePassthroughBtn = document.getElementById('force-passthrough');
        if (forcePassthroughBtn) {
            forcePassthroughBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.forcePassthrough();
            });
        }
    }

    async startMixedReality() {
        console.log('🚀 Starting PURE Mixed Reality...');
        
        try {
            // Check WebXR support
            if (!navigator.xr) {
                throw new Error('WebXR not supported');
            }

            // FORCE AR session only
            const isARSupported = await navigator.xr.isSessionSupported('immersive-ar');
            if (!isARSupported) {
                throw new Error('AR not supported on this device');
            }

            console.log('✅ AR supported, starting session...');
            
            // Hide start screen
            document.getElementById('start-screen').style.display = 'none';
            document.getElementById('controls').style.display = 'block';
            
            // Start AR session
            await this.startARSession();
            
        } catch (error) {
            console.error('❌ Mixed Reality failed:', error);
            this.showError('Mixed Reality requires Quest 3 with passthrough enabled');
        }
    }

    async startARSession() {
        try {
            // Request AR session with passthrough
            const session = await navigator.xr.requestSession('immersive-ar', {
                requiredFeatures: ['local'],
                optionalFeatures: [
                    'local-floor',
                    'hand-tracking',
                    'plane-detection',
                    'depth-sensing',
                    'anchors',
                    'hit-test'
                ]
            });

            console.log('🎯 AR Session started successfully');
            this.isARActive = true;
            
            // Auto-spawn DJ after 3 seconds
            setTimeout(() => {
                this.spawnDJ();
            }, 3000);
            
            // Start audio
            if (this.audioManager) {
                this.audioManager.startMusic();
            }
            
        } catch (error) {
            console.error('❌ AR Session failed:', error);
            throw error;
        }
    }

    spawnDJ() {
        if (this.dj) {
            this.dj.remove();
        }

        console.log('🎧 Spawning DJ in your room...');
        
        // Create DJ character optimized for mixed reality
        this.dj = document.createElement('a-entity');
        this.dj.setAttribute('id', 'dj-character');
        this.dj.setAttribute('position', '0 0 -2'); // 2 meters in front
        
        // DJ Body - Glowing for visibility in MR
        const body = document.createElement('a-cylinder');
        body.setAttribute('height', '1.5');
        body.setAttribute('radius', '0.25');
        body.setAttribute('color', '#00ff80');
        body.setAttribute('material', 'emissive: #00ff80; emissiveIntensity: 0.3');
        body.setAttribute('position', '0 0.75 0');
        
        // DJ Head - Glowing
        const head = document.createElement('a-sphere');
        head.setAttribute('radius', '0.2');
        head.setAttribute('color', '#0080ff');
        head.setAttribute('material', 'emissive: #0080ff; emissiveIntensity: 0.4');
        head.setAttribute('position', '0 1.7 0');
        
        // DJ Turntables
        const deck = document.createElement('a-box');
        deck.setAttribute('width', '1.5');
        deck.setAttribute('height', '0.1');
        deck.setAttribute('depth', '0.8');
        deck.setAttribute('color', '#333');
        deck.setAttribute('material', 'metalness: 0.8; emissive: #333; emissiveIntensity: 0.1');
        deck.setAttribute('position', '0 1.0 0.3');
        
        // Add components to DJ
        this.dj.appendChild(body);
        this.dj.appendChild(head);
        this.dj.appendChild(deck);
        
        // Add to scene
        this.scene.appendChild(this.dj);
        
        // Add room lighting
        this.addRoomLighting();
        
        console.log('✅ DJ spawned in your room!');
    }

    addRoomLighting() {
        // Remove existing party lights
        const existingLights = this.scene.querySelectorAll('[id^="party-light"]');
        existingLights.forEach(light => light.remove());
        
        // Add party lights around the DJ
        const colors = ['#ff0080', '#00ff80', '#0080ff', '#ff8000'];
        const positions = [
            [-1.5, 2, -1.5],
            [1.5, 2, -1.5],
            [-1.5, 2, -2.5],
            [1.5, 2, -2.5]
        ];
        
        positions.forEach((pos, index) => {
            const light = document.createElement('a-light');
            light.setAttribute('id', `party-light-${index}`);
            light.setAttribute('type', 'point');
            light.setAttribute('color', colors[index]);
            light.setAttribute('intensity', '0.5');
            light.setAttribute('distance', '5');
            light.setAttribute('position', pos.join(' '));
            
            // Add glowing sphere for visibility
            const sphere = document.createElement('a-sphere');
            sphere.setAttribute('radius', '0.05');
            sphere.setAttribute('color', colors[index]);
            sphere.setAttribute('material', `emissive: ${colors[index]}; emissiveIntensity: 0.8`);
            light.appendChild(sphere);
            
            this.scene.appendChild(light);
        });
    }

    placeDJHere() {
        if (!this.dj) {
            this.spawnDJ();
            return;
        }
        
        // Place DJ at current camera position
        const cameraPos = this.camera.getAttribute('position');
        const newPos = {
            x: cameraPos.x,
            y: 0,
            z: cameraPos.z - 1.5 // 1.5m in front of player
        };
        
        this.dj.setAttribute('position', `${newPos.x} ${newPos.y} ${newPos.z}`);
        console.log('📍 DJ placed at your location');
    }

    forcePassthrough() {
        console.log('🔥 Forcing passthrough mode...');
        
        // Force scene transparency
        this.scene.setAttribute('background', 'transparent: true');
        this.scene.style.background = 'transparent';
        document.body.style.background = 'transparent';
        
        // Force renderer alpha
        this.scene.setAttribute('renderer', 
            'alpha: true; clearColor: 0x000000; clearAlpha: 0; antialias: true; colorManagement: true'
        );
        
        console.log('✅ Passthrough forced');
    }

    enableAudio() {
        if (this.audioManager) {
            this.audioManager.enableAudio();
        }
    }

    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
            position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
            background: rgba(255, 0, 0, 0.9); color: white; padding: 20px;
            border-radius: 10px; text-align: center; z-index: 9999;
            max-width: 300px; font-size: 16px;
        `;
        errorDiv.innerHTML = `
            <h3>⚠️ Error</h3>
            <p>${message}</p>
            <button onclick="this.parentElement.remove()" style="margin-top: 10px; padding: 8px 16px; background: white; color: red; border: none; border-radius: 5px;">OK</button>
        `;
        document.body.appendChild(errorDiv);
    }
}

// Initialize when page loads
window.addEventListener('load', () => {
    console.log('🏠 Initializing Pure Mixed Reality System...');
    window.pureMR = new PureMixedReality();
});
