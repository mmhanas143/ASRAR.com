// --- IMPORTS ---
import { products } from './firebase_service.js';
import { T } from './app_logic.js';

// --- CONSTANTS ---
const API_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models/';
const API_KEY = "";
const CHAT_MODEL = 'gemini-2.5-flash-preview-09-2025';

// --- UTILITY ---
function sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }

// --- CORE API CALLER ---
export async function callGeminiAPI(userQuery, systemPrompt = "", useGrounding = false) {
    const fullUrl = `${API_BASE_URL}${CHAT_MODEL}:generateContent?key=${API_KEY}`;
    
    const payload = {
        contents: [{ parts: [{ text: userQuery }] }],
    };
    if (systemPrompt) { payload.systemInstruction = { parts: [{ text: systemPrompt }] }; }
    if (useGrounding) { payload.tools = [{ "google_search": {} }]; }

    let response;
    let success = false;
    const maxRetries = 5;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            response = await fetch(fullUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
            if (response.ok) { success = true; break; } 
            else if (response.status === 429 && attempt < maxRetries - 1) { await sleep(Math.pow(2, attempt) * 1000); } 
            else { const errorBody = await response.json(); throw new Error(`API failed with status ${response.status}: ${errorBody.error?.message}`); }
        } catch (error) {
            if (attempt === maxRetries - 1) throw error;
            await sleep(Math.pow(2, attempt) * 1000);
        }
    }

    if (!success) throw new Error("Failed to get a successful response from the API after multiple retries.");

    const result = await response.json();
    const candidate = result.candidates?.[0];
    if (!candidate || !candidate.content?.parts?.[0]?.text) { throw new Error("Invalid response structure."); }

    const text = candidate.content.parts[0].text;
    let sources = [];
    const groundingMetadata = candidate.groundingMetadata;

    if (groundingMetadata && groundingMetadata.groundingAttributions) {
        sources = groundingMetadata.groundingAttributions
            .map(attribution => ({ uri: attribution.web?.uri, title: attribution.web?.title }))
            .filter(source => source.uri && source.title);
    }
    return { text, sources };
}


// --- FEATURE 1: PRODUCT DESCRIPTION ENHANCER (Admin Only) ---
export async function enhanceProductDescription() {
    // Check if AppDependencies and isAdmin are ready
    if (!window.AppDependencies.isAdmin) return;
    
    const titleInput = document.getElementById('product-title');
    const descriptionInput = document.getElementById('product-description');
    const enhanceButton = document.getElementById('enhance-description-btn');
    const originalText = enhanceButton.innerHTML;
    
    if (!titleInput.value) { window.alertMessage(T('enter_product_title') || 'অনুগ্রহ করে পণ্যের শিরোনাম দিন।', 'error'); return; }

    enhanceButton.innerHTML = `<i data-lucide="loader" class="animate-spin w-5 h-5 mr-2"></i> ${T('generating')}...`;
    enhanceButton.disabled = true;
    lucide.createIcons();

    const userQuery = `Product Title: ${titleInput.value}. Generate a compelling, SEO-friendly, and detailed product description suitable for an e-commerce website. The description should be about 150-200 words, use a persuasive, elegant tone, and be formatted entirely in Bengali for the Bangladesh market.`;
    const systemPrompt = "You are an expert e-commerce copywriter for a premium clothing brand in Bangladesh. Your task is to generate beautiful, persuasive, and detailed product descriptions in Bengali.";

    try {
        const result = await callGeminiAPI(userQuery, systemPrompt, false);
        descriptionInput.value = result.text.trim();
        window.alertMessage(T('description_generated') || 'বিবরণ সফলভাবে তৈরি হয়েছে!', 'success'); 
    } catch (error) {
        window.alertMessage(T('error_generating_description') || 'বিবরণ তৈরি করতে ব্যর্থ হয়েছে। আবার চেষ্টা করুন।', 'error'); 
    } finally {
        enhanceButton.innerHTML = originalText;
        enhanceButton.disabled = false;
        lucide.createIcons();
    }
}


// --- FEATURE 2: FASHION ADVISOR CHATBOT ---
export async function handleGeminiChat() {
    const chatInput = document.getElementById('chat-input');
    const sendButton = document.getElementById('chat-send-btn');
    const userMessage = chatInput.value.trim();

    if (!userMessage) return;

    window.appendMessage(userMessage, 'user'); // Use function from app_logic
    chatInput.value = '';
    sendButton.disabled = true;

    const loadingMessageId = 'loading-' + Date.now();
    // Add loading indicator
    window.appendMessage(`<div id="${loadingMessageId}" class="flex items-center text-gray-500"><i data-lucide="loader" class="w-4 h-4 mr-2 animate-spin"></i><span>${T('gemini_thinking')}...</span></div>`, 'gemini', true);
    document.getElementById('chat-messages').scrollTop = document.getElementById('chat-messages').scrollHeight;
    lucide.createIcons();

    // Contextualize the chat prompt with product data
    const productList = Object.values(products).map(p => 
        `- ${p.title} (৳${p.price}, ${p.discount || 0}% discount): ${p.description}`
    ).join('\n');
    
    const contextualPrompt = `Current Product Catalog (use this for product queries):\n---\n${productList || 'No products available.'}\n---\n\nUser Query: ${userMessage}`;

    const systemPrompt = "You are a friendly, knowledgeable, and elegant fashion advisor specializing in South Asian and modern global clothing trends, specifically for the ASRAR CLOTHES brand (Bangladesh market). Provide concise, helpful, and creative styling advice or product information in elegant Bengali. Always use the Google Search tool for current, up-to-date fashion and trend information. If you mention sources, format them as clickable links. Respond only in Bengali.";

    try {
        const { text, sources } = await callGeminiAPI(contextualPrompt, systemPrompt, true);
        
        // Remove loading message
        const loadingElement = document.getElementById(loadingMessageId);
        if (loadingElement) loadingElement.parentElement.parentElement.remove();

        let responseHtml = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>');
        
        if (sources.length > 0) {
            responseHtml += '<div class="mt-3 pt-3 border-t border-gray-200 text-xs text-gray-500 italic">';
            responseHtml += `${T('sources')}: `;
            sources.forEach((source, index) => {
                responseHtml += `<a href="${source.uri}" target="_blank" class="text-indigo-600 hover:underline">${source.title}</a>${index < sources.length - 1 ? ', ' : ''}`;
            });
            responseHtml += '</div>';
        }

        window.appendMessage(responseHtml, 'gemini', true);

    } catch (error) {
        console.error("Chat error:", error);
        const loadingElement = document.getElementById(loadingMessageId);
        if (loadingElement) loadingElement.parentElement.parentElement.remove();
        
        window.appendMessage(T('chat_error') || 'দুঃখিত, কথোপকথনে একটি সমস্যা হয়েছে। আবার চেষ্টা করুন।', 'gemini');
    }
    document.getElementById('chat-messages').scrollTop = document.getElementById('chat-messages').scrollHeight;
    sendButton.disabled = false;
}
