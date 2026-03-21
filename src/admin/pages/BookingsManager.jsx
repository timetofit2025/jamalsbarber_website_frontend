// src/admin/pages/BookingsManager.jsx
import React, { useState, useEffect } from 'react'
import AdminLayout from '../../admin/components/AdminLayout/AdminLayout'
import { bookingsAPI } from '../api/api'

const BookingsManager = () => {
    const [bookings, setBookings] = useState([])
    const [filter,   setFilter]   = useState('all')
    const [loading,  setLoading]  = useState(true)
    const [toast,    setToast]    = useState(null)

    useEffect(() => { fetchBookings() }, [])

    const fetchBookings = async () => {
        try {
            const data = await bookingsAPI.getAll()
            setBookings(data)
        } catch (err) {
            showToast('❌ Failed to load bookings')
        } finally {
            setLoading(false)
        }
    }

    const showToast = (msg) => {
        setToast(msg)
        setTimeout(() => setToast(null), 3000)
    }

    // ── Reject booking — sends rejection email to customer ──
    const handleReject = async (id) => {
        if (!window.confirm('Reject this booking? The customer will be notified by email.')) return
        try {
            await bookingsAPI.updateStatus(id, 'rejected', '')
            setBookings(prev => prev.map(b =>
                b.id === id ? { ...b, status: 'rejected' } : b
            ))
            showToast('❌ Booking rejected. Customer notified by email.')
        } catch (err) {
            showToast('❌ Failed to reject booking')
        }
    }

    // ── Reset rejected booking back to pending ──
    const handleReset = async (id) => {
        try {
            await bookingsAPI.updateStatus(id, 'pending', '')
            setBookings(prev => prev.map(b =>
                b.id === id ? { ...b, status: 'pending' } : b
            ))
            showToast('↩ Booking reset to pending.')
        } catch (err) {
            showToast('❌ Failed to reset booking')
        }
    }

    // ── Delete booking permanently ──
    const handleDelete = async (id) => {
        if (!window.confirm('Delete this booking permanently?')) return
        try {
            await bookingsAPI.delete(id)
            setBookings(prev => prev.filter(b => b.id !== id))
            showToast('🗑 Booking deleted.')
        } catch (err) {
            showToast('❌ Failed to delete booking')
        }
    }

    const pendingCount = bookings.filter(b => b.status === 'pending').length
    const visible = filter === 'all'
        ? bookings
        : bookings.filter(b => b.status === filter)

    const chips = [
        { id: 'all',      label: `All (${bookings.length})` },
        { id: 'pending',  label: `Pending (${bookings.filter(b => b.status === 'pending').length})` },
        { id: 'rejected', label: `Rejected (${bookings.filter(b => b.status === 'rejected').length})` },
    ]

    return (
        <AdminLayout pendingCount={pendingCount}>
            <div className="admin-page">

                {/* Header */}
                <div className="admin-page-header">
                    <div>
                        <h1 className="admin-page-title">Bookings</h1>
                        <p className="admin-page-sub">{bookings.length} total bookings</p>
                    </div>
                </div>

                <div className="admin-card">
                    <div className="admin-card-header">
                        <div>
                            <div className="admin-card-title">All Bookings</div>
                            <div className="admin-card-sub">
                                {visible.length} {filter === 'all' ? 'total' : filter}
                            </div>
                        </div>
                    </div>

                    {/* Filter chips */}
                    <div className="filter-bar">
                        {chips.map(c => (
                            <button
                                key={c.id}
                                className={`filter-chip ${filter === c.id ? 'active' : ''}`}
                                onClick={() => setFilter(c.id)}
                            >
                                {c.label}
                            </button>
                        ))}
                    </div>

                    {loading ? (
                        <div className="admin-loading">
                            <div className="loading-spinner" /> Loading bookings...
                        </div>
                    ) : visible.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-icon">📭</div>
                            <div className="empty-text">No {filter} bookings found</div>
                        </div>
                    ) : (
                        <div className="admin-table-wrap">
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        {/* ✅ Status column removed */}
                                        <th>Client</th>
                                        <th>Service</th>
                                        <th>Artist</th>
                                        <th>Date & Time</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {visible.map(b => (
                                        <tr key={b.id}>

                                            {/* Client */}
                                            <td>
                                                <div style={{ fontWeight:700, color:'#fff' }}>
                                                    {b.name}
                                                </div>
                                                <div style={{ fontSize:'0.72rem', color:'#888' }}>
                                                    {b.email}
                                                </div>
                                                <div style={{ fontSize:'0.72rem', color:'#888' }}>
                                                    {b.phone}
                                                </div>
                                                {b.notes && (
                                                    <div style={{ fontSize:'0.72rem', color:'#666', fontStyle:'italic' }}>
                                                        "{b.notes}"
                                                    </div>
                                                )}
                                            </td>

                                            {/* Service */}
                                            <td>{b.service}</td>

                                            {/* Artist */}
                                            <td>
                                                {b.artist || (
                                                    <span style={{ color:'#666', fontStyle:'italic' }}>
                                                        No preference
                                                    </span>
                                                )}
                                            </td>

                                            {/* Date & Time */}
                                            <td>
                                                <div style={{ color:'#ccc' }}>{b.date}</div>
                                                <div style={{ fontSize:'0.75rem', color:'#888' }}>
                                                    {b.time}
                                                </div>
                                            </td>

                                            {/* Actions */}
                                            <td>
                                                <div className="action-btns">
                                                    {b.status !== 'rejected' ? (
                                                        <button
                                                            className="act-btn act-reject"
                                                            onClick={() => handleReject(b.id)}
                                                        >
                                                            ✕ Reject
                                                        </button>
                                                    ) : (
                                                        <button
                                                            className="act-btn act-view"
                                                            onClick={() => handleReset(b.id)}
                                                        >
                                                            ↩ Reset
                                                        </button>
                                                    )}
                                                    <button
                                                        className="act-btn act-delete"
                                                        onClick={() => handleDelete(b.id)}
                                                    >
                                                        🗑 Delete
                                                    </button>
                                                </div>
                                            </td>

                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Toast */}
            {toast && (
                <div className="admin-toast">
                    <span className="admin-toast-msg">{toast}</span>
                </div>
            )}
        </AdminLayout>
    )
}

export default BookingsManager