# 🥽 Meta Quest 3 Setup Guide for BeatSpace

## 🔧 Fixed Issues

I've just fixed several critical issues for Quest 3 compatibility:

1. ✅ **Button Event Handling** - Added proper click event handling
2. ✅ **Passthrough Configuration** - Added Quest 3 specific passthrough component
3. ✅ **WebXR Session Management** - Improved AR/VR session detection
4. ✅ **Transparent Background** - Fixed black screen issue
5. ✅ **Script Loading** - Added fallback initialization

## 🚀 Step-by-Step Setup

### **1. Upload Updated Files**
Make sure you upload these new/updated files to your GitHub repository:
- `js/quest-passthrough.js` (NEW - Quest 3 specific component)
- `js/main.js` (UPDATED - Better error handling)
- `index.html` (UPDATED - Passthrough configuration)

### **2. Access on Quest 3**
1. **Open Quest 3 Browser**
2. **Navigate to:** `https://yourusername.github.io/your-repository-name`
3. **IMPORTANT:** Must be HTTPS (GitHub Pages provides this automatically)

### **3. Enable Audio First**
- **ALWAYS click "Enable Audio" button FIRST**
- This initializes the audio system required for the experience

### **4. Enter VR Mode**
- **Click "Enter VR Party"**
- The scene should load (no more black screen!)

### **5. Enable Passthrough**
Once in VR mode, enable passthrough using one of these methods:

**Method A - Hand Gesture:**
- Make a **fist** with your dominant hand
- **Point thumb down** (like a "thumbs down")
- Hold for 1-2 seconds

**Method B - Physical Button:**
- **Double-tap** the side/power button on your Quest 3

**Method C - Voice Command:**
- Say **"Hey Meta, show passthrough"**

**Method D - Settings:**
- Open Quest menu → Settings → Passthrough

### **6. Spawn Your DJ**
- Once passthrough is active, click **"Spawn DJ"**
- The DJ should appear in your real room!

## 🔍 Troubleshooting

### **Issue: Buttons Not Working**
- **Check Console:** Press F12 in browser, look for errors
- **Refresh Page:** Sometimes helps with script loading
- **Clear Cache:** Quest Browser → Settings → Clear Data

### **Issue: Black Screen in VR**
- **Updated Fix Applied:** The new quest-passthrough component should fix this
- **Force Passthrough:** Use hand gesture or voice command
- **Check Lighting:** Ensure adequate lighting in your room

### **Issue: No Audio**
- **Click "Enable Audio" First:** Required for Web Audio API
- **Check Volume:** Quest 3 volume settings
- **Allow Permissions:** Browser may ask for microphone access

### **Issue: DJ Not Spawning**
- **Enter VR First:** Must be in VR mode before spawning DJ
- **Check Position:** Move around your play space
- **Console Errors:** Check browser console for errors

### **Issue: No Passthrough**
- **Quest 3 Firmware:** Ensure latest firmware is installed
- **Room Lighting:** Need adequate lighting for tracking
- **Clear Guardian:** Reset your guardian boundary
- **Room Setup:** Ensure you've completed initial room setup

## 🧪 Debug Information

Open your browser console (F12) and look for these messages:

**✅ Good Signs:**
- `🎧 Creating BeatSpace app instance...`
- `✅ BeatSpace initialization complete`
- `🔍 Quest passthrough component registered`
- `✅ AR session detected - passthrough should be active`

**❌ Problem Signs:**
- `❌ UI buttons not found!`
- `❌ WebXR not available`
- `❌ No XR session found`

## 🎯 Performance Tips

1. **Clear Space:** Ensure 6x6 feet minimum
2. **Good Lighting:** Bright, even lighting works best
3. **Stable WiFi:** Strong connection for smooth experience
4. **Close Other Apps:** Free up Quest 3 resources

## 🆘 Still Having Issues?

**Check these things:**

1. **HTTPS Required:** GitHub Pages automatically provides this
2. **Latest Quest Firmware:** Update your Quest 3
3. **Browser Cache:** Clear Quest browser cache
4. **Guardian Setup:** Complete room setup in Quest settings
5. **Developer Mode:** Not required, but can help with debugging

**Console Debug Commands:**
```javascript
// Check if app loaded
console.log(window.beatSpaceApp);

// Check WebXR support
navigator.xr.isSessionSupported('immersive-ar').then(console.log);

// Check passthrough component
document.querySelector('a-scene').components['quest-passthrough'];
```

## 🎉 Success Indicators

When everything works correctly, you should see:

1. **Start Screen** loads with working buttons
2. **"Enable Audio"** shows success notification
3. **VR Mode** shows scene with party lights (not black)
4. **Passthrough** shows your real room with VR elements
5. **DJ Character** spawns and starts performing
6. **Music** plays with beat synchronization
7. **Hand Tracking** allows interaction with DJ

---

**🎊 Ready to party in mixed reality! Your DJ is waiting to drop some beats in your living room!** 