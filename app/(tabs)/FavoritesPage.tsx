import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import React, { useMemo, useState } from "react";
import {
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { ProductCard } from "../../components/ProductCard";
import type { Product } from "./index";

interface FavoritesPageProps {
  favorites: Product[];
  onAddToCart: (product: Product) => void;
  onToggleFavorite: (id: number) => void;
  onPressImage?: (product: Product) => void;
  onPressCart?: () => void;
}

type SortMode =
  | "default"
  | "price_asc"
  | "price_desc"
  | "alpha_asc"
  | "alpha_desc";

type ViewMode = "grid" | "list";

export function FavoritesPage({
  favorites,
  onAddToCart,
  onToggleFavorite,
  onPressImage,
  onPressCart,
}: FavoritesPageProps) {
  const headerColor = "#FF69B4";

  const [showSortModal, setShowSortModal] = useState(false);
  const [showPriceFilter, setShowPriceFilter] = useState(false);
  const [sortMode, setSortMode] = useState<SortMode>("default");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(1_000_000);

  // 🔹 FILTER + SORT
  const filteredFavorites = useMemo(() => {
    return [...favorites]
      .filter((p) => {
        const price = Number(p.discountPrice || p.price || 0);
        return price >= minPrice && price <= maxPrice;
      })
      .sort((a, b) => {
        const priceA = Number(a.discountPrice || a.price || 0);
        const priceB = Number(b.discountPrice || b.price || 0);

        switch (sortMode) {
          case "price_asc":
            return priceA - priceB;
          case "price_desc":
            return priceB - priceA;
          case "alpha_asc":
            return a.name.localeCompare(b.name);
          case "alpha_desc":
            return b.name.localeCompare(a.name);
          default:
            return 0;
        }
      });
  }, [favorites, sortMode, minPrice, maxPrice]);

  // 🟨 EMPTY
  if (favorites.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.emptyText}>Chưa có sản phẩm yêu thích 🌸</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <MaterialCommunityIcons name="flower" size={28} color={headerColor} />
          <Text style={[styles.headerTitle, { color: headerColor }]}>
            Yêu thích
          </Text>
        </View>

        <View style={{ flexDirection: "row", gap: 14 }}>
          <TouchableOpacity onPress={() => setShowSortModal(true)}>
            <Ionicons name="filter-outline" size={24} />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setShowPriceFilter(true)}>
            <Ionicons name="cash-outline" size={24} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() =>
              setViewMode(viewMode === "grid" ? "list" : "grid")
            }
          >
            <Ionicons
              name={viewMode === "grid" ? "list" : "grid"}
              size={24}
            />
          </TouchableOpacity>

          <TouchableOpacity onPress={onPressCart}>
            <Ionicons name="cart-outline" size={26} />
          </TouchableOpacity>
        </View>
      </View>

      {/* LIST */}
      <FlatList
        data={filteredFavorites}
        key={viewMode} // 👈 QUAN TRỌNG
        keyExtractor={(item) => item.id.toString()}
        numColumns={viewMode === "grid" ? 2 : 1}
        columnWrapperStyle={
          viewMode === "grid"
            ? { justifyContent: "space-between", marginBottom: 16 }
            : undefined
        }
        renderItem={({ item }) => (
          <ProductCard
            product={item}
            isFavorite
            viewMode={viewMode}
            onAddToCart={() => onAddToCart(item)}
            onToggleFavorite={() => onToggleFavorite(item.id)}
            onPressImage={() => onPressImage?.(item)}
          />
        )}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 20 }}
      />

      {/* SORT MODAL */}
      <Modal visible={showSortModal} transparent animationType="fade">
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={() => setShowSortModal(false)}
        >
          <View style={styles.sortModal}>
            <Text style={styles.modalTitle}>Sắp xếp</Text>

            {[
              ["default", "Mặc định"],
              ["price_asc", "Giá tăng dần"],
              ["price_desc", "Giá giảm dần"],
              ["alpha_asc", "A → Z"],
              ["alpha_desc", "Z → A"],
            ].map(([key, label]) => (
              <TouchableOpacity
                key={key}
                onPress={() => {
                  setSortMode(key as SortMode);
                  setShowSortModal(false);
                }}
              >
                <Text style={styles.modalItem}>{label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* PRICE FILTER MODAL */}
      <Modal visible={showPriceFilter} transparent animationType="slide">
        <View style={styles.priceOverlay}>
          <View style={styles.priceModal}>
            <View style={styles.priceHeader}>
              <Text style={styles.priceTitle}>Lọc theo giá</Text>
              <TouchableOpacity onPress={() => setShowPriceFilter(false)}>
                <Ionicons name="close" size={24} />
              </TouchableOpacity>
            </View>

            {[
              { label: "Dưới 100K", min: 0, max: 100_000 },
              { label: "100K – 500K", min: 100_000, max: 500_000 },
              { label: "500K – 1M", min: 500_000, max: 1_000_000 },
            ].map((p) => (
              <TouchableOpacity
                key={p.label}
                style={styles.priceItem}
                onPress={() => {
                  setMinPrice(p.min);
                  setMaxPrice(p.max);
                  setShowPriceFilter(false);
                }}
              >
                <Text>{p.label}</Text>
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              style={styles.clearBtn}
              onPress={() => {
                setMinPrice(0);
                setMaxPrice(1_000_000);
                setShowPriceFilter(false);
              }}
            >
              <Text style={styles.clearText}>Xoá bộ lọc</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 40 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 8 },
  headerTitle: { fontSize: 20, fontWeight: "600" },
  emptyText: { marginTop: 40, textAlign: "center", fontSize: 16 },

  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    padding: 16,
  },
  sortModal: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
  },
  modalTitle: {
    fontWeight: "700",
    marginBottom: 8,
  },
  modalItem: {
    paddingVertical: 10,
    fontSize: 16,
  },

  priceOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  priceModal: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 32,
  },
  priceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  priceTitle: { fontSize: 18, fontWeight: "700" },
  priceItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  clearBtn: {
    marginTop: 16,
    backgroundColor: "#e91e63",
    padding: 12,
    borderRadius: 10,
  },
  clearText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "600",
  },
});
