# HoloHelp - Enhanced AR Mobile Troubleshooting Assistant

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18+-blue.svg)](https://reactjs.org/)
[![Three.js](https://img.shields.io/badge/Three.js-AR-red.svg)](https://threejs.org/)

> **Revolutionary AR-powered mobile phone diagnostics with voice guidance and 3D component highlighting**

## 🚀 Overview

HoloHelp is an innovative AR (Augmented Reality) application that combines **computer vision**, **3D modeling**, and **AI-powered assistance** to provide step-by-step troubleshooting for mobile phones and general assembly/repair guidance for any appliance or furniture.

### ✨ Key Features

**📱 AR Mobile Phone Diagnostics**
- Real-time phone detection using computer vision
- **3D AR phone models** with realistic components
- **Component highlighting** for specific parts (battery, power button, etc.)
- **Voice-guided instructions** for each troubleshooting step
- **Particle effects** and progress visualization
- **Step-by-step AR overlays** with smooth animations

**🤖 AI-Powered Assistant**
- **Generic troubleshooting** for any furniture, appliance, or device
- **Voice interaction** - ask questions through speech
- **Assembly instructions** for ANY item (IKEA furniture, Samsung TV, etc.)
- **Gemini AI integration** for unlimited possibilities
- **Context-aware responses** based on detected devices

**🎯 Enhanced AR Features**
- **3D phone models** with detailed components
- **Holographic highlighting** of specific parts
- **Voice-guided step-by-step instructions**
- **Particle effects** for celebrations
- **Progress visualization** with completion tracking
- **Smooth animations** and realistic rendering

## 🛠 Technology Stack

### Frontend
- **React 18** - Modern UI framework
- **Vite** - Lightning-fast build tool
- **Three.js** - 3D graphics and AR rendering
- **Tailwind CSS** - Utility-first styling
- **Lucide React** - Beautiful icons
- **Web Speech API** - Voice recognition and synthesis

### Backend
- **Node.js** - Server runtime
- **Express.js** - Web framework
- **Multer** - File upload handling
- **CORS** - Cross-origin resource sharing

### AI Integration
- **Gemini AI** - Advanced AI assistance
- **Web Speech API** - Voice interaction
- **Computer Vision** - Object detection

## 🚀 Quick Start

### Prerequisites
- **Node.js 18+** 
- **npm** or **yarn**
- **Modern browser** with WebGL support
- **Camera access** for AR features

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/RahulRmCoder/holohelp.git
cd holohelp
```

2. **Install frontend dependencies**
```bash
npm install
```

3. **Install backend dependencies**
```bash
cd backend
npm install
```

4. **Start the backend server**
```bash
cd backend
npm start
```
Backend will run on `http://localhost:3001`

5. **Start the frontend development server**
```bash
cd .. # Back to root directory
npm run dev
```
Frontend will run on `http://localhost:5173`

### 🔧 Configuration

#### Environment Variables
Create a `.env` file in the root directory:
```env
# Gemini AI (Optional - for enhanced AI features)
VITE_GEMINI_API_KEY=your_gemini_api_key_here

# Backend URL (Default: http://localhost:3001)
VITE_BACKEND_URL=http://localhost:3001
```

#### Gemini AI Setup (Optional)
For enhanced AI features:
1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Add it to your `.env` file as `VITE_GEMINI_API_KEY`

## 📱 Usage

### AR Mobile Phone Troubleshooting

1. **Start Detection**
   - Click "🚀 Start Enhanced Phone AR Scanning"
   - Allow camera permissions
   - Point camera at your mobile phone

2. **Problem Selection**
   - Choose from available problems:
     - **Battery Drain** - Optimize battery usage
     - **Slow Performance** - Speed up your phone
     - **Overheating** - Cool down your device
     - **WiFi Issues** - Fix connectivity problems
     - **Storage Full** - Free up space

3. **AR Guidance**
   - Follow 3D AR instructions
   - Listen to voice guidance
   - Watch component highlighting
   - Complete each step with visual feedback

### AI Assistant

1. **Voice Interaction**
   - Click the microphone button
   - Ask questions like:
     - "How to assemble Samsung TV stand?"
     - "Fix my WiFi router"
     - "Build IKEA desk"

2. **Text Chat**
   - Type your question
   - Get detailed step-by-step instructions
   - Works for ANY item or appliance

## 🎯 Supported Features

### Mobile Phone Problems
| Problem | Description | AR Features |
|---------|-------------|-------------|
| **Battery Drain** | Optimize battery usage | Settings highlighting, app closure guidance |
| **Slow Performance** | Speed up device | Restart guidance, cache clearing |
| **Overheating** | Cool down device | Component cooling, app management |
| **WiFi Issues** | Fix connectivity | Network settings, signal visualization |
| **Storage Full** | Free up space | Storage visualization, cleanup guidance |

### AI Assistant Capabilities
- **Assembly instructions** for ANY item
- **Troubleshooting** for any device
- **Voice interaction** support
- **Context-aware** responses
- **Step-by-step guidance**

## 🏗 Architecture

### Frontend Structure
```
src/
├── components/
│   ├── ARCanvas.jsx          # Main AR rendering component
│   ├── HelpAssistant.jsx     # AI chat assistant
│   ├── ObjectDetector.jsx    # Computer vision detection
│   ├── MobileProblemSelector.jsx # Problem selection UI
│   └── ui/                   # Reusable UI components
├── services/
│   ├── api.js               # Backend API calls
│   └── geminiService.js     # AI integration
├── utils/
│   ├── voiceGuidance.js     # Voice features
│   └── arEffects.js         # AR effects and animations
└── App.jsx                  # Main application component
```

### Backend Structure
```
backend/
├── server.js                # Main Express server
├── routes/
│   ├── devices.js          # Device recognition
│   ├── instructions.js     # AR instructions
│   └── chat.js             # AI chat endpoints
└── data/
    └── instructions.json   # Troubleshooting database
```

## 🎨 AR Features Deep Dive

### 3D Phone Models
- **Realistic rendering** with PBR materials
- **Component separation** (screen, buttons, camera)
- **Dynamic screen content** showing actual phone UI
- **Smooth animations** and rotations

### Component Highlighting
- **Targeted highlights** for specific parts
- **Pulsing animations** to draw attention
- **Progress rings** showing completion
- **Floating arrows** for guidance

### Voice Guidance
- **Step-by-step narration** for each instruction
- **Problem-specific introductions**
- **Completion celebrations**
- **Multi-language support** (planned)

### Visual Effects
- **Particle systems** for celebrations
- **Smooth transitions** between steps
- **Progress visualization** with rings and bars
- **Component animations** (phone floating, rotating)

## 🔧 Development

### Available Scripts

```bash
# Frontend
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint

# Backend
npm start            # Start backend server
npm run dev          # Start with nodemon
npm test             # Run tests
```

### Adding New Problems

1. **Add to backend instructions** in `server.js`:
```javascript
"new_problem": {
  device_model: "Mobile_Phone_New_Fix",
  device_type: "mobile_phone",
  instruction_set_id: "phone-new-001",
  ar_enhanced: true,
  steps: [
    {
      step: 1,
      title: "Problem Step",
      description: "Step description",
      voiceover: "Voice guidance text",
      highlight: "ComponentName",
      position: [0, 0, 0],
      component_target: "target_component",
      ar_effects: ["highlight_component"],
      duration: 10000
    }
  ]
}
```

2. **Update problem selector** in `MobileProblemSelector.jsx`

3. **Add AR effects** in `ARCanvas.jsx`

### Testing

#### Manual Testing
1. **Camera functionality** - Test object detection
2. **AR rendering** - Verify 3D models load
3. **Voice guidance** - Test speech synthesis
4. **Step completion** - Verify progress tracking

#### Browser Support
- **Chrome/Edge** - Full support
- **Firefox** - WebGL support required
- **Safari** - iOS 12+ for AR features
- **Mobile browsers** - Camera access required

## 🌟 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Commit your changes**
   ```bash
   git commit -m 'Add amazing feature'
   ```
4. **Push to the branch**
   ```bash
   git push origin feature/amazing-feature
   ```
5. **Open a Pull Request**

### Development Guidelines
- Follow **React best practices**
- Use **TypeScript** for new features (planned)
- Add **comments** for complex AR logic
- Test on **multiple devices**
- Ensure **voice guidance** works properly

## 📚 API Documentation

### Backend Endpoints

#### Health Check
```
GET /health
```
Returns server status and AR capabilities.

#### Device Recognition
```
POST /api/recognize-device
Content-Type: multipart/form-data

{
  "detectedObjects": ["cell phone", "smartphone"]
}
```

#### Problem Selection
```
POST /api/phone-problem
Content-Type: application/json

{
  "problem": "battery_drain",
  "ar_enhanced": true
}
```

#### Chat Assistant
```
POST /api/chat
Content-Type: application/json

{
  "message": "How to fix WiFi?",
  "context": "AR_MODE",
  "deviceType": "mobile_phone"
}
```

## 📱 Mobile Support

### iOS
- **iOS 12+** for AR features
- **Safari** or **Chrome** browser
- **Camera permissions** required

### Android
- **Android 7+** for full functionality
- **Chrome** browser recommended
- **WebGL** support required

### PWA Features (Planned)
- **Offline mode** for instructions
- **Push notifications**
- **App-like experience**

## 🚀 Deployment

### Production Build
```bash
# Build frontend
npm run build

# Build backend
cd backend
npm run build
```

### Docker Deployment
```bash
# Build and run with Docker
docker-compose up --build
```

### Environment Variables for Production
```env
NODE_ENV=production
VITE_BACKEND_URL=https://your-backend-url.com
VITE_GEMINI_API_KEY=your_production_key
```

## 📊 Performance

### Optimization Features
- **Efficient AR rendering** with 60fps target
- **Optimized 3D models** with LOD
- **Smooth animations** with requestAnimationFrame
- **Memory management** for long sessions

### Browser Requirements
- **WebGL 2.0** support
- **Camera API** access
- **Web Speech API** for voice features
- **Modern ES6+** JavaScript support

## 🔐 Security

### Privacy
- **No data collection** without consent
- **Local processing** for sensitive operations
- **Secure API endpoints**
- **CORS protection**

### Camera Access
- **Permission-based** camera access
- **No image storage** on servers
- **Local processing** only

## 🗺 Roadmap

### Version 2.1 (Planned)
- [ ] **Multi-language support**
- [ ] **More device types** (tablets, smartwatches)
- [ ] **Cloud sync** for progress
- [ ] **Offline mode**

### Version 2.2 (Planned)
- [ ] **Advanced AR features** (hand tracking)
- [ ] **Video tutorials** integration
- [ ] **Community sharing** of fixes
- [ ] **Analytics dashboard**

### Version 3.0 (Future)
- [ ] **VR support** for immersive experience
- [ ] **AI-powered** automatic problem detection
- [ ] **IoT integration** for smart home devices
- [ ] **Enterprise features**

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Three.js** - Amazing 3D graphics library
- **React** - Powerful UI framework
- **Gemini AI** - Advanced AI assistance
- **OpenCV.js** - Computer vision capabilities
- **Web Speech API** - Voice interaction

## 📞 Support

### Get Help
- **GitHub Issues** - Report bugs and request features
- **Documentation** - Check this README and code comments
- **Community** - Join discussions in Issues

### Contact

- **GitHub**: [@RahulRmCoder](https://github.com/RahulRmCoder)

---

**Made with ❤️ by the HoloHelp Team**

*Revolutionizing device troubleshooting through AR technology* 🚀📱✨
