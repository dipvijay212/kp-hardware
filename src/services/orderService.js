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
      quantity: item.quantity
    }));

    const totalQuantity = cartItems.reduce((sum, item) => sum + item.quantity, 0);

    const orderDoc = {
      orderNumber,
      buyerId: buyerProfile.id,
      buyerName: buyerProfile.ownerName,
      businessName: buyerProfile.businessName,
      mobile: buyerProfile.mobileNumber,
      address: buyerProfile.address,
      status: 'Pending',
      internalStatus: 'new', // Added to map to the user's snippet
      createdAt: serverTimestamp(),
      totalProducts: totalItems,
      totalQuantity,
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

export const getOrdersByBuyer = async (buyerId) => {
  console.log(`[Firestore Request] Collection: ${ORDERS_COLLECTION}`);
  console.log(`[Firestore Request] Query Parameters: buyerId == ${buyerId}`);
  try {
    const db = getFirestore();
    const colRef = collection(db, ORDERS_COLLECTION);
    
    // Removing orderBy('createdAt', 'desc') from the query to prevent
    // Firestore composite index missing errors (failed-precondition).
    // We will sort the results in memory instead.
    const q = query(colRef, where('buyerId', '==', buyerId));
    
    console.log(`[Firestore Request] Executing query...`);
    const snapshot = await getDocs(q);
    
    console.log(`[Firestore Response] Documents fetched: ${snapshot.size}`);
    
    const orders = [];
    snapshot.forEach(docSnap => {
      orders.push({
        id: docSnap.id,
        ...docSnap.data()
      });
    });
    
    // Sort in memory (descending)
    orders.sort((a, b) => {
      const timeA = a.createdAt?.seconds || 0;
      const timeB = b.createdAt?.seconds || 0;
      return timeB - timeA;
    });

    return orders;
  } catch (error) {
    console.error(`[Firestore Error] getOrdersByBuyer Failed!`);
    console.error(`[Firestore Error] Code:`, error.code);
    console.error(`[Firestore Error] Message:`, error.message);
    console.error(`[Firestore Error] Actual Object:`, error);
    throw error;
  }
};

