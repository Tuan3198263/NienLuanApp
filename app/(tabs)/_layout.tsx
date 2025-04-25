import React from "react";
import { Tabs } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false, // Ẩn header mặc định của tab
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="home" size={24} color={color} />
          ),
          tabBarLabel: "Trang chủ",
        }}
      />
      <Tabs.Screen
        name="brands"
        options={{
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="storefront" size={24} color={color} />
          ),
          tabBarLabel: "Thương hiệu",
        }}
      />
      <Tabs.Screen
        name="articles"
        options={{
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="feed" size={24} color={color} />
          ),
          tabBarLabel: "Bài viết",
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="person" size={24} color={color} />
          ),
          tabBarLabel: "Tài khoản",
        }}
      />
    </Tabs>
  );
}
