import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Text, TextInput, Button, Platform } from 'react-native';
import { Stack } from 'expo-router';
import axios from 'axios';

export default function DebugScreen() {
  // IP máy tính của bạn
  const YOUR_MACHINE_IP = '192.168.1.5';
  
  // Tùy chỉnh URL dựa trên platform
  const defaultApiUrl = Platform.OS === 'web' 
    ? 'http://localhost:3000/api/health'
    : `http://${YOUR_MACHINE_IP}:3000/api/health`;
  
  const [apiUrl, setApiUrl] = useState(defaultApiUrl);
  const [result, setResult] = useState<string>('');
  const [error, setError] = useState<string>('');

  const testConnection = async () => {
    setResult('Đang kiểm tra kết nối...');
    setError('');
    
    try {
      const response = await axios.get(apiUrl);
      setResult(JSON.stringify(response.data, null, 2));
    } catch (err: any) {
      setError(`Lỗi: ${err.message}`);
      if (err.response) {
        setResult(JSON.stringify(err.response.data, null, 2));
      } else {
        setResult('Không nhận được phản hồi từ server');
      }
    }
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Debug API' }} />
      <ScrollView style={styles.container}>
        <Text style={styles.title}>Kiểm tra Kết nối API</Text>
        
        <View style={styles.infoContainer}>
          <Text>Platform: {Platform.OS}</Text>
          <Text>Version: {Platform.Version}</Text>
        </View>
        
        <View style={styles.form}>
          <Text style={styles.label}>API URL:</Text>
          <TextInput 
            style={styles.input} 
            value={apiUrl}
            onChangeText={setApiUrl}
            placeholder="Nhập URL để kiểm tra kết nối"
          />
          
          <Button title="Kiểm tra Kết nối" onPress={testConnection} />
        </View>
        
        {error ? <Text style={styles.error}>{error}</Text> : null}
        
        <View style={styles.resultContainer}>
          <Text style={styles.resultTitle}>Kết quả:</Text>
          <ScrollView style={styles.resultContent}>
            <Text>{result}</Text>
          </ScrollView>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  form: {
    marginBottom: 20,
  },
  label: {
    marginBottom: 5,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    marginBottom: 15,
    borderRadius: 4,
  },
  error: {
    color: 'red',
    marginBottom: 10,
  },
  resultContainer: {
    flex: 1,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 5,
  },
  resultContent: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    borderRadius: 4,
    maxHeight: 300,
    backgroundColor: '#f9f9f9',
  },
  infoContainer: {
    marginBottom: 20,
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
  },
});
