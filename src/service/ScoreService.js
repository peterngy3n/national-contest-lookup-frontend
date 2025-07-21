import apiClient from './apiClient.js';

// Đặt USE_MOCK_DATA = true để test với dữ liệu mẫu, false để dùng API thật
const USE_MOCK_DATA = true;

/**
 * Validate số báo danh
 * @param {string} studentId - Số báo danh cần validate
 * @returns {boolean} true nếu hợp lệ
 */
export const validateStudentId = (studentId) => {
  if (!studentId || typeof studentId !== 'string') {
    return false;
  }
  
  // Loại bỏ khoảng trắng
  const cleanId = studentId.trim();
  
  // Kiểm tra độ dài (giả sử số báo danh có 6-8 ký tự)
  if (cleanId.length < 6 || cleanId.length > 8) {
    return false;
  }
  
  // Kiểm tra chỉ chứa số
  return /^\d+$/.test(cleanId);
};

/**
 * Xử lý lỗi từ API response
 * @param {object} error - Axios error object
 * @returns {string} User-friendly error message
 */
const handleApiError = (error) => {
  // Axios timeout error
  if (error.code === 'ECONNABORTED') {
    return 'Yêu cầu quá thời gian chờ. Vui lòng thử lại.';
  }
  
  // Network error
  if (error.code === 'ERR_NETWORK') {
    return 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.';
  }
  
  // HTTP errors
  if (error.response) {
    const { status, data } = error.response;
    
    switch (status) {
      case 400:
        return data?.message || 'Số báo danh không hợp lệ';
      case 404:
        return 'Không tìm thấy thông tin thí sinh với số báo danh này';
      case 500:
        return 'Lỗi hệ thống, vui lòng thử lại sau';
      case 503:
        return 'Hệ thống đang bảo trì, vui lòng thử lại sau';
      default:
        return data?.message || `Lỗi: ${status}`;
    }
  }
  
  // Unknown error
  return error.message || 'Có lỗi không xác định xảy ra';
};

/**
 * Danh sách tất cả các môn học có thể có
 */
export const SUBJECTS = {
  math: 'Toán',
  literature: 'Văn',
  english: 'Anh',
  physics: 'Lý',
  chemistry: 'Hóa',
  biology: 'Sinh',
  history: 'Sử',
  geography: 'Địa',
  civics: 'GDCD'
};

/**
 * Mapping từ tên môn tiếng Việt sang tên môn API (không dấu, viết liền)
 */
export const SUBJECT_API_MAPPING = {
  math: 'toan',
  literature: 'nguvan',
  english: 'ngoainingu',
  physics: 'vatli',
  chemistry: 'hoahoc',
  biology: 'sinhhoc',
  history: 'lichsu',
  geography: 'diali',
  civics: 'gdcd'
};

/**
 * Lọc và format dữ liệu môn học từ API response
 * @param {object} rawData - Dữ liệu thô từ API
 * @returns {object} Dữ liệu đã được format
 */
const formatScoreData = (rawData) => {
  const formattedData = {
    studentId: rawData.sbd || rawData.studentId || rawData.id,
    name: rawData.name || rawData.studentName || rawData.fullName || 'Không có tên',
    subjects: {},
    totalScore: 0,
    subjectCount: 0,
    foreignLanguageCode: rawData.maNgoaiNgu || null
  };

  // Mapping từ API field names sang subject keys
  const apiFieldMapping = {
    math: ['toan', 'math'],
    literature: ['nguVan', 'literature', 'van'],
    english: ['ngoainingu', 'english', 'anh'],
    physics: ['vatLi', 'physics', 'ly'],
    chemistry: ['hoaHoc', 'chemistry', 'hoa'],
    biology: ['sinhHoc', 'biology', 'sinh'],
    history: ['lichSu', 'history', 'su'],
    geography: ['diaLi', 'geography', 'dia'],
    civics: ['gdcd', 'civics']
  };

  // Duyệt qua tất cả các môn học có thể có
  Object.keys(SUBJECTS).forEach(subjectKey => {
    const possibleFields = apiFieldMapping[subjectKey] || [subjectKey];
    
    // Tìm điểm số cho môn học này
    let score = null;
    for (const field of possibleFields) {
      if (rawData[field] !== undefined && rawData[field] !== null && rawData[field] !== '') {
        score = parseFloat(rawData[field]);
        break;
      }
    }

    // Nếu tìm thấy điểm hợp lệ, thêm vào kết quả
    if (score !== null && !isNaN(score) && score >= 0 && score <= 10) {
      formattedData.subjects[subjectKey] = {
        name: SUBJECTS[subjectKey],
        score: score
      };
      formattedData.totalScore += score;
      formattedData.subjectCount++;
    }
  });

  // Tính điểm trung bình
  formattedData.averageScore = formattedData.subjectCount > 0 
    ? (formattedData.totalScore / formattedData.subjectCount).toFixed(2)
    : 0;

  return formattedData;
};

