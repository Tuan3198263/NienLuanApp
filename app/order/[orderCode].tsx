import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../src/redux/store";
import { orderApi, Order } from "../../src/api/orderApi";
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
} from "react-native";
import { Ionicons, MaterialIcons, FontAwesome } from "@expo/vector-icons";
import { commonStyles } from "../../src/styles/commonStyles";
import { styles } from "../../src/styles/orderDetailStyles";

// Thay thế import date-fns bằng hàm formatDate
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return `${date.getDate().toString().padStart(2, "0")}/${(date.getMonth() + 1)
    .toString()
    .padStart(2, "0")}/${date.getFullYear()}`;
};

const LoadingSkeleton = () => {
  return (
    <View style={styles.loadingContainer}>
      <View style={styles.loadingCard}>
        <View style={[styles.loadingRow, { width: "70%" }]} />
        <View style={[styles.loadingRow, { width: "50%" }]} />
      </View>

      <View style={styles.loadingCard}>
        <View style={[styles.loadingRow, { width: "60%" }]} />
        <View style={[styles.loadingRow, { width: "90%" }]} />
        <View style={[styles.loadingRow, { width: "80%" }]} />
      </View>

      <View style={styles.loadingCard}>
        {[1, 2].map((item) => (
          <View key={item} style={styles.orderItem}>
            <View style={styles.loadingImage} />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <View style={[styles.loadingRow, { width: "90%" }]} />
              <View style={[styles.loadingRow, { width: "40%" }]} />
            </View>
          </View>
        ))}
      </View>
    </View>
  );
};

