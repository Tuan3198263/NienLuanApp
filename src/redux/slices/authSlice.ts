import { createSlice, createAsyncThunk, PayloadAction, createAction } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import apiClient from '../../api/apiClient'; // Import apiClient đã cấu hình

// Định nghĩa kiểu dữ liệu cho người dùng theo response thực tế
interface User {
  fullName: string;
  email: string;
  role: string;
  avatar?: string;
  phone?: string;
}

// Định nghĩa kiểu dữ liệu cho state auth
interface AuthState {
  token: string | null;
  user: User | null;
  isLoading: boolean;
  error: string | null;
  lastUpdated: number | null; // Thời điểm cập nhật cuối cùng
  needRefresh: boolean; // Cờ đánh dấu cần làm mới
}

// State ban đầu
const initialState: AuthState = {
  token: null,
  user: null,
  isLoading: false,
  error: null,
  lastUpdated: null,
  needRefresh: false,
};

// Khai báo API URL
const API_URL = 'http://localhost:3000/api';

// Thunk cho đăng nhập - sử dụng apiClient thay vì axios trực tiếp
export const login = createAsyncThunk(
  'auth/login',
  async ({ email, password }: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await apiClient.post('/auth/login', { email, password });
      await AsyncStorage.setItem('token', response.data.token);
      return response.data;
    } catch (error: any) {
      if (error.response) {
        return rejectWithValue(
          error.response.data.message || 
          'Đăng nhập thất bại. Vui lòng kiểm tra thông tin đăng nhập.'
        );
      }
      return rejectWithValue('Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.');
    }
  }
);

// Thêm thunk cho việc lấy thông tin người dùng
export const fetchUserInfo = createAsyncThunk(
  'auth/fetchUserInfo',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState() as { auth: AuthState };
      if (!auth.token) {
        return rejectWithValue('Không có token');
      }

      const response = await apiClient.get('/auth/user');
      return response.data.user;
    } catch (error: any) {
      if (error.response && error.response.data) {
        return rejectWithValue(error.response.data.message || error.response.data);
      }
      return rejectWithValue('Lỗi khi lấy thông tin người dùng');
    }
  }
);

// Thunk cho lấy avatar - sử dụng apiClient thay vì axios trực tiếp
export const fetchAvatar = createAsyncThunk(
  'auth/fetchAvatar',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState() as { auth: AuthState };
      if (!auth.token) {
        return rejectWithValue('Không có token');
      }

      // Sử dụng apiClient đã cấu hình
      const response = await apiClient.get('/auth/avatar');
      console.log('Avatar response:', response.data);
      
      // Response format: { message: string, avatar: string }
      return response.data.avatar;
    } catch (error: any) {
      console.error('Lỗi khi lấy avatar:', error);
      if (error.response && error.response.data) {
        return rejectWithValue(error.response.data.message || error.response.data);
      }
      return rejectWithValue('Lỗi khi lấy avatar');
    }
  }
);

// Thunk cho đăng xuất
export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      console.log('Đăng xuất thành công');
      await AsyncStorage.removeItem('token');
      return null;
    } catch (error: any) {
      return rejectWithValue('Lỗi khi đăng xuất');
    }
  }
);

// Thunk để kiểm tra token
export const checkAuth = createAsyncThunk(
  'auth/checkAuth',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      const token = await AsyncStorage.getItem('token');
      
      if (!token) {
        return rejectWithValue('Không có token');
      }
      
      // Cập nhật token vào state
      dispatch(setToken(token));
      
      
      return token;
    } catch (error) {
      return rejectWithValue('Lỗi xác thực');
    }
  }
);

// Thêm action để đánh dấu cần refresh dữ liệu
export const markNeedRefresh = createAction('auth/markNeedRefresh');

// Thêm action để cập nhật dữ liệu người dùng từ API
export const updateUserData = createAsyncThunk(
  'auth/updateUserData',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState() as { auth: AuthState };
      if (!auth.token) {
        return rejectWithValue('Không có token');
      }

      // Luôn gọi API để lấy dữ liệu mới nhất
      const response = await apiClient.get('/auth/user', {
        headers: { Authorization: `Bearer ${auth.token}` }
      });
      
      return { 
        user: response.data.user, 
        fromCache: false,
        timestamp: Date.now()
      };
    } catch (error: any) {
      console.error('Lỗi khi lấy thông tin người dùng:', error);
      return rejectWithValue('Lỗi khi lấy thông tin người dùng');
    }
  }
);