/**
 * Lấy điểm số của thí sinh theo số báo danh
 * @param {string} studentId - Số báo danh của thí sinh
 * @returns {Promise<object>} Promise chứa dữ liệu điểm số hoặc lỗi
 */
export const getScoreByStudentId = async (studentId) => {
  try {
    // Validate input trước khi gọi API
    if (!validateStudentId(studentId)) {
      return {
        success: false,
        error: 'Số báo danh không hợp lệ. Vui lòng nhập 6-8 chữ số.'
      };
    }

    let apiData;
    
   
    // Gọi API thật
    const apiResponse = await apiClient.get(`/scores/${studentId.trim()}`);
    
    // Kiểm tra response format
    if (apiResponse.data && apiResponse.data.code === 1000 && apiResponse.data.result) {
    apiData = apiResponse.data.result;
    } else if (apiResponse.data.code !== 1000) {
    // API trả về lỗi với code khác 1000
    return {
        success: false,
        error: 'Không tìm thấy thông tin thí sinh với số báo danh này'
    };
    } else {
    // Response format không đúng
    apiData = apiResponse.data;
    }
    
    
    // Format dữ liệu trước khi trả về
    const formattedData = formatScoreData(apiData);
    
    // Kiểm tra nếu không có môn nào
    if (formattedData.subjectCount === 0) {
      return {
        success: false,
        error: 'Không tìm thấy điểm thi cho số báo danh này'
      };
    }
    
    return {
      success: true,
      data: formattedData
    };

  } catch (error) {
    const errorMessage = handleApiError(error);
    
    return {
      success: false,
      error: errorMessage
    };
  }
};

/**
 * Lấy danh sách top 10 thí sinh có điểm cao nhất
 * @returns {Promise<object>} Promise chứa danh sách top 10 students
 */
export const getTop10Students = async () => {
  try {
    let response;
      // Gọi API thật
    const apiResponse = await apiClient.get(`/scores/report/top10`);
    response = apiResponse.data;
    
    // Kiểm tra response format
    if (response && response.code === 1000 && Array.isArray(response.result)) {
      // Format dữ liệu cho hiển thị
      const formattedData = response.result.map(student => ({
        rank: student.rank,
        studentId: student.sbd,
        totalScore: student.tongDiem,
        subjects: {
          ...(student.toan !== undefined && student.toan !== null && { math: { name: 'Toán', score: student.toan } }),
          ...(student.nguVan !== undefined && student.nguVan !== null && { literature: { name: 'Văn', score: student.nguVan } }),
          ...(student.ngoaiNgu !== undefined && student.ngoaiNgu !== null && { english: { name: 'Anh', score: student.ngoaiNgu } }),
          ...(student.vatLi !== undefined && student.vatLi !== null && { physics: { name: 'Lý', score: student.vatLi } }),
          ...(student.hoaHoc !== undefined && student.hoaHoc !== null && { chemistry: { name: 'Hóa', score: student.hoaHoc } }),
          ...(student.sinhHoc !== undefined && student.sinhHoc !== null && { biology: { name: 'Sinh', score: student.sinhHoc } }),
          ...(student.lichSu !== undefined && student.lichSu !== null && { history: { name: 'Sử', score: student.lichSu } }),
          ...(student.diaLi !== undefined && student.diaLi !== null && { geography: { name: 'Địa', score: student.diaLi } }),
          ...(student.gdcd !== undefined && student.gdcd !== null && { civics: { name: 'GDCD', score: student.gdcd } })
        }
      }));
      
      return {
        success: true,
        data: formattedData
      };
    } else if (response.code !== 1000) {
      return {
        success: false,
        error: 'Không có dữ liệu top 10 thí sinh'
      };
    } else {
      return {
        success: false,
        error: 'Định dạng dữ liệu không đúng'
      };
    }

  } catch (error) {
    const errorMessage = handleApiError(error);
    
    return {
      success: false,
      error: errorMessage
    };
  }
};

