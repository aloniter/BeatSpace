// DJ Character Controller for BeatSpace
class DJCharacter {
    constructor() {
        this.djEntity = null;
        this.isSpawned = false;
        this.isPerforming = false;
        this.performanceStyle = 'house';
        this.currentPosition = { x: 0, y: 0, z: -2 };
        this.roomIntegrationEnabled = false;
        
        this.init();
    }

    init() {
        console.log('🎤 Initializing DJ Character...');
        
        // Get DJ character entity
        this.djEntity = document.querySelector('#dj-character');
        
        if (!this.djEntity) {
            console.error('❌ DJ character entity not found');
            return;
        }

        this.setupAnimations();
        this.setupInteractions();
        
        console.log('✅ DJ Character initialized');
    }

    setupAnimations() {
        // Setup different animation styles for different music genres
        this.animations = {
            house: {
                headBob: { duration: 1000, easing: 'easeInOutQuad' },
                bodyMove: { duration: 2000, rotation: '0 360 0' },
                armWave: { duration: 1500, alternate: true }
            },
            techno: {
                headBob: { duration: 600, easing: 'linear' },
                bodyMove: { duration: 1000, rotation: '0 360 0' },
                armWave: { duration: 800, alternate: true }
            },
            ambient: {
                headBob: { duration: 2000, easing: 'easeInOutSine' },
                bodyMove: { duration: 4000, rotation: '0 180 0' },
                armWave: { duration: 3000, alternate: true }
            }
        };
    }

    setupInteractions() {
        // Make DJ interactive
        if (this.djEntity) {
            this.djEntity.classList.add('interactive');
            
            // Add click/touch interactions
            this.djEntity.addEventListener('click', () => {
                this.onDJInteraction();
            });

            this.djEntity.addEventListener('mouseenter', () => {
                this.onDJHover();
            });

            this.djEntity.addEventListener('mouseleave', () => {
                this.onDJHoverExit();
            });
        }
    }

    spawn(position = null) {
        if (this.isSpawned) {
            console.log('ℹ️ DJ already spawned, repositioning...');
            this.reposition(position);
            return;
        }

        // Set position
        if (position) {
            this.currentPosition = position;
            this.djEntity.setAttribute('position', `${position.x} ${position.y} ${position.z}`);
        }

        // Make DJ visible
        this.djEntity.setAttribute('visible', 'true');
        
        // Start spawn animation
        this.playSpawnAnimation();
        
        // Start performance
        this.startPerformance();
        
        this.isSpawned = true;
        
        console.log('🎤 DJ spawned at position:', this.currentPosition);
        
        // Create spawn effects
        this.createSpawnEffects();
    }

    reposition(position) {
        if (!position) return;
        
        this.currentPosition = position;
        
        // Animate to new position
        this.djEntity.setAttribute('animation__move', {
            property: 'position',
            to: `${position.x} ${position.y} ${position.z}`,
            dur: 1000,
            easing: 'easeInOutQuad'
        });
        
        console.log('📍 DJ repositioned to:', position);
    }

    playSpawnAnimation() {
        // Scale up from 0
        this.djEntity.setAttribute('scale', '0 0 0');
        this.djEntity.setAttribute('animation__spawn', {
            property: 'scale',
            from: '0 0 0',
            to: '1 1 1',
            dur: 1000,
            easing: 'easeOutBounce'
        });

        // Rotate during spawn
        this.djEntity.setAttribute('animation__spawn-rotate', {
            property: 'rotation',
            from: '0 0 0',
            to: '0 360 0',
            dur: 1000,
            easing: 'easeInOutQuad'
        });
    }

    startPerformance() {
        if (this.isPerforming) return;
        
        this.isPerforming = true;
        
        // Start DJ animations based on current style
        this.playPerformanceAnimations();
        
        // Start turntable animations
        this.startTurntableAnimations();
        
        // Add DJ glow effect
        this.djEntity.classList.add('dj-glow');
        
        console.log('🎵 DJ performance started');
    }

