# 🎓 SocraticLab — AI-Powered Reverse-Learning Platform

> **"If you want to master something, teach it."** — *Feynman Technique*

SocraticLab is an AI-powered educational platform designed around the **Feynman Technique**. Instead of consuming passive lectures or asking AI to explain topics to you, **you become the teacher**. You teach an AI student persona who holds authentic misconceptions, asks probing questions, and pushes back until you deliver a clear, accurate, and deep explanation.

---

## 🌟 Key Features

### 📖 1. Lecture Mode (Primary Workflow)
- **Content Ingestion**: Write a full lecture or upload **PDF / DOCX notes**.
- **Dynamic AI Misconception Extraction**: The AI analyzes your lecture content and dynamically extracts 3–4 realistic misconceptions, logic gaps, or false assumptions specific to what you taught (or glossed over).
- **First-Person Student Reflection**: The AI student writes a first-person summary reflecting how it interpreted your lecture ("I think I understood X... but isn't Y true?").
- **Phase 2 Q&A**: Enter an interactive Q&A where the AI student challenges you directly on its lecture-derived misconceptions.

### ⚡ 2. Socratic Mode (Live Chat)
- Jump straight into interactive, live back-and-forth teaching from Turn 1.
- The AI student is assigned dynamic topic-based misconceptions tailored to your chosen subject and difficulty level.

### 🎒 3. Dynamic Student Persona Generator & Class Levels
- Choose from pre-seeded personas spanning **Class 1–10, High School, B.Tech Engineering, and College levels**.
- **Customize Traits**: Adjust difficulty (*Beginner*, *Intermediate*, *Advanced*) and **Stubbornness Level (1 to 5)**.
- **AI Persona Generator**: Dynamically generate new AI student personas (name, avatar, backstory) using LLM calls on the fly.

### 📊 4. Real-Time Evaluator & Delta Scoring
- After every message, an evaluator AI assesses your explanation for accuracy, clarity, and targeted misconception resolution.
- Receives real-time **+ / - delta score updates**, evaluative reasoning, and friendly encouragement via Server-Sent Events (SSE).

### 🔀 5. Dynamic Multi-Model Subject Router
- Automatically routes AI completion calls to optimal models based on the domain (e.g., Llama 3 / Qwen / DeepSeek via Groq & OpenRouter):
  - 🧮 **Math**: Abstract reasoning & step-by-step logic
  - ⚡ **Physics**: Conceptual physics & mathematical rigor
  - 🧪 **Chemistry**: Microscopic atomic theory & stoichiometry
  - 💻 **Programming**: Code logic, edge cases & algorithmic complexity
  - ✍️ **Writing**: Essay structure, thesis clarity & grammar mechanics

---

## 🏗️ Architecture & Technical Stack

```
                        ┌─────────────────────────────────────────┐
                        │              React Frontend             │
                        │    (Vite + Tailwind v4 + Zustand)       │
                        └────────────────────┬────────────────────┘
                                             │ HTTP / SSE Streaming
                                             ▼
                        ┌─────────────────────────────────────────┐
                        │             Express Backend             │
                        │        (Node.js + MongoDB Atlas)        │
                        └───────┬─────────────────────────┬───────┘
                                │                         │
             ┌──────────────────┴──────────┐   ┌──────────┴──────────────────┐
             │ Dynamic Misconception &     │   │ Real-time Evaluator Engine  │
             │ AI Student Stream           │   │ (+/- Delta Scoring)         │
             └──────────────────┬──────────┘   └──────────┬──────────────────┘
                                │                         │
                                ▼                         ▼
                        ┌─────────────────────────────────────────┐
                        │            Subject AI Router            │
                        │     (Groq API / OpenRouter / DeepSeek)  │
                        └─────────────────────────────────────────┘
```

### 💻 Technologies
- **Frontend**: React 18, Vite, Tailwind CSS v4 (`@theme` tokens & CSS cascade layers), Zustand (State Management), Axios, Lucide Icons, Server-Sent Events (SSE).
- **Backend**: Node.js, Express, MongoDB Atlas, Mongoose, Multer, `pdf-parse`, `mammoth` (DOCX extractor).
- **AI Integration**: Groq API / OpenRouter / DeepSeek API with streaming SSE endpoints.

---

## 📂 Project Structure

