import React from "react";
import Chat from "./Chat";
import TeacherDashboard from "./TeacherDashboard";

function App() {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        gap: "20px",
        padding: "20px",
        flexWrap: "wrap",
        minHeight: "100vh",
        fontFamily: "Arial, sans-serif",
        background: "linear-gradient(to bottom, #cce0ff, #e6f2ff)", // subtle sky gradient
      }}
    >
      {/* AI Tutor Chat Box */}
      <div
        style={{
          flex: "1",
          maxWidth: "600px",
          minWidth: "400px",
          minHeight: "500px",
          background: "rgba(255, 255, 255, 0.95)",
          borderRadius: "16px",
          padding: "25px",
          boxShadow: "0 8px 16px rgba(0,0,0,0.15)",
          display: "flex",
          flexDirection: "column",
          border: "2px solid #a0c4ff",
        }}
      >
        <h2 style={{ textAlign: "center", color: "#333", marginBottom: "20px" }}>AI Tutor</h2>
        <Chat />
      </div>

      {/* Teacher Dashboard */}
      <div
        style={{
          flex: "1",
          maxWidth: "600px",
          minWidth: "400px",
          minHeight: "500px",
          background: "rgba(255, 255, 255, 0.95)",
          borderRadius: "16px",
          padding: "25px",
          boxShadow: "0 8px 16px rgba(0,0,0,0.15)",
          display: "flex",
          flexDirection: "column",
          border: "2px solid #a0c4ff",
        }}
      >
        <h2 style={{ textAlign: "center", color: "#333", marginBottom: "20px" }}>Teacher Dashboard</h2>
        <TeacherDashboard />
      </div>
    </div>
  );
}

export default App;
