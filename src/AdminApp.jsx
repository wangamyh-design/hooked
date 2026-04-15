import { useState, useRef, useEffect, useCallback } from 'react'

// ─── constants ────────────────────────────────────────────────────────────────

const ADMIN_PIN = '1234'
const IMG_V = Date.now()

const SPECIES_META = {
  'Snapper':   { img: `/snapper.png?v=${IMG_V}`,   scale: 1 },
  'Kingfish':  { img: `/kingfish.png?v=${IMG_V}`,  scale: 1 },
  'Kahawai':   { img: `/kahawai.png?v=${IMG_V}`,   scale: 1 },
  'Trevally':  { img: `/trevally.png?v=${IMG_V}`,  scale: 1 },
  'Gurnard':   { img: `/gurnard.png?v=${IMG_V}`,   scale: 1 },
  'John Dory': { img: `/john-dory.png?v=${IMG_V}`, scale: 1.45 },
}

const ALL_SPECIES = Object.keys(SPECIES_META)

// ─── helpers ──────────────────────────────────────────────────────────────────

function loadCatches() {
  try { return JSON.parse(localStorage.getItem('hooked_catches') || '[]') } catch { return [] }
}

function saveCatches(catches) {
  try { localStorage.setItem('hooked_catches', JSON.stringify(catches)) } catch {}
}

function isToday(isoString) {
  return new Date(isoString).toDateString() === new Date().toDateString()
}

function fmtDate(isoString) {
  const d = new Date(isoString)
  const dateStr = d.toLocaleDateString('en-NZ', { day: 'numeric', month: 'short' })
  const timeStr = d.toLocaleTimeString('en-NZ', { hour: 'numeric', minute: '2-digit', hour12: true })
  return `${dateStr} · ${timeStr}`
}

function toDateInputVal(isoString) {
  return new Date(isoString).toISOString().split('T')[0]
}

// ─── shared shell ─────────────────────────────────────────────────────────────

