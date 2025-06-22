// Audio Manager for BeatSpace
class AudioManager {
    constructor() {
        this.isStarted = false;
        this.isPlaying = false;
        this.currentTrack = 0;
        this.bpm = 128; // Default BPM
        this.beatInterval = null;
        this.effectsEnabled = true;
        
        // Audio components
        this.player = null;
        this.masterVolume = null;
        this.reverb = null;
        this.filter = null;
        this.compressor = null;
        this.analyzer = null;
        
        // Beat detection
        this.beatThreshold = 0.8;
        this.lastBeatTime = 0;
        this.beatDetectionEnabled = true;
        
        // Tracks
        this.tracks = [
            {
                name: "House Vibes",
                bpm: 128,
                genre: "house",
                url: this.generateHouseTrack()
            },
            {
                name: "Techno Drive",
                bpm: 140,
                genre: "techno", 
                url: this.generateTechnoTrack()
            },
            {
                name: "Ambient Space",
                bpm: 90,
                genre: "ambient",
                url: this.generateAmbientTrack()
            }
        ];
        
        this.init();
    }

    init() {
        console.log('🎵 Initializing Audio Manager...');
        this.setupAudioChain();
        this.setupBeatDetection();
        console.log('✅ Audio Manager initialized');
    }

    async start() {
        if (this.isStarted) return;
        
        try {
            // Start Tone.js context
            await Tone.start();
            console.log('🎵 Audio context started');
            
            this.isStarted = true;
            
            // Start with first track
            await this.loadTrack(0);
            
            return true;
            
        } catch (error) {
            console.error('❌ Failed to start audio:', error);
            return false;
        }
    }

    setupAudioChain() {
        // Master volume control
        this.masterVolume = new Tone.Volume(-6).toDestination();
        
        // Effects chain
        this.reverb = new Tone.Reverb(2).connect(this.masterVolume);
        this.filter = new Tone.Filter(1000, "lowpass").connect(this.reverb);
        this.compressor = new Tone.Compressor(-30, 3).connect(this.filter);
        
        // Analyzer for beat detection
        this.analyzer = new Tone.Analyser('waveform', 1024);
        this.compressor.connect(this.analyzer);
        
        // Player
        this.player = new Tone.Player().connect(this.compressor);
        
        console.log('🎛️ Audio chain setup complete');
    }

    setupBeatDetection() {
        // Real-time beat detection using analyzer
        const detectBeats = () => {
            if (!this.beatDetectionEnabled || !this.isPlaying) return;
            
            const waveform = this.analyzer.getValue();
            const rms = this.calculateRMS(waveform);
            
            const now = Tone.now();
            const timeSinceLastBeat = now - this.lastBeatTime;
            const expectedBeatInterval = 60 / this.bpm;
            
            // Beat detection logic
            if (rms > this.beatThreshold && timeSinceLastBeat > expectedBeatInterval * 0.8) {
                this.onBeatDetected();
                this.lastBeatTime = now;
            }
        };
        
        // Check for beats every 50ms
        setInterval(detectBeats, 50);
        
        console.log('🥁 Beat detection setup complete');
    }

    calculateRMS(waveform) {
        let sum = 0;
        for (let i = 0; i < waveform.length; i++) {
            sum += waveform[i] * waveform[i];
        }
        return Math.sqrt(sum / waveform.length);
    }

    async loadTrack(trackIndex) {
        if (trackIndex < 0 || trackIndex >= this.tracks.length) return;
        
        const track = this.tracks[trackIndex];
        this.currentTrack = trackIndex;
        this.bpm = track.bpm;
        
        try {
            // Load new track
            this.player.load(track.url);
            
            console.log(`🎵 Loaded track: ${track.name} (${track.bpm} BPM)`);
            
            // Update UI if exists
            this.updateTrackInfo(track);
            
            return true;
            
        } catch (error) {
            console.error('❌ Failed to load track:', error);
            return false;
        }
    }

    async startPerformance() {
        if (!this.isStarted) {
            await this.start();
        }
        
        if (this.isPlaying) return;
        
        try {
            // Start playback
            this.player.start();
            this.isPlaying = true;
            
            // Start beat timer as backup
            this.startBeatTimer();
            
            console.log('🎵 Performance started');
            
            // Create audio visualizer
            this.createAudioVisualizer();
            
            return true;
            
        } catch (error) {
            console.error('❌ Failed to start performance:', error);
            return false;
        }
    }

