import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  Image, 
  TouchableOpacity, 
  FlatList, 
  ActivityIndicator,
  ScrollView,
  StyleSheet,
} from "react-native";
import { Ionicons, Feather, MaterialIcons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { productApi } from '../src/api/productApi';
import { brandApi } from '../src/api/brandApi';
import { categoryStyles } from '../src/styles/categoryStyles';

// Sorting options remain the same
const sortOptions = [
  { label: "Mặc định", value: "default" },
  { label: "Giá thấp đến cao", value: "price_asc" },
  { label: "Giá cao đến thấp", value: "price_desc" },
  { label: "Đánh giá cao nhất", value: "rating_desc" },
  { label: "Mới nhất", value: "newest" },
];

// Price ranges remain the same
const priceRanges = [
  { label: "0 - 100k", min: 0, max: 100000 },
  { label: "100k - 500k", min: 100000, max: 500000 },
  { label: "500k - 1tr", min: 500000, max: 1000000 },
  { label: "1tr - 2tr", min: 1000000, max: 2000000 },
  { label: "2tr - 5tr", min: 2000000, max: 5000000 },
];

export default function SearchResultsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const searchQuery = params.q as string;

  const [selectedSort, setSelectedSort] = useState("default");
  const [showSortModal, setShowSortModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedPriceRange, setSelectedPriceRange] = useState<number | null>(null);
  const [isFiltersApplied, setIsFiltersApplied] = useState(false);

  // Fetch search results
  const { 
    data: searchResults,
    isLoading: isLoadingProducts,
    error: searchError,
    refetch: refetchSearch
  } = useQuery({
    queryKey: ['search', searchQuery],
    queryFn: () => productApi.searchProducts(searchQuery),
    select: (response) => response.data.products,
    enabled: !!searchQuery,
  });

  // Update the brands query
  const {
    data: brands,
    isLoading: isLoadingBrands,
    error: brandsError
  } = useQuery({
    queryKey: ['brands', 'search', searchQuery],
    queryFn: () => brandApi.getBrandsByProductKeyword(searchQuery),
    select: (response) => response.data.brands,
    enabled: !!searchQuery,
    // Add error handling
    onError: (error) => {
      console.error('Error fetching brands:', error);
    }
  });

  // Add toggleBrandSelection function
  const toggleBrandSelection = (brandId: string) => {
    setSelectedBrands(prevSelected => {
      if (prevSelected.includes(brandId)) {
        return prevSelected.filter(id => id !== brandId);
      } else {
        return [...prevSelected, brandId];
      }
    });
  };

  // Add reset filters function
  const resetFilters = () => {
    setSelectedBrands([]);
    setSelectedPriceRange(null);
    setIsFiltersApplied(false);
    setShowFilterModal(false);
  };

  // Add apply filters function
  const applyFilters = () => {
    setIsFiltersApplied(true);
    setShowFilterModal(false);
  };

  // Process products with sorting and filtering
  const processedProducts = React.useMemo(() => {
    if (!searchResults) return [];
    
    let result = [...searchResults];
    
    // Apply filters
    if (isFiltersApplied) {
      if (selectedBrands.length > 0) {
        result = result.filter(product => selectedBrands.includes(product.brand._id));
      }
      
      if (selectedPriceRange !== null) {
        const { min, max } = priceRanges[selectedPriceRange];
        result = result.filter(product => product.price >= min && product.price <= max);
      }
    }
    
    // Apply sorting
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
  }, [searchResults, selectedSort, selectedBrands, selectedPriceRange, isFiltersApplied]);

  // Format price helper
  const formatPrice = (price: number) => {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + " đ";
  };

  // Render product item
  const renderProductItem = ({ item }) => (
    <TouchableOpacity 
      style={categoryStyles.productCard}
      onPress={() => router.push(`/product/${item.slug}`)}
    >
      <View style={categoryStyles.productImageContainer}>
        <Image source={{ uri: item.images[0] }} style={categoryStyles.productImage} />
      </View>
      <Text style={categoryStyles.brandName}>{item.brand?.name}</Text>
      <Text style={categoryStyles.productName} numberOfLines={2}>{item.name}</Text>
      <View style={categoryStyles.ratingContainer}>
        {[1, 2, 3, 4, 5].map((star, index) => (
          <Ionicons 
            key={index}
            name={index < Math.floor(item.averageRating) ? "star" : "star-outline"}
            size={14}
            color="#FFD700"
          />
        ))}
        <Text style={categoryStyles.reviewCount}>({item.reviews?.length || 0})</Text>
      </View>
      <Text style={categoryStyles.price}>{formatPrice(item.price)}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={categoryStyles.fullContainer}>
      {/* Header section with custom styles */}
      <View style={styles.searchHeader}>
       
        <Text style={styles.searchTitle} numberOfLines={1}>
          Kết quả tìm kiếm: "{searchQuery}"
        </Text>
      </View>

      {/* Filter Bar - Updated to match [slug].tsx */}
      <View style={categoryStyles.filterBar}>
        <TouchableOpacity 
          style={categoryStyles.filterOption} 
          onPress={() => setShowSortModal(true)}
        >
          <Text style={categoryStyles.filterText}>
            {sortOptions.find(option => option.value === selectedSort)?.label || "Mặc định"}
          </Text>
          <Ionicons name="chevron-down" size={18} color="#000" />
        </TouchableOpacity>

        <TouchableOpacity 
          style={categoryStyles.filterOption}
          onPress={() => setShowFilterModal(true)}
        >
          <Feather name="sliders" size={18} color="#000" />
          <Text style={categoryStyles.filterText}>Lọc</Text>
          {isFiltersApplied && <View style={categoryStyles.filterActiveIndicator} />}
        </TouchableOpacity>
      </View>

      {/* Results Grid - Updated to use categoryStyles */}
      {isLoadingProducts ? (
        <View style={categoryStyles.loadingContainer}>
          <ActivityIndicator size="large" color="#ff6b81" />
          <Text style={categoryStyles.loadingText}>Đang tải sản phẩm...</Text>
        </View>
      ) : searchError ? (
        <View style={categoryStyles.errorContainer}>
          <MaterialIcons name="error-outline" size={64} color="#ff6b81" />
          <Text style={categoryStyles.errorText}>Đã xảy ra lỗi khi tải dữ liệu</Text>
          <TouchableOpacity style={categoryStyles.retryButton} onPress={() => refetchSearch()}>
            <Text style={categoryStyles.retryButtonText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      ) : processedProducts.length > 0 ? (
        <FlatList
          data={processedProducts}
          renderItem={renderProductItem}
          keyExtractor={item => item._id}
          numColumns={2}
          contentContainerStyle={categoryStyles.productGrid}
          columnWrapperStyle={categoryStyles.row}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={categoryStyles.emptyContainer}>
          <MaterialIcons name="search-off" size={64} color="#ccc" />
          <Text style={categoryStyles.emptyText}>
            Không tìm thấy sản phẩm phù hợp
          </Text>
        </View>
      )}

      {/* Sort Modal */}
      {showSortModal && (
        <View style={categoryStyles.modalOverlay}>
          <TouchableOpacity 
            style={categoryStyles.modalBackground} 
            onPress={() => setShowSortModal(false)}
          />
          <View style={categoryStyles.sortModal}>
            <Text style={categoryStyles.modalTitle}>Sắp xếp theo</Text>
            {sortOptions.map((option) => (
              <TouchableOpacity 
                key={option.value} 
                style={[
                  categoryStyles.sortOption,
                  selectedSort === option.value && categoryStyles.selectedSortOption
                ]}
                onPress={() => {
                  setSelectedSort(option.value);
                  setShowSortModal(false);
                }}
              >
                <Text style={[
                  categoryStyles.sortOptionText,
                  selectedSort === option.value && categoryStyles.selectedSortOptionText
                ]}>
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
        <View style={categoryStyles.modalOverlay}>
          <TouchableOpacity 
            style={categoryStyles.modalBackground}
            onPress={() => setShowFilterModal(false)}
          />
          <View style={categoryStyles.filterModal}>
            <View style={categoryStyles.filterModalHeader}>
              <Text style={categoryStyles.modalTitle}>Bộ lọc</Text>
              <TouchableOpacity onPress={() => setShowFilterModal(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <ScrollView style={categoryStyles.filterScrollView}>
              {/* Brand Filter Section */}
              <Text style={categoryStyles.filterSectionTitle}>
                Thương hiệu {brands?.length ? `(${brands.length})` : ''}
              </Text>
              {isLoadingBrands ? (
                <ActivityIndicator size="small" color="#ff6b81" style={categoryStyles.loadingIndicator} />
              ) : brands?.length > 0 ? (
                <View style={categoryStyles.brandList}>
                  {brands.map((brand) => (
                    <TouchableOpacity
                      key={brand._id}
                      style={[
                        categoryStyles.brandOption,
                        selectedBrands.includes(brand._id) && categoryStyles.selectedBrandOption
                      ]}
                      onPress={() => toggleBrandSelection(brand._id)}
                    >
                      <Text style={[
                        categoryStyles.brandOptionText,
                        selectedBrands.includes(brand._id) && categoryStyles.selectedBrandOptionText
                      ]}>
                        {brand.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              ) : (
                <Text style={categoryStyles.notFoundText}>Không tìm thấy thương hiệu</Text>
              )}

              {/* Price Range Section */}
              <Text style={categoryStyles.filterSectionTitle}>Khoảng giá</Text>
              <View style={categoryStyles.priceRangeList}>
                {priceRanges.map((range, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      categoryStyles.priceRangeOption,
                      selectedPriceRange === index && categoryStyles.selectedPriceRangeOption
                    ]}
                    onPress={() => setSelectedPriceRange(
                      selectedPriceRange === index ? null : index
                    )}
                  >
                    <Text style={[
                      categoryStyles.priceRangeText,
                      selectedPriceRange === index && categoryStyles.selectedPriceRangeText
                    ]}>
                      {range.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            {/* Filter Actions */}
            <View style={categoryStyles.filterActions}>
              <TouchableOpacity
                style={categoryStyles.resetButton}
                onPress={resetFilters}
              >
                <Text style={categoryStyles.resetButtonText}>Đặt lại</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={categoryStyles.applyButton}
                onPress={applyFilters}
              >
                <Text style={categoryStyles.applyButtonText}>Áp dụng</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

// Add local styles specific to search results
const styles = StyleSheet.create({
  searchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    marginRight: 12,
    padding: 4,
  },
  searchTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
});
