import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { Stack, useRouter, useFocusEffect } from "expo-router";
import { useSelector } from "react-redux";
import { RootState } from "../src/redux/store";
import { shippingAddressApi } from "../src/api/shippingAddressApi";
import { addressStyles } from "../src/styles/addressStyles";
import { commonStyles } from "../src/styles/commonStyles";

// Interface cho địa chỉ
interface Address {
  _id: string;
  fullName: string;
  phone: string;
  address: string;
  city: string;
  cityName: string;
  district: string;
  districtName: string;
  ward: string;
  wardName: string;
  isDefault: boolean;
}

const AddressScreen = () => {
  const [address, setAddress] = useState<Address | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { token } = useSelector((state: RootState) => state.auth);
  const router = useRouter();

  // Lấy địa chỉ từ API - đơn giản hóa function để tránh vòng lặp vô hạn
  const fetchAddress = async () => {
    if (!token) {
      router.navigate("/login?redirect=/addresses");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await shippingAddressApi.getShippingAddresses(token);
      console.log("Dữ liệu địa chỉ:", response.data);

      // Kiểm tra response và set địa chỉ
      if (response.data.success) {
        // Response luôn trả về một địa chỉ trong data.data
        setAddress(response.data.data);
      } else {
        setError(response.data.message || "Không thể lấy địa chỉ");
      }
    } catch (err: any) {
      console.error("Lỗi khi lấy địa chỉ:", err);
      setError(err.response?.data?.message || "Đã xảy ra lỗi khi lấy địa chỉ");
    } finally {
      setIsLoading(false);
    }
  };

  // Remove all useEffect hooks and use only useFocusEffect
  useFocusEffect(
    useCallback(() => {
      if (token) {
        console.log("Screen focused, fetching address...");
        fetchAddress();
      } else {
        router.navigate("/login?redirect=/addresses");
      }
    }, [token])
  );

  // Định dạng địa chỉ đầy đủ
  const formatAddress = (addr: Address) => {
    return `${addr.address}, ${addr.wardName}, ${addr.districtName}, ${addr.cityName}`;
  };

  // Xử lý chỉnh sửa địa chỉ
  const handleEditAddress = () => {
    if (address) {
      router.navigate("/edit-address");
    }
  };

  // Xử lý thêm địa chỉ mới
  const handleAddNewAddress = () => {
    router.navigate("/edit-address");
  };

  return (
    <SafeAreaView style={addressStyles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={commonStyles.smallHeaderContainer}>
        <Text style={commonStyles.smallHeaderText}>Địa chỉ giao hàng</Text>
      </View>

      {isLoading ? (
        <View style={addressStyles.loadingContainer}>
          <ActivityIndicator size="large" color="#ff6b81" />
          <Text style={addressStyles.loadingText}>Đang tải...</Text>
        </View>
      ) : error ? (
        <View style={addressStyles.errorContainer}>
          <Text style={addressStyles.errorText}>{error}</Text>
          <TouchableOpacity
            style={addressStyles.retryButton}
            onPress={() => fetchAddress(true)}
          >
            <Text style={addressStyles.retryText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          {!address ? (
            // Hiển thị khi chưa có địa chỉ
            <View style={addressStyles.emptyContainer}>
              <MaterialIcons name="location-off" size={60} color="#ccc" />
              <Text style={addressStyles.emptyText}>
                Bạn chưa có địa chỉ nào
              </Text>
              <Text style={addressStyles.emptySubText}>
                Thêm địa chỉ để tiện lợi khi thanh toán
              </Text>

              <TouchableOpacity
                style={addressStyles.addButton}
                onPress={handleAddNewAddress}
              >
                <MaterialIcons name="add" size={24} color="#fff" />
                <Text style={addressStyles.addButtonText}>
                  Thêm địa chỉ mới
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            // Hiển thị khi có địa chỉ
            <View style={addressStyles.addressContainer}>
              <View style={addressStyles.addressCard}>
                <View style={addressStyles.addressHeader}>
                  <View style={addressStyles.recipientInfo}>
                    <Text style={addressStyles.recipientName}>
                      {address.fullName}
                    </Text>
                    <View style={addressStyles.addressBadge}>
                      <Text style={addressStyles.addressBadgeText}>
                        Mặc định
                      </Text>
                    </View>
                  </View>
                </View>

                <Text style={addressStyles.phone}>{address.phone}</Text>
                <Text style={addressStyles.address}>
                  {formatAddress(address)}
                </Text>
              </View>

              <View style={addressStyles.noteContainer}>
                <MaterialIcons name="info" size={16} color="#666" />
                <Text style={addressStyles.noteText}>
                  Địa chỉ này sẽ được sử dụng mặc định cho tất cả đơn hàng của
                  bạn
                </Text>
              </View>
            </View>
          )}

          <View style={addressStyles.spacer} />
        </ScrollView>
      )}

      {/* Hiển thị nút thêm địa chỉ cố định ở dưới cùng khi chưa có địa chỉ */}
      {!isLoading && !error && address && (
        <TouchableOpacity
          style={addressStyles.editFloatingButton}
          onPress={handleEditAddress}
        >
          <MaterialIcons name="edit" size={24} color="#fff" />
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
};

export default AddressScreen;
