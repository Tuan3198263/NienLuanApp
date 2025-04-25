import React, { useState, useEffect } from "react";
import {
  View,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Modal,
  Dimensions,
} from "react-native";
import {
  TextInput,
  Button,
  Text,
  ActivityIndicator,
  HelperText,
  Divider,
} from "react-native-paper";
import { Stack, useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { useSelector } from "react-redux";
import { RootState } from "../src/redux/store";
import { shippingAddressApi } from "../src/api/shippingAddressApi";
import { locationApi } from "../src/api/locationApi";
import { showToast } from "../src/utils/toast";
import { commonStyles } from "../src/styles/commonStyles";
import { editAddressStyles } from "../src/styles/editAddressStyles";

// Interface cho địa chỉ
interface Address {
  _id?: string;
  fullName: string;
  phone: string;
  address: string;
  city: string;
  cityName: string;
  district: string;
  districtName: string;
  ward: string;
  wardName: string;
  isDefault?: boolean;
}

// Interface cho dữ liệu vị trí từ API
interface Province {
  ProvinceID: number;
  ProvinceName: string;
}

interface District {
  DistrictID: number;
  DistrictName: string;
}

interface Ward {
  WardCode: string;
  WardName: string;
}

const EditAddressScreen = () => {
  const { token } = useSelector((state: RootState) => state.auth);
  const router = useRouter();

  // Thông tin loading, lỗi
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [existingAddress, setExistingAddress] = useState<Address | null>(null);

  // Form state
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [cityName, setCityName] = useState("");
  const [district, setDistrict] = useState("");
  const [districtName, setDistrictName] = useState("");
  const [ward, setWard] = useState("");
  const [wardName, setWardName] = useState("");
  const [isDefault, setIsDefault] = useState(true);

  // Danh sách vị trí
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [loadingLocations, setLoadingLocations] = useState(false);

  // UI state with modal approach for dropdowns
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [modalVisible, setModalVisible] = useState<{
    city: boolean;
    district: boolean;
    ward: boolean;
  }>({
    city: false,
    district: false,
    ward: false,
  });

  // Thêm state cho search
  const [searchTerms, setSearchTerms] = useState({
    city: "",
    district: "",
    ward: "",
  });

  // Kiểm tra token và lấy thông tin địa chỉ
  useEffect(() => {
    if (!token) {
      router.replace("/login?redirect=/addresses");
      return;
    }

    // Lấy danh sách tỉnh/thành phố
    fetchProvinces();

    // Lấy thông tin địa chỉ nếu có
    fetchAddressData();
  }, [token, router]);

  // Lấy danh sách tỉnh/thành phố
  const fetchProvinces = async () => {
    setLoadingLocations(true);
    try {
      const provincesData = await locationApi.getProvinces();
      setProvinces(provincesData);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách tỉnh/thành phố:", error);
      showToast.error("Không thể lấy danh sách tỉnh/thành phố");
    } finally {
      setLoadingLocations(false);
    }
  };

  // Lấy danh sách quận/huyện theo tỉnh/thành phố
  const fetchDistricts = async (provinceId: number) => {
    setLoadingLocations(true);
    try {
      const districtsData = await locationApi.getDistricts(provinceId);
      setDistricts(districtsData);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách quận/huyện:", error);
      showToast.error("Không thể lấy danh sách quận/huyện");
    } finally {
      setLoadingLocations(false);
    }
  };

  // Lấy danh sách phường/xã theo quận/huyện
  const fetchWards = async (districtId: number) => {
    setLoadingLocations(true);
    try {
      const wardsData = await locationApi.getWards(districtId);
      setWards(wardsData);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách phường/xã:", error);
      showToast.error("Không thể lấy danh sách phường/xã");
    } finally {
      setLoadingLocations(false);
    }
  };

  // Hàm lấy thông tin địa chỉ
  const fetchAddressData = async () => {
    setIsLoading(true);
    try {
      const response = await shippingAddressApi.getShippingAddresses(token);
      console.log("Dữ liệu địa chỉ:", response.data);

      if (response.data.success && response.data.data) {
        // Địa chỉ đã tồn tại
        if (response.data.data._id) {
          const addressData = response.data.data;
          setExistingAddress(addressData);

          // Cập nhật form với dữ liệu hiện có
          setFullName(addressData.fullName || "");
          setPhone(addressData.phone || "");
          setAddress(addressData.address || "");
          setCity(addressData.city || "");
          setCityName(addressData.cityName || "");
          setDistrict(addressData.district || "");
          setDistrictName(addressData.districtName || "");
          setWard(addressData.ward || "");
          setWardName(addressData.wardName || "");
          setIsDefault(!!addressData.isDefault);

          // Nếu có city, lấy danh sách district
          if (addressData.city) {
            fetchDistricts(parseInt(addressData.city));
          }

          // Nếu có district, lấy danh sách ward
          if (addressData.district) {
            fetchWards(parseInt(addressData.district));
          }
        } else if (
          Array.isArray(response.data.data.addresses) &&
          response.data.data.addresses.length > 0
        ) {
          // Nếu API trả về mảng addresses, lấy phần tử đầu tiên
          const addressData = response.data.data.addresses[0];
          setExistingAddress(addressData);

          // Cập nhật form với dữ liệu hiện có
          setFullName(addressData.fullName || "");
          setPhone(addressData.phone || "");
          setAddress(addressData.address || "");
          setCity(addressData.city || "");
          setCityName(addressData.cityName || "");
          setDistrict(addressData.district || "");
          setDistrictName(addressData.districtName || "");
          setWard(addressData.ward || "");
          setWardName(addressData.wardName || "");
          setIsDefault(!!addressData.isDefault);

          // Nếu có city, lấy danh sách district
          if (addressData.city) {
            fetchDistricts(parseInt(addressData.city));
          }

          // Nếu có district, lấy danh sách ward
          if (addressData.district) {
            fetchWards(parseInt(addressData.district));
          }
        }
      } else if (response.data.message === "Chưa có địa chỉ được lưu!") {
        // Không có địa chỉ, để form trống
        console.log("Không có địa chỉ được lưu, để form trống");
      }
    } catch (error) {
      console.error("Lỗi khi lấy thông tin địa chỉ:", error);
      showToast.error("Không thể lấy thông tin địa chỉ");
    } finally {
      setIsLoading(false);
    }
  };

  // Xác thực form
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Validate fullName: không quá 50 ký tự và không chứa số
    if (!fullName.trim()) {
      newErrors.fullName = "Vui lòng nhập họ và tên";
    } else if (fullName.length > 50) {
      newErrors.fullName = "Họ và tên không được vượt quá 50 ký tự";
    } else if (/\d/.test(fullName)) {
      newErrors.fullName = "Họ và tên không được chứa số";
    }

    // Validate address: không quá 100 ký tự
    if (!address.trim()) {
      newErrors.address = "Vui lòng nhập địa chỉ chi tiết";
    } else if (address.length > 100) {
      newErrors.address = "Địa chỉ không được vượt quá 100 ký tự";
    }

    if (!phone.trim()) {
      newErrors.phone = "Vui lòng nhập số điện thoại";
    } else if (!/^(0[2-9]\d{8})$/.test(phone)) {
      newErrors.phone = "Số điện thoại không hợp lệ";
    }

    if (!city) {
      newErrors.city = "Vui lòng chọn tỉnh/thành phố";
    }

    if (!district) {
      newErrors.district = "Vui lòng chọn quận/huyện";
    }

    if (!ward) {
      newErrors.ward = "Vui lòng chọn phường/xã";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Xử lý lưu địa chỉ
  const handleSaveAddress = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const addressData = {
        fullName,
        phone,
        address,
        city,
        cityName,
        district,
        districtName,
        ward,
        wardName,
        isDefault: true, // Always set as default since it's the only address
      };

      // Nếu đã có địa chỉ, thêm _id vào request
      if (existingAddress?._id) {
        addressData._id = existingAddress._id;
      }

      // Gọi API cập nhật/thêm mới địa chỉ
      const response = await shippingAddressApi.updateShippingAddress(
        token,
        addressData
      );

      if (response.data && response.data.success) {
        showToast.success(
          existingAddress
            ? "Cập nhật địa chỉ thành công"
            : "Thêm địa chỉ thành công"
        );
        router.back();
      }
    } catch (error) {
      console.error("Lỗi khi lưu địa chỉ:", error);
      showToast.error("Không thể lưu địa chỉ. Vui lòng thử lại sau.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Xử lý chọn tỉnh/thành phố
  const handleSelectCity = (cityId: string, name: string) => {
    setCity(cityId);
    setCityName(name);
    setDistrict("");
    setDistrictName("");
    setWard("");
    setWardName("");
    toggleModal("city");

    // Lấy danh sách quận/huyện
    fetchDistricts(parseInt(cityId));
  };

  // Xử lý chọn quận/huyện
  const handleSelectDistrict = (districtId: string, name: string) => {
    setDistrict(districtId);
    setDistrictName(name);
    setWard("");
    setWardName("");
    toggleModal("district");

    // Lấy danh sách phường/xã
    fetchWards(parseInt(districtId));
  };

  // Xử lý chọn phường/xã
  const handleSelectWard = (wardId: string, name: string) => {
    setWard(wardId);
    setWardName(name);
    toggleModal("ward");
  };

  // Toggle modal visibility
  const toggleModal = (field: "city" | "district" | "ward") => {
    setModalVisible({
      ...modalVisible,
      [field]: !modalVisible[field],
    });
  };

  // Thêm hàm lọc kết quả search
  const getFilteredLocations = (
    data: any[],
    searchTerm: string,
    nameField: string
  ) => {
    if (!searchTerm) return data;
    return data.filter((item) =>
      item[nameField].toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  // Render location selection modal
  const renderLocationModal = (
    type: "city" | "district" | "ward",
    title: string,
    data: any[],
    keyField: string,
    nameField: string,
    onSelect: (id: string, name: string) => void,
    visible: boolean,
    disabled: boolean = false
  ) => {
    const filteredData = getFilteredLocations(
      data,
      searchTerms[type],
      nameField
    );

    return (
      <Modal
        visible={visible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => toggleModal(type)}
      >
        <View style={editAddressStyles.modalOverlay}>
          <View style={editAddressStyles.modalContainer}>
            {/* Header */}
            <View style={editAddressStyles.modalHeader}>
              <TouchableOpacity
                onPress={() => toggleModal(type)}
                style={editAddressStyles.closeButton}
              >
                <MaterialIcons name="close" size={24} color="#333" />
              </TouchableOpacity>
              <Text style={editAddressStyles.modalTitle}>{title}</Text>
              <View style={editAddressStyles.headerRightPlaceholder} />
            </View>

            <Divider />

            {/* Search Box */}
            <View style={editAddressStyles.searchContainer}>
              <TextInput
                placeholder={`Tìm ${title.toLowerCase()}`}
                value={searchTerms[type]}
                onChangeText={(text) =>
                  setSearchTerms((prev) => ({ ...prev, [type]: text }))
                }
                style={editAddressStyles.searchInput}
                mode="outlined"
                left={<TextInput.Icon icon="magnify" />}
                outlineColor="#ddd"
                activeOutlineColor="#ff6b81"
                dense
              />
            </View>

            <Divider />

            {/* Content */}
            <View style={editAddressStyles.modalContent}>
              {loadingLocations ? (
                <View style={editAddressStyles.modalLoadingContainer}>
                  <ActivityIndicator size="large" color="#ff6b81" />
                  <Text style={editAddressStyles.loadingText}>Đang tải...</Text>
                </View>
              ) : (
                <ScrollView
                  style={editAddressStyles.modalScrollView}
                  showsVerticalScrollIndicator={false}
                >
                  {filteredData.length > 0 ? (
                    filteredData.map((item) => (
                      <TouchableOpacity
                        key={item[keyField]}
                        style={editAddressStyles.modalItem}
                        onPress={() => {
                          onSelect(item[keyField].toString(), item[nameField]);
                          setSearchTerms((prev) => ({ ...prev, [type]: "" }));
                        }}
                      >
                        <Text style={editAddressStyles.modalItemText}>
                          {item[nameField]}
                        </Text>
                        <MaterialIcons
                          name="chevron-right"
                          size={20}
                          color="#999"
                        />
                      </TouchableOpacity>
                    ))
                  ) : (
                    <View style={editAddressStyles.noDataContainer}>
                      <MaterialIcons name="search-off" size={48} color="#ccc" />
                      <Text style={editAddressStyles.noDataText}>
                        {disabled
                          ? `Vui lòng chọn ${
                              type === "district"
                                ? "tỉnh/thành phố"
                                : "quận/huyện"
                            } trước`
                          : "Không tìm thấy kết quả"}
                      </Text>
                    </View>
                  )}
                  <View style={editAddressStyles.modalScrollPadding} />
                </ScrollView>
              )}
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={editAddressStyles.container}>
        <Stack.Screen
          options={{
            title: existingAddress ? "Chỉnh sửa địa chỉ" : "Thêm địa chỉ",
            headerTitleStyle: {
              fontSize: 16,
              color: "#333",
              fontWeight: "600",
            },
            headerTitleAlign: "center",
            headerLeft: () => (
              <TouchableOpacity onPress={() => router.back()}>
                <MaterialIcons name="arrow-back" size={22} color="#333" />
              </TouchableOpacity>
            ),
            headerStyle: {
              backgroundColor: "#fff",
              borderBottomWidth: 1,
              borderBottomColor: "#f0f0f0",
              height: 50,
            },
            headerShadowVisible: false,
          }}
        />

        <View style={commonStyles.smallHeaderContainer}>
          <Text style={commonStyles.smallHeaderText}>
            {existingAddress ? "Chỉnh sửa địa chỉ" : "Thêm địa chỉ mới"}
          </Text>
        </View>

        <View style={editAddressStyles.loadingContainer}>
          <ActivityIndicator size="large" color="#ff6b81" />
          <Text style={editAddressStyles.loadingText}>
            Đang tải thông tin...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={editAddressStyles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={commonStyles.smallHeaderContainer}>
        <Text style={commonStyles.smallHeaderText}>
          {existingAddress ? "Chỉnh sửa địa chỉ" : "Thêm địa chỉ mới"}
        </Text>
      </View>

      <ScrollView
        style={editAddressStyles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <View style={editAddressStyles.formContainer}>
          {existingAddress ? (
            <View style={editAddressStyles.infoTextContainer}>
              <MaterialIcons name="edit-location" size={24} color="#ff6b81" />
              <Text style={editAddressStyles.infoText}>
                Chỉnh sửa địa chỉ giao hàng của bạn
              </Text>
            </View>
          ) : (
            <View style={editAddressStyles.infoTextContainer}>
              <MaterialIcons name="add-location" size={24} color="#ff6b81" />
              <Text style={editAddressStyles.infoText}>
                Thêm địa chỉ giao hàng để tiện lợi khi thanh toán
              </Text>
            </View>
          )}

          <View style={editAddressStyles.formCard}>
            <Text style={editAddressStyles.sectionTitle}>
              <MaterialIcons name="person" size={18} color="#333" /> Thông tin
              người nhận
            </Text>

            {/* Họ và tên */}
            <TextInput
              label="Họ và tên"
              value={fullName}
              onChangeText={setFullName}
              mode="outlined"
              style={editAddressStyles.input}
              error={!!errors.fullName}
              outlineColor="#ddd"
              activeOutlineColor="#ff6b81"
              left={<TextInput.Icon icon="account" color="#999" />}
            />
            {errors.fullName && (
              <HelperText type="error">{errors.fullName}</HelperText>
            )}

            {/* Số điện thoại */}
            <TextInput
              label="Số điện thoại"
              value={phone}
              onChangeText={setPhone}
              mode="outlined"
              style={editAddressStyles.input}
              keyboardType="phone-pad"
              error={!!errors.phone}
              outlineColor="#ddd"
              activeOutlineColor="#ff6b81"
              left={<TextInput.Icon icon="phone" color="#999" />}
            />
            {errors.phone && (
              <HelperText type="error">{errors.phone}</HelperText>
            )}
          </View>

          <View style={editAddressStyles.formCard}>
            <Text style={editAddressStyles.sectionTitle}>
              <MaterialIcons name="location-on" size={18} color="#333" /> Địa
              chỉ
            </Text>

            {/* Địa chỉ chi tiết */}
            <TextInput
              label="Địa chỉ chi tiết (số nhà, tên đường...)"
              value={address}
              onChangeText={setAddress}
              mode="outlined"
              style={editAddressStyles.input}
              multiline
              numberOfLines={2}
              error={!!errors.address}
              outlineColor="#ddd"
              activeOutlineColor="#ff6b81"
              left={<TextInput.Icon icon="home" color="#999" />}
            />
            {errors.address && (
              <HelperText type="error">{errors.address}</HelperText>
            )}

            {/* Tỉnh/Thành phố - Selector Field */}
            <TouchableOpacity
              onPress={() => !loadingLocations && toggleModal("city")}
              style={[
                editAddressStyles.selectorField,
                !!errors.city && editAddressStyles.errorBorder,
              ]}
              disabled={loadingLocations}
            >
              <View style={editAddressStyles.selectorIconContainer}>
                <MaterialIcons name="location-city" size={20} color="#999" />
              </View>
              <View style={editAddressStyles.selectorTextContainer}>
                <Text style={editAddressStyles.selectorLabel}>
                  Tỉnh/Thành phố
                </Text>
                <Text
                  style={
                    !city
                      ? editAddressStyles.placeholderText
                      : editAddressStyles.selectedText
                  }
                >
                  {loadingLocations
                    ? "Đang tải..."
                    : cityName || "Chọn Tỉnh/Thành phố"}
                </Text>
              </View>
              <MaterialIcons name="arrow-drop-down" size={24} color="#666" />
            </TouchableOpacity>
            {errors.city && <HelperText type="error">{errors.city}</HelperText>}

            {/* Quận/Huyện - Selector Field */}
            <TouchableOpacity
              onPress={() =>
                city && !loadingLocations && toggleModal("district")
              }
              style={[
                editAddressStyles.selectorField,
                !city && editAddressStyles.disabledSelector,
                !!errors.district && editAddressStyles.errorBorder,
              ]}
              disabled={!city || loadingLocations}
            >
              <View style={editAddressStyles.selectorIconContainer}>
                <MaterialIcons
                  name="business"
                  size={20}
                  color={!city ? "#ccc" : "#999"}
                />
              </View>
              <View style={editAddressStyles.selectorTextContainer}>
                <Text
                  style={[
                    editAddressStyles.selectorLabel,
                    !city && editAddressStyles.disabledText,
                  ]}
                >
                  Quận/Huyện
                </Text>
                <Text
                  style={
                    !district
                      ? city
                        ? editAddressStyles.placeholderText
                        : editAddressStyles.disabledText
                      : editAddressStyles.selectedText
                  }
                >
                  {loadingLocations
                    ? "Đang tải..."
                    : districtName || "Chọn Quận/Huyện"}
                </Text>
              </View>
              <MaterialIcons
                name="arrow-drop-down"
                size={24}
                color={!city ? "#ccc" : "#666"}
              />
            </TouchableOpacity>
            {errors.district && (
              <HelperText type="error">{errors.district}</HelperText>
            )}

            {/* Phường/Xã - Selector Field */}
            <TouchableOpacity
              onPress={() =>
                district && !loadingLocations && toggleModal("ward")
              }
              style={[
                editAddressStyles.selectorField,
                !district && editAddressStyles.disabledSelector,
                !!errors.ward && editAddressStyles.errorBorder,
              ]}
              disabled={!district || loadingLocations}
            >
              <View style={editAddressStyles.selectorIconContainer}>
                <MaterialIcons
                  name="apartment"
                  size={20}
                  color={!district ? "#ccc" : "#999"}
                />
              </View>
              <View style={editAddressStyles.selectorTextContainer}>
                <Text
                  style={[
                    editAddressStyles.selectorLabel,
                    !district && editAddressStyles.disabledText,
                  ]}
                >
                  Phường/Xã
                </Text>
                <Text
                  style={
                    !ward
                      ? district
                        ? editAddressStyles.placeholderText
                        : editAddressStyles.disabledText
                      : editAddressStyles.selectedText
                  }
                >
                  {loadingLocations
                    ? "Đang tải..."
                    : wardName || "Chọn Phường/Xã"}
                </Text>
              </View>
              <MaterialIcons
                name="arrow-drop-down"
                size={24}
                color={!district ? "#ccc" : "#666"}
              />
            </TouchableOpacity>
            {errors.ward && <HelperText type="error">{errors.ward}</HelperText>}
          </View>

          <Button
            mode="contained"
            onPress={handleSaveAddress}
            style={editAddressStyles.saveButton}
            labelStyle={editAddressStyles.saveButtonLabel}
            loading={isSubmitting}
            disabled={isSubmitting}
            icon="content-save"
          >
            {isSubmitting
              ? "Đang lưu..."
              : existingAddress
              ? "Cập nhật địa chỉ"
              : "Lưu địa chỉ"}
          </Button>
        </View>
      </ScrollView>

      {/* Modals for location selection */}
      {renderLocationModal(
        "city",
        "Chọn Tỉnh/Thành phố",
        provinces,
        "ProvinceID",
        "ProvinceName",
        handleSelectCity,
        modalVisible.city
      )}

      {renderLocationModal(
        "district",
        "Chọn Quận/Huyện",
        districts,
        "DistrictID",
        "DistrictName",
        handleSelectDistrict,
        modalVisible.district,
        !city
      )}

      {renderLocationModal(
        "ward",
        "Chọn Phường/Xã",
        wards,
        "WardCode",
        "WardName",
        handleSelectWard,
        modalVisible.ward,
        !district
      )}
    </SafeAreaView>
  );
};

export default EditAddressScreen;
