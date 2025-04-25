import React, { useState, useRef } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Dimensions,
} from "react-native";
import { Ionicons, FontAwesome, MaterialIcons } from "@expo/vector-icons";
import { locationApi } from "../api/locationApi";
import { AddressSelectionModal } from "./AddressSelectionModal";

interface ShippingAddress {
  provinceId?: number;
  districtId?: number;
  wardCode?: string;
  provinceName?: string;
  districtName?: string;
  wardName?: string;
}

interface ProductOverviewProps {
  images: string[];
  brand: {
    _id: string;
    name: string;
  };
  name: string;
  rating: number;
  reviews: number;
  loves: number;
  price: number;
  isFavorite: boolean;
  onToggleFavorite: () => void;
}

const ProductOverview: React.FC<ProductOverviewProps> = ({
  images,
  brand,
  name,
  rating,
  reviews,
  loves,
  price,
  isFavorite,
  onToggleFavorite,
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const screenWidth = Dimensions.get("window").width;
  const [modalVisible, setModalVisible] = useState(false);
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({});
  const [shippingFee, setShippingFee] = useState<number>(0);
  const [deliveryTime, setDeliveryTime] = useState<string>("");

  const formatPrice = (amount: number) => {
    return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + " đ";
  };

  const renderImageItem = ({
    item,
    index,
  }: {
    item: string;
    index: number;
  }) => (
    <Image
      source={{ uri: item }}
      style={[styles.productImage, { width: screenWidth }]}
      resizeMode="contain"
    />
  );

  const onScroll = (event: any) => {
    const slideSize = event.nativeEvent.layoutMeasurement.width;
    const index = event.nativeEvent.contentOffset.x / slideSize;
    setActiveIndex(Math.round(index));
  };

  const renderPagination = () => (
    <View style={styles.pagination}>
      {images.map((_, index) => (
        <View
          key={index}
          style={[
            styles.paginationDot,
            index === activeIndex && styles.paginationDotActive,
          ]}
        />
      ))}
    </View>
  );

  const renderImageCounter = () => (
    <View style={styles.imageCounter}>
      <Text style={styles.imageCounterText}>
        {activeIndex + 1}/{images.length}
      </Text>
    </View>
  );

  const handleAddressSelect = async (address: ShippingAddress) => {
    setShippingAddress(address);
    if (address.districtId && address.wardCode) {
      try {
        const [feeResponse, timeResponse] = await Promise.all([
          locationApi.calculateShippingFee(
            address.districtId,
            address.wardCode,
            price
          ),
          locationApi.calculateLeadTime(address.districtId, address.wardCode),
        ]);

        setShippingFee(feeResponse.total);

        // Format delivery time from leadtime response
        const fromDate = new Date(
          timeResponse.leadtime_order.from_estimate_date
        );
        const toDate = new Date(timeResponse.leadtime_order.to_estimate_date);

        const formatDate = (date: Date) => {
          return date.toLocaleDateString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
          });
        };

        setDeliveryTime(`${formatDate(fromDate)} - ${formatDate(toDate)}`);
      } catch (error) {
        console.error("Error calculating shipping:", error);
      }
    }
    setModalVisible(false);
  };

  return (
    <View>
      {/* Images Carousel */}
      <View style={styles.imageContainer}>
        <FlatList
          ref={flatListRef}
          data={images}
          renderItem={renderImageItem}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={onScroll}
          scrollEventThrottle={16}
        />
        {renderPagination()}
        {renderImageCounter()}
      </View>

      {/* Brand and Title */}
      <View style={styles.infoContainer}>
        <Text style={styles.brandName}>{brand.name}</Text>
        <Text style={styles.productTitle}>{name}</Text>

        {/* Ratings and Loves */}
        <View style={styles.ratingsContainer}>
          <View style={styles.ratingWrapper}>
            {[1, 2, 3, 4, 5].map((_, index) => (
              <FontAwesome
                key={index}
                name="star"
                size={16}
                color={index < rating ? "#FFD700" : "#ddd"}
                style={styles.starIcon}
              />
            ))}
            <Text style={styles.reviewCount}>{reviews} reviews</Text>
            <View style={styles.reviewDivider} />
            <TouchableOpacity onPress={onToggleFavorite}>
              <FontAwesome
                name="heart"
                size={16}
                color={isFavorite ? "#FF4500" : "#000"}
                style={styles.loveIcon}
              />
            </TouchableOpacity>
            <Text style={styles.lovesCount}>{loves}</Text>
          </View>
        </View>

        {/* Price */}
        <Text style={styles.price}>{formatPrice(price)}</Text>
      </View>

      {/* Shipping Options */}
      <View style={styles.optionsContainer}>
        <View style={styles.optionRow}>
          <View style={styles.optionItem}>
            <FontAwesome name="truck" size={16} color="#666" />
            <Text style={styles.optionText}>
              Miễn phí vận chuyển từ {formatPrice(0)}
            </Text>
          </View>
          <View style={styles.optionDivider} />
          <View style={styles.optionItem}>
            <MaterialIcons name="restart-alt" size={16} color="#666" />
            <Text style={styles.optionText}>Đổi trả trong 7 ngày</Text>
          </View>
        </View>
      </View>

      {/* Location */}
      <TouchableOpacity
        style={styles.locationContainer}
        onPress={() => setModalVisible(true)}
      >
        <Ionicons name="location-outline" size={24} color="#000" />
        <View style={styles.locationTextContainer}>
          <Text style={styles.locationText}>
            Địa chỉ:{" "}
            <Text style={styles.locationHighlight}>
              {shippingAddress.provinceName
                ? `${shippingAddress.wardName}, ${shippingAddress.districtName}, ${shippingAddress.provinceName}`
                : "Chọn địa chỉ giao hàng"}
            </Text>
          </Text>
          <Ionicons name="chevron-forward" size={20} color="#000" />
        </View>
      </TouchableOpacity>

      {/* Delivery Info */}
      {shippingAddress.provinceId && (
        <View style={styles.deliveryContainer}>
          <View style={styles.deliveryRow}>
            <View style={styles.deliveryItem}>
              <Text style={styles.deliveryLabel}>Giao hàng tiêu chuẩn:</Text>
              <View style={styles.priceRow}>
                <Text style={styles.deliveryPrice}>
                  {shippingFee.toLocaleString("vi-VN")}đ
                </Text>
              </View>
            </View>
            <View style={styles.deliveryDivider} />
            <View style={styles.deliveryItem}>
              <Text style={styles.deliveryLabel}>Thời gian dự kiến:</Text>
              <Text style={styles.deliveryValue}>{deliveryTime}</Text>
            </View>
          </View>
        </View>
      )}

      <AddressSelectionModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSelect={handleAddressSelect}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  shareButton: {
    padding: 8,
  },
  imageContainer: {
    position: "relative",
    height: 300, // Reduced from 350
    backgroundColor: "#fff",
  },
  productImage: {
    height: 300, // Reduced from 350
  },
  pagination: {
    position: "absolute",
    bottom: 16,
    flexDirection: "row",
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    marginHorizontal: 4,
  },
  paginationDotActive: {
    backgroundColor: "#fff",
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  infoContainer: {
    padding: 16,
    backgroundColor: "#fff",
  },
  brandName: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  productTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
    lineHeight: 24,
  },
  ratingsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  ratingWrapper: {
    flexDirection: "row",
    alignItems: "center",
  },
  starIcon: {
    marginRight: 2,
  },
  reviewCount: {
    marginLeft: 8,
    color: "#666",
    fontSize: 14,
  },
  lovesCount: {
    color: "#666",
    fontSize: 14,
  },
  price: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FF4500",
    marginVertical: 12,
  },
  optionsContainer: {
    marginHorizontal: 15,
    marginTop: 12,
    marginBottom: 15,
    padding: 8,
    backgroundColor: "#f8f8f8",
    borderRadius: 8,
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    height: 32, // Thêm chiều cao cố định
  },
  optionItem: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 4,
  },
  optionText: {
    flex: 1, // Để text có thể wrap nếu quá dài
    fontSize: 13,
    color: "#666",
    marginLeft: 8,
  },
  optionDivider: {
    width: 1,
    alignSelf: "stretch", // Để divider kéo dài theo chiều cao của container
    backgroundColor: "#ddd",
    marginHorizontal: 8,
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  locationTextContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginLeft: 15,
  },
  locationText: {
    fontSize: 15,
  },
  locationHighlight: {
    color: "#0088CC",
  },
  deliveryContainer: {
    padding: 15,
    backgroundColor: "#f8f8f8",
    marginTop: 15,
  },
  deliveryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  deliveryItem: {
    flex: 1,
  },
  deliveryDivider: {
    width: 1,
    height: "100%",
    backgroundColor: "#ddd",
    marginHorizontal: 15,
  },
  deliveryLabel: {
    fontSize: 13,
    color: "#666",
    marginBottom: 4,
  },
  deliveryValue: {
    fontSize: 15,
    fontWeight: "500",
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  deliveryPrice: {
    fontSize: 15,
    color: "#FF4500",
    fontWeight: "500",
  },
  deliveryFree: {
    fontSize: 15,
    color: "#0088CC",
    fontWeight: "500",
  },
  workingTime: {
    fontSize: 13,
    color: "#666",
    marginTop: 8,
    fontStyle: "italic",
  },
  imageCounter: {
    position: "absolute",
    bottom: 16,
    right: 16,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
  },
  imageCounterText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "500",
  },
  reviewDivider: {
    width: 1,
    height: 12,
    backgroundColor: "#ddd",
    marginHorizontal: 8,
  },
  loveIcon: {
    marginRight: 4,
  },
});
export default ProductOverview;
