// --- IMPORTS ---
import { initializeFirebase, saveProduct, deleteProduct, toggleAdminMode, isAdmin, userId, products } from './firebase_service.js';
import { enhanceProductDescription, handleGeminiChat } from './gemini_api.js';

// --- TRANSLATION/TEXT CONTENT (Bengali) ---
const T_EN = {
    home: 'Home', add_product: 'Add Product', save: 'Save', cancel: 'Cancel', product_title: 'Product Title', price_bdt: 'Price (BDT)', discount_percent: 'Discount (%)', image_url: 'Image URL', product_description: 'Product Description', product_listing_title: 'ASRAR Exclusive Collection', loading_products: 'Loading Products...', no_products_available: 'No products available. Add some!', edit_product: 'Edit Product', delete_confirm: 'Are you sure you want to delete this product?', product_saved: 'Product saved successfully!', product_deleted: 'Product deleted successfully!', error_saving: 'Error saving product:', error_deleting: 'Error deleting product:', admin_login: 'Admin Login (Mock)', admin_logout: 'Admin Logout (Mock)', fashion_advisor_menu: '✨ Fashion Advisor', fashion_advisor_title: '✨ Gemini Fashion Advisor', chat_welcome_message: 'Hi! I am the Gemini Fashion Advisor. Ask me anything about styling, trends or our products!', type_your_fashion_query: 'Ask your fashion question here...', enhance_description_btn: '✨ Generate Description (AI)', auth_not_ready: 'User authentication not ready.', final_price: 'Final Price', generating: 'Generating', description_generated: 'Description successfully generated!', error_generating_description: 'Failed to generate description. Try again.', gemini_thinking: 'Gemini is thinking', chat_error: 'Sorry, there was an issue with the conversation. Please try again.', sources: 'Sources'
};
const T_BN = {
    home: 'হোম', add_product: 'পণ্য যোগ করুন', save: 'সংরক্ষণ করুন', cancel: 'বাতিল করুন', product_title: 'পণ্যের শিরোনাম', price_bdt: 'মূল্য (টাকা)', discount_percent: 'ডিসকাউন্ট (%)', image_url: 'ছবির URL', product_description: 'পণ্যের বিবরণ', product_listing_title: 'আসরার এক্সক্লুসিভ কালেকশন', loading_products: 'পণ্য লোড হচ্ছে...', no_products_available: 'কোনো পণ্য নেই। অ্যাডমিন মোডে গিয়ে কিছু যোগ করুন!', edit_product: 'পণ্য সম্পাদনা করুন', delete_confirm: 'আপনি কি নিশ্চিত যে এই পণ্যটি মুছে ফেলতে চান?', product_saved: 'পণ্য সফলভাবে সংরক্ষিত হয়েছে!', product_deleted: 'পণ্য সফলভাবে মুছে ফেলা হয়েছে!', error_saving: 'পণ্য সংরক্ষণ করতে ত্রুটি:', error_deleting: 'পণ্য মুছে ফেলতে ত্রুটি:', admin_login: 'অ্যাডমিন লগইন (নকল)', admin_logout: 'অ্যাডমিন লগআউট (নকল)', fashion_advisor_menu: '✨ ফ্যাশন উপদেষ্টা', fashion_advisor_title: '✨ জেমিনি ফ্যাশন উপদেষ্টা', chat_welcome_message: 'হাই! আমি জেমিনি ফ্যাশন উপদেষ্টা। স্টাইলিং, ট্রেন্ড বা আমাদের পণ্য সম্পর্কে যেকোনো কিছু জিজ্ঞেস করুন!', type_your_fashion_query: 'আপনার ফ্যাশন প্রশ্ন এখানে জিজ্ঞেস করুন...', enhance_description_btn: '✨ বিবরণ তৈরি করুন (এআই)', auth_not_ready: 'ব্যবহারকারী প্রমাণীকরণ সম্পূর্ণ হয়নি।', final_price: 'চূড়ান্ত মূল্য', generating: 'তৈরি হচ্ছে', description_generated: 'বিবরণ সফলভাবে তৈরি হয়েছে!', error_generating_description: 'বিবরণ তৈরি করতে ব্যর্থ হয়েছে। আবার চেষ্টা করুন।', gemini_thinking: 'জেমিনি চিন্তা করছে', chat_error: 'দুঃখিত, কথোপকথনে একটি সমস্যা হয়েছে। আবার চেষ্টা করুন।', sources: 'তথ্যসূত্র'
};
export const T = (key) => T_BN[key] || T_EN[key];

