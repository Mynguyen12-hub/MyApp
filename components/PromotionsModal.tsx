import Ionicons from '@expo/vector-icons/Ionicons';
import React from 'react';
import {
  FlatList,
  Modal,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export interface Promotion {
  id: number;
  title: string;
  description: string;
  discount: string;
  icon: string;
  type: 'percent' | 'freeship';
}

interface PromotionsModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectPromotion: (promo: Promotion | null, type: 'freeship' | 'percent') => void;
  onConfirm: (freeshipPromo: Promotion | null, percentPromo: Promotion | null) => void;
  selectedFreeshipId?: number;
  selectedPercentId?: number;
}

const FREESHIP_PROMOS: Promotion[] = [
  {
    id: 1,
    title: 'Miễn phí giao hàng',
    description: 'Miễn phí giao hàng cho tất cả đơn hàng',
    discount: 'FREE SHIP',
    icon: 'car',
    type: 'freeship',
  },
];

const PERCENT_PROMOS: Promotion[] = [
  {
    id: 2,
    title: 'Giảm 10%',
    description: 'Giảm 10% cho tổng hoá đơn',
    discount: '10%',
    icon: 'pricetag',
    type: 'percent',
  },
  {
    id: 3,
    title: 'Giảm 20%',
    description: 'Giảm 20% cho tổng hoá đơn',
    discount: '20%',
    icon: 'pricetag',
    type: 'percent',
  },
  {
    id: 4,
    title: 'Giảm 30%',
    description: 'Giảm 30% cho tổng hoá đơn',
    discount: '30%',
    icon: 'pricetag',
    type: 'percent',
  },
];

