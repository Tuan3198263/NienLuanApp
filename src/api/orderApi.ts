import apiClient from './apiClient';

// Định nghĩa kiểu dữ liệu cho một sản phẩm trong đơn hàng
interface OrderItem {
  productId: {
    _id: string;
    name: string;
    images: string[];
    price: number;
  };
  quantity: number;
  priceAtTime: number;
}

// Định nghĩa kiểu dữ liệu cho thông tin giao hàng
interface ShippingInfo {
  fullName: string;
  phone: string;
  address: string;
  cityName: string;
  districtName: string;
  wardName: string;
}

// Định nghĩa kiểu dữ liệu cho chi tiết phí vận chuyển
interface ShippingFeeDetails {
  mainFee: number;
  discount: number;
  finalFee: number;
}

// Định nghĩa trạng thái đơn hàng
type OrderStatus = 'pending' | 'processed' | 'shipped' | 'delivered' | 'canceled' | 'returned';

// Định nghĩa kiểu dữ liệu cho một đơn hàng
interface Order {
  _id: string;
  orderCode: string;
  userId: string;
  shippingInfo: ShippingInfo;
  items: OrderItem[];
  totalPrice: number;
  shippingFeeDetails: ShippingFeeDetails;
  status: OrderStatus;
  orderDate: string;
  estimatedDeliveryDate?: string;
  updateDate?: string;
  createdAt: string;
  updatedAt: string;
}

// Interface cho dữ liệu tạo đơn hàng
interface CreateOrderData {
  shippingInfo: ShippingInfo;
  insurance_value: number;
  shipping_fee_input: number;
  items?: any[]; // Các thông tin bổ sung cho GHN nếu cần
}

// Interface phản hồi khi tạo đơn hàng
interface CreateOrderResponse {
  message: string;
  order: Order;
}

// Interface phản hồi khi lấy danh sách đơn hàng
interface GetOrdersResponse {
  message: string;
  orders: Order[];
}

// Interface phản hồi khi lấy chi tiết đơn hàng
interface GetOrderDetailResponse {
  message: string;
  order: Order;
}

// Interface phản hồi khi hủy đơn hàng
interface CancelOrderResponse {
  message: string;
  order: Order;
}

export const orderApi = {
  // Tạo đơn hàng mới
  createOrder: async (token: string, orderData: CreateOrderData) => {
    return apiClient.post<CreateOrderResponse>('/order/create-order', orderData, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  },

  // Lấy danh sách tất cả đơn hàng
  getOrders: async (token: string) => {
    return apiClient.get<GetOrdersResponse>(`/order`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  },

  // Lấy chi tiết đơn hàng theo mã đơn
  getOrderByCode: async (token: string, orderCode: string) => {
    return apiClient.get<GetOrderDetailResponse>(`/order/details/${orderCode}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  },

  // Hủy đơn hàng
  cancelOrder: async (token: string, orderCode: string) => {
    return apiClient.post<CancelOrderResponse>(`/order/cancel/${orderCode}`, {}, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  }
};