    stopPerformance() {
        this.isPerforming = false;
        
        // Stop all animations
        this.stopAllAnimations();
        
        // Remove glow effect
        this.djEntity.classList.remove('dj-glow');
        
        console.log('⏹️ DJ performance stopped');
    }

    playPerformanceAnimations() {
        const style = this.animations[this.performanceStyle];
        
        // DJ body rotation
        const djBody = this.djEntity.querySelector('[mixin="dj-body"]');
        if (djBody) {
            djBody.setAttribute('animation__performance', {
                property: 'rotation',
                to: style.bodyMove.rotation,
                dur: style.bodyMove.duration,
                loop: true,
                easing: 'linear'
            });
        }

        // DJ head bobbing
        const djHead = this.djEntity.querySelector('[mixin="dj-head"]');
        if (djHead) {
            djHead.setAttribute('animation__headbob', {
                property: 'position',
                from: '0 1.2 0',
                to: '0 1.3 0',
                dur: style.headBob.duration,
                dir: 'alternate',
                loop: true,
                easing: style.headBob.easing
            });
        }

        // Arm movements
        const leftArm = djBody?.querySelector('[mixin="dj-arm"]:first-of-type');
        const rightArm = djBody?.querySelector('[mixin="dj-arm"]:last-of-type');
        
        if (leftArm) {
            leftArm.setAttribute('animation__wave', {
                property: 'rotation',
                from: '0 0 -30',
                to: '0 0 -60',
                dur: style.armWave.duration,
                dir: 'alternate',
                loop: true
            });
        }

        if (rightArm) {
            rightArm.setAttribute('animation__wave', {
                property: 'rotation',
                from: '0 0 30',
                to: '0 0 60',
                dur: style.armWave.duration + 200, // Slightly offset
                dir: 'alternate',
                loop: true
            });
        }
    }

    startTurntableAnimations() {
        const turntables = this.djEntity.querySelectorAll('a-cylinder[animation]');
        turntables.forEach((turntable, index) => {
            // Vary speed based on performance style
            const baseSpeed = this.performanceStyle === 'techno' ? 2000 : 3000;
            const speed = baseSpeed + (index * 200);
            
            turntable.setAttribute('animation', {
                property: 'rotation',
                to: index % 2 === 0 ? '0 360 0' : '0 -360 0',
                dur: speed,
                loop: true,
                easing: 'linear'
            });
        });
    }

    changePerformanceStyle() {
        const styles = ['house', 'techno', 'ambient'];
        const currentIndex = styles.indexOf(this.performanceStyle);
        const nextIndex = (currentIndex + 1) % styles.length;
        
        this.performanceStyle = styles[nextIndex];
        
        // Restart animations with new style
        if (this.isPerforming) {
            this.stopAllAnimations();
            setTimeout(() => {
                this.playPerformanceAnimations();
                this.startTurntableAnimations();
            }, 100);
        }
        
        // Change DJ appearance based on style
        this.updateDJAppearance();
        
        console.log('🎵 Performance style changed to:', this.performanceStyle);
    }

    updateDJAppearance() {
        const djBody = this.djEntity.querySelector('[mixin="dj-body"]');
        if (!djBody) return;

        // Change colors based on style
        const styleColors = {
            house: '#4CC3D9',
            techno: '#FF0080',
            ambient: '#00FF80'
        };

        djBody.setAttribute('material', `color: ${styleColors[this.performanceStyle]}; metalness: 0.2`);
    }

    onBeat() {
        if (!this.isSpawned) return;
        
        // Pulse effect on beat
        this.djEntity.setAttribute('animation__beat-pulse', {
            property: 'scale',
            from: '1 1 1',
            to: '1.05 1.05 1.05',
            dur: 100,
            dir: 'alternate',
            loop: 1
        });

        // Flash party lights
        this.flashPartyLights();
        
        // Create beat particles
        this.createBeatParticles();
    }

    flashPartyLights() {
        const lights = document.querySelectorAll('[id^="party-light"]');
        lights.forEach(light => {
            const currentIntensity = parseFloat(light.getAttribute('light').intensity) || 2;
            
            light.setAttribute('animation__beat-flash', {
                property: 'light.intensity',
                from: currentIntensity,
                to: currentIntensity + 1,
                dur: 100,
                dir: 'alternate',
                loop: 1
            });
        });
    }

