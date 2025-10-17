// --- TRANSLATION DATA ---
const translations = {
    en: { 
        home: "Home", seller_info: "Seller Info", ask_gemini: "Ask Gemini", about: "About", change_language: "Change Language",
        hero_title: "Welcome to ASRAR CLOTHES", hero_subtitle: "Discover the finest collection of modern apparel designed for confidence.", hero_button: "Explore Collection",
        admin_login: "Admin Login", login: "Login", logout: "Logout",
        search_placeholder: "Search by name or description...", our_collection: "Our Collection", wrong_credentials: "Wrong credentials!",
        add_new_product: "Add New Product", product_name: "Product Name", product_price: "Price (TK)", product_description: "Description",
        product_images: "Product Images", images_helper_text: "Please provide direct image URLs. Minimum 3, Maximum 12.",
        add_another_image: "Add Another Image", remove: "Remove", add_product: "Add Product",
        delete_product: "Delete Product", confirm_delete: "Are you sure you want to delete this product?",
        min_3_images_error: "Please provide at least 3 image URLs.",
        login_success: "Login Successful! Admin controls are now active.", logout_success: "You have been logged out.",
        view_details: "View Details", order_now: "Order Now",
    },
    bn: { 
        home: "হোম", seller_info: "বিক্রেতার তথ্য", ask_gemini: "Gemini কে জিজ্ঞাসা করুন", about: "সম্পর্কে", change_language: "ভাষা পরিবর্তন করুন",
        hero_title: "ASRAR CLOTHES-এ স্বাগতম", hero_subtitle: "আত্মবিশ্বাসের জন্য ডিজাইন করা আধুনিক পোশাকের সেরা সংগ্রহ আবিষ্কার করুন।", hero_button: "সংগ্রহ দেখুন",
        admin_login: "অ্যাডমিন লগইন", login: "লগইন", logout: "লগআউট",
        search_placeholder: "নাম বা বর্ণনা দিয়ে অনুসন্ধান করুন...", our_collection: "আমাদের সংগ্রহ", wrong_credentials: "ভুল তথ্য!",
        add_new_product: "নতুন পণ্য যোগ করুন", product_name: "পণ্যের নাম", product_price: "মূল্য (টাকা)", product_description: "পণ্যের বিবরণ",
        product_images: "পণ্যের ছবি", images_helper_text: "সরাসরি ছবির URL দিন। সর্বনিম্ন ৩টি, সর্বোচ্চ ১২টি।",
        add_another_image: "আরেকটি ছবি যোগ করুন", remove: "মুছুন", add_product: "পণ্য যোগ করুন",
        delete_product: "পণ্য মুছুন", confirm_delete: "আপনি কি নিশ্চিতভাবে এই পণ্যটি মুছতে চান?",
        min_3_images_error: "অনুগ্রহ করে কমপক্ষে ৩টি ছবির URL দিন।",
        login_success: "লগইন সফল হয়েছে! অ্যাডমিন কন্ট্রোল এখন সক্রিয়।", logout_success: "আপনাকে লগআউট করা হয়েছে।",
        view_details: "বিস্তারিত দেখুন", order_now: "এখনই অর্ডার করুন",
    }
};

// --- DEFAULT PRODUCT DATA ---
const initialProducts = [
    { 
        id: 'prod1', name: 'Classic Denim Jacket', price: 3500, 
        description: 'A timeless denim jacket perfect for any season. Made with high-quality, durable denim.', 
        images: ['https://images.unsplash.com/photo-1543087902-61618aa2b89a?q=80&w=1200', 'https://images.unsplash.com/photo-1588887463518-e377db7492c3?q=80&w=1200'] 
    },
    { 
        id: 'prod2', name: 'Premium Cotton T-Shirt', price: 1200, 
        description: 'Experience ultimate comfort with our premium cotton T-shirt. Soft, breathable, and designed for a perfect fit.', 
        images: ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=1200', 'https://images.unsplash.com/photo-1622470942513-242385b39943?q=80&w=1200'] 
    }
];

