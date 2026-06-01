import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ChevronRight, Bell } from "lucide-react-native";
import { useApp, type Aldeia } from "../context/AppContext";
import { TribalBorder } from "../components/TribalBorder";

function AldeiaCard({ aldeia, onPress }: { aldeia: Aldeia; onPress: () => void }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={styles.card}
    >
      <Text style={styles.cardTitle}>{aldeia.nome}</Text>
      <ChevronRight size={20} color="#4A2B18" strokeWidth={2.5} />
    </TouchableOpacity>
  );
}

export default function Home() {
  const insets = useSafeAreaInsets();
  const { aldeias, navigate } = useApp();

  return (
    <View style={styles.container}>
      {/* Universal Header */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Aldeias Cadastradas</Text>
          <TouchableOpacity activeOpacity={0.7} style={styles.bellButton}>
            <Bell size={22} color="#FFF" strokeWidth={2.5} />
          </TouchableOpacity>
        </View>
      </View>
      <TribalBorder />

      {/* Content List */}
      <ScrollView
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      >
        {aldeias.map((aldeia) => (
          <AldeiaCard
            key={aldeia.id}
            aldeia={aldeia}
            onPress={() => navigate("AldeiaDetail", { id: aldeia.id })}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4EFE6",
  },
  header: {
    backgroundColor: "#4A2B18",
    width: "100%",
  },
  headerContent: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  headerTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "bold",
    letterSpacing: 0.5,
  },
  bellButton: {
    position: "absolute",
    right: 20,
    padding: 4,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 32,
    paddingBottom: 24,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FCFAF6",
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: "#E6DDCC",
    marginBottom: 16,
    // Shadow styling
    shadowColor: "#4A2B18",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#4A2B18",
  },
});
