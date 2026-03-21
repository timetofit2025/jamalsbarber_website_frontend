import React from 'react'
import { useNavigate } from 'react-router-dom'
import './Footer.css'

const SERVICES = [
    { title: "Classic Cut"       },
    { title: "Hot Towel Shave"   },
    { title: "Beard Sculpt"      },
    { title: "Signature Package" },
    { title: "Fade Artistry"     },
    { title: "Hair Treatment"    },
]

// Each Quick Link maps to a route path + section id to scroll to
const QUICK_LINKS = [
    { label: "About Us",      path: "/", section: "about"    },
    { label: "Our Services",  path: "/", section: "services" },
    { label: "Gallery",       path: "/", section: "gallery"  },
    { label: "Meet the Team", path: "/", section: "team"     },
    { label: "Book Now",      path: "/", section: "booking"  },
]

const Footer = () => {
    const navigate = useNavigate()

    // Navigate to route then smoothly scroll to the section
    const handleNav = (path, section) => {
        navigate(path)
        // Small delay allows the page to render before scrolling
        setTimeout(() => {
            document.getElementById(section)?.scrollIntoView({ behavior: 'smooth' })
        }, 100)
    }

    return (
        <footer className="footer">
            <div className="container">
                <div className="footer-grid">

                    {/* ── Brand Column ── */}
                    <div>
                        <div className="footer-brand-name">
                            JAMAL&apos;S <span>BARBERS</span>
                        </div>
                        <p className="footer-brand-desc">
                            Where precision meets passion. A sanctuary for the discerning
                            gentleman who understands that grooming is an art.
                        </p>
                        <div className="social-links">
                            {[
                                // { icon: "𝕏",  href: "#" },
                                { icon: "f",  href: "https://www.facebook.com/profile.php?id=100057250937636&sk=photos" },
                                { icon: "💬", href: "https://www.facebook.com/messages/t/100057250937636" },
                                { icon: "📍", href: "https://maps.app.goo.gl/WzKWxkdwq7EXZ17c7" },
                                // { icon: "📸", href: "#" },
                            ].map((s, i) => (
                                <a
                                    key={i}
                                    className="social-link"
                                    href={s.href}
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    {s.icon}
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* ── Quick Links ── */}
                    <div className="footer-col">
                        <h4>Quick Links</h4>
                        <ul>
                            {QUICK_LINKS.map(link => (
                                <li key={link.label}>
                                    <a
                                        href="#"
                                        onClick={e => {
                                            e.preventDefault()
                                            handleNav(link.path, link.section)
                                        }}
                                    >
                                        → {link.label}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* ── Services ── */}
                    <div className="footer-col">
                        <h4>Services</h4>
                        <ul>
                            {SERVICES.map(s => (
                                <li key={s.title}>
                                    <a
                                        href="#"
                                        onClick={e => {
                                            e.preventDefault()
                                            handleNav('/', 'services')
                                        }}
                                    >
                                        → {s.title}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* ── Opening Hours ── */}
                    <div className="footer-col">
                        <h4>Opening Hours</h4>
                        <div className="footer-hours">
                            {[
                                ["Monday",    "9AM – 7PM" ],
                                ["Tuesday",   "9AM – 7PM" ],
                                ["Wednesday", "9AM – 7PM" ],
                                ["Thursday",  "9AM – 7PM" ],
                                ["Friday",    "9AM – 7PM" ],
                                ["Saturday",  "9AM – 7PM" ],
                                ["Sunday",    "10AM – 5PM"],
                            ].map(([d, t]) => (
                                <div key={d} className="hours-row">
                                    <span className="hours-day">{d}</span>
                                    <span className="hours-time">{t}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>

                {/* ── Footer Bottom ── */}
                <div className="footer-bottom">
                    <p className="footer-copy">© 2025 Jamal Barbers. All rights reserved.</p>
                    {/* <div className="footer-bottom-links">
                        <a href="#" onClick={e => e.preventDefault()}>Privacy Policy</a>
                        <a href="#" onClick={e => e.preventDefault()}>Terms of Service</a>
                        <a href="#" onClick={e => e.preventDefault()}>Cookie Policy</a>
                    </div> */}
                </div>

            </div>
        </footer>
    )
}

export default Footer