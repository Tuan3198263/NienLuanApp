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

export default function ReviewedProductsScreen() {
  const router = useRouter();
  const [reviewedProducts, setReviewedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Lấy token từ Redux store
  const { token } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    const fetchReviewedProducts = async () => {
      if (!token) {
        router.navigate("/login");
        return;
      }

      try {
        const response = await reviewApi.getReviewedProducts(token);
        setReviewedProducts(response.data.reviewedProducts);
      } catch (error) {
        console.error("Lỗi khi lấy danh sách sản phẩm đã đánh giá:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReviewedProducts();
  }, [token, router]);

  const formatPrice = (price: number) => {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + " đ";
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN");
  };

  const renderReviewedProductItem = ({ item }) => (
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
      <View style={categoryStyles.ratingContainer}>
        {[1, 2, 3, 4, 5].map((star, index) => (
          <Ionicons
            key={index}
            name={index < item.review.rating ? "star" : "star-outline"}
            size={14}
            color="#FFD700"
          />
        ))}
      </View>
      <Text style={categoryStyles.price}>
        {formatPrice(item.product.price)}
      </Text>
      <View style={styles.reviewInfoContainer}>
        <Text style={styles.reviewComment} numberOfLines={2}>
          "{item.review.comment}"
        </Text>
        <Text style={styles.reviewDate}>
          Đã đánh giá vào: {formatDate(item.review.createdAt)}
        </Text>
        <Text style={styles.purchaseInfo}>
          Đã mua: {item.totalPurchased} sản phẩm
        </Text>
      </View>
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
          title: "Sản phẩm đã đánh giá",
          headerTitleStyle: styles.headerTitle,
          headerTitleAlign: "center",
        }}
      />
      <View style={commonStyles.smallHeaderContainer}>
        <Text style={commonStyles.smallHeaderText}>Sản phẩm đã đánh giá</Text>
      </View>
      {reviewedProducts.length > 0 ? (
        <FlatList
          data={reviewedProducts}
          renderItem={renderReviewedProductItem}
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
            Bạn chưa đánh giá sản phẩm nào
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
  reviewInfoContainer: {
    marginTop: 8,
    padding: 8,
    backgroundColor: "#f9f9f9",
    borderRadius: 5,
  },
  reviewComment: {
    fontSize: 12,
    fontStyle: "italic",
    color: "#555",
    marginBottom: 4,
  },
  reviewDate: {
    fontSize: 10,
    color: "#888",
    marginBottom: 2,
  },
  purchaseInfo: {
    fontSize: 10,
    color: "#888",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
});
