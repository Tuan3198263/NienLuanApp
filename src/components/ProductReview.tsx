import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ReviewModal } from "./ReviewModal";
import { showToast } from "../utils/toast";

interface ReviewItem {
  id: string;
  name: string;
  avatar?: string;
  date: string;
  rating: number;
  verified: boolean;
  comment: string;
}

interface ProductReviewProps {
  averageRating: number;
  totalReviews: number;
  reviews: ReviewItem[];
  canReview: boolean;
  onAddReview: (rating: number, comment: string) => void;
}

const ProductReview: React.FC<ProductReviewProps> = ({
  averageRating,
  totalReviews,
  reviews,
  canReview,
  onAddReview,
}) => {
  const [reviewModalVisible, setReviewModalVisible] = useState(false);

  const formatDate = (isoString: string) => {
    // Chuyển đổi UTC sang múi giờ Việt Nam
    const date = new Date(isoString);
    const vietnamTime = new Date(date.getTime() + 7 * 60 * 60 * 1000);

    const day = vietnamTime.getUTCDate().toString().padStart(2, "0");
    const month = (vietnamTime.getUTCMonth() + 1).toString().padStart(2, "0");
    const year = vietnamTime.getUTCFullYear();
    const hours = vietnamTime.getUTCHours().toString().padStart(2, "0");
    const minutes = vietnamTime.getUTCMinutes().toString().padStart(2, "0");

    return `${day}/${month}/${year} lúc ${hours}:${minutes}`;
  };

  const renderAvatar = (name: string, avatar?: string) => {
    if (avatar) {
      return <Image source={{ uri: avatar }} style={styles.avatar} />;
    }

    // Fallback to letter avatar
    return (
      <View style={styles.avatarPlaceholder}>
        <Text style={styles.avatarLetter}>{name.charAt(0).toUpperCase()}</Text>
      </View>
    );
  };

  const renderRatingStars = (rating: number) => {
    return (
      <View style={styles.ratingStars}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Ionicons
            key={star}
            name="star"
            size={14}
            color={star <= rating ? "#FFA41C" : "#D1D1D1"}
            style={{ marginRight: 2 }}
          />
        ))}
      </View>
    );
  };

  const renderReviewItem = ({ item }: { item: ReviewItem }) => (
    <View style={styles.reviewItem}>
      <View style={styles.reviewHeader}>
        {renderAvatar(item.name, item.avatar)}
        <View style={styles.reviewerInfo}>
          <Text style={styles.reviewerName}>{item.name}</Text>
          <Text style={styles.reviewDate}>{formatDate(item.date)}</Text>
          <View style={styles.ratingRow}>
            {renderRatingStars(item.rating)}
            {item.verified && (
              <View style={styles.verifiedBadge}>
                <Ionicons name="checkmark-circle" size={12} color="#00A65A" />
                <Text style={styles.verifiedText}>Đã mua sản phẩm</Text>
              </View>
            )}
          </View>
        </View>
      </View>
      <Text style={styles.reviewComment}>{item.comment}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.ratingOverview}>
        <View>
          <Text style={styles.ratingLabel}>Đánh giá sản phẩm</Text>
          <Text style={styles.ratingScore}>{averageRating.toFixed(1)}</Text>
          <View style={styles.ratingDetails}>
            {renderRatingStars(averageRating)}
            <Text style={styles.reviewCount}>{totalReviews} đánh giá</Text>
          </View>
        </View>
      </View>

      <FlatList
        data={reviews}
        renderItem={renderReviewItem}
        keyExtractor={(item) => item.id}
        scrollEnabled={false}
      />

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.addReviewButton}
          onPress={() => {
            if (!canReview) {
              showToast.error("Bạn cần mua sản phẩm để đánh giá");
              return;
            }
            setReviewModalVisible(true);
          }}
        >
          <Ionicons name="star-outline" size={20} color="#333" />
          <Text style={styles.addReviewText}>Gửi đánh giá của bạn</Text>
        </TouchableOpacity>
      </View>

      <ReviewModal
        visible={reviewModalVisible}
        onClose={() => setReviewModalVisible(false)}
        onSubmit={onAddReview}
        maxLength={100}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#F8F8F8",
  },
  ratingOverview: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    backgroundColor: "#FFF",
    padding: 16,
    marginBottom: 8,
  },
  ratingLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  ratingScore: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
  },
  ratingDetails: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  ratingStars: {
    flexDirection: "row",
    marginRight: 8,
  },
  reviewCount: {
    fontSize: 12,
    color: "#666",
  },
  reviewItem: {
    backgroundColor: "#FFF",
    padding: 16,
    marginBottom: 1,
  },
  reviewHeader: {
    flexDirection: "row",
    marginBottom: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#E0E0E0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  avatarLetter: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#666",
  },
  reviewerInfo: {
    flex: 1,
  },
  reviewerName: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
  },
  reviewDate: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  verifiedBadge: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 8,
  },
  verifiedText: {
    fontSize: 12,
    color: "#00A65A",
    marginLeft: 2,
  },
  reviewComment: {
    fontSize: 14,
    color: "#333",
    lineHeight: 20,
  },
  buttonContainer: {
    marginTop: 20, // Add spacing above button
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  addReviewButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFF",
    padding: 16,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  addReviewText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
    marginLeft: 8,
  },
});

export default ProductReview;