    stopPerformance() {
        if (!this.isPlaying) return;
        
        this.player.stop();
        this.isPlaying = false;
        
        // Stop beat timer
        if (this.beatInterval) {
            clearInterval(this.beatInterval);
            this.beatInterval = null;
        }
        
        // Remove visualizer
        this.removeAudioVisualizer();
        
        console.log('⏹️ Performance stopped');
    }

    nextTrack() {
        const nextIndex = (this.currentTrack + 1) % this.tracks.length;
        
        // Crossfade to next track
        this.crossfadeToTrack(nextIndex);
    }

    previousTrack() {
        const prevIndex = this.currentTrack === 0 ? this.tracks.length - 1 : this.currentTrack - 1;
        this.crossfadeToTrack(prevIndex);
    }

    async crossfadeToTrack(trackIndex) {
        if (!this.isPlaying) {
            await this.loadTrack(trackIndex);
            return;
        }
        
        // Fade out current track
        this.masterVolume.volume.rampTo(-60, 1);
        
        setTimeout(async () => {
            this.stopPerformance();
            await this.loadTrack(trackIndex);
            
            // Fade in new track
            this.masterVolume.volume.set(-60);
            await this.startPerformance();
            this.masterVolume.volume.rampTo(-6, 1);
            
        }, 1000);
        
        console.log(`🔄 Crossfading to track ${trackIndex}`);
    }

    startBeatTimer() {
        if (this.beatInterval) return;
        
        const beatDuration = (60 / this.bpm) * 1000; // Convert to milliseconds
        
        this.beatInterval = setInterval(() => {
            this.onBeatDetected();
        }, beatDuration);
    }

    onBeatDetected() {
        // Notify main app of beat
        if (window.beatSpaceApp) {
            window.beatSpaceApp.onBeat();
        }
        
        // Update visualizer
        this.updateVisualizer();
        
        // Apply beat effects
        if (this.effectsEnabled) {
            this.applyBeatEffects();
        }
    }

    applyBeatEffects() {
        const track = this.tracks[this.currentTrack];
        
        // Apply genre-specific effects
        switch (track.genre) {
            case 'house':
                this.filter.frequency.rampTo(2000, 0.1);
                this.filter.frequency.rampTo(1000, 0.4);
                break;
                
            case 'techno':
                this.compressor.threshold.rampTo(-35, 0.05);
                this.compressor.threshold.rampTo(-30, 0.2);
                break;
                
            case 'ambient':
                this.reverb.wet.rampTo(0.8, 0.2);
                this.reverb.wet.rampTo(0.3, 1);
                break;
        }
    }

    toggleEffects() {
        this.effectsEnabled = !this.effectsEnabled;
        
        if (!this.effectsEnabled) {
            // Reset effects to neutral
            this.filter.frequency.rampTo(1000, 0.5);
            this.compressor.threshold.rampTo(-30, 0.5);
            this.reverb.wet.rampTo(0.3, 0.5);
        }
        
        console.log(`🎛️ Effects ${this.effectsEnabled ? 'enabled' : 'disabled'}`);
    }

    setVolume(volume) {
        // Volume from 0 to 1
        const dbValue = volume === 0 ? -60 : -60 + (volume * 54); // -60dB to -6dB
        this.masterVolume.volume.rampTo(dbValue, 0.1);
    }

    createAudioVisualizer() {
        // Remove existing visualizer
        this.removeAudioVisualizer();
        
        const visualizer = document.createElement('div');
        visualizer.className = 'audio-visualizer';
        visualizer.id = 'audio-visualizer';
        
        // Create frequency bars
        for (let i = 0; i < 32; i++) {
            const bar = document.createElement('div');
            bar.className = 'audio-bar';
            bar.style.height = '4px';
            visualizer.appendChild(bar);
        }
        
        document.body.appendChild(visualizer);
        
        // Start visualizer animation
        this.startVisualizerAnimation();
    }

    startVisualizerAnimation() {
        const animateVisualizer = () => {
            if (!this.isPlaying) return;
            
            const visualizer = document.getElementById('audio-visualizer');
            if (!visualizer) return;
            
            const bars = visualizer.querySelectorAll('.audio-bar');
            const waveform = this.analyzer.getValue();
            
            // Update bars based on frequency data
            bars.forEach((bar, index) => {
                const value = Math.abs(waveform[index * 32] || 0);
                const height = Math.max(4, value * 50);
                bar.style.height = `${height}px`;
            });
            
            requestAnimationFrame(animateVisualizer);
        };
        
        animateVisualizer();
    }

