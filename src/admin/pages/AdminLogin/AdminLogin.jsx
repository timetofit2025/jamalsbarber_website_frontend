// src/admin/pages/AdminLogin.jsx
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { authAPI } from '../../api/api'
import './AdminLogin.css'

const AdminLogin = () => {
    const navigate = useNavigate()
    const [form,    setForm]    = useState({ username: '', password: '' })
    const [error,   setError]   = useState('')
    const [loading, setLoading] = useState(false)

    // If already logged in, redirect to dashboard
    useEffect(() => {
        if (localStorage.getItem('adminToken')) {
            navigate('/admin/dashboard')
        }
    }, [])

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            const data = await authAPI.login(form.username, form.password)
            if (data.token) {
                localStorage.setItem('adminToken', data.token)
                navigate('/admin/dashboard')
            } else {
                setError(data.message || 'Login failed')
            }
        } catch (err) {
            setError(err.message || 'Invalid username or password')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="login-page">
            {/* Background decoration */}
            <div className="login-bg">
                <div className="login-bg-circle login-bg-c1" />
                <div className="login-bg-circle login-bg-c2" />
                <div className="login-bg-lines">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="login-bg-line" />
                    ))}
                </div>
            </div>

            <div className="login-box">
                {/* Logo */}
                <div className="login-logo">
                    <div className="login-logo-icon">✂</div>
                    <div>
                        <div className="login-logo-name">
                            JAMAL<span>'S</span> BARBERS
                        </div>
                        <div className="login-logo-sub">Admin Portal</div>
                    </div>
                </div>

                <div className="login-divider" />

                <h2 className="login-title">Welcome Back</h2>
                <p className="login-subtitle">
                    Sign in to manage your barbershop
                </p>

                {/* Error */}
                {error && (
                    <div className="login-error">
                        ⚠ {error}
                    </div>
                )}

                {/* Form */}
                <form className="login-form" onSubmit={handleSubmit}>
                    <div className="login-field">
                        <label className="login-label">Username</label>
                        <input
                            className="login-input"
                            type="text"
                            placeholder="Enter your username"
                            required
                            value={form.username}
                            onChange={e => setForm({ ...form, username: e.target.value })}
                        />
                    </div>
                    <div className="login-field">
                        <label className="login-label">Password</label>
                        <input
                            className="login-input"
                            type="password"
                            placeholder="Enter your password"
                            required
                            value={form.password}
                            onChange={e => setForm({ ...form, password: e.target.value })}
                        />
                    </div>
                    <button
                        className="login-btn"
                        type="submit"
                        disabled={loading}
                    >
                        {loading ? (
                            <span className="login-btn-loading">
                                <span className="login-spinner" /> Authenticating...
                            </span>
                        ) : (
                            'Sign In to Dashboard'
                        )}
                    </button>
                </form>

                <p className="login-note">
                    🔒 Secure admin access only
                </p>
            </div>
        </div>
    )
}

export default AdminLogin