function Shell({ children }) {
  return (
    <div style={{
      minHeight: '100dvh',
      background: 'linear-gradient(160deg, #0B2A3B 0%, #071e2b 60%, #040f15 100%)',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', top: '-20%', left: '-20%',
        width: '70%', height: '60%',
        background: 'radial-gradient(ellipse, rgba(0,229,197,0.07) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: '-10%', right: '-15%',
        width: '60%', height: '50%',
        background: 'radial-gradient(ellipse, rgba(255,184,0,0.04) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      {children}
    </div>
  )
}

// ─── PIN screen ───────────────────────────────────────────────────────────────

function PinScreen({ onAuth }) {
  const [digits, setDigits] = useState(['', '', '', ''])
  const [error, setError]   = useState(false)
  const [shake, setShake]   = useState(false)
  const inputRefs = useRef([])

  useEffect(() => { inputRefs.current[0]?.focus() }, [])

  const handleChange = (i, raw) => {
    const d = raw.replace(/\D/g, '').slice(-1)
    const next = [...digits]
    next[i] = d
    setDigits(next)
    setError(false)
    if (d && i < 3) inputRefs.current[i + 1]?.focus()
  }

  const handleKeyDown = (i, e) => {
    if (e.key === 'Backspace') {
      if (digits[i]) {
        const next = [...digits]; next[i] = ''; setDigits(next)
      } else if (i > 0) {
        inputRefs.current[i - 1]?.focus()
      }
    }
    if (e.key === 'Enter') attempt()
  }

  const attempt = () => {
    if (digits.some(d => d === '')) return
    if (digits.join('') === ADMIN_PIN) {
      sessionStorage.setItem('hooked_admin', '1')
      onAuth()
    } else {
      setError(true)
      setShake(true)
      setDigits(['', '', '', ''])
      setTimeout(() => {
        setShake(false)
        inputRefs.current[0]?.focus()
      }, 600)
    }
  }

  const filled = digits.every(d => d !== '')

  return (
    <Shell>
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '40px 32px',
        maxWidth: '360px', margin: '0 auto', width: '100%',
      }}>

        {/* logo */}
        <div className="animate-fade-up" style={{ textAlign: 'center', marginBottom: '52px' }}>
          <div className="animate-float" style={{ fontSize: '2.8rem', marginBottom: '18px', display: 'block' }}>🎣</div>
          <div style={{
            fontFamily: "'Unbounded', sans-serif",
            fontSize: '2.2rem',
            fontWeight: 900,
            letterSpacing: '-0.02em',
            lineHeight: 1,
            background: 'linear-gradient(135deg, #F0F8FF 30%, #00E5C5 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            marginBottom: '10px',
          }}>
            HOOKED
          </div>
          <div style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: '0.7rem',
            fontWeight: 700,
            color: 'rgba(240,248,255,0.28)',
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
          }}>
            Admin Access
          </div>
        </div>

        {/* 4-digit PIN boxes */}
        <div
          className="animate-fade-up delay-2"
          style={{
            display: 'flex',
            gap: '12px',
            marginBottom: '8px',
            animation: shake ? 'shake 0.5s ease' : 'none',
          }}
        >
          {digits.map((d, i) => (
            <input
              key={i}
              ref={el => inputRefs.current[i] = el}
              type="password"
              inputMode="numeric"
              maxLength={1}
              value={d}
              onChange={e => handleChange(i, e.target.value)}
              onKeyDown={e => handleKeyDown(i, e)}
              style={{
                width: '60px',
                height: '68px',
                background: d
                  ? 'rgba(0,229,197,0.09)'
                  : error
                    ? 'rgba(239,68,68,0.06)'
                    : 'rgba(240,248,255,0.05)',
                border: `2px solid ${
                  error
                    ? 'rgba(239,68,68,0.45)'
                    : d
                      ? 'rgba(0,229,197,0.45)'
                      : 'rgba(240,248,255,0.12)'
                }`,
                borderRadius: '16px',
                color: '#00E5C5',
                fontFamily: "'Unbounded', sans-serif",
                fontSize: '1.6rem',
                fontWeight: 700,
                textAlign: 'center',
                outline: 'none',
                transition: 'border-color 0.15s, background 0.15s',
                caretColor: 'transparent',
              }}
            />
          ))}
        </div>

        {/* error message slot — always occupies space */}
        <div style={{ height: '24px', marginBottom: '24px', textAlign: 'center' }}>
          {error && (
            <span style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '0.82rem',
              fontWeight: 500,
              color: 'rgba(239,68,68,0.8)',
            }}>
              Incorrect PIN. Try again.
            </span>
          )}
        </div>

        {/* unlock button */}
        <div className="animate-fade-up delay-3" style={{ width: '100%' }}>
          <button
            onClick={attempt}
            disabled={!filled}
            style={{
              width: '100%',
              padding: '15px 24px',
              borderRadius: '99px',
              border: 'none',
              background: filled
                ? 'linear-gradient(135deg, #00E5C5 0%, #00c8ac 100%)'
                : 'rgba(240,248,255,0.07)',
              color: filled ? '#0B2A3B' : 'rgba(240,248,255,0.2)',
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '1rem',
              fontWeight: 700,
              cursor: filled ? 'pointer' : 'not-allowed',
              letterSpacing: '0.02em',
              boxShadow: filled ? '0 0 28px rgba(0,229,197,0.35)' : 'none',
              transition: 'all 0.2s ease',
            }}
          >
            Unlock
          </button>
        </div>
      </div>
    </Shell>
  )
}

// ─── stat card ────────────────────────────────────────────────────────────────

function StatCard({ label, value, sub, accent = '#00E5C5', children }) {
  return (
    <div style={{
      flex: 1,
      background: 'rgba(240,248,255,0.04)',
      border: '1.5px solid rgba(240,248,255,0.08)',
      borderRadius: '18px',
      padding: '20px',
    }}>
      <div style={{
        fontFamily: "'DM Sans', sans-serif",
        fontSize: '0.72rem',
        fontWeight: 700,
        color: 'rgba(240,248,255,0.35)',
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        marginBottom: '8px',
      }}>
        {label}
      </div>
      {children ?? (
        <>
          <div style={{
            fontFamily: "'Unbounded', sans-serif",
            fontSize: '2rem',
            fontWeight: 900,
            color: accent,
            lineHeight: 1,
            marginBottom: sub ? '6px' : 0,
          }}>
            {value}
          </div>
          {sub && (
            <div style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '0.8rem',
              color: 'rgba(240,248,255,0.4)',
              fontWeight: 400,
            }}>
              {sub}
            </div>
          )}
        </>
      )}
    </div>
  )
}

// ─── admin dashboard ──────────────────────────────────────────────────────────

