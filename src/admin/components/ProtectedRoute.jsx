// src/admin/components/ProtectedRoute.jsx
import React from 'react'
import { Navigate } from 'react-router-dom'

// Redirects to /admin/login if no JWT token found
const ProtectedRoute = ({ children }) => {
    const token = localStorage.getItem('adminToken')
    if (!token) return <Navigate to="/admin/login" replace />
    return children
}

export default ProtectedRoute