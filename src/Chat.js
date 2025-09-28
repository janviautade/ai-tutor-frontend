import React, { useState, useRef, useEffect } from "react";

function Chat() {
  const [messages, setMessages] = useState([]); // { text, fromBot?:bool, sources?:[] }
  const [input, setInput] = useState("");
  const scrollRef = useRef(null);

  // auto-scroll when messages change
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    // add user bubble
    setMessages((prev) => [...prev, { text: input, fromBot: false }]);

    try {
      const res = await fetch("http://127.0.0.1:8000/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: input }),
      });

      if (!res.ok) {
        // server error
        setMessages((prev) => [
          ...prev,
          { text: `Error: server returned ${res.status}`, fromBot: true },
        ]);
      } else {
        const data = await res.json();
        // backend returns { answer, sources }
        setMessages((prev) => [
          ...prev,
          { text: data.answer || "No answer.", fromBot: true, sources: data.sources || [] },
        ]);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { text: "Error: Could not reach backend.", fromBot: true },
      ]);
      console.error("Fetch error:", err);
    }

    setInput("");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Messages area */}
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
            </div>
          </div>
        ))}

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
