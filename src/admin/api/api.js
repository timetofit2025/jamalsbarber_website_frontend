// src/admin/api/api.js
// Central API service — all calls to Spring Boot backend go through here

// const BASE_URL = 'http://localhost:8080/api'

// ✅ New
const BASE_URL = import.meta.env.VITE_API_URL || '/api'

// ── Get stored JWT token ──
const getToken = () => localStorage.getItem('adminToken')

// ── Build headers with JWT ──
const authHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${getToken()}`,
})

// ── Generic fetch wrapper ──
const request = async (method, endpoint, body = null, isFormData = false) => {
    const headers = isFormData
        ? { 'Authorization': `Bearer ${getToken()}` }  // no Content-Type for FormData
        : authHeaders()

    const config = {
        method,
        headers,
        body: body
            ? isFormData
                ? body
                : JSON.stringify(body)
            : null,
    }

    const response = await fetch(`${BASE_URL}${endpoint}`, config)

    // Handle 401 — token expired or invalid
    if (response.status === 401) {
        localStorage.removeItem('adminToken')
        window.location.href = '/admin/login'
        return
    }

    // Handle 204 No Content (DELETE responses)
    if (response.status === 204) return { success: true }

    const data = await response.json()

    if (!response.ok) {
        throw new Error(data.error || data.message || 'Request failed')
    }

    return data
}

// ══════════════════════════════════════
// AUTH
// ══════════════════════════════════════
export const authAPI = {
    login: (username, password) =>
        request('POST', '/auth/login', { username, password }),
}

// ══════════════════════════════════════
// BOOKINGS
// ══════════════════════════════════════
export const bookingsAPI = {
    getAll:          ()           => request('GET',    '/bookings'),
    getByStatus:     (status)     => request('GET',    `/bookings/status/${status}`),
    getById:         (id)         => request('GET',    `/bookings/${id}`),
    updateStatus: (id, status, adminNote) =>
    request('PATCH', `/bookings/${id}/status?status=${status}&adminNote=${encodeURIComponent(adminNote || '')}`),
    delete:          (id)         => request('DELETE', `/bookings/${id}`),
}

// ══════════════════════════════════════
// ARTISTS
// ══════════════════════════════════════
export const artistsAPI = {
    getAll: () => request('GET', '/artists/all'),

    create: (formData) =>
        request('POST', '/artists', formData, true),

    update: (id, formData) =>
        request('PUT', `/artists/${id}`, formData, true),

    delete: (id) => request('DELETE', `/artists/${id}`),

    deactivate: (id) => request('PATCH', `/artists/${id}/deactivate`),
}

// ══════════════════════════════════════
// GALLERY
// ══════════════════════════════════════
export const galleryAPI = {
    getAll: () => request('GET', '/gallery/all'),

    upload: (formData) =>
        request('POST', '/gallery', formData, true),

    update: (id, data) =>
        request('PUT', `/gallery/${id}`, data),

    toggleVisibility: (id) =>
        request('PATCH', `/gallery/${id}/toggle-visibility`),

    delete: (id) => request('DELETE', `/gallery/${id}`),
}

// ══════════════════════════════════════
// SERVICES
// ══════════════════════════════════════
export const servicesAPI = {
    getAll: () => request('GET', '/services/all'),

    create: (data) => request('POST', '/services', data),

    update: (id, data) => request('PUT', `/services/${id}`, data),

    updatePrice: (id, price, priceNote) =>
        request('PATCH', `/services/${id}/price?price=${price}&priceNote=${priceNote || ''}`),

    deactivate: (id) => request('PATCH', `/services/${id}/deactivate`),

    delete: (id) => request('DELETE', `/services/${id}`),
}