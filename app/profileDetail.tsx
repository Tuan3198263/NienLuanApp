import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Alert,
  SafeAreaView,
  ScrollView,
  Modal,
} from "react-native";
import { MaterialIcons, Feather, FontAwesome } from "@expo/vector-icons";
import { useSelector, useDispatch } from "react-redux";
import { Stack, useRouter } from "expo-router";
import { RootState, AppDispatch } from "../src/redux/store";
import { TextInput, Button, ActivityIndicator } from "react-native-paper";
import { authApi } from "../src/api/authApi";
import { showToast } from "../src/utils/toast";
import { updateUserData, markNeedRefresh } from "../src/redux/slices/authSlice";
import { commonStyles } from "../src/styles/commonStyles";

// Interface cho trạng thái popup
interface EditModalState {
  visible: boolean;
  field: string;
  value: string;
  title: string;
}

const ProfileDetailScreen = () => {
  const { user, token, lastUpdated } = useSelector(
    (state: RootState) => state.auth
  );
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();

  // State cho các trường thông tin
  const [fullName, setFullName] = useState(user?.fullName || "");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(true);

  // State cho modal popup
  const [modal, setModal] = useState<EditModalState>({
    visible: false,
    field: "",
    value: "",
    title: "",
  });

  // State cho trạng thái loading khi cập nhật
  const [isUpdating, setIsUpdating] = useState(false);

  // Lấy thông tin người dùng khi cần thiết
  useEffect(() => {
    const fetchUserData = async () => {
      if (!token) {
        router.replace("/login");
        return;
      }

      try {
        setLoading(true);

        // Kiểm tra cache trước khi gọi API
        if (user && lastUpdated) {
          const now = Date.now();
          const fiveMinutes = 5 * 60 * 1000;

          if (now - lastUpdated < fiveMinutes) {
            console.log("Sử dụng dữ liệu từ cache");
            setFullName(user.fullName || "");
            setPhone(user.phone || "");
            setLoading(false);
            return;
          }
        }

        // Gọi API qua action Redux
        const resultAction = await dispatch(updateUserData());
        if (
          updateUserData.fulfilled.match(resultAction) &&
          resultAction.payload.user
        ) {
          const userData = resultAction.payload.user;
          setFullName(userData.fullName || "");
          setPhone(userData.phone || "");
        }
      } catch (error) {
        console.error("Lỗi khi lấy thông tin người dùng:", error);
        showToast.error("Không thể lấy thông tin người dùng");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [token, dispatch, router, user, lastUpdated]);

  // Xử lý hiển thị modal để chỉnh sửa thông tin
  const handleOpenEditModal = (
    field: string,
    currentValue: string,
    title: string
  ) => {
    setModal({
      visible: true,
      field,
      value: currentValue,
      title,
    });
  };

  // Đóng modal và reset giá trị
  const handleCloseModal = () => {
    setModal({ ...modal, visible: false });

    // Reset password field nếu đang chỉnh sửa mật khẩu
    if (modal.field === "password") {
      setPassword("");
      setShowPassword(false);
    }
  };

  // Kiểm tra tính hợp lệ của dữ liệu
  const validateData = (field: string, value: string): boolean => {
    // Họ và tên: tối đa 50 ký tự, không chứa số
    if (field === "fullName") {
      if (!value.trim()) {
        Alert.alert("Lỗi", "Họ tên không được để trống");
        return false;
      }
      if (value.length > 50) {
        Alert.alert("Lỗi", "Họ tên không được vượt quá 50 ký tự");
        return false;
      }
      if (/\d/.test(value)) {
        Alert.alert("Lỗi", "Họ tên không được chứa số");
        return false;
      }
      return true;
    }

    // Số điện thoại: phải là số điện thoại Việt Nam hợp lệ (10 số bắt đầu bằng 0)
    if (field === "phone") {
      const phoneRegex = /^(0[2-9]\d{8})$/;
      if (!phoneRegex.test(value)) {
        Alert.alert(
          "Lỗi",
          "Số điện thoại không hợp lệ. Vui lòng nhập số điện thoại Việt Nam hợp lệ."
        );
        return false;
      }
      return true;
    }

    // Mật khẩu: tối thiểu 6 ký tự
    if (field === "password") {
      if (value.length < 6) {
        Alert.alert("Lỗi", "Mật khẩu phải có ít nhất 6 ký tự");
        return false;
      }
      return true;
    }

    return true;
  };

  // Lưu thay đổi và cập nhật Redux
  const handleSaveChanges = async () => {
    if (!token) {
      Alert.alert("Lỗi", "Bạn cần đăng nhập để thực hiện thao tác này");
      return;
    }

    const { field, value } = modal;

    // Kiểm tra tính hợp lệ của dữ liệu
    if (!validateData(field, value)) {
      return;
    }

    // Chuẩn bị dữ liệu để gửi API
    let updateData = {};

    if (field === "fullName") {
      updateData = { fullName: value };
    } else if (field === "phone") {
      updateData = { phone: value };
    } else if (field === "password") {
      updateData = { password: value };
    }

    setIsUpdating(true);

    try {
      // Gọi API cập nhật thông tin
      const response = await authApi.updateUserInfo(token, updateData);

      if (response.data && response.data.user) {
        // Cập nhật trạng thái local
        const updatedUser = response.data.user;
        if (field === "fullName") {
          setFullName(updatedUser.fullName || "");
        } else if (field === "phone") {
          setPhone(updatedUser.phone || "");
        }

        // Đánh dấu cần làm mới dữ liệu trong Redux
        dispatch(markNeedRefresh());

        // Hiển thị thông báo thành công
        showToast.success("Cập nhật thông tin thành công");

        // Đóng modal
        handleCloseModal();
      }
    } catch (error) {
      console.error("Lỗi khi cập nhật thông tin:", error);
      showToast.error(
        error.response?.data?.message ||
          "Không thể cập nhật thông tin. Vui lòng thử lại sau."
      );
    } finally {
      setIsUpdating(false);
    }
  };

  const handleFeatureDevelopment = () => {
    Alert.alert("Thông báo", "Tính năng đang phát triển");
  };

  // Modal edit thông tin
  const renderEditModal = () => {
    return (
      <Modal
        visible={modal.visible}
        transparent={true}
        animationType="fade"
        onRequestClose={handleCloseModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{modal.title}</Text>

            {modal.field === "password" ? (
              <TextInput
                value={password}
                onChangeText={setPassword}
                style={styles.modalInput}
                mode="outlined"
                outlineColor="#ddd"
                activeOutlineColor="#ff6b81"
                secureTextEntry={!showPassword}
                placeholder="Nhập mật khẩu mới"
                right={
                  <TextInput.Icon
                    icon={showPassword ? "eye-off" : "eye"}
                    onPress={() => setShowPassword((prev) => !prev)}
                  />
                }
              />
            ) : (
              <TextInput
                value={modal.value}
                onChangeText={(text) => setModal({ ...modal, value: text })}
                style={styles.modalInput}
                mode="outlined"
                outlineColor="#ddd"
                activeOutlineColor="#ff6b81"
                keyboardType={modal.field === "phone" ? "phone-pad" : "default"}
              />
            )}

            <View style={styles.modalButtonContainer}>
              <Button
                mode="text"
                onPress={handleCloseModal}
                style={styles.modalButton}
                labelStyle={{ color: "#666" }}
              >
                Hủy
              </Button>
              <Button
                mode="contained"
                onPress={handleSaveChanges}
                style={[styles.modalButton, { backgroundColor: "#ff6b81" }]}
                loading={isUpdating}
                disabled={isUpdating}
              >
                {isUpdating ? "Đang lưu..." : "Lưu"}
              </Button>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen
          options={{
            title: "Thông tin cá nhân",
            headerTitleStyle: styles.headerTitle,
            headerTitleAlign: "center",
          }}
        />

        <View style={commonStyles.smallHeaderContainer}>
          <Text style={commonStyles.smallHeaderText}>Thông tin cá nhân</Text>
        </View>

        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#ff6b81" />
          <Text style={styles.loadingText}>Đang tải thông tin...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          title: "Thông tin cá nhân",
          headerTitleStyle: styles.headerTitle,
          headerTitleAlign: "center",
        }}
      />

      <View style={commonStyles.smallHeaderContainer}>
        <Text style={commonStyles.smallHeaderText}>Thông tin cá nhân</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.profileHeader}>
          <Image
            source={{
              uri: user?.avatar || "https://picsum.photos/200/200?random=30",
            }}
            style={styles.avatar}
          />
        </View>

        <View style={styles.infoContainer}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Email</Text>
            <View style={styles.infoValueContainer}>
              <Text style={styles.infoValue}>
                {user?.email || "example@mail.com"}
              </Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Họ và tên</Text>
            <View style={styles.infoValueContainer}>
              <Text style={styles.infoValue}>
                {fullName || "Chưa cập nhật"}
              </Text>
              <TouchableOpacity
                style={styles.editButton}
                onPress={() =>
                  handleOpenEditModal(
                    "fullName",
                    fullName,
                    "Cập nhật họ và tên"
                  )
                }
              >
                <Feather name="edit-2" size={18} color="#ff6b81" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Số điện thoại</Text>
            <View style={styles.infoValueContainer}>
              <Text style={styles.infoValue}>{phone || "Chưa cập nhật"}</Text>
              <TouchableOpacity
                style={styles.editButton}
                onPress={() =>
                  handleOpenEditModal("phone", phone, "Cập nhật số điện thoại")
                }
              >
                <Feather name="edit-2" size={18} color="#ff6b81" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Mật khẩu</Text>
            <View style={styles.infoValueContainer}>
              <Text style={styles.infoValue}>********</Text>
              <TouchableOpacity
                style={styles.editButton}
                onPress={() =>
                  handleOpenEditModal("password", "", "Cập nhật mật khẩu")
                }
              >
                <Feather name="edit-2" size={18} color="#ff6b81" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Kết nối tài khoản</Text>
        </View>

        <View style={styles.connectionContainer}>
          <TouchableOpacity
            style={styles.connectionRow}
            onPress={handleFeatureDevelopment}
          >
            <FontAwesome name="facebook" size={24} color="#3b5998" />
            <Text style={styles.connectionText}>Facebook</Text>
            <Text style={styles.connectionStatus}>Kết nối</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.connectionRow}
            onPress={handleFeatureDevelopment}
          >
            <FontAwesome name="google" size={24} color="#db4437" />
            <Text style={styles.connectionText}>Google</Text>
            <Text style={styles.connectionStatus}>Kết nối</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.connectionRow}
            onPress={handleFeatureDevelopment}
          >
            <FontAwesome name="apple" size={24} color="#000" />
            <Text style={styles.connectionText}>Apple</Text>
            <Text style={styles.connectionStatus}>Kết nối</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {renderEditModal()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f8f8",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    color: "#666",
    fontSize: 16,
  },
  profileHeader: {
    alignItems: "center",
    paddingVertical: 25,
    backgroundColor: "#fff",
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: "#ff6b81",
    backgroundColor: "#f3f3f3",
  },
  infoContainer: {
    backgroundColor: "#fff",
    marginTop: 10,
    paddingHorizontal: 16,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  infoLabel: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
  },
  infoValueContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  infoValue: {
    fontSize: 16,
    color: "#666",
    marginRight: 10,
  },
  editButton: {
    padding: 5,
  },
  sectionHeader: {
    backgroundColor: "#f8f8f8",
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#666",
  },
  connectionContainer: {
    backgroundColor: "#fff",
    paddingHorizontal: 16,
  },
  connectionRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  connectionText: {
    fontSize: 16,
    color: "#333",
    marginLeft: 15,
    flex: 1,
  },
  connectionStatus: {
    fontSize: 14,
    color: "#999",
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "80%",
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#333",
    textAlign: "center",
  },
  modalInput: {
    backgroundColor: "white",
    marginBottom: 15,
  },
  modalButtonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  modalButton: {
    flex: 1,
    margin: 5,
  },
});

export default ProfileDetailScreen;
