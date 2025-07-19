import axios from 'axios';
import { BASEURL } from '../constant/baseURL.js';

/**
 * Tạo axios instance với config mặc định
 */
const apiClient = axios.create({
  baseURL: BASEURL,
  timeout: 15000, // 15 seconds
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Request interceptor - xử lý trước khi gửi request
 */
apiClient.interceptors.request.use(
  (config) => {
    // Log API call trong development
    if (process.env.NODE_ENV === 'development') {
      console.group(`🌐 API Request: ${config.method?.toUpperCase()}`);
      console.log('URL:', `${config.baseURL}${config.url}`);
      console.log('Method:', config.method);
      console.log('Headers:', config.headers);
      if (config.data) console.log('Data:', config.data);
      console.log('Time:', new Date().toLocaleTimeString());
      console.groupEnd();
    }
    
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

/**
 * Response interceptor - xử lý response trước khi trả về
 */
apiClient.interceptors.response.use(
  (response) => {
    // Log successful response trong development
    if (process.env.NODE_ENV === 'development') {
      console.group('📡 API Response: ✅ Success');
      console.log('URL:', response.config.url);
      console.log('Status:', response.status);
      console.log('Data:', response.data);
      console.log('Time:', new Date().toLocaleTimeString());
      console.groupEnd();
    }
    
    return response;
  },
  (error) => {
    // Log error response trong development
    if (process.env.NODE_ENV === 'development') {
      console.group('📡 API Response: ❌ Error');
      console.log('URL:', error.config?.url);
      console.log('Status:', error.response?.status);
      console.log('Message:', error.message);
      console.log('Response:', error.response?.data);
      console.log('Time:', new Date().toLocaleTimeString());
      console.groupEnd();
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;
