import React from "react";
import { View, Text, StyleSheet, StatusBar } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { commonStyles } from "../src/styles/commonStyles";
import { Stack } from "expo-router";

const PaymentMethodScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <Stack.Screen
        options={{
          title: "Phương thức thanh toán",
          headerTitleAlign: "center",
        }}
      />
      <View style={commonStyles.smallHeaderContainer}>
        <Text style={commonStyles.smallHeaderText}>Phương thức thanh toán</Text>
      </View>

      <View style={styles.paymentCard}>
        <View style={styles.methodContainer}>
          <View style={styles.iconContainer}>
            <MaterialCommunityIcons name="cash" size={32} color="#fff" />
          </View>
          <View style={styles.methodInfo}>
            <Text style={styles.methodTitle}>
              Thanh toán khi nhận hàng (COD)
            </Text>
            <Text style={styles.methodDescription}>
              Thanh toán bằng tiền mặt khi nhận được hàng
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.infoContainer}>
          <Text style={styles.infoTitle}>Thông tin thanh toán:</Text>
          {[
            "Thanh toán khi nhận hàng",
            "Kiểm tra hàng trước khi thanh toán",
            "Giữ hóa đơn để đối chiếu khi cần",
          ].map((text, index) => (
            <View key={index} style={styles.infoItem}>
              <MaterialCommunityIcons
                name="check-circle"
                size={20}
                color="#4caf50"
              />
              <Text style={styles.infoText}>{text}</Text>
            </View>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  headerText: {
    fontSize: 20,
    fontWeight: "700",
    color: "#333",
    marginLeft: 16,
  },
  paymentCard: {
    margin: 16,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: "#f0f0f0",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  methodContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: "#3b82f6",
    justifyContent: "center",
    alignItems: "center",
  },
  methodInfo: {
    flex: 1,
    marginLeft: 16,
  },
  methodTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
    marginBottom: 4,
  },
  methodDescription: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
  divider: {
    height: 1,
    backgroundColor: "#f0f0f0",
    marginVertical: 20,
  },
  infoContainer: {
    paddingTop: 8,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  infoText: {
    fontSize: 15,
    color: "#555",
    marginLeft: 12,
    flex: 1,
    lineHeight: 22,
  },
});

export default PaymentMethodScreen;
