import React from 'react'
import { Routes, Route } from 'react-router-dom'

// ── Website pages ──
import Hero   from './Pages/Hero Page/Hero'
import Footer from './Pages/Footer Page/Footer'
import Header from './Pages/Header Page/Header'
import Menu   from './Components/MenuComponent/Menu'

// ── Admin pages ──
import AdminLogin      from '/src/admin/pages/AdminLogin/AdminLogin'
import Dashboard       from './admin/pages/Dashboard'
import BookingsManager from './admin/pages/BookingsManager'
import ArtistsManager  from './admin/pages/ArtistsManager'
import GalleryManager  from './admin/pages/GalleryManager'
import ServicesManager from './admin/pages/ServicesManager'
import ProtectedRoute  from './admin/components/ProtectedRoute'

const App = () => {
    return (
        <Routes>

            {/* ══════════════════════════════════════
                ADMIN ROUTES
                Completely separate from the website.
                No Header or Footer rendered here.
            ══════════════════════════════════════ */}
            <Route path="/admin/login" element={<AdminLogin />} />

            <Route path="/admin/dashboard" element={
                <ProtectedRoute><Dashboard /></ProtectedRoute>
            } />
            <Route path="/admin/bookings" element={
                <ProtectedRoute><BookingsManager /></ProtectedRoute>
            } />
            <Route path="/admin/artists" element={
                <ProtectedRoute><ArtistsManager /></ProtectedRoute>
            } />
            <Route path="/admin/gallery" element={
                <ProtectedRoute><GalleryManager /></ProtectedRoute>
            } />
            <Route path="/admin/services" element={
                <ProtectedRoute><ServicesManager /></ProtectedRoute>
            } />

            {/* ══════════════════════════════════════
                WEBSITE ROUTES
                Header and Footer wrap all public pages.
            ══════════════════════════════════════ */}
            <Route path="/*" element={
                <div>
                    <Header />
                    <Routes>
                        <Route path="/"     element={<Hero />} />
                        <Route path="/menu" element={<Menu />} />
                    </Routes>
                    <Footer />
                </div>
            } />

        </Routes>
    )
}

export default App