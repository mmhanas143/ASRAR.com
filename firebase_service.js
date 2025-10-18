// --- FIREBASE AND AUTH IMPORTS ---
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore, doc, setDoc, onSnapshot, collection, deleteDoc } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";
import { setLogLevel } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

// Use Debug logging for firestore
setLogLevel('Debug');

// --- GLOBAL ENVIRONMENT VARIABLES ---
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : null;
const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

// --- APPLICATION STATE (Exported for use in other modules) ---
export let db;
export let auth;
export let userId = null;
export let isAdmin = false;
export let products = {}; // Product data cache

// --- CONSTANTS ---
const PRODUCTS_COLLECTION_PATH = (uid) => `artifacts/${appId}/users/${uid}/products`;

// --- DEPENDENCY BRIDGE ---
// This object acts as a bridge for app_logic to inject its UI update functions (since JS modules can't circular import).
window.AppDependencies = window.AppDependencies || {};

// --- FIREBASE AND AUTH INITIALIZATION ---
export async function initializeFirebase() {
    if (!firebaseConfig) { 
        console.error("Firebase config is missing. Running in mock mode."); 
        auth = { currentUser: { uid: 'mock-user-' + Math.random().toString(36).substring(2, 9) } };
        userId = auth.currentUser.uid;
        if (window.AppDependencies.updateAuthUI) window.AppDependencies.updateAuthUI();
        return;
    }
    
    const app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    auth = getAuth(app);
    
    // Set up authentication listener
    onAuthStateChanged(auth, (user) => {
        if (user) {
            userId = user.uid;
        } else {
            userId = null;
        }
        
        // Update UI logic after auth state changes
        if (window.AppDependencies.updateAuthUI) window.AppDependencies.updateAuthUI();
        
        if (userId) {
            loadProducts();
        }
    });

    // Sign in with custom token or anonymously
    try {
        if (initialAuthToken) {
            await signInWithCustomToken(auth, initialAuthToken);
        } else {
            await signInAnonymously(auth);
        }
    } catch (error) {
        console.error("Firebase Auth Error:", error);
        await signInAnonymously(auth); 
    }
}

// --- FIRESTORE CRUD OPERATIONS ---

function getProductsRef() {
    if (!db || !userId) return null;
    return collection(db, PRODUCTS_COLLECTION_PATH(userId));
}

export function loadProducts() {
    const grid = document.getElementById('products-grid');
    const loading = document.getElementById('loading-indicator');
    const noProducts = document.getElementById('no-products-message');
    
    if (!db || !userId) {
        if (window.AppDependencies.T) {
            grid.innerHTML = `<p class="text-center text-red-500">${window.AppDependencies.T('loading_products').replace('লোড হচ্ছে', 'প্রমাণীকরণ চলছে...')}</p>`;
        }
        return;
    }

    loading.classList.remove('hidden');
    grid.innerHTML = '';
    noProducts.classList.add('hidden');

    const q = getProductsRef();
    
    // Real-time listener for products
    onSnapshot(q, (snapshot) => {
        loading.classList.add('hidden');
        products = {};
        
        if (snapshot.empty) {
            noProducts.classList.remove('hidden');
            grid.innerHTML = '';
            return;
        }
        
        let productHtml = '';
        snapshot.forEach(doc => {
            const data = doc.data();
            products[doc.id] = {...data, id: doc.id};
            // Use the renderer from AppDependencies
            if (window.AppDependencies.createProductCard) {
                productHtml += window.AppDependencies.createProductCard(doc.id, data);
            }
        });

        grid.innerHTML = productHtml;
        noProducts.classList.add('hidden');
        lucide.createIcons(); 
    }, (error) => {
        console.error("Error loading products:", error);
        loading.classList.add('hidden');
        if (window.AppDependencies.T) {
             grid.innerHTML = `<p class="text-center text-red-500">${window.AppDependencies.T('loading_products').replace('লোড হচ্ছে', 'লোড করতে ব্যর্থ হয়েছে')}</p>`;
        }
    });
}

export async function saveProduct(productData, id) {
    if (!userId) {
        if (window.AppDependencies.alertMessage) window.AppDependencies.alertMessage(window.AppDependencies.T('auth_not_ready') || 'ব্যবহারকারী প্রমাণীকরণ সম্পূর্ণ হয়নি।', 'error');
        return false;
    }
    
    try {
        const productId = id || Math.random().toString(36).substring(2, 10);
        const productRef = doc(db, PRODUCTS_COLLECTION_PATH(userId), productId);
        
        productData.discount = productData.discount || 0; 
        
        await setDoc(productRef, productData);
        if (window.AppDependencies.alertMessage) window.AppDependencies.alertMessage(window.AppDependencies.T('product_saved'), 'success');
        return true;
    } catch (error) {
        console.error(window.AppDependencies.T('error_saving'), error);
        if (window.AppDependencies.alertMessage) window.AppDependencies.alertMessage(`${window.AppDependencies.T('error_saving')} ${error.message}`, 'error');
        return false;
    }
}

export async function deleteProduct(id) {
    if (!isAdmin) {
        console.warn("Attempted delete without admin privileges.");
        return false;
    }
    
    try {
        await deleteDoc(doc(db, PRODUCTS_COLLECTION_PATH(userId), id));
        if (window.AppDependencies.alertMessage) window.AppDependencies.alertMessage(window.AppDependencies.T('product_deleted'), 'success');
        return true;
    } catch (error) {
        console.error(window.AppDependencies.T('error_deleting'), error);
        if (window.AppDependencies.alertMessage) window.AppDependencies.alertMessage(`${window.AppDependencies.T('error_deleting')} ${error.message}`, 'error');
        return false;
    }
}

export function toggleAdminMode() {
    isAdmin = !isAdmin;
    if (window.AppDependencies.updateAuthUI) window.AppDependencies.updateAuthUI();
    
    loadProducts(); 
    
    if (window.AppDependencies.alertMessage) window.AppDependencies.alertMessage(isAdmin ? 'অ্যাডমিন মোড সক্রিয় হয়েছে!' : 'অ্যাডমিন মোড নিষ্ক্রিয় হয়েছে।', 'info');
}
