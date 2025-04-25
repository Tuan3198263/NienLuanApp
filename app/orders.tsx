import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useState, useEffect } from "react";
import { orderApi } from "../src/api/orderApi";
import type { Order, OrderStatus } from "../src/api/orderApi";
import { FontAwesome5 } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import { useRouter } from "expo-router";

// Add EmptyState component at the top
const EmptyState = () => (
  <View style={styles.emptyContainer}>
    <FontAwesome5 name="box-open" size={50} color="#ccc" />
    <Text style={styles.emptyText}>Chưa có đơn hàng nào</Text>
  </View>
);

export default function OrdersScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState(
    (params.initialTab as string) || "Tất cả"
  );
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // Map API status to display text
  const statusMapping: Record<OrderStatus, string> = {
    pending: "Chờ xác nhận",
    processed: "Đã xác nhận",
    shipped: "Đang giao",
    delivered: "Đã nhận",
    canceled: "Đã hủy",
    returned: "Đã trả hàng",
  };

  // Status colors
  const statusColors: Record<OrderStatus, { bg: string; text: string }> = {
    pending: { bg: "#fff8e1", text: "#ff9800" },
    processed: { bg: "#e3f2fd", text: "#2196f3" },
    shipped: { bg: "#e8f5e9", text: "#4caf50" },
    delivered: { bg: "#e8f5e9", text: "#388e3c" },
    canceled: { bg: "#ffebee", text: "#f44336" },
    returned: { bg: "#fafafa", text: "#757575" },
  };

  const orderStatuses = ["Tất cả", ...Object.values(statusMapping)];

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = "your_token_here"; // Get from your auth system
        const response = await orderApi.getOrders(token);
        setOrders(response.data.orders);
      } catch (error) {
        console.error("Failed to fetch orders:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const getStatusStyle = (status: OrderStatus) => ({
    backgroundColor: statusColors[status].bg,
    color: statusColors[status].text,
  });

  const filteredOrders =
    activeTab === "Tất cả"
      ? orders
      : orders.filter((order) => statusMapping[order.status] === activeTab);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Tabs */}
      <View style={styles.tabContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {orderStatuses.map((status) => (
            <TouchableOpacity
              key={status}
              style={[styles.tab, activeTab === status && styles.activeTab]}
              onPress={() => setActiveTab(status)}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === status && styles.activeTabText,
                ]}
              >
                {status}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#e94560" />
        </View>
      ) : (
        <ScrollView style={styles.content}>
          {filteredOrders.length > 0 ? (
            filteredOrders.map((order, index) => (
              <TouchableOpacity
                key={order._id}
                onPress={() => router.push(`/order/${order.orderCode}`)}
              >
                <View style={styles.orderContainer}>
                  <View style={styles.orderHeader}>
                    <View>
                      <Text style={styles.orderIdLabel}>Mã đơn hàng:</Text>
                      <Text style={styles.orderId}>{order.orderCode}</Text>
                    </View>
                    <View
                      style={[
                        styles.statusContainer,
                        { backgroundColor: statusColors[order.status].bg },
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusText,
                          { color: statusColors[order.status].text },
                        ]}
                      >
                        {statusMapping[order.status]}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.productContainer}>
                    <View style={styles.productImages}>
                      {order.items.map((item, index) => (
                        <Image
                          key={index}
                          source={{ uri: item.productId.images[0] }}
                          style={styles.productImage}
                        />
                      ))}
                    </View>
                    <Text style={styles.productDescription}>
                      {order.items[0].productId.name}
                      {order.items.length > 1 &&
                        ` và ${order.items.length - 1} sản phẩm khác`}
                    </Text>
                    <View style={styles.orderDetails}>
                      <Text style={styles.orderDate}>
                        Ngày đặt hàng:{" "}
                        {new Date(order.orderDate).toLocaleDateString("vi-VN")}
                      </Text>
                      <Text style={styles.orderTotal}>
                        Tổng tiền: {order.totalPrice.toLocaleString("vi-VN")} đ
                      </Text>
                    </View>
                  </View>
                </View>
                {index < filteredOrders.length - 1 && (
                  <View style={styles.divider} />
                )}
              </TouchableOpacity>
            ))
          ) : (
            <EmptyState />
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  tabContainer: {
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  tab: {
    paddingVertical: 12,
    paddingHorizontal: 15,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: "#e94560",
  },
  tabText: {
    fontSize: 14,
    color: "#666",
  },
  activeTabText: {
    color: "#e94560",
    fontWeight: "500",
  },
  content: {
    flex: 1,
  },
  orderContainer: {
    padding: 15,
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  orderIdLabel: {
    fontSize: 14,
    color: "#666",
  },
  orderId: {
    fontSize: 14,
    fontWeight: "500",
  },
  statusContainer: {
    backgroundColor: "#fff8e1",
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 4,
  },
  statusText: {
    color: "#ff9800",
    fontSize: 12,
    fontWeight: "500",
  },
  productContainer: {
    borderWidth: 1,
    borderColor: "#f0f0f0",
    borderRadius: 8,
    padding: 15,
  },
  productImages: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 15,
    gap: 10,
  },
  productImage: {
    width: 60,
    height: 60,
    borderWidth: 1,
    borderColor: "#f0f0f0",
    borderRadius: 4,
    marginRight: 10,
  },
  productDescription: {
    fontSize: 14,
    lineHeight: 20,
    color: "#333",
    marginBottom: 15,
  },
  orderDetails: {
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    paddingTop: 15,
  },
  orderDate: {
    fontSize: 14,
    color: "#666",
    marginBottom: 5,
  },
  orderTotal: {
    fontSize: 14,
    fontWeight: "bold",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    marginTop: "50%",
  },
  emptyText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
  },
  loading: {
    marginTop: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  divider: {
    height: 8,
    backgroundColor: "#f5f5f5",
  },
});
