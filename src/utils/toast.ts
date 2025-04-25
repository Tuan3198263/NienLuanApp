import Toast, { ToastShowParams } from 'react-native-toast-message';

// Kiểu dữ liệu cho cấu hình toast
type ToastConfig = Partial<ToastShowParams>;

// Cấu hình mặc định
const defaultConfig: ToastConfig = {
  position: 'bottom', 
  visibilityTime: 1500,
  topOffset: 50,
  bottomOffset: 60, // Tăng khoảng cách để toast không bị che bởi thanh tab
};

// Hàm helper để hiển thị toast
export const showToast = {
  success: (message: string, config: ToastConfig = {}) => {
    Toast.show({
      type: 'success',
      text1: message,
      ...defaultConfig,
      ...config,
    });
  },
  error: (message: string, config: ToastConfig = {}) => {
    Toast.show({
      type: 'error',
      text1: message,
      ...defaultConfig,
      ...config,
    });
  },
  info: (message: string, config: ToastConfig = {}) => {
    Toast.show({
      type: 'info',
      text1: message,
      ...defaultConfig,
      ...config,
    });
  },
};
