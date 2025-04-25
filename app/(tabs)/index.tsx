import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  TouchableOpacity,
  FlatList,
  Dimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { ActivityIndicator } from "react-native-paper";
import { MaterialIcons } from "@expo/vector-icons";

// Get screen width for proper sizing
const { width } = Dimensions.get("window");

// Banner data with cosmetic-related images
const banners = [
  {
    id: 1,
    image:
      "https://images.unsplash.com/photo-1612817288484-6f916006741a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80",
    title: "Ưu đãi mùa hè",
  },
  {
    id: 2,
    image:
      "https://images.unsplash.com/photo-1596462502278-27bfdc403348?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80",
    title: "Sản phẩm mới",
  },
  {
    id: 3,
    image:
      "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1169&q=80",
    title: "Giảm giá 50%",
  },
];

// Product data with cosmetic-related images
const products = [
  {
    id: 1,
    name: "Sữa rửa mặt dưỡng ẩm",
    price: 250000,
    image:
      "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80",
    discount: "20%",
  },
  {
    id: 2,
    name: "Kem chống nắng SPF 50",
    price: 350000,
    image: "https://princesswhite.vn/wp-content/uploads/2021/06/best12.jpg",
    discount: "10%",
  },
  {
    id: 3,
    name: "Serum vitamin C",
    price: 450000,
    image:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQp2tZjK0SBqEoRDaun45fKTXy3Pz3_92R8sg&s",
    discount: null,
  },
  {
    id: 4,
    name: "Mặt nạ dưỡng ẩm",
    price: 80000,
    image:
      "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=735&q=80",
    discount: "15%",
  },
  {
    id: 5,
    name: "Nước tẩy trang",
    price: 120000,
    image:
      "https://product.hstatic.net/200000551679/product/1_25df47690c45489cb3c1074f0b87941d_1024x1024.jpg",
    discount: null,
  },
  {
    id: 6,
    name: "Kem dưỡng ban đêm",
    price: 280000,
    image:
      "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=712&q=80",
    discount: "5%",
  },
];

// Mock data cho danh mục
const categories = [
  { id: 1, slug: "cham-soc-da", name: "Chăm sóc da", icon: "face" },
  {
    id: 3,
    slug: "cham-soc-ca-nhan",
    name: "Chăm sóc cá nhân",
    icon: "person-outline",
  },
  { id: 2, slug: "trang-diem", name: "Trang điểm", icon: "brush" },
  { id: 4, slug: "phu-kien", name: "Phụ kiện", icon: "shopping-bag" },
];

