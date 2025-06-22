# 🎧 BeatSpace - Mixed Reality DJ Experience

A cutting-edge Mixed Reality DJ experience for Meta Quest 3 that brings a virtual DJ character into your real room using WebXR and passthrough technology.

## ✨ Features

- **🥽 Mixed Reality Experience**: DJ appears in your actual room using Quest 3's passthrough
- **🎤 Interactive 3D DJ Character**: Fully animated DJ with responsive behaviors
- **🎵 Real-time Audio Processing**: Beat detection and dynamic effects using Tone.js
- **🏠 Room-Scale Tracking**: Automatically detects your room layout and positions DJ optimally
- **👋 Hand Tracking Support**: Control the experience with your hands
- **🎨 Dynamic Lighting**: Party lights that sync with the music
- **📱 Progressive Web App**: Install directly on your Quest 3

## 🎮 How to Play

1. **Put on your Meta Quest 3** and ensure passthrough is enabled
2. **Open the game** in your Quest browser or install as PWA
3. **Click "Enable Audio"** to activate the audio system
4. **Click "Enter VR Party"** to start the mixed reality experience
5. **Click "Spawn DJ"** to place the DJ character in your room
6. **Interact with controls** to change music and effects

### 🎛️ Controls

- **Spawn DJ**: Places the DJ character in your room
- **Change Track**: Cycles through different music genres (House, Techno, Ambient)
- **Toggle Effects**: Enables/disables audio effects and party lighting
- **Hand Tracking**: Point and gesture to interact with the DJ

## 🛠️ Technical Implementation

### Technologies Used

- **WebXR**: For VR/AR functionality and passthrough
- **A-Frame**: 3D scene management and VR framework
- **Tone.js**: Professional audio processing and synthesis
- **Progressive Web App**: For installation on Quest devices

### Architecture

```
BeatSpace/
├── index.html              # Main entry point
├── manifest.json           # PWA configuration
├── css/
│   └── styles.css         # UI and VR styling
└── js/
    ├── main.js            # Core application logic
    ├── dj-character.js    # DJ character controller
    ├── audio-manager.js   # Audio system and beat detection
    └── room-tracking.js   # Mixed reality room integration
```

### Key Components

1. **BeatSpaceApp**: Main application controller
2. **DJCharacter**: Manages 3D DJ model and animations
3. **AudioManager**: Handles music playback and effects
4. **RoomTracker**: WebXR room detection and spatial anchoring

## 🚀 Deployment

### Option 1: Local Development

1. **Clone/Download** the project files
2. **Serve locally** using any web server:
   ```bash
   # Using Python
   python -m http.server 8000
   
   # Using Node.js
   npx serve .
   
   # Using PHP
   php -S localhost:8000
   ```
3. **Access on Quest 3** by navigating to your local IP address

### Option 2: Web Hosting

1. **Upload files** to any web hosting service (GitHub Pages, Netlify, Vercel, etc.)
2. **Ensure HTTPS** is enabled (required for WebXR)
3. **Access via Quest 3 browser**

### Option 3: Quest Store (Future)

The app is designed to be submitted to the Meta Quest Store as a WebXR PWA.

## 📱 Installation on Meta Quest 3

1. Open the app in your Quest 3 browser
2. Look for the "Install" prompt or use browser menu
3. The app will be added to your library as a PWA
4. Launch directly from your Quest home screen

## 🎯 System Requirements

- **Meta Quest 3** (required for Mixed Reality features)
- **Latest Quest firmware** with WebXR support
- **Stable internet connection** for initial load
- **Clear play space** of at least 2x2 meters

## 🔧 Customization

### Adding Your Own Music

Replace the audio generation functions in `js/audio-manager.js`:

```javascript
// Replace with your own track URLs
this.tracks = [
    {
        name: "Your Track Name",
        bpm: 128,
        genre: "house",
        url: "path/to/your/music.mp3"
    }
];
```

### Modifying DJ Appearance

Edit the DJ character mixins in `index.html`:

```html
<a-mixin id="dj-body" 
    geometry="primitive: cylinder; height: 2; radius: 0.3"
    material="color: #YOUR_COLOR; metalness: 0.2">
</a-mixin>
```

### Custom Room Layouts

Modify the room detection parameters in `js/room-tracking.js`:

```javascript
this.minRoomSize = { width: 3, depth: 3 }; // Adjust minimum room size
this.maxRoomSize = { width: 8, depth: 8 }; // Adjust maximum room size
```

## 🐞 Troubleshooting

### Common Issues

**WebXR not working:**
- Ensure your Quest 3 has the latest firmware
- Check that WebXR is enabled in browser settings
- Try refreshing the page

**Audio not playing:**
- Click "Enable Audio" button first
- Check Quest audio settings
- Ensure browser has audio permissions

**DJ not spawning:**
- Make sure you're in VR mode first
- Try repositioning in your play space
- Check console for error messages

**Performance issues:**
- Clear browser cache
- Restart Quest 3
- Ensure adequate lighting for tracking

## 🎵 Music Genres Supported

- **House**: 128 BPM, classic 4/4 beat with smooth transitions
- **Techno**: 140 BPM, driving beats with compression effects
- **Ambient**: 90 BPM, atmospheric with reverb-heavy textures

## 🤝 Contributing

Feel free to fork this project and add your own features:

- Custom DJ models and animations
- Additional music genres
- New visual effects
- Multiplayer support
- Voice commands

## 📄 License

This project is open source and available under the MIT License.

## 🙏 Acknowledgments

- **A-Frame Community** for the excellent WebXR framework
- **Tone.js Team** for professional audio processing
- **Meta** for WebXR and passthrough APIs
- **WebXR Community** for pioneering mixed reality on the web

---

**Ready to party? Put on your Quest 3 and let BeatSpace transform your room into the ultimate dance floor! 🎉** 