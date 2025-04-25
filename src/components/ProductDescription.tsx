import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  useWindowDimensions,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import RenderHtml, { RenderHTMLProps } from "react-native-render-html";
import {
  TRenderEngineProvider,
  RenderHTMLConfigProvider,
} from "react-native-render-html";

interface HtmlContent {
  html: string;
  baseStyle: {
    fontSize: number;
    lineHeight: number;
    color: string;
  };
}

interface ProductDescriptionProps {
  description: HtmlContent;
  usage: HtmlContent;
  ingredients: HtmlContent;
}

const ProductDescription: React.FC<ProductDescriptionProps> = ({
  description,
  usage,
  ingredients,
}) => {
  const { width } = useWindowDimensions();
  const [modalVisible, setModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState("description");

  const renderHtmlContent = (content: HtmlContent) => (
    <TRenderEngineProvider>
      <RenderHTMLConfigProvider>
        <RenderHtml
          contentWidth={width}
          source={{ html: content.html }}
          baseStyle={content.baseStyle}
        />
      </RenderHTMLConfigProvider>
    </TRenderEngineProvider>
  );

  return (
    <View style={styles.container}>
      <View style={styles.mainContent}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>Thông tin sản phẩm</Text>
          <TouchableOpacity
            style={styles.moreInfoButton}
            onPress={() => setModalVisible(true)}
          >
            <Text style={styles.moreInfoText}>Chi tiết</Text>
            <MaterialIcons name="chevron-right" size={20} color="#0088CC" />
          </TouchableOpacity>
        </View>
        <View style={styles.description}>{renderHtmlContent(description)}</View>
      </View>

      {/* Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Chi tiết sản phẩm</Text>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.closeButton}
              >
                <MaterialIcons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            {/* Tabs */}
            <View style={styles.tabContainer}>
              {["description", "usage", "ingredients"].map((tab) => (
                <TouchableOpacity
                  key={tab}
                  style={[styles.tab, activeTab === tab && styles.activeTab]}
                  onPress={() => setActiveTab(tab)}
                >
                  <Text
                    style={[
                      styles.tabText,
                      activeTab === tab && styles.activeTabText,
                    ]}
                  >
                    {tab === "description"
                      ? "Mô tả"
                      : tab === "usage"
                      ? "Cách dùng"
                      : "Thành phần"}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Content */}
            <ScrollView style={styles.modalBody}>
              {activeTab === "description" && renderHtmlContent(description)}
              {activeTab === "usage" && renderHtmlContent(usage)}
              {activeTab === "ingredients" && renderHtmlContent(ingredients)}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    paddingVertical: 15,
  },
  mainContent: {
    paddingHorizontal: 15,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    color: "#666",
  },
  moreInfoButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  moreInfoText: {
    color: "#0088CC",
    fontSize: 14,
    marginRight: 2,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    flex: 1,
    backgroundColor: "#fff",
    marginTop: 50,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  closeButton: {
    padding: 4,
  },
  tabContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingHorizontal: 12,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: "#0088CC",
  },
  tabText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
  activeTabText: {
    color: "#0088CC",
    fontWeight: "500",
  },
  modalBody: {
    flex: 1,
    padding: 16,
  },
  contentText: {
    fontSize: 15,
    lineHeight: 24,
    color: "#333",
  },
});

export default ProductDescription;
