import React from "react";

// Dummy data
const resources = [
  { name: "Lesson 1: Climate Change", file: "lesson1.pdf" },
  { name: "Lesson 2: Seasons", file: "lesson2.pdf" },
];

const classProgress = [
  { student: "Alice", completed: 3, total: 5 },
  { student: "Bob", completed: 4, total: 5 },
];

function TeacherDashboard() {
  const downloadFile = (fileName) => {
    const link = document.createElement("a");
    link.href = `/resources/${fileName}`;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "30px" }}>
      {/* Resources */}
      <div>
        <h3 style={{ marginBottom: "15px", color: "#555" }}>Resources</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {resources.map((res, idx) => (
            <div
              key={idx}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "12px 16px",
                backgroundColor: "#f0f8ff",
                borderRadius: "12px",
                boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
                transition: "all 0.2s ease",
                cursor: "pointer",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = "#e0f0ff")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "#f0f8ff")
              }
            >
              <span style={{ fontWeight: "500" }}>{res.name}</span>
              <button
                onClick={() => downloadFile(res.file)}
                style={{
                  padding: "6px 14px",
                  borderRadius: "8px",
                  border: "none",
                  backgroundColor: "#007bff",
                  color: "#fff",
                  fontWeight: "bold",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => (e.target.style.backgroundColor = "#0056b3")}
                onMouseLeave={(e) => (e.target.style.backgroundColor = "#007bff")}
              >
                Download
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Class Progress */}
      <div>
        <h3 style={{ marginBottom: "15px", color: "#555" }}>Class Progress</h3>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          }}
        >
          <thead style={{ backgroundColor: "#007bff", color: "#fff" }}>
            <tr>
              <th style={{ padding: "12px", textAlign: "left" }}>Student</th>
              <th style={{ padding: "12px", textAlign: "center" }}>Completed</th>
              <th style={{ padding: "12px", textAlign: "center" }}>Total</th>
            </tr>
          </thead>
          <tbody>
            {classProgress.map((s, idx) => (
              <tr key={idx}>
                <td style={{ padding: "12px" }}>{s.student}</td>
                <td style={{ padding: "12px", textAlign: "center" }}>{s.completed}</td>
                <td style={{ padding: "12px", textAlign: "center" }}>{s.total}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default TeacherDashboard;
