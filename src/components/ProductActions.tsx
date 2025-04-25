import React, { useState } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Modal,
  ActivityIndicator,
} from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { showToast } from "../utils/toast";
import { router } from "expo-router";

interface ProductActionsProps {
  onAddToCart: () => Promise<void>;
  onToggleFavorite: () => Promise<void>;
  isFavorite: boolean;
  isAuthenticated: boolean;
}

const ProductActions: React.FC<ProductActionsProps> = ({
  onAddToCart,
  onToggleFavorite,
  isFavorite,
  isAuthenticated,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const handleAction = async (
    action: () => Promise<void>,
    successMsg: string
  ) => {
    if (isLoading) return;
    if (!isAuthenticated) {
      router.navigate("/login");
      return;
    }

    try {
      setIsLoading(true);
      await action();
      // Luôn hiển thị success message sau khi action thành công
      setSuccessMessage(successMsg);
      setShowSuccessModal(true);
      setTimeout(() => setShowSuccessModal(false), 1500);
    } catch (error: any) {
      showToast.error(error.message);
      setSuccessMessage("");
      setShowSuccessModal(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <View style={styles.container}>
        <TouchableOpacity
          style={[styles.button, styles.favoriteButton]}
          onPress={() =>
            handleAction(onToggleFavorite, "Đã cập nhật danh sách yêu thích")
          }
          disabled={isLoading}
        >
          <FontAwesome
            name="heart"
            size={20}
            color={isFavorite ? "#FF4500" : "#666"}
          />
          <Text style={styles.buttonText}>Yêu thích</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.cartButton]}
          onPress={() => handleAction(onAddToCart, "Đã thêm vào giỏ hàng")}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <>
              <FontAwesome name="shopping-cart" size={20} color="#fff" />
              <Text style={styles.cartButtonText}>Thêm vào giỏ</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      <Modal visible={showSuccessModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <FontAwesome name="check-circle" size={50} color="#4CAF50" />
            <Text style={styles.modalText}>{successMessage}</Text>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    backgroundColor: "#fff",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  button: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 5,
  },
  favoriteButton: {
    backgroundColor: "#f8f8f8",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  cartButton: {
    backgroundColor: "#FF4500",
  },
  buttonText: {
    marginLeft: 8,
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  cartButtonText: {
    marginLeft: 8,
    fontSize: 14,
    color: "#fff",
    fontWeight: "500",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    alignItems: "center",
  },
  modalText: {
    marginTop: 10,
    fontSize: 16,
    color: "#333",
  },
});

export default ProductActions;
