import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "white",
    padding: 12,
    marginBottom: 8,
  },
  locationLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  locationTextContainer: {
    marginLeft: 8,
    flex: 1,
  },
  locationTitle: {
    fontWeight: "500",
    fontSize: 14,
  },
  locationAddress: {
    color: "#666",
    fontSize: 12,
    marginTop: 2,
  },
  cartItem: {
    flexDirection: "row",
    backgroundColor: "white",
    padding: 16,
    marginBottom: 8,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
  },
  itemDetails: {
    flex: 1,
  },
  itemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  closeButton: {
    padding: 4,
    marginLeft: 'auto', // Đảm bảo nút luôn nằm bên phải
    alignSelf: 'flex-start', // Căn nút theo đầu trên
  },
  itemName: {
    fontSize: 14,
    lineHeight: 20,
    flex: 1,
    paddingRight: 8, // Tạo khoảng cách với nút close
  },
  itemDiscount: {
    color: "#666",
    fontSize: 12,
    marginTop: 2,
    textDecorationLine: "line-through",
  },
  itemFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ff3366",
  },
  quantityControl: {
    flexDirection: "row",
    alignItems: "center",
  },
  quantityButton: {
    width: 24,
    height: 24,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  quantityButtonDisabled: {
    opacity: 0.5,
  },
  quantityButtonText: {
    fontSize: 16,
    color: "#333",
  },
  quantityText: {
    marginHorizontal: 8,
    fontSize: 14,
    minWidth: 20,
    textAlign: "center",
  },
  optionContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "white",
    padding: 12,
    marginBottom: 1,
  },
  optionLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  optionText: {
    marginLeft: 8,
    fontSize: 14,
  },
  optionRight: {
    alignItems: 'flex-end', // Change from row to column alignment
  },
  deliveryDate: {
    fontSize: 13,
    color: "#666",
    marginTop: 4, // Add margin top for spacing
  },
  shippingDiscountNote: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff8f8',
    padding: 12,
    marginBottom: 8,
  },
  shippingDiscountText: {
    fontSize: 13,
    color: '#ff3366',
    marginLeft: 8,
  },
  optionRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  deliveryDate: {
    fontSize: 13,
    color: "#666",
    marginRight: 4,
  },
  freeShipping: {
    color: "#ff3366",
  },
  paymentMethod: {
    fontSize: 13,
    color: "#666",
    marginRight: 4,
  },
  summaryContainer: {
    backgroundColor: "white",
    padding: 12,
    marginTop: 8,
    marginBottom: 120, // Tăng từ 80px lên 120px để tạo thêm không gian
    paddingBottom: 16, // Thêm padding bottom để nội dung không sát với viền dưới
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 14,
    color: "#666",
  },
  summaryValue: {
    fontSize: 14,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  discountValue: {
    fontSize: 14,
    color: "#ff3366",
  },
  checkoutContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: "#eee",
    padding: 12,
    paddingBottom: 16, // Thêm padding bottom để tăng khoảng cách với đáy màn hình
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 5, // Tạo hiệu ứng đổ bóng để phân biệt với nội dung phía trên
  },
  totalContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  totalText: {
    fontSize: 14,
    color: "#666",
  },
  totalRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  totalAmount: {
    fontSize: 16,
    fontWeight: "bold",
    marginRight: 4,
  },
  checkoutButton: {
    backgroundColor: "#ff3366",
    borderRadius: 4,
    padding: 12,
    alignItems: "center",
  },
  checkoutButtonDisabled: {
    backgroundColor: "#cccccc",
  },
  checkoutButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
  },
  checkoutButtonTextDisabled: {
    color: "#666666",
  },
  emptyCart: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: 'white',
    marginVertical: 8,
    borderRadius: 8,
  },
  emptyCartIcon: {
    marginBottom: 16,
  },
  emptyCartText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyCartSubText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    alignItems: "center",
    minWidth: 280,
    maxWidth: '85%',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  confirmModalContent: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    alignItems: "center",
    minWidth: 300,
    maxWidth: '90%',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 10,
    marginBottom: 10,
    color: "#333",
    textAlign: "center",
  },
  modalText: {
    marginTop: 10,
    fontSize: 15,
    color: "#333",
    textAlign: "center",
    marginBottom: 15,
    lineHeight: 22,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: '100%',
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginBottom: 5,
  },
  detailLabel: {
    fontSize: 14,
    color: "#666",
    flex: 1,
  },
  detailValue: {
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
    textAlign: "right",
  },
  detailLabelBold: {
    fontSize: 15,
    color: "#333",
    fontWeight: "bold",
    flex: 1,
  },
  detailValueBold: {
    fontSize: 16,
    color: "#ff3366",
    fontWeight: "bold",
    textAlign: "right",
  },
  totalRow: {
    marginTop: 5,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 15,
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 6,
    minWidth: 120,
    alignItems: "center",
  },
  confirmButton: {
    backgroundColor: "#ff3366",
  },
  confirmButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
  },
  cancelButton: {
    backgroundColor: "#f2f2f2",
  },
  cancelButtonText: {
    color: "#666",
    fontSize: 16,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
    backgroundColor: 'white',
    marginVertical: 8,
    borderRadius: 8,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 10,
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 6,
    minWidth: 120,
    alignItems: "center",
  },
  confirmButton: {
    backgroundColor: "#FF4500",
  },
  confirmButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
  },
  cancelButton: {
    backgroundColor: "#f2f2f2",
  },
  cancelButtonText: {
    color: "#666",
    fontSize: 16,
  },
});
