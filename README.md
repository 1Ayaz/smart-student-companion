# 🎓 Smart Student Companion

A comprehensive AI-powered study companion application built for students, featuring intelligent interview preparation, personalized study planning, flashcards, and an AI tutor powered by Google Gemini 2.0 Flash.

## 🌟 Live Demo

**Deployed Application:** [https://smart-student-companion07.web.app](https://smart-student-companion07.web.app)

## ✨ Features

### 1. **Smart AI Interview** 🎤
- Voice-enabled interactive mock interviews
- Real-time speech recognition and synthesis
- Premium 3D sphere visualization with voice-reactive animations
- Automatic silence detection for natural conversation flow
- Resume upload and analysis using **AWS backend** (API Gateway + Lambda + S3)
- AI responses powered by AWS Bedrock

### 2. **AI Tutor** 🤖
- Interactive chat-based learning assistant
- Subject-specific help and explanations
- Real-time markdown rendering with LaTeX support
- Code syntax highlighting
- Clear conversation management

### 3. **Study Planner** 📅
- Personalized study schedule generation
- Multiple subject management
- Customizable study hours and difficulty levels
- Beautiful gradient UI with smooth animations
- Progress tracking

### 4. **Study Timer** ⏱️
- Pomodoro-style focus sessions
- Session tracking and history
- Beautiful visual progress indicators
- Break reminders

### 5. **Flashcards** 🗂️
- Create and manage flashcard decks
- Interactive flip animations
- Subject categorization
- Firebase cloud storage

### 6. **Dashboard** 📊
- Overview of all features
- Quick access navigation
- Beautiful gradient card design
- User profile integration

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI Framework
- **Vite** - Build tool and dev server
- **React Router v6** - Navigation
- **Three.js** - 3D graphics for sphere visualization
- **@react-three/fiber & @react-three/drei** - React renderer for Three.js

### AI & Backend Services
- **Google Gemini 2.0 Flash** - Powers AI Tutor and Study Planner
- **AWS Bedrock** - Powers Smart Interview AI responses
- **Firebase**:
  - Authentication (Google Sign-in)
  - Firestore Database
  - Hosting
- **AWS** (for Smart Interview):
  - API Gateway - Resume upload endpoint
  - Lambda functions - Backend processing
  - S3 storage - Resume file storage

### Speech APIs
- **Web Speech API** - Speech recognition
- **Speech Synthesis API** - Text-to-speech

## 🚀 Getting Started

### Prerequisites
- Node.js >= 16.x
- npm or yarn
- Firebase account
- Google Gemini API key
- AWS account (for Smart Interview feature)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/smart-student-companion.git
   cd smart-student-companion
   cd ssc-v3
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the `ssc-v3` directory:
   ```bash
   cp .env.example .env
   ```
   
   Fill in your API keys in `.env`:
   ```env
   # Gemini API Key
   VITE_GEMINI_API_KEY=your_gemini_api_key_here
   
   # Firebase Configuration
   VITE_FIREBASE_API_KEY=your_firebase_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
   
   # AWS Configuration
   VITE_AWS_UPLOAD_URL=your_aws_upload_endpoint_url
   ```

4. **Run development server**
   ```bash
   npm run dev
   ```
   
   The app will be available at `http://localhost:5173`

### Build for Production

```bash
npm run build
```

The production build will be created in the `dist` folder.

## 🔑 API Keys Setup

### Google Gemini API
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Add it to your `.env` as `VITE_GEMINI_API_KEY`

### Firebase Setup
1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com)
2. Enable Authentication (Google provider)
3. Create a Firestore database
4. Enable Firebase Hosting
5. Copy your config from Project Settings → General → Your apps
6. Add all Firebase config values to `.env`

### AWS Setup (Optional - for Smart Interview)
1. Set up AWS API Gateway and Lambda for resume upload
2. Create S3 bucket for resume storage
3. Add the upload endpoint URL to `.env`

## 📦 Project Structure

```
ssc-v3/
├── src/
│   ├── components/          # React components
│   │   ├── AITutor.jsx
│   │   ├── InterviewInterface.jsx
│   │   ├── PerplexitySphere.jsx
│   │   ├── StudyPlanner.jsx
│   │   ├── StudyTimer.jsx
│   │   └── ...
│   ├── styles/              # CSS files
│   ├── firebase.js          # Firebase configuration
│   ├── gemini-api.js        # Gemini API integration
│   ├── aws-api.js           # AWS integration
│   └── App.jsx              # Main app component
├── public/                  # Static assets
├── .env                     # Environment variables (not in repo)
├── .env.example             # Template for environment variables
├── package.json
└── vite.config.js
```

## 🎨 Key Features Breakdown

### Premium Sphere Animation
- 360° rotation with shape-morphing effects
- Three animation phases: compact → dispersed → exploded
- Voice-reactive pulsing during AI responses
- Subtle animation during user speech
- Smooth particle transitions

### Automatic Interview Flow
- 2-second silence detection for auto-submit
- Auto-restart listening after AI response
- Manual override button for noisy environments
- Natural conversation experience

### Modern UI Design
- Gradient backgrounds and glass-morphism effects
- Smooth animations and transitions
- Responsive design for all devices
- Premium color scheme (orange/black theme)

## 🔒 Security

- All API keys stored in environment variables
- `.env` file excluded from Git
- Firebase security rules configured
- No sensitive data hardcoded in source

## 📝 License

This project is created for educational purposes and hackathon submission.

## 👨‍💻 Author

**Mohammed Ayaz**
- Email: mohammadayaz2006@gmail.com
- Aditya College of Engineering

## 🙏 Acknowledgments

- Google Gemini 2.0 Flash for AI capabilities
- Firebase for backend services
- Three.js community for 3D visualization
- React and Vite teams for amazing tools

---

Built with ❤️ for Hack2Skill 2025
