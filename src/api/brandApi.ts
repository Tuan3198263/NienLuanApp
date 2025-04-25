import apiClient from './apiClient';

// Định nghĩa kiểu dữ liệu cho thương hiệu
interface BrandData {
  _id: string;
  name: string;
  logo?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

// Interface phản hồi khi lấy danh sách thương hiệu
// Theo response mẫu, API trả về trực tiếp mảng các brand
type BrandListResponse = BrandData[];

// Interface phản hồi khi lấy chi tiết một thương hiệu
interface BrandDetailResponse {
  message?: string;
  brand: BrandData;
}

// Interface phản hồi khi lấy tên tất cả thương hiệu
// Cập nhật để khớp với response thực tế
interface BrandNameData {
  _id: string;
  name: string;
}

type AllBrandNamesResponse = BrandNameData[];

// Interface phản hồi khi tìm kiếm thương hiệu theo từ khóa sản phẩm
interface BrandsByProductKeywordResponse {
  brands: BrandData[]; // Change to array directly since API returns array
}

// Interface phản hồi khi lấy thương hiệu theo danh mục
interface BrandsByCategoryResponse {
  message?: string;
  brands: BrandData[];
}

export const brandApi = {
  // Lấy danh sách tất cả thương hiệu
  getAllBrands: async () => {
    return apiClient.get<BrandListResponse>('/brands');
  },

  // Lấy danh sách tất cả tên thương hiệu
  getAllBrandNames: async () => {
    return apiClient.get<AllBrandNamesResponse>('/brands/all-names');
  },

  // Lấy chi tiết thương hiệu theo ID
  getBrandById: async (brandId: string) => {
    return apiClient.get<BrandDetailResponse>(`/brands/${brandId}`);
  },

  // Tìm kiếm thương hiệu theo từ khóa sản phẩm
  getBrandsByProductKeyword: async (query: string) => {
    const response = await apiClient.get<BrandData[]>(`/brands/search?keyword=${encodeURIComponent(query)}`);
    return { data: { brands: response.data } }; // Wrap the response to match expected format
  },

  // Lấy thương hiệu theo danh mục
  getBrandsByCategory: async (categorySlug: string) => {
    return apiClient.get<BrandsByCategoryResponse>(`/brands/brands-by-category/${categorySlug}`);
  }
};
