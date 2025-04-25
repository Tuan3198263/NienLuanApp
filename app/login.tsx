import React, { useState, useEffect, useCallback, memo } from "react";
import {
  View,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  StyleSheet,
} from "react-native";
import { Text, TextInput, Button } from "react-native-paper";
import { FontAwesome } from "@expo/vector-icons";
import { Stack, Link, useLocalSearchParams, useRouter } from "expo-router";
import { useDispatch, useSelector } from "react-redux";
import { login } from "../src/redux/slices/authSlice";
import { AppDispatch, RootState } from "../src/redux/store";
import { showToast } from "../src/utils/toast";
import { loginStyles } from "../src/styles/loginStyles";

// Memoize form components for better performance
const LogoComponent = memo(() => (
  <View style={loginStyles.logoContainer}>
    <FontAwesome name="shopping-bag" size={40} color="#ff6b81" />
    <Text style={loginStyles.logoText}>Glown</Text>
  </View>
));

const SocialButtons = memo(() => (
  <>
    <Button
      mode="outlined"
      icon="google"
      onPress={() => Alert.alert("Thông báo", "Tính năng đang phát triển")}
      style={loginStyles.socialButton}
    >
      Đăng nhập với Google
    </Button>

    <Button
      mode="outlined"
      icon="facebook"
      onPress={() => Alert.alert("Thông báo", "Tính năng đang phát triển")}
      style={loginStyles.socialButton}
    >
      Đăng nhập với Facebook
    </Button>
  </>
));

// Định nghĩa component chính
function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isMounted, setIsMounted] = useState(true);

  // Sử dụng AppDispatch
  const dispatch = useDispatch<AppDispatch>();
  const params = useLocalSearchParams();
  const router = useRouter();
  const redirectTo = (params.redirect as string) || "/";

  // Sử dụng RootState thay vì any
  const { isLoading, error, token } = useSelector(
    (state: RootState) => state.auth
  );

  // Đơn giản hóa useEffect - không sử dụng trackRenderPerformance
  useEffect(() => {
    setIsMounted(true);
    return () => {
      setIsMounted(false);
    };
  }, []);

  // Kiểm tra nếu đã đăng nhập thì chuyển hướng
  useEffect(() => {
    if (token && isMounted) {
      router.replace(redirectTo); // chuyển hướng về trang trước
    }
  }, [token, redirectTo, router, isMounted]);

  // Xác thực biểu mẫu
  const validateForm = useCallback(() => {
    let isValid = true;

    // Kiểm tra email
    if (!email.trim()) {
      setEmailError("Vui lòng nhập email");
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError("Email không hợp lệ");
      isValid = false;
    } else {
      setEmailError("");
    }

    // Kiểm tra mật khẩu
    if (!password) {
      setPasswordError("Vui lòng nhập mật khẩu");
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError("Mật khẩu phải có ít nhất 6 ký tự");
      isValid = false;
    } else {
      setPasswordError("");
    }

    return isValid;
  }, [email, password]);

  // Xử lý đăng nhập
  const handleLogin = useCallback(async () => {
    if (!validateForm() || !isMounted) return;

    try {
      const resultAction = await dispatch(login({ email, password }));

      if (login.fulfilled.match(resultAction) && isMounted) {
        showToast.success("Đăng nhập thành công!");
      } else if (login.rejected.match(resultAction) && isMounted) {
        Alert.alert(
          "Đăng nhập thất bại",
          (resultAction.payload as string) ||
            "Vui lòng kiểm tra lại thông tin đăng nhập"
        );
      }
    } catch (err) {
      if (isMounted) {
        Alert.alert(
          "Lỗi",
          "Đã xảy ra lỗi khi đăng nhập. Vui lòng thử lại sau."
        );
      }
    }
  }, [dispatch, email, password, validateForm, isMounted]);

  return (
    <>
      <Stack.Screen
        options={{
          title: "Đăng nhập",
          headerBackVisible: true,
          headerBackTitle: "Quay lại",
          animationDuration: 200,
        }}
      />

      <ScrollView
        style={loginStyles.scrollView}
        contentContainerStyle={loginStyles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={loginStyles.container}
        >
          <LogoComponent />

          <View style={loginStyles.formContainer}>
            <Text style={loginStyles.welcomeText}>Chào mừng trở lại!</Text>
            <Text style={loginStyles.subtitleText}>Đăng nhập để tiếp tục</Text>

            {/* Hiển thị lỗi nếu có */}
            {error && (
              <View style={loginStyles.errorContainer}>
                <Text style={loginStyles.errorText}>{error}</Text>
              </View>
            )}

            {/* Trường Email */}
            <TextInput
              label="Email"
              value={email}
              onChangeText={setEmail}
              mode="outlined"
              keyboardType="email-address"
              autoCapitalize="none"
              style={loginStyles.input}
              error={!!emailError}
            />
            {emailError ? (
              <Text style={loginStyles.fieldError}>{emailError}</Text>
            ) : null}

            {/* Trường Mật khẩu */}
            <TextInput
              label="Mật khẩu"
              value={password}
              onChangeText={setPassword}
              mode="outlined"
              secureTextEntry={!showPassword}
              style={loginStyles.input}
              right={
                <TextInput.Icon
                  icon={showPassword ? "eye-off" : "eye"}
                  onPress={() => setShowPassword(!showPassword)}
                />
              }
              error={!!passwordError}
            />
            {passwordError ? (
              <Text style={loginStyles.fieldError}>{passwordError}</Text>
            ) : null}

            {/* Quên mật khẩu */}
            <TouchableOpacity style={loginStyles.forgotPasswordContainer}>
              <Text style={loginStyles.forgotPasswordText}>Quên mật khẩu?</Text>
            </TouchableOpacity>

            {/* Nút đăng nhập */}
            <Button
              mode="contained"
              onPress={handleLogin}
              style={loginStyles.loginButton}
              loading={isLoading}
              disabled={isLoading}
            >
              {isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
            </Button>

            {/* Đường kẻ hoặc */}
            <View style={loginStyles.orContainer}>
              <View style={loginStyles.line} />
              <Text style={loginStyles.orText}>HOẶC</Text>
              <View style={loginStyles.line} />
            </View>

            <SocialButtons />

            {/* Đăng ký tài khoản */}
            <View style={loginStyles.registerContainer}>
              <Text style={loginStyles.registerText}>Chưa có tài khoản? </Text>
              <TouchableOpacity onPress={() => router.replace("/signup")}>
                <Text style={loginStyles.registerLink}>Đăng ký</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </ScrollView>
    </>
  );
}

export default LoginScreen;
