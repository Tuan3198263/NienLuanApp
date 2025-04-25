import apiClient from './apiClient';

// Định nghĩa kiểu dữ liệu phù hợp với model từ backend
interface ShippingAddressData {
  _id?: string;
  userId?: string;
  fullName: string;
  phone: string;
  address: string;
  city: string;        // Mã tỉnh/thành phố
  cityName: string;    // Tên tỉnh/thành phố
  district: string;    // Mã quận/huyện
  districtName: string; // Tên quận/huyện
  ward: string;        // Mã phường/xã
  wardName: string;    // Tên phường/xã
  isDefault?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Interface phản hồi khi lấy địa chỉ
interface ShippingAddressesResponse {
  success: boolean;
  message: string;
  data: {
    data: ShippingAddressData;
  };
}

// Interface phản hồi khi thao tác với một địa chỉ
interface ShippingAddressResponse {
  success: boolean;
  data: {
    address: ShippingAddressData;
  };
  message?: string;
}

export const shippingAddressApi = {
  // Lấy tất cả địa chỉ giao hàng của người dùng
  getShippingAddresses: async (token: string) => {
    return apiClient.get<ShippingAddressesResponse>('/shipping-address', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  },

  // Cập nhật địa chỉ giao hàng
  updateShippingAddress: async (token: string, addressData: Partial<ShippingAddressData> & { _id: string }) => {
    return apiClient.put<ShippingAddressResponse>('/shipping-address/update', addressData, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  }
};
