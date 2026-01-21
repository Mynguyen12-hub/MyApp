import { Ionicons } from '@expo/vector-icons';
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  getFirestore,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
} from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import {
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { app, auth } from '../config/firebaseConfig';

interface Notification {
  id: string;
  type: 'order' | 'promotion' | 'delivery';
  title: string;
  message: string;
  time: string;
  read: boolean;
}

interface NotificationsProps {
  notifications?: Notification[];
  onBack?: () => void;
  onMarkRead?: (id: string) => void;
  onClearAll?: () => void;
}

export function Notifications({
  notifications = [],
  onBack,
  onMarkRead,
  onClearAll,
}: NotificationsProps) {

  const getIcon = (type: 'order' | 'promotion' | 'delivery') => {
    switch (type) {
      case 'order':
        return 'cube';
      case 'promotion':
        return 'pricetag';
      case 'delivery':
        return 'car';
      default:
        return 'cube';
    }
  };

const handleMarkRead = async (id: string) => {
  if (!auth.currentUser) return;

  await updateDoc(
    doc(db, 'notifications', auth.currentUser.uid, 'items', id),
    { read: true }
  );
};

const handleClearAll = async () => {
  if (!auth.currentUser) return;

  try {
    const userId = auth.currentUser.uid;
    const snap = await getDocs(
      collection(db, 'notifications', userId, 'items')
    );

    await Promise.all(
      snap.docs.map(d =>
        deleteDoc(doc(db, 'notifications', userId, 'items', d.id))
      )
    );
  } catch (e) {
    console.error("Clear notifications error:", e);
  }
};
const db = getFirestore(app);
const [notificationList, setNotificationList] = useState<Notification[]>([]);

useEffect(() => {
  if (!auth.currentUser) return;

  const q = query(
    collection(db, 'notifications', auth.currentUser.uid, 'items'),
    orderBy('createdAt', 'desc')
  );

  const unsubscribe = onSnapshot(q, (snapshot) => {
    const data: Notification[] = snapshot.docs.map(doc => ({
      id: doc.id,
      ...(doc.data() as Omit<Notification, 'id'>),
      time: doc.data().createdAt?.toDate
        ? doc.data().createdAt.toDate().toLocaleString()
        : '',
    }));
    setNotificationList(data);
  });

  return unsubscribe;
}, []);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          {onBack && (
            <TouchableOpacity onPress={onBack} style={styles.backButton}>
              <Ionicons name="chevron-back" size={28} color="#e91e63" />
            </TouchableOpacity>
          )}
          <Text style={styles.headerTitle}>Thông báo</Text>
        </View>
        {notificationList.length > 0 && onClearAll && (
          <TouchableOpacity onPress={handleClearAll}>
            <Text style={styles.clearAllText}>Xóa tất cả</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Notifications List */}
      {notificationList.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="cube" size={64} color="#ffc0cb" />
          <Text style={styles.emptyTitle}>Không có thông báo</Text>
          <Text style={styles.emptyMessage}>Bạn đã cập nhật hết rồi!</Text>
        </View>
      ) : (
        <FlatList
          data={notificationList}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => handleMarkRead(item.id)}
              style={[
                styles.notificationItem,
                !item.read && styles.notificationItemUnread,
              ]}
            >
              <View style={styles.iconContainer}>
                <Ionicons
                  name={getIcon(item.type)}
                  size={20}
                  color="#e91e63"
                />
              </View>
              <View style={styles.notificationContent}>
                <View style={styles.titleRow}>
                  <Text style={styles.notificationTitle}>{item.title}</Text>
                  {!item.read && <View style={styles.unreadDot} />}
                </View>
                <Text style={styles.notificationMessage}>{item.message}</Text>
                <Text style={styles.notificationTime}>{item.time}</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fdf6f8',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderBottomWidth: 1,
    borderBottomColor: '#ffe4ed',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
  },
  clearAllText: {
    fontSize: 14,
    color: '#e91e63',
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
  listContent: {
    padding: 16,
    gap: 12,
  },
  notificationItem: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  notificationItemUnread: {
    borderWidth: 2,
    borderColor: '#ffc0cb',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ffe4ed',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  notificationContent: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#e91e63',
  },
  notificationMessage: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  notificationTime: {
    fontSize: 12,
    color: '#999',
  },
});
