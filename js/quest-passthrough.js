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
        
        const session = this.el.xrSession;
        if (!session) {
            console.log('❌ No XR session found');
            return;
        }

        console.log('Session mode:', session.mode);
        
        // Check if this is an AR session (passthrough)
        if (session.mode === 'immersive-ar') {
            console.log('✅ AR session detected - passthrough should be active');
            this.enablePassthroughFeatures();
        } else {
            console.log('ℹ️ VR session - attempting passthrough compatibility');
            this.enableVRPassthrough();
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
    }
});

// Register the component
console.log('📝 Quest passthrough component registered'); 