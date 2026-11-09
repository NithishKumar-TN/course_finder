import { useState, useCallback, useRef } from "react";
import { chatAPI } from "../services/api";

export function useChat(resumeSessionId) {
  const [messages, setMessages] = useState([]);
  const [sessionId, setSessionId] = useState(null);
  const [stage, setStage] = useState("idle");
  const [studentProfile, setStudentProfile] = useState(null);
  const [roadmap, setRoadmap] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [resumed, setResumed] = useState(false);
  const initRef = useRef(false);

  const addMessage = useCallback((role, content) => {
    setMessages((prev) => [
      ...prev,
      { id: Date.now() + Math.random(), role, content, timestamp: new Date() },
    ]);
  }, []);

  const startSession = useCallback(async (forceNew = false) => {
    if (initRef.current) return;
    initRef.current = true;
    setLoading(true);
    setError(null);
    try {
      const { data } = await chatAPI.createSession(forceNew ? null : resumeSessionId, forceNew);
      setSessionId(data.sessionId);
      setStage(data.stage);

      if (data.resumed && data.messages?.length > 0) {
        // ── Returning student — restore full chat history ─────────────────
        setResumed(true);
        setMessages(
          data.messages.map((m) => ({
            id: Date.now() + Math.random(),
            role: m.role,
            content: m.content,
            timestamp: m.timestamp ? new Date(m.timestamp) : new Date(),
          }))
        );
        if (data.studentProfile) setStudentProfile(data.studentProfile);
        if (data.roadmap) setRoadmap(data.roadmap);

        // Add a soft "welcome back" indicator at the end
        addMessage("assistant",
          `Welcome back${data.studentProfile?.name ? `, ${data.studentProfile.name}` : ""}! 👋 Ready to continue your learning journey?`
        );
      } else {
        // ── New session — show initial greeting ───────────────────────────
        setResumed(false);
        if (data.message) addMessage("assistant", data.message);
        if (data.studentProfile) setStudentProfile(data.studentProfile);
        if (data.roadmap) setRoadmap(data.roadmap);
      }
    } catch (err) {
      setError(err.response?.data?.error || "Failed to connect to LearnMate. Is the backend running?");
      initRef.current = false;
    } finally {
      setLoading(false);
    }
  }, [addMessage]);

  const sendMessage = useCallback(
    async (content) => {
      if (!sessionId || loading) return;
      addMessage("user", content);
      setLoading(true);
      setError(null);
      try {
        const { data } = await chatAPI.sendMessage(sessionId, content);
        addMessage("assistant", data.message);
        setStage(data.stage);
        if (data.studentProfile) setStudentProfile(data.studentProfile);
        if (data.roadmap) setRoadmap(data.roadmap);
      } catch (err) {
        const msg = err.response?.data?.error || "Something went wrong. Please try again.";
        setError(msg);
        addMessage("assistant", `⚠️ ${msg}`);
      } finally {
        setLoading(false);
      }
    },
    [sessionId, loading, addMessage]
  );

  const resetSession = useCallback(async () => {
    // Do NOT delete the session — preserve it in history for the dashboard.
    // Just clear local state and let startSession create a brand-new session.
    initRef.current = false;
    setMessages([]);
    setSessionId(null);
    setStage("idle");
    setStudentProfile(null);
    setRoadmap(null);
    setError(null);
    setResumed(false);
  }, [sessionId]);

  return {
    messages,
    sessionId,
    stage,
    studentProfile,
    roadmap,
    loading,
    error,
    resumed,
    startSession,
    sendMessage,
    resetSession,
    setRoadmap,
  };
}
