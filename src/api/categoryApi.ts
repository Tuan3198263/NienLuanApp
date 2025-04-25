import apiClient from './apiClient';

// Định nghĩa kiểu dữ liệu cho danh mục
interface CategoryData {
  _id: string;
  name: string;
  slug: string;
  status?: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
}

// Interface phản hồi khi lấy danh sách danh mục
interface CategoryListResponse {
  message?: string;
  categories: CategoryData[];
}

// Interface phản hồi khi lấy chi tiết một danh mục
interface CategoryDetailResponse {
  _id: string;
  name: string;
  slug: string;
  status?: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
}

// Interface phản hồi khi lấy tên tất cả danh mục
type AllCategoryNamesResponse = CategoryData[];

export const categoryApi = {
  // Lấy danh sách tất cả tên danh mục
  getAllCategoryNames: async () => {
    return apiClient.get<AllCategoryNamesResponse>('/categories/all-names');
  },

  // Lấy chi tiết danh mục theo slug
  getCategoryBySlug: async (slug: string) => {
    return apiClient.get<CategoryDetailResponse>(`/categories/slug/${slug}`);
  },

  // Lấy tất cả danh mục
  getAllCategories: async () => {
    return apiClient.get<CategoryListResponse>('/categories');
  }
};
