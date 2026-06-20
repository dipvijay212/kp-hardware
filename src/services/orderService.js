import { 
  getFirestore, 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  doc, 
  query, 
  where, 
  orderBy, 
  limit, 
  serverTimestamp 
} from '@react-native-firebase/firestore';

const BUYERS_COLLECTION = 'buyers';
const ORDERS_COLLECTION = 'orders';

/**
 * Registers a wholesale buyer profile in Firestore.
 * @param {Object} buyerData - Owner name, business name, mobile, address, GST.
 * @returns {Promise<string>} - The registered buyer doc ID.
 */
export const registerBuyer = async (buyerData) => {
  try {
    const db = getFirestore();
    const colRef = collection(db, BUYERS_COLLECTION);
    const docRef = await addDoc(colRef, {
      ...buyerData,
      registeredAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error registering buyer: ', error);
    throw error;
  }
};

/**
 * Generates the next sequential order number in format: KP-2026-XXXX.
 * Queries the last created order to increment the index.
 */
const generateOrderNumber = async () => {
  try {
    const db = getFirestore();
    const colRef = collection(db, ORDERS_COLLECTION);
    // Find the last created order
    const q = query(colRef, orderBy('createdAt', 'desc'), limit(1));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return 'KP-2026-0001';
    }

    const lastOrderData = snapshot.docs[0].data();
    const lastNumStr = lastOrderData.orderNumber;
    
    if (lastNumStr && lastNumStr.startsWith('KP-2026-')) {
      const numericPart = lastNumStr.replace('KP-2026-', '');
      const nextNum = parseInt(numericPart, 10) + 1;
      const paddedNum = String(nextNum).padStart(4, '0');
      return `KP-2026-${paddedNum}`;
    }

    return 'KP-2026-0001';
  } catch (error) {
    console.error('Error generating order number: ', error);
    // Safe fallback using random 4 digits
    return `KP-2026-${Math.floor(1000 + Math.random() * 9000)}`;
  }
};

/**
 * Submits a new order request to Firestore.
 * @param {Object} buyerProfile - The buyer's profile details.
 * @param {Array} cartItems - Current items in cart.
 * @param {number} totalPrice - Combined price sum.
 * @param {number} totalItems - Combined item count.
 * @returns {Promise<{ orderId: string, orderNumber: string }>}
 */
export const createOrder = async (buyerProfile, cartItems, totalPrice, totalItems) => {
  try {
    const db = getFirestore();
    const orderNumber = await generateOrderNumber();
    
    // Map cart items into the requested sub-item format
    const items = cartItems.map(item => ({
      productId: item.product.id,
      productName: item.product.name,
      brand: item.product.brand || 'KP Hardware',
      quantity: item.quantity,
      price: item.product.price
    }));

    const totalQuantity = cartItems.reduce((sum, item) => sum + item.quantity, 0);

    const orderDoc = {
      orderNumber,
      buyerId: buyerProfile.id,
      buyerName: buyerProfile.ownerName,
      businessName: buyerProfile.businessName,
      mobileNumber: buyerProfile.mobileNumber,
      gstNumber: buyerProfile.gstNumber || '',
      address: buyerProfile.address,
      status: 'Pending',
      createdAt: serverTimestamp(),
      totalItems,
      totalQuantity,
      totalPrice,
      items
    };

    const colRef = collection(db, ORDERS_COLLECTION);
    const docRef = await addDoc(colRef, orderDoc);
    
    return {
      orderId: docRef.id,
      orderNumber
    };
  } catch (error) {
    console.error('Error creating order in Firestore: ', error);
    throw error;
  }
};

/**
 * Fetches the list of orders for a specific buyer.
 */
export const getOrdersByBuyer = async (buyerId) => {
  try {
    const db = getFirestore();
    const colRef = collection(db, ORDERS_COLLECTION);
    const q = query(colRef, where('buyerId', '==', buyerId), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    
    const orders = [];
    snapshot.forEach(docSnap => {
      orders.push({
        id: docSnap.id,
        ...docSnap.data()
      });
    });
    return orders;
  } catch (error) {
    console.error(`Error loading orders for buyer ${buyerId}: `, error);
    throw error;
  }
};

/**
 * Fetches all orders (Admin utility).
 */
export const getAllOrders = async () => {
  try {
    const db = getFirestore();
    const colRef = collection(db, ORDERS_COLLECTION);
    const q = query(colRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    
    const orders = [];
    snapshot.forEach(docSnap => {
      orders.push({
        id: docSnap.id,
        ...docSnap.data()
      });
    });
    return orders;
  } catch (error) {
    console.error('Error loading all orders for admin: ', error);
    throw error;
  }
};

/**
 * Updates the status of an order (Admin utility).
 */
export const updateOrderStatus = async (orderId, status) => {
  try {
    const db = getFirestore();
    const docRef = doc(db, ORDERS_COLLECTION, orderId);
    await updateDoc(docRef, { status });
  } catch (error) {
    console.error(`Error updating order status for ${orderId}: `, error);
    throw error;
  }
};
