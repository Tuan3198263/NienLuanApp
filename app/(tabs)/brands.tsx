import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Platform,
} from "react-native";
import { useState, useEffect, useRef } from "react";
import { brandApi } from "../../src/api/brandApi";
import { useRouter } from "expo-router";

export default function BrandDirectory() {
  const [brands, setBrands] = useState<
    Record<string, { name: string; _id: string }[]>
  >({});
  const [alphabetIndex, setAlphabetIndex] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollViewRef = useRef<ScrollView>(null);
  const sectionRefs = useRef<Record<string, number>>({});
  const router = useRouter();

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        setLoading(true);
        const response = await brandApi.getAllBrandNames();

        // Tổ chức thương hiệu theo chữ cái đầu tiên
        const brandsByLetter: Record<string, { name: string; _id: string }[]> =
          {};

        response.data.forEach((brand) => {
          const firstLetter = brand.name.charAt(0).toUpperCase();
          if (!brandsByLetter[firstLetter]) {
            brandsByLetter[firstLetter] = [];
          }
          brandsByLetter[firstLetter].push({
            name: brand.name,
            _id: brand._id,
          });
        });

        // Sắp xếp thương hiệu theo từng chữ cái
        Object.keys(brandsByLetter).forEach((letter) => {
          brandsByLetter[letter].sort((a, b) => a.name.localeCompare(b.name));
        });

        // Lấy chữ cái đầu tiên và sắp xếp
        const letters = Object.keys(brandsByLetter).sort();

        setBrands(brandsByLetter);
        setAlphabetIndex(letters);
        setLoading(false);
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu thương hiệu:", error);
        setLoading(false);
      }
    };

    fetchBrands();
  }, []);

  // Navigate to brand detail page
  const handleBrandPress = (brandId: string) => {
    router.push(`/brand/${brandId}`);
  };

  const scrollToSection = (letter: string) => {
    const yOffset = sectionRefs.current[letter] || 0;
    scrollViewRef.current?.scrollTo({ y: yOffset, animated: true });
  };

  const measureSectionLayout = (letter: string, y: number) => {
    sectionRefs.current[letter] = y;
  };

  return (
    <SafeAreaView style={styles.container}>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0000ff" />
          <Text style={styles.loadingText}>Đang tải thương hiệu...</Text>
        </View>
      ) : (
        <>
          {/* Alphabet Index */}
          <View style={styles.alphabetContainer}>
            {alphabetIndex.map((letter) => (
              <TouchableOpacity
                key={letter}
                style={styles.letterButton}
                onPress={() => scrollToSection(letter)}
              >
                <Text style={styles.letterText}>{letter}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.divider} />

          {/* Brand List */}
          <ScrollView
            ref={scrollViewRef}
            style={styles.brandList}
            showsVerticalScrollIndicator={false}
          >
            {Object.entries(brands).map(([letter, brandItems]) => (
              <View
                key={letter}
                style={styles.section}
                onLayout={(event) => {
                  const { y } = event.nativeEvent.layout;
                  measureSectionLayout(letter, y);
                }}
              >
                <Text style={styles.sectionHeader}>{letter}</Text>

                <View style={styles.brandListContainer}>
                  {brandItems.map((brand, index) => (
                    <TouchableOpacity
                      key={index}
                      style={styles.brandItem}
                      activeOpacity={0.7}
                      onPress={() => handleBrandPress(brand._id)}
                    >
                      <Text style={styles.brandText}>{brand.name}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <View style={styles.sectionDivider} />
              </View>
            ))}
            <View style={styles.bottomPadding} />
          </ScrollView>
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: Platform.OS === "android" ? 10 : 0,
  },
  alphabetContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 16,
    paddingBottom: 12,
    paddingTop: 15,
  },
  letterButton: {
    width: 28,
    height: 28,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
    marginBottom: 8,
    borderRadius: 14,
    backgroundColor: "#f0f0f0",
  },
  letterText: {
    fontSize: 16,
    fontWeight: "500",
  },
  divider: {
    height: 1,
    backgroundColor: "#E0E0E0",
    marginHorizontal: 16,
    marginBottom: 8,
  },
  brandList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  section: {
    marginBottom: 16,
  },
  sectionHeader: {
    fontSize: 22,
    fontWeight: "bold",
    marginTop: 16,
    marginBottom: 12,
    color: "#333",
  },
  brandListContainer: {
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    overflow: "hidden",
    marginBottom: 8,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  brandItem: {
    paddingVertical: 12,
    paddingLeft: 20, // Tăng khoảng cách lề trái
    paddingRight: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eeeeee",
  },
  brandText: {
    fontSize: 15,
    color: "#333",
    fontWeight: "500",
  },
  sectionDivider: {
    height: 1,
    backgroundColor: "#E0E0E0",
    marginTop: 8,
  },
  bottomPadding: {
    height: 30,
  },
});
