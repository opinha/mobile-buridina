import React from "react";
import { View, StyleSheet } from "react-native";
import colors from "@/constants/colors";

interface TribalPatternProps {
  height?: number;
  backgroundColor?: string;
}

export function TribalPattern({
  height = 8,
  backgroundColor = colors.light.primary,
}: TribalPatternProps) {
  const segments = 20;
  return (
    <View style={[styles.container, { height, backgroundColor }]}>
      {Array.from({ length: segments }).map((_, i) => (
        <View
          key={i}
          style={[
            styles.triangle,
            {
              borderBottomColor:
                i % 2 === 0 ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.15)",
              borderBottomWidth: height,
              borderLeftWidth: height * 0.7,
              borderRightWidth: height * 0.7,
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    overflow: "hidden",
  },
  triangle: {
    width: 0,
    height: 0,
    backgroundColor: "transparent",
    borderStyle: "solid",
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    flex: 1,
  },
});
