import { 
  getFirestore, 
  collection, 
  getDocs, 
  getDoc,
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  limit, 
  startAfter, 
  query, 
  serverTimestamp 
} from '@react-native-firebase/firestore';

const COLLECTION_NAME = 'products';

/**
 * Fetches all categories from Firestore.
 * @returns {Promise<Array<string>>}
 */
export const getCategories = async () => {
  try {
    const db = getFirestore();
    const colRef = collection(db, 'categories');
    const snapshot = await getDocs(colRef);
    const categories = [];
    snapshot.forEach((docSnap) => {
      if (docSnap.data().name) {
        categories.push(docSnap.data().name);
      }
    });
    return categories;
  } catch (error) {
    console.error('Error fetching categories from Firestore: ', error);
    throw error;
  }
};

/**
  * Fetches a paginated list of products from Firestore.
  * Supports 3000+ products using query limit and startAfter cursor.
  * @param {number} limitValue - Number of documents to fetch per page.
  * @param {Object} startAfterDoc - The last document snapshot of the previous page.
  * @returns {Promise<{ products: Array, lastDoc: Object }>} 
  */
export const getProducts = async (limitValue = 20, startAfterDoc = null) => {
  try {
    const db = getFirestore();
    const colRef = collection(db, COLLECTION_NAME);
    
    let q;
    if (startAfterDoc) {
      q = query(colRef, limit(limitValue), startAfter(startAfterDoc));
    } else {
      q = query(colRef, limit(limitValue));
    }
    
    const snapshot = await getDocs(q);
    const products = [];
    snapshot.forEach((docSnap) => {
      products.push({
        id: docSnap.id,
        ...docSnap.data()
      });
    });

    const lastDoc = snapshot.docs[snapshot.docs.length - 1] || null;
    return { products, lastDoc };
  } catch (error) {
    console.error('Error fetching products from Firestore: ', error);
    throw error;
  }
};

/**
  * Fetches a single product by its Document ID.
  * @param {string} productId - The Firestore document ID.
  * @returns {Promise<Object>}
  */
export const getProductById = async (productId) => {
  try {
    const db = getFirestore();
    const docRef = doc(db, COLLECTION_NAME, productId);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
      throw new Error(`Product with ID ${productId} does not exist`);
    }
    return {
      id: docSnap.id,
      ...docSnap.data()
    };
  } catch (error) {
    console.error(`Error fetching product by ID ${productId}: `, error);
    throw error;
  }
};

/**
  * Adds a new product document to the 'products' collection.
  * @param {Object} productData - The product details.
  * @returns {Promise<string>} - The created document ID.
  */
export const addProduct = async (productData) => {
  try {
    const db = getFirestore();
    const colRef = collection(db, COLLECTION_NAME);
    const docRef = await addDoc(colRef, {
      ...productData,
      createdAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding product to Firestore: ', error);
    throw error;
  }
};

/**
  * Updates an existing product document.
  * @param {string} productId - The document ID of the product.
  * @param {Object} productData - The new fields to update.
  * @returns {Promise<void>}
  */
export const updateProduct = async (productId, productData) => {
  try {
    const db = getFirestore();
    const docRef = doc(db, COLLECTION_NAME, productId);
    await updateDoc(docRef, productData);
  } catch (error) {
    console.error(`Error updating product ${productId} in Firestore: `, error);
    throw error;
  }
};

/**
  * Deletes a product document from Firestore.
  * @param {string} productId - The document ID of the product.
  * @returns {Promise<void>}
  */
export const deleteProduct = async (productId) => {
  try {
    const db = getFirestore();
    const docRef = doc(db, COLLECTION_NAME, productId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error(`Error deleting product ${productId} from Firestore: `, error);
    throw error;
  }
};
