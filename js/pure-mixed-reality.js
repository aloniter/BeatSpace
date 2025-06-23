// Pure Mixed Reality System - QUEST 3 ONLY
// Uses A-Frame's built-in WebXR system for reliable AR mode

class PureMixedReality {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.dj = null;
        this.isARActive = false;
        this.audioManager = null;
        this.djPlaced = false;
        
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
        
        // Wait for A-Frame to fully initialize
        if (this.scene.hasLoaded) {
            this.onSceneLoaded();
        } else {
            this.scene.addEventListener('loaded', () => this.onSceneLoaded());
        }
    }

    onSceneLoaded() {
        console.log('🎬 A-Frame scene loaded, setting up Mixed Reality...');
        
        // Setup UI first
        this.setupUI();
        
        // Initialize audio manager
        if (window.AudioManager) {
            this.audioManager = new AudioManager();
        }
        
        // Listen for WebXR events
        this.setupWebXRListeners();
        
        console.log('✅ Pure Mixed Reality setup complete');
    }

    setupWebXRListeners() {
        // Listen for when user enters AR/VR mode
        this.scene.addEventListener('enter-vr', (event) => {
            console.log('🥽 Entered WebXR mode');
            this.onEnterWebXR();
        });
        
        this.scene.addEventListener('exit-vr', (event) => {
            console.log('👋 Exited WebXR mode');
            this.onExitWebXR();
        });
    }

    onEnterWebXR() {
        console.log('🎯 WebXR session active!');
        
        // Hide UI overlay
        document.getElementById('start-screen').style.display = 'none';
        document.getElementById('controls').style.display = 'block';
        
        // Force passthrough rendering
        this.forcePassthroughRendering();
        
        // Start audio
        if (this.audioManager) {
            this.audioManager.enableAudio();
        }
        
        // Show AR active message
        this.showARActiveMessage();
        
        // Auto-place DJ after 3 seconds
        setTimeout(() => {
            this.placeDJInRoom();
        }, 3000);
        
        this.isARActive = true;
    }

    onExitWebXR() {
        // Show start screen again
        document.getElementById('start-screen').style.display = 'block';
        document.getElementById('controls').style.display = 'none';
        
        this.isARActive = false;
    }

    setupUI() {
        // Update button to trigger A-Frame's built-in WebXR
        const startButton = document.getElementById('start-button');
        if (startButton) {
            startButton.textContent = '🏠 Start Mixed Reality';
            startButton.style.background = 'linear-gradient(45deg, #00ff80, #0080ff)';
            startButton.style.color = 'white';
            
            // Remove existing listeners
            const newButton = startButton.cloneNode(true);
            startButton.parentNode.replaceChild(newButton, startButton);
            
            // Simple click to enter WebXR
            newButton.addEventListener('click', (e) => {
                e.preventDefault();
                this.startMixedReality();
            });
        }

        // Update other UI elements
        this.updateUIElements();
        this.setupControlButtons();
    }

    updateUIElements() {
        // Update page title and header
        document.title = 'BeatSpace MR - Pure Mixed Reality';
        const header = document.querySelector('h1');
        if (header) {
            header.textContent = '🏠 BeatSpace MR';
            header.style.background = 'linear-gradient(45deg, #00ff80, #0080ff)';
            header.style.webkitBackgroundClip = 'text';
            header.style.webkitTextFillColor = 'transparent';
        }
    }

    setupControlButtons() {
        // Enable Audio button
        const enableAudioBtn = document.getElementById('enable-audio');
        if (enableAudioBtn) {
            enableAudioBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.enableAudio();
            });
        }

        // Place DJ button
        const placeDJBtn = document.getElementById('place-dj-here');
        if (placeDJBtn) {
            placeDJBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.placeDJHere();
            });
        }

        // Force passthrough button
        const forcePassthroughBtn = document.getElementById('force-passthrough');
        if (forcePassthroughBtn) {
            forcePassthroughBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.forcePassthrough();
            });
        }
    }

    async startMixedReality() {
        console.log('🚀 Starting Mixed Reality...');
        
        try {
            // Check WebXR support
            if (!navigator.xr) {
                throw new Error('WebXR not supported - Please use Quest 3 browser');
            }

            // Check AR support
            const isARSupported = await navigator.xr.isSessionSupported('immersive-ar');
            console.log('🔍 AR supported:', isARSupported);
            
            if (isARSupported) {
                // Use A-Frame's built-in AR mode
                console.log('✅ Using A-Frame enterAR...');
                this.scene.enterAR();
            } else {
                // Try VR mode as fallback
                console.log('⚠️ AR not supported, trying VR with passthrough...');
                this.scene.enterVR();
                
                // Show passthrough instructions
                setTimeout(() => {
                    this.showPassthroughInstructions();
                }, 1000);
            }
            
        } catch (error) {
            console.error('❌ Mixed Reality failed:', error);
            this.showError('Mixed Reality requires Quest 3. Please enable passthrough and try again.');
        }
    }

    forcePassthroughRendering() {
        console.log('👁️ Forcing passthrough rendering...');
        
        const scene = this.scene;
        
        // Remove ALL backgrounds
        scene.removeAttribute('background');
        scene.removeAttribute('environment');
        
        // Remove sky elements
        const skies = scene.querySelectorAll('a-sky');
        skies.forEach(sky => sky.remove());
        
        // Force renderer transparency
        if (scene.renderer) {
            const renderer = scene.renderer;
            renderer.setClearColor(0x000000, 0);
            renderer.domElement.style.background = 'transparent';
        }
        
        console.log('✅ Passthrough rendering active');
    }

    showARActiveMessage() {
        const scene = this.scene;
        
        // Create AR active indicator
        const arIndicator = document.createElement('a-text');
        arIndicator.id = 'ar-indicator';
        arIndicator.setAttribute('position', '0 2 -2');
        arIndicator.setAttribute('value', '🏠 MIXED REALITY ACTIVE!\nLook around your room\nDJ appearing soon...');
        arIndicator.setAttribute('align', 'center');
        arIndicator.setAttribute('color', '#00ff80');
        arIndicator.setAttribute('width', '6');
        arIndicator.setAttribute('material', 'emissive: #00ff80; emissiveIntensity: 0.3');
        
        scene.appendChild(arIndicator);
        
        // Remove after 4 seconds
        setTimeout(() => {
            if (arIndicator.parentNode) {
                arIndicator.remove();
            }
        }, 4000);
    }

    showPassthroughInstructions() {
        const scene = this.scene;
        
        const instructions = document.createElement('a-text');
        instructions.id = 'passthrough-instructions';
        instructions.setAttribute('position', '0 1.8 -2');
        instructions.setAttribute('value', '🔍 ENABLE PASSTHROUGH:\n• Double-tap side button\n• Say "Hey Meta, show passthrough"\n• Use hand gesture (thumbs down)');
        instructions.setAttribute('align', 'center');
        instructions.setAttribute('color', '#ff6b6b');
        instructions.setAttribute('width', '5');
        
        scene.appendChild(instructions);
        
        // Remove after 8 seconds
        setTimeout(() => {
            if (instructions.parentNode) {
                instructions.remove();
            }
        }, 8000);
    }

    placeDJInRoom() {
        if (this.djPlaced) {
            console.log('DJ already placed, repositioning...');
        }
        
        console.log('🎤 Placing DJ in your room...');
        
        // Remove existing DJ
        const existingDJ = this.scene.querySelector('#dj-character');
        if (existingDJ) {
            existingDJ.remove();
        }
        
        // Create and place DJ
        const djCharacter = this.createRoomDJ();
        this.scene.appendChild(djCharacter);
        
        // Position in room (2 meters in front, floor level)
        djCharacter.setAttribute('position', '0 0 -2');
        djCharacter.setAttribute('scale', '0.7 0.7 0.7');
        
        // Add room lighting
        this.addRoomLights();
        
        // Success notification
        this.showNotification('🎉 DJ placed in your room!', 'success');
        
        this.djPlaced = true;
        this.dj = djCharacter;
    }

    createRoomDJ() {
        const djCharacter = document.createElement('a-entity');
        djCharacter.id = 'dj-character';
        
        // Glowing DJ body for visibility in real room
        const djBody = document.createElement('a-cylinder');
        djBody.setAttribute('geometry', 'height: 1.8; radius: 0.25');
        djBody.setAttribute('material', 'color: #4CC3D9; emissive: #4CC3D9; emissiveIntensity: 0.4');
        djBody.setAttribute('position', '0 0.9 0');
        djBody.setAttribute('animation', 'property: rotation; to: 0 360 0; loop: true; dur: 8000');
        
        // Bright DJ head
        const djHead = document.createElement('a-sphere');
        djHead.setAttribute('geometry', 'radius: 0.2');
        djHead.setAttribute('material', 'color: #FFC65D; emissive: #FFC65D; emissiveIntensity: 0.3');
        djHead.setAttribute('position', '0 1.1 0');
        
        // Glowing headphones
        const headphones = document.createElement('a-torus');
        headphones.setAttribute('geometry', 'radiusOuter: 0.25; radiusInner: 0.2');
        headphones.setAttribute('material', 'color: #ff0080; emissive: #ff0080; emissiveIntensity: 0.5');
        headphones.setAttribute('position', '0 0.05 0');
        headphones.setAttribute('rotation', '90 0 0');
        
        // DJ deck
        const djDeck = document.createElement('a-box');
        djDeck.setAttribute('geometry', 'width: 1.2; height: 0.12; depth: 0.7');
        djDeck.setAttribute('material', 'color: #333; emissive: #333; emissiveIntensity: 0.2');
        djDeck.setAttribute('position', '0 0.7 0.35');
        
        // Animated turntables
        const turntable1 = document.createElement('a-cylinder');
        turntable1.setAttribute('geometry', 'radius: 0.15; height: 0.02');
        turntable1.setAttribute('material', 'color: #222; emissive: #0080ff; emissiveIntensity: 0.3');
        turntable1.setAttribute('position', '-0.3 0.01 0');
        turntable1.setAttribute('animation', 'property: rotation; to: 0 360 0; loop: true; dur: 2500');
        
        const turntable2 = document.createElement('a-cylinder');
        turntable2.setAttribute('geometry', 'radius: 0.15; height: 0.02');
        turntable2.setAttribute('material', 'color: #222; emissive: #ff0080; emissiveIntensity: 0.3');
        turntable2.setAttribute('position', '0.3 0.01 0');
        turntable2.setAttribute('animation', 'property: rotation; to: 0 -360 0; loop: true; dur: 2700');
        
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
        const colors = ['#ff0080', '#0080ff', '#00ff80', '#ff8000'];
        
        // Add party lights around DJ in room
        for (let i = 0; i < 4; i++) {
            const light = document.createElement('a-light');
            light.id = `room-light-${i}`;
            light.setAttribute('type', 'point');
            light.setAttribute('color', colors[i]);
            light.setAttribute('intensity', '1.5');
            light.setAttribute('distance', '6');
            
            // Position around DJ
            const angle = (i / 4) * Math.PI * 2;
            const x = Math.cos(angle) * 2.5;
            const z = Math.sin(angle) * 2.5 - 2;
            light.setAttribute('position', `${x} 2.2 ${z}`);
            
            // Color animation
            light.setAttribute('animation', 
                `property: color; to: ${colors[(i + 1) % colors.length]}; ` +
                `dir: alternate; loop: true; dur: ${1200 + i * 300}`
            );
            
            this.scene.appendChild(light);
        }
    }

    placeDJHere() {
        if (!this.dj) {
            this.placeDJInRoom();
            return;
        }
        
        // Move DJ to camera position
        const cameraPos = this.camera.getAttribute('position');
        const newPos = {
            x: cameraPos.x,
            y: 0,
            z: cameraPos.z - 1.5
        };
        
        this.dj.setAttribute('position', `${newPos.x} ${newPos.y} ${newPos.z}`);
        this.showNotification('📍 DJ moved to your location!', 'success');
    }

    forcePassthrough() {
        console.log('🔥 Forcing passthrough mode...');
        
        this.forcePassthroughRendering();
        this.showNotification('🔍 Passthrough forced - enable it on your Quest 3!', 'info');
    }

    async enableAudio() {
        if (this.audioManager) {
            await this.audioManager.enableAudio();
            this.showNotification('🎵 Audio enabled!', 'success');
        }
    }

    showNotification(message, type = 'info') {
        console.log(`�� ${message}`);
        
        // Create notification element
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed; top: 20px; right: 20px; z-index: 9999;
            background: ${type === 'success' ? '#00ff80' : type === 'error' ? '#ff6b6b' : '#0080ff'};
            color: ${type === 'success' ? 'black' : 'white'};
            padding: 15px 20px; border-radius: 10px; font-size: 16px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            animation: slideIn 0.3s ease-out;
        `;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // Remove after 3 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 3000);
    }

    showError(message) {
        this.showNotification(message, 'error');
        
        // Also show in scene if possible
        if (this.scene) {
            const errorText = document.createElement('a-text');
            errorText.setAttribute('position', '0 1.5 -1.5');
            errorText.setAttribute('value', `❌ ERROR:\n${message}`);
            errorText.setAttribute('align', 'center');
            errorText.setAttribute('color', '#ff6b6b');
            errorText.setAttribute('width', '6');
            
            this.scene.appendChild(errorText);
            
            setTimeout(() => {
                if (errorText.parentNode) {
                    errorText.remove();
                }
            }, 5000);
        }
    }
}

// Initialize when page loads
window.addEventListener('load', () => {
    console.log('🏠 Initializing Pure Mixed Reality System...');
    window.pureMR = new PureMixedReality();
});

// Add CSS for notification animation
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
`;
document.head.appendChild(style);
