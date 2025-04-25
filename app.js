import 'react-native-gesture-handler';
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider as ReduxProvider } from 'react-redux';
import { store } from './src/redux/store';
import Toast from 'react-native-toast-message';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

// Using React.memo to prevent unnecessary re-renders
const App = React.memo(() => (
  <GestureHandlerRootView style={{ flex: 1 }}>
    <ReduxProvider store={store}>
      <SafeAreaProvider>
        <StatusBar style="auto" />
        <Toast />
      </SafeAreaProvider>
    </ReduxProvider>
  </GestureHandlerRootView>
));

export default App;