function AdminDashboard({ onLogout }) {
  const [catches, setCatches]           = useState(loadCatches)
  const [dateFilter, setDateFilter]     = useState('')
  const [speciesFilter, setSpecies]     = useState('All')
  const [confirmClear, setConfirmClear] = useState(false)
  const [confirmDeleteId, setConfirmDeleteId] = useState(null)

  // re-read if storage changes in another tab
  useEffect(() => {
    const sync = () => setCatches(loadCatches())
    window.addEventListener('storage', sync)
    return () => window.removeEventListener('storage', sync)
  }, [])

  // ── derived stats ──────────────────────────────────────────────────────────
  const todayCatches = catches.filter(c => isToday(c.date))
  const longestToday = todayCatches.reduce((best, c) =>
    !best || Number(c.length) > Number(best.length) ? c : best, null)

  // ── filtered list (all time) ───────────────────────────────────────────────
  const filtered = catches
    .filter(c => {
      const matchDate    = !dateFilter || toDateInputVal(c.date) === dateFilter
      const matchSpecies = speciesFilter === 'All' || c.species === speciesFilter
      return matchDate && matchSpecies
    })
    .sort((a, b) => new Date(b.date) - new Date(a.date))

  // ── delete single catch ───────────────────────────────────────────────────
  const deleteCatch = (id) => {
    const kept = catches.filter(c => c.id !== id)
    saveCatches(kept)
    setCatches(kept)
    setConfirmDeleteId(null)
  }

  // ── clear today ───────────────────────────────────────────────────────────
  const clearToday = () => {
    const kept = catches.filter(c => !isToday(c.date))
    saveCatches(kept)
    setCatches(kept)
    setConfirmClear(false)
  }

  const hasFilters = dateFilter || speciesFilter !== 'All'

  return (
    <Shell>
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        maxWidth: '680px', margin: '0 auto', width: '100%',
        padding: '0 0 40px',
      }}>

        {/* ── top bar ─────────────────────────────────────────────────────── */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '24px 24px 0',
          marginBottom: '24px',
        }}>
          <div>
            <div style={{
              fontFamily: "'Unbounded', sans-serif",
              fontSize: 'clamp(1.2rem, 5vw, 1.5rem)',
              fontWeight: 900,
              color: '#F0F8FF',
              lineHeight: 1,
              marginBottom: '4px',
            }}>
              Admin
            </div>
            <div style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '0.78rem',
              color: 'rgba(240,248,255,0.3)',
              fontWeight: 500,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
            }}>
              {new Date().toLocaleDateString('en-NZ', { weekday: 'long', day: 'numeric', month: 'long' })}
            </div>
          </div>

          <button
            onClick={onLogout}
            style={{
              background: 'transparent',
              border: '1px solid rgba(240,248,255,0.12)',
              borderRadius: '99px',
              color: 'rgba(240,248,255,0.4)',
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '0.8rem',
              fontWeight: 500,
              padding: '7px 16px',
              cursor: 'pointer',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
            onMouseEnter={e => { e.currentTarget.style.color = '#F0F8FF'; e.currentTarget.style.borderColor = 'rgba(240,248,255,0.25)' }}
            onMouseLeave={e => { e.currentTarget.style.color = 'rgba(240,248,255,0.4)'; e.currentTarget.style.borderColor = 'rgba(240,248,255,0.12)' }}
          >
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
              <path d="M5 2H2a1 1 0 00-1 1v7a1 1 0 001 1h3M9 9l3-3-3-3M12 6.5H5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Logout
          </button>
        </div>

        {/* ── stat cards ──────────────────────────────────────────────────── */}
        <div className="animate-fade-up" style={{
          display: 'flex', gap: '12px',
          padding: '0 24px',
          marginBottom: '24px',
        }}>
          <StatCard
            label="Today's catches"
            value={todayCatches.length}
            sub={todayCatches.length === 1 ? 'catch logged' : 'catches logged'}
          />

          <StatCard label="Longest today" accent="#FFB800">
            {longestToday ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {SPECIES_META[longestToday.species] && (
                  <img
                    src={SPECIES_META[longestToday.species].img}
                    alt={longestToday.species}
                    style={{
                      width: '52px', height: '36px',
                      objectFit: 'contain',
                      mixBlendMode: 'lighten',
                      transform: `scale(${SPECIES_META[longestToday.species].scale})`,
                      flexShrink: 0,
                    }}
                  />
                )}
                <div>
                  <div style={{
                    fontFamily: "'Unbounded', sans-serif",
                    fontSize: '1.5rem',
                    fontWeight: 900,
                    color: '#FFB800',
                    lineHeight: 1,
                    marginBottom: '3px',
                  }}>
                    {longestToday.length}<span style={{ fontSize: '0.8rem', fontWeight: 600, marginLeft: '3px', color: 'rgba(255,184,0,0.6)' }}>cm</span>
                  </div>
                  <div style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: '0.75rem',
                    color: 'rgba(240,248,255,0.4)',
                    fontWeight: 400,
                    lineHeight: 1.3,
                  }}>
                    {longestToday.species}<br />{longestToday.name}
                  </div>
                </div>
              </div>
            ) : (
              <div style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: '0.85rem',
                color: 'rgba(240,248,255,0.2)',
                fontWeight: 400,
                marginTop: '4px',
              }}>
                No catches yet
              </div>
            )}
          </StatCard>
        </div>

        {/* ── filters ─────────────────────────────────────────────────────── */}
        <div className="animate-fade-up delay-1" style={{ padding: '0 24px', marginBottom: '16px' }}>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>

            {/* date input */}
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <input
                type="date"
                value={dateFilter}
                onChange={e => setDateFilter(e.target.value)}
                style={{
                  background: dateFilter ? 'rgba(0,229,197,0.08)' : 'rgba(240,248,255,0.05)',
                  border: `1.5px solid ${dateFilter ? 'rgba(0,229,197,0.35)' : 'rgba(240,248,255,0.12)'}`,
                  borderRadius: '99px',
                  color: dateFilter ? '#00E5C5' : 'rgba(240,248,255,0.45)',
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  padding: '7px 14px',
                  outline: 'none',
                  cursor: 'pointer',
                  colorScheme: 'dark',
                  transition: 'all 0.15s',
                }}
              />
            </div>

            {/* species chips */}
            <div style={{
              display: 'flex', gap: '6px',
              overflowX: 'auto',
              scrollbarWidth: 'none',
              flex: 1,
            }}>
              {['All', ...ALL_SPECIES].map(s => {
                const active = speciesFilter === s
                return (
                  <button
                    key={s}
                    onClick={() => setSpecies(s)}
                    style={{
                      flexShrink: 0,
                      padding: '7px 13px',
                      borderRadius: '99px',
                      border: `1.5px solid ${active ? '#00E5C5' : 'rgba(240,248,255,0.12)'}`,
                      background: active ? 'rgba(0,229,197,0.12)' : 'transparent',
                      color: active ? '#00E5C5' : 'rgba(240,248,255,0.45)',
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {s}
                  </button>
                )
              })}
            </div>

            {/* clear filters */}
            {hasFilters && (
              <button
                onClick={() => { setDateFilter(''); setSpecies('All') }}
                style={{
                  flexShrink: 0,
                  padding: '7px 13px',
                  borderRadius: '99px',
                  border: '1px solid rgba(240,248,255,0.1)',
                  background: 'transparent',
                  color: 'rgba(240,248,255,0.3)',
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: '0.78rem',
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                  display: 'flex', alignItems: 'center', gap: '4px',
                }}
                onMouseEnter={e => { e.currentTarget.style.color = '#F0F8FF' }}
                onMouseLeave={e => { e.currentTarget.style.color = 'rgba(240,248,255,0.3)' }}
              >
                <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                  <path d="M1 1l9 9M10 1L1 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                Clear
              </button>
            )}
          </div>
        </div>

        {/* ── catch list ──────────────────────────────────────────────────── */}
        <div style={{ flex: 1, padding: '0 24px', overflowY: 'auto' }}>

          {/* result count */}
          <div style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: '0.75rem',
            color: 'rgba(240,248,255,0.25)',
            fontWeight: 600,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            marginBottom: '12px',
          }}>
            {filtered.length} {filtered.length === 1 ? 'catch' : 'catches'}
            {hasFilters ? ' matching' : ' total'}
          </div>

          {filtered.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '48px 20px',
              color: 'rgba(240,248,255,0.2)',
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '0.9rem',
            }}>
              No catches match the current filters.
            </div>
          ) : (
            filtered.map((c, i) => {
              const meta = SPECIES_META[c.species]
              const confirming = confirmDeleteId === c.id
              return (
                <div
                  key={c.id}
                  className={`animate-fade-up delay-${Math.min(i + 1, 6)}`}
                  style={{
                    padding: '13px 16px',
                    marginBottom: '8px',
                    background: confirming ? 'rgba(239,68,68,0.06)' : 'rgba(240,248,255,0.03)',
                    border: `1.5px solid ${confirming ? 'rgba(239,68,68,0.25)' : 'rgba(240,248,255,0.07)'}`,
                    borderRadius: '14px',
                    transition: 'background 0.15s, border-color 0.15s',
                  }}
                  onMouseEnter={e => { if (!confirming) e.currentTarget.style.background = 'rgba(240,248,255,0.055)' }}
                  onMouseLeave={e => { if (!confirming) e.currentTarget.style.background = 'rgba(240,248,255,0.03)' }}
                >
                  {/* main row */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>

                    {/* date */}
                    <div style={{
                      flexShrink: 0,
                      minWidth: '100px',
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: '0.73rem',
                      color: 'rgba(240,248,255,0.35)',
                      fontWeight: 400,
                      lineHeight: 1.4,
                    }}>
                      {fmtDate(c.date)}
                    </div>

                    {/* fish image */}
                    <div style={{
                      flexShrink: 0, width: '48px', height: '34px',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {meta && (
                        <img
                          src={meta.img}
                          alt={c.species}
                          style={{
                            width: '48px', height: '34px',
                            objectFit: 'contain',
                            mixBlendMode: 'lighten',
                            transform: `scale(${meta.scale})`,
                          }}
                        />
                      )}
                    </div>

                    {/* name + species */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontFamily: "'DM Sans', sans-serif",
                        fontSize: '0.9rem',
                        fontWeight: 700,
                        color: '#F0F8FF',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}>
                        {c.name}
                      </div>
                      <div style={{
                        fontFamily: "'DM Sans', sans-serif",
                        fontSize: '0.75rem',
                        color: 'rgba(240,248,255,0.35)',
                        marginTop: '1px',
                      }}>
                        {c.species}
                      </div>
                    </div>

                    {/* length */}
                    <div style={{ flexShrink: 0, textAlign: 'right' }}>
                      <span style={{
                        fontFamily: "'Unbounded', sans-serif",
                        fontSize: '1.15rem',
                        fontWeight: 800,
                        color: '#00E5C5',
                      }}>
                        {c.length}
                      </span>
                      <span style={{
                        fontFamily: "'DM Sans', sans-serif",
                        fontSize: '0.7rem',
                        color: 'rgba(240,248,255,0.3)',
                        fontWeight: 600,
                        marginLeft: '3px',
                      }}>
                        cm
                      </span>
                    </div>

                    {/* trash button */}
                    <button
                      onClick={() => setConfirmDeleteId(confirming ? null : c.id)}
                      title="Delete catch"
                      style={{
                        flexShrink: 0,
                        width: '32px',
                        height: '32px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: confirming ? 'rgba(239,68,68,0.15)' : 'transparent',
                        border: `1px solid ${confirming ? 'rgba(239,68,68,0.3)' : 'transparent'}`,
                        borderRadius: '8px',
                        cursor: 'pointer',
                        color: confirming ? 'rgba(239,68,68,0.9)' : 'rgba(240,248,255,0.2)',
                        transition: 'all 0.15s',
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.color = 'rgba(239,68,68,0.8)'
                        e.currentTarget.style.background = 'rgba(239,68,68,0.1)'
                        e.currentTarget.style.borderColor = 'rgba(239,68,68,0.25)'
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.color = confirming ? 'rgba(239,68,68,0.9)' : 'rgba(240,248,255,0.2)'
                        e.currentTarget.style.background = confirming ? 'rgba(239,68,68,0.15)' : 'transparent'
                        e.currentTarget.style.borderColor = confirming ? 'rgba(239,68,68,0.3)' : 'transparent'
                      }}
                    >
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <path d="M1.5 3.5h11M5.5 3.5V2.5a.5.5 0 01.5-.5h2a.5.5 0 01.5.5v1M3 3.5l.7 7.5a1 1 0 001 .9h4.6a1 1 0 001-.9L11 3.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                  </div>

                  {/* inline confirmation strip */}
                  {confirming && (
                    <div style={{
                      marginTop: '12px',
                      paddingTop: '12px',
                      borderTop: '1px solid rgba(239,68,68,0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '10px',
                    }}>
                      <span style={{
                        fontFamily: "'DM Sans', sans-serif",
                        fontSize: '0.82rem',
                        fontWeight: 500,
                        color: 'rgba(240,248,255,0.55)',
                        flex: 1,
                      }}>
                        Delete this catch?
                      </span>
                      <button
                        onClick={() => setConfirmDeleteId(null)}
                        style={{
                          padding: '6px 14px',
                          borderRadius: '99px',
                          border: '1px solid rgba(240,248,255,0.15)',
                          background: 'transparent',
                          color: 'rgba(240,248,255,0.4)',
                          fontFamily: "'DM Sans', sans-serif",
                          fontSize: '0.8rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          transition: 'all 0.15s',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.color = '#F0F8FF' }}
                        onMouseLeave={e => { e.currentTarget.style.color = 'rgba(240,248,255,0.4)' }}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => deleteCatch(c.id)}
                        style={{
                          padding: '6px 14px',
                          borderRadius: '99px',
                          border: 'none',
                          background: 'rgba(239,68,68,0.85)',
                          color: '#fff',
                          fontFamily: "'DM Sans', sans-serif",
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          transition: 'background 0.15s',
                          boxShadow: '0 0 12px rgba(239,68,68,0.25)',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,1)' }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.85)' }}
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>

        {/* ── clear today's catches ────────────────────────────────────────── */}
        <div style={{ padding: '20px 24px 0' }}>
          {!confirmClear ? (
            <button
              onClick={() => setConfirmClear(true)}
              disabled={todayCatches.length === 0}
              style={{
                width: '100%',
                padding: '13px 24px',
                borderRadius: '99px',
                border: `1.5px solid ${todayCatches.length === 0 ? 'rgba(240,248,255,0.06)' : 'rgba(239,68,68,0.3)'}`,
                background: 'transparent',
                color: todayCatches.length === 0 ? 'rgba(240,248,255,0.15)' : 'rgba(239,68,68,0.7)',
                fontFamily: "'DM Sans', sans-serif",
                fontSize: '0.9rem',
                fontWeight: 600,
                cursor: todayCatches.length === 0 ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => { if (todayCatches.length > 0) { e.currentTarget.style.background = 'rgba(239,68,68,0.08)'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.5)' } }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = todayCatches.length === 0 ? 'rgba(240,248,255,0.06)' : 'rgba(239,68,68,0.3)' }}
            >
              Clear today's catches ({todayCatches.length})
            </button>
          ) : (
            <div style={{
              background: 'rgba(239,68,68,0.07)',
              border: '1.5px solid rgba(239,68,68,0.25)',
              borderRadius: '16px',
              padding: '16px 20px',
            }}>
              <p style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: '0.88rem',
                color: 'rgba(240,248,255,0.7)',
                margin: '0 0 14px',
                fontWeight: 500,
                textAlign: 'center',
              }}>
                Delete all {todayCatches.length} catch{todayCatches.length !== 1 ? 'es' : ''} from today? This cannot be undone.
              </p>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={() => setConfirmClear(false)}
                  style={{
                    flex: 1,
                    padding: '11px',
                    borderRadius: '99px',
                    border: '1.5px solid rgba(240,248,255,0.15)',
                    background: 'transparent',
                    color: 'rgba(240,248,255,0.5)',
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: '0.88rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={clearToday}
                  style={{
                    flex: 1,
                    padding: '11px',
                    borderRadius: '99px',
                    border: 'none',
                    background: 'rgba(239,68,68,0.85)',
                    color: '#fff',
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: '0.88rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                    boxShadow: '0 0 20px rgba(239,68,68,0.3)',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,1)' }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.85)' }}
                >
                  Yes, clear all
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Shell>
  )
}

// ─── root ─────────────────────────────────────────────────────────────────────

export default function AdminApp() {
  const [authed, setAuthed] = useState(() => sessionStorage.getItem('hooked_admin') === '1')

  if (!authed) {
    return <PinScreen onAuth={() => setAuthed(true)} />
  }
  return (
    <AdminDashboard onLogout={() => {
      sessionStorage.removeItem('hooked_admin')
      setAuthed(false)
    }} />
  )
}