export default function OrderDetailScreen() {
  const { orderCode } = useLocalSearchParams();
  const router = useRouter();
  const [orderDetail, setOrderDetail] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Add new modal states
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const token = useSelector((state: RootState) => state.auth.token);

  useEffect(() => {
    const fetchOrderDetail = async () => {
      try {
        console.log("Fetching order details...", { orderCode, token }); // Thêm log
        setLoading(true);
        const response = await orderApi.getOrderByCode(
          token!,
          orderCode as string
        );
        console.log("API Response:", response.data); // Thêm log
        setOrderDetail(response.data.order);
      } catch (err) {
        console.error("Error fetching order:", err); // Thêm log chi tiết lỗi
        setError("Không thể tải thông tin đơn hàng");
      } finally {
        setLoading(false);
      }
    };

    if (!token) {
      console.log("No token found"); // Thêm log
      setError("Bạn cần đăng nhập để xem đơn hàng");
      setLoading(false);
      return;
    }

    if (!orderCode) {
      console.log("No orderCode found"); // Thêm log
      setError("Mã đơn hàng không hợp lệ");
      setLoading(false);
      return;
    }

    fetchOrderDetail();
  }, [token, orderCode]);

  const getStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      pending: "Chờ xác nhận",
      processed: "Đã xác nhận",
      shipped: "Đang giao",
      delivered: "Đã nhận",
      canceled: "Đã hủy",
      returned: "Đã trả",
    };
    return statusMap[status] || status;
  };

  // Hàm tính tổng giá trị sản phẩm
  const calculateSubtotal = (items: OrderItem[]) => {
    return items.reduce(
      (sum, item) => sum + item.quantity * item.priceAtTime,
      0
    );
  };

  // Update handleCancelOrder to use modals
  const handleCancelOrder = () => {
    setModalMessage("Bạn có chắc chắn muốn hủy đơn hàng này?");
    setShowConfirmModal(true);
  };

  // Add processCancelOrder function
  const processCancelOrder = async () => {
    if (!orderDetail || !token) return;

    try {
      setIsProcessing(true);
      await orderApi.cancelOrder(token, orderDetail.orderCode);
      setShowConfirmModal(false);
      setModalMessage("Đơn hàng đã được hủy thành công");
      setShowSuccessModal(true);
      setTimeout(() => {
        setShowSuccessModal(false);
        router.back();
      }, 1500);
    } catch (err) {
      setModalMessage("Không thể hủy đơn hàng. Vui lòng thử lại sau.");
      setShowSuccessModal(true);
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) return <LoadingSkeleton />;
  if (error)
    return (
      <View style={styles.container}>
        <Text>{error}</Text>
      </View>
    );
  if (!orderDetail) return null;

  return (
    <View style={styles.container}>
      {/* Add Small Header */}
      <View style={commonStyles.smallHeaderContainer}>
        <Text style={commonStyles.smallHeaderText}>Thông tin đơn hàng</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* Order Info */}
        <View style={styles.infoCard}>
          <View style={styles.orderInfoHeader}>
            <View style={styles.infoRow}>
              <View style={styles.iconWrapper}>
                <Ionicons name="document-text" size={20} color="#666" />
              </View>
              <Text style={styles.infoTitle}>Mã đơn hàng:</Text>
              <Text style={styles.orderNumber}>#{orderDetail.orderCode}</Text>
            </View>

            <View style={styles.orderStatusRow}>
              <Text style={styles.infoSubtitle}>
                Ngày tạo: {formatDate(orderDetail.orderDate)}
              </Text>
              <View style={styles.statusContainer}>
                <Text style={styles.statusText}>
                  {getStatusText(orderDetail.status)}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Delivery Info */}
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <View style={styles.iconWrapper}>
              <Ionicons name="map" size={20} color="#666" />
            </View>
            <Text style={styles.infoTitle}>Địa chỉ nhận hàng</Text>
          </View>

          <View style={styles.addressContainer}>
            <Text style={styles.addressName}>
              {orderDetail.shippingInfo.fullName}
            </Text>
            <Text style={styles.addressPhone}>
              {orderDetail.shippingInfo.phone}
            </Text>
            <Text style={styles.addressDetail}>
              {`${orderDetail.shippingInfo.address}, ${orderDetail.shippingInfo.wardName}, ${orderDetail.shippingInfo.districtName}, ${orderDetail.shippingInfo.cityName}`}
            </Text>
          </View>
        </View>

        {/* Thêm Shipping Method */}
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <View style={styles.iconWrapper}>
              <Ionicons name="car" size={20} color="#666" />
            </View>
            <Text style={styles.infoTitle}>Phương thức giao hàng</Text>
          </View>

          <View style={styles.deliveryContainer}>
            <Text style={styles.deliveryType}>Giao hàng Nhanh</Text>
            <Text style={styles.deliveryTime}>
              Dự kiến:{" "}
              {orderDetail.estimatedDeliveryDate
                ? formatDate(orderDetail.estimatedDeliveryDate)
                : "Đang cập nhật"}
            </Text>
            <Text style={styles.deliveryNote}>
              Giao hàng giờ hành chính từ thứ 2 tới thứ 7
            </Text>
          </View>
        </View>

        {/* Thêm Payment Method */}
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <View style={styles.iconWrapper}>
              <Ionicons name="wallet" size={20} color="#666" />
            </View>
            <Text style={styles.infoTitle}>Phương thức thanh toán</Text>
          </View>

          <View style={styles.paymentMethod}>
            <Text style={styles.paymentTitle}>
              COD - Thanh toán khi nhận hàng
            </Text>
            <Text style={styles.paymentStatus}>Thanh toán khi nhận hàng</Text>
          </View>
        </View>

        {/* Items */}
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <View style={styles.iconWrapper}>
              <Ionicons name="list" size={20} color="#666" />
            </View>
            <Text style={styles.infoTitle}>Thông tin đơn hàng</Text>
          </View>

          {orderDetail.items.map((item) => (
            <View key={item._id} style={styles.orderItem}>
              <Image
                source={{ uri: item.productId.images[0] }}
                style={styles.itemImage}
              />
              <View style={styles.itemDetails}>
                <Text style={styles.itemName}>{item.productId.name}</Text>
                <View style={styles.priceRow}>
                  <Text style={styles.itemQuantityPrice}>
                    {item.quantity} x {item.priceAtTime.toLocaleString()}đ
                  </Text>
                  <Text style={styles.itemTotalPrice}>
                    {(item.quantity * item.priceAtTime).toLocaleString()}đ
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Order Summary */}
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <View style={styles.iconWrapper}>
              <Ionicons name="cart" size={20} color="#666" />
            </View>
            <Text style={styles.infoTitle}>Thanh toán</Text>
          </View>

          <View style={styles.summaryContainer}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Tạm tính</Text>
              <Text style={styles.summaryValue}>
                {calculateSubtotal(orderDetail.items).toLocaleString()} đ
              </Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Phí vận chuyển</Text>
              <Text style={styles.summaryValue}>
                {orderDetail.shippingFeeDetails.mainFee.toLocaleString()} đ
              </Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Giảm giá vận chuyển</Text>
              <Text style={styles.summaryValue}>
                -{orderDetail.shippingFeeDetails.discount.toLocaleString()} đ
              </Text>
            </View>

            <View style={[styles.summaryRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Thành tiền</Text>
              <Text style={styles.totalValue}>
                {orderDetail.totalPrice.toLocaleString()} đ
              </Text>
            </View>

            {/* Add extra padding at bottom */}
            <View style={styles.bottomSpacing} />
          </View>
        </View>

        {/* Add Cancel Order Button for pending orders */}
        {orderDetail?.status === "pending" && (
          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.footerButton, styles.cancelButton]}
              onPress={handleCancelOrder}
            >
              <Text style={styles.cancelButtonText}>Hủy đơn hàng</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Confirm Modal */}
      <Modal visible={showConfirmModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.confirmModalContent}>
            <FontAwesome name="exclamation-circle" size={50} color="#FF6B6B" />
            <Text style={styles.modalTitle}>Xác nhận hủy đơn</Text>
            <Text style={styles.modalText}>{modalMessage}</Text>
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => setShowConfirmModal(false)}
              >
                <Text style={styles.cancelButtonText}>Không</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.confirmButton]}
                onPress={processCancelOrder}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.confirmButtonText}>Có</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Success Modal */}
      <Modal visible={showSuccessModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <FontAwesome name="check-circle" size={50} color="#4CAF50" />
            <Text style={styles.modalText}>{modalMessage}</Text>
          </View>
        </View>
      </Modal>
    </View>
  );
}
