import apiClient from './apiClient';

// Cập nhật interface CartItem để phù hợp với response
interface CartItemProduct {
  _id: string;
  name: string;
  images: string[];
  // Các trường khác của sản phẩm
}

interface CartItem {
  productId: CartItemProduct; // Đây là khác biệt quan trọng - productId là một object chứ không phải string
  quantity: number;
  priceAtTime: number;
}

interface Cart {
  _id: string;
  userId: string;
  items: CartItem[];
  totalPrice: number;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

// Interface cho response của giỏ hàng
interface CartResponse {
  message: string;
  cart: Cart;
}

// Interface cho response khi giỏ hàng trống
interface EmptyCartResponse {
  message: string;
  cart: {
    items: [];
    totalPrice: number;
  };
}

// Interface cho response khi có lỗi
interface CartErrorResponse {
  message: string;
}

export const cartApi = {
  // Lấy giỏ hàng hiện tại
  getCart: async (token: string) => {
    const response = await apiClient.get<CartResponse | EmptyCartResponse>('/cart', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    // Nếu có items, tính totalQuantity
    if ('cart' in response.data) {
      const totalQuantity = response.data.cart.items.reduce(
        (sum, item) => sum + item.quantity, 
        0
      );
      return {
        ...response,
        data: {
          ...response.data,
          cart: {
            ...response.data.cart,
            totalQuantity
          }
        }
      };
    }

    return response;
  },

  // Thêm sản phẩm vào giỏ hàng
  addToCart: async (token: string, productId: string) => {
    return apiClient.post<CartResponse>('/cart/add', 
      { productId },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
  },

  // Giảm số lượng sản phẩm trong giỏ hàng
  removeFromCart: async (token: string, productId: string) => {
    return apiClient.post<CartResponse>('/cart/remove',
      { productId },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
  },

  // Xóa sản phẩm khỏi giỏ hàng
  removeItemFromCart: async (token: string, productId: string) => {
    return apiClient.post<CartResponse>('/cart/delete',
      { productId },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
  }
};
