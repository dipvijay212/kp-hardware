import React, { useState, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  ActivityIndicator, 
  Modal, 
  TextInput, 
  ScrollView, 
  Alert,
  StatusBar,
  RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Header from '../components/Header';
import { getOrdersByBuyer } from '../services/orderService';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS, SHADOWS } from '../theme/theme';

export const OrderHistoryScreen = () => {
  const navigation = useNavigation();

  const [buyerProfile, setBuyerProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [orders, setOrders] = useState([]);
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal detail sheet state
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailVisible, setDetailVisible] = useState(false);

  const loadProfileAndOrders = async (isRefresh = false) => {
    if (!isRefresh) setLoading(true);
    try {
      const storedProfile = await AsyncStorage.getItem('@buyer_profile');
      if (storedProfile) {
        const parsed = JSON.parse(storedProfile);
        setBuyerProfile(parsed);
        const fetched = await getOrdersByBuyer(parsed.id);
        setOrders(fetched);
      } else {
        Alert.alert(
          'Registration Required',
          'Please register your wholesale profile to view order history logs.',
          [
            {
              text: 'Register Now',
              onPress: () => navigation.navigate('BuyerInformation', { redirectTo: 'OrderHistory' })
            },
            {
              text: 'Cancel',
              onPress: () => navigation.navigate('Home')
            }
          ]
        );
      }
    } catch (err) {
      console.error('[OrderHistoryScreen] Error fetching order logs:');
      console.error('[OrderHistoryScreen] Error Object:', err);
      if (err.code) console.error('[OrderHistoryScreen] Error Code:', err.code);
      if (err.message) console.error('[OrderHistoryScreen] Error Message:', err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadProfileAndOrders();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadProfileAndOrders(true);
  };

  // Filter orders by search queries
  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.orderNumber?.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
      order.businessName?.toLowerCase().includes(searchQuery.toLowerCase().trim());
      
    return matchesSearch;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return COLORS.warning;
      case 'Confirmed': return COLORS.primary;
      case 'Packed': return '#9C27B0';
      case 'Dispatched': return '#00BCD4';
      case 'Delivered': return COLORS.success;
      case 'Cancelled': return COLORS.danger;
      default: return COLORS.textSecondary;
    }
  };

  const openOrderDetail = (order) => {
    setSelectedOrder(order);
    setDetailVisible(true);
  };

  const renderOrderItem = ({ item }) => {
    const orderDate = item.createdAt ? new Date(item.createdAt.seconds * 1000).toLocaleDateString('en-IN') : 'Just now';
    return (
      <TouchableOpacity 
        style={[styles.orderCard, SHADOWS.subtle]}
        onPress={() => openOrderDetail(item)}
        activeOpacity={0.8}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.orderNo}>{item.orderNumber}</Text>
          <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(item.status)}18` }]}>
            <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>{item.status || 'Pending'}</Text>
          </View>
        </View>

        <View style={styles.cardFooter}>
          <Text style={styles.cardDate}>Date: {orderDate}</Text>
          <Text style={styles.cardQty}>Total: {item.totalQuantity} items</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={COLORS.white} barStyle="dark-content" />
      <Header title="Wholesale Order Logs" showBackButton={true} showCart={false} />

      <View style={styles.headerSection}>
        <Text style={styles.sectionTitle}>My Orders</Text>
      </View>

      <View style={styles.searchWrapper}>
        <Icon name="search-outline" size={18} color={COLORS.textSecondary} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search your orders..."
          placeholderTextColor={COLORS.textLight}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Main content list */}
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Fetching order summaries...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredOrders}
          renderItem={renderOrderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
          }
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <Icon name="receipt-outline" size={48} color={COLORS.textLight} />
              <Text style={styles.emptyTitle}>No Orders Found</Text>
              <Text style={styles.emptySubtitle}>
                No order requests were found matching your search.
              </Text>
            </View>
          )}
        />
      )}

      {/* Details Sheet Modal */}
      <Modal
        visible={detailVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setDetailVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedOrder && (
              <>
                <View style={styles.modalHeader}>
                  <View>
                    <Text style={styles.modalHeaderTitle}>{selectedOrder.orderNumber}</Text>
                    <Text style={styles.modalHeaderSubtitle}>
                      {selectedOrder.createdAt ? new Date(selectedOrder.createdAt.seconds * 1000).toLocaleString('en-IN') : 'Just now'}
                    </Text>
                  </View>
                  <TouchableOpacity onPress={() => setDetailVisible(false)} style={styles.closeBtn}>
                    <Icon name="close" size={24} color={COLORS.textPrimary} />
                  </TouchableOpacity>
                </View>

                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.modalScroll}>
                  {/* Buyer Section */}
                  <View style={styles.modalCard}>
                    <Text style={styles.modalCardTitle}>Buyer Profile</Text>
                    <Text style={styles.modalCardText}><Text style={styles.modalBold}>Business:</Text> {selectedOrder.businessName}</Text>
                    <Text style={styles.modalCardText}><Text style={styles.modalBold}>Owner:</Text> {selectedOrder.buyerName}</Text>
                    <Text style={styles.modalCardText}><Text style={styles.modalBold}>Phone:</Text> {selectedOrder.mobile || selectedOrder.mobileNumber}</Text>
                    {selectedOrder.gstNumber ? (
                      <Text style={styles.modalCardText}><Text style={styles.modalBold}>GST IN:</Text> {selectedOrder.gstNumber}</Text>
                    ) : null}
                    <Text style={styles.modalCardText}><Text style={styles.modalBold}>Address:</Text> {selectedOrder.address}</Text>
                  </View>

                  {/* Items Section */}
                  <View style={styles.modalCard}>
                    <Text style={styles.modalCardTitle}>Subtotal Items</Text>
                    {selectedOrder.items?.map((item, idx) => (
                      <View key={idx} style={styles.itemRow}>
                        <View style={styles.itemInfo}>
                          <Text style={styles.itemName} numberOfLines={1}>{item.productName}</Text>
                          <Text style={styles.itemBrand}>{item.brand}</Text>
                        </View>
                        <Text style={styles.itemQty}>x{item.quantity}</Text>
                        {item.price ? <Text style={styles.itemPrice}>₹{(item.price * item.quantity).toLocaleString('en-IN')}</Text> : null}
                      </View>
                    ))}
                    {selectedOrder.totalPrice ? (
                      <>
                        <View style={styles.modalDivider} />
                        <View style={styles.totalRow}>
                          <Text style={styles.totalLabel}>Grand Estimate Amount:</Text>
                          <Text style={styles.totalValue}>₹{Number(selectedOrder.totalPrice || 0).toLocaleString('en-IN')}</Text>
                        </View>
                      </>
                    ) : null}
                  </View>
                </ScrollView>
              </>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  headerSection: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.sm,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.primary,
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.secondary,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    height: 40,
    marginHorizontal: SPACING.md,
    paddingHorizontal: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  searchIcon: {
    marginRight: 6,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: COLORS.textPrimary,
    paddingVertical: 0,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  loadingText: {
    marginTop: SPACING.sm,
    color: COLORS.textSecondary,
    fontSize: 13,
  },
  listContent: {
    padding: SPACING.md,
    paddingBottom: SPACING.xl,
  },
  orderCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderNo: {
    fontSize: 15,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.primary,
  },
  statusBadge: {
    borderRadius: BORDER_RADIUS.sm,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  statusText: {
    fontSize: 11,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: SPACING.xs + 2,
  },
  cardDate: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  cardQty: {
    fontSize: 12,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.textPrimary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: BORDER_RADIUS.lg,
    borderTopRightRadius: BORDER_RADIUS.lg,
    maxHeight: '90%',
    minHeight: '60%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalHeaderTitle: {
    fontSize: 18,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.primary,
  },
  modalHeaderSubtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  closeBtn: {
    padding: 4,
  },
  modalScroll: {
    padding: SPACING.md,
    paddingBottom: SPACING.xl,
  },
  modalCard: {
    backgroundColor: COLORS.secondary,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  modalCardTitle: {
    fontSize: 14,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.primary,
    marginBottom: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingBottom: 4,
  },
  modalCardText: {
    fontSize: 13,
    color: COLORS.textPrimary,
    lineHeight: 18,
    marginBottom: 4,
  },
  modalBold: {
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.textSecondary,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.textPrimary,
  },
  itemBrand: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  itemQty: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: TYPOGRAPHY.weights.bold,
    paddingHorizontal: SPACING.sm,
  },
  itemPrice: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  modalDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: SPACING.sm,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 13,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.textPrimary,
  },
  totalValue: {
    fontSize: 15,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.primary,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 60,
    paddingHorizontal: SPACING.xl,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
});

export default OrderHistoryScreen;
