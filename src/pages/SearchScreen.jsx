import { useState } from "react";
import "../styles/Layout.css";
import { getScoreByStudentId, validateStudentId } from "../service/ScoreService.js";

function SearchScreen() {
  const [studentId, setStudentId] = useState("");
  const [searchResult, setSearchResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async (e) => {
    e.preventDefault();
    
    // Validate input
    if (!studentId.trim()) {
      setError("Vui lòng nhập số báo danh");
      return;
    }

    // Validate format
    if (!validateStudentId(studentId.trim())) {
      setError("Số báo danh không hợp lệ. Vui lòng nhập 6-8 chữ số.");
      return;
    }

    setLoading(true);
    setError("");
    setSearchResult(null);
    
    try {
      // Call API thông qua ScoreService
      const response = await getScoreByStudentId(studentId.trim());
      
      if (response.success) {
        // API thành công, hiển thị kết quả
        setSearchResult({
          studentId: studentId.trim(),
          name: response.data.name,
          subjects: response.data.subjects,
          totalScore: response.data.totalScore,
          averageScore: response.data.averageScore,
          subjectCount: response.data.subjectCount
        });
      } else {
        // API trả về lỗi
        setError(response.error);
        setSearchResult(null);
      }
    } catch (error) {
      // Xử lý lỗi không mong muốn
      console.error('Search error:', error);
      setError("Có lỗi xảy ra khi tìm kiếm. Vui lòng thử lại.");
      setSearchResult(null);
    } finally {
      setLoading(false);
    }
  };

  const calculateTotal = (result) => {
    return result.totalScore ? result.totalScore.toFixed(1) : '0.0';
  };

  const calculateAverage = (result) => {
    return result.averageScore ? parseFloat(result.averageScore) : 0;
  };

  const getGrade = (score) => {
    if (score >= 8) return { grade: "Giỏi", color: "#22c55e" };
    if (score >= 6.5) return { grade: "Khá", color: "#3b82f6" };
    if (score >= 5) return { grade: "Trung bình", color: "#f59e0b" };
    return { grade: "Yếu", color: "#ef4444" };
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Tra cứu điểm thi</h1>
        <p className="page-subtitle">Nhập số báo danh để tra cứu kết quả thi</p>
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Tìm kiếm điểm số</h2>
        </div>
        <div className="card-content">
          <form onSubmit={handleSearch}>
            <div className="form-group">
              <label htmlFor="studentId" className="form-label">
                Số báo danh *
              </label>
              <input
                type="text"
                id="studentId"
                className="form-input"
                value={studentId}
                onChange={(e) => {
                  // Chỉ cho phép nhập số
                  const value = e.target.value.replace(/\D/g, '');
                  setStudentId(value);
                  // Clear error khi user bắt đầu nhập
                  if (error) setError("");
                }}
                placeholder="Nhập số báo danh (6-8 chữ số)"
                disabled={loading}
                maxLength="8"
                pattern="[0-9]{6,8}"
                title="Số báo danh phải có 6-8 chữ số"
              />
            </div>
            
            {error && (
              <div style={{ 
                color: "#ef4444", 
                marginBottom: "1rem", 
                padding: "0.75rem", 
                background: "#fef2f2", 
                border: "1px solid #fecaca", 
                borderRadius: "8px" 
              }}>
                {error}
              </div>
            )}

            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? "Đang tìm kiếm..." : "Tìm kiếm"}
            </button>
          </form>
        </div>
      </div>

      {searchResult && (
        <div className="card" style={{ marginTop: "2rem" }}>
          <div className="card-header">
            <h2 className="card-title">Kết quả tra cứu</h2>
          </div>
          <div className="card-content">
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "1.5rem" }}>
              <div>
                <h3 style={{ margin: "0 0 1rem 0", color: "#1e293b" }}>Thông tin thí sinh</h3>
                <p><strong>Số báo danh:</strong> {searchResult.studentId}</p>
              </div>
              
              <div>
                <h3 style={{ margin: "0 0 1rem 0", color: "#1e293b" }}>Điểm từng môn</h3>
                <div style={{ display: "grid", gap: "0.5rem" }}>
                  {Object.entries(searchResult.subjects).map(([subjectKey, subject]) => (
                    <div key={subjectKey} style={{ 
                      display: "flex", 
                      justifyContent: "space-between", 
                      padding: "0.5rem", 
                      background: "#f8fafc", 
                      borderRadius: "6px" 
                    }}>
                      <span>{subject.name}:</span>
                      <span style={{ fontWeight: "600", color: "#2563eb" }}>{subject.score}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
export default SearchScreen;