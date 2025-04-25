import apiClient from './apiClient';

// Định nghĩa kiểu dữ liệu cho danh mục
interface CategoryData {
  _id: string;
  name: string;
}

// Định nghĩa kiểu dữ liệu cho thương hiệu
interface BrandData {
  _id: string;
  name: string;
}

// Định nghĩa kiểu dữ liệu cho đánh giá
interface ReviewData {
  _id: string;
  userId: string;
  rating: number;
  comment: string;
  createdAt: string;
}

// Định nghĩa kiểu dữ liệu cho sản phẩm
interface ProductData {
  _id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  discount?: number;
  category: CategoryData;
  brand: BrandData;
  images: string[];
  ingredients?: string;
  usage?: string;
  stock: number;
  reviews: ReviewData[];
  averageRating: number;
  active: boolean;
  featured: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

// Interface phản hồi khi lấy danh sách sản phẩm
interface ProductListResponse {
  message: string;
  totalProducts: number;
  products: ProductData[];
}

// Interface phản hồi khi lấy chi tiết một sản phẩm
interface ProductDetailResponse {
  message: string;
  product: ProductData;
}

export const productApi = {
  // Lấy tất cả sản phẩm - Backend hiện không hỗ trợ phân trang và sắp xếp
  getAllProducts: async () => {
    return apiClient.get<ProductListResponse>('/products');
  },

  // Lấy chi tiết sản phẩm theo slug
  getProductBySlug: async (slug: string) => {
    return apiClient.get<ProductDetailResponse>(`/products/product-slug/${slug}`);
  },

  // Lấy danh sách sản phẩm theo category slug
  getProductsByCategorySlug: async (slug: string) => {
    return apiClient.get<ProductListResponse>(`/products/list/category/slug/${slug}`);
  },

  // Tìm kiếm sản phẩm
  searchProducts: async (query: string) => {
    return apiClient.get<ProductListResponse>(`/products/search?keyword=${encodeURIComponent(query)}`);
  },

  // Lấy sản phẩm theo brandId
  getProductsByBrandId: async (brandId: string) => {
    return apiClient.get<ProductListResponse>(`/products/get-by-brand/${brandId}`);
  }
};