// --- STATE MANAGEMENT ---
let currentLanguage = localStorage.getItem('language') || 'en';
let products = [];
let isAdminLoggedIn = sessionStorage.getItem('isAdminLoggedIn') === 'true';

// --- CORE FUNCTIONS ---
function T(key) { return translations[currentLanguage][key] || key; }

function applyTranslations() {
    document.querySelectorAll('[data-i18n]').forEach(el => el.textContent = T(el.getAttribute('data-i18n')));
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => el.placeholder = T(el.getAttribute('data-i18n-placeholder')));
    createMenuItems();
}

function renderPage(pageId, data = null) {
    document.querySelectorAll('.page-content').forEach(p => p.style.display = 'none');
    const page = document.getElementById(pageId + '-page');
    if (page) {
        page.style.display = 'block';
        window.scrollTo(0, 0);
    }

    // Populate page content
    switch(pageId) {
        case 'home':
            renderHomePage();
            break;
        case 'product-detail':
            if (data) renderProductDetailPage(data);
            break;
        // Add other page rendering functions here if needed
    }
    
    document.getElementById('dropdown-menu').classList.add('hidden');
    lucide.createIcons();
}

function openModal(modalId) { document.getElementById(modalId).classList.remove('hidden'); }

function closeModal(modalId) {
    document.getElementById(modalId).classList.add('hidden');
    if (modalId === 'add-product-modal') {
        document.getElementById('add-product-form').reset();
        resetImageFields();
    }
}

// --- PRODUCT & LOCALSTORAGE ---
function loadProducts() {
    const storedProducts = localStorage.getItem('products');
    products = storedProducts ? JSON.parse(storedProducts) : initialProducts;
    if (!storedProducts) saveProducts();
}

function saveProducts() { localStorage.setItem('products', JSON.stringify(products)); }

function handleAddProduct() {
    const name = document.getElementById('product-name').value.trim();
    const price = parseFloat(document.getElementById('product-price').value);
    const description = document.getElementById('product-description').value.trim();
    
    const imageInputs = document.querySelectorAll('.image-url-input');
    const images = Array.from(imageInputs)
        .map(input => input.value.trim())
        .filter(url => url);

    if (images.length < 3) {
        alert(T('min_3_images_error'));
        return;
    }
    if (!name || !price || !description) {
        alert('Please fill all product details.');
        return;
    }

    products.unshift({ id: 'prod' + Date.now(), name, price, description, images });
    saveProducts();
    renderPage('home');
    closeModal('add-product-modal');
}

function deleteProduct(productId, event) {
    event.stopPropagation();
    if (confirm(T('confirm_delete'))) {
        products = products.filter(p => p.id !== productId);
        saveProducts();
        renderPage('home');
    }
}

// --- DYNAMIC IMAGE FIELD LOGIC ---
const imageContainer = document.getElementById('image-inputs-container');
const addImageBtn = document.getElementById('add-image-field-btn');

function createImageInputField(isRequired = false) {
    const fieldWrapper = document.createElement('div');
    fieldWrapper.className = 'flex items-center gap-2';
    
    const newInput = document.createElement('input');
    newInput.type = 'url';
    newInput.className = 'image-url-input w-full p-2 border rounded-md outline-none focus:ring-2 focus:ring-indigo-400';
    newInput.placeholder = 'https://example.com/image.jpg';
    if (isRequired) newInput.required = true;

    fieldWrapper.appendChild(newInput);

    if (!isRequired) {
        const removeBtn = document.createElement('button');
        removeBtn.type = 'button';
        removeBtn.innerHTML = `<i data-lucide="x-circle" class="w-5 h-5 text-red-500 hover:text-red-700"></i>`;
        removeBtn.onclick = () => {
            fieldWrapper.remove();
            updateAddImageButtonState();
        };
        fieldWrapper.appendChild(removeBtn);
    }
    return fieldWrapper;
}

function updateAddImageButtonState() {
    const currentCount = imageContainer.children.length;
    addImageBtn.disabled = currentCount >= 12;
    lucide.createIcons();
}

