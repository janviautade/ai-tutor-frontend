import React, { useState, useRef, useEffect } from "react";

function Chat() {
  const [messages, setMessages] = useState([]); // { text, fromBot, sources, feedbackGiven?, helpful? }
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [dots, setDots] = useState("");
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!isTyping) {
      setDots("");
      return;
    }
    const interval = setInterval(() => {
      setDots((prev) => (prev.length < 3 ? prev + "." : ""));
    }, 500);
    return () => clearInterval(interval);
  }, [isTyping]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userQuestion = input;
    setInput("");

    // Quick gibberish check
    const isGibberish =
      !/[a-zA-Z]/.test(userQuestion) || (userQuestion.split(" ").length === 1 && userQuestion.length <= 3);

    if (isGibberish) {
      setMessages((prev) => [
        ...prev,
        { text: userQuestion, fromBot: false },
        { text: "Sorry, I don't have enough information to answer that question.", fromBot: true, sources: [] },
      ]);
      return;
    }

    setIsTyping(true);
    setMessages((prev) => [...prev, { text: userQuestion, fromBot: false }]);

    try {
      const res = await fetch("http://localhost:8000/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: userQuestion }),
      });

      let answerText = "Sorry, I don't have enough information to answer that question.";
      let sources = [];

      if (res.ok) {
        const data = await res.json();
        if (data.answer && data.answer.trim() !== "") {
          answerText = data.answer;
          sources = data.sources || [];
        }
      }

      setMessages((prev) => [...prev, { text: answerText, fromBot: true, sources }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { text: "Sorry, I don't have enough information to answer that question.", fromBot: true },
      ]);
      console.error(err);
    } finally {
      setIsTyping(false);
    }
  };

  // Feedback handler
  const giveFeedback = (index, helpful) => {
    setMessages((prev) =>
      prev.map((m, i) =>
        i === index ? { ...m, feedbackGiven: true, helpful } : m
      )
    );
    // Optional: send feedback to backend
    // fetch("/feedback", { method: "POST", body: JSON.stringify({ index, helpful }) })
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "12px",
          border: "1px solid #ddd",
          borderRadius: "8px",
          marginBottom: "12px",
          backgroundColor: "#fafafa",
        }}
      >
        {messages.length === 0 && <p style={{ color: "#777" }}>Ask a question to begin...</p>}

        {messages.map((m, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              justifyContent: m.fromBot ? "flex-start" : "flex-end",
              marginBottom: "10px",
            }}
          >
            <div
              style={{
                maxWidth: "80%",
                background: m.fromBot ? "#e6e6e6" : "#d1e7ff",
                padding: "10px 14px",
                borderRadius: "14px",
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
              }}
            >
              <div>{m.text}</div>

              {/* Sources */}
              {m.sources && m.sources.length > 0 && (
                <div style={{ marginTop: "8px", fontSize: "0.9em", color: "#333" }}>
                  <strong>Sources:</strong>
                  <ul style={{ marginTop: "6px", paddingLeft: "18px" }}>
                    {m.sources.map((s, idx) => (
                      <li key={idx}>{s}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Feedback */}
              {m.fromBot && !m.feedbackGiven && (
                <div style={{ marginTop: "6px", display: "flex", gap: "8px", alignItems: "center" }}>
                  <span style={{ fontSize: "0.9em", color: "#555" }}>Was this helpful?</span>
                  <button
                    onClick={() => giveFeedback(i, true)}
                    style={{
                      padding: "4px 8px",
                      borderRadius: "4px",
                      border: "1px solid #ccc",
                      cursor: "pointer",
                      background: "#f0f0f0",
                    }}
                  >
                    Yes
                  </button>
                  <button
                    onClick={() => giveFeedback(i, false)}
                    style={{
                      padding: "4px 8px",
                      borderRadius: "4px",
                      border: "1px solid #ccc",
                      cursor: "pointer",
                      background: "#f0f0f0",
                    }}
                  >
                    No
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}

        {isTyping && (
          <div style={{ display: "flex", justifyContent: "flex-start", marginBottom: "10px" }}>
            <div
              style={{
                maxWidth: "80%",
                background: "#e6e6e6",
                padding: "10px 14px",
                borderRadius: "14px",
                fontStyle: "italic",
                color: "#555",
              }}
            >
              AI is typing{dots}
            </div>
          </div>
        )}

        <div ref={scrollRef} />
      </div>

      {/* Input */}
      <div style={{ display: "flex", gap: "8px" }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Type your question..."
          style={{ flex: 1, padding: "10px", borderRadius: "8px", border: "1px solid #ccc" }}
        />
        <button
          onClick={sendMessage}
          style={{
            padding: "10px 16px",
            borderRadius: "8px",
            border: "none",
            backgroundColor: "#007bff",
            color: "#fff",
            cursor: "pointer",
          }}
        >
          Send
        </button>
      </div>
    </div>
  );
}

export default Chat;
