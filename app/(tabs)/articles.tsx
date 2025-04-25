import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Image,
  TouchableOpacity,
} from "react-native";

// Interface cho bài viết mỹ phẩm
interface CosmeticArticle {
  id: string;
  title: string;
  summary: string;
  imageUrl: string;
  author: string;
  date: string;
  category: string;
  readingTime: string;
}

// Mock data cho các bài viết mỹ phẩm
const MOCK_ARTICLES: CosmeticArticle[] = [
  {
    id: "1",
    title: "Những xu hướng skincare năm 2023",
    summary:
      "Khám phá các phương pháp chăm sóc da mới nhất đang được ưa chuộng trong năm nay và cách áp dụng vào quy trình hàng ngày.",
    imageUrl:
      "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
    author: "Minh Tâm",
    date: "12/10/2023",
    category: "Skincare",
    readingTime: "5 phút",
  },
  {
    id: "2",
    title: "Top 10 sản phẩm makeup được yêu thích nhất",
    summary:
      "Danh sách 10 sản phẩm trang điểm được các chuyên gia đánh giá cao và được nhiều người sử dụng nhất trong thời gian gần đây.",
    imageUrl:
      "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
    author: "Hương Giang",
    date: "05/10/2023",
    category: "Makeup",
    readingTime: "7 phút",
  },
  {
    id: "3",
    title: "Cách chọn nước hoa phù hợp với từng mùa",
    summary:
      "Hướng dẫn cách lựa chọn hương thơm phù hợp với từng mùa trong năm để tạo ấn tượng và phong cách riêng.",
    imageUrl:
      "https://curnonwatch.com/blog/wp-content/uploads/2022/07/Slide17.jpeg",
    author: "Thanh Thảo",
    date: "28/09/2023",
    category: "Nước hoa",
    readingTime: "4 phút",
  },
  {
    id: "4",
    title: "Bí quyết chăm sóc tóc hư tổn",
    summary:
      "Những phương pháp hiệu quả để phục hồi mái tóc hư tổn và duy trì vẻ đẹp bóng mượt cho mái tóc của bạn.",
    imageUrl:
      "https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
    author: "Minh Anh",
    date: "20/09/2023",
    category: "Chăm sóc tóc",
    readingTime: "6 phút",
  },
  {
    id: "5",
    title: "Review 5 loại kem chống nắng tốt nhất hiện nay",
    summary:
      "Đánh giá chi tiết về 5 loại kem chống nắng được đánh giá cao nhất về khả năng bảo vệ da và độ thân thiện với mọi loại da.",
    imageUrl:
      "https://images.unsplash.com/photo-1526947425960-945c6e72858f?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
    author: "Lan Anh",
    date: "15/09/2023",
    category: "Skincare",
    readingTime: "8 phút",
  },
  {
    id: "6",
    title: "Cách làm đẹp từ thiên nhiên với các nguyên liệu sẵn có",
    summary:
      "Khám phá các công thức làm đẹp từ những nguyên liệu tự nhiên có sẵn trong nhà bếp để chăm sóc da an toàn.",
    imageUrl:
      "https://images.unsplash.com/photo-1586339949916-3e9457bef6d3?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
    author: "Thu Trang",
    date: "08/09/2023",
    category: "Tự nhiên",
    readingTime: "5 phút",
  },
];

const CosmeticsArticlesPage: React.FC = () => {
  const [articles, setArticles] = useState<CosmeticArticle[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("Tất cả");

  // Danh sách các danh mục
  const categories = [
    "Tất cả",
    "Skincare",
    "Makeup",
    "Nước hoa",
    "Chăm sóc tóc",
    "Tự nhiên",
  ];

  // Giả lập việc tải dữ liệu
  useEffect(() => {
    const loadArticles = () => {
      setTimeout(() => {
        setArticles(MOCK_ARTICLES);
        setLoading(false);
      }, 1000); // Giả lập thời gian tải 1 giây
    };

    loadArticles();
  }, []);

  // Lọc bài viết theo danh mục
  const filteredArticles =
    selectedCategory === "Tất cả"
      ? articles
      : articles.filter((article) => article.category === selectedCategory);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#e91e63" />
        <Text style={styles.loadingText}>Đang tải bài viết...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Bài Viết Mỹ Phẩm</Text>
        <Text style={styles.subtitle}>
          Khám phá những xu hướng và bí quyết làm đẹp mới nhất
        </Text>
      </View>

      {/* Danh mục filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesContainer}
      >
        {categories.map((category) => (
          <TouchableOpacity
            key={category}
            style={[
              styles.categoryButton,
              selectedCategory === category && styles.selectedCategoryButton,
            ]}
            onPress={() => setSelectedCategory(category)}
          >
            <Text
              style={[
                styles.categoryText,
                selectedCategory === category && styles.selectedCategoryText,
              ]}
            >
              {category}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Danh sách bài viết */}
      <View style={styles.articlesContainer}>
        {filteredArticles.map((article) => (
          <TouchableOpacity key={article.id} style={styles.articleCard}>
            <Image
              source={{ uri: article.imageUrl }}
              style={styles.articleImage}
              resizeMode="cover"
            />
            <View style={styles.articleContent}>
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryBadgeText}>{article.category}</Text>
              </View>
              <Text style={styles.articleTitle}>{article.title}</Text>
              <Text style={styles.articleSummary}>{article.summary}</Text>
              <View style={styles.articleMeta}>
                <Text style={styles.articleAuthor}>Bởi: {article.author}</Text>
                <Text style={styles.articleDate}>{article.date}</Text>
                <Text style={styles.articleReadingTime}>
                  {article.readingTime}
                </Text>
              </View>
              <TouchableOpacity style={styles.readMoreButton}>
                <Text style={styles.readMoreButtonText}>Đọc tiếp</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    height: "100%",
    backgroundColor: "#f8f9fa",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
  },
  header: {
    alignItems: "center",
    marginTop: 24,
    marginBottom: 20,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
  categoriesContainer: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 10,
    borderRadius: 20,
    backgroundColor: "#f0f0f0",
  },
  selectedCategoryButton: {
    backgroundColor: "#e91e63",
  },
  categoryText: {
    fontSize: 14,
    color: "#666",
  },
  selectedCategoryText: {
    color: "#fff",
    fontWeight: "bold",
  },
  articlesContainer: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  articleCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: "hidden",
  },
  articleImage: {
    width: "100%",
    height: 200,
  },
  articleContent: {
    padding: 16,
  },
  categoryBadge: {
    backgroundColor: "#e91e63",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
    alignSelf: "flex-start",
    marginBottom: 10,
  },
  categoryBadgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "500",
  },
  articleTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  articleSummary: {
    fontSize: 14,
    color: "#666",
    marginBottom: 16,
    lineHeight: 20,
  },
  articleMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
    flexWrap: "wrap",
  },
  articleAuthor: {
    fontSize: 12,
    color: "#888",
  },
  articleDate: {
    fontSize: 12,
    color: "#888",
  },
  articleReadingTime: {
    fontSize: 12,
    color: "#888",
  },
  readMoreButton: {
    backgroundColor: "#f8f9fa",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: "#e91e63",
  },
  readMoreButtonText: {
    color: "#e91e63",
    fontSize: 14,
    fontWeight: "500",
  },
});

export default CosmeticsArticlesPage;
