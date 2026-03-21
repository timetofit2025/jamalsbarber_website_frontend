// src/components/BookingCalendar/BookingCalendar.jsx
import React, { useState, useEffect } from 'react'
import './BookingCalendar.css'

const TIME_SLOTS = [
    "9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM",
    "1:00 PM",  "2:00 PM",  "3:00 PM",  "4:00 PM",
    "5:00 PM",  "6:00 PM",  "7:00 PM",
]

const DAYS    = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS  = [
    'January','February','March','April','May','June',
    'July','August','September','October','November','December'
]

const BASE_URL = import.meta.env.VITE_API_URL || '/api'

const BookingCalendar = ({ onDateSelect, onTimeSelect, selectedDate, selectedTime }) => {

    const today     = new Date()
    const [viewYear,  setViewYear]  = useState(today.getFullYear())
    const [viewMonth, setViewMonth] = useState(today.getMonth())

    // Month availability: { "2026-03-21": "available"|"busy"|"full" }
    const [monthAvail,  setMonthAvail]  = useState({})
    const [daySlots,    setDaySlots]    = useState([])
    const [loadingMonth,setLoadingMonth]= useState(false)
    const [loadingDay,  setLoadingDay]  = useState(false)

    // Fetch month availability when month changes
    useEffect(() => {
        fetchMonthAvailability()
    }, [viewYear, viewMonth])

    // Fetch day slots when date selected
    useEffect(() => {
        if (selectedDate) fetchDayAvailability(selectedDate)
    }, [selectedDate])

    const fetchMonthAvailability = async () => {
        setLoadingMonth(true)
        try {
            const res = await fetch(
                `${BASE_URL}/bookings/availability/month?year=${viewYear}&month=${viewMonth + 1}`
            )
            const data = await res.json()
            setMonthAvail(data)
        } catch (err) {
            console.error('Failed to fetch month availability:', err)
        } finally {
            setLoadingMonth(false)
        }
    }

    const fetchDayAvailability = async (date) => {
        setLoadingDay(true)
        onTimeSelect('')  // reset time selection
        try {
            const res = await fetch(
                `${BASE_URL}/bookings/availability?date=${date}`
            )
            const data = await res.json()
            setDaySlots(data)
        } catch (err) {
            console.error('Failed to fetch day availability:', err)
        } finally {
            setLoadingDay(false)
        }
    }

    // Build calendar days
    const buildCalendar = () => {
        const firstDay  = new Date(viewYear, viewMonth, 1).getDay()
        const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()
        const cells = []

        // Empty cells before first day
        for (let i = 0; i < firstDay; i++) {
            cells.push(null)
        }
        // Day cells
        for (let d = 1; d <= daysInMonth; d++) {
            cells.push(d)
        }
        return cells
    }

    const formatDate = (day) => {
        const m = String(viewMonth + 1).padStart(2, '0')
        const d = String(day).padStart(2, '0')
        return `${viewYear}-${m}-${d}`
    }

    const isPastDate = (day) => {
        const date = new Date(viewYear, viewMonth, day)
        const todayStart = new Date()
        todayStart.setHours(0, 0, 0, 0)
        return date < todayStart
    }

    const prevMonth = () => {
        if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1) }
        else setViewMonth(m => m - 1)
    }

    const nextMonth = () => {
        if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1) }
        else setViewMonth(m => m + 1)
    }

    const handleDayClick = (day) => {
        if (isPastDate(day)) return
        const date = formatDate(day)
        onDateSelect(date)
    }

    const getSlotStatus = (time) => {
        const slot = daySlots.find(s => s.time === time)
        return slot ? slot.status : 'available'
    }

    const getSlotCount = (time) => {
        const slot = daySlots.find(s => s.time === time)
        return slot ? slot.bookedCount : 0
    }

    const cells = buildCalendar()

    return (
        <div className="booking-calendar">

            {/* ── Calendar Header ── */}
            <div className="cal-header">
                <button className="cal-nav-btn" onClick={prevMonth}>‹</button>
                <div className="cal-title">
                    {MONTHS[viewMonth]} {viewYear}
                    {loadingMonth && <span className="cal-loading"> ●</span>}
                </div>
                <button className="cal-nav-btn" onClick={nextMonth}>›</button>
            </div>

            {/* ── Legend ── */}
            <div className="cal-legend">
                <span className="legend-item">
                    <span className="legend-dot available" /> Available
                </span>
                <span className="legend-item">
                    <span className="legend-dot busy" /> Busy
                </span>
                <span className="legend-item">
                    <span className="legend-dot full" /> Full
                </span>
            </div>

            {/* ── Day Headers ── */}
            <div className="cal-grid">
                {DAYS.map(d => (
                    <div key={d} className="cal-day-header">{d}</div>
                ))}

                {/* ── Calendar Cells ── */}
                {cells.map((day, i) => {
                    if (!day) return <div key={`empty-${i}`} className="cal-cell empty" />

                    const date      = formatDate(day)
                    const past      = isPastDate(day)
                    const status    = monthAvail[date] || 'available'
                    const isSelected = selectedDate === date
                    const isToday   = date === formatDate(today.getDate()) &&
                                      viewMonth === today.getMonth() &&
                                      viewYear  === today.getFullYear()

                    return (
                        <div
                            key={date}
                            className={`cal-cell
                                ${past        ? 'past'     : ''}
                                ${isSelected  ? 'selected' : ''}
                                ${isToday     ? 'today'    : ''}
                                ${!past       ? status     : ''}
                            `}
                            onClick={() => !past && handleDayClick(day)}
                            title={past ? 'Past date' : status}
                        >
                            <span className="cal-day-num">{day}</span>
                            {!past && status !== 'available' && (
                                <span className="cal-dot" />
                            )}
                        </div>
                    )
                })}
            </div>

            {/* ── Time Slots ── */}
            {selectedDate && (
                <div className="time-slots-section">
                    <div className="time-slots-title">
                        Available Times for{' '}
                        <strong>{new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-GB', {
                            weekday: 'long', day: 'numeric', month: 'long'
                        })}</strong>
                    </div>

                    {loadingDay ? (
                        <div className="slots-loading">
                            <div className="slots-spinner" /> Checking availability...
                        </div>
                    ) : (
                        <div className="time-slots-grid">
                            {TIME_SLOTS.map(time => {
                                const status    = getSlotStatus(time)
                                const count     = getSlotCount(time)
                                const remaining = 3 - count
                                const isFull    = status === 'full'
                                const isSelected = selectedTime === time

                                return (
                                    <button
                                        key={time}
                                        className={`time-slot
                                            ${status}
                                            ${isSelected ? 'selected' : ''}
                                            ${isFull ? 'disabled' : ''}
                                        `}
                                        onClick={() => !isFull && onTimeSelect(time)}
                                        disabled={isFull}
                                        title={
                                            isFull
                                                ? 'This slot is fully booked'
                                                : `${remaining} spot${remaining !== 1 ? 's' : ''} remaining`
                                        }
                                    >
                                        <span className="slot-time">{time}</span>
                                        <span className="slot-status-label">
                                            {isFull
                                                ? '✕ Full'
                                                : status === 'busy'
                                                    ? `${remaining} left`
                                                    : 'Open'
                                            }
                                        </span>
                                    </button>
                                )
                            })}
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

export default BookingCalendar