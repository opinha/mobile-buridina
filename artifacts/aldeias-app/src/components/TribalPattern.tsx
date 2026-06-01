import React from "react";
import { View, Dimensions } from "react-native";
import Svg, { G, Path } from "react-native-svg";

interface TribalPatternProps {
  color?: string;
}

export function TribalPattern({ color = "#4A2B18" }: TribalPatternProps) {
  const screenWidth = Dimensions.get("window").width;
  const itemWidth = 20;
  const count = Math.ceil(screenWidth / itemWidth) + 1;

  const items = Array.from({ length: count }, (_, i) => i);

  return (
    <View style={{ width: "100%", height: 6, opacity: 0.7, marginTop: 4, marginBottom: 8 }}>
      <Svg width="100%" height={6} viewBox={`0 0 ${screenWidth} 6`} fill="none">
        {items.map((i) => (
          <G key={i} x={i * itemWidth}>
            <Path
              d="M0 3L5 0L10 3L15 0L20 3V6L15 3L10 6L5 3L0 6V3Z"
              fill={color}
            />
          </G>
        ))}
      </Svg>
    </View>
  );
}
