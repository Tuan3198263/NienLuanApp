import apiClient from './apiClient';

// Định nghĩa kiểu dữ liệu phản hồi
interface WishlistResponse {
  message: string;
}

interface FavoriteStatusResponse {
  isFavorite: boolean;
}

interface FavoriteCountResponse {
  productId: string;
  favoriteCount: number;
}

interface WishlistProduct {
  _id: string;
  name: string;
  price: number;
  images: string[];
  description: string;
  stock: number;
  averageRating: number;
  active: boolean;
  featured: boolean;
  slug: string;
}

interface GetFavoritesResponse {
  products: WishlistProduct[];
}

export const wishlistApi = {
  // Thêm/xóa sản phẩm khỏi danh sách yêu thích
  toggleFavorite: async (token: string, productId: string) => {
    return apiClient.post<WishlistResponse>(
      '/favorites/toggle',
      { productId },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
  },

  // Lấy danh sách sản phẩm yêu thích
  getFavorites: async (token: string) => {
    return apiClient.get<GetFavoritesResponse>('/favorites/list', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  },

  // Kiểm tra trạng thái yêu thích của sản phẩm
  checkFavoriteStatus: async (token: string, productId: string) => {
    return apiClient.get<FavoriteStatusResponse>(`/favorites/check/${productId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  },

  // Lấy số lượng yêu thích của sản phẩm
  getFavoriteCount: async (productId: string) => {
    return apiClient.get<FavoriteCountResponse>(`/favorites/count/${productId}`);
  }
};
