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
  StatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Header from '../components/Header';
import { getOrdersByBuyer, getAllOrders, updateOrderStatus } from '../services/orderService';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS, SHADOWS } from '../theme/theme';

const STATUSES = ['All', 'Pending', 'Confirmed', 'Packed', 'Dispatched', 'Delivered', 'Cancelled'];
const UPDATE_STATUSES = ['Pending', 'Confirmed', 'Packed', 'Dispatched', 'Delivered', 'Cancelled'];

export const OrderHistoryScreen = () => {
  const navigation = useNavigation();

  const [buyerProfile, setBuyerProfile] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  
  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');
  
  // Modal detail sheet state
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailVisible, setDetailVisible] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState(false);

  const loadProfileAndOrders = async () => {
    setLoading(true);
    try {
      const storedProfile = await AsyncStorage.getItem('@buyer_profile');
      if (storedProfile) {
        const parsed = JSON.parse(storedProfile);
        setBuyerProfile(parsed);
        // Load initial orders based on role toggle (default: Buyer My Orders)
        const fetched = await getOrdersByBuyer(parsed.id);
        setOrders(fetched);
      } else {
        // If not registered, prompt redirect
        Alert.alert(
          'Registration Required',
          'Please register your wholesale profile to view order history logs.',
          [
            {
              text: 'Register Now',
              onPress: () => navigation.navigate('BuyerRegistration', { redirectTo: 'OrderHistory' })
            },
            {
              text: 'Cancel',
              onPress: () => navigation.navigate('Home')
            }
          ]
        );
      }
    } catch (err) {
      console.error('Error fetching order logs', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfileAndOrders();
  }, []);

  const handleRoleToggle = async (adminMode) => {
    setIsAdmin(adminMode);
    setLoading(true);
    try {
      if (adminMode) {
        // Load all database orders
        const fetched = await getAllOrders();
        setOrders(fetched);
      } else if (buyerProfile) {
        // Load buyer-specific orders
        const fetched = await getOrdersByBuyer(buyerProfile.id);
        setOrders(fetched);
      }
    } catch (err) {
      Alert.alert('Load Error', 'Unable to fetch orders from database.');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    setStatusUpdating(true);
    try {
      await updateOrderStatus(orderId, newStatus);
      Alert.alert('Success', `Order status updated to: ${newStatus}`);
      
      // Update local state in selected order modal
      setSelectedOrder(prev => prev ? { ...prev, status: newStatus } : null);
      
      // Reload main orders list
      if (isAdmin) {
        const fetched = await getAllOrders();
        setOrders(fetched);
      } else if (buyerProfile) {
        const fetched = await getOrdersByBuyer(buyerProfile.id);
        setOrders(fetched);
      }
    } catch (err) {
      Alert.alert('Update Failed', 'Could not update order status.');
    } finally {
      setStatusUpdating(false);
    }
  };

  // Filter orders by status and search queries
  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.orderNumber?.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
      order.businessName?.toLowerCase().includes(searchQuery.toLowerCase().trim());
      
    const matchesStatus = selectedStatus === 'All' || order.status === selectedStatus;
    
    return matchesSearch && matchesStatus;
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
            <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>{item.status}</Text>
          </View>
        </View>

        {isAdmin && (
          <Text style={styles.cardBusiness}>{item.businessName}</Text>
        )}

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

      {/* Role Toggle Selector */}
      <View style={styles.toggleBar}>
        <TouchableOpacity 
          style={[styles.toggleBtn, !isAdmin && styles.toggleBtnActive]}
          onPress={() => handleRoleToggle(false)}
        >
          <Icon name="person-outline" size={16} color={!isAdmin ? COLORS.white : COLORS.primary} />
          <Text style={[styles.toggleBtnText, !isAdmin && styles.toggleBtnActiveText]}>My Orders</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.toggleBtn, isAdmin && styles.toggleBtnActive]}
          onPress={() => handleRoleToggle(true)}
        >
          <Icon name="shield-checkmark-outline" size={16} color={isAdmin ? COLORS.white : COLORS.primary} />
          <Text style={[styles.toggleBtnText, isAdmin && styles.toggleBtnActiveText]}>Admin View</Text>
        </TouchableOpacity>
      </View>

      {/* Admin controls: Search and Status Chips */}
      {isAdmin && (
        <View style={styles.adminFilters}>
          <View style={styles.searchWrapper}>
            <Icon name="search-outline" size={18} color={COLORS.textSecondary} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search by order ID or business..."
              placeholderTextColor={COLORS.textLight}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            contentContainerStyle={styles.statusScroll}
          >
            {STATUSES.map(status => (
              <TouchableOpacity
                key={status}
                style={[
                  styles.statusChip,
                  selectedStatus === status ? styles.statusChipActive : styles.statusChipInactive
                ]}
                onPress={() => setSelectedStatus(status)}
              >
                <Text style={[
                  styles.statusChipText,
                  selectedStatus === status ? styles.statusChipActiveText : styles.statusChipInactiveText
                ]}>
                  {status}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

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
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <Icon name="receipt-outline" size={48} color={COLORS.textLight} />
              <Text style={styles.emptyTitle}>No Orders Found</Text>
              <Text style={styles.emptySubtitle}>
                No order requests were found matching the selected filters.
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
                    <Text style={styles.modalCardText}><Text style={styles.modalBold}>Phone:</Text> {selectedOrder.mobileNumber}</Text>
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
                        <Text style={styles.itemPrice}>₹{(item.price * item.quantity).toLocaleString('en-IN')}</Text>
                      </View>
                    ))}
                    <View style={styles.modalDivider} />
                    <View style={styles.totalRow}>
                      <Text style={styles.totalLabel}>Grand Estimate Amount:</Text>
                      <Text style={styles.totalValue}>₹{Number(selectedOrder.totalPrice || 0).toLocaleString('en-IN')}</Text>
                    </View>
                  </View>

                  {/* Status Panel (Admin mode) */}
                  {isAdmin && (
                    <View style={styles.modalCard}>
                      <Text style={styles.modalCardTitle}>Modify Order Status (Admin Only)</Text>
                      
                      {statusUpdating ? (
                        <ActivityIndicator size="small" color={COLORS.primary} style={{ margin: SPACING.sm }} />
                      ) : (
                        <View style={styles.statusButtonsContainer}>
                          {UPDATE_STATUSES.map(status => (
                            <TouchableOpacity
                              key={status}
                              style={[
                                styles.statusUpdateBtn,
                                selectedOrder.status === status ? { backgroundColor: getStatusColor(status) } : styles.statusUpdateBtnInactive
                              ]}
                              onPress={() => handleStatusChange(selectedOrder.id, status)}
                            >
                              <Text style={[
                                styles.statusUpdateBtnText,
                                selectedOrder.status === status ? { color: COLORS.white } : { color: COLORS.textPrimary }
                              ]}>
                                {status}
                              </Text>
                            </TouchableOpacity>
                          ))}
                        </View>
                      )}
                    </View>
                  )}
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
  toggleBar: {
    flexDirection: 'row',
    backgroundColor: COLORS.secondary,
    borderRadius: BORDER_RADIUS.md,
    marginHorizontal: SPACING.md,
    marginVertical: SPACING.sm,
    padding: 2,
  },
  toggleBtn: {
    flex: 1,
    height: 38,
    borderRadius: BORDER_RADIUS.md,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  toggleBtnActive: {
    backgroundColor: COLORS.primary,
  },
  toggleBtnText: {
    fontSize: 13,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.primary,
    marginLeft: 6,
  },
  toggleBtnActiveText: {
    color: COLORS.white,
  },
  // Admin search & chips filters
  adminFilters: {
    backgroundColor: COLORS.white,
    paddingBottom: SPACING.sm,
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
  statusScroll: {
    paddingLeft: SPACING.md,
  },
  statusChip: {
    paddingHorizontal: 12,
    height: 30,
    borderRadius: BORDER_RADIUS.round,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
    borderWidth: 1,
  },
  statusChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  statusChipInactive: {
    backgroundColor: COLORS.secondary,
    borderColor: COLORS.border,
  },
  statusChipText: {
    fontSize: 12,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  statusChipActiveText: {
    color: COLORS.white,
  },
  statusChipInactiveText: {
    color: COLORS.textPrimary,
  },
  // List styling
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
    borderRadius: BORDER_RADIUS.lg, // 16px
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
  cardBusiness: {
    fontSize: 13,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.textPrimary,
    marginTop: 4,
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
  // Modal layout
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
  // Sub-items rows
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
  },
  itemInfo: {
    flex: 1,
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
  modalCardTitleUpdate: {
    fontSize: 13,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  statusButtonsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: SPACING.xs,
  },
  statusUpdateBtn: {
    paddingHorizontal: 12,
    height: 32,
    borderRadius: BORDER_RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statusUpdateBtnInactive: {
    backgroundColor: COLORS.white,
  },
  statusUpdateBtnText: {
    fontSize: 12,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  // Empty State styling
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
