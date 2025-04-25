import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  TouchableWithoutFeedback,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { locationApi } from "../api/locationApi";

interface AddressSelectionModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (address: any) => void;
}

export const AddressSelectionModal: React.FC<AddressSelectionModalProps> = ({
  visible,
  onClose,
  onSelect,
}) => {
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [selectedProvince, setSelectedProvince] = useState(null);
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [selectedWard, setSelectedWard] = useState(null);
  const [step, setStep] = useState(1);

  // Reset function
  const resetModal = () => {
    setStep(1);
    setSelectedProvince(null);
    setSelectedDistrict(null);
    setSelectedWard(null);
    setDistricts([]);
    setWards([]);
  };

  // Reset when modal opens
  useEffect(() => {
    if (visible) {
      resetModal();
      loadProvinces();
    }
  }, [visible]);

  const loadProvinces = async () => {
    try {
      const data = await locationApi.getProvinces();
      setProvinces(data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleProvinceSelect = async (province) => {
    setSelectedProvince(province);
    try {
      const data = await locationApi.getDistricts(province.ProvinceID);
      setDistricts(data);
      setStep(2);
    } catch (error) {
      console.error(error);
    }
  };

  const handleDistrictSelect = async (district) => {
    setSelectedDistrict(district);
    try {
      const data = await locationApi.getWards(district.DistrictID);
      setWards(data);
      setStep(3);
    } catch (error) {
      console.error(error);
    }
  };

  const handleWardSelect = (ward) => {
    setSelectedWard(ward);
    onSelect({
      provinceId: selectedProvince.ProvinceID,
      districtId: selectedDistrict.DistrictID,
      wardCode: ward.WardCode,
      provinceName: selectedProvince.ProvinceName,
      districtName: selectedDistrict.DistrictName,
      wardName: ward.WardName,
    });
    // Reset after selection
    resetModal();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose} // Thêm xử lý back button
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.modalContainer}>
              <View style={styles.header}>
                <Text style={styles.title}>
                  {step === 1
                    ? "Chọn tỉnh/thành phố"
                    : step === 2
                    ? "Chọn quận/huyện"
                    : "Chọn phường/xã"}
                </Text>
                <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                  <Ionicons name="close" size={24} color="#666" />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.scrollView}>
                {step === 1 &&
                  provinces.map((province) => (
                    <TouchableOpacity
                      key={province.ProvinceID}
                      style={styles.item}
                      onPress={() => handleProvinceSelect(province)}
                    >
                      <Text style={styles.itemText}>
                        {province.ProvinceName}
                      </Text>
                      <Ionicons name="chevron-forward" size={20} color="#666" />
                    </TouchableOpacity>
                  ))}
                {step === 2 &&
                  districts.map((district) => (
                    <TouchableOpacity
                      key={district.DistrictID}
                      style={styles.item}
                      onPress={() => handleDistrictSelect(district)}
                    >
                      <Text style={styles.itemText}>
                        {district.DistrictName}
                      </Text>
                      <Ionicons name="chevron-forward" size={20} color="#666" />
                    </TouchableOpacity>
                  ))}
                {step === 3 &&
                  wards.map((ward) => (
                    <TouchableOpacity
                      key={ward.WardCode}
                      style={styles.item}
                      onPress={() => handleWardSelect(ward)}
                    >
                      <Text style={styles.itemText}>{ward.WardName}</Text>
                      <Ionicons name="chevron-forward" size={20} color="#666" />
                    </TouchableOpacity>
                  ))}
              </ScrollView>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: Dimensions.get("window").width * 0.9,
    maxHeight: Dimensions.get("window").height * 0.7,
    backgroundColor: "#fff",
    borderRadius: 12,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    position: "relative",
  },
  closeButton: {
    position: "absolute",
    right: 15,
    top: 15,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  scrollView: {
    maxHeight: Dimensions.get("window").height * 0.5,
  },
  item: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  itemText: {
    fontSize: 15,
    color: "#333",
  },
});

export default AddressSelectionModal;
