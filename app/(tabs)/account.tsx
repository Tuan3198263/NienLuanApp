import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  Alert,
  SafeAreaView,
  StyleSheet,
} from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { ActivityIndicator } from "react-native-paper";
import {
  MaterialIcons,
  MaterialCommunityIcons,
  FontAwesome,
} from "@expo/vector-icons";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../../src/redux/store";
import { showToast } from "../../src/utils/toast";
import {
  logout,
  updateUserAvatar,
  updateUserData,
  setNeedRefresh,
  updateAvatar,
} from "../../src/redux/slices/authSlice";
import * as ImagePicker from "expo-image-picker";
import { authApi } from "../../src/api/authApi";
import { accountStyles } from "../../src/styles/accountStyles";

export default function AccountScreen() {
  const [isLoading, setIsLoading] = useState(true);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  // Sử dụng ref để kiểm soát việc fetch dữ liệu
  const isFetchingRef = useRef(false);
  const isComponentMountedRef = useRef(true);

  // Lấy thông tin đăng nhập từ Redux store
  const { token, user, lastUpdated, needRefresh } = useSelector(
    (state: RootState) => state.auth
  );
  const isLoggedIn = !!token;

  // Cleanup effect khi component unmount
  useEffect(() => {
    isComponentMountedRef.current = true;
    return () => {
      isComponentMountedRef.current = false;
    };
  }, []);

  // Làm mới dữ liệu người dùng theo điều kiện
  const refreshUserData = useCallback(async () => {
    if (
      !isLoggedIn ||
      !isComponentMountedRef.current ||
      isFetchingRef.current
    ) {
      setIsLoading(false);
      return;
    }

    // Nếu đã có user data và không cần refresh, không gọi API
    if (user && !needRefresh && lastUpdated) {
      const now = Date.now();
      const fiveMinutes = 5 * 60 * 1000; // 5 phút

      if (now - lastUpdated < fiveMinutes) {
        console.log("Không cần gọi API: Dữ liệu user đã được cập nhật gần đây");
        setIsLoading(false);
        return;
      }
    }

    try {
      isFetchingRef.current = true;
      // Gọi action updateUserData từ Redux
      const resultAction = await dispatch(updateUserData());
      console.log("Đã cập nhật user trong Account");
    } catch (error) {
      console.error("Lỗi khi lấy thông tin người dùng:", error);
    } finally {
      if (isComponentMountedRef.current) {
        setIsLoading(false);
        isFetchingRef.current = false;
      }
    }
  }, [isLoggedIn, user, token, dispatch, needRefresh, lastUpdated]);

  // Fetch dữ liệu khi token thay đổi
  useEffect(() => {
    if (token && !isFetchingRef.current) {
      refreshUserData();
    } else {
      setIsLoading(false);
    }
  }, [token]);

  // Làm mới dữ liệu có điều kiện khi màn hình được focus
  useFocusEffect(
    useCallback(() => {
      if (needRefresh && isLoggedIn && !isFetchingRef.current) {
        console.log(
          "Làm mới dữ liệu khi màn hình được focus vì có flag needRefresh"
        );
        refreshUserData();
      }

      // Không cần cleanup function vì useFocusEffect sẽ tự cleanup
    }, [needRefresh, isLoggedIn])
  );

  const handleLogout = () => {
    Alert.alert(
      "Xác nhận đăng xuất",
      "Bạn có chắc chắn muốn đăng xuất khỏi tài khoản?",
      [
        {
          text: "Hủy",
          style: "cancel",
        },
        {
          text: "Đăng xuất",
          onPress: async () => {
            // Đảm bảo không fetch dữ liệu khi logout
            isFetchingRef.current = true;
            await dispatch(logout());
            showToast.success("Đăng xuất thành công");
            router.replace("/");
          },
          style: "destructive",
        },
      ],
      { cancelable: true }
    );
  };

  const handleChangeAvatar = async () => {
    if (!isLoggedIn) {
      router.navigate("/login");
      return;
    }

    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== "granted") {
        Alert.alert(
          "Thông báo",
          "Cần cấp quyền truy cập thư viện ảnh để thay đổi ảnh đại diện"
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedAsset = result.assets[0];
        setUploadingAvatar(true);

        try {
          console.log("Uploading image:", selectedAsset.uri);
          // Tạo FormData để gửi ảnh
          const formData = new FormData();
          formData.append("avatar", {
            uri: selectedAsset.uri,
            type: "image/jpeg",
            name: "avatar.jpg",
          });

          // Sử dụng thunk updateAvatar thay vì gọi API trực tiếp
          await dispatch(updateAvatar(formData));
          showToast.success("Cập nhật ảnh đại diện thành công");
          // Đánh dấu thông tin đã được cập nhật
          dispatch(setNeedRefresh(false));
        } catch (error) {
          console.error("Lỗi khi cập nhật ảnh đại diện:", error);
          showToast.error("Không thể cập nhật ảnh đại diện");
        } finally {
          setUploadingAvatar(false);
        }
      }
    } catch (error) {
      console.error("Error in image picker:", error);
      showToast.error("Có lỗi xảy ra khi chọn ảnh");
    }
  };

  const handleMenuItem = (route: string) => {
    if (isLoggedIn) {
      router.navigate(route);
    } else {
      router.navigate("/login?redirect=" + route);
    }
  };

  // Thêm hàm xử lý cho việc điều hướng đến trang orders với trạng thái
  const handleOrderStatusPress = (status: string) => {
    if (isLoggedIn) {
      // Sử dụng router.push thay vì navigate để có thể truyền params
      router.push({
        pathname: "/orders",
        params: { initialTab: status },
      });
    } else {
      router.navigate("/login");
    }
  };

  if (isLoading) {
    return (
      <View style={accountStyles.loadingContainer}>
        <ActivityIndicator size="large" color="#ff6b81" />
      </View>
    );
  }

  const menuContainer = accountStyles.menuContainer;
  const secondaryMenuContainer = accountStyles.secondaryMenuContainer;

  return (
    <SafeAreaView style={accountStyles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={accountStyles.profileHeader}>
          <TouchableOpacity
            onPress={handleChangeAvatar}
            style={accountStyles.avatarTouchable}
          >
            <View
              style={
                isLoggedIn
                  ? accountStyles.avatarContainer
                  : accountStyles.avatarPlaceholderContainer
              }
            >
              {uploadingAvatar ? (
                <View
                  style={[accountStyles.avatar, accountStyles.avatarLoading]}
                >
                  <ActivityIndicator size="large" color="#fff" />
                </View>
              ) : isLoggedIn ? (
                <Image
                  source={{
                    uri:
                      user?.avatar || "https://picsum.photos/200/200?random=30",
                  }}
                  style={accountStyles.avatar}
                />
              ) : (
                <View style={accountStyles.avatarPlaceholder}>
                  <MaterialIcons
                    name="account-circle"
                    size={100}
                    color="#e0e0e0"
                  />
                </View>
              )}
            </View>
          </TouchableOpacity>

          {isLoggedIn ? (
            <>
              <Text style={accountStyles.username}>
                {user?.fullName || "Người dùng"}
              </Text>
              <Text style={accountStyles.memberStatus}>MEMBER</Text>
              <Text style={accountStyles.emailStatus}>
                Email: {user?.email}
              </Text>
            </>
          ) : (
            <TouchableOpacity
              style={accountStyles.loginPrompt}
              onPress={() => router.navigate("/login")}
            >
              <Text style={accountStyles.loginPromptText}>
                Đăng nhập / Đăng ký
              </Text>
              <MaterialIcons name="arrow-forward" size={16} color="#ff6b81" />
            </TouchableOpacity>
          )}
        </View>

        {/* Order History Section */}
        <View style={accountStyles.orderHistorySection}>
          <View style={accountStyles.sectionHeader}>
            <Text style={accountStyles.sectionTitle}>Đơn hàng của tôi</Text>
            <TouchableOpacity
              style={accountStyles.viewAllButton}
              onPress={() => handleMenuItem("/orders")}
            >
              <Text style={accountStyles.viewAllText}>Xem tất cả</Text>
              <Text style={accountStyles.arrowRight}>›</Text>
            </TouchableOpacity>
          </View>

          <View style={accountStyles.orderStatusContainer}>
            <TouchableOpacity
              style={accountStyles.orderStatusItem}
              onPress={() => handleOrderStatusPress("Đã xác nhận")}
            >
              <MaterialIcons name="card-giftcard" size={24} color="#666" />
              <Text style={accountStyles.orderStatusText}>Đã xác nhận</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={accountStyles.orderStatusItem}
              onPress={() => handleOrderStatusPress("Đang giao")}
            >
              <MaterialIcons name="local-shipping" size={24} color="#666" />
              <Text style={accountStyles.orderStatusText}>Đang giao hàng</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={accountStyles.orderStatusItem}
              onPress={() => handleOrderStatusPress("Đã nhận")}
            >
              <MaterialIcons name="inventory" size={24} color="#666" />
              <Text style={accountStyles.orderStatusText}>Đã nhận hàng</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={accountStyles.orderStatusItem}
              onPress={() => handleOrderStatusPress("Đã hủy")}
            >
              <MaterialIcons
                name="remove-shopping-cart"
                size={24}
                color="#666"
              />
              <Text style={accountStyles.orderStatusText}>Đã hủy</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Menu Items */}
        <View style={menuContainer}>
          <MenuItem
            icon={<MaterialIcons name="person" size={20} color="#666" />}
            title="Thông tin cá nhân"
            onPress={() => handleMenuItem("/profileDetail")}
          />

          <MenuItem
            icon={<MaterialIcons name="place" size={20} color="#666" />}
            title="Địa chỉ giao hàng"
            onPress={() => handleMenuItem("/addresses")}
          />

          <MenuItem
            icon={<MaterialIcons name="shopping-bag" size={20} color="#666" />}
            title="Đơn hàng của tôi"
            onPress={() => handleMenuItem("/orders")}
          />

          <MenuItem
            icon={<MaterialIcons name="favorite" size={20} color="#666" />}
            title="Sản phẩm yêu thích"
            onPress={() => handleMenuItem("/wishlist")}
          />

          {/* Thay thế menu item đánh giá cũ bằng 2 menu item mới */}
          <MenuItem
            icon={<MaterialIcons name="rate-review" size={20} color="#666" />}
            title="Sản phẩm chờ đánh giá"
            onPress={() => handleMenuItem("/pending-reviews")}
          />

          <MenuItem
            icon={<MaterialIcons name="star" size={20} color="#666" />}
            title="Sản phẩm đã đánh giá"
            onPress={() => handleMenuItem("/reviewed-products")}
          />

          <MenuItem
            icon={<MaterialIcons name="credit-card" size={20} color="#666" />}
            title="Phương thức thanh toán"
            onPress={() => handleMenuItem("/payment-methods")}
          />
        </View>

        {/* Các menu item phụ */}
        <View
          style={[
            accountStyles.menuContainer,
            accountStyles.secondaryMenuContainer,
          ]}
        >
          <MenuItem
            icon={<MaterialIcons name="help" size={20} color="#666" />}
            title="Trợ giúp & Hỗ trợ"
            onPress={() => router.navigate("/help")}
          />

          <MenuItem
            icon={<MaterialIcons name="description" size={20} color="#666" />}
            title="Điều khoản sử dụng"
            onPress={() => router.navigate("/terms")}
          />

          <MenuItem
            icon={<MaterialIcons name="privacy-tip" size={20} color="#666" />}
            title="Chính sách bảo mật"
            onPress={() => router.navigate("/privacy")}
          />

          <MenuItem
            icon={<MaterialIcons name="info" size={20} color="#666" />}
            title="Thông tin về Glown"
            onPress={() => router.navigate("/info")}
            subtitle="Chính sách bảo mật, chính sách bán hàng..."
          />
        </View>

        {/* Social Media Links */}
        <View style={accountStyles.socialLinks}></View>
        {/* App Information */}
        <View style={accountStyles.appInfoContainer}>
          <Text style={accountStyles.appVersion}>Phiên bản 1.0.0</Text>
          <Text style={accountStyles.copyright}>
            © 2025 Glown. All rights reserved.
          </Text>
        </View>

        {/* Logout Button - chỉ hiển thị khi đã đăng nhập */}
        {isLoggedIn && (
          <TouchableOpacity
            style={accountStyles.logoutButton}
            onPress={handleLogout}
          >
            <MaterialIcons name="logout" size={20} color="#333" />
            <Text style={accountStyles.logoutText}>Đăng xuất</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const MenuItem = ({ icon, title, subtitle, badge, badgeText, onPress }) => {
  return (
    <TouchableOpacity style={accountStyles.menuItem} onPress={onPress}>
      <View style={accountStyles.menuIconContainer}>{icon}</View>
      <View style={accountStyles.menuTextContainer}>
        <Text style={accountStyles.menuTitle}>{title}</Text>
        {subtitle && <Text style={accountStyles.menuSubtitle}>{subtitle}</Text>}
      </View>
      {badge && (
        <View style={accountStyles.badge}>
          <Text style={accountStyles.badgeText}>{badgeText || "1"}</Text>
        </View>
      )}
      <Text style={accountStyles.menuArrow}>›</Text>
    </TouchableOpacity>
  );
};

export default AccountScreen;