// --- DEPENDENCY BRIDGE EXPORTS (Functions exposed to other modules via the window object) ---
window.AppDependencies = window.AppDependencies || {};
window.AppDependencies.T = T;
window.AppDependencies.updateAuthUI = updateAuthUI;
window.AppDependencies.createProductCard = createProductCard; 

// Make utility functions globally accessible for HTML events
window.alertMessage = alertMessage;
window.renderPage = renderPage;
window.closeModal = closeModal;
window.editProduct = editProduct;
window.confirmAndDelete = confirmAndDelete;
window.openProductModal = openProductModal;
window.enhanceProductDescriptionHandler = enhanceProductDescription; // Renamed to avoid confusion with the internal import


// --- CORE UI UTILITY FUNCTIONS ---

// Custom Alert/Message Box (Replaces alert() and confirm())
function alertMessage(message, type) {
    const box = document.getElementById('alert-box');
    const content = document.getElementById('alert-content');

    if (!box || !content) return;
    
    let bgColor, icon;
    if (type === 'success') {
        bgColor = 'bg-green-600'; icon = 'check-circle';
    } else if (type === 'error') {
        bgColor = 'bg-red-600'; icon = 'x-circle';
    } else {
        bgColor = 'bg-blue-600'; icon = 'info';
    }

    content.className = `flex items-center p-4 rounded-xl shadow-xl text-sm text-white ${bgColor}`;
    content.innerHTML = `<i data-lucide="${icon}" class="w-5 h-5 mr-3"></i><span>${message}</span>`;
    lucide.createIcons();

    box.classList.remove('translate-x-full');
    box.classList.add('translate-x-0');

    setTimeout(() => {
        box.classList.remove('translate-x-0');
        box.classList.add('translate-x-full');
    }, 5000);
}
window.AppDependencies.alertMessage = alertMessage; 


// Calculate final price with discount
function calculateFinalPrice(price, discount) {
    if (!price || isNaN(price)) return 0;
    const disc = (discount && !isNaN(discount)) ? discount : 0;
    return price - (price * disc / 100);
}

// --- UI RENDERERS ---

function createProductCard(id, product) {
    const isCurrentUserAdmin = isAdmin; // Access imported state
    const finalPrice = calculateFinalPrice(product.price, product.discount);
    const hasDiscount = product.discount && product.discount > 0;
    
    const adminButtons = isCurrentUserAdmin ? `
        <button onclick="window.editProduct('${id}')" class="absolute top-3 left-3 bg-indigo-500 hover:bg-indigo-600 text-white p-2 rounded-full shadow-lg transition duration-150 z-10">
            <i data-lucide="edit" class="w-4 h-4"></i>
        </button>
        <button onclick="window.confirmAndDelete('${id}')" class="admin-delete-btn">
            <i data-lucide="trash-2" class="w-5 h-5"></i>
        </button>
    ` : '';

    const priceHtml = hasDiscount ? `
        <p class="text-gray-400 text-sm line-through">৳ ${product.price.toLocaleString('bn-BD')}</p>
        <p class="text-2xl font-extrabold text-red-600">৳ ${finalPrice.toLocaleString('bn-BD')}</p>
        <span class="absolute top-2 right-2 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded-full shadow-md">${product.discount}% OFF</span>
    ` : `
        <p class="text-2xl font-extrabold text-indigo-600 pt-5">৳ ${product.price.toLocaleString('bn-BD')}</p>
    `;

    return `
        <div class="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden product-card-hover transition duration-300 relative">
            <div class="h-56 bg-gray-100 flex items-center justify-center relative">
                <img src="${product.imageUrl || 'https://placehold.co/400x300/a7a7a7/ffffff?text=ASRAR+CLOTHES'}" 
                        onerror="this.onerror=null;this.src='https://placehold.co/400x300/a7a7a7/ffffff?text=Image+Load+Failed'"
                        alt="${product.title}" 
                        class="w-full h-full object-cover">
                ${adminButtons}
            </div>
            <div class="p-4">
                <h3 class="text-xl font-bold text-gray-800 mb-2">${product.title}</h3>
                <div class="${hasDiscount ? 'flex items-baseline space-x-2' : ''} relative pb-3">
                    ${priceHtml}
                </div>
                <p class="text-gray-500 text-sm line-clamp-3 mt-2">${product.description}</p>
            </div>
        </div>
    `;
}

