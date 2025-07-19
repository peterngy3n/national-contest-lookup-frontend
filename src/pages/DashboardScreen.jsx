import { useState, useEffect } from "react";
import "../styles/Layout.css";
import "../styles/Dashboard.css";
import { getScoreReport, getTop10Students, SUBJECTS } from "../service/ScoreService.js";

function DashboardScreen() {
  const [selectedSubject, setSelectedSubject] = useState('math'); // Default: Toán
  const [chartData, setChartData] = useState(null);
  const [top10Data, setTop10Data] = useState(null);
  const [loading, setLoading] = useState(false);
  const [top10Loading, setTop10Loading] = useState(false);
  const [error, setError] = useState("");
  const [top10Error, setTop10Error] = useState("");

  // Load dữ liệu khi component mount hoặc khi đổi môn học
  useEffect(() => {
    loadChartData();
    loadTop10Data();
  }, [selectedSubject]);

  const loadChartData = async () => {
    setLoading(true);
    setError("");
    
    try {
      const response = await getScoreReport(selectedSubject);
      
      if (response.success) {
        setChartData(response.data);
      } else {
        setError(response.error);
        setChartData(null);
      }
    } catch (error) {
      console.error('Dashboard error:', error);
      setError("Có lỗi xảy ra khi tải dữ liệu biểu đồ");
      setChartData(null);
    } finally {
      setLoading(false);
    }
  };

  const loadTop10Data = async () => {
    setTop10Loading(true);
    setTop10Error("");
    
    try {
      const response = await getTop10Students();
      
      if (response.success) {
        setTop10Data(response.data);
      } else {
        setTop10Error(response.error);
        setTop10Data(null);
      }
    } catch (error) {
      console.error('Top 10 error:', error);
      setTop10Error("Có lỗi xảy ra khi tải dữ liệu top 10");
      setTop10Data(null);
    } finally {
      setTop10Loading(false);
    }
  };

  // Tính toán dữ liệu cho biểu đồ
  const getChartRanges = () => {
    if (!chartData) return [];

    const ranges = Object.entries(chartData.data).map(([range, count]) => {
      let color;
      if (range.includes('Dưới 4 điểm')) color = '#ef4444';
      else if (range.includes('Từ 4 đến 6 điểm')) color = '#f59e0b';
      else if (range.includes('Từ 6 đến 8 điểm')) color = '#3b82f6';
      else color = '#22c55e';

      return {
        range,
        count,
        color,
        percentage: chartData.total > 0 ? ((count / chartData.total) * 100).toFixed(1) : 0
      };
    });

    return ranges;
  };

  const scoreRanges = getChartRanges();
  const maxCount = scoreRanges.length > 0 ? Math.max(...scoreRanges.map(range => range.count)) : 0;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">Tổng quan về kết quả thi của các thí sinh</p>
      </div>

      {/* Chart Section */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Phân bố điểm số thí sinh</h2>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginTop: "1rem" }}>
            <label htmlFor="subject-select" style={{ fontWeight: "500", color: "#1e293b" }}>
              Chọn môn học:
            </label>
            <select
              id="subject-select"
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              style={{
                padding: "0.5rem 1rem",
                borderRadius: "6px",
                border: "2px solid #e2e8f0",
                background: "white",
                fontSize: "0.875rem",
                fontWeight: "500",
                color: "#1e293b",
                cursor: "pointer",
                outline: "none",
                transition: "border-color 0.2s"
              }}
              onFocus={(e) => e.target.style.borderColor = "#3b82f6"}
              onBlur={(e) => e.target.style.borderColor = "#e2e8f0"}
            >
              {Object.entries(SUBJECTS).map(([key, name]) => (
                <option key={key} value={key}>
                  {name}
                </option>
              ))}
            </select>
            {chartData && (
              <span style={{ color: "#64748b", fontSize: "0.875rem" }}>
                Tổng: {chartData.total.toLocaleString()} thí sinh
              </span>
            )}
          </div>
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
              Đang tải dữ liệu...
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

          {!loading && !error && scoreRanges.length > 0 && (
            <>
              {/* Bar Chart */}
              <div className="dashboard-chart-container">
                <div className="dashboard-chart">
                  {scoreRanges.map((range, index) => (
                    <div key={index} className="dashboard-bar-container">
                      {/* Bar */}
                      <div 
                        className="dashboard-bar"
                        style={{
                          height: maxCount > 0 ? `${(range.count / maxCount) * 200}px` : '0px',
                          background: `linear-gradient(180deg, ${range.color}, ${range.color}dd)`
                        }}
                      >
                        {/* Count label on top of bar */}
                        <div className="dashboard-bar-count">
                          {range.count.toLocaleString()}
                        </div>
                      </div>
                      
                      {/* Range label */}
                      <div className="dashboard-bar-range">
                        {range.range}
                      </div>
                      
                      {/* Percentage */}
                      <div className="dashboard-bar-percentage">
                        {range.percentage}%
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Legend */}
              <div className="dashboard-legend">
                {scoreRanges.map((range, index) => (
                  <div key={index} className="dashboard-legend-item">
                    <div 
                      className="dashboard-legend-color"
                      style={{ background: range.color }}
                    ></div>
                    <span className="dashboard-legend-text">
                      {range.range}: {range.count.toLocaleString()} thí sinh ({range.percentage}%)
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}

          {!loading && !error && scoreRanges.length === 0 && (
            <div style={{ 
              textAlign: "center", 
              padding: "3rem", 
              color: "#64748b",
              fontSize: "1rem"
            }}>
              <div style={{ marginBottom: "1rem" }}>📊</div>
              Không có dữ liệu để hiển thị
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
export default DashboardScreen;