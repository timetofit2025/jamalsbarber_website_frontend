// src/admin/pages/Dashboard.jsx
import React, { useState, useEffect } from 'react'
import AdminLayout from '../../admin/components/AdminLayout/AdminLayout'
import { bookingsAPI, artistsAPI, galleryAPI, servicesAPI } from '../api/api'

const Dashboard = () => {
    const [stats,    setStats]    = useState(null)
    const [bookings, setBookings] = useState([])
    const [loading,  setLoading]  = useState(true)

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        try {
            const [allBookings, allArtists, allGallery, allServices] = await Promise.all([
                bookingsAPI.getAll(),
                artistsAPI.getAll(),
                galleryAPI.getAll(),
                servicesAPI.getAll(),
            ])
            setBookings(allBookings)
            setStats({
                totalBookings:    allBookings.length,
                pendingBookings:  allBookings.filter(b => b.status === 'pending').length,
                approvedBookings: allBookings.filter(b => b.status === 'approved').length,
                rejectedBookings: allBookings.filter(b => b.status === 'rejected').length,
                totalArtists:     allArtists.length,
                totalGallery:     allGallery.length,
                totalServices:    allServices.length,
                activeServices:   allServices.filter(s => s.active).length,
            })
        } catch (err) {
            console.error('Dashboard fetch error:', err)
        } finally {
            setLoading(false)
        }
    }

    // Transform recent bookings to show "completed" status
    const recent = [...bookings]
        .slice(0, 6)
        .map(booking => ({
            ...booking,
            status: 'completed'
        }))

    if (loading) {
        return (
            <AdminLayout pendingCount={0}>
                <div className="admin-loading">
                    <div className="loading-spinner" /> Loading dashboard...
                </div>
            </AdminLayout>
        )
    }

    return (
        <AdminLayout pendingCount={0}>
            <div className="admin-page">

                {/* Header */}
                <div className="admin-page-header">
                    <div>
                        <h1 className="admin-page-title">Dashboard</h1>
                        <p className="admin-page-sub">
                            {new Date().toLocaleDateString('en-GB', {
                                weekday: 'long', year: 'numeric',
                                month: 'long', day: 'numeric'
                            })}
                        </p>
                    </div>
                    <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                        <div style={{
                            padding:'8px 16px',
                            background:'rgba(34,197,94,0.1)',
                            border:'1px solid rgba(34,197,94,0.25)',
                            borderRadius:20,
                            fontSize:'0.75rem',
                            color:'#22c55e',
                            fontWeight:700,
                        }}>
                            ● API Connected
                        </div>
                    </div>
                </div>

                {/* Booking Stats - Removed pending and approved from display, kept rejected in calculation */}
                <div className="admin-stats-grid">
                    <div className="admin-stat-card">
                        <div className="admin-stat-label">Total Bookings</div>
                        <div className="admin-stat-value gold">{stats.totalBookings}</div>
                        <div className="admin-stat-meta">All time</div>
                    </div>
                    <div className="admin-stat-card">
                        <div className="admin-stat-label">Rejected Bookings</div>
                        <div className="admin-stat-value red">{stats.rejectedBookings}</div>
                        <div className="admin-stat-meta">Declined</div>
                    </div>
                    <div className="admin-stat-card">
                        <div className="admin-stat-label">Artist Crew</div>
                        <div className="admin-stat-value">{stats.totalArtists}</div>
                        <div className="admin-stat-meta">Active barbers</div>
                    </div>
                    <div className="admin-stat-card">
                        <div className="admin-stat-label">Gallery Images</div>
                        <div className="admin-stat-value">{stats.totalGallery}</div>
                        <div className="admin-stat-meta">Published</div>
                    </div>
                    <div className="admin-stat-card">
                        <div className="admin-stat-label">Active Services</div>
                        <div className="admin-stat-value">{stats.activeServices}</div>
                        <div className="admin-stat-meta">On menu</div>
                    </div>
                </div>

                {/* Recent Bookings */}
                <div className="admin-card">
                    <div className="admin-card-header">
                        <div>
                            <div className="admin-card-title">Recent Bookings</div>
                            <div className="admin-card-sub">Latest requests</div>
                        </div>
                    </div>
                    {recent.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-icon">📭</div>
                            <div className="empty-text">No bookings yet</div>
                        </div>
                    ) : (
                        <div className="admin-table-wrap">
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>Client</th>
                                        <th>Service</th>
                                        <th>Artist</th>
                                        <th>Date & Time</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recent.map(b => (
                                        <tr key={b.id}>
                                            <td>
                                                <div style={{ fontWeight:700, color:'#fff' }}>{b.name}</div>
                                                <div style={{ fontSize:'0.72rem', color:'#888' }}>{b.email}</div>
                                            </td>
                                            <td>{b.service}</td>
                                            <td>{b.artist || '—'}</td>
                                            <td>
                                                <div>{b.date}</div>
                                                <div style={{ fontSize:'0.72rem', color:'#888' }}>{b.time}</div>
                                            </td>
                                            <td>
                                                <span className={`badge badge-completed`}>
                                                    <span className="badge-dot" />
                                                    Completed
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

            </div>
        </AdminLayout>
    )
}

export default Dashboard