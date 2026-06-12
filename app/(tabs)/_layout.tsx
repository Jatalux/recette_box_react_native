import { Tabs } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const COLORS = {
  header: "#0D530E",
  bg: "#FBF5DD",
  surface: "#E2EDCF",
  accent: "#306D29",
  accentMuted: "#306D29",
  textMuted: "#8FA990",
};

const TAB_ICONS = {
  house: "🏠",
  heart: "♡",
  heartFilled: "♥",
};

function TabIcon({ icon, focused }: { icon: "house" | "heart"; focused: boolean }) {
  const label = icon === "heart" 
    ? (focused ? TAB_ICONS.heartFilled : TAB_ICONS.heart)
    : TAB_ICONS[icon];
  return (
    <View style={[styles.iconWrapper, focused && styles.iconWrapperActive]}>
      <Text style={styles.icon}>{label}</Text>
    </View>
  );
}

export default function TabLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: COLORS.accent,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarLabelStyle: styles.tabLabel,
        tabBarStyle: [
          styles.tabBar,
          {
            height: 56 + insets.bottom,
            paddingBottom: insets.bottom > 0 ? insets.bottom : 12,
          },
        ],
        tabBarItemStyle: styles.tabItem,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Accueil',
          tabBarIcon: ({ focused }) => <TabIcon icon="house" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="favorites"
        options={{
          title: 'Favoris',
          tabBarIcon: ({ focused }) => <TabIcon icon="heart" focused={focused} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: COLORS.bg,
    elevation: 0,
    shadowColor: COLORS.header,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    paddingTop: 10,
  },
  tabItem: {
    gap: 4,
    paddingVertical: 0,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.2,
    marginTop: 0,
  },
  iconWrapper: {
    width: 44,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  iconWrapperActive: {
    backgroundColor: COLORS.textMuted,
  },
  icon: {
    color: '#ff0000',
    fontSize: 18,
    lineHeight: 20,
  },
});