function applyTranslations() {
    // This is done once on load
    document.getElementById('current-page-title').textContent = T('home');
    document.querySelectorAll('[data-lang-key]').forEach(el => {
        const key = el.getAttribute('data-lang-key');
        el.textContent = T(key);
    });
    document.querySelectorAll('[data-lang-placeholder]').forEach(el => {
        const key = el.getAttribute('data-lang-placeholder');
        el.setAttribute('placeholder', T(key));
    });
}

function updateAuthUI() {
    const adminMenu = document.getElementById('admin-login-menu');
    const addProductMenu = document.getElementById('add-product-menu');
    
    // Access isAdmin and userId from the imported states
    const isCurrentUserAdmin = isAdmin; 
    const currentUserId = userId;

    if (isCurrentUserAdmin) {
        adminMenu.innerHTML = `<i data-lucide="log-out" class="w-5 h-5 mr-3 text-red-600"></i><span>${T('admin_logout')}</span>`;
        adminMenu.onclick = toggleAdminMode; // Call imported function
        addProductMenu.classList.remove('hidden');
    } else {
        adminMenu.innerHTML = `<i data-lucide="shield" class="w-5 h-5 mr-3 text-indigo-600"></i><span>${T('admin_login')}</span>`;
        adminMenu.onclick = toggleAdminMode; // Call imported function
        addProductMenu.classList.add('hidden');
    }
    
    if (currentUserId) {
        document.getElementById('user-id-display').textContent = currentUserId;
    }

    lucide.createIcons();
}

// --- PAGE & MODAL MANAGEMENT ---

function renderPage(pageId) {
    document.querySelectorAll('.page-content').forEach(page => {
        page.classList.add('hidden');
    });
    const targetPage = document.getElementById(pageId + '-page');
    if (targetPage) {
        targetPage.classList.remove('hidden');
        document.getElementById('current-page-title').textContent = T(pageId);
        document.getElementById('dropdown-menu').classList.add('hidden');
    }
}

function openModal(modalId) { 
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('hidden');
        const content = modal.querySelector('.relative');
        if (content) {
            content.classList.add('modal-enter-active');
            content.classList.remove('modal-enter');
        }
    }
}

function closeModal(modalId) { 
    const modal = document.getElementById(modalId);
    if (modal) {
        const content = modal.querySelector('.relative');
        if (content) {
            content.classList.remove('modal-enter-active');
            content.classList.add('modal-enter');
            setTimeout(() => {
                modal.classList.add('hidden');
            }, 300); 
        } else {
             modal.classList.add('hidden');
        }
    }
}

function openProductModal(id = null) {
    document.getElementById('modal-title').textContent = id ? T('edit_product') : T('add_product');
    document.getElementById('product-form').reset();
    document.getElementById('product-id').value = id || '';
    
    // Admin only button visibility
    const enhanceBtn = document.getElementById('enhance-description-btn');
    if(enhanceBtn) enhanceBtn.classList.toggle('hidden', !isAdmin);
    
    openModal('product-modal');
}