function resetImageFields() {
    imageContainer.innerHTML = '';
    for (let i = 0; i < 3; i++) {
        imageContainer.appendChild(createImageInputField(true));
    }
    updateAddImageButtonState();
}

// --- PAGE RENDERING ---
function renderHomePage() {
    const container = document.getElementById('home-page');
    container.innerHTML = `
        <div class="bg-gradient-to-r from-indigo-900 to-indigo-600 text-white p-8 md:p-14 rounded-3xl shadow-2xl text-center">
            <h1 class="text-4xl md:text-6xl font-black mb-4" data-i18n="hero_title"></h1>
            <p class="text-lg md:text-xl opacity-90 mb-8" data-i18n="hero_subtitle"></p>
            <button onclick="document.getElementById('product-grid-section').scrollIntoView()" class="px-8 py-3 font-bold rounded-full bg-white text-indigo-700 hover:bg-gray-100 transition shadow-xl" data-i18n="hero_button"></button>
        </div>
        <input type="text" id="search-input" oninput="handleSearch(this.value)" class="w-full p-4 rounded-full border-2 border-indigo-300 focus:border-indigo-600 shadow-lg outline-none mt-10" data-i18n-placeholder="search_placeholder"/>
        <h2 id="product-grid-section" class="text-3xl md:text-4xl font-extrabold text-gray-800 mt-10 border-b-4 border-indigo-500 pb-3 inline-block" data-i18n="our_collection"></h2>
        <div id="product-list" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-10 mt-6">
            ${products.map(renderProductCard).join('')}
        </div>
    `;
    applyTranslations();
    lucide.createIcons();
}

function renderProductCard(product) {
    const adminDeleteButton = isAdminLoggedIn ? `
        <button onclick="deleteProduct('${product.id}', event)" class="admin-delete-btn" title="${T('delete_product')}">
            <i data-lucide="trash-2" class="w-4 h-4"></i>
        </button>` : '';

    return `
        <div class="product-card-hover bg-white rounded-3xl overflow-hidden shadow-xl transition-all duration-300 transform cursor-pointer relative" 
             onclick='renderPage("product-detail", ${JSON.stringify(product).replace(/'/g, "&apos;")})'>
            ${adminDeleteButton}
            <img src="${product.images[0]}" alt="${product.name}" class="w-full h-80 object-cover hover:scale-105 transition duration-500" onerror="this.src='https://placehold.co/600x400';">
            <div class="p-6 text-center">
                <h3 class="text-xl font-bold text-gray-800 truncate">${product.name}</h3>
                <p class="text-3xl font-extrabold text-indigo-600 my-4">${product.price} TK</p>
                <div class="w-full py-2 font-bold rounded-full bg-indigo-500 text-white hover:bg-indigo-600 transition shadow-md" data-i18n="view_details"></div>
            </div>
        </div>`;
}

function renderProductDetailPage(product) {
    const page = document.getElementById('product-detail-page');
    const otherProducts = products.filter(p => p.id !== product.id).slice(0, 4);
    page.innerHTML = `
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 bg-white p-8 rounded-3xl shadow-2xl">
            <div>
                <img src="${product.images[0]}" class="w-full rounded-2xl shadow-lg">
                <div class="flex gap-4 mt-4">
                    ${product.images.map(img => `<img src="${img}" class="w-24 h-24 object-cover rounded-lg cursor-pointer border-2 hover:border-indigo-500">`).join('')}
                </div>
            </div>
            <div class="flex flex-col">
                <h1 class="text-4xl font-black text-gray-900">${product.name}</h1>
                <p class="text-4xl font-extrabold text-red-600 my-4">${product.price} TK</p>
                <p class="text-gray-700 text-lg leading-relaxed">${product.description}</p>
                <button class="w-full py-3 mt-auto font-bold text-white bg-green-600 rounded-xl shadow-lg hover:bg-green-700 transition" data-i18n="order_now"></button>
            </div>
        </div>
        <h2 class="text-3xl font-extrabold text-gray-800 mt-12 border-b-4 border-indigo-500 pb-3 inline-block" data-i18n="our_collection"></h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-10 mt-6">
            ${otherProducts.map(renderProductCard).join('')}
        </div>
    `;
    applyTranslations();
    lucide.createIcons();
}

