// src/admin/pages/ArtistsManager.jsx
import React, { useState, useEffect, useRef } from 'react'
import AdminLayout from '../../admin/components/AdminLayout/AdminLayout'
import { artistsAPI, bookingsAPI } from '../api/api'

const EMPTY_FORM = { name:'', role:'', bio:'', instagram:'' }

const ArtistsManager = () => {
    const [artists,    setArtists]    = useState([])
    const [loading,    setLoading]    = useState(true)
    const [toast,      setToast]      = useState(null)
    const [modalOpen,  setModalOpen]  = useState(false)
    const [editArtist, setEditArtist] = useState(null)
    const [form,       setForm]       = useState(EMPTY_FORM)
    const [photo,      setPhoto]      = useState(null)
    const [preview,    setPreview]    = useState(null)
    const [saving,     setSaving]     = useState(false)
    const [pendingCount, setPendingCount] = useState(0)
    const fileRef = useRef(null)

    useEffect(() => { fetchData() }, [])

    const fetchData = async () => {
        try {
            const [data, bookings] = await Promise.all([
                artistsAPI.getAll(),
                bookingsAPI.getAll(),
            ])
            setArtists(data)
            setPendingCount(bookings.filter(b => b.status === 'pending').length)
        } catch (err) {
            showToast('❌ Failed to load artists')
        } finally {
            setLoading(false)
        }
    }

    const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 3000) }

    const openAdd = () => {
        setForm(EMPTY_FORM)
        setPhoto(null)
        setPreview(null)
        setEditArtist(null)
        setModalOpen(true)
    }

    const openEdit = (artist) => {
        setForm({ name: artist.name, role: artist.role, bio: artist.bio || '', instagram: artist.instagram || '' })
        setPhoto(null)
        setPreview(artist.photoUrl ? `http://localhost:8080${artist.photoUrl}` : null)
        setEditArtist(artist)
        setModalOpen(true)
    }

    const closeModal = () => { setModalOpen(false); setEditArtist(null) }

    const handlePhotoChange = (e) => {
        const file = e.target.files[0]
        if (!file) return
        setPhoto(file)
        setPreview(URL.createObjectURL(file))
    }

    const handleSave = async (e) => {
        e.preventDefault()
        setSaving(true)
        try {
            const fd = new FormData()
            fd.append('name', form.name)
            fd.append('role', form.role)
            if (form.bio)       fd.append('bio', form.bio)
            if (form.instagram) fd.append('instagram', form.instagram)
            if (photo)          fd.append('photo', photo)

            if (editArtist) {
                const updated = await artistsAPI.update(editArtist.id, fd)
                setArtists(prev => prev.map(a => a.id === editArtist.id ? updated : a))
                showToast('✏️ Artist updated successfully.')
            } else {
                const created = await artistsAPI.create(fd)
                setArtists(prev => [...prev, created])
                showToast('👤 New artist added to crew.')
            }
            closeModal()
        } catch (err) {
            showToast('❌ Failed to save artist: ' + err.message)
        } finally {
            setSaving(false)
        }
    }

    const handleDelete = async (id) => {
        if (!window.confirm('Remove this artist permanently?')) return
        try {
            await artistsAPI.delete(id)
            setArtists(prev => prev.filter(a => a.id !== id))
            showToast('🗑 Artist removed.')
        } catch (err) {
            showToast('❌ Failed to delete artist')
        }
    }

    return (
        <AdminLayout pendingCount={pendingCount}>
            <div className="admin-page">

                <div className="admin-page-header">
                    <div>
                        <h1 className="admin-page-title">Artist Crew</h1>
                        <p className="admin-page-sub">{artists.length} artists · Updates reflect live on website</p>
                    </div>
                    <button className="admin-btn admin-btn-primary" onClick={openAdd}>
                        + Add Artist
                    </button>
                </div>

                {loading ? (
                    <div className="admin-loading"><div className="loading-spinner" /> Loading artists...</div>
                ) : artists.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">👥</div>
                        <div className="empty-text">No artists yet. Add your first barber!</div>
                    </div>
                ) : (
                    <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(220px,1fr))', gap:16 }}>
                        {artists.map(artist => (
                            <div key={artist.id} className="admin-card" style={{ marginBottom:0 }}>
                                <img
                                    src={artist.photoUrl ? `http://localhost:8080${artist.photoUrl}` : 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&h=500&fit=crop&q=80'}
                                    alt={artist.name}
                                    style={{ width:'100%', aspectRatio:'3/4', objectFit:'cover', display:'block', filter:'grayscale(30%)' }}
                                />
                                <div style={{ padding:'16px' }}>
                                    <div style={{ fontFamily:'Playfair Display,serif', fontWeight:700, color:'#fff', marginBottom:3 }}>
                                        {artist.name}
                                    </div>
                                    <div style={{ fontSize:'0.78rem', color:'#c8a96e', marginBottom:10 }}>
                                        {artist.role}
                                    </div>
                                    {artist.bio && (
                                        <div style={{ fontSize:'0.78rem', color:'#888', marginBottom:12, lineHeight:1.5 }}>
                                            {artist.bio}
                                        </div>
                                    )}
                                    <span className={`badge ${artist.active ? 'badge-active' : 'badge-inactive'}`}>
                                        <span className="badge-dot" />
                                        {artist.active ? 'Active' : 'Inactive'}
                                    </span>
                                    <div className="action-btns" style={{ marginTop:12 }}>
                                        <button className="act-btn act-edit" onClick={() => openEdit(artist)}>✏ Edit</button>
                                        <button className="act-btn act-delete" onClick={() => handleDelete(artist.id)}>🗑 Remove</button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Modal */}
            {modalOpen && (
                <div className="admin-modal-overlay" onClick={e => e.target === e.currentTarget && closeModal()}>
                    <div className="admin-modal">
                        <div className="admin-modal-header">
                            <div className="admin-modal-title">
                                {editArtist ? 'Edit Artist' : 'Add New Artist'}
                            </div>
                            <button className="admin-modal-close" onClick={closeModal}>✕</button>
                        </div>
                        <form onSubmit={handleSave}>
                            <div className="admin-form">
                                {/* Photo upload */}
                                <div className="admin-form-group">
                                    <label className="admin-label">Photo</label>
                                    <div className="upload-zone" onClick={() => fileRef.current.click()}>
                                        <div className="upload-zone-icon">📸</div>
                                        <div className="upload-zone-text">
                                            {photo ? photo.name : 'Click to upload photo'}
                                        </div>
                                        <input
                                            ref={fileRef}
                                            type="file"
                                            accept="image/*"
                                            style={{ display:'none' }}
                                            onChange={handlePhotoChange}
                                        />
                                    </div>
                                    {preview && (
                                        <img src={preview} alt="Preview" className="upload-preview" />
                                    )}
                                </div>

                                <div className="admin-form-grid">
                                    <div className="admin-form-group">
                                        <label className="admin-label">Full Name *</label>
                                        <input className="admin-input" required placeholder="Artist's name"
                                            value={form.name} onChange={e => setForm({...form, name:e.target.value})} />
                                    </div>
                                    <div className="admin-form-group">
                                        <label className="admin-label">Role / Title *</label>
                                        <input className="admin-input" required placeholder="e.g. Senior Barber"
                                            value={form.role} onChange={e => setForm({...form, role:e.target.value})} />
                                    </div>
                                    <div className="admin-form-group full">
                                        <label className="admin-label">Bio (optional)</label>
                                        <textarea className="admin-textarea" placeholder="Short bio..."
                                            value={form.bio} onChange={e => setForm({...form, bio:e.target.value})} />
                                    </div>
                                    <div className="admin-form-group full">
                                        <label className="admin-label">Instagram (optional)</label>
                                        <input className="admin-input" placeholder="@username"
                                            value={form.instagram} onChange={e => setForm({...form, instagram:e.target.value})} />
                                    </div>
                                </div>
                            </div>
                            <div className="admin-modal-footer">
                                <button type="button" className="admin-btn admin-btn-secondary" onClick={closeModal}>
                                    Cancel
                                </button>
                                <button type="submit" className="admin-btn admin-btn-primary" disabled={saving}>
                                    {saving ? 'Saving...' : editArtist ? 'Save Changes' : 'Add to Crew'}
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

export default ArtistsManager