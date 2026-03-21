import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import './Header.css'

const Header = () => {
    const [scrolled, setScrolled] = useState(false)
    const [menuOpen, setMenuOpen] = useState(false)

    const navigate = useNavigate()
    const location = useLocation()

    // Track scroll for sticky header style
    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 50)
        window.addEventListener('scroll', onScroll)
        return () => window.removeEventListener('scroll', onScroll)
    }, [])

    // Scroll to a section on the home page
    const scrollToSection = (id) => {
        setMenuOpen(false)
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
    }

    // Handle each nav link click
    const handleNavClick = (e, id) => {
        e.preventDefault()
        setMenuOpen(false)

        if (id === 'menu') {
            // Navigate to the /menu route
            navigate('/menu')
        } else if (location.pathname !== '/') {
            // If not on home page, go home first then scroll
            navigate('/')
            setTimeout(() => {
                document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
            }, 100)
        } else {
            // Already on home page — just scroll
            scrollToSection(id)
        }
    }

    // Check if Menu route is currently active
    const isMenuActive = location.pathname === '/menu'

    return (
        <>
            {/* ── MAIN HEADER ── */}
            <header className={`header ${scrolled ? 'scrolled' : ''}`}>

                {/* Logo — always goes back to home */}
                <div
                    className="logo"
                    onClick={() => navigate('/')}
                >
                    <div className="logo-icon">✂</div>
                    JAMAL&apos;S <span className="logo-accent">BARBERS</span>
                </div>

                {/* Desktop Nav */}
                <nav className="nav">
                    {['about', 'services', 'menu', 'gallery', 'team'].map(id => (
                        <a
                            key={id}
                            href="#"
                            className={id === 'menu' && isMenuActive ? 'nav-active' : ''}
                            onClick={e => handleNavClick(e, id)}
                        >
                            {id.charAt(0).toUpperCase() + id.slice(1)}
                        </a>
                    ))}

                    <a
                        href="#"
                        className="nav-cta"
                        onClick={e => handleNavClick(e, 'booking')}
                    >
                        Book Now
                    </a>
                </nav>

                {/* Hamburger (Mobile) */}
                <button
                    className={`hamburger ${menuOpen ? 'open' : ''}`}
                    onClick={() => setMenuOpen(prev => !prev)}
                    aria-label="Toggle menu"
                    aria-expanded={menuOpen}
                >
                    <span />
                    <span />
                    <span />
                </button>

            </header>

            {/* ── MOBILE NAV DRAWER ── */}
            <div className={`mobile-nav ${menuOpen ? 'open' : ''}`}>
                {['about', 'services', 'menu', 'gallery', 'team', 'booking'].map(id => (
                    <a
                        key={id}
                        href="#"
                        className={id === 'menu' && isMenuActive ? 'nav-active' : ''}
                        onClick={e => handleNavClick(e, id)}
                    >
                        {id === 'booking'
                            ? 'Book Now'
                            : id.charAt(0).toUpperCase() + id.slice(1)
                        }
                    </a>
                ))}
            </div>
        </>
    )
}

export default Header