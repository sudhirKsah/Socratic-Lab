import { create } from 'zustand'
import api from '../services/api'

const useSessionStore = create((set, get) => ({
  // Current session
  session: null,
  messages: [],
  understandingLevel: 0,
  activeMisconceptions: [],
  isStreaming: false,
  lastEval: null,       // { delta, reasoning, encouragement }
  streamBuffer: '',     // accumulates streaming content

  // Session setup
  personas: [],
  selectedPersona: null,
  selectedSubject: null,
  selectedMode: 'socratic', // 'socratic' | 'lecture'
  topic: '',

  // Lecture Phase 1
  lectureContent: '',
  lectureWordCount: 0,
  lecturePhase: 1,
  studentReflection: null,

  // Dashboard
  pastSessions: [],

  // ── Actions ──────────────────────────────────────────────────────────────

  fetchPersonas: async (subject) => {
    try {
      const { data } = await api.get('/personas', {
        params: subject ? { subject } : {}
      })
      set({ personas: data.personas })
    } catch (err) {
      console.error('Failed to fetch personas:', err)
    }
  },

  fetchSessions: async () => {
    try {
      const { data } = await api.get('/sessions')
      set({ pastSessions: data.sessions })
    } catch (err) {
      console.error('Failed to fetch sessions:', err)
    }
  },

  createSession: async () => {
    const { selectedPersona, topic, selectedMode } = get()
    if (!selectedPersona) return null
    try {
      const { data } = await api.post('/sessions', {
        aiStudentId: selectedPersona._id,
        topic,
        mode: selectedMode,
      })
      set({
        session: data.session,
        messages: data.session.messages || [],
        understandingLevel: data.session.understandingLevel || 0,
        activeMisconceptions: data.session.activeMisconceptions || [],
        lastEval: null,
        lecturePhase: 1,
        studentReflection: null,
        lectureContent: '',
        lectureWordCount: 0,
      })
      return data.session
    } catch (err) {
      console.error('Failed to create session:', err)
      return null
    }
  },

  fetchSession: async (id) => {
    try {
      const { data } = await api.get(`/sessions/${id}`)
      set({
        session: data.session,
        messages: data.session.messages || [],
        understandingLevel: data.session.understandingLevel || 0,
        activeMisconceptions: data.session.activeMisconceptions || [],
        lecturePhase: data.session.phase || 1,
        studentReflection: data.session.studentReflection || null,
      })
      return data.session
    } catch (err) {
      console.error('Failed to fetch session:', err)
      return null
    }
  },

  // Append a streaming delta to the buffer
  appendStreamDelta: (delta) => {
    set((s) => ({ streamBuffer: s.streamBuffer + delta }))
  },

  // Called when streaming is done — add the complete message
  finalizeStreamedMessage: (fullContent, evalData) => {
    set((s) => ({
      messages: [
        ...s.messages,
        { role: 'assistant', content: fullContent, _id: Date.now() }
      ],
      streamBuffer: '',
      isStreaming: false,
      lastEval: evalData,
    }))
  },

  addUserMessage: (content) => {
    set((s) => ({
      messages: [
        ...s.messages,
        { role: 'user', content, _id: Date.now() }
      ]
    }))
  },

  updateSession: (update) => {
    set((s) => ({
      understandingLevel: update.understandingLevel ?? s.understandingLevel,
      activeMisconceptions: update.activeMisconceptions ?? s.activeMisconceptions,
      session: s.session
        ? { ...s.session, status: update.status ?? s.session.status, masteryScore: update.masteryScore }
        : s.session,
    }))
  },

  setStreaming: (val) => set({ isStreaming: val }),

  // Lecture Phase 1
  addLectureText: async (sessionId, content) => {
    try {
      const { data } = await api.post(`/sessions/${sessionId}/lecture/text`, { content })
      set({ lectureWordCount: data.lectureWordCount })
      return true
    } catch (err) {
      console.error('Failed to add lecture text:', err)
      return false
    }
  },

  uploadLectureFile: async (sessionId, file) => {
    try {
      const form = new FormData()
      form.append('file', file)
      const { data } = await api.post(`/sessions/${sessionId}/lecture/file`, form, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      set({ lectureWordCount: data.lectureWordCount })
      return data
    } catch (err) {
      console.error('Failed to upload file:', err)
      return null
    }
  },

  finishPhase1: async (sessionId) => {
    try {
      const { data } = await api.post(`/sessions/${sessionId}/lecture/finish`)
      set({
        lecturePhase: 2,
        studentReflection: data.studentReflection,
        messages: [{ role: 'assistant', content: data.studentReflection, _id: Date.now() }],
      })
      return data
    } catch (err) {
      console.error('Failed to finish Phase 1:', err)
      return null
    }
  },

  setSelectedSubject: (subject) => set({ selectedSubject: subject, selectedPersona: null }),
  setSelectedPersona: (persona) => set({ selectedPersona: persona }),
  setSelectedMode: (mode) => set({ selectedMode: mode }),
  setTopic: (topic) => set({ topic }),
  resetSetup: () => set({
    session: null, messages: [], selectedPersona: null,
    selectedSubject: null, topic: '', selectedMode: 'socratic',
    understandingLevel: 0, activeMisconceptions: [], lastEval: null,
    lectureContent: '', lectureWordCount: 0, lecturePhase: 1, studentReflection: null,
  }),
}))

export default useSessionStore
