// Quest 3 Passthrough Component for BeatSpace
AFRAME.registerComponent('quest-passthrough', {
    init: function () {
        console.log('🔍 Initializing Quest 3 passthrough component...');
        
        this.el.addEventListener('enter-vr', this.onEnterVR.bind(this));
        this.el.addEventListener('exit-vr', this.onExitVR.bind(this));
        
        // Set up passthrough-friendly scene
        this.setupPassthroughScene();
    },

    setupPassthroughScene: function () {
        const scene = this.el;
        
        // Remove any background that might interfere with passthrough
        scene.setAttribute('background', 'color: transparent');
        scene.removeAttribute('environment');
        
        // Ensure transparent renderer
        const renderer = scene.renderer;
        if (renderer) {
            renderer.setClearColor(0x000000, 0);
            renderer.alpha = true;
        }
        
        console.log('✅ Passthrough scene configured');
    },

    onEnterVR: function () {
        console.log('🥽 Entering VR mode...');
        
        // Force passthrough immediately
        this.forcePassthrough();
        
        const session = this.el.xrSession;
        if (!session) {
            console.log('❌ No XR session found');
            // Try alternative approach
            setTimeout(() => this.alternativePassthrough(), 1000);
            return;
        }

        console.log('Session mode:', session.mode);
        
        // Check if this is an AR session (passthrough)
        if (session.mode === 'immersive-ar') {
            console.log('✅ AR session detected - passthrough should be active');
            this.enablePassthroughFeatures();
        } else {
            console.log('ℹ️ VR session - forcing passthrough compatibility');
            this.enableVRPassthrough();
            // Also try to trigger Quest 3 passthrough
            this.triggerQuest3Passthrough();
        }
    },

    onExitVR: function () {
        console.log('👋 Exiting VR mode');
    },

    enablePassthroughFeatures: function () {
        // Enable room tracking and spatial features
        const session = this.el.xrSession;
        
        if (session.requestReferenceSpace) {
            session.requestReferenceSpace('local-floor')
                .then(refSpace => {
                    console.log('✅ Local floor reference space acquired');
                    this.setupSpatialAnchors(refSpace);
                })
                .catch(err => {
                    console.log('ℹ️ Local floor not available, using local space');
                    return session.requestReferenceSpace('local');
                })
                .then(refSpace => {
                    if (refSpace) {
                        console.log('✅ Local reference space acquired');
                    }
                });
        }
    },

    enableVRPassthrough: function () {
        // Try to enable passthrough-like features in VR mode
        const scene = this.el;
        const renderer = scene.renderer;
        
        if (renderer && renderer.xr) {
            // Make background completely transparent
            renderer.setClearColor(0x000000, 0);
            scene.object3D.background = null;
            
            // Remove any sky or environment
            const sky = scene.querySelector('a-sky');
            if (sky) sky.remove();
            
            console.log('🔍 VR passthrough compatibility enabled');
        }
    },

    setupSpatialAnchors: function (referenceSpace) {
        // Set up spatial anchoring for room integration
        this.referenceSpace = referenceSpace;
        console.log('🏠 Spatial anchoring ready');
        
        // Notify other components that room tracking is available
        this.el.emit('room-tracking-ready', { referenceSpace: referenceSpace });
    },

    forcePassthrough: function () {
        console.log('🔧 Force enabling passthrough...');
        
        const scene = this.el;
        
        // Remove all backgrounds and skyboxes
        scene.removeAttribute('background');
        scene.removeAttribute('environment');
        
        // Set renderer to transparent
        const renderer = scene.renderer;
        if (renderer) {
            renderer.setClearColor(0x000000, 0);
            renderer.domElement.style.background = 'transparent';
        }
        
        // Remove any existing sky
        const sky = scene.querySelector('a-sky');
        if (sky) {
            sky.remove();
            console.log('🗑️ Removed a-sky element');
        }
        
        // Make sure camera has clear view
        const camera = scene.querySelector('a-camera');
        if (camera) {
            camera.setAttribute('look-controls', 'enabled: true');
            camera.setAttribute('wasd-controls', 'enabled: false');
        }
    },

    triggerQuest3Passthrough: function () {
        console.log('🔍 Triggering Quest 3 passthrough...');
        
        // Try multiple methods to enable passthrough
        setTimeout(() => {
            console.log('📣 Attempting passthrough via WebXR...');
            this.requestPassthroughSession();
        }, 500);
        
        setTimeout(() => {
            console.log('📣 Attempting alternative passthrough...');
            this.alternativePassthrough();
        }, 1500);
    },

    requestPassthroughSession: function () {
        if (!navigator.xr) {
            console.log('❌ WebXR not available');
            return;
        }
        
        navigator.xr.isSessionSupported('immersive-ar').then(supported => {
            console.log('🔍 AR support:', supported);
            
            if (supported) {
                navigator.xr.requestSession('immersive-ar', {
                    requiredFeatures: ['local'],
                    optionalFeatures: ['local-floor', 'hand-tracking', 'depth-sensing', 'plane-detection']
                }).then(session => {
                    console.log('✅ AR session created successfully!');
                    // The session should automatically enable passthrough
                }).catch(error => {
                    console.log('ℹ️ AR session failed:', error);
                });
            }
        }).catch(error => {
            console.log('❌ AR support check failed:', error);
        });
    },

    alternativePassthrough: function () {
        console.log('🔄 Alternative passthrough method...');
        
        const scene = this.el;
        
        // Force scene visibility settings
        scene.object3D.visible = true;
        
        // Make everything transparent
        scene.setAttribute('background', 'color: transparent; transparent: true');
        
        // Add debug elements to make sure VR is working
        this.addDebugElements();
        
        // Show notification that VR is active
        this.showVRActiveMessage();
    },

    addDebugElements: function () {
        console.log('🧪 Adding debug elements...');
        
        const scene = this.el;
        
        // Add a simple test sphere to verify VR is working
        let testSphere = scene.querySelector('#debug-sphere');
        if (!testSphere) {
            testSphere = document.createElement('a-sphere');
            testSphere.id = 'debug-sphere';
            testSphere.setAttribute('position', '0 1.5 -3');
            testSphere.setAttribute('radius', '0.3');
            testSphere.setAttribute('material', 'color: #ff0080; transparent: true; opacity: 0.8');
            testSphere.setAttribute('animation', 'property: rotation; to: 0 360 0; loop: true; dur: 3000');
            scene.appendChild(testSphere);
            console.log('✅ Debug sphere added');
        }
        
        // Add floating text
        let debugText = scene.querySelector('#debug-text');
        if (!debugText) {
            debugText = document.createElement('a-text');
            debugText.id = 'debug-text';
            debugText.setAttribute('position', '0 2.5 -3');
            debugText.setAttribute('value', 'BeatSpace VR Active\nEnable Passthrough on Quest 3');
            debugText.setAttribute('align', 'center');
            debugText.setAttribute('color', '#ffffff');
            debugText.setAttribute('width', '8');
            scene.appendChild(debugText);
            console.log('✅ Debug text added');
        }
    },

    showVRActiveMessage: function () {
        // Create floating notification in VR space
        const scene = this.el;
        
        let notification = scene.querySelector('#vr-notification');
        if (!notification) {
            notification = document.createElement('a-plane');
            notification.id = 'vr-notification';
            notification.setAttribute('position', '0 1 -2');
            notification.setAttribute('width', '3');
            notification.setAttribute('height', '1');
            notification.setAttribute('material', 'color: #000; transparent: true; opacity: 0.7');
            
            const text = document.createElement('a-text');
            text.setAttribute('value', 'VR MODE ACTIVE\nDouble-tap side button for passthrough');
            text.setAttribute('align', 'center');
            text.setAttribute('position', '0 0 0.01');
            text.setAttribute('color', '#ffffff');
            text.setAttribute('width', '6');
            
            notification.appendChild(text);
            scene.appendChild(notification);
            
            // Auto-remove after 5 seconds
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 5000);
            
            console.log('📱 VR notification shown');
        }
    }
});

// Register the component
console.log('📝 Quest passthrough component registered'); 