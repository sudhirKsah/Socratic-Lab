# 🎓 SocraticLab — AI-Powered Reverse-Learning & Socratic Platform

> **"If you want to master something, teach it."** — *Feynman Technique*

SocraticLab is an AI-powered reverse-learning educational platform built around the **Feynman Technique**. Instead of consuming passive lectures or listening to lectures or asking an AI to explain things to you, **you become the teacher**. You teach an AI student persona who holds realistic misconceptions, asks probing questions, and pushes back until you deliver a clear, accurate, and deep explanation.

---

## 🌟 Key Features

### 🎙️ 1. 100% Free Voice Mode (Speech-to-Text & Text-to-Speech)
- **Hands-Free Teaching**: Speak directly to your AI student using the built-in microphone button (Web Speech API).
- **AI Student Voice Output**: The AI student speaks its questions and confusion back to you out loud using browser speech synthesis.
- **Zero API Costs**: Runs 100% client-side in Google Chrome, Microsoft Edge, and Safari with zero extra billing!

### 📖 2. Lecture Mode (Reverse-Learning Pipeline)
- **Content Ingestion**: Write typed notes or upload **PDF / DOCX** lecture materials.
- **Dynamic AI Misconception Extraction**: The AI reads your lecture notes and extracts 3–4 authentic misconceptions and logic gaps tailored to what you explained.
- **First-Person Reflection**: The AI student writes a first-person summary reflecting how it interpreted your lecture (*"I think I understood X... but isn't Y true?"*).
- **Phase 2 Q&A**: Transition to interactive Q&A where the AI student asks clarifying questions based on your lecture.

### ⚡ 3. Socratic Mode (Live Back-and-Forth Chat)
- Jump directly into live, interactive teaching from Turn 1.
- **Student Speaks First**: The AI student opens the session with a contextual greeting and states its doubt/misconception.

### 🎒 4. Custom Persona Generator & Class Level System
- **Pre-Seeded Personas**: Choose from pre-generated personas spanning **Class 6–10, High School, B.Tech CS, and Postgraduate** levels.
- **AI Persona Generator**: Instantly generate new AI student personas (name, avatar, backstory, difficulty, and stubbornness 1–5) using LLM calls.

### 📚 5. Dedicated Sessions & Notes Hub (`/sessions`)
- **Active & Completed Sessions**: Revisit active sessions to continue teaching, or review completed session transcripts in read-only mode.
- **Teaching Materials Repository**: Automatically organizes your notes and uploaded files by **Subject** and **Topic** for review.

### 📊 6. Real-Time Evaluator & Live Delta Scoring
- Evaluator AI analyzes your explanation after every message for accuracy, clarity, and misconception resolution (+ / - delta).
- Receive real-time score updates, evaluative reasoning, and pedagogical encouragement via **Server-Sent Events (SSE)** streaming.

---

### 🔀 5. Dynamic Multi-Model Subject Router
- Automatically routes AI completion calls to optimal models based on the domain (e.g., Llama 3 / Qwen / DeepSeek via Groq & OpenRouter):
  - 🧮 **Math**: Abstract reasoning & step-by-step logic
  - ⚡ **Physics**: Conceptual physics & mathematical rigor
  - 🧪 **Chemistry**: Microscopic atomic theory & stoichiometry
  - 💻 **Programming**: Code logic, edge cases & algorithmic complexity
  - ✍️ **Writing**: Essay structure, thesis clarity & grammar mechanics

## 🏗️ Technical Stack

- **Frontend**: React 18, Vite, Tailwind CSS v4 (`@theme` tokens & CSS cascade layers), Zustand (State Management), Web Speech API, Axios, Lucide Icons, Server-Sent Events (SSE).
- **Backend**: Node.js, Express, MongoDB Atlas, Mongoose, Multer, `pdf-parse`, `mammoth` (DOCX parser).
- **AI Router & APIs**: Groq API (`llama-3.3-70b-versatile`), OpenRouter (`qwen-2.5-coder-32b`), DeepSeek API, with streaming SSE endpoints.

---

## 📂 Project Structure