// Thêm thunk cho việc cập nhật avatar
export const updateAvatar = createAsyncThunk(
  'auth/updateAvatar',
  async (avatarData: FormData, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState() as { auth: AuthState };
      if (!auth.token) {
        return rejectWithValue('Không có token');
      }

      const response = await apiClient.put('/auth/update-avatar', avatarData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      });
      
      console.log('Cập nhật avatar thành công:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Lỗi khi cập nhật avatar:', error);
      if (error.response && error.response.data) {
        return rejectWithValue(error.response.data.message || error.response.data);
      }
      return rejectWithValue('Lỗi khi cập nhật avatar');
    }
  }
);

// Tạo slice cho auth
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setToken: (state, action) => {
      state.token = action.payload;
    },
    setUser: (state, action) => {
      state.user = action.payload;
    },
    clearErrors: (state) => {
      state.error = null;
    },
    // New reducer to update user avatar
    updateUserAvatar: (state, action: PayloadAction<string>) => {
      if (state.user) {
        state.user.avatar = action.payload;
      }
    },
    logout: (state) => {
      state.token = null;
      state.user = null;
      state.error = null;
    },
    // Reducer để đánh dấu cần refresh
    setNeedRefresh: (state, action) => {
      state.needRefresh = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Xử lý login
    builder
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        console.log('Đăng nhập thành công:', action.payload);
        state.token = action.payload.token;
        state.user = action.payload.user;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        console.error('Đăng nhập bị từ chối:', action.payload);
        state.error = action.payload as string;
      });

    // Xử lý fetchUserInfo
    builder
      .addCase(fetchUserInfo.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchUserInfo.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
      })
      .addCase(fetchUserInfo.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Xử lý fetchAvatar
    builder
      .addCase(fetchAvatar.fulfilled, (state, action) => {
        if (state.user) {
          state.user.avatar = action.payload;
        }
      });

    // Xử lý logout
    builder
      .addCase(logout.fulfilled, (state) => {
        state.token = null;
        state.user = null;
        state.error = null;
        state.lastUpdated = null;  // Xóa thời gian cập nhật cuối cùng
        state.needRefresh = false; // Reset flag needRefresh
      });

    // Xử lý checkAuth
    builder
      .addCase(checkAuth.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.isLoading = false;
        state.token = action.payload;
      })
      .addCase(checkAuth.rejected, (state) => {
        state.isLoading = false;
        state.token = null;
        state.user = null;
      });

    // Xử lý updateUserData
    builder
      .addCase(updateUserData.pending, (state) => {
        // Không set loading = true để tránh hiện loading indicator
        // state.isLoading = true;
      })
      .addCase(updateUserData.fulfilled, (state, action) => {
        // state.isLoading = false;
        if (!action.payload.fromCache) {
          state.user = action.payload.user;
          state.lastUpdated = action.payload.timestamp;
        }
        state.needRefresh = false;
      })
      .addCase(updateUserData.rejected, (state) => {
        // state.isLoading = false;
        // Không set error để tránh hiện lỗi không cần thiết
      });
      
    // Xử lý markNeedRefresh
    builder.addCase(markNeedRefresh, (state) => {
      state.needRefresh = true;
    });

    // Thêm xử lý updateAvatar
    builder
      .addCase(updateAvatar.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateAvatar.fulfilled, (state, action) => {
        state.isLoading = false;
        if (state.user && action.payload) {
          // Đảm bảo cập nhật đúng URL avatar từ response
          state.user = {
            ...state.user,
            avatar: action.payload.avatar || 
                   (action.payload.user && action.payload.user.avatar) ||
                   action.payload.url
          };
        }
      })
      .addCase(updateAvatar.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setToken, setUser, clearErrors, updateUserAvatar, setNeedRefresh } = authSlice.actions;

export default authSlice.reducer;