    createBeatParticles() {
        const particleContainer = this.djEntity.querySelector('#music-particles');
        if (!particleContainer) return;

        // Create particle effect
        const particle = document.createElement('a-sphere');
        particle.setAttribute('radius', '0.05');
        particle.setAttribute('material', 'color: #ffffff; transparent: true; opacity: 0.8');
        particle.setAttribute('position', `${Math.random() * 2 - 1} 0 ${Math.random() * 2 - 1}`);
        
        // Animate particle
        particle.setAttribute('animation__float', {
            property: 'position.y',
            from: 0,
            to: 2,
            dur: 2000,
            easing: 'easeOutQuad'
        });
        
        particle.setAttribute('animation__fade', {
            property: 'material.opacity',
            from: 0.8,
            to: 0,
            dur: 2000
        });

        particleContainer.appendChild(particle);
        
        // Remove particle after animation
        setTimeout(() => {
            if (particle.parentNode) {
                particle.parentNode.removeChild(particle);
            }
        }, 2000);
    }

    createSpawnEffects() {
        // Create spawn particle burst
        const particleContainer = this.djEntity.querySelector('#music-particles');
        if (!particleContainer) return;

        for (let i = 0; i < 20; i++) {
            setTimeout(() => {
                const particle = document.createElement('a-sphere');
                particle.setAttribute('radius', '0.03');
                particle.setAttribute('material', 'color: #ff0080; transparent: true; opacity: 1');
                particle.setAttribute('position', '0 0 0');
                
                // Random direction
                const angle = (i / 20) * Math.PI * 2;
                const distance = 2;
                const targetX = Math.cos(angle) * distance;
                const targetZ = Math.sin(angle) * distance;
                
                particle.setAttribute('animation__burst', {
                    property: 'position',
                    to: `${targetX} 1 ${targetZ}`,
                    dur: 1000,
                    easing: 'easeOutQuad'
                });
                
                particle.setAttribute('animation__fade', {
                    property: 'material.opacity',
                    from: 1,
                    to: 0,
                    dur: 1000
                });

                particleContainer.appendChild(particle);
                
                setTimeout(() => {
                    if (particle.parentNode) {
                        particle.parentNode.removeChild(particle);
                    }
                }, 1000);
            }, i * 50);
        }
    }

    enableRoomIntegration() {
        this.roomIntegrationEnabled = true;
        
        // Enable floor detection
        const floorReference = document.querySelector('#floor-reference');
        if (floorReference) {
            floorReference.setAttribute('visible', 'true');
        }
        
        console.log('🏠 Room integration enabled');
    }

    onDJInteraction() {
        console.log('🎤 DJ interaction triggered');
        
        // Change performance style on interaction
        this.changePerformanceStyle();
        
        // Play interaction animation
        this.djEntity.setAttribute('animation__interact', {
            property: 'rotation',
            from: this.djEntity.getAttribute('rotation'),
            to: '0 360 0',
            dur: 500,
            easing: 'easeInOutQuad'
        });
    }

    onDJHover() {
        // Add hover glow
        this.djEntity.style.filter = 'brightness(1.2)';
    }

    onDJHoverExit() {
        // Remove hover effects
        this.djEntity.style.filter = '';
    }

    stopAllAnimations() {
        // Remove all animation components
        const elements = this.djEntity.querySelectorAll('*');
        elements.forEach(element => {
            const attributes = element.getAttributeNames();
            attributes.forEach(attr => {
                if (attr.startsWith('animation')) {
                    element.removeAttribute(attr);
                }
            });
        });
    }

    destroy() {
        if (this.djEntity) {
            this.djEntity.setAttribute('visible', 'false');
            this.stopAllAnimations();
        }
        
        this.isSpawned = false;
        this.isPerforming = false;
        
        console.log('🗑️ DJ character destroyed');
    }
}

// Export for global access
window.DJCharacter = DJCharacter; 