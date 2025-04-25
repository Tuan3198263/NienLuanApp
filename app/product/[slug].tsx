import React, { useEffect, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  View,
  Text,
  useWindowDimensions,
  Image,
  LogBox,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import RenderHtml from "react-native-render-html";
import { productApi } from "../../src/api/productApi";
import { wishlistApi } from "../../src/api/wishlistApi";
import { reviewApi } from "../../src/api/reviewApi";
import type { ProductData } from "../../src/api/productApi";
import ProductOverview from "../../src/components/ProductOverview";
import ProductDescription from "../../src/components/ProductDescription";
import ProductReview from "../../src/components/ProductReview";
import { useSelector } from "react-redux";
import { showToast } from "../../src/utils/toast";
import ProductActions from "../../src/components/ProductActions";
import { cartApi } from "../../src/api/cartApi";
import { router } from "expo-router";

// Bỏ qua cảnh báo về defaultProps
LogBox.ignoreLogs([
  "Support for defaultProps will be removed from function components in a future major release. Use JavaScript default parameters instead.",
]);

export default function ProductDetailScreen() {
  const { slug } = useLocalSearchParams();
  const { width } = useWindowDimensions();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [product, setProduct] = useState<ProductData | null>(null);
  const [favoriteCount, setFavoriteCount] = useState(0);
  const [reviews, setReviews] = useState<ReviewData[]>([]);
  const { token } = useSelector((state: RootState) => state.auth);
  const [isFavorite, setIsFavorite] = useState(false);
  const [canReview, setCanReview] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Kiểm tra nếu đã có product data thì không fetch lại
        if (product?._id) return;

        const productRes = await productApi.getProductBySlug(slug as string);
        const productData = productRes.data.product;

        if (!productData) {
          throw new Error("Không tìm thấy sản phẩm");
        }

        // Add favorite status check if user is logged in
        const [reviewsData, favoritesRes, favoriteStatus] = await Promise.all([
          reviewApi.getReviewsByProduct(productData._id),
          wishlistApi.getFavoriteCount(productData._id),
          token
            ? wishlistApi.checkFavoriteStatus(token, productData._id)
            : Promise.resolve({ data: { isFavorite: false } }),
        ]);

        // Lọc chỉ lấy các đánh giá có status 'active'
        const activeReviews = reviewsData.data.reviews.filter(
          (review) => review.status === "active"
        );

        setProduct(productData);
        setReviews(activeReviews); // Lưu các đánh giá đã lọc
        setFavoriteCount(favoritesRes.data.favoriteCount);
        setIsFavorite(favoriteStatus.data.isFavorite);

        // Add review eligibility check if user is logged in
        if (token && productData._id) {
          const eligibilityRes = await reviewApi.checkReviewEligibility(
            token,
            productData._id
          );
          setCanReview(eligibilityRes.data.canReview);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Có lỗi xảy ra");
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchData();
    }

    // Thêm product?._id vào dependency array
  }, [slug, product?._id, token]);

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#0088CC" />
      </View>
    );
  }

  if (error || !product) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>
          {error || "Không tìm thấy sản phẩm"}
        </Text>
      </View>
    );
  }

  const handleRequireAuth = () => {
    showToast.info("Vui lòng đăng nhập để tiếp tục");
    router.push("/login");
  };

  const overViewProps = {
    images: product.images,
    brand: product.brand,
    name: product.name,
    rating: product.averageRating,
    reviews: product.reviews.length,
    loves: favoriteCount,
    price: product.price,
    isFavorite: isFavorite, // Add this prop
    onToggleFavorite: async () => {
      if (!token) {
        handleRequireAuth();
        return;
      }
      try {
        await wishlistApi.toggleFavorite(token, product._id);
        setIsFavorite(!isFavorite);
        setFavoriteCount((prev) => (isFavorite ? prev - 1 : prev + 1));
      } catch (error) {
        showToast.error("Có lỗi xảy ra, vui lòng thử lại");
      }
    },
  };

  const handleAddReview = async (rating: number, comment: string) => {
    if (!token) {
      showToast.error("Vui lòng đăng nhập để đánh giá");
      return;
    }

    if (!canReview) {
      showToast.error("Bạn cần mua sản phẩm để đánh giá");
      return;
    }

    try {
      await reviewApi.addReview(token, {
        productId: product!._id,
        rating,
        comment,
      });

      // Fetch lại cả reviews và averageRating
      const [newReviews, newRating] = await Promise.all([
        reviewApi.getReviewsByProduct(product!._id),
        reviewApi.getAverageRating(product!._id),
      ]);

      // Cập nhật cả reviews và product với rating mới
      setReviews(newReviews.data.reviews);
      setProduct((prev) => ({
        ...prev!,
        averageRating: Number(newRating.data.averageRating),
      }));

      showToast.success("Đánh giá thành công");
    } catch (error) {
      showToast.error("Có lỗi xảy ra khi gửi đánh giá");
    }
  };

  const reviewProps = {
    averageRating: product.averageRating,
    totalReviews: reviews.length,
    reviews: reviews.map((review) => ({
      id: review._id,
      name: review.userId.fullName || "Người dùng",
      avatar: review.userId.avatar,
      date: review.createdAt, // Chỉ truyền createdAt, để component con xử lý
      rating: review.rating,
      verified: true,
      comment: review.comment,
    })),
    onAddReview: handleAddReview,
    canReview,
  };

  // Hàm xử lý HTML content
  const processHtmlContent = (htmlContent: string) => {
    return {
      html: htmlContent || "",
      baseStyle: {
        fontSize: 14,
        lineHeight: 20,
        color: "#333",
      },
    };
  };

  const handleAddToCart = async () => {
    try {
      const response = await cartApi.addToCart(token!, product!._id);
      // Nếu thành công thì không cần throw error
      return response; // Trả về response để ProductActions xử lý success case
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message || "Có lỗi xảy ra, vui lòng thử lại";
      // Throw error để ProductActions có thể bắt và xử lý
      throw new Error(errorMessage);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={styles.container}>
        <View style={styles.section}>
          <ProductOverview {...overViewProps} />
        </View>

        <View style={styles.divider} />

        <View style={styles.section}>
          <ProductDescription
            description={processHtmlContent(product.description)}
            usage={processHtmlContent(product.usage || "")}
            ingredients={processHtmlContent(product.ingredients || "")}
          />
        </View>

        <View style={styles.divider} />

        <View style={styles.section}>
          <ProductReview {...reviewProps} />
        </View>
      </ScrollView>

      <ProductActions
        onAddToCart={handleAddToCart}
        onToggleFavorite={overViewProps.onToggleFavorite}
        isFavorite={isFavorite}
        isAuthenticated={!!token}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    marginBottom: 65, // Add padding bottom for ProductActions
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    color: "#ff6b6b",
    fontSize: 16,
    textAlign: "center",
  },
  section: {
    backgroundColor: "#fff",
    paddingVertical: 10,
  },
  divider: {
    height: 8,
    backgroundColor: "#f4f4f4",
  },
});
