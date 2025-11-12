import React, { useState, useRef, useEffect } from "react";

function Chat() {
  const [messages, setMessages] = useState([]); // { text, fromBot, sources, feedbackGiven?, helpful? }
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [dots, setDots] = useState("");
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef(null);
  const messagesLengthRef = useRef(0); // Track message count for scroll behavior

  // Load chat history on component mount
  useEffect(() => {
    const loadChatHistory = async () => {
      try {
        const response = await fetch('http://localhost:8000/chat/history');
        if (response.ok) {
          const data = await response.json();
          // Convert backend format to frontend format
          const formattedMessages = data.messages.map(msg => ({
            id: msg.id,
            text: msg.text,
            fromBot: msg.fromBot,
            sources: msg.sources || [],
            feedbackGiven: msg.feedbackGiven || false,
            helpful: msg.helpful
          }));
          setMessages(formattedMessages);
        }
      } catch (error) {
        console.error('Failed to load chat history:', error);
      } finally {
        setLoading(false);
      }
    };

    loadChatHistory();
  }, []);

  // Only scroll to bottom when new messages are added, not when existing messages are modified
  useEffect(() => {
    if (messages.length > messagesLengthRef.current) {
      scrollRef.current?.scrollIntoView({ behavior: "smooth" });
    }
    messagesLengthRef.current = messages.length;
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

  // Helper function to save message to backend
  const saveMessage = async (text, fromBot, sources = []) => {
    try {
      const response = await fetch('http://localhost:8000/chat/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          from_bot: fromBot ? 1 : 0,
          sources
        })
      });
      if (response.ok) {
        const data = await response.json();
        return data.id;
      }
    } catch (error) {
      console.error('Failed to save message:', error);
    }
    return null;
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userQuestion = input;
    setInput("");

    // Quick gibberish check
    const isGibberish =
      !/[a-zA-Z]/.test(userQuestion) || (userQuestion.split(" ").length === 1 && userQuestion.length <= 3);

    if (isGibberish) {
      const userMessage = { text: userQuestion, fromBot: false };
      const botMessage = { text: "Sorry, I don't have enough information to answer that question.", fromBot: true, sources: [] };

      // Save both messages and get their IDs
      const userId = await saveMessage(userQuestion, false);
      const botId = await saveMessage(botMessage.text, true, botMessage.sources);

      setMessages((prev) => [...prev,
        { ...userMessage, id: userId },
        { ...botMessage, id: botId }
      ]);
      return;
    }

    setIsTyping(true);
    const userMessage = { text: userQuestion, fromBot: false };

    // Save user message and get ID
    const userId = await saveMessage(userQuestion, false);
    setMessages((prev) => [...prev, { ...userMessage, id: userId }]);

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

      // Save bot message and get ID
      const botId = await saveMessage(answerText, true, sources);
      const botMessage = { text: answerText, fromBot: true, sources, id: botId };
      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      const errorMessage = { text: "Sorry, I don't have enough information to answer that question.", fromBot: true };
      setMessages((prev) => [...prev, errorMessage]);

      // Save error message
      await saveMessage(errorMessage.text, true);
      console.error(err);
    } finally {
      setIsTyping(false);
    }
  };

  // Feedback handler
  const giveFeedback = async (index, helpful) => {
    setMessages((prev) =>
      prev.map((m, i) =>
        i === index ? { ...m, feedbackGiven: true, helpful } : m
      )
    );

    // Send feedback to backend
    try {
      await fetch('http://localhost:8000/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message_id: messages[index].id, // Use the message ID from backend
          helpful: helpful ? 1 : 0
        })
      });

      // Trigger immediate dashboard refresh
      window.dispatchEvent(new CustomEvent('feedbackSubmitted'));
    } catch (error) {
      console.error('Failed to submit feedback:', error);
    }
  };

  if (loading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", height: "100%", justifyContent: "center", alignItems: "center" }}>
        <div style={{ fontSize: "18px", color: "#666" }}>Loading chat history...</div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div
        style={{
          height: "500px", // Fixed height
          overflowY: "auto",
          padding: "12px",
          border: "1px solid #ddd",
          borderRadius: "8px",
          marginBottom: "12px",
          backgroundColor: "#fafafa",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {messages.length === 0 && !loading && <p style={{ color: "#777" }}>Ask a question to begin...</p>}

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
