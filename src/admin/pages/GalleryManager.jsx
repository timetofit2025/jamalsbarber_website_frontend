// src/admin/pages/GalleryManager.jsx
import React, { useState, useEffect, useRef } from 'react'
import AdminLayout from '../../admin/components/AdminLayout/AdminLayout'
import { galleryAPI, bookingsAPI } from '../api/api'

const GalleryManager = () => {
    const [images,    setImages]    = useState([])
    const [loading,   setLoading]   = useState(true)
    const [toast,     setToast]     = useState(null)
    const [modalOpen, setModalOpen] = useState(false)
    const [form,      setForm]      = useState({ label:'', category:'', displayOrder:0 })
    const [file,      setFile]      = useState(null)
    const [preview,   setPreview]   = useState(null)
    const [saving,    setSaving]    = useState(false)
    const [pendingCount, setPendingCount] = useState(0)
    const fileRef = useRef(null)

    useEffect(() => { fetchData() }, [])

    const fetchData = async () => {
        try {
            const [data, bookings] = await Promise.all([
                galleryAPI.getAll(),
                bookingsAPI.getAll(),
            ])
            setImages(data)
            setPendingCount(bookings.filter(b => b.status === 'pending').length)
        } catch (err) {
            showToast('❌ Failed to load gallery')
        } finally {
            setLoading(false)
        }
    }

    const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 3000) }

    const handleFileChange = (e) => {
        const f = e.target.files[0]
        if (!f) return
        setFile(f)
        setPreview(URL.createObjectURL(f))
    }

    const handleUpload = async (e) => {
        e.preventDefault()
        if (!file) { showToast('⚠ Please select an image'); return }
        setSaving(true)
        try {
            const fd = new FormData()
            fd.append('image', file)
            fd.append('label', form.label)
            if (form.category)     fd.append('category', form.category)
            if (form.displayOrder) fd.append('displayOrder', form.displayOrder)

            const created = await galleryAPI.upload(fd)
            setImages(prev => [...prev, created])
            setModalOpen(false)
            setForm({ label:'', category:'', displayOrder:0 })
            setFile(null)
            setPreview(null)
            showToast('🖼 Image uploaded to gallery.')
        } catch (err) {
            showToast('❌ Upload failed: ' + err.message)
        } finally {
            setSaving(false)
        }
    }

    const handleToggle = async (id) => {
        try {
            const updated = await galleryAPI.toggleVisibility(id)
            setImages(prev => prev.map(img => img.id === id ? updated : img))
            showToast('👁 Visibility updated.')
        } catch (err) {
            showToast('❌ Failed to update visibility')
        }
    }

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this image permanently?')) return
        try {
            await galleryAPI.delete(id)
            setImages(prev => prev.filter(img => img.id !== id))
            showToast('🗑 Image deleted.')
        } catch (err) {
            showToast('❌ Failed to delete image')
        }
    }

    const visible  = images.filter(i => i.visible).length
    const hidden   = images.filter(i => !i.visible).length

    return (
        <AdminLayout pendingCount={pendingCount}>
            <div className="admin-page">

                <div className="admin-page-header">
                    <div>
                        <h1 className="admin-page-title">Gallery</h1>
                        <p className="admin-page-sub">
                            {images.length} images · {visible} visible · {hidden} hidden
                        </p>
                    </div>
                    <button className="admin-btn admin-btn-primary" onClick={() => setModalOpen(true)}>
                        + Upload Image
                    </button>
                </div>

                {loading ? (
                    <div className="admin-loading"><div className="loading-spinner" /> Loading gallery...</div>
                ) : images.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">🖼</div>
                        <div className="empty-text">No images yet. Upload your first photo!</div>
                    </div>
                ) : (
                    <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(200px,1fr))', gap:12 }}>
                        {images.map(img => (
                            <div key={img.id} style={{
                                background:'#1a1a1a',
                                border:'1px solid rgba(255,255,255,0.07)',
                                borderRadius:8,
                                overflow:'hidden',
                                opacity: img.visible ? 1 : 0.5,
                                transition:'opacity 0.3s',
                            }}>
                                <div style={{ position:'relative', aspectRatio:'1' }}>
                                    <img
                                        src={`http://localhost:8080${img.imageUrl}`}
                                        alt={img.label}
                                        style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }}
                                    />
                                    {!img.visible && (
                                        <div style={{
                                            position:'absolute', inset:0,
                                            background:'rgba(0,0,0,0.5)',
                                            display:'flex', alignItems:'center', justifyContent:'center',
                                            fontSize:'1.5rem',
                                        }}>👁‍🗨</div>
                                    )}
                                </div>
                                <div style={{ padding:'12px' }}>
                                    <div style={{ fontSize:'0.85rem', fontWeight:600, color:'#fff', marginBottom:4 }}>
                                        {img.label}
                                    </div>
                                    {img.category && (
                                        <div style={{ fontSize:'0.7rem', color:'#c8a96e', marginBottom:8 }}>
                                            {img.category}
                                        </div>
                                    )}
                                    <div className="action-btns">
                                        <button className="act-btn act-view"
                                            onClick={() => handleToggle(img.id)}>
                                            {img.visible ? '👁 Hide' : '👁 Show'}
                                        </button>
                                        <button className="act-btn act-delete"
                                            onClick={() => handleDelete(img.id)}>
                                            🗑
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Upload Modal */}
            {modalOpen && (
                <div className="admin-modal-overlay" onClick={e => e.target === e.currentTarget && setModalOpen(false)}>
                    <div className="admin-modal">
                        <div className="admin-modal-header">
                            <div className="admin-modal-title">Upload Gallery Image</div>
                            <button className="admin-modal-close" onClick={() => setModalOpen(false)}>✕</button>
                        </div>
                        <form onSubmit={handleUpload}>
                            <div className="admin-form">
                                {/* File upload */}
                                <div className="admin-form-group">
                                    <label className="admin-label">Image File *</label>
                                    <div className="upload-zone" onClick={() => fileRef.current.click()}>
                                        <div className="upload-zone-icon">📁</div>
                                        <div className="upload-zone-text">
                                            {file ? file.name : 'Click to select image'}
                                        </div>
                                        <input
                                            ref={fileRef}
                                            type="file"
                                            accept="image/*"
                                            style={{ display:'none' }}
                                            onChange={handleFileChange}
                                        />
                                    </div>
                                    {preview && (
                                        <img src={preview} alt="Preview" className="upload-preview" />
                                    )}
                                </div>

                                <div className="admin-form-grid">
                                    <div className="admin-form-group">
                                        <label className="admin-label">Caption / Label *</label>
                                        <input className="admin-input" required placeholder="e.g. Fresh Fade"
                                            value={form.label} onChange={e => setForm({...form, label:e.target.value})} />
                                    </div>
                                    <div className="admin-form-group">
                                        <label className="admin-label">Category (optional)</label>
                                        <select className="admin-select" value={form.category}
                                            onChange={e => setForm({...form, category:e.target.value})}>
                                            <option value="">Select category</option>
                                            <option value="cuts">Cuts</option>
                                            <option value="shaves">Shaves</option>
                                            <option value="interior">Interior</option>
                                            <option value="team">Team</option>
                                            <option value="tools">Tools</option>
                                        </select>
                                    </div>
                                    <div className="admin-form-group">
                                        <label className="admin-label">Display Order</label>
                                        <input className="admin-input" type="number" min="0" placeholder="0"
                                            value={form.displayOrder}
                                            onChange={e => setForm({...form, displayOrder:parseInt(e.target.value)||0})} />
                                    </div>
                                </div>
                            </div>
                            <div className="admin-modal-footer">
                                <button type="button" className="admin-btn admin-btn-secondary"
                                    onClick={() => setModalOpen(false)}>Cancel</button>
                                <button type="submit" className="admin-btn admin-btn-primary" disabled={saving}>
                                    {saving ? 'Uploading...' : 'Upload Image'}
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

export default GalleryManager