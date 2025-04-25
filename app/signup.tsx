import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Text, TextInput, Button } from 'react-native-paper';
import { FontAwesome } from '@expo/vector-icons';
import { Stack, Link, useRouter } from 'expo-router';
import Toast from 'react-native-toast-message';
import { showToast } from '../src/utils/toast';
import axios from 'axios';
import { authApi } from '../src/api/authApi';
import { signupStyles } from '../src/styles/signupStyles';

export default function SignupScreen() {
  const [loading, setLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(true);
  const router = useRouter(); // Use Expo Router directly
  
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
  });
  
  const [errors, setErrors] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  // Ensure component is mounted before updates
  useEffect(() => {
    setIsMounted(true);
    
    return () => {
      setIsMounted(false);
    };
  }, []);

  // Cập nhật giá trị form
  const handleChange = useCallback((field: string, value: string) => {
    if (!isMounted) return;
    
    setForm(prev => ({ ...prev, [field]: value }));
    // Xóa lỗi khi người dùng bắt đầu sửa
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  }, [errors, isMounted]);

  // Xác thực form
  const validateForm = () => {
    const newErrors = {
      fullName: '',
      email: '',
      phone: '',
      password: '',
    };
    let isValid = true;

    // Kiểm tra họ tên (không chứa số hoặc ký tự đặc biệt)
    const nameRegex = /^[A-Za-zÀ-Ỹà-ỹ\s]{1,50}$/;
    if (!form.fullName.trim()) {
      newErrors.fullName = 'Vui lòng nhập họ tên';
      isValid = false;
    } else if (!nameRegex.test(form.fullName)) {
      newErrors.fullName = 'Tên không được chứa số hoặc ký tự đặc biệt, tối đa 50 ký tự';
      isValid = false;
    }

    // Kiểm tra email
    if (!form.email.trim()) {
      newErrors.email = 'Vui lòng nhập email';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      newErrors.email = 'Email không hợp lệ';
      isValid = false;
    }

    // Kiểm tra số điện thoại Việt Nam
    const phoneRegex = /^(0[2-9]\d{8})$/;
    if (!form.phone.trim()) {
      newErrors.phone = 'Vui lòng nhập số điện thoại';
      isValid = false;
    } else if (!phoneRegex.test(form.phone.trim())) {
      newErrors.phone = 'Số điện thoại không hợp lệ';
      isValid = false;
    }

    // Kiểm tra mật khẩu (tối thiểu 6 ký tự)
    if (!form.password) {
      newErrors.password = 'Vui lòng nhập mật khẩu';
      isValid = false;
    } else if (form.password.length < 6) {
      newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  // Xử lý đăng ký with proper cleanup
  const handleSubmit = useCallback(async () => {
    if (!termsAccepted || !isMounted) {
      showToast.error('Vui lòng đồng ý với điều khoản sử dụng');
      return;
    }

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      // Sử dụng authApi thay vì axios trực tiếp
      const response = await authApi.register({
        fullName: form.fullName,
        email: form.email,
        phone: form.phone,
        password: form.password
      });
      
      if (isMounted) {
        showToast.success('Đăng ký thành công');
        
        // Use router directly from Expo Router
        setTimeout(() => {
          if (isMounted) {
            router.replace('/login');
          }
        }, 1000); // Giảm thời gian chờ
      }
    } catch (error) {
      if (!isMounted) return;
      
      let errorMessage = 'Đã xảy ra lỗi khi đăng ký';
      
      // Log chi tiết lỗi từ server
      if (axios.isAxiosError(error)) {
        console.log('Response data:', JSON.stringify(error.response?.data, null, 2));
        
        if (error.response) {
          errorMessage = error.response.data?.message || errorMessage;
          console.log('Error message from server:', errorMessage);
        }
      } else {
        console.log('Unknown error:', error);
      }
      
      showToast.error(errorMessage);
    } finally {
      if (isMounted) {
        setLoading(false);
      }
    }
  }, [form, termsAccepted, validateForm, router, isMounted]);

  return (
    <>
      <Stack.Screen options={{ 
        title: 'Đăng ký', 
        headerBackVisible: true,
        headerBackTitle: 'Quay lại',
        // Giảm thời gian animation
        animationDuration: 200,
      }} />

      <ScrollView contentContainerStyle={signupStyles.scrollContainer}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={signupStyles.container}
        >
          <View style={signupStyles.logoContainer}>
            <FontAwesome name="shopping-bag" size={40} color="#ff6b81" />
            <Text style={signupStyles.logoText}>Glown</Text>
          </View>

          <View style={signupStyles.formContainer}>
            <Text style={signupStyles.welcomeText}>Tạo tài khoản mới!</Text>
            <Text style={signupStyles.subtitleText}>Đăng ký để bắt đầu mua sắm</Text>

            {/* Trường Họ và tên */}
            <TextInput
              label="Họ và tên"
              value={form.fullName}
              onChangeText={(text) => handleChange('fullName', text)}
              mode="outlined"
              style={signupStyles.input}
              error={!!errors.fullName}
            />
            {errors.fullName ? <Text style={signupStyles.fieldError}>{errors.fullName}</Text> : null}
            
            {/* Trường Email */}
            <TextInput
              label="Email"
              value={form.email}
              onChangeText={(text) => handleChange('email', text)}
              mode="outlined"
              keyboardType="email-address"
              autoCapitalize="none"
              style={signupStyles.input}
              error={!!errors.email}
            />
            {errors.email ? <Text style={signupStyles.fieldError}>{errors.email}</Text> : null}
            
            {/* Trường Số điện thoại */}
            <TextInput
              label="Số điện thoại"
              value={form.phone}
              onChangeText={(text) => handleChange('phone', text)}
              mode="outlined"
              keyboardType="phone-pad"
              style={signupStyles.input}
              error={!!errors.phone}
            />
            {errors.phone ? <Text style={signupStyles.fieldError}>{errors.phone}</Text> : null}
            
            {/* Trường Mật khẩu */}
            <TextInput
              label="Mật khẩu"
              value={form.password}
              onChangeText={(text) => handleChange('password', text)}
              mode="outlined"
              secureTextEntry={!showPassword}
              style={signupStyles.input}
              right={
                <TextInput.Icon 
                  icon={showPassword ? "eye-off" : "eye"} 
                  onPress={() => setShowPassword(!showPassword)}
                />
              }
              error={!!errors.password}
            />
            {errors.password ? <Text style={signupStyles.fieldError}>{errors.password}</Text> : null}
            
            {/* Điều khoản */}
            <TouchableOpacity 
              style={signupStyles.checkboxContainer}
              onPress={() => setTermsAccepted(!termsAccepted)}
            >
              <View style={[signupStyles.checkbox, termsAccepted && signupStyles.checkboxChecked]}>
                {termsAccepted && <FontAwesome name="check" size={12} color="white" />}
              </View>
              <View style={signupStyles.termsTextContainer}>
                <Text style={signupStyles.termsText}>Tôi đồng ý với </Text>
                <Link href="/terms" style={signupStyles.termsLink}>Điều khoản sử dụng</Link>
              </View>
            </TouchableOpacity>
            
            {/* Nút đăng ký */}
            <Button
              mode="contained"
              onPress={handleSubmit}
              style={signupStyles.registerButton}
              loading={loading}
              disabled={loading}
            >
              {loading ? 'Đang đăng ký...' : 'Đăng ký'}
            </Button>
            
              <View style={signupStyles.loginLinkContainer}>
                <Text style={signupStyles.loginText}>Đã có tài khoản? </Text>
                <TouchableOpacity onPress={() => router.replace("/login")}>
                  <Text style={signupStyles.loginLink}>Đăng nhập</Text>
                </TouchableOpacity>
              </View>
          </View>
        </KeyboardAvoidingView>
      </ScrollView>
      <Toast />
    </>
  );
}
