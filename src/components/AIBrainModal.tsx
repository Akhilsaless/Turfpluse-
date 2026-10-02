import React, { useEffect, useState } from "react";
// Safe compatibility modal for the previous design. It always uses server-verified state.
export const AIBrainModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  initialQuery?: string;
}> = ({ isOpen, onClose, initialQuery = "" }) => {
  const [question, setQuestion] = useState(initialQuery);
  const [answer, setAnswer] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => setQuestion(initialQuery), [initialQuery]);
  async function ask(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    try {
      const response = await fetch("/api/ai-brain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Analysis unavailable");
      setAnswer(data.answer);
    } catch (error) {
      setAnswer((error as Error).message);
    } finally {
      setBusy(false);
    }
  }
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <section
        role="dialog"
        aria-modal="true"
        aria-label="Grok race analysis"
        className="w-full max-w-2xl rounded-xl bg-white p-6 text-slate-900"
      >
        <button onClick={onClose} aria-label="Close analysis">
          Close
        </button>
        <h2>Grok race analysis</h2>
        <p>
          Uses current verified race data. API credentials are configured on the
          server.
        </p>
        <form onSubmit={ask}>
          <label>
            Question
            <input
              required
              maxLength={3000}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
            />
          </label>
          <button disabled={busy}>{busy ? "Analysing…" : "Ask Grok"}</button>
        </form>
        <p className="whitespace-pre-wrap" role="status">
          {answer}
        </p>
      </section>
    </div>
  );
};