export default function HomeScreen() {
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const [activeIndex, setActiveIndex] = useState(0);

  // Giả lập thời gian tải
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  // Hàm điều hướng đến trang category theo slug
  const navigateToCategory = (slug: string) => {
    router.navigate(`/category/${slug}`);
  };

  const formatPrice = (price) => {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + "đ";
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ff6b81" />
        <Text style={styles.loadingText}>Đang tải...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Banner Slider */}
      <View style={styles.bannerContainer}>
        <FlatList
          data={banners}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          snapToInterval={width - 30}
          snapToAlignment="center"
          decelerationRate="fast"
          onMomentumScrollEnd={(event) => {
            const slideIndex = Math.floor(
              event.nativeEvent.contentOffset.x / (width - 30)
            );
            setActiveIndex(slideIndex);
          }}
          renderItem={({ item }) => (
            <TouchableOpacity style={[styles.banner, { width: width - 30 }]}>
              <Image
                source={{ uri: item.image }}
                style={styles.bannerImage}
                resizeMode="cover"
              />
              <View style={styles.bannerOverlay}>
                <Text style={styles.bannerTitle}>{item.title}</Text>
              </View>
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item.id.toString()}
        />
        <View style={styles.paginationContainer}>
          {banners.map((_, index) => (
            <View
              key={index}
              style={[
                styles.paginationDot,
                index === activeIndex && styles.paginationDotActive,
              ]}
            />
          ))}
        </View>
      </View>

      {/* Danh mục */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Danh mục</Text>
        <View style={styles.categoriesContainer}>
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={styles.categoryItem}
              onPress={() => navigateToCategory(category.slug)}
            >
              <View style={styles.categoryIconContainer}>
                <MaterialIcons name={category.icon} size={24} color="#ff6b81" />
              </View>
              <Text style={styles.categoryName}>{category.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Sản phẩm nổi bật */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Sản phẩm nổi bật</Text>
        </View>

        <View style={styles.productGrid}>
          {products.map((product) => (
            <TouchableOpacity key={product.id} style={styles.productCard}>
              <View style={styles.productImageContainer}>
                <Image
                  source={{ uri: product.image }}
                  style={styles.productImage}
                />
                {product.discount && (
                  <View style={styles.discountBadge}>
                    <Text style={styles.discountText}>{product.discount}</Text>
                  </View>
                )}
              </View>
              <View style={styles.productInfo}>
                <Text style={styles.productName} numberOfLines={2}>
                  {product.name}
                </Text>
                <Text style={styles.productPrice}>
                  {formatPrice(product.price)}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Banner quảng cáo */}
      <TouchableOpacity style={styles.promoBanner}>
        <Image
          source={{
            uri: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1187&q=80",
          }}
          style={styles.promoBannerImage}
          resizeMode="cover"
        />
        <View style={styles.promoBannerOverlay}>
          <Text style={styles.promoBannerText}>Ưu đãi đặc biệt</Text>
          <Text style={styles.promoBannerSubtext}>
            Giảm 30% cho đơn hàng đầu tiên
          </Text>
        </View>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f8f8",
  },
  headerTitle: {
    fontWeight: "bold",
    fontSize: 22,
    color: "#ff6b81",
  },
  headerRightContainer: {
    flexDirection: "row",
    marginRight: 10,
  },
  headerButton: {
    marginLeft: 15,
    padding: 5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
  },
  bannerContainer: {
    height: 200,
    marginVertical: 10,
    paddingHorizontal: 15,
  },
  banner: {
    height: 180,
    borderRadius: 10,
    overflow: "hidden",
  },
  bannerImage: {
    width: "100%",
    height: "100%",
  },
  bannerOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 15,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
  },
  bannerTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  section: {
    marginTop: 20,
    paddingHorizontal: 15,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  seeAllText: {
    color: "#ff6b81",
    fontWeight: "500",
  },
  categoriesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 10,
  },
  categoryItem: {
    width: "18%",
    alignItems: "center",
    marginBottom: 15,
  },
  categoryIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 12,
    textAlign: "center",
  },
  productGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  productCard: {
    width: "48%",
    backgroundColor: "white",
    borderRadius: 10,
    marginBottom: 15,
    overflow: "hidden",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  productImageContainer: {
    height: 150,
    position: "relative",
  },
  productImage: {
    width: "100%",
    height: "100%",
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  discountBadge: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "#ff6b81",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  discountText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 12,
  },
  productInfo: {
    padding: 10,
  },
  productName: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 5,
    height: 40,
  },
  productPrice: {
    fontWeight: "bold",
    color: "#ff6b81",
  },
  promoBanner: {
    marginVertical: 20,
    height: 120,
    marginHorizontal: 15,
    borderRadius: 10,
    overflow: "hidden",
    elevation: 3,
  },
  promoBannerImage: {
    width: "100%",
    height: "100%",
  },
  promoBannerOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    padding: 15,
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  promoBannerText: {
    color: "white",
    fontSize: 22,
    fontWeight: "bold",
  },
  promoBannerSubtext: {
    color: "white",
    fontSize: 14,
    marginTop: 5,
  },
  paginationContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#ccc",
    marginHorizontal: 4,
  },
  paginationDotActive: {
    backgroundColor: "#ff6b81",
    width: 12,
    height: 8,
  },
});
