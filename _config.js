// --- FIREBASE ENVIRONMENT CONSTANTS ---
// These are globally provided by the execution environment.
export const APP_ID = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
export const FIREBASE_CONFIG = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : null;
export const INITIAL_AUTH_TOKEN = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

// --- GEMINI API CONSTANTS ---
// IMPORTANT: The API Key is left empty as it is automatically handled by the system, 
// but in a real-world app, you would place your key here or use a secure backend.
export const API_KEY = "";
export const API_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models/';
export const CHAT_MODEL = 'gemini-2.5-flash-preview-09-2025';

// --- DATABASE PATHS ---
export const PRODUCTS_COLLECTION_PATH = (uid, appId = APP_ID) => 
    `artifacts/${appId}/users/${uid}/products`;
