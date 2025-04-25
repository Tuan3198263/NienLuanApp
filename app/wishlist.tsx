import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  Animated,
} from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { wishlistApi } from "../src/api/wishlistApi";
import { categoryStyles } from "../src/styles/categoryStyles";
import { useSelector } from "react-redux";
import { RootState } from "../src/redux/store";
import { commonStyles } from "../src/styles/commonStyles";
import { Stack } from "expo-router";

export default function WishlistScreen() {
  const router = useRouter();
  const [favoriteProducts, setFavoriteProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingItems, setLoadingItems] = useState({});
  const [fadeAnims] = useState<{ [key: string]: Animated.Value }>({});

  // Lấy token từ Redux store
  const { token } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    const fetchFavorites = async () => {
      if (!token) {
        router.navigate("/login");
        return;
      }

      try {
        const response = await wishlistApi.getFavorites(token);
        setFavoriteProducts(response.data);
      } catch (error) {
        console.error("Lỗi khi lấy danh sách yêu thích:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, [token, router]);

  const formatPrice = (price: number) => {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + " đ";
  };

  const handleToggleFavorite = async (productId) => {
    setLoadingItems((prev) => ({ ...prev, [productId]: true }));
    try {
      await wishlistApi.toggleFavorite(token, productId);

      // Create fade animation if it doesn't exist
      if (!fadeAnims[productId]) {
        fadeAnims[productId] = new Animated.Value(1);
      }

      // Start fade out animation
      Animated.timing(fadeAnims[productId], {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        // Remove product after animation completes
        setFavoriteProducts((prev) =>
          prev.filter((item) => item._id !== productId)
        );
      });
    } catch (error) {
      console.error("Lỗi khi bỏ yêu thích:", error);
    } finally {
      setLoadingItems((prev) => ({ ...prev, [productId]: false }));
    }
  };

  const renderProductItem = ({ item }) => (
    <Animated.View
      style={[
        categoryStyles.productCard,
        { opacity: fadeAnims[item._id] || 1 },
      ]}
    >
      <TouchableOpacity
        style={categoryStyles.productImageContainer}
        onPress={() => router.push(`/product/${item.slug}`)}
      >
        <Image
          source={{ uri: item.images[0] }}
          style={categoryStyles.productImage}
        />
      </TouchableOpacity>
      <Text style={categoryStyles.productName} numberOfLines={2}>
        {item.name}
      </Text>
      <View style={categoryStyles.ratingContainer}>
        {[1, 2, 3, 4, 5].map((star, index) => (
          <Ionicons
            key={index}
            name={
              index < Math.floor(item.averageRating) ? "star" : "star-outline"
            }
            size={14}
            color="#FFD700"
          />
        ))}
        <Text style={categoryStyles.reviewCount}>
          ({item.reviews?.length || 0})
        </Text>
      </View>
      <Text style={categoryStyles.price}>{formatPrice(item.price)}</Text>
      <TouchableOpacity
        style={styles.unlikeButton}
        onPress={() => handleToggleFavorite(item._id)}
        disabled={loadingItems[item._id]}
      >
        {loadingItems[item._id] ? (
          <ActivityIndicator size="small" color="#ff6b81" />
        ) : (
          <Text style={styles.unlikeButtonText}>Bỏ yêu thích</Text>
        )}
      </TouchableOpacity>
    </Animated.View>
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
          title: "Sản phẩm yêu thích",
          headerTitleStyle: styles.headerTitle,
          headerTitleAlign: "center",
        }}
      />
      <View style={commonStyles.smallHeaderContainer}>
        <Text style={commonStyles.smallHeaderText}>Sản phẩm yêu thích</Text>
      </View>
      {favoriteProducts.length > 0 ? (
        <FlatList
          data={favoriteProducts}
          renderItem={renderProductItem}
          keyExtractor={(item) => item._id}
          numColumns={2}
          contentContainerStyle={[categoryStyles.productGrid, { marginTop: 8 }]}
          columnWrapperStyle={categoryStyles.row}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={categoryStyles.emptyContainer}>
          <MaterialIcons name="favorite-border" size={64} color="#ccc" />
          <Text style={categoryStyles.emptyText}>
            Chưa có sản phẩm yêu thích
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
  unlikeButton: {
    backgroundColor: "#ff6b81",
    padding: 8,
    borderRadius: 5,
    marginTop: 8,
    alignItems: "center",
  },
  unlikeButtonText: {
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
