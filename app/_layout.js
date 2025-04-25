import React, { useEffect, useMemo, useState, useRef } from 'react';
import { View, StyleSheet, Platform, StatusBar, LogBox, BackHandler, Alert } from 'react-native';
import { Stack, usePathname } from 'expo-router';
import { Provider } from 'react-redux';
import { store } from '../src/redux/store';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { PaperProvider } from 'react-native-paper';
import Toast from 'react-native-toast-message';
import Header from '../src/components/Header';
import { isMainScreen } from '../src/config/navigation';
import { DevSettings } from 'react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { showToast } from '../src/utils/toast';

if (__DEV__) {
  // Chỉ trong môi trường phát triển
  try {
    const { connectToDevTools } = require('react-devtools-core');
    connectToDevTools({
      host: 'localhost',
      port: 8097,
    });
    console.log('React DevTools connected');
  } catch (err) {
    console.error('Cannot connect to React DevTools:', err);
  }
}

// Ignore specific warnings that might not be relevant
LogBox.ignoreLogs([
  'VirtualizedLists should never be nested inside plain ScrollViews',
  'Non-serializable values were found in the navigation state',
  'addViewAt: failed to insert view',
  'Cannot read property \'message\' of undefined',
  'fragment has not been attached yet'
]);

// Memoize Header component to prevent unnecessary re-renders
const MemoizedHeader = React.memo(Header);

// Tạo một instance của QueryClient
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 phút
      cacheTime: 1000 * 60 * 30, // 30 phút
      retry: 1,
      refetchOnWindowFocus: false, // Không refetch khi app chuyển từ background sang foreground
    },
  },
});

export default function Layout() {
  const pathname = usePathname();
  const [isNavigationReady, setIsNavigationReady] = useState(false);
  const navigationMountedRef = useRef(false);
  const [lastBackPressed, setLastBackPressed] = useState(0);
  
  // Log navigation changes - simplified
  useEffect(() => {
    if (navigationMountedRef.current) {
      console.log(`Điều hướng tới: ${pathname}`);
    }
  }, [pathname]);
  
  // Ensure navigation is fully mounted before rendering children - simplified
  useEffect(() => {
    // Ngay lập tức đặt flag là true
    navigationMountedRef.current = true;
    
    // Đặt một thời gian ngắn để tránh màn hình trống
    const timer = setTimeout(() => {
      setIsNavigationReady(true);
    }, 50); // Giảm thời gian delay xuống
    
    return () => clearTimeout(timer);
  }, []);

  // Xử lý back press
  useEffect(() => {
    const backAction = () => {
      // Chỉ xử lý với main screens (tabs)
      if (isMainScreen(pathname)) {
        const now = Date.now();
        
        if (now - lastBackPressed < 2000) { // 2 giây
          // Nếu nhấn back 2 lần trong 2s -> thoát app
          BackHandler.exitApp();
          return true;
        }

        setLastBackPressed(now);
        
        showToast.info('Nhấn Back lần nữa để thoát');
        
        return true; // Prevent default back action
      }
      
      return false; // Let default back action happen
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction
    );

    return () => backHandler.remove();
  }, [pathname, lastBackPressed]);

  // Memoize screen options cho hiệu suất tốt hơn
  const screenOptions = useMemo(() => ({
    headerShown: false,
    contentStyle: { backgroundColor: '#fff' },
    animation: 'slide_from_right',
    animationDuration: Platform.OS === 'ios' ? 300 : 250,
    // Kiểm soát mài để tránh lỗi vòng lặp
    gestureEnabled: true,
    gestureDirection: 'horizontal',
  }), []);
  
  // Sử dụng hàm isMainScreen từ file cấu hình
  const showBackButton = !isMainScreen(pathname);
  
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <PaperProvider>
          <SafeAreaProvider>
            <SafeAreaView style={styles.container} edges={['top']}>
              <StatusBar barStyle="dark-content" backgroundColor="#fff" />
              <MemoizedHeader showBackButton={showBackButton} />
              <View style={styles.content}>
                {isNavigationReady && (
                  <Stack
                    screenOptions={screenOptions}
                    key="main-stack"
                  />
                )}
              </View>
              <Toast />
            </SafeAreaView>
          </SafeAreaProvider>
        </PaperProvider>
      </QueryClientProvider>
    </Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
  },
});
