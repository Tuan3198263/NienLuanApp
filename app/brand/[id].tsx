import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Pressable,
  ActivityIndicator,
  FlatList,
} from "react-native";
import { Ionicons, Feather, MaterialIcons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { brandApi } from "../../src/api/brandApi";
import { productApi } from "../../src/api/productApi";
import { categoryStyles } from "../../src/styles/categoryStyles";
import HTML from "react-native-render-html";
import { useWindowDimensions } from "react-native";

// Sorting options
const sortOptions = [
  { label: "Mặc định", value: "default" },
  { label: "Giá thấp đến cao", value: "price_asc" },
  { label: "Giá cao đến thấp", value: "price_desc" },
  { label: "Đánh giá cao nhất", value: "rating_desc" },
  { label: "Mới nhất", value: "newest" },
];

// Define price range options
const priceRanges = [
  { label: "0 - 100k", min: 0, max: 100000 },
  { label: "100k - 500k", min: 100000, max: 500000 },
  { label: "500k - 1tr", min: 500000, max: 1000000 },
  { label: "1tr - 2tr", min: 1000000, max: 2000000 },
  { label: "2tr - 5tr", min: 2000000, max: 5000000 },
];

export default function BrandDetailScreen() {
  const [selectedSort, setSelectedSort] = useState("default");
  const [showSortModal, setShowSortModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [selectedPriceRange, setSelectedPriceRange] = useState<number | null>(
    null
  );
  const [isFiltersApplied, setIsFiltersApplied] = useState(false);

  const router = useRouter();
  const queryClient = useQueryClient();
  const params = useLocalSearchParams();
  const brandId = params.id as string;

  // Use styles from categoryStyles
  const styles = categoryStyles;
  const { width } = useWindowDimensions();

  // Fetch brand details
  const {
    data: brandData,
    isLoading: isLoadingBrand,
    error: brandError,
    refetch: refetchBrand,
  } = useQuery({
    queryKey: ["brand", brandId],
    queryFn: () => brandApi.getBrandById(brandId),
    select: (response) => {
      return response.data;
    },
    staleTime: 1000 * 60 * 5,
    cacheTime: 1000 * 60 * 30,
  });

  // Fetch products by brand
  const {
    data: productsData,
    isLoading: isLoadingProducts,
    error: productsError,
    refetch: refetchProducts,
  } = useQuery({
    queryKey: ["products", "brand", brandId],
    queryFn: () => productApi.getProductsByBrandId(brandId),
    select: (response) => response.data.products,
    staleTime: 1000 * 60 * 5,
    cacheTime: 1000 * 60 * 30,
  });

  const products = productsData || [];
  const brand = brandData;

  // Format currency
  const formatPrice = (price: number) => {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + " đ";
  };

  // Navigate to product detail page
  const handleProductPress = (productSlug: string) => {
    // Prefetch product detail data (for better UX)
    queryClient.prefetchQuery({
      queryKey: ["product", productSlug],
      queryFn: () => productApi.getProductBySlug(productSlug),
    });
    router.push(`/product/${productSlug}`);
  };

  // Apply sorting
  const applySorting = (sortValue: string) => {
    setSelectedSort(sortValue);
    setShowSortModal(false);
  };

  // Display star rating
  const renderRatingStars = (rating: number, reviewCount: number) => {
    return (
      <View style={styles.ratingContainer}>
        {[1, 2, 3, 4, 5].map((star, index) => (
          <Ionicons
            key={index}
            name={index < Math.floor(rating) ? "star" : "star-outline"}
            size={14}
            color="#FFD700"
          />
        ))}
        {reviewCount > 0 && (
          <Text style={styles.ratingText}>({reviewCount})</Text>
        )}
      </View>
    );
  };

  // Render a product item
  const renderProductItem = ({ item }) => (
    <TouchableOpacity
      style={styles.productCard}
      onPress={() => handleProductPress(item.slug)}
    >
      <View style={styles.productImageContainer}>
        <Image source={{ uri: item.images[0] }} style={styles.productImage} />
        {item.stock <= 0 && (
          <View style={brandDetailStyles.outOfStockBadge}>
            <Text style={brandDetailStyles.outOfStockText}>Hết hàng</Text>
          </View>
        )}
      </View>
      <Text style={styles.productTitle}>{brand?.name}</Text>
      <Text style={styles.productDescription} numberOfLines={2}>
        {item.name}
      </Text>
      {renderRatingStars(item.averageRating, item.reviews?.length || 0)}
      <Text style={styles.price}>{formatPrice(item.price)}</Text>
    </TouchableOpacity>
  );

  // Apply filters (price range)
  const applyFilters = () => {
    setIsFiltersApplied(true);
    setShowFilterModal(false);
    // Không cần gọi refetch hay tải lại dữ liệu
  };

  // Reset filters
  const resetFilters = () => {
    setSelectedPriceRange(null);
    setIsFiltersApplied(false);
    // Không cần gọi refetch hay tải lại dữ liệu
  };

  // Process products with sorting and filtering
  const processedProducts = React.useMemo(() => {
    if (!products.length) return [];

    // Apply filters first if they are active
    let result = [...products];

    if (isFiltersApplied) {
      // Filter by price range
      if (selectedPriceRange !== null) {
        const { min, max } = priceRanges[selectedPriceRange];
        result = result.filter(
          (product) => product.price >= min && product.price <= max
        );
      }
    }

    // Then apply sorting
    switch (selectedSort) {
      case "price_asc":
        return result.sort((a, b) => a.price - b.price);
      case "price_desc":
        return result.sort((a, b) => b.price - a.price);
      case "rating_desc":
        return result.sort((a, b) => b.averageRating - a.averageRating);
      case "newest":
        return result.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      default:
        return result;
    }
  }, [products, selectedSort, selectedPriceRange, isFiltersApplied]);

  // Combine loading states
  const isLoading = isLoadingBrand || isLoadingProducts;
  // Combine error states
  const error = brandError || productsError;

  return (
    <SafeAreaView style={styles.fullContainer}>
      {/* Brand Header */}
      <View style={styles.categoryHeader}>
        <Text style={styles.categoryTitle}>
          {isLoadingBrand
            ? "Đang tải..."
            : `Hãng: ${brand?.name || "Không có tên"}`}
        </Text>
      </View>

      {/* Filter Bar */}
      <View style={styles.filterBar}>
        <TouchableOpacity
          style={styles.filterOption}
          onPress={() => setShowSortModal(true)}
        >
          <Text style={styles.filterText}>
            {sortOptions.find((option) => option.value === selectedSort)
              ?.label || "Mặc định"}
          </Text>
          <Ionicons name="chevron-down" size={18} color="#000" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.filterOption}
          onPress={() => setShowFilterModal(true)}
        >
          <Feather name="sliders" size={18} color="#000" />
          <Text style={styles.filterText}>Lọc</Text>
          {/* Display indicator if filters are applied */}
          {selectedPriceRange !== null && (
            <View style={styles.filterActiveIndicator} />
          )}
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#ff6b81" />
          <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <MaterialIcons name="error-outline" size={64} color="#ff6b81" />
          <Text style={styles.errorText}>Đã xảy ra lỗi khi tải dữ liệu</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => {
              refetchBrand();
              refetchProducts();
            }}
          >
            <Text style={styles.retryButtonText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          {/* Brand Information and Products */}
          <FlatList
            data={processedProducts}
            renderItem={renderProductItem}
            keyExtractor={(item) => item._id}
            numColumns={2}
            contentContainerStyle={styles.productGrid}
            columnWrapperStyle={styles.row}
            showsVerticalScrollIndicator={false}
            ListHeaderComponent={() => {
              return (
                <View style={brandDetailStyles.brandSection}>
                  {brand?.logo ? (
                    <Image
                      source={{ uri: brand.logo }}
                      style={brandDetailStyles.brandLogo}
                      onError={() => {
                        /* Xử lý lỗi hình ảnh nếu cần thiết */
                      }}
                    />
                  ) : (
                    <Text style={brandDetailStyles.brandLogoText}>
                      {brand?.name}
                    </Text>
                  )}

                  {brand?.description ? (
                    <View style={brandDetailStyles.htmlContainer}>
                      <HTML
                        source={{ html: brand.description }}
                        contentWidth={width - 40}
                        tagsStyles={{
                          p: {
                            color: "#666",
                            fontSize: 14,
                            lineHeight: 20,
                            textAlign: "center",
                          },
                          span: { fontSize: 14, lineHeight: 20 },
                        }}
                      />
                    </View>
                  ) : (
                    <Text style={brandDetailStyles.brandDescription}>
                      Không có thông tin mô tả
                    </Text>
                  )}
                </View>
              );
            }}
            ListEmptyComponent={() => (
              <View style={styles.emptyContainer}>
                <MaterialIcons name="search-off" size={64} color="#ccc" />
                <Text style={styles.emptyText}>
                  {isFiltersApplied
                    ? "Không tìm thấy sản phẩm phù hợp với bộ lọc"
                    : "Không tìm thấy sản phẩm nào"}
                </Text>
                {isFiltersApplied && (
                  <TouchableOpacity
                    style={styles.resetFiltersButton}
                    onPress={resetFilters}
                  >
                    <Text style={styles.resetFiltersText}>Bỏ bộ lọc</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
            onRefresh={() => {
              // Chỉ refetch khi thực sự cần tải lại dữ liệu từ server
              refetchBrand();
              refetchProducts();
              // Đặt lại bộ lọc nhưng không cần tải lại dữ liệu
              if (isFiltersApplied) {
                resetFilters();
              }
            }}
            refreshing={isLoading}
          />
        </>
      )}

      {/* Sort Modal */}
      {showSortModal && (
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackground}
            onPress={() => setShowSortModal(false)}
          />
          <View style={styles.sortModal}>
            <Text style={styles.sortModalTitle}>Sắp xếp theo</Text>
            {sortOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.sortOption,
                  selectedSort === option.value && styles.selectedSortOption,
                ]}
                onPress={() => applySorting(option.value)}
              >
                <Text
                  style={[
                    styles.sortOptionText,
                    selectedSort === option.value &&
                      styles.selectedSortOptionText,
                  ]}
                >
                  {option.label}
                </Text>
                {selectedSort === option.value && (
                  <Ionicons name="checkmark" size={20} color="#ff6b81" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Filter Modal */}
      {showFilterModal && (
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackground}
            onPress={() => setShowFilterModal(false)}
          />
          <View style={styles.filterModal}>
            <View style={styles.filterModalHeader}>
              <Text style={styles.filterModalTitle}>Bộ lọc</Text>
              <TouchableOpacity onPress={() => setShowFilterModal(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.filterScrollView}>
              {/* Price Range Filter */}
              <Text style={styles.filterSectionTitle}>Mức giá</Text>
              <View style={styles.priceRangeList}>
                {priceRanges.map((range, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.priceRangeOption,
                      selectedPriceRange === index &&
                        styles.selectedPriceRangeOption,
                    ]}
                    onPress={() =>
                      setSelectedPriceRange(
                        selectedPriceRange === index ? null : index
                      )
                    }
                  >
                    <Text
                      style={[
                        styles.priceRangeText,
                        selectedPriceRange === index &&
                          styles.selectedPriceRangeText,
                      ]}
                    >
                      {range.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            {/* Apply and Reset Buttons */}
            <View style={styles.filterActions}>
              <TouchableOpacity
                style={styles.resetButton}
                onPress={resetFilters}
              >
                <Text style={styles.resetButtonText}>Đặt lại</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.applyButton}
                onPress={applyFilters}
              >
                <Text style={styles.applyButtonText}>Áp dụng</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

// Additional styles specific to brand detail page
const brandDetailStyles = StyleSheet.create({
  brandSection: {
    padding: 20,
    alignItems: "center",
    marginBottom: 10,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  brandLogo: {
    width: 100,
    height: 100,
    resizeMode: "contain",
    marginBottom: 20,
  },
  brandLogoText: {
    fontSize: 24,
    fontWeight: "bold",
    letterSpacing: 2,
    marginBottom: 20,
  },
  brandDescription: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    lineHeight: 20,
  },
  seeMore: {
    color: "#ff6b81",
    marginTop: 8,
    fontSize: 14,
    fontWeight: "500",
  },
  outOfStockBadge: {
    position: "absolute",
    bottom: 8,
    right: 8,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  outOfStockText: {
    color: "white",
    fontSize: 12,
  },
  htmlContainer: {
    paddingHorizontal: 10,
  },
  brandDescription: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    lineHeight: 20,
  },
});
