import React from "react";
import { View, StyleSheet, TouchableOpacity, Text, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Layers, Maximize } from "lucide-react-native";
import { useApp } from "../context/AppContext";

export function Layout({ children }: { children: React.ReactNode }) {
  const insets = useSafeAreaInsets();
  const { currentRoute, navigate } = useApp();

  const showNavbar = true;

  return (
    <View style={styles.container}>
      {/* Main Content */}
      <View style={[styles.main, { paddingBottom: showNavbar ? 70 + insets.bottom : 0 }]}>
        {children}
      </View>

      {/* Bottom Tab Navigation */}
      {showNavbar && (
        <View
          style={[
            styles.navbar,
            {
              paddingBottom: Math.max(insets.bottom, 12),
              height: 60 + Math.max(insets.bottom, 12),
            },
          ]}
        >
          {/* Aldeias Tab */}
          <TouchableOpacity
            onPress={() => navigate("Home")}
            activeOpacity={0.8}
            style={styles.tabItem}
          >
            <Layers
              size={24}
              color={
                currentRoute === "Home" ||
                currentRoute === "AldeiaDetail" ||
                currentRoute === "MembroDetail"
                  ? "#D4691E"
                  : "#8B6347"
              }
            />
            <Text
              style={[
                styles.tabText,
                {
                  color:
                    currentRoute === "Home" ||
                    currentRoute === "AldeiaDetail" ||
                    currentRoute === "MembroDetail"
                      ? "#D4691E"
                      : "#8B6347",
                },
              ]}
            >
              Aldeias
            </Text>
          </TouchableOpacity>

          {/* Scanner Tab (Floating Brown Bubble) */}
          <View style={styles.floatingContainer}>
            <TouchableOpacity
              onPress={() => navigate("Scanner")}
              activeOpacity={0.9}
              style={styles.floatingButton}
            >
              <Maximize size={24} color="#FFF" />
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4EFE6",
  },
  main: {
    flex: 1,
  },
  navbar: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    backgroundColor: "#f8f6f0",
    borderTopWidth: 1,
    borderTopColor: "#d9c8b0",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingTop: 8,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  tabItem: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  tabText: {
    fontSize: 12,
    fontWeight: "600",
    marginTop: 4,
  },
  floatingContainer: {
    position: "relative",
    top: -24,
    width: 60,
    height: 60,
    alignItems: "center",
    justifyContent: "center",
  },
  floatingButton: {
    width: 56,
    height: 56,
    borderRadius: 20,
    backgroundColor: "#3D1F0F",
    alignItems: "center",
    justifyContent: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#3D1F0F",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
      },
      android: {
        elevation: 6,
      },
    }),
  },
});
