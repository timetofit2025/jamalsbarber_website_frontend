import React, { useState, useRef, useEffect } from 'react'
import { fetchServices } from '/src/admin/api/publicApi'
import './Menu.css'

/* ── Category meta (icons & descriptions by category name) ── */
const CATEGORY_META = {
    cuts:       { icon: '✂️',  label: 'Cuts & Styling',  description: 'Precision cuts crafted for your face shape and lifestyle.'          },
    shaves:     { icon: '🪒',  label: 'Shaves & Beard',  description: 'Rituals of grooming luxury using time-honoured techniques.'          },
    treatments: { icon: '🌿',  label: 'Treatments',      description: 'Restorative care for scalp health and hair vitality.'                },
    packages:   { icon: '👑',  label: 'Packages',        description: 'The full Jamal Barbers experience — curated for the discerning gentleman.' },
}

/* ── Default meta for any new category admin creates ── */
const defaultMeta = (cat) => ({
    icon:        '💈',
    label:       cat.charAt(0).toUpperCase() + cat.slice(1),
    description: `Premium ${cat} services.`,
})

/* ── INTERSECTION OBSERVER HOOK ── */
const useInView = (threshold = 0.1) => {
    const ref = useRef(null)
    const [inView, setInView] = useState(false)
    useEffect(() => {
        const obs = new IntersectionObserver(
            ([e]) => { if (e.isIntersecting) setInView(true) },
            { threshold }
        )
        if (ref.current) obs.observe(ref.current)
        return () => obs.disconnect()
    }, [])
    return [ref, inView]
}

/* ── MENU ITEM ── */
function MenuItem({ item, index }) {
    const [ref, inView] = useInView()
    return (
        <div
            ref={ref}
            className={`menu-item ${inView ? 'visible' : ''}`}
            style={{ transitionDelay: `${index * 60}ms` }}
        >
            <div className="menu-item-left">
                <div className="menu-item-top">
                    <span className="menu-item-name">{item.title}</span>
                    {item.popular && (
                        <span className="menu-item-badge">Popular</span>
                    )}
                </div>
                <p className="menu-item-desc">{item.description}</p>
                {item.duration && (
                    <span className="menu-item-duration">⏱ {item.duration}</span>
                )}
            </div>
            <div className="menu-item-right">
                <div className="menu-item-dots" aria-hidden="true" />
                <span className="menu-item-price">£{item.price}</span>
            </div>
        </div>
    )
}

/* ── CATEGORY SECTION ── */
function MenuCategory({ cat, isActive, onClick }) {
    const [ref, inView] = useInView()
    const meta = CATEGORY_META[cat.id] || defaultMeta(cat.id)

    return (
        <div
            ref={ref}
            id={`cat-${cat.id}`}
            className={`menu-category ${inView ? 'visible' : ''}`}
        >
            <div className="menu-category-header" onClick={onClick}>
                <div className="menu-category-header-left">
                    <span className="menu-category-icon">{meta.icon}</span>
                    <div>
                        <h3 className="menu-category-title">{meta.label}</h3>
                        <p className="menu-category-desc">{meta.description}</p>
                    </div>
                </div>
                <div className="menu-category-meta">
                    <span className="menu-category-count">{cat.items.length} services</span>
                    <span className={`menu-category-chevron ${isActive ? 'open' : ''}`}>›</span>
                </div>
            </div>

            <div className={`menu-category-body ${isActive ? 'open' : ''}`}>
                <div className="menu-items-list">
                    {cat.items.map((item, i) => (
                        <MenuItem key={item.id} item={item} index={i} />
                    ))}
                </div>
            </div>
        </div>
    )
}

/* ── LOADING SKELETON ── */
function MenuSkeleton() {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[1, 2, 3, 4].map(i => (
                <div key={i} style={{
                    height: 72,
                    background: 'rgba(255,255,255,0.04)',
                    borderRadius: 4,
                    animation: 'menuPulse 1.5s ease-in-out infinite',
                    animationDelay: `${i * 0.15}s`,
                }} />
            ))}
        </div>
    )
}

