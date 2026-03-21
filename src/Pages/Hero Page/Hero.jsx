import React, { useState, useEffect, useRef } from 'react'
import './Hero.css'
import { fetchArtists, fetchGallery, fetchServices } from '../../admin/api/publicApi'

/* ── INTERSECTION OBSERVER HOOK ── */
const useInView = (threshold = 0.15) => {
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

/* ── STATIC DATA (Testimonials stay hardcoded) ── */
const TESTIMONIALS = [
    { stars: "★★★★★", text: "Jamal's is not just a barber shop — it's an experience. The attention to detail is unmatched and the atmosphere is exactly what a classic barbershop should feel like.", name: "Marcus T.",  role: "Regular Client",    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&q=80" },
    { stars: "★★★★★", text: "Best hot towel shave in the city, hands down. I've been coming here every two weeks for three years and the quality has never wavered once.",                          name: "Darius K.",  role: "Loyal Member",      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&q=80" },
    { stars: "★★★★★", text: "From the moment you walk in, you feel the difference. Skilled barbers, premium products, and a vibe that makes you want to stay all day.",                            name: "Jordan M.",  role: "First-Time Visitor", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&q=80" },
]

const TIME_SLOTS = [
    "9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM",
    "1:00 PM", "2:00 PM",  "3:00 PM",  "4:00 PM",
    "5:00 PM", "6:00 PM",  "7:00 PM",
]

/* ── FALLBACK image if artist has no photo ── */
const FALLBACK_IMG = 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&h=500&fit=crop&q=80'

/* ── ANIMATED SECTION ── */
function AnimatedSection({ children, className = '', style: s = {} }) {
    const [ref, inView] = useInView()
    return (
        <div ref={ref} className={`reveal ${inView ? 'visible' : ''} ${className}`} style={s}>
            {children}
        </div>
    )
}

/* ── MAIN COMPONENT ── */
export default function JamalBarbers() {

    const [scrolled,     setScrolled]     = useState(false)
    const [submitted,    setSubmitted]    = useState(false)
    const [submitting,   setSubmitting]   = useState(false)
    const [submitError,  setSubmitError]  = useState('')
    const [formData,     setFormData]     = useState({
        name: '', email: '', phone: '',
        service: '', artist: '',
        date: '', time: '', notes: '',
    })

    // ── Live data from backend ──
    const [team,        setTeam]        = useState([])
    const [galleryImgs, setGalleryImgs] = useState([])
    const [services,    setServices]    = useState([])
    const [dataLoading, setDataLoading] = useState(true)

    // ── Scroll listener ──
    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 50)
        window.addEventListener('scroll', onScroll)
        return () => window.removeEventListener('scroll', onScroll)
    }, [])

    // ── Fetch all live data from Spring Boot ──
    useEffect(() => {
        const loadData = async () => {
            try {
                const [artists, gallery, svcs] = await Promise.all([
                    fetchArtists(),
                    fetchGallery(),
                    fetchServices(),
                ])
                setTeam(artists)
                setGalleryImgs(gallery)
                setServices(svcs)
            } catch (err) {
                console.error('Failed to load website data:', err)
            } finally {
                setDataLoading(false)
            }
        }
        loadData()
    }, [])

    const handleNav = (id) => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setSubmitting(true)
        setSubmitError('')
        try {
            const res = await fetch('http://localhost:8080/api/bookings', {
                method:  'POST',
                headers: { 'Content-Type': 'application/json' },
                body:    JSON.stringify(formData),
            })
            if (!res.ok) throw new Error('Booking failed. Please try again.')
            setSubmitted(true)
            setFormData({ name:'', email:'', phone:'', service:'', artist:'', date:'', time:'', notes:'' })
        } catch (err) {
            setSubmitError(err.message || 'Something went wrong. Please try again.')
        } finally {
            setSubmitting(false)
        }
    }

    // ── Helper: get artist photo URL ──
    const artistPhoto = (artist) =>
        artist.photoUrl
            ? `http://localhost:8080${artist.photoUrl}`
            : FALLBACK_IMG

    // ── Helper: get gallery image URL ──
    const galleryUrl = (img) =>
        img.imageUrl
            ? `http://localhost:8080${img.imageUrl}`
            : img.src || ''

    const marqueeItems = [
        "Classic Cuts", "Hot Towel Shave", "Beard Sculpt",
        "Fade Artistry", "Scalp Treatments", "Premium Styling",
    ]

    return (
        <>
            {/* ══════════════════════════════════════
                HERO
            ══════════════════════════════════════ */}
            <section id="hero" className="hero">
                <div className="hero-bg" />
                <div className="hero-lines">
                    <div className="hero-line" />
                    <div className="hero-line" />
                    <div className="hero-line" />
                    <div className="hero-line" />
                </div>
                <div className="hero-image-frame">
                    <img src="https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=900&h=1100&fit=crop&q=90" alt="Barber at work" />
                </div>
                <div className="hero-content">
                    <div className="hero-tag">
                        <div className="hero-tag-line" />
                        <span>Est. 2008 · Premium Barbershop</span>
                    </div>
                    <h1 className="hero-h1">
                        THE ART<br />OF THE<br /><em>PERFECT</em><br />CUT.
                    </h1>
                    <p className="hero-sub">
                        Where tradition meets precision. Every visit is a ritual, every cut a signature.
                    </p>
                    <div className="hero-actions">
                        <button className="btn-primary" onClick={() => handleNav('booking')}>Book Appointment</button>
                        <button className="btn-outline" onClick={() => handleNav('services')}>Our Services</button>
                    </div>
                    <div className="hero-stats">
                        <div>
                            <div className="stat-num">15<span>+</span></div>
                            <div className="stat-label">Years of Craft</div>
                        </div>
                        <div>
                            <div className="stat-num">4<span>K+</span></div>
                            <div className="stat-label">Happy Clients</div>
                        </div>
                        <div>
                            <div className="stat-num">4<span>.</span>7</div>
                            <div className="stat-label">Star Rating</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════
                MARQUEE
            ══════════════════════════════════════ */}
            <div className="marquee-section">
                <div className="marquee-track">
                    {[...marqueeItems, ...marqueeItems].map((item, i) => (
                        <span key={i} className="marquee-item">
                            {item} <span className="marquee-dot" />
                        </span>
                    ))}
                </div>
            </div>

            {/* ══════════════════════════════════════
                ABOUT
            ══════════════════════════════════════ */}
            <section id="about" className="about">
                <div className="container">
                    <div className="about-grid">
                        <AnimatedSection>
                            <div className="about-image-wrap">
                                <img className="about-image-main"
                                    src="https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=700&h=875&fit=crop&q=85"
                                    alt="Jamal Barbershop" />
                                <div className="about-badge">
                                    <div className="about-badge-num">15</div>
                                    <div className="about-badge-txt">Years of<br />Excellence</div>
                                </div>
                            </div>
                        </AnimatedSection>
                        <div className="about-text">
                            <AnimatedSection>
                                <div className="section-tag">
                                    <div className="section-tag-line" />
                                    <span>Our Story</span>
                                </div>
                                <h2 className="section-title">
                                    More Than a<br />Haircut. It&apos;s a<br />
                                    <em style={{ fontFamily: 'Playfair Display,serif', fontStyle: 'italic' }}>Legacy.</em>
                                </h2>
                                <p className="section-sub">
                                    Founded in 2008, Jamal Barbers has been the destination for men who understand
                                    that grooming is an art form. We combine old-school craftsmanship with modern
                                    technique in an atmosphere that feels like home.
                                </p>
                            </AnimatedSection>
                            <div className="about-features">
                                {[
                                    { icon: "⚡", title: "Expert Barbers",       desc: "A team of passionate professionals with decades of combined experience." },
                                    { icon: "🏆", title: "Premium Products",     desc: "We use only the finest grooming products sourced from around the world."  },
                                    { icon: "🎯", title: "Precision Every Time", desc: "Consistency is our hallmark. Every visit exceeds the last."                },
                                ].map((f, i) => (
                                    <AnimatedSection key={i} className={`delay-${i + 1}`}>
                                        <div className="about-feature">
                                            <div className="feature-icon">{f.icon}</div>
                                            <div className="feature-txt">
                                                <h4>{f.title}</h4>
                                                <p>{f.desc}</p>
                                            </div>
                                        </div>
                                    </AnimatedSection>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════
                SERVICES — Live from backend
            ══════════════════════════════════════ */}
            <section id="services" className="services">
                <div className="services-bg" />
                <div className="container">
                    <AnimatedSection>
                        <div className="section-tag">
                            <div className="section-tag-line" />
                            <span>What We Offer</span>
                        </div>
                        <h2 className="section-title">Our Services</h2>
                        <p className="section-sub">Every service crafted with obsessive attention to detail, delivered with quiet confidence.</p>
                    </AnimatedSection>
                    <div className="services-grid">
                        {dataLoading ? (
                            <p style={{ color: '#888', padding: '40px 0' }}>Loading services...</p>
                        ) : services.length === 0 ? (
                            <p style={{ color: '#888', padding: '40px 0' }}>No services available.</p>
                        ) : (
                            services.map((s, i) => (
                                <AnimatedSection key={s.id || i} className={`delay-${(i % 3) + 1}`}>
                                    <div className="service-card">
                                        <div className="service-card-gloss" />
                                        {/* ✅ num from backend */}
                                        <div className="service-card-num">{s.num || `0${i + 1}`}</div>
                                        {/* ✅ icon from backend */}
                                        <div className="service-icon">{s.icon || '✂️'}</div>
                                        <h3>{s.title}</h3>
                                        {/* ✅ description (not desc) */}
                                        <p>{s.description}</p>
                                        {/* ✅ price with £ symbol */}
                                        <div className="service-price">£{s.price}</div>
                                        {/* ✅ priceNote (not note) */}
                                        <div className="service-price-note">{s.priceNote}</div>
                                    </div>
                                </AnimatedSection>
                            ))
                        )}
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════
                GALLERY — Live from backend
            ══════════════════════════════════════ */}
            <section id="gallery" className="gallery">
                <div className="container">
                    <AnimatedSection>
                        <div className="section-tag">
                            <div className="section-tag-line" />
                            <span>Our Work</span>
                        </div>
                        <h2 className="section-title">The Gallery</h2>
                        <p className="section-sub">A glimpse into the craft, the space, and the experience that defines us.</p>
                    </AnimatedSection>
                    <div className="gallery-grid">
                        {dataLoading ? (
                            <p style={{ color: '#888', padding: '40px 0' }}>Loading gallery...</p>
                        ) : galleryImgs.length === 0 ? (
                            <p style={{ color: '#888', padding: '40px 0' }}>No gallery images yet.</p>
                        ) : (
                            galleryImgs.map((g, i) => (
                                <div
                                    key={g.id || i}
                                    className="gallery-item"
                                    style={
                                        i === 0 ? { gridColumn: 'span 2', gridRow: 'span 2' } :
                                        i === 3 ? { gridColumn: 'span 2' } : {}
                                    }
                                >
                                    {/* ✅ imageUrl from backend */}
                                    <img src={galleryUrl(g)} alt={g.label} loading="lazy" />
                                    <div className="gallery-overlay">
                                        <div className="gallery-overlay-inner">
                                            <p>{g.label}</p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════
                TEAM — Live from backend
            ══════════════════════════════════════ */}
            <section id="team" className="team">
                <div className="container">
                    <AnimatedSection>
                        <div className="section-tag">
                            <div className="section-tag-line" />
                            <span>Meet The Crew</span>
                        </div>
                        <h2 className="section-title">The Artists<br />Behind the Chair</h2>
                    </AnimatedSection>
                    <div className="team-grid">
                        {dataLoading ? (
                            <p style={{ color: '#888', padding: '40px 0' }}>Loading team...</p>
                        ) : team.length === 0 ? (
                            <p style={{ color: '#888', padding: '40px 0' }}>No team members yet.</p>
                        ) : (
                            team.map((m, i) => (
                                <AnimatedSection key={m.id || i} className={`delay-${(i % 4) + 1}`}>
                                    <div className="team-card">
                                        {/* ✅ photoUrl from backend, with fallback */}
                                        <img src={artistPhoto(m)} alt={m.name} loading="lazy" />
                                        <div className="team-card-name-always">
                                            <h3>{m.name}</h3>
                                            <p>{m.role}</p>
                                        </div>
                                        <div className="team-card-info">
                                            <h3>{m.name}</h3>
                                            <p>{m.role}</p>
                                        </div>
                                    </div>
                                </AnimatedSection>
                            ))
                        )}
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════
                TESTIMONIALS — Static (hardcoded)
            ══════════════════════════════════════ */}
            <section className="testimonials">
                <div className="container">
                    <AnimatedSection>
                        <div className="section-tag">
                            <div className="section-tag-line" />
                            <span>Client Words</span>
                        </div>
                        <h2 className="section-title">What They Say</h2>
                    </AnimatedSection>
                    <div className="testimonials-wrap">
                        {TESTIMONIALS.map((t, i) => (
                            <AnimatedSection key={i} className={`delay-${i + 1}`}>
                                <div className="testimonial-card">
                                    <div className="stars">{t.stars}</div>
                                    <p className="testimonial-text">{t.text}</p>
                                    <div className="testimonial-author">
                                        <img className="author-avatar" src={t.avatar} alt={t.name} />
                                        <div>
                                            <div className="author-name">{t.name}</div>
                                            <div className="author-role">{t.role}</div>
                                        </div>
                                    </div>
                                </div>
                            </AnimatedSection>
                        ))}
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════
                BOOKING — Submits to backend
            ══════════════════════════════════════ */}
            <section id="booking" className="booking">
                <div className="booking-bg" />
                <div className="container">
                    <div className="booking-grid">

                        {/* Left — Contact Info */}
                        <AnimatedSection>
                            <div className="booking-info">
                                <div className="section-tag">
                                    <div className="section-tag-line" />
                                    <span>Reservations</span>
                                </div>
                                <h2>Reserve Your<br />Chair Today</h2>
                                <p>Don&apos;t wait in line. Book your slot in advance and walk in knowing your barber is ready for you.</p>
                                <div className="contact-items">
                                    {[
                                        { icon: "📍", label: "Location", value: "111 St Marry Road Southampton SO14 0AN" },
                                        { icon: "📞", label: "Phone",    value: "+44 07477778677" },
                                        { icon: "✉️", label: "Email",    value: "hello@jamalbarbers.com" },
                                        { icon: "🕐", label: "Hours",    value: "Mon–Sat: 9AM–7PM · Sun: 10AM–5PM" },
                                    ].map((c, i) => (
                                        <div key={i} className="contact-item">
                                            <div className="contact-item-icon">{c.icon}</div>
                                            <div className="contact-item-text">
                                                <p>{c.label}</p>
                                                <span>{c.value}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </AnimatedSection>

                        {/* Right — Booking Form */}
                        <AnimatedSection>
                            {submitted ? (
                                <div style={{
                                    textAlign: 'center', padding: '60px 40px',
                                    background: 'rgba(200,169,110,0.06)',
                                    border: '1px solid rgba(200,169,110,0.2)',
                                    borderRadius: '4px',
                                }}>
                                    {/* Success icon */}
                                    <div style={{
                                        width: 72, height: 72,
                                        borderRadius: '50%',
                                        background: 'rgba(200,169,110,0.15)',
                                        border: '2px solid var(--gold)',
                                        display: 'flex', alignItems: 'center',
                                        justifyContent: 'center',
                                        margin: '0 auto 24px',
                                        fontSize: '2rem',
                                    }}>✓</div>
                                    <h3 style={{ fontFamily: 'Playfair Display,serif', fontSize: '1.8rem', color: 'var(--gold)', marginBottom: '12px' }}>
                                        Booking Submitted!
                                    </h3>
                                    <p style={{ color: 'var(--silver)', lineHeight: 1.8, marginBottom: 24 }}>
                                        Thank you! A confirmation email has been sent to <br />
                                        <strong style={{ color: 'var(--white)' }}>{formData.email || 'your email address'}</strong>.
                                    </p>
                                    <p style={{ color: 'var(--silver)', fontSize: '0.88rem', lineHeight: 1.7 }}>
                                        We&apos;ll review your request and be in touch shortly.
                                    </p>
                                    <button
                                        className="btn-outline"
                                        style={{ marginTop: 28 }}
                                        onClick={() => setSubmitted(false)}
                                    >
                                        Book Another Appointment
                                    </button>
                                </div>
                            ) : (
                                <form className="booking-form" onSubmit={handleSubmit}>

                                    {/* Name + Phone */}
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label className="form-label">Full Name</label>
                                            <input className="form-input" type="text" placeholder="Your name" required
                                                value={formData.name}
                                                onChange={e => setFormData({ ...formData, name: e.target.value })} />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Phone</label>
                                            <input className="form-input" type="tel" placeholder="+44 ..."
                                                value={formData.phone}
                                                onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                                        </div>
                                    </div>

                                    {/* Email */}
                                    <div className="form-group">
                                        <label className="form-label">Email</label>
                                        <input className="form-input" type="email" placeholder="your@email.com" required
                                            value={formData.email}
                                            onChange={e => setFormData({ ...formData, email: e.target.value })} />
                                    </div>

                                    {/* Service — from backend */}
                                    <div className="form-group">
                                        <label className="form-label">Service</label>
                                        <select className="form-select" required
                                            value={formData.service}
                                            onChange={e => setFormData({ ...formData, service: e.target.value })}>
                                            <option value="">Select a service</option>
                                            {services.map(s => (
                                                <option key={s.id} value={s.title}>
                                                    {s.title} — £{s.price}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* ✅ Preferred Artist — from backend team */}
                                    <div className="form-group">
                                        <label className="form-label">Preferred Artist</label>
                                        <select className="form-select"
                                            value={formData.artist}
                                            onChange={e => setFormData({ ...formData, artist: e.target.value })}>
                                            <option value="">No preference — any artist</option>
                                            {team.map(t => (
                                                <option key={t.id} value={t.name}>
                                                    {t.name} · {t.role}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Date + Time */}
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label className="form-label">Preferred Date</label>
                                            <input className="form-input" type="date" required
                                                value={formData.date}
                                                onChange={e => setFormData({ ...formData, date: e.target.value })} />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Preferred Time</label>
                                            <select className="form-select"
                                                value={formData.time}
                                                onChange={e => setFormData({ ...formData, time: e.target.value })}>
                                                <option value="">Select time</option>
                                                {TIME_SLOTS.map(t => (
                                                    <option key={t}>{t}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    {/* Notes */}
                                    <div className="form-group">
                                        <label className="form-label">Additional Notes</label>
                                        <textarea className="form-textarea"
                                            placeholder="Any special requests or preferences..."
                                            value={formData.notes}
                                            onChange={e => setFormData({ ...formData, notes: e.target.value })} />
                                    </div>

                                    {/* Error message */}
                                    {submitError && (
                                        <div style={{
                                            background: 'rgba(239,68,68,0.1)',
                                            border: '1px solid rgba(239,68,68,0.3)',
                                            borderRadius: 4, padding: '12px 16px',
                                            color: '#fca5a5', fontSize: '0.85rem',
                                        }}>
                                            ⚠ {submitError}
                                        </div>
                                    )}

                                    <button
                                        type="submit"
                                        className="btn-primary"
                                        disabled={submitting}
                                        style={{
                                            width: '100%', textAlign: 'center',
                                            fontSize: '0.85rem',
                                            opacity: submitting ? 0.7 : 1,
                                            cursor: submitting ? 'not-allowed' : 'pointer',
                                        }}
                                    >
                                        {submitting ? '⏳ Submitting...' : 'Confirm Booking'}
                                    </button>

                                </form>
                            )}
                        </AnimatedSection>

                    </div>
                </div>
            </section>
        </>
    )
}