/**
 * Lấy danh sách top thí sinh có điểm cao nhất
 * @param {number} limit - Số lượng thí sinh muốn lấy (default: 10)
 * @returns {Promise<object>} Promise chứa danh sách top students
 */
export const getTopStudents = async (limit = 10) => {
  // Redirect to getTop10Students for now since the API only supports top 10
  if (limit <= 10) {
    return await getTop10Students();
  }
  
  try {
    const response = await apiClient.get(`/scores/top?limit=${limit}`);
    
    return {
      success: true,
      data: response.data
    };

  } catch (error) {
    const errorMessage = handleApiError(error);
    
    return {
      success: false,
      error: errorMessage
    };
  }
};

/**
 * Lấy thống kê điểm số theo môn học
 * @param {string} subject - Tên môn học (key từ SUBJECTS)
 * @returns {Promise<object>} Promise chứa dữ liệu thống kê
 */
export const getScoreReport = async (subject) => {
  try {
    // Validate subject
    if (!subject || !SUBJECTS[subject]) {
      return {
        success: false,
        error: 'Môn học không hợp lệ'
      };
    }

    // Lấy tên môn API (không dấu, viết liền)
    const subjectApiName = SUBJECT_API_MAPPING[subject];
    
    let response;

    // Gọi API thật
    const apiResponse = await apiClient.get(`/scores/report/${subjectApiName}`);
    response = apiResponse.data;
    
    // Kiểm tra response format
    if (response && response.code === 1000 && response.result) {
      const reportData = response.result;
      
      // Format dữ liệu cho biểu đồ
      const formattedData = {
        subject: subject,
        subjectName: SUBJECTS[subject],
        data: {
          'Dưới 4 điểm': reportData.lv4 || 0,
          'Từ 4 đến 6 điểm': reportData.lv3 || 0,
          'Từ 6 đến 8 điểm': reportData.lv2 || 0,
          'Từ 8 đến 10 điểm': reportData.lv1 || 0
        },
        total: reportData.total || 0
      };
      
      return {
        success: true,
        data: formattedData
      };
    } else if (response.code !== 1000) {
      return {
        success: false,
        error: 'Không có dữ liệu thống kê cho môn học này'
      };
    } else {
      return {
        success: false,
        error: 'Định dạng dữ liệu không đúng'
      };
    }

  } catch (error) {
    const errorMessage = handleApiError(error);
    
    return {
      success: false,
      error: errorMessage
    };
  }
};

/**
 * Lấy thống kê điểm số
 * @returns {Promise<object>} Promise chứa dữ liệu thống kê
 */
export const getScoreStatistics = async () => {
  try {
    const response = await apiClient.get('/scores/statistics');
    
    return {
      success: true,
      data: response.data
    };

  } catch (error) {
    const errorMessage = handleApiError(error);
    
    return {
      success: false,
      error: errorMessage
    };
  }
};

// Export default object với tất cả functions để backward compatibility
const ScoreService = {
  validateStudentId,
  getScoreByStudentId,
  getTopStudents,
  getTop10Students,
  getScoreStatistics,
  getScoreReport
};

export default ScoreService;
