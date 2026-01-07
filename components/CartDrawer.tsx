import Ionicons from "@expo/vector-icons/Ionicons";
import React from "react";
import { Image, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import type { CartItem } from "../app/(tabs)/index";
import { PromotionsModal, type Promotion } from "./PromotionsModal";

interface CartDrawerProps {
  visible: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (id: number, qty: number) => void;
  onRemoveItem: (id: number) => void;
  totalPrice: number;
  onCheckout: (payload: {
    items: CartItem[];
    discountAmount: number;
    freeShipping: boolean;
    deliveryFee: number;
    finalTotal: number;
    percentPromo?: Promotion | null;
    freeshipPromo?: Promotion | null;
  }) => void; // thêm đây
}

export function CartDrawer({
  visible,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  totalPrice,
  onCheckout, // destructure đúng
}: CartDrawerProps) {
  const [selectAll, setSelectAll] = React.useState(false);
  const [selectedItemIds, setSelectedItemIds] = React.useState<Set<number>>(new Set());
  const [showPromotions, setShowPromotions] = React.useState(false);
  const [showSummary, setShowSummary] = React.useState(false);
  const [selectedFreeshipPromo, setSelectedFreeshipPromo] = React.useState<Promotion | null>(null);
  const [selectedPercentPromo, setSelectedPercentPromo] = React.useState<Promotion | null>(null);
  
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const selectedCount = selectedItemIds.size;

  // Calculate selected items subtotal
  const getSelectedSubtotal = () => {
    return cartItems
      .filter((item) => selectedItemIds.has(item.id))
      .reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  const toggleItemSelection = (itemId: number) => {
    const newSelected = new Set(selectedItemIds);
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId);
    } else {
      newSelected.add(itemId);
    }
    setSelectedItemIds(newSelected);
    
    // Update selectAll state
    if (newSelected.size === cartItems.length) {
      setSelectAll(true);
    } else {
      setSelectAll(false);
    }

    // Reset promotions if no items selected
    if (newSelected.size === 0) {
      setSelectedFreeshipPromo(null);
      setSelectedPercentPromo(null);
    }
  };

  const toggleSelectAll = () => {
    if (cartItems.length === 0) return; // nothing to select
    if (selectAll) {
      setSelectedItemIds(new Set());
      setSelectAll(false);
    } else {
      const allIds = new Set(cartItems.map((item) => item.id));
      setSelectedItemIds(allIds);
      setSelectAll(true);
    }
  };

  // Reset selection and promos when cart becomes empty or items change
  React.useEffect(() => {
    if (cartItems.length === 0) {
      setSelectedItemIds(new Set());
      setSelectAll(false);
      setSelectedFreeshipPromo(null);
      setSelectedPercentPromo(null);
      setShowSummary(false);
      setShowPromotions(false);
      return;
    }

    // Clean selected IDs that are no longer in cart using functional updater
    setSelectedItemIds((prev) => {
      const ids = new Set(cartItems.map((i) => i.id));
      const newSelected = new Set<number>([...prev].filter((id) => ids.has(id)));
      if (newSelected.size !== prev.size) {
        // update selectAll based on new selection
        setSelectAll(newSelected.size === cartItems.length);
        return newSelected;
      }
      // ensure selectAll remains accurate
      setSelectAll(prev.size === cartItems.length);
      return prev;
    });
  }, [cartItems]);

  const selectedSubtotal = getSelectedSubtotal();

  const getDiscountAmount = () => {
    let discount = 0;
    if (selectedPercentPromo) {
      const percentValue = parseInt(selectedPercentPromo.title.match(/\d+/)?.[0] || '0');
      discount = (selectedSubtotal * percentValue) / 100;
    }
    return discount;
  };

  const getDeliveryFee = () => {
    return selectedFreeshipPromo ? 0 : 16500;
  };

  const discountAmount = getDiscountAmount();
  const deliveryFee = getDeliveryFee();
  const finalTotal = selectedSubtotal - discountAmount + deliveryFee;

  const handleConfirmPromotion = (freeshipPromo: Promotion | null, percentPromo: Promotion | null) => {
    setSelectedFreeshipPromo(freeshipPromo);
    setSelectedPercentPromo(percentPromo);
  };

  const getPromoDisplayText = () => {
    const promos = [];
    if (selectedFreeshipPromo) promos.push(selectedFreeshipPromo.title);
    if (selectedPercentPromo) promos.push(selectedPercentPromo.title);
    return promos.length > 0 ? promos.join(' + ') : 'Chọn khuyến mãi';
  };
  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Giỏ Hàng</Text>
          <View style={{ width: 24 }} />
        </View>

        {cartItems.length === 0 ? (
          <View style={styles.emptyCart}>
            <Ionicons name="cart-outline" size={64} color="#ddd" />
            <Text style={styles.emptyText}>Giỏ hàng trống</Text>
          </View>
        ) : (
          <>
            {/* Cart Items */}
            <ScrollView style={styles.itemsList} showsVerticalScrollIndicator={false}>
              {cartItems.map((item) => (
                <View key={item.id} style={styles.cartItem}>
                  {/* Checkbox */}
                  <TouchableOpacity
                    onPress={() => toggleItemSelection(item.id)}
                    style={styles.checkbox}
                  >
                    <Ionicons
                      name={selectedItemIds.has(item.id) ? "checkbox" : "checkbox-outline"}
                      size={20}
                      color={selectedItemIds.has(item.id) ? "#e91e63" : "#ccc"}
                    />
                  </TouchableOpacity>

                  <Image
                    source={{ uri: item.image_url }}
                    style={styles.itemImage}
                  />
                  <View style={styles.itemDetails}>
                    <Text style={styles.itemName} numberOfLines={2}>{item.name}</Text>
                    <Text style={styles.itemPrice}>₫ {item.price.toLocaleString()}</Text>
                    
                    {/* Quantity Control */}
                    <View style={styles.quantityControl}>
                      <TouchableOpacity
                        onPress={() => onUpdateQuantity(item.id, Math.max(1, item.quantity - 1))}
                        style={styles.qtyBtn}
                      >
                        <Ionicons name="remove" size={16} color="#333" />
                      </TouchableOpacity>
                      <Text style={styles.qtyText}>{item.quantity}</Text>
                      <TouchableOpacity
                        onPress={() => onUpdateQuantity(item.id, item.quantity + 1)}
                        style={styles.qtyBtn}
                      >
                        <Ionicons name="add" size={16} color="#333" />
                      </TouchableOpacity>
                    </View>
                  </View>

                  <View style={styles.itemActions}>
                    <Text style={styles.itemTotal}>₫ {(item.price * item.quantity).toLocaleString()}</Text>
                    <TouchableOpacity onPress={() => onRemoveItem(item.id)} style={styles.deleteBtn}>
                      <Ionicons name="trash-outline" size={18} color="#e91e63" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </ScrollView>

            {/* Pricing Summary */}
            <View style={styles.summary}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Tạm tính:</Text>
                <Text style={styles.summaryValue}>₫ {selectedCount > 0 ? selectedSubtotal.toLocaleString() : '0'}</Text>
              </View>
              {selectedCount > 0 && discountAmount > 0 && (
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Giảm giá:</Text>
                  <Text style={[styles.summaryValue, styles.discountValue]}>
                    -₫ {discountAmount.toLocaleString()}
                  </Text>
                </View>
              )}
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Phí giao hàng:</Text>
                <Text style={styles.summaryValue}>₫ {selectedCount > 0 ? deliveryFee.toLocaleString() : '0'}</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Tổng cộng:</Text>
                <Text style={styles.totalValue}>₫ {selectedCount > 0 ? finalTotal.toLocaleString() : '0'}</Text>
              </View>

              {/* Voucher Section - Only show if items selected */}
              {selectedCount > 0 && (
                <View style={styles.voucherSection}>
                  <Text style={styles.voucherLabel}>💳 Mã khuyến mãi</Text>
                  <TouchableOpacity
                    style={styles.voucherInput}
                    onPress={() => setShowPromotions(true)}
                  >
                    <Text style={styles.voucherPlaceholder}>
                      {getPromoDisplayText()}
                    </Text>
                    <Ionicons name="chevron-forward" size={18} color="#ddd" />
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </>
        )}

        {/* Footer with Select All and Checkout - keep visible even when cart empty */}
        <View style={styles.footer}>
          <View style={styles.footerLeft}>
            <TouchableOpacity
              onPress={toggleSelectAll}
              style={styles.selectAllCheckbox}
              disabled={cartItems.length === 0}
            >
              <Ionicons
                name={selectAll ? "checkbox" : "checkbox-outline"}
                size={20}
                color={selectAll ? "#e91e63" : "#ccc"}
              />
            </TouchableOpacity>
            <Text style={styles.selectAllText}>Tất cả</Text>
          </View>

          <View style={styles.footerRight}>
            <TouchableOpacity
              style={styles.priceInfo}
              onPress={() => selectedCount > 0 && setShowSummary(true)}
            >
              <Text style={styles.priceLabel}>
                ₫ {selectedCount > 0 ? finalTotal.toLocaleString() : '0'}
              </Text>
              {selectedCount > 0 && discountAmount > 0 && (
                <Text style={styles.originalPrice}>
                  Tiết kiếm {discountAmount.toLocaleString()}đ
                </Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.checkoutBtn, selectedCount === 0 && styles.checkoutBtnDisabled]}
              onPress={() => {
                if (selectedCount === 0) return;
                const selectedItems = cartItems.filter((i) => selectedItemIds.has(i.id));
                onCheckout({
                  items: selectedItems,
                  discountAmount,
                  freeShipping: !!selectedFreeshipPromo,
                  deliveryFee,
                  finalTotal,
                  percentPromo: selectedPercentPromo,
                  freeshipPromo: selectedFreeshipPromo,
                });
              }}
              disabled={selectedCount === 0}
            >
              <Text style={styles.checkoutBtnText}>
                Mua hàng ({selectedCount})
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Promotions Modal */}
        <PromotionsModal
          visible={showPromotions}
          onClose={() => setShowPromotions(false)}
          onSelectPromotion={() => {}}
          onConfirm={handleConfirmPromotion}
          selectedFreeshipId={selectedFreeshipPromo?.id}
          selectedPercentId={selectedPercentPromo?.id}
        />

        {/* Summary Modal */}
        <Modal visible={showSummary} animationType="fade" transparent>
          <View style={styles.summaryModalOverlay}>
            <View style={styles.summaryModalContent}>
              {/* Header */}
              <View style={styles.summaryHeader}>
                <Text style={styles.summaryHeaderTitle}>Chi tiết khuyến mãi</Text>
                <TouchableOpacity onPress={() => setShowSummary(false)}>
                  <Ionicons name="close" size={24} color="#999" />
                </TouchableOpacity>
              </View>

              {/* Content */}
              <ScrollView style={styles.summaryBody} showsVerticalScrollIndicator={false}>
                {/* Subtotal */}
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Tổng tiền hàng</Text>
                  <Text style={styles.summaryValue}>{selectedSubtotal.toLocaleString()}đ</Text>
                </View>

                {/* Discount */}
                {discountAmount > 0 && (
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Voucher giảm giá</Text>
                    <Text style={styles.discountText}>-{discountAmount.toLocaleString()}đ</Text>
                  </View>
                )}

                {/* Discount Summary */}
                {discountAmount > 0 && (
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Tiết kiếm</Text>
                    <Text style={styles.discountText}>-{discountAmount.toLocaleString()}đ</Text>
                  </View>
                )}

                <View style={styles.divider} />

                {/* Delivery Fee */}
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Phí Vận Chuyển</Text>
                  <Text style={styles.summaryValue}>{deliveryFee.toLocaleString()}đ</Text>
                </View>

                {/* Discount on Delivery */}
                {selectedFreeshipPromo && (
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Giảm giá vận chuyển</Text>
                    <Text style={styles.discountText}>-16.500đ</Text>
                  </View>
                )}

                <View style={styles.divider} />

                {/* Total */}
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Tổng số tiền</Text>
                  <Text style={styles.totalValue}>{finalTotal.toLocaleString()}đ</Text>
                </View>

                {/* Promotion Info */}
                {(selectedPercentPromo || selectedFreeshipPromo) && (
                  <View style={styles.promoInfo}>
                    <Text style={styles.promoInfoLabel}>Số tiền cuối cùng thanh toán</Text>
                    <Text style={styles.promoInfoText}>{finalTotal.toLocaleString()}đ</Text>
                  </View>
                )}
              </ScrollView>
            </View>
          </View>
        </Modal>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginTop: 20, 
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f3e7ea',
  },
  backBtn: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  
  emptyCart: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    marginTop: 12,
  },
  
  itemsList: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  cartItem: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f3e7ea',
    alignItems: 'flex-start',
  },
  checkbox: {
    padding: 6,
    marginRight: 8,
  },
  itemImage: {
    width: 70,
    height: 70,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: '#f5f5f5',
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 13,
    fontWeight: '700',
    color: '#e91e63',
    marginBottom: 6,
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 6,
    width: 80,
  },
  qtyBtn: {
    flex: 1,
    paddingVertical: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qtyText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
  
  itemActions: {
    alignItems: 'flex-end',
    marginLeft: 8,
  },
  itemTotal: {
    fontSize: 13,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  deleteBtn: {
    padding: 8,
  },
  
  summary: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff5f7',
    borderTopWidth: 1,
    borderTopColor: '#f3e7ea',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 13,
    color: '#666',
  },
  summaryValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
  },
  discountValue: {
    color: '#e91e63',
  },
  divider: {
    height: 1,
    backgroundColor: '#ffe4ed',
    marginVertical: 8,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333',
  },
  totalValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#e91e63',
  },

  voucherSection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#ffe4ed',
  },
  voucherLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  voucherInput: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ffe4ed',
  },
  voucherPlaceholder: {
    fontSize: 13,
    color: '#999',
  },
  
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#f3e7ea',
    backgroundColor: '#fff',
  },
  footerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectAllCheckbox: {
    padding: 6,
    marginRight: 6,
  },
  selectAllText: {
    fontSize: 13,
    color: '#333',
    fontWeight: '500',
  },
  footerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    flex: 1,
  },
  priceInfo: {
    marginRight: 12,
    alignItems: 'flex-end',
  },
  priceLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#333',
  },
  originalPrice: {
    fontSize: 11,
    color: '#e91e63',
    marginTop: 2,
  },
  
  checkoutBtn: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#e91e63',
    borderRadius: 8,
    alignItems: 'center',
    minWidth: 120,
  },
  checkoutBtnText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
  checkoutBtnDisabled: {
    backgroundColor: '#ccc',
  },

  // Summary Modal Styles
  summaryModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  summaryModalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '80%',
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  summaryHeaderTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
  },
  summaryBody: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  discountText: {
    fontSize: 13,
    color: '#e91e63',
    fontWeight: '600',
  },
  promoInfo: {
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  promoInfoLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  promoInfoText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333',
  },
});

