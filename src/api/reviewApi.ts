import apiClient from './apiClient';

// Định nghĩa kiểu dữ liệu cho đánh giá
interface ReviewData {
  _id: string;
  userId: {
    fullName: string;
    avatar?: string;
  };
  productId: string;
  rating: number;
  comment: string;
  status?: 'active' | 'hidden';
  createdAt: string;
  updatedAt: string;
}

// Interface cho dữ liệu tạo đánh giá mới
interface CreateReviewData {
  productId: string;
  rating: number;
  comment: string;
}

// Interface phản hồi khi thêm đánh giá mới
interface AddReviewResponse {
  success: boolean;
  message: string;
  productName: string;
  review: ReviewData;
}

// Interface phản hồi khi kiểm tra quyền đánh giá
interface ReviewEligibilityResponse {
  message: string;
  canReview: boolean;
  remainingReviews?: number;
}

// Interface phản hồi khi lấy danh sách đánh giá
interface ReviewListResponse {
  message: string;
  productName: string;
  reviews: ReviewData[];
}

// Interface phản hồi khi lấy điểm trung bình
interface AverageRatingResponse {
  message: string;
  averageRating: string;
  reviewCount: number;
  ratingBreakdown: {
    "5": number;
    "4": number;
    "3": number;
    "2": number;
    "1": number;
  };
}

// Interface cho sản phẩm
interface Product {
  _id: string;
  name: string;
  price: number;
  images: string[];
  brand: string;
  slug: string;
}

// Interface cho sản phẩm đã đánh giá
interface ReviewedProduct {
  product: Product;
  review: {
    rating: number;
    comment: string;
    createdAt: string;
  };
  totalPurchased: number;
}

// Interface cho sản phẩm chờ đánh giá
interface PendingReviewProduct {
  product: Product;
  remainingReviews: number;
  totalPurchased: number;
  lastPurchaseDate: string;
}

// Interface phản hồi cho danh sách sản phẩm đã đánh giá
interface ReviewedProductsResponse {
  success: boolean;
  reviewedProducts: ReviewedProduct[];
}

// Interface phản hồi cho danh sách sản phẩm chờ đánh giá
interface PendingReviewProductsResponse {
  success: boolean;
  pendingProducts: PendingReviewProduct[];
}

export const reviewApi = {
  // Thêm đánh giá mới
  addReview: async (token: string, reviewData: CreateReviewData) => {
    return apiClient.post<AddReviewResponse>('/reviews/add', reviewData, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  },

  // Kiểm tra quyền đánh giá sản phẩm
  checkReviewEligibility: async (token: string, productId: string) => {
    return apiClient.get<ReviewEligibilityResponse>(`/reviews/eligibility/${productId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  },

  // Lấy danh sách đánh giá theo sản phẩm
  getReviewsByProduct: async (productId: string) => {
    return apiClient.get<ReviewListResponse>(`/reviews/${productId}`);
  },

  // Lấy điểm đánh giá trung bình của sản phẩm
  getAverageRating: async (productId: string) => {
    return apiClient.get<AverageRatingResponse>(`/reviews/average/${productId}`);
  },

  // Lấy danh sách sản phẩm đã đánh giá
  getReviewedProducts: async (token: string) => {
    return apiClient.get<ReviewedProductsResponse>('/reviews/reviewed-products', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  },

  // Lấy danh sách sản phẩm chờ đánh giá
  getPendingReviews: async (token: string) => {
    return apiClient.get<PendingReviewProductsResponse>('/reviews/pending-reviews', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  }
};
