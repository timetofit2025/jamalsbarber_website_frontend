// src/api/publicApi.js
// Public API calls — no JWT needed, used by the website frontend

// const BASE_URL = 'http://localhost:8080/api'

// ✅ New — reads from .env file automatically
const BASE_URL = import.meta.env.VITE_API_URL || '/api'

const get = async (endpoint) => {
    const response = await fetch(`${BASE_URL}${endpoint}`)
    if (!response.ok) throw new Error(`Failed to fetch ${endpoint}`)
    return response.json()
}

// ── Artists (Team section) ──
export const fetchArtists = () => get('/artists')

// ── Gallery ──
export const fetchGallery = () => get('/gallery')

// ── Services / Menu ──
export const fetchServices = () => get('/services')

// ── Services by category ──
export const fetchServicesByCategory = (category) =>
    get(`/services/category/${category}`)