function handleSearch(query) {
    const normalizedQuery = query.toLowerCase().trim();
    const filtered = products.filter(p => p.name.toLowerCase().includes(normalizedQuery) || p.description.toLowerCase().includes(normalizedQuery));
    const container = document.getElementById('product-list');
    if (container) {
        container.innerHTML = filtered.map(renderProductCard).join('') || `<p class="col-span-full text-center text-gray-500">No products found.</p>`;
        lucide.createIcons();
    }
}

// --- ADMIN & MENU ---
function handleAdminLogin() {
    const username = document.getElementById('admin-username').value;
    const password = document.getElementById('admin-password').value;
    if (username === 'mmhanas14@gmail.com' && password === 'ANas@2011') {
        isAdminLoggedIn = true;
        sessionStorage.setItem('isAdminLoggedIn', 'true');
        closeModal('admin-login-modal');
        alert(T('login_success'));
        createMenuItems();
        renderPage('home');
    } else {
        alert(T('wrong_credentials'));
    }
}

function handleLogout() {
    isAdminLoggedIn = false;
    sessionStorage.removeItem('isAdminLoggedIn');
    alert(T('logout_success'));
    createMenuItems();
    renderPage('home');
}

function createMenuItems() {
    const menu = document.getElementById('dropdown-menu');
    let menuItemsHTML = [
        { icon: 'home', labelKey: 'home', action: "renderPage('home')" },
        // Add other pages here when their render functions are complete
    ].map(item => `
        <div onclick="${item.action}" class="flex items-center p-3 cursor-pointer text-gray-700 hover:bg-indigo-50 transition">
            <i data-lucide="${item.icon}" class="w-5 h-5 mr-3 text-indigo-600"></i><span data-i18n="${item.labelKey}"></span>
        </div>`).join('');

    menuItemsHTML += `<div class='border-t my-1'></div>`;

    if (isAdminLoggedIn) {
        menuItemsHTML += `
            <div onclick="openModal('add-product-modal');" class="flex items-center p-3 cursor-pointer text-gray-700 hover:bg-indigo-50 transition">
                <i data-lucide="plus-circle" class="w-5 h-5 mr-3 text-green-600"></i><span data-i18n="add_new_product"></span>
            </div>
            <div onclick="handleLogout()" class="flex items-center p-3 cursor-pointer text-gray-700 hover:bg-indigo-50 transition">
                <i data-lucide="log-out" class="w-5 h-5 mr-3 text-red-600"></i><span data-i18n="logout"></span>
            </div>`;
    } else {
        menuItemsHTML += `
            <div onclick="openModal('admin-login-modal');" class="flex items-center p-3 cursor-pointer text-gray-700 hover:bg-indigo-50 transition">
                <i data-lucide="shield" class="w-5 h-5 mr-3 text-indigo-600"></i><span data-i18n="admin_login"></span>
            </div>`;
    }
    menu.innerHTML = menuItemsHTML;
    applyTranslations();
    lucide.createIcons();
}

// --- EVENT LISTENERS & INITIALIZATION ---
function setupEventListeners() {
    document.getElementById('logo-button').addEventListener('click', () => renderPage('home'));
    document.getElementById('menu-button').addEventListener('click', e => {
        e.stopPropagation();
        document.getElementById('dropdown-menu').classList.toggle('hidden');
    });
    document.addEventListener('click', () => {
        document.getElementById('dropdown-menu').classList.add('hidden');
    });
    addImageBtn.addEventListener('click', () => {
        if (imageContainer.children.length < 12) {
            imageContainer.appendChild(createImageInputField());
            updateAddImageButtonState();
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    loadProducts();
    setupEventListeners();
    resetImageFields();
    renderPage('home');
});
