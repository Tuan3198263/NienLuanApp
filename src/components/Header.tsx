import React, { useState, useEffect, memo, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
  InteractionManager,
} from "react-native";
import { Link, useRouter } from "expo-router";
import { Ionicons, FontAwesome5, Feather } from "@expo/vector-icons";
import { useSelector, useDispatch } from "react-redux";
import { fetchAvatar } from "../redux/slices/authSlice";
import { RootState } from "../redux/store";

// Memoized logo component
const Logo = memo(() => (
  <View style={styles.logoContainer}>
    <Text style={styles.logoText}>GL</Text>
    <Text style={styles.logoPink}>O</Text>
    <Text style={styles.logoText}>WN</Text>
  </View>
));

const Header = ({ showBackButton = false }) => {
  const router = useRouter();
  const dispatch = useDispatch();

  const isLoggedIn = useSelector((state: RootState) => !!state.auth.token);
  const user = useSelector((state: RootState) => state.auth.user);
  const avatarUrl = user?.avatar;

  useEffect(() => {
    let isMounted = true;

    if (isLoggedIn) {
      dispatch(fetchAvatar() as any).catch((error) => {
        if (isMounted) {
          console.error("Failed to fetch avatar:", error);
        }
      });
    }

    return () => {
      isMounted = false;
    };
  }, [isLoggedIn, dispatch]);

  const goToCart = useCallback(() => {
    if (isLoggedIn) {
      InteractionManager.runAfterInteractions(() => {
        router.navigate("/cart");
      });
    } else {
      Alert.alert("Thông báo", "Vui lòng đăng nhập");
      InteractionManager.runAfterInteractions(() => {
        router.navigate({
          pathname: "/login",
          params: { redirect: "/cart" },
        });
      });
    }
  }, [isLoggedIn, router]);

  const goToSearch = useCallback(() => {
    InteractionManager.runAfterInteractions(() => {
      router.navigate("/search");
    });
  }, [router]);

  const handleBackPress = useCallback(() => {
    InteractionManager.runAfterInteractions(() => {
      router.back();
    });
  }, [router]);

  return (
    <View style={styles.header}>
      <View style={styles.leftContainer}>
        {showBackButton && (
          <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
        )}
        <TouchableOpacity onPress={() => router.replace("/")}>
          <Logo />
        </TouchableOpacity>
      </View>

      <View style={styles.rightContainer}>
        {!showBackButton && (
          <TouchableOpacity style={styles.iconButton} onPress={goToSearch}>
            <Ionicons name="search" size={24} color="#000" />
          </TouchableOpacity>
        )}

        {isLoggedIn && (
          <View>
            {avatarUrl ? (
              <Image
                source={{ uri: avatarUrl }}
                style={styles.avatar}
                resizeMode="cover"
              />
            ) : (
              <FontAwesome5 name="user-circle" size={24} color="#000" />
            )}
          </View>
        )}

        <TouchableOpacity style={styles.cartButton} onPress={goToCart}>
          <Feather name="shopping-bag" size={24} color="black" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  rightContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  iconButton: {
    padding: 5,
  },
  cartButton: {
    padding: 5,
  },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
  },
  backButton: {
    padding: 5,
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  logoText: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#000",
  },
  logoPink: {
    fontSize: 22,
    fontWeight: "bold",
    color: "pink",
  },
  leftContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
});

export default memo(Header);
