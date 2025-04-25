import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { reviewApi } from "../src/api/reviewApi";
import { categoryStyles } from "../src/styles/categoryStyles";
import { useSelector } from "react-redux";
import { RootState } from "../src/redux/store";
import { commonStyles } from "../src/styles/commonStyles";
import { Stack } from "expo-router";

export default function PendingReviewsScreen() {
  const router = useRouter();
  const [pendingProducts, setPendingProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Lấy token từ Redux store
  const { token } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    const fetchPendingReviews = async () => {
      if (!token) {
        router.navigate("/login");
        return;
      }

      try {
        const response = await reviewApi.getPendingReviews(token);
        setPendingProducts(response.data.pendingProducts);
      } catch (error) {
        console.error("Lỗi khi lấy danh sách sản phẩm chờ đánh giá:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPendingReviews();
  }, [token, router]);

  const formatPrice = (price: number) => {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + " đ";
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN");
  };

  const renderPendingReviewItem = ({ item }) => (
    <View style={categoryStyles.productCard}>
      <TouchableOpacity
        style={categoryStyles.productImageContainer}
        onPress={() => router.push(`/product/${item.product.slug}`)}
      >
        <Image
          source={{ uri: item.product.images[0] }}
          style={categoryStyles.productImage}
        />
      </TouchableOpacity>
      <Text style={categoryStyles.productName} numberOfLines={2}>
        {item.product.name}
      </Text>
      <Text style={categoryStyles.price}>
        {formatPrice(item.product.price)}
      </Text>
      <View style={styles.purchaseInfoContainer}>
        <Text style={styles.purchaseInfo}>
          Đã mua: {item.totalPurchased} sản phẩm
        </Text>
        <Text style={styles.purchaseDate}>
          Ngày mua gần nhất: {formatDate(item.lastPurchaseDate)}
        </Text>
        <Text style={styles.reviewsRemaining}>
          Còn {item.remainingReviews} đánh giá có thể thực hiện
        </Text>
      </View>
      <TouchableOpacity
        style={styles.reviewButton}
        onPress={() => router.push(`/product/${item.product.slug}`)}
      >
        <Text style={styles.reviewButtonText}>Đánh giá ngay</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={categoryStyles.loadingContainer}>
        <ActivityIndicator size="large" color="#ff6b81" />
        <Text style={categoryStyles.loadingText}>Đang tải sản phẩm...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: "Sản phẩm chờ đánh giá",
          headerTitleStyle: styles.headerTitle,
          headerTitleAlign: "center",
        }}
      />
      <View style={commonStyles.smallHeaderContainer}>
        <Text style={commonStyles.smallHeaderText}>Sản phẩm chờ đánh giá</Text>
      </View>
      {pendingProducts.length > 0 ? (
        <FlatList
          data={pendingProducts}
          renderItem={renderPendingReviewItem}
          keyExtractor={(item) => item.product._id}
          numColumns={2}
          contentContainerStyle={[categoryStyles.productGrid, { marginTop: 8 }]}
          columnWrapperStyle={categoryStyles.row}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={categoryStyles.emptyContainer}>
          <MaterialIcons name="rate-review" size={64} color="#ccc" />
          <Text style={categoryStyles.emptyText}>
            Không có sản phẩm nào chờ đánh giá
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  purchaseInfoContainer: {
    marginTop: 8,
    padding: 8,
    backgroundColor: "#f9f9f9",
    borderRadius: 5,
  },
  purchaseInfo: {
    fontSize: 11,
    color: "#555",
    marginBottom: 2,
  },
  purchaseDate: {
    fontSize: 10,
    color: "#888",
    marginBottom: 2,
  },
  reviewsRemaining: {
    fontSize: 10,
    color: "#ff6b81",
    fontWeight: "500",
  },
  reviewButton: {
    backgroundColor: "#ff6b81",
    padding: 8,
    borderRadius: 5,
    marginTop: 8,
    alignItems: "center",
  },
  reviewButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "500",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
});