export function PromotionsModal({
  visible,
  onClose,
  onSelectPromotion,
  onConfirm,
  selectedFreeshipId,
  selectedPercentId,
}: PromotionsModalProps) {
  const [tempFreeshipId, setTempFreeshipId] = React.useState<number | undefined>(selectedFreeshipId);
  const [tempPercentId, setTempPercentId] = React.useState<number | undefined>(selectedPercentId);
  const [vouchersLoading, setVouchersLoading] = React.useState(false);
  const [vouchersError, setVouchersError] = React.useState<string | null>(null);
  const [remoteFreeshipPromos, setRemoteFreeshipPromos] = React.useState<Promotion[] | null>(null);
  const [remotePercentPromos, setRemotePercentPromos] = React.useState<Promotion[] | null>(null);

  React.useEffect(() => {
    setTempFreeshipId(selectedFreeshipId);
    setTempPercentId(selectedPercentId);
  }, [selectedFreeshipId, selectedPercentId, visible]);

  React.useEffect(() => {
    if (!visible) return;
    const loadVouchers = async () => {
      setVouchersLoading(true);
      setVouchersError(null);
      try {
        // Firestore REST endpoint
        const key = 'AIzaSyC8BXvyOAje4OON58cXo_n30tUjBiZy9w4';
        const url = `https://firestore.googleapis.com/v1/projects/flower-30f60/databases/(default)/documents/vouchers?key=${key}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        const docs = json.documents || [];

        const promos: Promotion[] = docs.map((doc: any, idx: number) => {
          const f = doc.fields || {};
          const id = Number(f.id?.integerValue || f.id?.stringValue || (idx + 1));
          const rawType = f.type?.stringValue || f.promoType?.stringValue || '';
          const type = rawType === 'freeship' ? 'freeship' : 'percent';
          return {
            id,
            title: f.title?.stringValue || f.name?.stringValue || f.code?.stringValue || `Promo ${id}`,
            description: f.description?.stringValue || f.desc?.stringValue || '',
            discount: f.discount?.stringValue || f.amount?.stringValue || f.code?.stringValue || '',
            icon: f.icon?.stringValue || (type === 'freeship' ? 'car' : 'pricetag'),
            type,
          } as Promotion;
        });

        const freeship = promos.filter((p) => p.type === 'freeship');
        const percent = promos.filter((p) => p.type === 'percent');
        setRemoteFreeshipPromos(freeship.length ? freeship : null);
        setRemotePercentPromos(percent.length ? percent : null);
      } catch (e: any) {
        console.warn('Vouchers fetch from Firestore failed', e?.message || e);
        setVouchersError('Không lấy được mã giảm giá từ Firebase');
      } finally {
        setVouchersLoading(false);
      }
    };

    loadVouchers();
  }, [visible]);

  const handleSelectPromotion = (promo: Promotion) => {
    if (promo.type === 'freeship') {
      setTempFreeshipId(tempFreeshipId === promo.id ? undefined : promo.id);
    } else {
      setTempPercentId(tempPercentId === promo.id ? undefined : promo.id);
    }
  };

  const handleClearPromotion = (type: 'freeship' | 'percent') => {
    if (type === 'freeship') {
      setTempFreeshipId(undefined);
    } else {
      setTempPercentId(undefined);
    }
  };

  const handleConfirm = () => {
    const frees = (remoteFreeshipPromos ?? FREESHIP_PROMOS).find((p) => p.id === tempFreeshipId) || null;
    const perc = (remotePercentPromos ?? PERCENT_PROMOS).find((p) => p.id === tempPercentId) || null;
    onConfirm(frees, perc);
    onClose();
  };

  const renderPromoItem = (item: Promotion, selectedId?: number, type?: 'freeship' | 'percent') => {
    const isSelected = selectedId === item.id;

    return (
      <TouchableOpacity
        key={item.id}
        style={[styles.promoItem, isSelected && styles.promoItemSelected]}
        onPress={() => handleSelectPromotion(item)}
      >
        <View style={styles.promoContent}>
          <View style={styles.promoIcon}>
            <Ionicons
              name={item.icon as any}
              size={24}
              color={isSelected ? '#e91e63' : '#666'}
            />
          </View>
          <View style={styles.promoText}>
            <Text style={styles.promoTitle}>{item.title}</Text>
            <Text style={styles.promoDescription}>{item.description}</Text>
          </View>
          <View style={styles.promoDiscount}>
            <Text
              style={[
                styles.discountText,
                isSelected && styles.discountTextSelected,
              ]}
            >
              {item.discount}
            </Text>
          </View>
        </View>
        {isSelected && (
          <View style={styles.checkmark}>
            <Ionicons name="checkmark-circle" size={24} color="#e91e63" />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Khuyến mãi</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Promotions List */}
        {vouchersLoading && (
          <View style={{ paddingHorizontal: 16, paddingVertical: 12 }}>
            <Text>Đang tải mã giảm giá...</Text>
          </View>
        )}
        {vouchersError && (
          <View style={{ paddingHorizontal: 16, paddingVertical: 12 }}>
            <Text style={{ color: '#e91e63' }}>{vouchersError}</Text>
          </View>
        )}

        <FlatList
          data={[
            {
              type: 'section',
              title: 'Miễn phí giao hàng',
              items: remoteFreeshipPromos ?? FREESHIP_PROMOS,
              selectedId: tempFreeshipId,
              promoType: 'freeship',
            },
            {
              type: 'section',
              title: 'Giảm giá',
              items: remotePercentPromos ?? PERCENT_PROMOS,
              selectedId: tempPercentId,
              promoType: 'percent',
            },
          ]}
          renderItem={({ item: section }: any) => (
            <View key={section.title} style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>{section.title}</Text>
                {section.selectedId && (
                  <TouchableOpacity
                    onPress={() =>
                      handleClearPromotion(section.promoType)
                    }
                    style={styles.clearBtn}
                  >
                    <Text style={styles.clearBtnText}>Xoá</Text>
                  </TouchableOpacity>
                )}
              </View>
                  {section.items.map((promo: Promotion) =>
                    renderPromoItem(promo, section.selectedId, section.promoType)
                  )}
            </View>
          )}
          keyExtractor={(item) => item.title}
          contentContainerStyle={styles.listContainer}
          scrollEnabled={true}
          showsVerticalScrollIndicator={false}
        />

        {/* Confirm Button */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.confirmBtn}
            onPress={handleConfirm}
          >
            <Text style={styles.confirmBtnText}>Đồng ý</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backBtn: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },

  listContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },

  section: {
    marginBottom: 24,
  },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
  },

  clearBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#f5f5f5',
  },

  clearBtnText: {
    fontSize: 12,
    color: '#e91e63',
    fontWeight: '600',
  },

  promoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#f3e7ea',
    borderRadius: 12,
    backgroundColor: '#fff',
    justifyContent: 'space-between',
  },
  promoItemSelected: {
    backgroundColor: '#fff5f7',
    borderColor: '#e91e63',
    borderWidth: 2,
  },

  promoContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },

  promoIcon: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  promoText: {
    flex: 1,
  },

  promoTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },

  promoDescription: {
    fontSize: 12,
    color: '#999',
    lineHeight: 16,
  },

  promoDiscount: {
    marginLeft: 8,
  },

  discountText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#e91e63',
  },

  discountTextSelected: {
    fontSize: 13,
    color: '#e91e63',
  },

  checkmark: {
    marginLeft: 8,
  },

  footer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    backgroundColor: '#fff',
  },

  confirmBtn: {
    paddingVertical: 12,
    backgroundColor: '#e91e63',
    borderRadius: 8,
    alignItems: 'center',
  },

  confirmBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
});
