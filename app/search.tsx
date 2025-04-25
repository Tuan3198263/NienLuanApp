import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { getSearchHistory, addSearchTerm, clearSearchHistory } from '../src/utils/searchHistoryStorage';

const popularSearches = [
  { text: 'kính mát', icon: 'glasses-outline' },  // Icon kính mát
  { text: 'bàn chải', icon: 'brush-outline' },   // Icon bàn chải
  { text: 'phấn', icon: 'color-palette-outline' }, // Icon phấn trang điểm
  { text: 'túi đeo', icon: 'bag-handle-outline' }, // Icon túi đeo
];

const categories = [
  { name: 'Chăm sóc da', icon: 'leaf-outline', slug: 'cham-soc-da' },
  { name: 'Chăm sóc cá nhân', icon: 'body-outline', slug: 'cham-soc-ca-nhan' },
  { name: 'Trang điểm', icon: 'color-wand-outline', slug: 'trang-diem' },
  { name: 'Phụ kiện', icon: 'basket-outline', slug: 'phu-kien' },
];

const SearchScreen = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchHistory, setSearchHistory] = useState<string[]>([]);

  // Load search history when component mounts
  useEffect(() => {
    loadSearchHistory();
  }, []);

  const loadSearchHistory = async () => {
    const history = await getSearchHistory();
    setSearchHistory(history);
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      await addSearchTerm(query.trim());
      await loadSearchHistory(); // Reload history after adding new term
    }
    // Implement search functionality here
  };

  const handleSearchSubmit = async () => {
    if (searchQuery.trim()) {
      await addSearchTerm(searchQuery.trim());
      await loadSearchHistory();
      // Navigate to search results or perform search
      router.push(`/search-results?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleHistoryItemPress = (term: string) => {
    setSearchQuery(term);
    router.push(`/search-results?q=${encodeURIComponent(term)}`);
  };

  const handleClearHistory = async () => {
    await clearSearchHistory();
    setSearchHistory([]);
  };

  // Add handler for popular search clicks
  const handlePopularSearchPress = (keyword: string) => {
    router.push(`/search-results?q=${encodeURIComponent(keyword)}`);
  };

  // Sửa lại hàm handleCategoryPress để truyền thêm tên danh mục
  const handleCategoryPress = (slug: string, name: string) => {
    router.push(`/category/${slug}?name=${encodeURIComponent(name)}`);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.searchBar}>
        <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm kiếm sản phẩm..."
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSearchSubmit}
          returnKeyType="search"
        />
      </View>

      <Text style={styles.sectionTitle}>Tìm kiếm phổ biến</Text>
      <View style={styles.popularContainer}>
        {popularSearches.map((item, index) => (
          <TouchableOpacity 
            key={index} 
            style={styles.popularItem}
            onPress={() => handlePopularSearchPress(item.text)}
          >
            <View style={styles.popularLeftContent}>
              <Ionicons name={item.icon} size={20} color="#666" style={styles.popularIcon} />
              <Text style={styles.popularText}>{item.text}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#666" />
          </TouchableOpacity>
        ))}
      </View>

      {searchHistory.length > 0 && (
        <>
          <View style={styles.historyHeader}>
            <Text style={styles.sectionTitle}>Lịch sử tìm kiếm</Text>
            <TouchableOpacity onPress={handleClearHistory}>
              <Text style={styles.clearText}>Xóa tất cả</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.historyContainer}>
            {searchHistory.map((item, index) => (
              <TouchableOpacity 
                key={index} 
                style={styles.historyItem}
                onPress={() => handleHistoryItemPress(item)}
              >
                <Ionicons name="time-outline" size={16} color="#666" style={styles.historyIcon} />
                <Text style={styles.historyText}>{item}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </>
      )}

      <Text style={styles.sectionTitle}>Danh mục</Text>
      <View style={styles.categoriesContainer}>
        {categories.map((category, index) => (
          <TouchableOpacity 
            key={index} 
            style={styles.categoryItem}
            onPress={() => handleCategoryPress(category.slug, category.name)}
          >
            <View style={styles.categoryIconContainer}>
              <Ionicons name={category.icon} size={24} color="#666" />
            </View>
            <Text style={styles.categoryText}>{category.name}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 15,
    paddingTop: 15,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    paddingHorizontal: 15,
    marginBottom: 25,
    height: 45,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#333',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
    marginTop: 10,
  },
  popularContainer: {
    marginBottom: 25,
  },
  popularItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  popularLeftContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  popularIcon: {
    marginRight: 12,
  },
  popularText: {
    fontSize: 15,
    color: '#444',
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  clearText: {
    fontSize: 14,
    color: '#666',
    textDecorationLine: 'underline',
  },
  historyContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 25,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  historyIcon: {
    marginRight: 6,
  },
  historyText: {
    fontSize: 14,
    color: '#444',
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15,
    paddingBottom: 20,
  },
  categoryItem: {
    width: '47%', // Adjusted width
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    marginBottom: 16,
  },
  categoryIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#444',
    textAlign: 'center',
  },
});

export default SearchScreen;
