import React from "react";
import { View, StyleSheet } from "react-native";
import colors from "@/constants/colors";

interface QRCodeProps {
  value: string;
  size?: number;
}

function generateQRMatrix(value: string): boolean[][] {
  const seed = value.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const size = 21;
  const matrix: boolean[][] = [];

  const pseudoRand = (i: number, j: number) => {
    const n = (seed * (i + 1) * (j + 1) * 7919) % 256;
    return n > 100;
  };

  for (let i = 0; i < size; i++) {
    matrix[i] = [];
    for (let j = 0; j < size; j++) {
      if (
        (i < 7 && j < 7) ||
        (i < 7 && j >= size - 7) ||
        (i >= size - 7 && j < 7)
      ) {
        const li = i < 7 ? i : i - (size - 7);
        const lj = j < 7 ? j : j - (size - 7);
        matrix[i][j] =
          li === 0 ||
          li === 6 ||
          lj === 0 ||
          lj === 6 ||
          (li >= 2 && li <= 4 && lj >= 2 && lj <= 4);
      } else if (i === 6 || j === 6) {
        matrix[i][j] = (i + j) % 2 === 0;
      } else {
        matrix[i][j] = pseudoRand(i, j);
      }
    }
  }
  return matrix;
}

export default function QRCode({ value, size = 160 }: QRCodeProps) {
  const matrix = generateQRMatrix(value);
  const cellSize = size / matrix.length;

  return (
    <View
      style={[
        styles.container,
        { width: size + 16, height: size + 16, borderRadius: 12 },
      ]}
    >
      <View style={{ width: size, height: size }}>
        {matrix.map((row, i) => (
          <View key={i} style={{ flexDirection: "row" }}>
            {row.map((cell, j) => (
              <View
                key={j}
                style={{
                  width: cellSize,
                  height: cellSize,
                  backgroundColor: cell ? "#1A0E08" : "#FFFFFF",
                }}
              />
            ))}
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFFFF",
    padding: 8,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
});
