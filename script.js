// --- MODAL & ORDERING ---
    function openModal(modalId) { 
        const modal = document.getElementById(modalId);
        if(modal) modal.classList.remove('hidden'); 
    }
    function closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if(modal) modal.classList.add('hidden');
        if (modalId === 'add-product-modal') {
            document.getElementById('add-product-form').reset();
            resetImageFields();
        }
    }
    function submitOrder() { /* Logic for submitting order via WhatsApp */ }


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
        const images = Array.from(document.querySelectorAll('.image-url-input')).map(input => input.value.trim()).filter(url => url);

        if (images.length < 3) { alert(T('min_3_images_error')); return; }
        if (!name || !price || !description) { alert('Please fill all product details.'); return; }

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
            removeBtn.onclick = () => { fieldWrapper.remove(); updateAddImageButtonState(); };
            fieldWrapper.appendChild(removeBtn);
        }
        return fieldWrapper;
    }

    function updateAddImageButtonState() {
        const imageContainer = document.getElementById('image-inputs-container');
        const addImageBtn = document.getElementById('add-image-field-btn');
        const currentCount = imageContainer.children.length;
        addImageBtn.disabled = currentCount >= 12;
        lucide.createIcons();
    }

    function resetImageFields() {
        const imageContainer = document.getElementById('image-inputs-container');
        imageContainer.innerHTML = '';
        for (let i = 0; i < 3; i++) {
            imageContainer.appendChild(createImageInputField(true));
        }
        updateAddImageButtonState();
    }

    // --- PAGE RENDERERS ---
    function renderHomePage() {
        const container = document.getElementById('home-page');
        container.innerHTML = `
            <div class="space-y-10">
                <div class="bg-gradient-to-r from-indigo-900 to-indigo-600 text-white p-8 md:p-14 rounded-3xl shadow-2xl text-center">
                    <h1 class="text-4xl md:text-6xl font-black mb-4" data-i18n="hero_title"></h1>
                    <p class="text-lg md:text-xl opacity-90 mb-8" data-i18n="hero_subtitle"></p>
                    <button onclick="document.getElementById('product-grid-section').scrollIntoView()" class="px-8 py-3 font-bold rounded-full bg-white text-indigo-700 hover:bg-gray-100 transition shadow-xl" data-i18n="hero_button"></button>
                </div>
                <input type="text" id="search-input" oninput="handleSearch(this.value)" class="w-full p-4 rounded-full border-2 border-indigo-300 focus:border-indigo-600 shadow-lg outline-none" data-i18n-placeholder="search_placeholder"/>
                <h2 id="product-grid-section" class="text-3xl md:text-4xl font-extrabold text-gray-800 border-b-4 border-indigo-500 pb-3 inline-block" data-i18n="our_collection"></h2>
                <div id="product-list" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-10">
                    ${products.map(renderProductCard).join('')}
                </div>
            </div>
        `;
        // Staggered animation for product cards
        document.querySelectorAll('#product-list .product-card').forEach((card, index) => {
            card.style.animationDelay = `${index * 100}ms`;
        });
        applyTranslations();
    }
    
    function renderProductCard(product) {
        const adminDeleteButton = isAdminLoggedIn ? `<button onclick="deleteProduct('${product.id}', event)" class="admin-delete-btn"><i data-lucide="trash-2" class="w-4 h-4"></i></button>` : '';
        return `
            <div class="product-card product-card-hover bg-white rounded-3xl overflow-hidden shadow-xl transition-all duration-300 transform cursor-pointer relative" 
                 onclick='renderPage("product-detail", ${JSON.stringify(product).replace(/'/g, "&apos;")})'>
                ${adminDeleteButton}
                <img src="${product.images[0]}" alt="${product.name}" class="w-full h-80 object-cover hover:scale-105 transition duration-500" onerror="this.src='https://placehold.co/600x400';">
                <div class="p-6 text-center">
                    <h3 class="text-xl font-bold text-gray-800 truncate">${product.name}</h3>
                    <p class="text-3xl font-extrabold text-indigo-600 my-4">${product.price} TK</p>
                    <div class="w-full py-2 font-bold rounded-full bg-indigo-500 text-white" data-i18n="view_details"></div>
                </div>
            </div>`;
    }

    function renderProductDetailPage(product) {
        const page = document.getElementById('product-detail-page');
        const otherProducts = products.filter(p => p.id !== product.id).slice(0, 4);
        let currentImageIndex = 0;
        
        page.innerHTML = `
            <div class="grid grid-cols-1 lg:grid-cols-5 gap-12 bg-white p-8 rounded-3xl shadow-2xl">
                <div class="lg:col-span-3">
                    <img id="main-product-image" src="${product.images[0]}" class="w-full h-[500px] object-cover rounded-2xl shadow-lg transition-all duration-300">
                    <div id="thumbnail-container" class="flex gap-4 mt-4 overflow-x-auto">
                        ${product.images.map((img, index) => `<img src="${img}" class="w-24 h-24 object-cover rounded-lg cursor-pointer border-2 ${index === 0 ? 'border-indigo-500' : 'border-transparent'} hover:border-indigo-500">`).join('')}
                    </div>
                </div>
                <div class="lg:col-span-2 flex flex-col">
                    <h1 class="text-4xl font-black text-gray-900">${product.name}</h1>
                    <p class="text-4xl font-extrabold text-red-600 my-4">${product.price} TK</p>
                    <p class="text-gray-700 text-lg leading-relaxed flex-grow">${product.description}</p>
                    <button class="w-full py-3 mt-6 font-bold text-white bg-green-600 rounded-xl shadow-lg hover:bg-green-700 transition" data-i18n="order_now"></button>
                </div>
            </div>
            <h2 class="text-3xl font-extrabold text-gray-800 mt-12 border-b-4 border-indigo-500 pb-3 inline-block" data-i18n="other_products"></h2>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-10 mt-6">
                ${otherProducts.map(renderProductCard).join('')}
            </div>`;

        const thumbnails = page.querySelectorAll('#thumbnail-container img');
        thumbnails.forEach((thumb, index) => {
            thumb.addEventListener('click', () => {
                document.getElementById('main-product-image').src = product.images[index];
                thumbnails.forEach(t => t.classList.remove('border-indigo-500'));
                thumb.classList.add('border-indigo-500');
            });
        });
        applyTranslations();
    }
    
    function renderSellerInfoPage(){ /* HTML for Seller Info Page */ }
    function renderAskGeminiPage(){ /* HTML for Gemini Chat Page */ }
    function renderAboutPage(){ /* HTML for About Page */ }

    function handleSearch(query) {
        const normalizedQuery = query.toLowerCase().trim();
        const filtered = products.filter(p => p.name.toLowerCase().includes(normalizedQuery) || p.description.toLowerCase().includes(normalizedQuery));
        const container = document.getElementById('product-list');
        if (container) {
            container.innerHTML = filtered.map(renderProductCard).join('') || `<p class="col-span-full text-center text-gray-500">No products found.</p>`;
            document.querySelectorAll('#product-list .product-card').forEach((card, index) => {
                card.style.animationDelay = `${index * 50}ms`;
            });
            lucide.createIcons();
        }
    }

    // --- ADMIN & MENU ---
    function handleAdminLogin() {
        if (document.getElementById('admin-username').value === 'mmhanas14@gmail.com' && document.getElementById('admin-password').value === 'ANas@2011') {
            isAdminLoggedIn = true;
            sessionStorage.setItem('isAdminLoggedIn', 'true');
            closeModal('admin-login-modal');
            alert(T('login_success'));
            createMenuItems();
            renderPage('home');
        } else { alert(T('wrong_credentials')); }
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
            { icon: 'store', labelKey: 'seller_info', action: "renderPage('seller-info')" },
            { icon: 'sparkles', labelKey: 'ask_gemini', action: "renderPage('ask-gemini')" },
            { icon: 'info', labelKey: 'about', action: "renderPage('about')" },
            { icon: 'globe', labelKey: 'change_language', action: "openModal('lang-modal')" },
        ].map(item => `<div onclick="${item.action}" class="flex items-center p-3 cursor-pointer text-gray-700 hover:bg-indigo-50 transition rounded-lg mx-1"><i data-lucide="${item.icon}" class="w-5 h-5 mr-3 text-indigo-600"></i><span data-i18n="${item.labelKey}"></span></div>`).join('');
        menuItemsHTML += `<div class='border-t my-1 mx-2'></div>`;
        if (isAdminLoggedIn) {
            menuItemsHTML += `
                <div onclick="openModal('add-product-modal');" class="flex items-center p-3 cursor-pointer text-gray-700 hover:bg-indigo-50 transition rounded-lg mx-1"><i data-lucide="plus-circle" class="w-5 h-5 mr-3 text-green-600"></i><span data-i18n="add_new_product"></span></div>
                <div onclick="handleLogout()" class="flex items-center p-3 cursor-pointer text-gray-700 hover:bg-indigo-50 transition rounded-lg mx-1"><i data-lucide="log-out" class="w-5 h-5 mr-3 text-red-600"></i><span data-i18n="logout"></span></div>`;
        } else {
            menuItemsHTML += `<div onclick="openModal('admin-login-modal');" class="flex items-center p-3 cursor-pointer text-gray-700 hover:bg-indigo-50 transition rounded-lg mx-1"><i data-lucide="shield" class="w-5 h-5 mr-3 text-indigo-600"></i><span data-i18n="admin_login"></span></div>`;
        }
        menu.innerHTML = menuItemsHTML;
        applyTranslations();
        lucide.createIcons();
    }

    // --- EVENT LISTENERS ---
    function setupEventListeners() {
        document.getElementById('logo-button').addEventListener('click', () => renderPage('home'));
        document.getElementById('menu-button').addEventListener('click', e => { e.stopPropagation(); document.getElementById('dropdown-menu').classList.toggle('hidden'); });
        document.addEventListener('click', () => { document.getElementById('dropdown-menu').classList.add('hidden'); });
        document.getElementById('add-image-field-btn').addEventListener('click', () => {
             const imageContainer = document.getElementById('image-inputs-container');
            if (imageContainer.children.length < 12) {
                imageContainer.appendChild(createImageInputField());
                updateAddImageButtonState();
            }
        });
}
