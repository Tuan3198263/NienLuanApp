import React, { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import { useSelector } from "react-redux";
import { ActivityIndicator, Alert, Modal } from "react-native";
import { shippingAddressApi } from "../src/api/shippingAddressApi";
import { cartApi } from "../src/api/cartApi";
import { locationApi } from "../src/api/locationApi";
import { orderApi } from "../src/api/orderApi";
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { Ionicons, MaterialIcons, FontAwesome } from "@expo/vector-icons";
import { styles } from "../src/styles/cartStyle";
import type { AuthState } from "../src/redux/slices/authSlice";

export default function CartScreen() {
  const router = useRouter();
  const { token } = useSelector((state: { auth: AuthState }) => state.auth);
  const [loading, setLoading] = useState(true);
  const [defaultAddress, setDefaultAddress] = useState(null);
  const [cartData, setCartData] = useState<any>(null);
  const [cartLoading, setCartLoading] = useState(true);
  const [shippingInfo, setShippingInfo] = useState<{
    leadTime?: { from_estimate_date: string; to_estimate_date: string };
    shippingFee?: number;
  }>({});

  // Thêm state cho modals
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false); // Thêm modal lỗi
  const [errorMessage, setErrorMessage] = useState(""); // Thêm thông báo lỗi
  const [successMessage, setSuccessMessage] = useState("");
  const [itemToProcess, setItemToProcess] = useState<{
    productId: string;
    productName: string;
    action: "remove" | "decrease";
  } | null>(null);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false); // Thêm trạng thái đang đặt hàng
  const [showConfirmOrderModal, setShowConfirmOrderModal] = useState(false); // State cho popup xác nhận đặt hàng

  useEffect(() => {
    if (token) {
      Promise.all([fetchShippingAddress(), fetchCart()]);
    } else {
      router.navigate("/login");
    }
  }, [token]);

  const fetchShippingAddress = async () => {
    try {
      const response = await shippingAddressApi.getShippingAddresses(token);
      // Chỉ log data quan trọng
      console.log("Address data:", response.data);
      setDefaultAddress(response.data.data);
    } catch (error) {
      console.error("Failed to fetch shipping address:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCart = async () => {
    try {
      setCartLoading(true);
      const response = await cartApi.getCart(token);
      console.log("Cart data:", response.data);
      // Kiểm tra cấu trúc response
      if (response.data?.cart) {
        setCartData(response.data.cart);
      }
    } catch (error) {
      console.error("Failed to fetch cart:", error);
    } finally {
      setCartLoading(false);
    }
  };

  // Add new function to calculate shipping details
  const calculateShipping = async (address: any) => {
    try {
      const [leadTimeRes, shippingFeeRes] = await Promise.all([
        locationApi.calculateLeadTime(Number(address.district), address.ward),
        locationApi.calculateShippingFee(
          Number(address.district),
          address.ward,
          cartData?.totalPrice || 0
        ),
      ]);

      setShippingInfo({
        leadTime: leadTimeRes.leadtime_order,
        shippingFee: shippingFeeRes.total,
      });
    } catch (error) {
      console.error("Failed to calculate shipping:", error);
    }
  };

  // Update useEffect to calculate shipping when address or cart changes
  useEffect(() => {
    if (defaultAddress && cartData?.totalPrice) {
      calculateShipping(defaultAddress);
    }
  }, [defaultAddress, cartData?.totalPrice]);

  // Fix the calculations using cartData
  const subtotal = cartData?.totalPrice || 0;
  const shippingFee = shippingInfo.shippingFee || 0;
  const total = subtotal + shippingFee;

  // Add helper function to check if checkout is possible
  const canCheckout = defaultAddress && cartData?.items?.length > 0;

  const handleIncreaseQuantity = async (productId: string) => {
    try {
      console.log("Tăng số lượng sản phẩm ID:", productId);
      const response = await cartApi.addToCart(token, productId);
      console.log("Response từ addToCart:", response.data);

      // Cập nhật giỏ hàng nếu response có dữ liệu
      if (response.data && response.data.cart) {
        // Kiểm tra đúng cấu trúc dữ liệu trước khi cập nhật
        if (Array.isArray(response.data.cart.items)) {
          setCartData(response.data.cart);
          // Tính lại phí ship
          if (defaultAddress) {
            calculateShipping(defaultAddress);
          }
          // Hiện thông báo thành công
          setSuccessMessage("Đã tăng số lượng sản phẩm");
          setShowSuccessModal(true);
          setTimeout(() => setShowSuccessModal(false), 1500);
        } else {
          console.error("Cấu trúc cart.items không phải là mảng");
        }
      }
    } catch (error: any) {
      // Xử lý message lỗi từ server (status 400)
      const errorMessage =
        error.response?.data?.message ||
        "Không thể tăng số lượng. Vui lòng thử lại sau";
      setSuccessMessage(errorMessage);
      setShowSuccessModal(true);
      setTimeout(() => setShowSuccessModal(false), 1500);
    }
  };

  const handleDecreaseQuantity = async (
    productId: string,
    currentQuantity: number,
    productName: string
  ) => {
    // Nếu số lượng là 1, hiện popup cảnh báo
    if (currentQuantity === 1) {
      setItemToProcess({
        productId,
        productName,
        action: "decrease",
      });
      setShowConfirmModal(true);
      return;
    }

    // Nếu không phải là 1, giảm bình thường
    await processDecreaseQuantity(productId);
  };

  const processDecreaseQuantity = async (productId: string) => {
    try {
      const response = await cartApi.removeFromCart(token, productId);
      // Kiểm tra đúng cấu trúc response
      if (response.data?.message && response.data?.cart) {
        setCartData(response.data.cart);
        // Tính lại phí ship
        if (defaultAddress) {
          calculateShipping(defaultAddress);
        }
        // Hiện thông báo thành công
        setSuccessMessage("Đã giảm số lượng sản phẩm");
        setShowSuccessModal(true);
        setTimeout(() => setShowSuccessModal(false), 1500);
      }
    } catch (error) {
      console.error("Lỗi khi giảm số lượng:", error);
      setSuccessMessage("Không thể giảm số lượng. Vui lòng thử lại sau");
      setShowSuccessModal(true);
      setTimeout(() => setShowSuccessModal(false), 1500);
    }
  };

  const handleRemoveItem = async (productId: string, productName: string) => {
    setItemToProcess({
      productId,
      productName,
      action: "remove",
    });
    setShowConfirmModal(true);
  };

  const processItemAction = async () => {
    if (!itemToProcess) return;

    try {
      setShowConfirmModal(false);
      let response;

      if (itemToProcess.action === "remove") {
        response = await cartApi.removeItemFromCart(
          token,
          itemToProcess.productId
        );
      } else {
        response = await cartApi.removeFromCart(token, itemToProcess.productId);
      }

      if (response.data?.message && response.data?.cart) {
        setCartData(response.data.cart);
        // Tính lại phí ship
        if (defaultAddress) {
          calculateShipping(defaultAddress);
        }

        setSuccessMessage(
          itemToProcess.action === "remove"
            ? "Đã xóa sản phẩm khỏi giỏ hàng"
            : "Đã giảm số lượng sản phẩm"
        );
        setShowSuccessModal(true);
        setTimeout(() => setShowSuccessModal(false), 1500);
      }
    } catch (error) {
      console.error("Lỗi khi xử lý sản phẩm:", error);
      setSuccessMessage("Đã xảy ra lỗi. Vui lòng thử lại sau");
      setShowSuccessModal(true);
      setTimeout(() => setShowSuccessModal(false), 1500);
    }
  };

  // Tách phương thức hiển thị popup xác nhận và xử lý đặt hàng
  const confirmOrder = () => {
    // Kiểm tra giỏ hàng
    if (!cartData?.items?.length) {
      setErrorMessage("Giỏ hàng của bạn đang trống");
      setShowErrorModal(true);
      return;
    }

    // Kiểm tra địa chỉ giao hàng
    if (!defaultAddress) {
      setErrorMessage("Vui lòng thêm địa chỉ giao hàng");
      setShowErrorModal(true);
      return;
    }

    // Kiểm tra giới hạn giá trị đơn hàng
    const MAX_ORDER_VALUE = 5000000; // 5 triệu VND
    if (subtotal > MAX_ORDER_VALUE) {
      setErrorMessage(
        `Đơn hàng không được vượt quá ${MAX_ORDER_VALUE.toLocaleString()}đ`
      );
      setShowErrorModal(true);
      return;
    }

    // Hiển thị popup xác nhận đặt hàng
    setShowConfirmOrderModal(true);
  };

  // Giữ nguyên phương thức xử lý đặt hàng nhưng gọi sau khi xác nhận
  const handleCheckout = async () => {
    try {
      setIsPlacingOrder(true);
      setShowConfirmOrderModal(false); // Đóng popup xác nhận

      // Tạo danh sách items để gửi lên API
      const orderItems = cartData.items.map((item: any) => ({
        name: item.productId.name,
        quantity: item.quantity,
        price: item.priceAtTime,
      }));

      // Chuẩn bị dữ liệu đơn hàng
      const orderData = {
        shippingInfo: {
          fullName: defaultAddress.fullName,
          phone: defaultAddress.phone,
          address: defaultAddress.address,
          cityName: defaultAddress.cityName,
          districtName: defaultAddress.districtName,
          wardName: defaultAddress.wardName,
          city: defaultAddress.city,
          district: defaultAddress.district,
          ward: defaultAddress.ward,
        },
        insurance_value: cartData.totalPrice,
        shipping_fee_input: shippingInfo.shippingFee || 0,
        items: orderItems,
      };

      // Gọi API tạo đơn hàng
      const response = await orderApi.createOrder(token, orderData);

      // Hiển thị thông báo thành công
      setSuccessMessage("Đặt hàng thành công!");
      setShowSuccessModal(true);

      // Đợi 1.5 giây rồi chuyển hướng đến trang chi tiết đơn hàng
      setTimeout(() => {
        setShowSuccessModal(false);
        router.navigate(`/order/${response.data.order.orderCode}`);
      }, 1500);
    } catch (error: any) {
      console.error("Lỗi khi đặt hàng:", error);
      setErrorMessage(
        error.response?.data?.message ||
          "Đã xảy ra lỗi khi đặt hàng. Vui lòng thử lại sau."
      );
      setShowErrorModal(true);
    } finally {
      setIsPlacingOrder(false);
    }
  };

  const renderLocationSection = () => {
    if (loading) {
      return (
        <View style={styles.locationContainer}>
          <ActivityIndicator size="small" color="#666" />
        </View>
      );
    }

    if (!defaultAddress) {
      return (
        <TouchableOpacity
          style={styles.locationContainer}
          onPress={() => router.navigate("/addresses")}
        >
          <View style={styles.locationLeft}>
            <Ionicons name="location-outline" size={20} color="#333" />
            <Text style={styles.locationTitle}>Thêm địa chỉ giao hàng</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#999" />
        </TouchableOpacity>
      );
    }

    return (
      <TouchableOpacity
        style={styles.locationContainer}
        onPress={() => router.navigate("/edit-address")}
      >
        <View style={styles.locationLeft}>
          <Ionicons name="location-outline" size={20} color="#333" />
          <View style={styles.locationTextContainer}>
            <Text style={styles.locationTitle}>
              {defaultAddress.fullName}, {defaultAddress.phone}
            </Text>
            <Text style={styles.locationAddress}>
              {defaultAddress.address}, {defaultAddress.wardName},{" "}
              {defaultAddress.districtName}, {defaultAddress.cityName}
            </Text>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#999" />
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {renderLocationSection()}

        {/* Cart Items - Sửa đổi phần này */}
        {cartLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#666" />
          </View>
        ) : cartData?.items?.length > 0 ? (
          cartData.items.map((item: any) => (
            <View key={item.productId._id} style={styles.cartItem}>
              {/* Chỉ ảnh sản phẩm có thể click để chuyển hướng */}
              <TouchableOpacity
                onPress={() => router.push(`/product/${item.productId.slug}`)}
              >
                <Image
                  source={{
                    uri:
                      item.productId.images[0] ||
                      "/placeholder.svg?height=60&width=60",
                  }}
                  style={styles.itemImage}
                />
              </TouchableOpacity>

              <View style={styles.itemDetails}>
                <View style={styles.itemHeader}>
                  <Text style={styles.itemName} numberOfLines={2}>
                    {item.productId.name}
                  </Text>
                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={() =>
                      handleRemoveItem(item.productId._id, item.productId.name)
                    }
                  >
                    <Ionicons name="close" size={18} color="#999" />
                  </TouchableOpacity>
                </View>
                <View style={styles.itemFooter}>
                  <Text style={styles.itemPrice}>
                    {item.priceAtTime.toLocaleString()}đ
                  </Text>
                  <View style={styles.quantityControl}>
                    <TouchableOpacity
                      style={[
                        styles.quantityButton,
                        item.quantity === 1 && styles.quantityButtonDisabled,
                      ]}
                      onPress={() =>
                        handleDecreaseQuantity(
                          item.productId._id,
                          item.quantity,
                          item.productId.name
                        )
                      }
                    >
                      <Text style={styles.quantityButtonText}>−</Text>
                    </TouchableOpacity>
                    <Text style={styles.quantityText}>{item.quantity}</Text>
                    <TouchableOpacity
                      style={styles.quantityButton}
                      onPress={() => handleIncreaseQuantity(item.productId._id)}
                    >
                      <Text style={styles.quantityButtonText}>+</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          ))
        ) : (
          <View style={styles.emptyCart}>
            <MaterialIcons
              name="shopping-cart"
              size={80}
              color="#ddd"
              style={styles.emptyCartIcon}
            />
            <Text style={styles.emptyCartText}>
              Giỏ hàng của bạn đang trống
            </Text>
            <Text style={styles.emptyCartSubText}>
              Hãy thêm sản phẩm vào giỏ hàng để mua sắm
            </Text>
          </View>
        )}

        {/* Delivery Options */}
        <TouchableOpacity style={styles.optionContainer}>
          <View style={styles.optionLeft}>
            <MaterialIcons name="local-shipping" size={20} color="#333" />
            <Text style={styles.optionText}>Giao hàng Nhanh</Text>
          </View>
          <View style={styles.optionRight}>
            {shippingInfo.leadTime ? (
              <Text style={styles.deliveryDate}>
                Dự kiến:{" "}
                {new Date(
                  shippingInfo.leadTime.from_estimate_date
                ).toLocaleDateString()}{" "}
                -{" "}
                {new Date(
                  shippingInfo.leadTime.to_estimate_date
                ).toLocaleDateString()}
              </Text>
            ) : (
              <Text style={styles.deliveryDate}>Đang tính...</Text>
            )}
          </View>
        </TouchableOpacity>

        {/* Payment Method */}
        <TouchableOpacity style={styles.optionContainer}>
          <View style={styles.optionLeft}>
            <FontAwesome name="money" size={20} color="#333" />
            <Text style={styles.optionText}>Phương thức thanh toán</Text>
          </View>
          <View style={styles.optionRight}>
            <Text style={styles.paymentMethod}>Tiền mặt</Text>
          </View>
        </TouchableOpacity>

        {/* Shipping Discount Note */}
        <View style={styles.shippingDiscountNote}>
          <MaterialIcons name="local-offer" size={20} color="#ff3366" />
          <Text style={styles.shippingDiscountText}>
            Giảm phí vận chuyển từ 5-25k khi thanh toán
          </Text>
        </View>

        {/* Price Summary */}
        <View style={styles.summaryContainer}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Tiền hàng</Text>
            <Text style={styles.summaryValue}>
              {subtotal.toLocaleString()}đ
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Phí giao hàng</Text>
            <View style={styles.infoRow}>
              <Text style={styles.summaryValue}>
                {shippingFee.toLocaleString()}đ
              </Text>
              <Ionicons
                name="information-circle-outline"
                size={16}
                color="#999"
              />
            </View>
          </View>
          <View style={styles.summaryRow}></View>
        </View>
      </ScrollView>

      {/* Total and Checkout - Sửa lại nút Đặt hàng để hiển thị popup */}
      <View style={styles.checkoutContainer}>
        <TouchableOpacity style={styles.totalContainer}>
          <Text style={styles.totalText}>Tổng tiền</Text>
          <View style={styles.totalRow}>
            <Text style={styles.totalAmount}>{total.toLocaleString()}đ</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.checkoutButton,
            (!canCheckout || isPlacingOrder) && styles.checkoutButtonDisabled,
          ]}
          disabled={!canCheckout || isPlacingOrder}
          onPress={confirmOrder} // Thay đổi từ handleCheckout sang confirmOrder
        >
          {isPlacingOrder ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text
              style={[
                styles.checkoutButtonText,
                !canCheckout && styles.checkoutButtonTextDisabled,
              ]}
            >
              Đặt hàng
            </Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Thêm Modal thành công */}
      <Modal visible={showSuccessModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <FontAwesome name="check-circle" size={50} color="#4CAF50" />
            <Text style={styles.modalText}>{successMessage}</Text>
          </View>
        </View>
      </Modal>

      {/* Thêm Modal xác nhận */}
      <Modal visible={showConfirmModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.confirmModalContent}>
            <FontAwesome name="exclamation-circle" size={50} color="#FF6B6B" />
            <Text style={styles.modalTitle}>Xác nhận</Text>
            <Text style={styles.modalText}>
              {itemToProcess?.action === "remove"
                ? `Bạn có chắc muốn xóa "${itemToProcess?.productName}" khỏi giỏ hàng?`
                : `Bạn có chắc muốn xóa "${itemToProcess?.productName}" khỏi giỏ hàng? Sản phẩm chỉ còn 1.`}
            </Text>
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => setShowConfirmModal(false)}
              >
                <Text style={styles.cancelButtonText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.confirmButton]}
                onPress={processItemAction}
              >
                <Text style={styles.confirmButtonText}>Xác nhận</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Thêm Modal lỗi */}
      <Modal visible={showErrorModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.confirmModalContent}>
            <FontAwesome name="exclamation-circle" size={50} color="#FF6B6B" />
            <Text style={styles.modalTitle}>Cảnh báo</Text>
            <Text style={styles.modalText}>{errorMessage}</Text>
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, styles.confirmButton]}
                onPress={() => setShowErrorModal(false)}
              >
                <Text style={styles.confirmButtonText}>Đã hiểu</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Thêm Modal xác nhận đặt hàng */}
      <Modal visible={showConfirmOrderModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.confirmModalContent}>
            <FontAwesome name="shopping-cart" size={50} color="#4CAF50" />
            <Text style={styles.modalTitle}>Xác nhận đặt hàng</Text>
            <Text style={styles.modalText}>
              Bạn có chắc chắn muốn đặt đơn hàng này?
            </Text>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Tổng tiền hàng:</Text>
              <Text style={styles.detailValue}>
                {subtotal.toLocaleString()}đ
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Phí vận chuyển:</Text>
              <Text style={styles.detailValue}>
                {shippingFee.toLocaleString()}đ
              </Text>
            </View>
            <View style={[styles.detailRow, styles.totalRow]}>
              <Text style={styles.detailLabelBold}>Tổng thanh toán:</Text>
              <Text style={styles.detailValueBold}>
                {total.toLocaleString()}đ
              </Text>
            </View>
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => setShowConfirmOrderModal(false)}
              >
                <Text style={styles.cancelButtonText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.confirmButton]}
                onPress={handleCheckout}
                disabled={isPlacingOrder}
              >
                {isPlacingOrder ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.confirmButtonText}>Xác nhận</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