```
Socratic Lab/
├── client/                     # Vite + React Frontend
│   ├── src/
│   │   ├── components/         # Reusable Layout & Nav Components
│   │   │   ├── layout/         # AppNav header and navigation
│   │   ├── pages/              # App Router Views
│   │   │   ├── Landing.jsx     # Hero section & feature breakdown
│   │   │   ├── Login.jsx       # Auth Login view
│   │   │   ├── Signup.jsx      # Auth Signup view
│   │   │   ├── Dashboard.jsx   # Subject progress & session history
│   │   │   ├── Setup.jsx       # 4-Step Session & Persona Configurator
│   │   │   ├── LecturePhase1.jsx# Phase 1: Ingest text/PDF & reflection card
│   │   │   ├── Chat.jsx        # Main SSE Teaching Interface (Phase 2 / Socratic)
│   │   │   ├── Complete.jsx    # Session Results & Mastery breakdown
│   │   │   └── Settings.jsx    # Profile & settings configuration
│   │   ├── services/           # Axios & API client configuration
│   │   ├── store/              # Zustand Stores (authStore, sessionStore)
│   │   └── index.css           # Tailwind CSS v4 design system
│   ├── package.json
│   └── vite.config.js
│
├── server/                     # Express + Node Backend
│   ├── src/
│   │   ├── controllers/        # Express Route Handlers
│   │   │   ├── authController.js    # JWT Register/Login
│   │   │   ├── lectureController.js # Phase 1 Ingestion, Extraction & Reflection
│   │   │   ├── personaController.js # List, Create & Generate AI Students
│   │   │   └── sessionController.js # Session Lifecycle, SSE Streaming & Evaluation
│   │   ├── middleware/         # Auth & File Upload Middlewares
│   │   ├── models/             # Mongoose Schemas (User, AIStudent, Session)
│   │   ├── routes/             # Express API Routes
│   │   ├── services/           # Core AI & File Engines
│   │   │   ├── aiService.js     # Groq / OpenRouter AI Client (Stream & JSON)
│   │   │   ├── evaluator.js     # Real-time Teaching Evaluator
│   │   │   ├── fileExtractor.js # PDF & DOCX Extractor
│   │   │   ├── promptBuilder.js # System Prompts & Dynamic Extractor
│   │   │   └── subjectRouter.js # AI Subject Routing Matrix
│   │   ├── seed.js             # Database Seeder (Pre-generated AI Personas)
│   │   └── index.js            # Express App Entrypoint
│   ├── .env.example
│   └── package.json
│
├── package.json                # Root package for concurrent runner
└── README.md                   # Documentation
```

---

## ⚡ Quick Start Guide

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **MongoDB**: MongoDB Atlas URI or local instance
- **API Keys**: Groq API Key (or OpenRouter API Key)

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

Edit `server/.env` and fill in your keys:
```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/socraticlab
JWT_SECRET=your_super_secret_jwt_key
GROQ_API_KEY=gsk_your_groq_api_key_here
OPENROUTER_API_KEY=sk-or-your_openrouter_key_here
```

Seed initial AI student personas:
```bash
npm run seed
```

Start the backend server:
```bash
npm start
# Server will run on http://localhost:5000
```

---

### 2. Frontend Setup

```bash
# Navigate to client directory
cd client

# Install dependencies
npm install

# Start Vite development server
npm run dev
# Frontend will run on http://localhost:5173
```

---

## 🔌 API Reference

### Authentication (`/api/auth`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/auth/signup` | Register a new user account |
| `POST` | `/api/auth/login` | Log in and receive JWT token |
| `GET` | `/api/auth/me` | Fetch active user profile |

### AI Student Personas (`/api/personas`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/personas` | List AI student personas (filterable by subject) |
| `GET` | `/api/personas/:id` | Fetch specific persona details |
| `POST` | `/api/personas` | Create a custom AI student persona |
| `POST` | `/api/personas/generate` | Generate a new AI student persona using LLM |

### Sessions & Chat (`/api/sessions`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/sessions` | Create a new session (Lecture or Socratic mode) |
| `GET` | `/api/sessions` | List user's active & past sessions |
| `GET` | `/api/sessions/:id` | Get full session state & dialogue history |
| `POST` | `/api/sessions/:id/messages` | **SSE Endpoint**: Send teaching message, stream AI reply & receive live evaluation score |
| `POST` | `/api/sessions/:id/complete` | Complete session and calculate final mastery score |

### Lecture Mode Phase 1 (`/api/sessions/:id/lecture`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/sessions/:id/lecture/text` | Append typed text to lecture content |
| `POST` | `/api/sessions/:id/lecture/file` | Upload PDF/DOCX to extract & append to lecture content |
| `POST` | `/api/sessions/:id/lecture/finish` | **Finish Phase 1**: AI dynamically extracts misconceptions from lecture text, generates student reflection, and starts Phase 2 |

---

## 🎯 How The Teaching Loop Works

```
┌──────────────────────────────────────────────────────────┐
│                   1. Configure Session                   │
│   Select Subject, Workflow (Lecture/Socratic), Class     │
│   Level (Grade 1-10, B.Tech) & AI Student Stubbornness   │
└────────────────────────────┬─────────────────────────────┘
                             │
                             ▼
┌──────────────────────────────────────────────────────────┐
│                  2. Lecture Ingestion                    │
│   Write text or upload PDF/DOCX notes (Phase 1)          │
└────────────────────────────┬─────────────────────────────┘
                             │
                             ▼
┌──────────────────────────────────────────────────────────┐
│          3. Dynamic AI Misconception Extraction          │
│   AI analyzes your notes & generates 3-4 realistic       │
│   misconceptions specific to what you taught             │
└────────────────────────────┬─────────────────────────────┘
                             │
                             ▼
┌──────────────────────────────────────────────────────────┐
│              4. AI Student Reflection & Q&A              │
│   AI student writes reflection ("I think I understand    │
│   X... but isn't Y true?") & enters Phase 2 Q&A         │
└────────────────────────────┬─────────────────────────────┘
                             │
                             ▼
┌──────────────────────────────────────────────────────────┐
│            5. Interactive Live Evaluation                │
│   Answer student questions -> Real-time evaluator        │
│   scores explanation (+/- delta) -> Reach 85%+ Mastery   │
└──────────────────────────────────────────────────────────┘
```

---
