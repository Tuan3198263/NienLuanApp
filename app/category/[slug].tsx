import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  Image, 
  TouchableOpacity, 
  FlatList, 
  ActivityIndicator,
  ScrollView
} from "react-native";
import { Ionicons, Feather, MaterialIcons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { productApi } from '../../src/api/productApi';
import { categoryApi } from '../../src/api/categoryApi';
import { useBrandsByCategory } from '../../src/hooks/useBrands';
import { categoryStyles } from '../../src/styles/categoryStyles';

// Filtering options
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

export default function CategoryDetailScreen() {
  const [selectedSort, setSelectedSort] = useState("default");
  const [showSortModal, setShowSortModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedPriceRange, setSelectedPriceRange] = useState<number | null>(null);
  const [isFiltersApplied, setIsFiltersApplied] = useState(false);
  
  const router = useRouter();
  const queryClient = useQueryClient();
  const params = useLocalSearchParams();
  const slug = params.slug as string;
  const categoryName = params.name as string || "Danh mục sản phẩm";
  
  // Sử dụng styles từ file riêng biệt
  const styles = categoryStyles;
  
  // Sử dụng useQuery để lấy danh sách sản phẩm theo danh mục
  const { 
    data: productsData,
    isLoading: isLoadingProducts,
    error: productsError,
    refetch: refetchProducts
  } = useQuery({
    queryKey: ['products', 'category', slug],
    queryFn: () => productApi.getProductsByCategorySlug(slug),
    select: (response) => response.data.products,
    staleTime: 1000 * 60 * 5,
    cacheTime: 1000 * 60 * 30,
  });
  
  // Sử dụng useQuery để lấy danh sách tất cả danh mục
  const {
    data: categoriesData,
    isLoading: isLoadingCategories,
    error: categoriesError
  } = useQuery({
    queryKey: ['categories', 'all-names'],
    queryFn: () => categoryApi.getAllCategoryNames(),
    select: (response) => response.data,
    staleTime: 1000 * 60 * 60, // Cache danh mục lâu hơn vì ít thay đổi
    cacheTime: 1000 * 60 * 60 * 24,
  });

  // Thay đổi enabled thành true để luôn fetch khi component mount hoặc slug thay đổi
  // thay vì chỉ fetch khi modal mở
  const {
    data: brands,
    isLoading: isLoadingBrands,
    error: brandsError
  } = useBrandsByCategory(slug);
  
  // Debug để kiểm tra dữ liệu brands và hiểu rõ cách hoạt động của cache
  useEffect(() => {
    if (brands) {
      console.log(`Brands loaded for category (${slug}), count:`, brands.length);
    }
  }, [brands, slug]);

  const products = productsData || [];
  const categories = categoriesData || [];
  
  // Format tiền tệ
  const formatPrice = (price: number) => {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + " đ";
  };

  // Điều hướng đến trang chi tiết sản phẩm
  const handleProductPress = (productSlug: string) => {
    // Prefetch data chi tiết sản phẩm (để cải thiện UX)
    queryClient.prefetchQuery({
      queryKey: ['product', productSlug],
      queryFn: () => productApi.getProductBySlug(productSlug),
    });
    router.push(`/product/${productSlug}`);
  };

  // Áp dụng sắp xếp
  const applySorting = (sortValue: string) => {
    setSelectedSort(sortValue);
    setShowSortModal(false);
  };

  // Hiển thị đánh giá sao
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

  // Hiển thị một sản phẩm
  const renderProductItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.productCard}
      onPress={() => handleProductPress(item.slug)}
    >
      <View style={styles.productImageContainer}>
        <Image source={{ uri: item.images[0] }} style={styles.productImage} />
      </View>
      <Text style={styles.productTitle}>{item.brand?.name}</Text>
      <Text style={styles.productDescription} numberOfLines={2}>{item.name}</Text>
      {renderRatingStars(item.averageRating, item.reviews?.length || 0)}
      <Text style={styles.price}>{formatPrice(item.price)}</Text>
    </TouchableOpacity>
  );

  // Xử lý chọn danh mục
  const handleCategorySelect = (category) => {
    setShowCategoryModal(false);
    if (category.slug !== slug) {
      // Prefetch data danh mục mới
      queryClient.prefetchQuery({
        queryKey: ['products', 'category', category.slug],
        queryFn: () => productApi.getProductsByCategorySlug(category.slug),
      });
      router.replace(`/category/${category.slug}?name=${encodeURIComponent(category.name)}`);
    }
  };

  // Sắp xếp sản phẩm theo lựa chọn
  const sortedProducts = React.useMemo(() => {
    if (!products.length) return [];
    
    // Tạo bản sao của mảng để không thay đổi dữ liệu gốc
    let result = [...products];
    
    switch(selectedSort) {
      case 'price_asc':
        return result.sort((a, b) => a.price - b.price);
      case 'price_desc':
        return result.sort((a, b) => b.price - a.price);
      case 'rating_desc':
        return result.sort((a, b) => b.averageRating - a.averageRating);
      case 'newest':
        return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      default:
        return result;
    }
  }, [products, selectedSort]);

  // Hiển thị loading khi đang tải cả danh mục và sản phẩm
  const isLoading = isLoadingProducts || isLoadingCategories;
  // Kết hợp lỗi từ cả hai query
  const error = productsError || categoriesError;

  // Apply brand filter
  const applyBrandFilter = (brandId: string | null) => {
    setSelectedBrand(brandId);
    setShowFilterModal(false);
    // Optionally, trigger a refetch of products with the selected brand filter
  };

  // Combine sorting and filtering
  const processedProducts = React.useMemo(() => {
    if (!products.length) return [];
    
    // Apply filters first if they are active
    let result = [...products];
    
    if (isFiltersApplied) {
      // Filter by selected brands
      if (selectedBrands.length > 0) {
        result = result.filter(product => selectedBrands.includes(product.brand._id));
      }
      
      // Filter by price range
      if (selectedPriceRange !== null) {
        const { min, max } = priceRanges[selectedPriceRange];
        result = result.filter(product => product.price >= min && product.price <= max);
      }
    }
    
    // Then apply sorting
    switch(selectedSort) {
      case 'price_asc':
        return result.sort((a, b) => a.price - b.price);
      case 'price_desc':
        return result.sort((a, b) => b.price - a.price);
      case 'rating_desc':
        return result.sort((a, b) => b.averageRating - a.averageRating);
      case 'newest':
        return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      default:
        return result;
    }
  }, [products, selectedSort, selectedBrands, selectedPriceRange, isFiltersApplied]);

  // Toggle brand selection (multi-select)
  const toggleBrandSelection = (brandId: string) => {
    setSelectedBrands(prevSelected => {
      if (prevSelected.includes(brandId)) {
        return prevSelected.filter(id => id !== brandId);
      } else {
        return [...prevSelected, brandId];
      }
    });
  };

  // Apply filters (brand and price)
  const applyFilters = () => {
    setIsFiltersApplied(true);
    setShowFilterModal(false);
  };

  // Reset filters
  const resetFilters = () => {
    setSelectedBrands([]);
    setSelectedPriceRange(null);
    setIsFiltersApplied(false);
  };

  // Chỉ mở modal, KHÔNG gọi fetchBrands nữa
  const openFilterModal = () => {
    setShowFilterModal(true);
  };

  return (
    <View style={styles.fullContainer}>
      {/* Category Header */}
      <View style={styles.categoryHeader}>
        <Text style={styles.categoryTitle}>Danh mục: {categoryName}</Text>
        <TouchableOpacity 
          style={styles.categorySelector}
          onPress={() => setShowCategoryModal(true)}
        >
          <Ionicons name="chevron-down" size={20} color="#333" />
        </TouchableOpacity>
      </View>

      {/* Filter Bar */}
      <View style={styles.filterBar}>
        <TouchableOpacity 
          style={styles.filterOption} 
          onPress={() => setShowSortModal(true)}
        >
          <Text style={styles.filterText}>
            {sortOptions.find(option => option.value === selectedSort)?.label || "Mặc định"}
          </Text>
          <Ionicons name="chevron-down" size={18} color="#000" />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.filterOption}
          onPress={openFilterModal} // Sử dụng hàm mới, không fetch brands lại nữa
        >
          <Feather name="sliders" size={18} color="#000" />
          <Text style={styles.filterText}>Lọc</Text>
          {/* Hiển thị indicator nhỏ nếu có filter đang áp dụng */}
          {(selectedBrands.length > 0 || selectedPriceRange !== null) && (
            <View style={styles.filterActiveIndicator} />
          )}
        </TouchableOpacity>
      </View>

      {/* Product Grid with Pull-to-refresh */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#ff6b81" />
          <Text style={styles.loadingText}>Đang tải sản phẩm...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <MaterialIcons name="error-outline" size={64} color="#ff6b81" />
          <Text style={styles.errorText}>Đã xảy ra lỗi khi tải dữ liệu</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={() => refetchProducts()}
          >
            <Text style={styles.retryButtonText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      ) : processedProducts.length > 0 ? (
        <FlatList
          data={processedProducts}
          renderItem={renderProductItem}
          keyExtractor={item => item._id}
          numColumns={2}
          contentContainerStyle={styles.productGrid}
          columnWrapperStyle={styles.row}
          showsVerticalScrollIndicator={false}
          onRefresh={() => {
            refetchProducts();
            // Reset filters on manual refresh
            if (isFiltersApplied) {
              resetFilters();
            }
          }}
          refreshing={isLoadingProducts}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <MaterialIcons name="search-off" size={64} color="#ccc" />
          <Text style={styles.emptyText}>
            {isFiltersApplied ? "Không tìm thấy sản phẩm phù hợp với bộ lọc" : "Không tìm thấy sản phẩm nào"}
          </Text>
          {isFiltersApplied && (
            <TouchableOpacity style={styles.resetFiltersButton} onPress={resetFilters}>
              <Text style={styles.resetFiltersText}>Bỏ bộ lọc</Text>
            </TouchableOpacity>
          )}
        </View>
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
                  selectedSort === option.value && styles.selectedSortOption
                ]}
                onPress={() => {
                  setSelectedSort(option.value);
                  applySorting(option.value);
                }}
              >
                <Text 
                  style={[
                    styles.sortOptionText,
                    selectedSort === option.value && styles.selectedSortOptionText
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

      {/* Category Modal */}
      {showCategoryModal && (
        <View style={styles.modalOverlay}>
          <TouchableOpacity 
            style={styles.modalBackground} 
            onPress={() => setShowCategoryModal(false)}
          />
          <View style={styles.categoryModal}>
            <Text style={styles.modalTitle}>Chọn danh mục</Text>
            
            {isLoadingCategories ? (
              <View style={styles.modalLoadingContainer}>
                <ActivityIndicator size="small" color="#ff6b81" />
                <Text style={styles.loadingText}>Đang tải danh mục...</Text>
              </View>
            ) : categoriesError ? (
              <View style={styles.modalErrorContainer}>
                <Text style={styles.errorText}>Không thể tải danh mục</Text>
              </View>
            ) : (
              categories.map((category) => (
                <TouchableOpacity 
                  key={category._id} 
                  style={[
                    styles.categoryOption,
                    slug === category.slug && styles.selectedCategoryOption
                  ]}
                  onPress={() => handleCategorySelect(category)}
                >
                  <View style={styles.categoryOptionContent}>
                    <MaterialIcons 
                      name={getCategoryIcon(category.slug)} 
                      size={22} 
                      color={slug === category.slug ? "#ff6b81" : "#666"} 
                    />
                    <Text 
                      style={[
                        styles.categoryOptionText,
                        slug === category.slug && styles.selectedCategoryOptionText
                      ]}
                    >
                      {category.name}
                    </Text>
                  </View>
                  {slug === category.slug && (
                    <Ionicons name="checkmark" size={20} color="#ff6b81" />
                  )}
                </TouchableOpacity>
              ))
            )}
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
              {/* Brand Filter */}
              <Text style={styles.filterSectionTitle}>
                Thương hiệu {brands?.length ? `(${brands.length})` : ''}
              </Text>
              
              {isLoadingBrands ? (
                <ActivityIndicator size="small" color="#ff6b81" style={styles.loadingIndicator} />
              ) : brandsError ? (
                <View>
                  <Text style={styles.errorText}>Không thể tải danh sách thương hiệu</Text>
                  <Text style={styles.errorSubText}>{String(brandsError)}</Text>
                </View>
              ) : !brands || brands.length === 0 ? (
                <Text style={styles.notFoundText}>Không tìm thấy thương hiệu nào</Text>
              ) : (
                <View style={styles.brandList}>
                  {brands.map((brand) => (
                    <TouchableOpacity
                      key={brand._id}
                      style={[
                        styles.brandOption,
                        selectedBrands.includes(brand._id) && styles.selectedBrandOption,
                      ]}
                      onPress={() => toggleBrandSelection(brand._id)}
                    >
                      <Text
                        style={[
                          styles.brandOptionText,
                          selectedBrands.includes(brand._id) && styles.selectedBrandOptionText,
                        ]}
                      >
                        {brand.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {/* Price Range Filter */}
              <Text style={styles.filterSectionTitle}>Mức giá</Text>
              <View style={styles.priceRangeList}>
                {priceRanges.map((range, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.priceRangeOption,
                      selectedPriceRange === index && styles.selectedPriceRangeOption,
                    ]}
                    onPress={() => setSelectedPriceRange(selectedPriceRange === index ? null : index)}
                  >
                    <Text
                      style={[
                        styles.priceRangeText,
                        selectedPriceRange === index && styles.selectedPriceRangeText,
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
    </View>
  );
}

// Helper để lấy icon phù hợp cho mỗi danh mục
function getCategoryIcon(slug: string): string {
  switch (slug) {
    case 'cham-soc-da':
      return 'face';
    case 'cham-soc-ca-nhan':
      return 'person-outline';
    case 'trang-diem':
      return 'brush';
    case 'phu-kien':
      return 'shopping-bag';
    default:
      return 'category';
  }
}
