import { useState, useEffect } from "react";
import "../styles/Layout.css";
import "../styles/Report.css";
import { getTop10Students } from "../service/ScoreService.js";

function ReportScreen() {
  const [topStudents, setTopStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Load dữ liệu khi component mount
  useEffect(() => {
    loadTop10Data();
  }, []);

  const loadTop10Data = async () => {
    setLoading(true);
    setError("");
    
    try {
      const response = await getTop10Students();
      
      if (response.success) {
        setTopStudents(response.data);
      } else {
        setError(response.error);
        setTopStudents([]);
      }
    } catch (error) {
      console.error('Report error:', error);
      setError("Có lỗi xảy ra khi tải dữ liệu top 10");
      setTopStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const getRankStyle = (rank) => {
    switch(rank) {
      case 1:
        return { background: "linear-gradient(135deg, #ffd700, #ffed4e)", color: "#92400e" };
      case 2:
        return { background: "linear-gradient(135deg, #c0c0c0, #e5e7eb)", color: "#374151" };
      case 3:
        return { background: "linear-gradient(135deg, #cd7f32, #d97706)", color: "#ffffff" };
      default:
        return { background: "#f1f5f9", color: "#475569" };
    }
  };

  const getScoreColor = (score) => {
    if (score >= 9) return "#22c55e";
    if (score >= 8) return "#3b82f6";
    if (score >= 7) return "#f59e0b";
    return "#ef4444";
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Báo cáo thành tích</h1>
        <p className="page-subtitle">Top 10 thí sinh có điểm số cao nhất</p>
      </div>

      {/* Top Students Table */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Bảng xếp hạng thí sinh xuất sắc</h2>
        </div>
        <div className="card-content">
          {loading && (
            <div style={{ 
              textAlign: "center", 
              padding: "3rem", 
              color: "#64748b",
              fontSize: "1rem"
            }}>
              <div style={{ marginBottom: "1rem" }}>🔄</div>
              Đang tải dữ liệu top 10...
            </div>
          )}

          {error && (
            <div style={{ 
              color: "#ef4444", 
              padding: "1.5rem", 
              background: "#fef2f2", 
              border: "1px solid #fecaca", 
              borderRadius: "8px",
              textAlign: "center"
            }}>
              {error}
            </div>
          )}

          {!loading && !error && topStudents.length > 0 && (
            <div className="report-table-container">
              <table className="report-table">
                <thead>
                  <tr>
                    <th className="center">Hạng</th>
                    <th className="left">Số báo danh</th>
                    <th className="left">Điểm từng môn</th>
                    <th className="center">Tổng điểm</th>
                  </tr>
                </thead>
                <tbody>
                  {topStudents.map((student, index) => (
                    <tr key={student.studentId}>
                      <td className={`report-rank-cell ${
                        student.rank === 1 ? 'report-rank-gold' :
                        student.rank === 2 ? 'report-rank-silver' :
                        student.rank === 3 ? 'report-rank-bronze' :
                        'report-rank-normal'
                      }`}>
                        {student.rank <= 3 ? (
                          student.rank === 1 ? "🥇" : student.rank === 2 ? "🥈" : "🥉"
                        ) : (
                          student.rank
                        )}
                      </td>
                      <td className="report-student-id">
                        {student.studentId}
                      </td>
                      <td style={{ padding: "1rem 0.5rem" }}>
                        <div style={{ 
                          display: "flex", 
                          flexWrap: "wrap", 
                          gap: "0.5rem" 
                        }}>
                          {Object.entries(student.subjects).map(([subjectKey, subject]) => {
                            const scoreColor = getScoreColor(subject.score);
                            return (
                              <span key={subjectKey} style={{ 
                                background: scoreColor === '#22c55e' ? '#dcfce7' :
                                           scoreColor === '#3b82f6' ? '#dbeafe' :
                                           scoreColor === '#f59e0b' ? '#fef3c7' : '#fee2e2',
                                color: scoreColor,
                                padding: "0.25rem 0.5rem", 
                                borderRadius: "4px", 
                                fontSize: "0.875rem",
                                fontWeight: "500",
                                whiteSpace: "nowrap"
                              }}>
                                {subject.name}: {subject.score}
                              </span>
                            );
                          })}
                        </div>
                      </td>
                      <td className="report-total-score">
                        {student.totalScore}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {!loading && !error && topStudents.length === 0 && (
            <div style={{ 
              textAlign: "center", 
              padding: "3rem", 
              color: "#64748b",
              fontSize: "1rem"
            }}>
              <div style={{ marginBottom: "1rem" }}>🏆</div>
              Không có dữ liệu top 10 để hiển thị
            </div>
          )}
        </div>
      </div>

      {/* Additional Info */}
      <div className="report-notes">
        <h3 className="report-notes-title">📋 Ghi chú</h3>
        <ul className="report-notes-list">
          <li>Điểm số được tính theo thang điểm 10</li>
          <li>Tổng điểm được tính bằng tổng điểm của các môn thi (tùy thuộc vào tổ hợp môn)</li>
          <li>Xếp hạng được tính dựa trên tổng điểm từ cao xuống thấp</li>
          <li>Chỉ hiển thị các môn học mà thí sinh đã thi (có điểm)</li>
          <li>Dữ liệu được cập nhật lần cuối: {new Date().toLocaleDateString('vi-VN')}</li>
          {topStudents.length > 0 && (
            <li>Hiện đang hiển thị top {topStudents.length} thí sinh có điểm cao nhất</li>
          )}
        </ul>
      </div>
    </div>
  );
}
export default ReportScreen;