```
Socratic Lab/
├── client/                     # React + Vite Frontend
│   ├── src/
│   │   ├── components/         # Reusable Components (AppNav, ProtectedRoute)
│   │   ├── pages/              # Router Views
│   │   │   ├── Landing.jsx     # Hero section & feature overview
│   │   │   ├── Login.jsx       # Authentication
│   │   │   ├── Dashboard.jsx   # Subject progress & real-time stats
│   │   │   ├── Setup.jsx       # 4-Step Configurator & AI Persona Generator
│   │   │   ├── LecturePhase1.jsx# Phase 1: Ingest text/PDF & generate reflection
│   │   │   ├── Chat.jsx        # Live SSE Chat + Voice Mode + Dynamic Hints
│   │   │   ├── Sessions.jsx    # Dedicated Sessions & Notes Repository
│   │   │   ├── Complete.jsx    # Mastery score breakdown card
│   │   │   └── Settings.jsx    # Profile settings
│   │   ├── services/           # Axios & SSE API client
│   │   └── store/              # Zustand Stores (authStore, sessionStore)
│   └── package.json
│
├── server/                     # Express + Node Backend
│   ├── src/
│   │   ├── controllers/        # Express Handlers (auth, lecture, persona, session)
│   │   ├── models/             # Mongoose Schemas (User, AIStudent, Session)
│   │   ├── services/           # AI Engines (aiService, evaluator, fileExtractor, promptBuilder, subjectRouter)
│   │   ├── seed.js             # Pre-seeded AI Personas
│   │   └── index.js            # Express Entrypoint
│   ├── .env.example
│   └── package.json
│
└── README.md                   # Project Documentation
```

---

## ⚡ Quick Start Guide

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **MongoDB**: MongoDB Atlas URI or local instance
- **API Keys**: Groq API Key (or OpenRouter / DeepSeek key)

---

### 1. Backend Setup

```bash
# Navigate to server directory
cd server

# Install dependencies
npm install

# Create environment configuration
cp .env.example .env
```

Set environment variables in `server/.env`:
```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/socraticlab
JWT_SECRET=your_super_secret_jwt_key
GROQ_API_KEY=gsk_your_groq_api_key_here
DEEPSEEK_API_KEY=sk-...
OPENROUTER_API_KEY=your_openrouter_key
```

Seed database with pre-configured student personas:
```bash
npm run seed
```

Start Express server:
```bash
npm start
# Server runs on http://localhost:5000
```

---

### 2. Frontend Setup

```bash
cd client
npm install
npm run dev
# Frontend runs on http://localhost:5173
```

---

### 3. Concurrent Launch (Root)

From the root directory:
```bash
npm install
npm run dev
```

---

## 🎯 How The Teaching Loop Works

```
┌──────────────────────────────────────────────────────────┐
│                   1. Configure Session                   │
│   Select Subject, Class Level (Grade 6-10, B.Tech) &     │
│   AI Student Stubbornness or Generate Custom Persona     │
└────────────────────────────┬─────────────────────────────┘
                             │
                             ▼
┌──────────────────────────────────────────────────────────┐
│             2. Teach (Lecture or Socratic)               │
│   Write/upload notes (Lecture Mode) or start live chat   │
│   with student asking first question (Socratic Mode)     │
└────────────────────────────┬─────────────────────────────┘
                             │
                             ▼
┌──────────────────────────────────────────────────────────┐
│            3. Dynamic AI Misconception Extraction        │
│   AI extracts realistic misconceptions from your material │
│   and generates a first-person student reflection        │
└────────────────────────────┬─────────────────────────────┘
                             │
                             ▼
┌──────────────────────────────────────────────────────────┐
│             4. Interactive Voice & SSE Chat              │
│   Answer student questions via Free Mic Voice Mode ->    │
│   Real-time evaluator scores explanation (+/- delta)    │
└────────────────────────────┬─────────────────────────────┘
                             │
                             ▼
┌──────────────────────────────────────────────────────────┐
│                 5. Mastery Certificate                   │
│   Reach 85%+ understanding score to complete session     │
│   and view complete performance report                   │
└──────────────────────────────────────────────────────────┘
```

---
