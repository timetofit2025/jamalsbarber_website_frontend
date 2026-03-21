// src/admin/components/AdminLayout.jsx
import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import './AdminLayout.css'

const NAV_ITEMS = [
    { path: '/admin/dashboard', icon: '📊', label: 'Dashboard'  },
    { path: '/admin/bookings',  icon: '📅', label: 'Bookings'   },
    { path: '/admin/artists',   icon: '👥', label: 'Artists'    },
    { path: '/admin/gallery',   icon: '🖼',  label: 'Gallery'   },
    { path: '/admin/services',  icon: '💈',  label: 'Services'  },
]

const AdminLayout = ({ children, pendingCount = 0 }) => {
    const navigate  = useNavigate()
    const location  = useLocation()
    const [collapsed, setCollapsed] = useState(false)

    const handleLogout = () => {
        localStorage.removeItem('adminToken')
        navigate('/admin/login')
    }

    const isActive = (path) => location.pathname === path

    return (
        <div className={`admin-layout ${collapsed ? 'collapsed' : ''}`}>

            {/* ── SIDEBAR ── */}
            <aside className="admin-sidebar">
                <div className="admin-sidebar-top">
                    <div className="admin-sidebar-logo">
                        <div className="admin-logo-icon">✂</div>
                        {!collapsed && (
                            <div className="admin-logo-text">
                                <span className="admin-logo-name">JAMAL<span>'S</span></span>
                                <span className="admin-logo-sub">Admin Panel</span>
                            </div>
                        )}
                    </div>
                    <button
                        className="admin-collapse-btn"
                        onClick={() => setCollapsed(prev => !prev)}
                        title={collapsed ? 'Expand' : 'Collapse'}
                    >
                        {collapsed ? '›' : '‹'}
                    </button>
                </div>

                <nav className="admin-nav">
                    {!collapsed && <div className="admin-nav-label">Navigation</div>}
                    {NAV_ITEMS.map(item => (
                        <button
                            key={item.path}
                            className={`admin-nav-item ${isActive(item.path) ? 'active' : ''}`}
                            onClick={() => navigate(item.path)}
                            title={collapsed ? item.label : ''}
                        >
                            <span className="admin-nav-icon">{item.icon}</span>
                            {!collapsed && (
                                <span className="admin-nav-label-text">{item.label}</span>
                            )}
                            {/* Pending badge on Bookings */}
                            {item.label === 'Bookings' && pendingCount > 0 && (
                                <span className="admin-nav-badge">{pendingCount}</span>
                            )}
                        </button>
                    ))}
                </nav>

                <div className="admin-sidebar-footer">
                    <div className="admin-user">
                        <div className="admin-user-avatar">A</div>
                        {!collapsed && (
                            <div className="admin-user-info">
                                <span className="admin-user-name">Admin</span>
                                <span className="admin-user-role">Super Admin</span>
                            </div>
                        )}
                    </div>
                    <button
                        className="admin-logout-btn"
                        onClick={handleLogout}
                        title="Logout"
                    >
                        {collapsed ? '⏻' : '⏻ Logout'}
                    </button>
                </div>
            </aside>

            {/* ── MAIN CONTENT ── */}
            <main className="admin-main">
                {children}
            </main>
        </div>
    )
}

export default AdminLayout