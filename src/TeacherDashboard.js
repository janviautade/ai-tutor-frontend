import React, { useState, useEffect } from "react";

function TeacherDashboard() {
  const [resources, setResources] = useState([]);
  const [classProgress, setClassProgress] = useState([]);
  const [feedbackAnalytics, setFeedbackAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // Function to refresh feedback data (used by auto-refresh and event listener)
  const refreshFeedbackData = async () => {
    try {
      const feedbackResponse = await fetch('http://localhost:8000/feedback/analytics');
      if (feedbackResponse.ok) {
        const feedbackData = await feedbackResponse.json();
        setFeedbackAnalytics(feedbackData);
      } else {
        console.error('Failed to fetch feedback data:', feedbackResponse.status);
      }
    } catch (error) {
      console.error('Failed to refresh feedback data:', error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch resources
        const resourcesResponse = await fetch('http://localhost:8000/resources');
        if (!resourcesResponse.ok) {
          throw new Error('Failed to fetch resources');
        }
        const resourcesData = await resourcesResponse.json();
        setResources(resourcesData.resources);

        // Fetch progress
        const progressResponse = await fetch('http://localhost:8000/progress');
        if (!progressResponse.ok) {
          throw new Error('Failed to fetch progress data');
        }
        const progressData = await progressResponse.json();
        setClassProgress(progressData.progress);

        // Fetch feedback analytics
        const feedbackResponse = await fetch('http://localhost:8000/feedback/analytics');
        if (feedbackResponse.ok) {
          const feedbackData = await feedbackResponse.json();
          setFeedbackAnalytics(feedbackData);
        }

      } catch (err) {
        setError(err.message);
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Auto-refresh feedback data every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      refreshFeedbackData();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, []);

  // Listen for feedback submissions from Chat component and refresh immediately
  useEffect(() => {
    const handleFeedbackSubmitted = () => {
      refreshFeedbackData();
    };

    // Listen for custom event from Chat component
    window.addEventListener('feedbackSubmitted', handleFeedbackSubmitted);

    return () => window.removeEventListener('feedbackSubmitted', handleFeedbackSubmitted);
  }, []);
  const downloadFile = (fileName) => {
    const link = document.createElement("a");
    link.href = `/resources/${fileName}`;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <div style={{ fontSize: "18px", color: "#666" }}>Loading dashboard data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <div style={{ fontSize: "18px", color: "#d32f2f", marginBottom: "20px" }}>
          Error loading dashboard: {error}
        </div>
        <button
          onClick={() => window.location.reload()}
          style={{
            padding: "10px 20px",
            backgroundColor: "#007bff",
            color: "#fff",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer"
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "30px" }}>
      {/* Resources */}
      <div>
        <h3 style={{ marginBottom: "15px", color: "#555" }}>Resources</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {resources.length === 0 ? (
            <div style={{ textAlign: "center", padding: "20px", color: "#666" }}>
              No resources available
            </div>
          ) : (
            resources.map((res, idx) => (
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
            ))
          )}
        </div>
      </div>

      {/* Class Progress */}
      <div>
        <h3 style={{ marginBottom: "15px", color: "#555" }}>Class Progress</h3>
        {classProgress.length === 0 ? (
          <div style={{ textAlign: "center", padding: "20px", color: "#666" }}>
            No progress data available
          </div>
        ) : (
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
        )}
      </div>

      {/* Feedback Analytics */}
      <div>
        <h3 style={{ marginBottom: "15px", color: "#555" }}>AI Response Feedback</h3>
        {feedbackAnalytics ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {/* Overall Stats */}
            <div style={{
              backgroundColor: "#f8f9fa",
              padding: "15px",
              borderRadius: "8px",
              border: "1px solid #dee2e6"
            }}>
              <h4 style={{ margin: "0 0 10px 0", color: "#495057" }}>Overall Feedback</h4>
              <div style={{ display: "flex", gap: "20px" }}>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: "24px", fontWeight: "bold", color: "#28a745" }}>
                    {feedbackAnalytics.total_feedback.helpful}
                  </div>
                  <div style={{ fontSize: "14px", color: "#6c757d" }}>Helpful</div>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: "24px", fontWeight: "bold", color: "#dc3545" }}>
                    {feedbackAnalytics.total_feedback.not_helpful}
                  </div>
                  <div style={{ fontSize: "14px", color: "#6c757d" }}>Not Helpful</div>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: "24px", fontWeight: "bold", color: "#007bff" }}>
                    {feedbackAnalytics.total_feedback.total}
                  </div>
                  <div style={{ fontSize: "14px", color: "#6c757d" }}>Total Responses</div>
                </div>
              </div>
            </div>

            {/* Lesson-specific feedback */}
            {Object.keys(feedbackAnalytics.lesson_feedback).length > 0 && (
              <div>
                <h4 style={{ margin: "0 0 10px 0", color: "#495057" }}>Feedback by Lesson</h4>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {Object.entries(feedbackAnalytics.lesson_feedback).map(([lesson, stats]) => (
                    <div key={lesson} style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "12px",
                      backgroundColor: "#fff",
                      border: "1px solid #dee2e6",
                      borderRadius: "6px"
                    }}>
                      <div style={{ fontWeight: "500" }}>{lesson}</div>
                      <div style={{ display: "flex", gap: "15px", fontSize: "14px" }}>
                        <span style={{ color: "#28a745" }}>👍 {stats.helpful}</span>
                        <span style={{ color: "#dc3545" }}>👎 {stats.not_helpful}</span>
                        <span style={{ color: "#6c757d" }}>Total: {stats.total}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div style={{ textAlign: "center", padding: "20px", color: "#666" }}>
            No feedback data available yet
          </div>
        )}
      </div>
    </div>
  );
}

export default TeacherDashboard;
