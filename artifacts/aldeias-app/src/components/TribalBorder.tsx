import React from "react";
import { View, Dimensions } from "react-native";
import Svg, { G, Path } from "react-native-svg";

export function TribalBorder() {
  const screenWidth = Dimensions.get("window").width;
  const itemWidth = 40;
  const count = Math.ceil(screenWidth / itemWidth) + 1;

  const items = Array.from({ length: count }, (_, i) => i);

  return (
    <View style={{ width: "100%", height: 8, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 1, elevation: 2 }}>
      <Svg width="100%" height={8} viewBox={`0 0 ${screenWidth} 8`} fill="none">
        {items.map((i) => (
          <G key={i} x={i * itemWidth}>
            {/* First diamond shape */}
            <Path
              d="M0 4L5 0L10 4L15 0L20 4V8L15 4L10 8L5 4L0 8V4Z"
              fill="#D4691E"
            />
            {/* Second diamond shape */}
            <Path
              d="M20 4L25 0L30 4L35 0L40 4V8L35 4L30 8L25 4L20 8V4Z"
              fill="#8B6347"
            />
          </G>
        ))}
      </Svg>
    </View>
  );
}
