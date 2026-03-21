// src/admin/pages/ServicesManager.jsx
import React, { useState, useEffect } from 'react'
import AdminLayout from '../../admin/components/AdminLayout/AdminLayout'
import { servicesAPI, bookingsAPI } from '../api/api'

const CATEGORIES = ['cuts', 'shaves', 'treatments', 'packages']

const EMPTY_FORM = {
    num: '', icon: '', title: '', description: '',
    price: '', priceNote: 'Starting from',
    duration: '', category: 'cuts',
    popular: false, active: true, displayOrder: 0,
}

const ServicesManager = () => {
    const [services, setServices] = useState([])
    const [loading, setLoading] = useState(true)
    const [toast, setToast] = useState(null)
    const [modalOpen, setModalOpen] = useState(false)
    const [editItem, setEditItem] = useState(null)
    const [form, setForm] = useState(EMPTY_FORM)
    const [saving, setSaving] = useState(false)
    const [filterCat, setFilterCat] = useState('all')
    const [pendingCount, setPendingCount] = useState(0)

    useEffect(() => { fetchData() }, [])

    const fetchData = async () => {
        try {
            const [data, bookings] = await Promise.all([
                servicesAPI.getAll(),
                bookingsAPI.getAll(),
            ])
            setServices(data)
            setPendingCount(bookings.filter(b => b.status === 'pending').length)
        } catch (err) {
            showToast('❌ Failed to load services')
        } finally {
            setLoading(false)
        }
    }

    const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 3000) }

    const openAdd = () => {
        setForm(EMPTY_FORM)
        setEditItem(null)
        setModalOpen(true)
    }

    const openEdit = (svc) => {
        setForm({
            num: svc.num || '', icon: svc.icon || '',
            title: svc.title, description: svc.description || '',
            price: svc.price, priceNote: svc.priceNote || 'Starting from',
            duration: svc.duration || '', category: svc.category || 'cuts',
            popular: svc.popular || false, active: svc.active !== false,
            displayOrder: svc.displayOrder || 0,
        })
        setEditItem(svc)
        setModalOpen(true)
    }

    const handleSave = async (e) => {
        e.preventDefault()
        setSaving(true)
        try {
            const payload = { ...form, price: parseFloat(form.price) }
            if (editItem) {
                const updated = await servicesAPI.update(editItem.id, payload)
                setServices(prev => prev.map(s => s.id === editItem.id ? updated : s))
                showToast('✏️ Service updated.')
            } else {
                const created = await servicesAPI.create(payload)
                setServices(prev => [...prev, created])
                showToast('✅ New service added.')
            }
            setModalOpen(false)
        } catch (err) {
            showToast('❌ Failed to save: ' + err.message)
        } finally {
            setSaving(false)
        }
    }

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this service permanently?')) return
        try {
            await servicesAPI.delete(id)
            setServices(prev => prev.filter(s => s.id !== id))
            showToast('🗑 Service deleted.')
        } catch (err) {
            showToast('❌ Failed to delete')
        }
    }

    const handleDeactivate = async (id) => {
        try {
            await servicesAPI.deactivate(id)
            setServices(prev => prev.map(s => s.id === id ? { ...s, active: false } : s))
            showToast('⏸ Service deactivated.')
        } catch (err) {
            showToast('❌ Failed to deactivate')
        }
    }

    const visible = filterCat === 'all'
        ? services
        : services.filter(s => s.category === filterCat)

    return (
        <AdminLayout pendingCount={pendingCount}>
            <div className="admin-page">

                <div className="admin-page-header">
                    <div>
                        <h1 className="admin-page-title">Services</h1>
                        <p className="admin-page-sub">
                            {services.length} services · {services.filter(s => s.active).length} active
                        </p>
                    </div>
                    <button className="admin-btn admin-btn-primary" onClick={openAdd}>
                        + Add Service
                    </button>
                </div>

                <div className="admin-card">
                    <div className="admin-card-header">
                        <div>
                            <div className="admin-card-title">All Services & Pricing</div>
                            <div className="admin-card-sub">{visible.length} shown</div>
                        </div>
                    </div>

                    {/* Category filter */}
                    <div className="filter-bar">
                        {['all', ...CATEGORIES].map(c => (
                            <button
                                key={c}
                                className={`filter-chip ${filterCat === c ? 'active' : ''}`}
                                onClick={() => setFilterCat(c)}
                            >
                                {c.charAt(0).toUpperCase() + c.slice(1)}
                            </button>
                        ))}
                    </div>

                    {loading ? (
                        <div className="admin-loading"><div className="loading-spinner" /> Loading services...</div>
                    ) : visible.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-icon">💈</div>
                            <div className="empty-text">No services found.</div>
                        </div>
                    ) : (
                        <div className="admin-table-wrap">
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>Service</th>
                                        <th>Category</th>
                                        <th>Duration</th>
                                        <th>Price</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {visible.map(svc => (
                                        <tr key={svc.id}>
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                    <span style={{ fontSize: '1.3rem' }}>{svc.icon}</span>
                                                    <div>
                                                        <div style={{ fontWeight: 700, color: '#fff' }}>{svc.title}</div>
                                                        <div style={{ fontSize: '0.72rem', color: '#888', maxWidth: 240 }}>
                                                            {svc.description}
                                                        </div>
                                                        {svc.popular && (
                                                            <span className="badge badge-approved" style={{ marginTop: 4 }}>
                                                                ⭐ Popular
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <span style={{ fontSize: '0.75rem', color: '#c8a96e', textTransform: 'capitalize' }}>
                                                    {svc.category}
                                                </span>
                                            </td>
                                            <td>{svc.duration || '—'}</td>
                                            <td>
                                                <div style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: '1.4rem', color: '#c8a96e', lineHeight: 1 }}>
                                                    £{svc.price}
                                                </div>
                                                <div style={{ fontSize: '0.68rem', color: '#888' }}>{svc.priceNote}</div>
                                            </td>
                                            <td>
                                                <span className={`badge ${svc.active ? 'badge-active' : 'badge-inactive'}`}>
                                                    <span className="badge-dot" />
                                                    {svc.active ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="action-btns">
                                                    <button className="act-btn act-edit"
                                                        onClick={() => openEdit(svc)}>✏ Edit</button>
                                                    {svc.active && (
                                                        <button className="act-btn act-view"
                                                            onClick={() => handleDeactivate(svc.id)}>⏸ Hide</button>
                                                    )}
                                                    <button className="act-btn act-delete"
                                                        onClick={() => handleDelete(svc.id)}>🗑</button>
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

            {/* Add / Edit Modal */}
            {modalOpen && (
                <div className="admin-modal-overlay" onClick={e => e.target === e.currentTarget && setModalOpen(false)}>
                    <div className="admin-modal">
                        <div className="admin-modal-header">
                            <div className="admin-modal-title">
                                {editItem ? 'Edit Service' : 'Add New Service'}
                            </div>
                            <button className="admin-modal-close" onClick={() => setModalOpen(false)}>✕</button>
                        </div>
                        <form onSubmit={handleSave}>
                            <div className="admin-form">
                                <div className="admin-form-grid">
                                    <div className="admin-form-group">
                                        <label className="admin-label">Title *</label>
                                        <input className="admin-input" required placeholder="e.g. Classic Cut"
                                            value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
                                    </div>
                                    <div className="admin-form-group">
                                        <label className="admin-label">Icon (emoji)</label>
                                        <input className="admin-input" placeholder="e.g. ✂️"
                                            value={form.icon} onChange={e => setForm({ ...form, icon: e.target.value })} />
                                    </div>
                                    <div className="admin-form-group full">
                                        <label className="admin-label">Description</label>
                                        <textarea className="admin-textarea" placeholder="Short description..."
                                            value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
                                    </div>
                                    <div className="admin-form-group">
                                        <label className="admin-label">Price (£) *</label>
                                        <input className="admin-input" type="number" required min="0" step="0.01" placeholder="25"
                                            value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} />
                                    </div>
                                    <div className="admin-form-group">
                                        <label className="admin-label">Price Note</label>
                                        <input className="admin-input" placeholder="Starting from"
                                            value={form.priceNote} onChange={e => setForm({ ...form, priceNote: e.target.value })} />
                                    </div>
                                    <div className="admin-form-group">
                                        <label className="admin-label">Duration</label>
                                        <input className="admin-input" placeholder="e.g. 30 min"
                                            value={form.duration} onChange={e => setForm({ ...form, duration: e.target.value })} />
                                    </div>
                                    <div className="admin-form-group">
                                        <label className="admin-label">Category *</label>
                                        <select className="admin-select" value={form.category}
                                            onChange={e => setForm({ ...form, category: e.target.value })}>
                                            {CATEGORIES.map(c => (
                                                <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="admin-form-group">
                                        <label className="admin-label">Display Order</label>
                                        <input className="admin-input" type="number" min="0" placeholder="0"
                                            value={form.displayOrder}
                                            onChange={e => setForm({ ...form, displayOrder: parseInt(e.target.value) || 0 })} />
                                    </div>
                                    <div className="admin-form-group">
                                        <label className="admin-label">Number Tag</label>
                                        <input className="admin-input" placeholder="e.g. 01"
                                            value={form.num} onChange={e => setForm({ ...form, num: e.target.value })} />
                                    </div>
                                </div>

                                {/* Toggles */}
                                <div style={{ display: 'flex', gap: 24 }}>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: '0.85rem', color: '#ccc' }}>
                                        <input type="checkbox" checked={form.popular}
                                            onChange={e => setForm({ ...form, popular: e.target.checked })} />
                                        Mark as Popular
                                    </label>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: '0.85rem', color: '#ccc' }}>
                                        <input type="checkbox" checked={form.active}
                                            onChange={e => setForm({ ...form, active: e.target.checked })} />
                                        Active (visible on website)
                                    </label>
                                </div>
                            </div>
                            <div className="admin-modal-footer">
                                <button type="button" className="admin-btn admin-btn-secondary"
                                    onClick={() => setModalOpen(false)}>Cancel</button>
                                <button type="submit" className="admin-btn admin-btn-primary" disabled={saving}>
                                    {saving ? 'Saving...' : editItem ? 'Save Changes' : 'Add Service'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {toast && <div className="admin-toast"><span className="admin-toast-msg">{toast}</span></div>}
        </AdminLayout>
    )
}

export default ServicesManager