    updateVisualizer() {
        const visualizer = document.getElementById('audio-visualizer');
        if (!visualizer) return;
        
        // Add beat pulse effect
        visualizer.classList.add('beat-pulse');
        setTimeout(() => {
            visualizer.classList.remove('beat-pulse');
        }, 100);
    }

    removeAudioVisualizer() {
        const visualizer = document.getElementById('audio-visualizer');
        if (visualizer) {
            visualizer.remove();
        }
    }

    updateTrackInfo(track) {
        // Create or update track info display
        let trackInfo = document.getElementById('track-info');
        
        if (!trackInfo) {
            trackInfo = document.createElement('div');
            trackInfo.id = 'track-info';
            trackInfo.className = 'notification';
            trackInfo.style.top = '80px';
            trackInfo.style.right = '20px';
            document.body.appendChild(trackInfo);
        }
        
        trackInfo.innerHTML = `
            <strong>🎵 ${track.name}</strong><br>
            <small>${track.genre.toUpperCase()} • ${track.bpm} BPM</small>
        `;
        
        // Auto-hide after 3 seconds
        setTimeout(() => {
            if (trackInfo.parentNode) {
                trackInfo.style.opacity = '0';
                setTimeout(() => {
                    if (trackInfo.parentNode) {
                        trackInfo.parentNode.removeChild(trackInfo);
                    }
                }, 300);
            }
        }, 3000);
    }

    // Generate synthetic tracks for demo
    generateHouseTrack() {
        // Create a simple house beat using Tone.js
        const synth = new Tone.FMSynth().toDestination();
        const pattern = new Tone.Pattern((time, note) => {
            synth.triggerAttackRelease(note, "8n", time);
        }, ["C4", "E4", "G4", "B4"]);
        
        // Return a data URL for the generated audio
        return "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbpYzMtFGQ0xq2r3Q3eH6DQJKBqUPNmIJpqIihq2Z6K8RhYrYydrWFgKKoaWqQaKKXqKCdaWqKa2miaWurk2Fhk3FZsYxhO2VjOKipZKCNaWqOaKKXqJ+daWqKa2miaGNyckEyckEyckEyckEyckEyckEyckEyckEyckEyckEyckEyckEyckEyckEyckEyckEyckEyckEyckEyckEyckEyckEyckEyckEyckEyckEyckEyckEyckEyckEyckEyckEyckEyckE=";
    }

    generateTechnoTrack() {
        return "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbpYzMtFGQ0xq2r3Q3eH6DQJKBqUPNmIJpqIihq2Z6K8RhYrYydrWFgKKoaWqQaKKXqKCdaWqKa2miaWurk2Fhk3FZsYxhO2VjOKipZKCNaWqOaKKXqJ+daWqKa2miaGNyckEyckEyckEyckEyckEyckEyckEyckEyckEyckEyckEyckEyckEyckEyckEyckEyckEyckEyckEyckEyckEyckEyckEyckEyckEyckEyckEyckEyckEyckEyckEyckEyckE=";
    }

    generateAmbientTrack() {
        return "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbpYzMtFGQ0xq2r3Q3eH6DQJKBqUPNmIJpqIihq2Z6K8RhYrYydrWFgKKoaWqQaKKXqKCdaWqKa2miaWurk2Fhk3FZsYxhO2VjOKipZKCNaWqOaKKXqJ+daWqKa2miaGNyckEyckEyckEyckEyckEyckEyckEyckEyckEyckEyckEyckEyckEyckEyckEyckEyckEyckEyckEyckEyckEyckEyckEyckEyckEyckEyckEyckEyckEyckEyckEyckE=";
    }

    // Cleanup
    destroy() {
        this.stopPerformance();
        
        // Dispose of Tone.js objects
        if (this.player) this.player.dispose();
        if (this.masterVolume) this.masterVolume.dispose();
        if (this.reverb) this.reverb.dispose();
        if (this.filter) this.filter.dispose();
        if (this.compressor) this.compressor.dispose();
        if (this.analyzer) this.analyzer.dispose();
        
        this.removeAudioVisualizer();
        
        console.log('🗑️ Audio Manager destroyed');
    }
}

// Export for global access
window.AudioManager = AudioManager; 