// --- PRODUCT MODAL HANDLERS ---
function setupProductFormSubmission() {
    const form = document.getElementById('product-form');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const id = document.getElementById('product-id').value;
        const productData = {
            title: document.getElementById('product-title').value,
            price: parseFloat(document.getElementById('product-price').value),
            imageUrl: document.getElementById('product-image').value,
            description: document.getElementById('product-description').value,
            // Ensure discount is numeric and capped
            discount: Math.max(0, Math.min(100, parseFloat(document.getElementById('product-discount').value || 0))),
            createdAt: new Date().toISOString()
        };

        if (!productData.title || isNaN(productData.price) || !productData.imageUrl || !productData.description) {
            alertMessage('অনুগ্রহ করে সকল ঘর পূরণ করুন।', 'error');
            return;
        }

        const success = await saveProduct(productData, id); // Call imported function
        if (success) {
            closeModal('product-modal');
            form.reset();
        }
    });
}

function editProduct(id) {
    const product = products[id]; // products is imported state
    if (!isAdmin || !product) return;
    
    document.getElementById('modal-title').textContent = T('edit_product');
    document.getElementById('product-id').value = id;
    document.getElementById('product-title').value = product.title;
    document.getElementById('product-price').value = product.price;
    document.getElementById('product-discount').value = product.discount || 0;
    document.getElementById('product-image').value = product.imageUrl;
    document.getElementById('product-description').value = product.description;
    
    openProductModal(id);
}

function confirmAndDelete(id) {
    if (!isAdmin) return;
    
    if (confirm(T('delete_confirm'))) {
        deleteProduct(id); // Call imported function
    }
}

// --- CHAT LOGIC (UI Specific) ---
function appendMessage(text, sender, rawHtml = false) {
    const chatContainer = document.getElementById('chat-messages');
    if (!chatContainer) return;
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `flex mb-4 ${sender === 'user' ? 'justify-end' : 'justify-start'}`;
    
    const contentClass = sender === 'user' 
        ? 'bg-indigo-600 text-white rounded-2xl rounded-tr-none' 
        : 'bg-white text-gray-800 rounded-2xl rounded-tl-none border border-gray-200 shadow-lg';
    
    messageDiv.innerHTML = `
        <div class="max-w-xs sm:max-w-md px-4 py-3 shadow-md text-base chat-message-bubble ${contentClass}">
            ${text}
        </div>
    `;
    chatContainer.appendChild(messageDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;
}
window.appendMessage = appendMessage; // Exposed for gemini_api.js

// --- INITIALIZATION AND EVENT LISTENERS ---
function setupEventListeners() {
    document.getElementById('menu-button').addEventListener('click', () => { document.getElementById('dropdown-menu').classList.toggle('hidden'); });
    document.addEventListener('click', (e) => {
        const menu = document.getElementById('dropdown-menu');
        const button = document.getElementById('menu-button');
        if (menu && button && !menu.contains(e.target) && !button.contains(e.target)) {
            closeModal('dropdown-menu');
        }
    });
    
    // Set up initial product modal open logic (only calls openProductModal with no ID)
    const addProductMenu = document.getElementById('add-product-menu');
    if(addProductMenu) {
        addProductMenu.addEventListener('click', () => {
            window.openProductModal();
            window.closeModal('dropdown-menu');
        });
    }
    
    setupProductFormSubmission(); // Setup form submit handler

    const chatForm = document.getElementById('chat-form');
    if (chatForm) {
        chatForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleGeminiChat(); // Call imported function from gemini_api.js
        });
    }
}

// --- MAIN INITIALIZATION ---
window.onload = async function() {
    // 1. Initialize Firebase (Auth happens here, which triggers loadProducts)
    await initializeFirebase(); 
    
    // 2. Setup UI and Events
    setupEventListeners();
    applyTranslations();
    
    // 3. Render initial page
    renderPage('home'); 
    lucide.createIcons();
};
