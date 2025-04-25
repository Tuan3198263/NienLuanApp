import axios from 'axios';
import Constants from 'expo-constants';

const GHN_API_URL = "https://online-gateway.ghn.vn/shiip/public-api";
const GHN_API_TOKEN = Constants.expoConfig?.extra?.ghnToken || "PLACE_YOUR_GHN_TOKEN_HERE"; // Replace with actual GHN token from env
const GHN_SHOP_ID = Constants.expoConfig?.extra?.ghnShopId;
const SERVICE_ID = Constants.expoConfig?.extra?.serviceId;

// Định nghĩa kiểu dữ liệu
interface Province {
  ProvinceID: number;
  ProvinceName: string;
  CountryID: number;
  Code: string;
}

interface District {
  DistrictID: number;
  DistrictName: string;
  ProvinceID: number;
  Code: string;
}

interface Ward {
  WardCode: string;
  WardName: string;
  DistrictID: number;
}

interface GHNResponse<T> {
  code: number;
  message: string;
  data: T;
}

interface LeadTimeResponse {
  leadtime: number;
  leadtime_order: {
    from_estimate_date: string;
    to_estimate_date: string;
  }
}

interface ShippingFeeResponse {
  total: number;
  service_fee: number;
  insurance_fee: number;
}

export const locationApi = {
  // Lấy danh sách tỉnh/thành phố từ GHN
  getProvinces: async () => {
    try {
      const response = await axios.get<GHNResponse<Province[]>>(
        `${GHN_API_URL}/master-data/province`, 
        { 
          headers: { 
            token: GHN_API_TOKEN, 
            "Content-Type": "application/json" 
          } 
        }
      );
      
      if (response.data.code === 200) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Không thể lấy danh sách tỉnh/thành phố');
    } catch (error) {
      console.error("Lỗi khi lấy danh sách tỉnh/thành phố:", error);
      throw error;
    }
  },

  // Lấy danh sách quận/huyện theo tỉnh/thành phố
  getDistricts: async (provinceId: number) => {
    try {
      const response = await axios.post<GHNResponse<District[]>>(
        `${GHN_API_URL}/master-data/district`,
        { province_id: provinceId },
        { 
          headers: { 
            token: GHN_API_TOKEN, 
            "Content-Type": "application/json" 
          } 
        }
      );
      
      if (response.data.code === 200) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Không thể lấy danh sách quận/huyện');
    } catch (error) {
      console.error("Lỗi khi lấy danh sách quận/huyện:", error);
      throw error;
    }
  },

  // Lấy danh sách phường/xã theo quận/huyện
  getWards: async (districtId: number) => {
    try {
      const response = await axios.post<GHNResponse<Ward[]>>(
        `${GHN_API_URL}/master-data/ward`,
        { district_id: districtId },
        { 
          headers: { 
            token: GHN_API_TOKEN, 
            "Content-Type": "application/json" 
          } 
        }
      );
      
      if (response.data.code === 200) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Không thể lấy danh sách phường/xã');
    } catch (error) {
      console.error("Lỗi khi lấy danh sách phường/xã:", error);
      throw error;
    }
  },

  // Tính thời gian giao hàng
  calculateLeadTime: async (toDistrictId: number, toWardCode: string) => {
    try {
      const response = await axios.post<GHNResponse<LeadTimeResponse>>(
        `${GHN_API_URL}/v2/shipping-order/leadtime`,
        {
          to_district_id: toDistrictId,
          to_ward_code: toWardCode,
          service_id: SERVICE_ID,
        },
        {
          headers: {
            Token: GHN_API_TOKEN,
            ShopId: GHN_SHOP_ID,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.code === 200) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Không thể tính thời gian giao hàng');
    } catch (error) {
      console.error("Lỗi khi tính thời gian giao hàng:", error);
      throw error;
    }
  },

  // Tính phí vận chuyển
  calculateShippingFee: async (toDistrictId: number, toWardCode: string, insuranceValue: number) => {
    try {
      const response = await axios.post<GHNResponse<ShippingFeeResponse>>(
        `${GHN_API_URL}/v2/shipping-order/fee`,
        {
          service_type_id: 2,
          to_district_id: toDistrictId,
          to_ward_code: toWardCode,
          weight: 1500,
          insurance_value: insuranceValue,
        },
        {
          headers: {
            Token: GHN_API_TOKEN,
            ShopId: GHN_SHOP_ID,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.code === 200) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Không thể tính phí vận chuyển');
    } catch (error) {
      console.error("Lỗi khi tính phí vận chuyển:", error);
      throw error;
    }
  }
};
