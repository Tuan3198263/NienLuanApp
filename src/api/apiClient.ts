import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// URL API cho các môi trường khác nhau
let API_URL = 'http://localhost:3000/api';

// Đối với thiết bị di động, sử dụng địa chỉ IP của máy tính thay vì 'localhost'
if (Platform.OS !== 'web') {
  // Cập nhật IP này với địa chỉ thực của máy tính của bạn trên cùng mạng
  API_URL = 'http://192.168.43.63:3000/api'; // Thay X bằng địa chỉ IP thực của bạn // đổi api_url khi đổi wifi, http://192.168.1.6:3000/api
}

console.log('API URL đang sử dụng:', API_URL);

// Tăng timeout để xử lý mạng không ổn định
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000, // Tăng thời gian timeout
});

// Thêm log để debug
apiClient.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('[API Request Error]', error);
    return Promise.reject(error);
  }
);

// Interceptor cho response: xử lý lỗi chung
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Xử lý các lỗi chung như 401, 403, 500, ...
    if (error.response) {
      // Xử lý lỗi từ phản hồi của server
      switch (error.response.status) {
        case 401:
          // Xử lý lỗi xác thực (có thể đăng xuất người dùng)
          AsyncStorage.removeItem('token');
          break;
        case 403:
          // Xử lý lỗi quyền truy cập
          console.error('Bạn không có quyền thực hiện thao tác này');
          break;
        case 500:
          console.error('Lỗi server');
          break;
        default:
          break;
      }
    } else if (error.request) {
      // Xử lý lỗi không nhận được phản hồi
      console.error('Không thể kết nối đến server');
    } else {
      // Xử lý lỗi khác
      console.error('Lỗi:', error.message);
    }
    return Promise.reject(error);
  }
);

export default apiClient;
