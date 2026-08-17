# Speak2Prep: AI-Powered Oral Exam Preparation

**Your personal AI examiner cum assistant for technical interview and viva preparation**

Speak2Prep is an innovative web application that currently helps you practice for technical oral interviews and vivas using real-time voice conversations with an AI examiner. Simply provide your syllabus or interview topics, and our AI will conduct realistic technical interview sessions with instant feedback.

## 🎯 What is Speak2Prep?

Speak2Prep simulates live technical oral interviews with an AI examiner that:
- **Speaks naturally** using advanced voice AI
- **Asks targeted questions** based on your syllabus or role-specific topics
- **Listens actively** to your answers through your microphone
- **Evaluates responses** in real-time
- **Generates scorecards** to track your progress
- **Adapts difficulty** to your level (Beginner, Intermediate, Advanced)

Perfect for:
- Engineering students preparing for vivas
- Professionals preparing for job interviews
- Technical certification exam preparation
- Building confidence in public speaking and technical communication

## ✨ Key Features

- **Voice-Based Interaction**: Speak naturally with an AI examiner through your microphone
- **Smart Syllabus Parsing**: Upload course materials and let AI identify key topics to cover
- **Multiple Examiner Personas**: Choose interview style (Strict Professor, Friendly Mentor, etc.)
- **Role-Specific Preparation**: Prepare for specific positions (Application Security Engineer, Data Scientist, etc.)
- **Real-Time Evaluation**: Get instant feedback on your answers
- **Progress Tracking**: View detailed scorecards and performance analytics
- **Custom Difficulty Levels** [In progress]: Adjust question difficulty to match your preparation level

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- A Google Gemini API key
- Firebase credentials (for authentication)
- A modern web browser with microphone access

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-repo/speak2prep.git
   cd speak2prep
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_FIRE_API_KEY=your_firebase_key
   NEXT_PUBLIC_FIRE_AUTH_DOMAIN=your_auth_domain
   NEXT_PUBLIC_PROJECT_ID=your_project_id
   NEXT_PUBLIC_STORAGE_BUCKET=your_storage_bucket
   NEXT_PUBLIC_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_APP_ID=your_app_id
   NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   
   Navigate to `http://localhost:3000`

## 📖 How to Use

1. **Sign In**: Create an account or log in with your credentials
2. **Upload Syllabus**: Paste your course syllabus or interview topics
3. **Select Your Role**: Choose the position you're preparing for
4. **Pick Difficulty** [In progress]: Select your current skill level
5. **Choose Examiner**: Pick your preferred interviewer persona
6. **Start Interview**: Allow microphone access and begin speaking
7. **Review Feedback**: Check your scorecard and areas for improvement

## 🏗️ Project Structure

```
speak2prep/
├── app/
│   ├── api/                    # API endpoints
│   │   ├── eval-turn/         # Evaluate individual responses
│   │   ├── generate-drill/    # Generate practice questions
│   │   ├── generate-scorecard/# Create performance reports
│   │   ├── prep-session/      # Initialize interview session
│   │   ├── prep-turn/         
│   │   └── syllabus-parse/    # Parse curriculum input
│   ├── components/             # React components
│   │   ├── LoginModal.jsx     # Authentication UI
│   │   └── PrepVoiceSession.jsx # Main voice interview interface
│   ├── context/                # React context (Auth state)
│   ├── service/                # Business logic
│   │   ├── initFirebase.js    # Firebase setup
│   │   └── firebase/          # Firebase services
│   │       ├── auth.js        # Authentication
│   │       └── firestore.js   # Database operations
│   ├── layout.js               # App layout
│   ├── page.js                 # Home page
│   └── globals.css             # Global styles
├── public/
│   └── pcm-processor.js        # Audio processing utility
├── package.json                # Dependencies
├── next.config.mjs             # Next.js configuration
├── jsconfig.json               # JavaScript config
├── eslint.config.mjs           # Code quality rules
├── postcss.config.mjs          # CSS processing
└── README.md                   # This file
```

## 🔧 Technology Stack

- **Frontend**: React 19, Next.js 16, Tailwind CSS
- **Backend**: Next.js API Routes
- **AI Engine**: Google Gemini API (with voice capabilities)
- **Authentication**: Firebase Auth
- **Database**: Firebase Firestore
- **Styling**: PostCSS, Tailwind CSS
- **Code Quality**: ESLint

## 🎙️ How It Works

1. **Syllabus Processing**: Your course material is analyzed to extract key topics and learning outcomes
2. **Session Setup**: AI creates a personalized interviewer with specific expertise and interview style
3. **Live Interview**: Real-time voice conversation using WebSocket connection to Google Gemini
4. **Response Evaluation**: Each answer is evaluated for correctness, depth, and clarity
5. **Feedback Generation**: Detailed scorecard highlights strengths and areas for improvement

## 🔐 Privacy & Security

- Firebase authentication ensures secure user access
- All conversation data is encrypted
- Audio is processed through secure Google Cloud channels
- Your syllabus and personal information are stored privately
- No data is shared with third parties

## 📚 Available Endpoints

| Endpoint | Purpose |
|----------|---------|
| `/api/syllabus-parse` | Parse syllabus and generate curriculum blueprint |
| `/api/prep-session` | Initialize interview session with AI examiner |
| `/api/generate-drill` | Generate practice drills on specific topics |
| `/api/eval-turn` | Evaluate user's response to a question |
| `/api/generate-scorecard` | Create comprehensive performance report |

## 🐛 Troubleshooting

**Microphone not working?**
- Check browser permissions for microphone access
- Ensure no other app is using your microphone
- Test microphone in browser settings

**AI not responding?**
- Verify your Gemini API key is valid
- Check internet connection
- Ensure API quota hasn't been exceeded

**Firebase errors?**
- Verify all environment variables are correctly set
- Check Firebase project is active
- Ensure authentication is enabled in Firebase Console

## 🚧 Development

### Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Create production build
npm run start    # Run production server
npm run lint     # Check code quality
```

### Code Style

This project uses ESLint for code quality. Run `npm run lint` before committing changes.

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Powered by [Google Gemini API](https://ai.google.dev/)
- Hosted with [Firebase](https://firebase.google.com/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)

## 💬 Support & Feedback

Have questions or feedback? Please open an issue on GitHub or reach out to our team.

---

**Ready to feel calm in your next big preparation? Start with Speak2Prep today! 🎓**
