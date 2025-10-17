document.addEventListener('DOMContentLoaded', function() {
    // --- DOM Element Selection ---
    const menuToggle = document.getElementById('menu-toggle');
    const navMenu = document.getElementById('nav-menu');
    const overlay = document.getElementById('overlay');
    const pages = document.querySelectorAll('.page');
    const productGrid = document.getElementById('product-grid');

    // --- Translations & Data ---
    const translations = {
        en: { home: "Home", seller_info: "Seller Info", ask_gemini: "Ask Gemini", about: "About", seller_info_title: "Seller Information", about_seller: "About ASRAR Clothes:", about_seller_text: "We provide the best quality clothes for you.", seller_contact: "Seller Contact:", phone: "Phone:", ask_gemini_title: "Ask Gemini", ask_gemini_desc: "Ask me anything! Please note: a valid Gemini API key is required.", send: "Send", about_page_title: "About", version: "Version:", admin_login: "Admin Login", login: "Login", admin_panel: "Admin Panel", add_new_product: "Add New Product", save_product: "Save Product", shipping_details: "Shipping Details", order_now: "Order Now", order_processing: "Your order is processing. Please wait...", search_placeholder: "Search for premium clothes...", hero_title: "Welcome to ASRAR CLOTHES", hero_subtitle: "Discover the finest collection of modern apparel.", hero_button: "Explore Collection" },
        bn: { home: "হোম", seller_info: "বিক্রেতার তথ্য", ask_gemini: "Gemini কে জিজ্ঞাসা করুন", about: "সম্পর্কে", seller_info_title: "বিক্রেতার তথ্য", about_seller: "ASRAR Clothes সম্পর্কে:", about_seller_text: "আমরা আপনার জন্য সেরা মানের পোশাক সরবরাহ করি।", seller_contact: "বিক্রেতার যোগাযোগ:", phone: "ফোন:", ask_gemini_title: "Gemini কে জিজ্ঞাসা করুন", ask_gemini_desc: "আমাকে যেকোনো কিছু জিজ্ঞাসা করুন! দয়া করে মনে রাখবেন: একটি বৈধ Gemini API কী প্রয়োজন।", send: "পাঠান", about_page_title: "সম্পর্কে", version: "ভার্সন:", admin_login: "অ্যাডমিন লগইন", login: "লগইন", admin_panel: "অ্যাডমিন প্যানেল", add_new_product: "নতুন পণ্য যোগ করুন", save_product: "পণ্য সেভ করুন", shipping_details: "শিপিং বিবরণ", order_now: "এখনই অর্ডার করুন", order_processing: "আপনার অর্ডার প্রসেস হচ্ছে। অনুগ্রহ করে অপেক্ষা করুন...", search_placeholder: "প্রিমিয়াম পোশাক খুঁজুন...", hero_title: "ASRAR CLOTHES-এ স্বাগতম", hero_subtitle: "আধুনিক পোশাকের সেরা সংগ্রহ আবিষ্কার করুন।", hero_button: "সংগ্রহ দেখুন" }
    };
    let products = [ { name: 'Classic Denim Jacket', price: 3500, image: 'https://images.unsplash.com/photo-1543087902-61618aa2b89a?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb&w=600' }, { name: 'Premium Cotton T-Shirt', price: 1200, image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb&w=600' }, { name: 'Elegant Black Hoodie', price: 2800, image: 'https://images.unsplash.com/photo-1556821855-0a3OAa3195de?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb&w=600' }, { name: 'Stylish Cargo Pants', price: 2200, image: 'https://images.unsplash.com/photo-1602442787341-957ce63b37c1?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb&w=600' }, { name: 'Formal Check Shirt', price: 1800, image: 'https://images.unsplash.com/photo-1601425123382-5296e1e69552?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb&w=600' }, { name: 'Comfortable Joggers', price: 1500, image: 'https://images.unsplash.com/photo-1563389234237-8832a82a443a?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb&w=600' } ];

    // --- Core Functions (Products, Language, Modals) ---
    const loadProducts = () => { const d = localStorage.getItem('products'); if(d) products = JSON.parse(d); };
    const saveProducts = () => localStorage.setItem('products', JSON.stringify(products));
    const renderProducts = (p) => { productGrid.innerHTML = ''; (p || products).forEach(prod => { const card = document.createElement('div'); card.className = 'product-card'; card.innerHTML = `<img src="${prod.image}" alt="${prod.name}" class="product-image"><div class="product-info"><h3 class="product-name">${prod.name}</h3><p class="product-price">${prod.price} TK</p><button class="buy-now-btn" onclick="openBuyNowModal('${prod.name}')">Buy Now</button></div>`; productGrid.appendChild(card); }); observeCards(); };
    window.changeLanguage = (lang) => { document.querySelectorAll('[data-lang-key]').forEach(el => { const key = el.getAttribute('data-lang-key'); if (translations[lang][key]) el.innerText = translations[lang][key]; }); document.getElementById('search-bar').placeholder = translations[lang].search_placeholder; };
    window.openModal = (id) => document.getElementById(id).style.display = 'flex';
    window.closeModal = (id) => document.getElementById(id).style.display = 'none';

    // --- RELIABLE NAVIGATION LOGIC ---
    const showPage = (pageId) => {
        pages.forEach(page => page.style.display = 'none');
        const newPage = document.getElementById(pageId);
        if (newPage) newPage.style.display = 'block';
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.toggle('active', link.dataset.page === pageId);
        });
    };

    const toggleMenu = () => {
        const isOpen = navMenu.classList.toggle('nav-open');
        overlay.classList.toggle('active', isOpen);
    };
    
    menuToggle.addEventListener('click', toggleMenu);
    overlay.addEventListener('click', toggleMenu);

    navMenu.addEventListener('click', (e) => {
        const link = e.target.closest('.nav-link');
        if (!link) return;
        e.preventDefault();
        const pageId = link.dataset.page;
        if (pageId) {
            showPage(pageId);
            if (navMenu.classList.contains('nav-open')) {
                toggleMenu();
            }
        }
    });

    // --- UI Effects ---
    const observeCards = () => { const observer = new IntersectionObserver((entries) => { entries.forEach(entry => { if (entry.isIntersecting) entry.target.classList.add('visible'); }); }, { threshold: 0.1 }); document.querySelectorAll('.product-card').forEach(card => observer.observe(card)); };

    // --- Other Functionalities (Admin, Order, etc.) ---
    document.getElementById('search-bar').addEventListener('keyup', (e) => renderProducts(products.filter(p => p.name.toLowerCase().includes(e.target.value.toLowerCase()))));
    let clickCount = 0; document.getElementById('version-number').addEventListener('click', () => { if (++clickCount === 7) { clickCount = 0; openModal('admin-login-modal'); } });
    document.getElementById('admin-login-btn').addEventListener('click', () => { if (document.getElementById('admin-username').value === 'mmhanas14@gmail.com' && document.getElementById('admin-password').value === 'ANas@2011') { closeModal('admin-login-modal'); openModal('admin-panel-modal'); } else { alert('Wrong credentials!'); } });
    document.getElementById('add-product-btn').addEventListener('click', () => { const n=document.getElementById('new-product-name').value, p=document.getElementById('new-product-price').value, i=document.getElementById('new-product-image'); if(n&&p&&i.files[0]){ const r=new FileReader(); r.onload=(e)=>{products.push({name:n,price:parseInt(p),image:e.target.result});saveProducts();renderProducts();closeModal('admin-panel-modal');}; r.readAsDataURL(i.files[0]);}else{alert('Please fill all fields.');} });
    let currentProduct = ''; window.openBuyNowModal = (p) => { currentProduct = p; openModal('buy-now-modal'); };
    document.getElementById('order-now-btn').addEventListener('click', () => { const n=document.getElementById('customer-name').value, a=document.getElementById('customer-address').value, p=document.getElementById('customer-phone').value; if(!n||!a||!p){alert('Please fill required fields.');return;} closeModal('buy-now-modal');openModal('processing-modal'); const m=`New Order!\nProduct: ${currentProduct}\nName: ${n}\nAddress: ${a}\nPhone: ${p}\nEmail: ${document.getElementById('customer-email').value||'N/A'}`; setTimeout(()=>{closeModal('processing-modal'); window.open(`https://wa.me/+8801924445908?text=${encodeURIComponent(m)}`, '_blank');}, 2000); });
    document.getElementById('gemini-send').addEventListener('click', () => { const i=document.getElementById('gemini-input'), c=document.getElementById('gemini-chat-box'); if(!i.value)return; c.innerHTML += `<p><strong>You:</strong> ${i.value}</p>`; setTimeout(()=>{c.innerHTML += `<p><strong>Gemini:</strong> API key needed.</p>`; c.scrollTop = c.scrollHeight;}, 1000); i.value = ''; });

    // --- Initial Load ---
    loadProducts();
    renderProducts();
    showPage('home');
    changeLanguage('en');
});
