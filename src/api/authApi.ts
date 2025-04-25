
import apiClient from './apiClient';

// Định nghĩa kiểu dữ liệu
interface RegisterData {
  fullName: string;
  email: string;
  phone: string;
  password: string;
}

interface LoginData {
  email: string;
  password: string;
}

interface UserUpdateData {
  fullName?: string;
  phone?: string;
  password?: string;
}

// Cập nhật interface User để khớp với API response
interface User {
  _id: string;
  fullName: string;
  email: string;
  phone?: string;
  address?: string;
  avatar?: string;
  role: string;
  ban: boolean;
  createdAt: string;
  updatedAt: string;
}

// Interface cho getUserInfo response
interface GetUserInfoResponse {
  message: string;
  user: User;
}

export const authApi = {
  // Đăng ký người dùng mới
  register: async (userData: RegisterData) => {
    return apiClient.post('/auth/register', userData);
  },
  
  // Đăng nhập
  login: async (credentials: LoginData) => {
    return apiClient.post('/auth/login', credentials);
  },
  
  // Lấy thông tin người dùng
  getUserInfo: async (token: string) => {
    try {
      console.log('Gọi API lấy thông tin user với token:', token ? 'Có token' : 'Không có token');
      return await apiClient.get('/auth/user', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
    } catch (error) {
      console.error('getUserInfo error:', error);
      throw error;
    }
  },
  
  // Cập nhật thông tin người dùng
  updateUserInfo: async (token: string, userData: UserUpdateData) => {
    return apiClient.put('/auth/update', userData, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  },

  // Cập nhật ảnh đại diện
  updateAvatar: async (token: string, imageUri: string) => {
    const formData = new FormData();
    
    // Tạo file object từ URI
    const filename = imageUri.split('/').pop();
    const match = /\.(\w+)$/.exec(filename || '');
    const type = match ? `image/${match[1]}` : 'image';
    
    formData.append('avatar', {
      uri: imageUri,
      name: filename,
      type,
    } as any);
    
    return apiClient.put('/auth/update-avatar', formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Lấy ảnh đại diện - sửa lỗi typo "avata" thành "avatar"
  getAvatar: async (token: string) => {
    return apiClient.get('/auth/avatar', {
      headers: {
        Authorization: `Bearer ${token}`
      },
      responseType: 'blob'
    });
  }
};
