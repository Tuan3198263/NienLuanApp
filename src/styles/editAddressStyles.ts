import { StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export const editAddressStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f8f8",
  },
  scrollView: {
    flex: 1,
  },
  formContainer: {
    padding: 16,
  },
  formCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  infoTextContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  infoText: {
    fontSize: 14,
    color: "#666",
    marginLeft: 8,
    textAlign: "center",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#333",
    flexDirection: "row",
    alignItems: "center",
  },
  input: {
    marginBottom: 15,
    backgroundColor: "white",
  },
  selectorField: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 5,
    marginBottom: 15,
    padding: 6,
    backgroundColor: "white",
    height: 56,
  },
  selectorIconContainer: {
    justifyContent: "center",
    alignItems: "center",
    width: 40,
  },
  selectorTextContainer: {
    flex: 1,
    justifyContent: "center",
  },
  selectorLabel: {
    fontSize: 12,
    color: "#666",
  },
  disabledSelector: {
    borderColor: "#eee",
    backgroundColor: "#fafafa",
  },
  placeholderText: {
    color: "#999",
    fontSize: 14,
  },
  disabledText: {
    color: "#ccc",
    fontSize: 14,
  },
  selectedText: {
    color: "#333",
    fontSize: 14,
    fontWeight: "500",
  },
  errorBorder: {
    borderColor: "#cf6679",
  },
  saveButton: {
    marginTop: 20,
    marginBottom: 30,
    backgroundColor: "#ff6b81",
    paddingVertical: 8,
    borderRadius: 8,
    elevation: 3,
  },
  saveButtonLabel: {
    fontSize: 16,
    fontWeight: "600",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  loadingText: {
    marginTop: 10,
    color: "#666",
  },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: "white",
    height: height * 0.7, // Fixed height
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: "hidden",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    flex: 1,
    textAlign: "center",
  },
  closeButton: {
    padding: 4,
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  headerRightPlaceholder: {
    width: 32,
  },
  searchContainer: {
    padding: 12,
    backgroundColor: "#fff",
  },
  searchInput: {
    backgroundColor: "#fff",
    fontSize: 14,
  },
  modalContent: {
    flex: 1,
    backgroundColor: "#f8f8f8",
  },
  modalScrollView: {
    flex: 1,
  },
  modalItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  modalItemText: {
    fontSize: 15,
    color: "#333",
    flex: 1,
  },
  modalLoadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  noDataContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
    backgroundColor: "#fff",
  },
  noDataText: {
    color: "#999",
    fontSize: 14,
    marginTop: 12,
    textAlign: "center",
  },
  modalScrollPadding: {
    height: 20,
  },
  searchInput: {
    margin: 8,
    backgroundColor: "#fff",
  },
});