/* ══════════════════════════════════════
   MAIN MENU COMPONENT
══════════════════════════════════════ */
const Menu = () => {
    const [services,        setServices]        = useState([])
    const [loading,         setLoading]         = useState(true)
    const [error,           setError]           = useState(null)
    const [activeCategory,  setActiveCategory]  = useState(null)
    const [filter,          setFilter]          = useState('all')

    // ── Fetch services from Spring Boot on mount ──
    useEffect(() => {
        const load = async () => {
            try {
                const data = await fetchServices()
                setServices(data)
                // Auto-open the first category
                if (data.length > 0) {
                    const firstCat = data[0].category
                    setActiveCategory(firstCat)
                }
            } catch (err) {
                console.error('Failed to load services:', err)
                setError('Failed to load services. Please try again.')
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [])

    const toggleCategory = (id) => {
        setActiveCategory(prev => prev === id ? null : id)
    }

    // ── Group services by category ──
    const groupByCategory = (items) => {
        const grouped = {}
        items.forEach(item => {
            const cat = item.category || 'other'
            if (!grouped[cat]) grouped[cat] = []
            grouped[cat].push(item)
        })
        return Object.entries(grouped).map(([id, catItems]) => ({
            id,
            items: catItems,
        }))
    }

    // ── Apply filter ──
    const getFilteredServices = () => {
        if (filter === 'popular') return services.filter(s => s.popular)
        if (filter === 'under25') return services.filter(s => s.price < 25)
        return services
    }

    const filteredServices   = getFilteredServices()
    const categories         = groupByCategory(filteredServices)
    const totalServices      = services.length
    const uniqueCategories   = [...new Set(services.map(s => s.category))].length
    const minPrice           = services.length > 0
        ? Math.min(...services.map(s => s.price))
        : 0

    return (
        <section id="menu" className="menu-section">

            {/* Background decoration */}
            <div className="menu-bg-deco" aria-hidden="true">
                <div className="menu-bg-circle menu-bg-circle-1" />
                <div className="menu-bg-circle menu-bg-circle-2" />
            </div>

            <style>{`
                @keyframes menuPulse {
                    0%, 100% { opacity: 0.4; }
                    50%       { opacity: 0.8; }
                }
            `}</style>

            <div className="menu-container">

                {/* ── Section Header ── */}
                <div className="menu-header">
                    <div className="menu-header-tag">
                        <div className="menu-tag-line" />
                        <span>Our Menu</span>
                        <div className="menu-tag-line" />
                    </div>
                    <h2 className="menu-title">
                        Services &amp;<br /><em>Pricing</em>
                    </h2>
                    <p className="menu-subtitle">
                        Every service is a craft. Every price reflects the quality,
                        time and expertise that goes into your experience.
                    </p>

                    {/* Live stats from backend */}
                    {!loading && (
                        <div className="menu-stats-row">
                            <div className="menu-stat">
                                <span className="menu-stat-num">{totalServices}</span>
                                <span className="menu-stat-label">Services</span>
                            </div>
                            <div className="menu-stat-divider" />
                            <div className="menu-stat">
                                <span className="menu-stat-num">{uniqueCategories}</span>
                                <span className="menu-stat-label">Categories</span>
                            </div>
                            <div className="menu-stat-divider" />
                            <div className="menu-stat">
                                <span className="menu-stat-num">£{minPrice}</span>
                                <span className="menu-stat-label">Starting From</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* ── Error state ── */}
                {error && (
                    <div style={{
                        textAlign: 'center', padding: '40px',
                        color: '#ef4444', fontSize: '0.9rem',
                        background: 'rgba(239,68,68,0.08)',
                        border: '1px solid rgba(239,68,68,0.2)',
                        borderRadius: 4, marginBottom: 24,
                    }}>
                        ⚠ {error}
                    </div>
                )}

                {/* ── Loading state ── */}
                {loading ? (
                    <MenuSkeleton />
                ) : services.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '60px 24px', color: '#888' }}>
                        <div style={{ fontSize: '3rem', marginBottom: 12, opacity: 0.4 }}>💈</div>
                        <div>No services available at the moment.</div>
                    </div>
                ) : (
                    <>
                        {/* ── Filter Bar ── */}
                        <div className="menu-filter-bar">
                            {[
                                { id: 'all',     label: 'All Services' },
                                { id: 'popular', label: '⭐ Popular'   },
                                { id: 'under25', label: 'Under £25'   },
                            ].map(f => (
                                <button
                                    key={f.id}
                                    className={`menu-filter-btn ${filter === f.id ? 'active' : ''}`}
                                    onClick={() => setFilter(f.id)}
                                >
                                    {f.label}
                                </button>
                            ))}
                        </div>

                        {/* ── Tab Navigation ── */}
                        <div className="menu-tabs">
                            {categories.map(cat => {
                                const meta = CATEGORY_META[cat.id] || defaultMeta(cat.id)
                                return (
                                    <button
                                        key={cat.id}
                                        className={`menu-tab ${activeCategory === cat.id ? 'active' : ''}`}
                                        onClick={() => setActiveCategory(cat.id)}
                                    >
                                        <span className="menu-tab-icon">{meta.icon}</span>
                                        <span className="menu-tab-label">{meta.label}</span>
                                    </button>
                                )
                            })}
                        </div>

                        {/* ── Category Accordion ── */}
                        <div className="menu-categories">
                            {categories.map(cat => (
                                <MenuCategory
                                    key={cat.id}
                                    cat={cat}
                                    isActive={activeCategory === cat.id}
                                    onClick={() => toggleCategory(cat.id)}
                                />
                            ))}
                        </div>
                    </>
                )}

                {/* ── Footer Note ── */}
                {!loading && services.length > 0 && (
                    <div className="menu-footer-note">
                        <span className="menu-footer-note-icon">💈</span>
                        <p>
                            All prices are inclusive of VAT. Walk-ins welcome, but
                            <strong> booking in advance is recommended</strong> to
                            secure your preferred artist and time slot.
                        </p>
                    </div>
                )}

            </div>
        </section>
    )
}

export default Menu