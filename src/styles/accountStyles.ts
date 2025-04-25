import { StyleSheet } from 'react-native';

export const accountStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f8f8",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileHeader: {
    alignItems: "center",
    paddingVertical: 25,
    paddingHorizontal: 16,
    backgroundColor: "#fff",
  },
  avatarTouchable: {
    marginVertical: 10,
  },
  avatarContainer: {
    position: 'relative',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#fff',
    borderWidth: 3,
    borderColor: "#ff6b81",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    padding: 5, // Add padding for spacing
  },
  avatarPlaceholderContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#f8f8f8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 60,
  },
  avatarLoading: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    borderRadius: 60,
    backgroundColor: '#f8f8f8',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 5,
    borderColor: '#e0e0e0', // Light grey border
  },
  username: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 12,
  },
  memberStatus: {
    fontSize: 12,
    color: "#888",
    marginTop: 2,
  },
  emailStatus: {
    fontSize: 13,
    color: "#f5a623",
    marginTop: 10,
  },
  loginPrompt: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15,
    paddingVertical: 5,
  },
  loginPromptText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ff6b81',
    marginRight: 8,
  },
  orderHistorySection: {
    backgroundColor: "#fff",
    marginTop: 10,
    paddingVertical: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "bold",
  },
  viewAllButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  viewAllText: {
    fontSize: 13,
    color: "#666",
  },
  arrowRight: {
    fontSize: 16,
    color: "#666",
    marginLeft: 4,
  },
  orderStatusContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
  orderStatusItem: {
    alignItems: "center",
    width: "25%",
  },
  orderStatusText: {
    fontSize: 11,
    textAlign: "center",
    marginTop: 6,
    color: "#333",
  },
  menuContainer: {
    backgroundColor: "#fff",
    marginTop: 10,
  },
  secondaryMenuContainer: {
    marginBottom: 5,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  menuIconContainer: {
    width: 24,
    alignItems: "center",
    marginRight: 12,
  },
  menuTextContainer: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 14,
    color: "#333",
  },
  menuSubtitle: {
    fontSize: 11,
    color: "#888",
    marginTop: 2,
  },
  menuArrow: {
    fontSize: 18,
    color: "#ccc",
  },
  badge: {
    backgroundColor: "#ff6b81",
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginRight: 8,
  },
  badgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
  },
  socialLinks: {
    flexDirection: "row",
    justifyContent: "center",
    paddingVertical: 20,
    backgroundColor: "#fff",
    marginTop: 10,
  },
  socialButton: {
    marginHorizontal: 10,
  },
  socialIcon: {
    width: 24,
    height: 24,
  },
  appInfoContainer: {
    alignItems: "center",
    paddingVertical: 20,
    marginBottom: 0,
  },
  appVersion: {
    fontSize: 14,
    color: "#999",
    marginBottom: 5,
  },
  copyright: {
    fontSize: 12,
    color: "#999",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    marginTop: 10,
    marginBottom: 20,
    paddingVertical: 15,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#f0f0f0",
  },
  logoutText: {
    fontSize: 14,
    marginLeft: 8,
    color: "#333",
  }
});
