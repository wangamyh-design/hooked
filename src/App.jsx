import { useState, useCallback, useRef, useEffect } from 'react'

// ─── constants ────────────────────────────────────────────────────────────────

const IMG_V = Date.now()
const SPECIES = [
  { name: 'Snapper',   img: `/snapper.png?v=${IMG_V}`,   scale: 1,    hue: 'rgba(239,68,68,0.15)',   border: 'rgba(239,68,68,0.3)' },
  { name: 'Kingfish',  img: `/kingfish.png?v=${IMG_V}`,  scale: 1,    hue: 'rgba(234,179,8,0.15)',   border: 'rgba(234,179,8,0.3)' },
  { name: 'Kahawai',   img: `/kahawai.png?v=${IMG_V}`,   scale: 1,    hue: 'rgba(59,130,246,0.15)',  border: 'rgba(59,130,246,0.3)' },
  { name: 'Trevally',  img: `/trevally.png?v=${IMG_V}`,  scale: 1,    hue: 'rgba(34,197,94,0.15)',   border: 'rgba(34,197,94,0.3)' },
  { name: 'Gurnard',   img: `/gurnard.png?v=${IMG_V}`,   scale: 1,    hue: 'rgba(168,85,247,0.15)', border: 'rgba(168,85,247,0.3)' },
  { name: 'John Dory', img: `/john-dory.png?v=${IMG_V}`, scale: 1.45, hue: 'rgba(249,115,22,0.15)', border: 'rgba(249,115,22,0.3)' },
]

// ─── localStorage hook ────────────────────────────────────────────────────────

function useLocalStorage(key, initial) {
  const [value, setValue] = useState(() => {
    try {
      const stored = localStorage.getItem(key)
      return stored !== null ? JSON.parse(stored) : initial
    } catch {
      return initial
    }
  })

  const set = useCallback((next) => {
    setValue(prev => {
      const resolved = typeof next === 'function' ? next(prev) : next
      try { localStorage.setItem(key, JSON.stringify(resolved)) } catch {}
      return resolved
    })
  }, [key])

  return [value, set]
}

// ─── shared UI ────────────────────────────────────────────────────────────────

function ScreenShell({ children }) {
  return (
    <div
      style={{
        minHeight: '100dvh',
        background: 'linear-gradient(160deg, #0B2A3B 0%, #071e2b 60%, #040f15 100%)',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* ambient glow */}
      <div style={{
        position: 'absolute', top: '-20%', left: '-20%',
        width: '70%', height: '60%',
        background: 'radial-gradient(ellipse, rgba(0,229,197,0.07) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: '-10%', right: '-15%',
        width: '60%', height: '50%',
        background: 'radial-gradient(ellipse, rgba(255,184,0,0.05) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      {children}
    </div>
  )
}

function ProgressBar({ step, total = 4 }) {
  return (
    <div style={{ display: 'flex', gap: '8px', padding: '0 24px' }}>
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} style={{
          flex: 1, height: '4px', borderRadius: '99px',
          background: i < step ? '#00E5C5' : 'rgba(240,248,255,0.2)',
          transition: 'background 0.4s ease',
        }} />
      ))}
    </div>
  )
}

function BackButton({ onClick }) {
  return (
    <button onClick={onClick} style={{
      background: 'transparent',
      border: '1px solid rgba(240,248,255,0.12)',
      borderRadius: '99px',
      color: 'rgba(240,248,255,0.5)',
      fontFamily: "'DM Sans', sans-serif",
      fontSize: '0.8rem',
      fontWeight: 500,
      padding: '6px 14px 6px 10px',
      cursor: 'pointer',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '4px',
      transition: 'all 0.2s',
    }}
    onMouseEnter={e => { e.currentTarget.style.color = '#F0F8FF'; e.currentTarget.style.borderColor = 'rgba(240,248,255,0.25)' }}
    onMouseLeave={e => { e.currentTarget.style.color = 'rgba(240,248,255,0.5)'; e.currentTarget.style.borderColor = 'rgba(240,248,255,0.12)' }}
    >
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <path d="M9 11L5 7l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
      Back
    </button>
  )
}

function PrimaryBtn({ children, onClick, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        width: '100%',
        padding: '15px 24px',
        borderRadius: '99px',
        border: 'none',
        background: disabled
          ? 'rgba(240,248,255,0.08)'
          : 'linear-gradient(135deg, #00E5C5 0%, #00c8ac 100%)',
        color: disabled ? 'rgba(240,248,255,0.25)' : '#0B2A3B',
        fontFamily: "'DM Sans', sans-serif",
        fontSize: '1rem',
        fontWeight: 700,
        cursor: disabled ? 'not-allowed' : 'pointer',
        letterSpacing: '0.02em',
        boxShadow: disabled ? 'none' : '0 0 28px rgba(0,229,197,0.35)',
        transition: 'all 0.2s ease',
      }}
      onMouseEnter={e => { if (!disabled) { e.currentTarget.style.boxShadow = '0 0 40px rgba(0,229,197,0.5)'; e.currentTarget.style.transform = 'translateY(-1px)' } }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = disabled ? 'none' : '0 0 28px rgba(0,229,197,0.35)'; e.currentTarget.style.transform = 'translateY(0)' }}
    >
      {children}
    </button>
  )
}

// ─── Splash ───────────────────────────────────────────────────────────────────

function SplashScreen({ onDone }) {
  const [fadingOut, setFadingOut] = useState(false)

  useEffect(() => {
    const fadeTimer = setTimeout(() => setFadingOut(true), 4500)
    const doneTimer = setTimeout(() => onDone(), 5000)
    return () => { clearTimeout(fadeTimer); clearTimeout(doneTimer) }
  }, [onDone])

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100,
      background: '#0B2A3B',
      overflow: 'hidden',
      opacity: fadingOut ? 0 : 1,
      transition: 'opacity 0.5s ease-in-out',
      pointerEvents: fadingOut ? 'none' : 'auto',
    }}>

      {/* ambient glow — top-left teal */}
      <div style={{
        position: 'absolute', top: '-20%', left: '-20%',
        width: '70%', height: '60%',
        background: 'radial-gradient(ellipse, rgba(0,229,197,0.07) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      {/* ambient glow — bottom-right gold */}
      <div style={{
        position: 'absolute', bottom: '-10%', right: '-15%',
        width: '60%', height: '50%',
        background: 'radial-gradient(ellipse, rgba(255,184,0,0.04) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* ── Phase 1: hook descends from top center (0–1.5s) ── */}
      {/* top: calc(36vh - 68px) places the hook barb (bottom of 68px SVG) at 36vh */}
      <div style={{
        position: 'absolute',
        top: 'calc(36vh - 68px)',
        left: 0, right: 0,
        display: 'flex', justifyContent: 'center',
        animation: 'hookDescend 1.5s ease-in-out both',
      }}>
        <svg width="40" height="68" viewBox="0 0 40 68" fill="none">
          {/* Eye ring — centred at x=20 */}
          <circle cx="20" cy="7" r="6" stroke="#00E5C5" strokeWidth="2.2"/>
          {/* Shank → J-bend → barb tip returns to x=20 so it meets the fish centre */}
          <path d="M20,13 L20,47 C20,62 37,62 37,47 C37,38 31,34 20,34"
            stroke="#00E5C5" strokeWidth="2.2" strokeLinecap="round"/>
        </svg>
      </div>

      {/* ── Phase 2: fish swims up from bottom with gentle wiggle (delay 1.5s) ── */}
      {/* base top: 72vh, fishRise ends at translateY(-36vh) → visual position: 36vh */}
      <div style={{
        position: 'absolute',
        top: '72vh',
        left: 0, right: 0,
        display: 'flex', justifyContent: 'center',
        animation: 'fishRise 1s ease-in-out 1.5s both',
      }}>
        <div style={{ fontSize: '2.5rem', lineHeight: 1, transform: 'rotate(90deg)' }}>
          🐟
        </div>
      </div>

      {/* ── Phase 3: HOOKED wordmark + subtitle (delay 2.5s) ── */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        textAlign: 'center',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center',
        gap: '12px',
      }}>
        <div style={{
          fontFamily: "'Unbounded', sans-serif",
          fontSize: 'clamp(2.5rem, 10vw, 3.5rem)',
          fontWeight: 900,
          letterSpacing: '-0.02em',
          lineHeight: 1,
          background: 'linear-gradient(135deg, #F0F8FF 30%, #00E5C5 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          animation: 'splashContentIn 0.5s ease-in-out 2.5s both',
        }}>
          HOOKED
        </div>
        <p style={{
          color: 'rgba(240,248,255,0.45)',
          fontSize: '0.9rem',
          fontWeight: 400,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          margin: 0,
          animation: 'splashContentIn 0.5s ease-in-out 2.7s both',
        }}>
          Charter Catch Tracker
        </p>
      </div>

    </div>
  )
}

// ─── Screen 0: Name ───────────────────────────────────────────────────────────

function NameScreen({ name, setName, onNext }) {
  return (
    <ScreenShell>
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        maxWidth: '420px', margin: '0 auto', width: '100%',
      }}>

        {/* progress bar — Figma: top 49px, left 6px with 24px inner padding */}
        <div className="animate-fade-up" style={{ paddingTop: '49px', paddingLeft: '6px', paddingRight: '6px' }}>
          <ProgressBar step={1} />
        </div>

        {/* heading + input — Figma: top 198px, left 30px, gap 39px */}
        <div className="animate-fade-up delay-2" style={{
          display: 'flex', flexDirection: 'column', gap: '39px',
          paddingTop: '100px', paddingLeft: '30px', paddingRight: '30px',
        }}>
          <h1 style={{
            fontFamily: "'Unbounded', sans-serif",
            fontSize: '32px',
            fontWeight: 800,
            color: '#FFFFFF',
            margin: 0,
            lineHeight: 1,
          }}>
            Every legend needs a name
          </h1>

          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && name.trim() && onNext()}
            placeholder="Enter your name to get started"
            autoFocus
            style={{
              width: '100%',
              padding: '12px',
              background: 'rgba(240,248,255,0.05)',
              border: '1.5px solid #00E5C5',
              borderRadius: '12px',
              color: '#F0F8FF',
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '16px',
              fontWeight: 400,
              outline: 'none',
              transition: 'all 0.2s',
              boxSizing: 'border-box',
            }}
            onFocus={e => {
              e.target.style.background = 'rgba(0,229,197,0.06)'
              e.target.style.boxShadow = '0 0 0 4px rgba(0,229,197,0.1)'
            }}
            onBlur={e => {
              e.target.style.background = 'rgba(240,248,255,0.05)'
              e.target.style.boxShadow = 'none'
            }}
          />
        </div>

        {/* flex spacer pushes button to bottom */}
        <div style={{ flex: 1 }} />

        {/* bottom actions — Figma: button top 700px, "Back to home" top ~796px in 874px frame */}
        <div className="animate-fade-up delay-3" style={{
          padding: '0 30px 40px',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px',
        }}>
          <button
            onClick={onNext}
            disabled={!name.trim()}
            style={{
              width: '100%',
              padding: '16px 24px',
              borderRadius: '12px',
              border: 'none',
              background: !name.trim()
                ? 'rgba(240,248,255,0.08)'
                : 'linear-gradient(135deg, #00E5C5 0%, #00c8ac 100%)',
              color: !name.trim() ? 'rgba(240,248,255,0.25)' : '#0B2A3B',
              fontFamily: "'Inter', sans-serif",
              fontSize: '18px',
              fontWeight: 600,
              cursor: !name.trim() ? 'not-allowed' : 'pointer',
              letterSpacing: '0.02em',
              boxShadow: !name.trim() ? 'none' : '0 0 28px rgba(0,229,197,0.35)',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={e => { if (name.trim()) { e.currentTarget.style.boxShadow = '0 0 40px rgba(0,229,197,0.5)'; e.currentTarget.style.transform = 'translateY(-1px)' } }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = !name.trim() ? 'none' : '0 0 28px rgba(0,229,197,0.35)'; e.currentTarget.style.transform = 'translateY(0)' }}
          >
            Continue →
          </button>

          <p style={{
            margin: 0,
            color: '#FFFFFF',
            fontFamily: "'DM Sans', sans-serif",
            fontSize: '16px',
            fontWeight: 500,
            textAlign: 'center',
          }}>
            Back to home
          </p>
        </div>
      </div>
    </ScreenShell>
  )
}

// ─── Screen 1: Species ────────────────────────────────────────────────────────

function SpeciesScreen({ name, species, setSpecies, onNext, onBack }) {
  return (
    <ScreenShell>
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        maxWidth: '420px', margin: '0 auto', width: '100%',
      }}>

        {/* progress bar — consistent with all screens: paddingTop 49px */}
        <div className="animate-fade-up" style={{ paddingTop: '49px', paddingLeft: '6px', paddingRight: '6px' }}>
          <ProgressBar step={2} />
        </div>

        {/* heading */}
        <div className="animate-fade-up delay-1" style={{ padding: '28px 24px 20px' }}>
          <p style={{ color: 'rgba(240,248,255,0.45)', fontSize: '0.85rem', margin: '0 0 6px', fontWeight: 500 }}>
            Hey {name} 👋
          </p>
          <h2 style={{
            fontFamily: "'Unbounded', sans-serif",
            fontSize: 'clamp(1.5rem, 5vw, 1.8rem)',
            fontWeight: 700,
            color: '#F0F8FF',
            lineHeight: 1.3,
            margin: 0,
          }}>
            What did you<br />
            <span style={{ color: '#00E5C5' }}>catch?</span>
          </h2>
        </div>

        {/* species grid — flex: 1 fills remaining space */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '12px',
          flex: 1,
          padding: '0 20px',
        }}>
          {SPECIES.map((s, i) => {
            const selected = species === s.name
            return (
              <button
                key={s.name}
                className={`animate-fade-up delay-${i + 1}`}
                onClick={() => setSpecies(s.name)}
                style={{
                  background: selected ? s.hue : 'rgba(240,248,255,0.03)',
                  border: `1.5px solid ${selected ? s.border : 'rgba(240,248,255,0.08)'}`,
                  borderRadius: '16px',
                  padding: '20px 12px',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '10px',
                  transition: 'all 0.2s ease',
                  position: 'relative',
                  overflow: 'hidden',
                  boxShadow: selected ? `0 0 20px ${s.hue}` : 'none',
                }}
                onMouseEnter={e => {
                  if (!selected) {
                    e.currentTarget.style.background = 'rgba(240,248,255,0.06)'
                    e.currentTarget.style.borderColor = 'rgba(240,248,255,0.18)'
                  }
                }}
                onMouseLeave={e => {
                  if (!selected) {
                    e.currentTarget.style.background = 'rgba(240,248,255,0.03)'
                    e.currentTarget.style.borderColor = 'rgba(240,248,255,0.08)'
                  }
                }}
              >
                {selected && (
                  <div style={{
                    position: 'absolute', top: '8px', right: '8px',
                    width: '18px', height: '18px',
                    background: '#00E5C5', borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <path d="M2 5l2.5 2.5L8 3" stroke="#0B2A3B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                )}
                <div style={{
                  flex: 1,
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: '80px',
                }}>
                  <img
                    src={s.img}
                    alt={s.name}
                    style={{
                      width: '100%',
                      height: '90px',
                      objectFit: 'contain',
                      objectPosition: 'center',
                      mixBlendMode: 'lighten',
                      transform: `scale(${s.scale})`,
                      filter: selected ? 'drop-shadow(0 0 8px rgba(255,255,255,0.25))' : 'none',
                      transition: 'filter 0.2s',
                    }}
                  />
                </div>
                <span style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  color: selected ? '#F0F8FF' : 'rgba(240,248,255,0.6)',
                  letterSpacing: '0.01em',
                  textAlign: 'center',
                }}>
                  {s.name}
                </span>
              </button>
            )
          })}
        </div>

        {/* bottom actions — consistent with all screens */}
        <div className="animate-fade-up delay-6" style={{
          padding: '16px 24px 40px',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px',
        }}>
          <button
            onClick={onNext}
            disabled={!species}
            style={{
              width: '100%',
              padding: '16px 24px',
              borderRadius: '12px',
              border: 'none',
              background: !species
                ? 'rgba(240,248,255,0.08)'
                : 'linear-gradient(135deg, #00E5C5 0%, #00c8ac 100%)',
              color: !species ? 'rgba(240,248,255,0.25)' : '#0B2A3B',
              fontFamily: "'Inter', sans-serif",
              fontSize: '18px',
              fontWeight: 600,
              cursor: !species ? 'not-allowed' : 'pointer',
              letterSpacing: '0.02em',
              boxShadow: !species ? 'none' : '0 0 28px rgba(0,229,197,0.35)',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={e => { if (species) { e.currentTarget.style.boxShadow = '0 0 40px rgba(0,229,197,0.5)'; e.currentTarget.style.transform = 'translateY(-1px)' } }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = !species ? 'none' : '0 0 28px rgba(0,229,197,0.35)'; e.currentTarget.style.transform = 'translateY(0)' }}
          >
            Continue →
          </button>
          <button
            onClick={onBack}
            style={{
              background: 'none', border: 'none',
              color: '#FFFFFF',
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '16px', fontWeight: 500,
              cursor: 'pointer', padding: '4px 0',
            }}
          >
            Back
          </button>
        </div>
      </div>
    </ScreenShell>
  )
}

// ─── Screen 2: Length ─────────────────────────────────────────────────────────

function LengthScreen({ species, length, setLength, onNext, onBack }) {
  const num = parseFloat(length)
  const valid = !isNaN(num) && num > 0 && num < 300

  const handleDigit = (d) => {
    setLength(prev => {
      if (prev === '' && d === '0') return prev  // no leading zero
      const next = prev + d
      if (Number(next) >= 300) return prev        // cap at 299
      return next
    })
  }

  const handleBackspace = () => setLength(prev => prev.slice(0, -1))

  // 3×3 digits then bottom row: empty / 0 / ←
  const padRows = [
    ['1','2','3'],
    ['4','5','6'],
    ['7','8','9'],
    [null,'0','←'],
  ]

  return (
    <ScreenShell>
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        maxWidth: '420px', margin: '0 auto', width: '100%',
      }}>

        {/* progress bar — Figma: top 49px, 3 active segments */}
        <div className="animate-fade-up" style={{ paddingTop: '49px', paddingLeft: '6px', paddingRight: '6px' }}>
          <ProgressBar step={3} />
        </div>

        {/* heading + subtitle — Figma: heading top 116px, subtitle top 169px */}
        <div className="animate-fade-up delay-1" style={{ paddingTop: '63px', paddingLeft: '25px', paddingRight: '25px' }}>
          <h1 style={{
            fontFamily: "'Unbounded', sans-serif",
            fontSize: '32px',
            fontWeight: 800,
            color: '#FFFFFF',
            margin: '0 0 21px',
            lineHeight: 1,
          }}>
            How long was your catch?
          </h1>
          <p style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: '18px',
            fontWeight: 500,
            color: '#D9D9D9',
            margin: 0,
          }}>
            Measure tip to tail in cm
          </p>
        </div>

        {/* large display — Figma: top 240px, number 64px teal, "cm" 20px 60% white */}
        <div className="animate-fade-up delay-2" style={{
          paddingTop: '48px',
          display: 'flex',
          alignItems: 'baseline',
          justifyContent: 'center',
          gap: '8px',
        }}>
          <span style={{
            fontFamily: "'Unbounded', sans-serif",
            fontSize: '64px',
            fontWeight: 800,
            color: '#00E5C5',
            lineHeight: 1,
          }}>
            {length || '0'}
          </span>
          <span style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: '20px',
            fontWeight: 400,
            color: 'rgba(240,248,255,0.6)',
          }}>
            cm
          </span>
        </div>

        {/* number pad — 300px wide, 16px gaps, 64px tall buttons */}
        <div className="animate-fade-up delay-3" style={{ padding: '40px 60px 32px' }}>
          {padRows.map((row, ri) => (
            <div key={ri} style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '16px',
              marginBottom: ri < padRows.length - 1 ? '16px' : 0,
            }}>
              {row.map((key, ci) => {
                if (key === null) return <div key={ci} />
                const isBackspace = key === '←'
                return (
                  <button
                    key={ci}
                    onClick={() => isBackspace ? handleBackspace() : handleDigit(key)}
                    style={{
                      height: '64px',
                      borderRadius: '16px',
                      border: '2px solid rgba(240,248,255,0.2)',
                      background: 'rgba(240,248,255,0.05)',
                      color: '#FFFFFF',
                      fontFamily: isBackspace ? "'DM Sans', sans-serif" : "'Unbounded', sans-serif",
                      fontSize: isBackspace ? '18px' : '24px',
                      fontWeight: isBackspace ? 500 : 800,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.1s ease',
                      userSelect: 'none',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = 'rgba(240,248,255,0.1)'
                      e.currentTarget.style.borderColor = 'rgba(240,248,255,0.35)'
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = 'rgba(240,248,255,0.05)'
                      e.currentTarget.style.borderColor = 'rgba(240,248,255,0.2)'
                    }}
                    onMouseDown={e => {
                      e.currentTarget.style.background = 'rgba(0,229,197,0.12)'
                      e.currentTarget.style.borderColor = 'rgba(0,229,197,0.3)'
                      e.currentTarget.style.transform = 'scale(0.95)'
                    }}
                    onMouseUp={e => {
                      e.currentTarget.style.background = 'rgba(240,248,255,0.1)'
                      e.currentTarget.style.borderColor = 'rgba(240,248,255,0.35)'
                      e.currentTarget.style.transform = 'scale(1)'
                    }}
                  >
                    {key}
                  </button>
                )
              })}
            </div>
          ))}
        </div>

        <div style={{ flex: 1 }} />

        {/* bottom actions — Figma: Continue top 759px, Back top ~838px in 874px frame */}
        <div className="animate-fade-up delay-4" style={{
          padding: '0 30px 40px',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px',
        }}>
          <button
            onClick={onNext}
            disabled={!valid}
            style={{
              width: '100%',
              padding: '16px 24px',
              borderRadius: '12px',
              border: 'none',
              background: !valid
                ? 'rgba(240,248,255,0.08)'
                : 'linear-gradient(135deg, #00E5C5 0%, #00c8ac 100%)',
              color: !valid ? 'rgba(240,248,255,0.25)' : '#0B2A3B',
              fontFamily: "'Inter', sans-serif",
              fontSize: '18px',
              fontWeight: 600,
              cursor: !valid ? 'not-allowed' : 'pointer',
              letterSpacing: '0.02em',
              boxShadow: !valid ? 'none' : '0 0 28px rgba(0,229,197,0.35)',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={e => { if (valid) { e.currentTarget.style.boxShadow = '0 0 40px rgba(0,229,197,0.5)'; e.currentTarget.style.transform = 'translateY(-1px)' } }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = !valid ? 'none' : '0 0 28px rgba(0,229,197,0.35)'; e.currentTarget.style.transform = 'translateY(0)' }}
          >
            Continue →
          </button>

          <button
            onClick={onBack}
            style={{
              background: 'none',
              border: 'none',
              color: '#FFFFFF',
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '16px',
              fontWeight: 500,
              cursor: 'pointer',
              padding: '4px 0',
            }}
          >
            Back
          </button>
        </div>
      </div>
    </ScreenShell>
  )
}

// ─── Screen 3: Photo ──────────────────────────────────────────────────────────

function PhotoScreen({ species, length, photo, setPhoto, onSubmit, onBack }) {
  const fileRef = useRef(null)

  const handleFile = (file) => {
    if (!file || !file.type.startsWith('image/')) return
    const reader = new FileReader()
    reader.onload = e => setPhoto(e.target.result)
    reader.readAsDataURL(file)
  }

  const onDrop = (e) => {
    e.preventDefault()
    handleFile(e.dataTransfer.files[0])
  }

  return (
    <ScreenShell>
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        maxWidth: '420px', margin: '0 auto', width: '100%',
      }}>

        {/* progress bar — consistent with all screens: paddingTop 49px */}
        <div className="animate-fade-up" style={{ paddingTop: '49px', paddingLeft: '6px', paddingRight: '6px' }}>
          <ProgressBar step={4} />
        </div>

        <div className="animate-fade-up delay-1" style={{ padding: '28px 24px 20px' }}>
          <p style={{ color: 'rgba(240,248,255,0.45)', fontSize: '0.85rem', margin: '0 0 6px', fontWeight: 500 }}>
            {length}cm {species}
          </p>
          <h2 style={{
            fontFamily: "'Unbounded', sans-serif",
            fontSize: 'clamp(1.5rem, 5vw, 1.8rem)',
            fontWeight: 700,
            color: '#F0F8FF',
            lineHeight: 1.3,
            margin: 0,
          }}>
            Show us your<br />
            <span style={{ color: '#FFB800' }}>catch!</span>
          </h2>
        </div>

        {/* upload zone — horizontal padding matches other screens */}
        <div style={{ flex: 1, padding: '0 24px', minHeight: 0 }}>
          <div
            className="animate-fade-up delay-2"
            onClick={() => !photo && fileRef.current?.click()}
            onDrop={onDrop}
            onDragOver={e => e.preventDefault()}
            style={{
              height: '100%',
              minHeight: '220px',
              border: `2px dashed ${photo ? 'transparent' : 'rgba(240,248,255,0.15)'}`,
              borderRadius: '20px',
              overflow: 'hidden',
              cursor: photo ? 'default' : 'pointer',
              position: 'relative',
              background: photo ? 'transparent' : 'rgba(240,248,255,0.03)',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onMouseEnter={e => { if (!photo) { e.currentTarget.style.borderColor = 'rgba(255,184,0,0.4)'; e.currentTarget.style.background = 'rgba(255,184,0,0.04)' } }}
            onMouseLeave={e => { if (!photo) { e.currentTarget.style.borderColor = 'rgba(240,248,255,0.15)'; e.currentTarget.style.background = 'rgba(240,248,255,0.03)' } }}
          >
            {photo ? (
              <img
                src={photo}
                alt="Your catch"
                style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '18px' }}
              />
            ) : (
              <div style={{ textAlign: 'center', padding: '32px 20px' }}>
                <div style={{ fontSize: '3rem', marginBottom: '14px', lineHeight: 1 }}>📷</div>
                <p style={{
                  fontFamily: "'DM Sans', sans-serif",
                  color: '#F0F8FF', fontSize: '1rem', fontWeight: 600, margin: '0 0 6px',
                }}>
                  Tap to add a photo
                </p>
                <p style={{ color: 'rgba(240,248,255,0.35)', fontSize: '0.8rem', margin: 0 }}>
                  Camera or gallery • Optional
                </p>
              </div>
            )}
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={e => handleFile(e.target.files[0])}
              style={{ display: 'none' }}
            />
          </div>
        </div>

        {/* bottom actions — consistent with all screens */}
        <div className="animate-fade-up delay-3" style={{
          padding: '16px 24px 40px',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px',
        }}>
          {photo ? (
            <>
              <button
                onClick={onSubmit}
                style={{
                  width: '100%', padding: '16px 24px', borderRadius: '12px', border: 'none',
                  background: 'linear-gradient(135deg, #00E5C5 0%, #00c8ac 100%)',
                  color: '#0B2A3B', fontFamily: "'Inter', sans-serif", fontSize: '18px',
                  fontWeight: 600, cursor: 'pointer', letterSpacing: '0.02em',
                  boxShadow: '0 0 28px rgba(0,229,197,0.35)', transition: 'all 0.2s ease',
                }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 0 40px rgba(0,229,197,0.5)'; e.currentTarget.style.transform = 'translateY(-1px)' }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 0 28px rgba(0,229,197,0.35)'; e.currentTarget.style.transform = 'translateY(0)' }}
              >
                Continue →
              </button>
              <button
                onClick={() => fileRef.current?.click()}
                style={{
                  background: 'none', border: 'none', color: 'rgba(240,248,255,0.4)',
                  fontFamily: "'DM Sans', sans-serif", fontSize: '0.85rem', fontWeight: 500,
                  cursor: 'pointer', padding: '4px 0', textAlign: 'center',
                }}
                onMouseEnter={e => { e.currentTarget.style.color = 'rgba(240,248,255,0.7)' }}
                onMouseLeave={e => { e.currentTarget.style.color = 'rgba(240,248,255,0.4)' }}
              >
                Retake photo
              </button>
            </>
          ) : (
            <>
              <button
                onClick={onSubmit}
                style={{
                  width: '100%', padding: '16px 24px', borderRadius: '12px', border: 'none',
                  background: 'linear-gradient(135deg, #00E5C5 0%, #00c8ac 100%)', color: '#0B2A3B',
                  fontFamily: "'Inter', sans-serif", fontSize: '18px', fontWeight: 600,
                  cursor: 'pointer', letterSpacing: '0.02em',
                  boxShadow: '0 0 28px rgba(0,229,197,0.35)', transition: 'all 0.2s ease',
                }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 0 40px rgba(0,229,197,0.5)'; e.currentTarget.style.transform = 'translateY(-1px)' }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 0 28px rgba(0,229,197,0.35)'; e.currentTarget.style.transform = 'translateY(0)' }}
              >
                Skip &amp; Log Catch
              </button>
              <button
                onClick={onBack}
                style={{
                  background: 'none', border: 'none', color: '#FFFFFF',
                  fontFamily: "'DM Sans', sans-serif", fontSize: '16px', fontWeight: 500,
                  cursor: 'pointer', padding: '4px 0',
                }}
              >
                Back
              </button>
            </>
          )}
        </div>
      </div>
    </ScreenShell>
  )
}

// ─── Screen 4: Catch Card ─────────────────────────────────────────────────────

function CatchCardScreen({ catchData, onAnother, onLeaderboard, onUndo }) {
  const { name, species, length } = catchData ?? {}
  const speciesInfo = SPECIES.find(s => s.name === species)
  const [confirmUndo, setConfirmUndo] = useState(false)
  const today = new Date().toLocaleDateString('en-NZ', { day: 'numeric', month: 'long', year: 'numeric' }).toUpperCase()

  const { rank, tied } = (() => {
    try {
      const all = JSON.parse(localStorage.getItem('hooked_catches') || '[]')
      const len = Number(length)
      const rank = all.filter(c => Number(c.length) > len).length + 1
      // tied if any other catch (regardless of species) shares the same length
      const tied = all.filter(c => c.id !== catchData?.id && Number(c.length) === len).length > 0
      return { rank, tied }
    } catch { return { rank: 1, tied: false } }
  })()

  return (
    <ScreenShell>
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        padding: '40px 24px 36px',
        maxWidth: '420px', margin: '0 auto', width: '100%',
      }}>

        {/* heading */}
        <div className="animate-fade-up" style={{ textAlign: 'center', marginBottom: '28px' }}>
          <h1 style={{
            fontFamily: "'Unbounded', sans-serif",
            fontSize: 'clamp(1.5rem, 6vw, 1.9rem)',
            fontWeight: 900,
            color: '#F0F8FF',
            margin: '0 0 8px',
            lineHeight: 1.15,
          }}>
            Nice one {name}!
          </h1>
          <p style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: '1rem',
            fontWeight: 600,
            color: '#FFB800',
            margin: 0,
            letterSpacing: '0.01em',
          }}>
            {tied ? `This ${species} is tied for #${rank} on the boat!` : `This ${species} is #${rank} on the boat!`}
          </p>
        </div>

        {/* catch card */}
        <div className="animate-fade-up delay-2" style={{
          flex: 1,
          background: 'linear-gradient(170deg, #0d3348 0%, #071e2b 100%)',
          border: '1.5px solid rgba(0,229,197,0.18)',
          borderRadius: '24px',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 0 40px rgba(0,229,197,0.08), 0 20px 60px rgba(0,0,0,0.4)',
          marginBottom: '20px',
          minHeight: '340px',
        }}>

          {/* fish illustration */}
          <div style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '32px 24px 16px',
            position: 'relative',
          }}>
            {/* glow behind fish */}
            <div style={{
              position: 'absolute',
              width: '60%', height: '60%',
              background: 'radial-gradient(ellipse, rgba(0,229,197,0.1) 0%, transparent 70%)',
              borderRadius: '50%',
              pointerEvents: 'none',
            }} />
            {speciesInfo && (
              <img
                src={speciesInfo.img}
                alt={species}
                style={{
                  width: '85%',
                  maxHeight: '160px',
                  objectFit: 'contain',
                  mixBlendMode: 'lighten',
                  transform: `scale(${speciesInfo.scale})`,
                  position: 'relative',
                  filter: 'drop-shadow(0 4px 20px rgba(0,229,197,0.2))',
                }}
              />
            )}
          </div>

          {/* species + length + name */}
          <div style={{ padding: '8px 28px 20px', textAlign: 'center' }}>
            <div style={{
              fontFamily: "'Unbounded', sans-serif",
              fontSize: '1.05rem',
              fontWeight: 700,
              color: '#F0F8FF',
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              marginBottom: '10px',
            }}>
              {species}
            </div>

            {/* length */}
            <div style={{
              display: 'flex',
              alignItems: 'baseline',
              justifyContent: 'center',
              gap: '6px',
              marginBottom: '10px',
            }}>
              <span style={{
                fontFamily: "'Unbounded', sans-serif",
                fontSize: 'clamp(3rem, 14vw, 4rem)',
                fontWeight: 900,
                color: '#00E5C5',
                lineHeight: 1,
                letterSpacing: '-0.03em',
              }}>
                {length}
              </span>
              <span style={{
                fontFamily: "'Unbounded', sans-serif",
                fontSize: '1.1rem',
                fontWeight: 600,
                color: 'rgba(0,229,197,0.6)',
                letterSpacing: '0.05em',
                paddingBottom: '6px',
              }}>
                cm
              </span>
            </div>

            <div style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '0.9rem',
              fontWeight: 500,
              color: 'rgba(240,248,255,0.55)',
              letterSpacing: '0.01em',
            }}>
              {name}
            </div>
          </div>

          {/* footer strip */}
          <div style={{
            borderTop: '1px solid rgba(0,229,197,0.12)',
            background: 'rgba(0,229,197,0.04)',
            padding: '12px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
          }}>
            <span style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '0.65rem',
              fontWeight: 700,
              color: '#00E5C5',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              opacity: 0.8,
            }}>
              Waitematā Harbour
            </span>
            <span style={{ color: 'rgba(0,229,197,0.3)', fontSize: '0.65rem' }}>•</span>
            <span style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '0.65rem',
              fontWeight: 700,
              color: '#00E5C5',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              opacity: 0.8,
            }}>
              {today}
            </span>
            <span style={{ color: 'rgba(0,229,197,0.3)', fontSize: '0.65rem' }}>•</span>
            <span style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '0.65rem',
              fontWeight: 700,
              color: '#00E5C5',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              opacity: 0.8,
            }}>
              NZ Legend Boating
            </span>
          </div>
        </div>

        {/* actions */}
        <div className="animate-fade-up delay-3" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {/* ghost leaderboard button */}
          <button
            onClick={onLeaderboard}
            style={{
              width: '100%',
              padding: '14px 24px',
              borderRadius: '99px',
              border: '1.5px solid rgba(0,229,197,0.4)',
              background: 'transparent',
              color: '#00E5C5',
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '0.95rem',
              fontWeight: 700,
              cursor: 'pointer',
              letterSpacing: '0.02em',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,229,197,0.08)'; e.currentTarget.style.borderColor = '#00E5C5' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(0,229,197,0.4)' }}
          >
            See today's leaderboard
          </button>

          {/* undo */}
          {!confirmUndo ? (
            <button
              onClick={() => setConfirmUndo(true)}
              style={{
                background: 'none',
                border: 'none',
                color: 'rgba(240,248,255,0.2)',
                fontFamily: "'DM Sans', sans-serif",
                fontSize: '0.78rem',
                fontWeight: 500,
                cursor: 'pointer',
                padding: '4px 0',
                textDecoration: 'underline',
                textDecorationColor: 'rgba(240,248,255,0.12)',
                textUnderlineOffset: '3px',
                transition: 'color 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.color = 'rgba(240,248,255,0.45)' }}
              onMouseLeave={e => { e.currentTarget.style.color = 'rgba(240,248,255,0.2)' }}
            >
              Made a mistake? Remove it
            </button>
          ) : (
            <div style={{
              background: 'rgba(239,68,68,0.06)',
              border: '1.5px solid rgba(239,68,68,0.2)',
              borderRadius: '14px',
              padding: '14px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}>
              <span style={{
                flex: 1,
                fontFamily: "'DM Sans', sans-serif",
                fontSize: '0.82rem',
                fontWeight: 500,
                color: 'rgba(240,248,255,0.55)',
              }}>
                Remove this catch?
              </span>
              <button
                onClick={() => setConfirmUndo(false)}
                style={{
                  padding: '6px 13px',
                  borderRadius: '99px',
                  border: '1px solid rgba(240,248,255,0.15)',
                  background: 'transparent',
                  color: 'rgba(240,248,255,0.4)',
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'color 0.15s',
                  whiteSpace: 'nowrap',
                }}
                onMouseEnter={e => { e.currentTarget.style.color = '#F0F8FF' }}
                onMouseLeave={e => { e.currentTarget.style.color = 'rgba(240,248,255,0.4)' }}
              >
                Cancel
              </button>
              <button
                onClick={onUndo}
                style={{
                  padding: '6px 13px',
                  borderRadius: '99px',
                  border: 'none',
                  background: 'rgba(239,68,68,0.85)',
                  color: '#fff',
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 0 12px rgba(239,68,68,0.25)',
                  transition: 'background 0.15s',
                  whiteSpace: 'nowrap',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,1)' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.85)' }}
              >
                Remove
              </button>
            </div>
          )}
        </div>
      </div>
    </ScreenShell>
  )
}

// ─── Screen 5: Leaderboard ────────────────────────────────────────────────────

function LeaderboardScreen({ onLogAnother }) {
  const today = new Date().toDateString()
  const dateLabel = new Date().toLocaleDateString('en-NZ', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

  const [filter, setFilter] = useState('All')
  const [allCatches, setAllCatches] = useState(() => {
    try { return JSON.parse(localStorage.getItem('hooked_catches') || '[]') }
    catch { return [] }
  })
  const [confirmDeleteId, setConfirmDeleteId] = useState(null)

  const currentUser = (() => {
    try { return localStorage.getItem('hooked_name') ? JSON.parse(localStorage.getItem('hooked_name')) : '' }
    catch { return '' }
  })()

  const deleteCatch = (id) => {
    const kept = allCatches.filter(c => c.id !== id)
    try { localStorage.setItem('hooked_catches', JSON.stringify(kept)) } catch {}
    setAllCatches(kept)
    setConfirmDeleteId(null)
  }

  // filter to today
  const todayCatches = allCatches.filter(c => new Date(c.date).toDateString() === today)

  // apply species filter then rank by length desc
  const filtered = (filter === 'All' ? todayCatches : todayCatches.filter(c => c.species === filter))
    .slice()
    .sort((a, b) => Number(b.length) - Number(a.length))

  const chips = ['All', ...SPECIES.map(s => s.name)]

  return (
    <ScreenShell>
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        maxWidth: '480px', margin: '0 auto', width: '100%',
      }}>

        {/* header */}
        <div style={{ padding: '28px 24px 0' }}>
          <div className="animate-fade-up" style={{ marginBottom: '20px' }}>
            <h1 style={{
              fontFamily: "'Unbounded', sans-serif",
              fontSize: 'clamp(1.4rem, 6vw, 1.75rem)',
              fontWeight: 900,
              color: '#F0F8FF',
              margin: '0 0 6px',
              lineHeight: 1.15,
            }}>
              Today's catch
            </h1>
            <p style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '0.85rem',
              color: 'rgba(240,248,255,0.4)',
              margin: 0,
              fontWeight: 400,
            }}>
              {dateLabel}
            </p>
          </div>

          {/* filter chips — horizontal scroll */}
          <div
            className="animate-fade-up delay-1 scroll-x-hidden"
            style={{
              display: 'flex',
              gap: '8px',
              paddingBottom: '16px',
            }}
          >
            {chips.map(chip => {
              const active = filter === chip
              return (
                <button
                  key={chip}
                  onClick={() => setFilter(chip)}
                  style={{
                    flexShrink: 0,
                    padding: '7px 16px',
                    borderRadius: '99px',
                    border: `1.5px solid ${active ? '#00E5C5' : 'rgba(240,248,255,0.12)'}`,
                    background: active ? 'rgba(0,229,197,0.12)' : 'transparent',
                    color: active ? '#00E5C5' : 'rgba(240,248,255,0.5)',
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {chip}
                </button>
              )
            })}
          </div>
        </div>

        {/* list */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '0 24px' }}>
          {filtered.length === 0 ? (
            <div className="animate-fade-in" style={{
              textAlign: 'center',
              padding: '60px 20px',
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🎣</div>
              <p style={{
                fontFamily: "'Unbounded', sans-serif",
                fontSize: '0.9rem',
                fontWeight: 600,
                color: 'rgba(240,248,255,0.3)',
                margin: '0 0 6px',
              }}>
                No catches yet
              </p>
              <p style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: '0.8rem',
                color: 'rgba(240,248,255,0.2)',
                margin: 0,
              }}>
                {filter === 'All' ? 'Be the first to log a catch today' : `No ${filter} logged today`}
              </p>
            </div>
          ) : (
            filtered.map((c, i) => {
              const rank = i + 1
              const isFirst = rank === 1
              const speciesInfo = SPECIES.find(s => s.name === c.species)
              const isOwn = currentUser && c.name === currentUser
              const confirming = confirmDeleteId === c.id
              return (
                <div
                  key={c.id}
                  className={`animate-fade-up delay-${Math.min(i + 1, 6)}`}
                  style={{
                    padding: '14px 16px',
                    marginBottom: '8px',
                    background: confirming
                      ? 'rgba(239,68,68,0.06)'
                      : isFirst
                        ? 'linear-gradient(135deg, rgba(255,184,0,0.08), rgba(255,184,0,0.04))'
                        : 'rgba(240,248,255,0.03)',
                    border: `1.5px solid ${confirming ? 'rgba(239,68,68,0.25)' : isFirst ? 'rgba(255,184,0,0.2)' : 'rgba(240,248,255,0.07)'}`,
                    borderRadius: '16px',
                    transition: 'background 0.15s, border-color 0.15s',
                  }}
                >
                  {/* main row */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>

                    {/* rank */}
                    <div style={{
                      width: '28px',
                      textAlign: 'center',
                      flexShrink: 0,
                      fontFamily: "'Unbounded', sans-serif",
                      fontSize: isFirst ? '1.1rem' : '0.9rem',
                      fontWeight: 800,
                      color: isFirst ? '#FFB800' : '#00E5C5',
                      lineHeight: 1,
                    }}>
                      {isFirst ? '🥇' : `#${rank}`}
                    </div>

                    {/* fish image */}
                    <div style={{ width: '52px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {speciesInfo && (
                        <img
                          src={speciesInfo.img}
                          alt={c.species}
                          style={{
                            width: '52px',
                            height: '36px',
                            objectFit: 'contain',
                            mixBlendMode: 'lighten',
                            transform: `scale(${speciesInfo.scale})`,
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
                        color: 'rgba(240,248,255,0.4)',
                        fontWeight: 400,
                        marginTop: '1px',
                      }}>
                        {c.species}
                      </div>
                    </div>

                    {/* length */}
                    <div style={{ flexShrink: 0, textAlign: 'right' }}>
                      <span style={{
                        fontFamily: "'Unbounded', sans-serif",
                        fontSize: '1.2rem',
                        fontWeight: 800,
                        color: isFirst ? '#FFB800' : '#00E5C5',
                        lineHeight: 1,
                      }}>
                        {c.length}
                      </span>
                      <span style={{
                        fontFamily: "'DM Sans', sans-serif",
                        fontSize: '0.7rem',
                        color: 'rgba(240,248,255,0.35)',
                        fontWeight: 600,
                        marginLeft: '3px',
                      }}>
                        cm
                      </span>
                    </div>

                    {/* trash — own catches only */}
                    {isOwn && (
                      <button
                        onClick={() => setConfirmDeleteId(confirming ? null : c.id)}
                        title="Remove catch"
                        style={{
                          flexShrink: 0,
                          width: '30px',
                          height: '30px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: confirming ? 'rgba(239,68,68,0.15)' : 'transparent',
                          border: `1px solid ${confirming ? 'rgba(239,68,68,0.3)' : 'transparent'}`,
                          borderRadius: '8px',
                          cursor: 'pointer',
                          color: confirming ? 'rgba(239,68,68,0.9)' : 'rgba(240,248,255,0.22)',
                          transition: 'all 0.15s',
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.color = 'rgba(239,68,68,0.8)'
                          e.currentTarget.style.background = 'rgba(239,68,68,0.1)'
                          e.currentTarget.style.borderColor = 'rgba(239,68,68,0.25)'
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.color = confirming ? 'rgba(239,68,68,0.9)' : 'rgba(240,248,255,0.22)'
                          e.currentTarget.style.background = confirming ? 'rgba(239,68,68,0.15)' : 'transparent'
                          e.currentTarget.style.borderColor = confirming ? 'rgba(239,68,68,0.3)' : 'transparent'
                        }}
                      >
                        <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                          <path d="M1.5 3.5h11M5.5 3.5V2.5a.5.5 0 01.5-.5h2a.5.5 0 01.5.5v1M3 3.5l.7 7.5a1 1 0 001 .9h4.6a1 1 0 001-.9L11 3.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </button>
                    )}
                  </div>

                  {/* inline confirmation */}
                  {confirming && (
                    <div style={{
                      marginTop: '12px',
                      paddingTop: '12px',
                      borderTop: '1px solid rgba(239,68,68,0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                    }}>
                      <span style={{
                        flex: 1,
                        fontFamily: "'DM Sans', sans-serif",
                        fontSize: '0.82rem',
                        fontWeight: 500,
                        color: 'rgba(240,248,255,0.55)',
                      }}>
                        Remove this catch?
                      </span>
                      <button
                        onClick={() => setConfirmDeleteId(null)}
                        style={{
                          padding: '6px 13px',
                          borderRadius: '99px',
                          border: '1px solid rgba(240,248,255,0.15)',
                          background: 'transparent',
                          color: 'rgba(240,248,255,0.4)',
                          fontFamily: "'DM Sans', sans-serif",
                          fontSize: '0.8rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          transition: 'color 0.15s',
                          whiteSpace: 'nowrap',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.color = '#F0F8FF' }}
                        onMouseLeave={e => { e.currentTarget.style.color = 'rgba(240,248,255,0.4)' }}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => deleteCatch(c.id)}
                        style={{
                          padding: '6px 13px',
                          borderRadius: '99px',
                          border: 'none',
                          background: 'rgba(239,68,68,0.85)',
                          color: '#fff',
                          fontFamily: "'DM Sans', sans-serif",
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          boxShadow: '0 0 12px rgba(239,68,68,0.25)',
                          transition: 'background 0.15s',
                          whiteSpace: 'nowrap',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,1)' }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.85)' }}
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>

        {/* footer CTA */}
        <div className="animate-fade-up" style={{ padding: '16px 24px 32px' }}>
          <button
            onClick={onLogAnother}
            style={{
              width: '100%',
              padding: '16px 24px',
              borderRadius: '12px',
              border: 'none',
              background: 'linear-gradient(135deg, #00E5C5 0%, #00c8ac 100%)',
              color: '#0B2A3B',
              fontFamily: "'Inter', sans-serif",
              fontSize: '18px',
              fontWeight: 600,
              cursor: 'pointer',
              letterSpacing: '0.02em',
              boxShadow: '0 0 28px rgba(0,229,197,0.35)',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 0 40px rgba(0,229,197,0.5)'; e.currentTarget.style.transform = 'translateY(-1px)' }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 0 28px rgba(0,229,197,0.35)'; e.currentTarget.style.transform = 'translateY(0)' }}
          >
            Log Another Catch
          </button>
        </div>
      </div>
    </ScreenShell>
  )
}

// ─── App root ─────────────────────────────────────────────────────────────────

export default function App() {
  const [showSplash, setShowSplash] = useState(true)
  const [screen, setScreen]   = useLocalStorage('hooked_screen', 0)
  const [name, setName]       = useLocalStorage('hooked_name', '')
  const [species, setSpecies] = useLocalStorage('hooked_species', '')
  const [length, setLength]   = useLocalStorage('hooked_length', '')
  const [photo, setPhoto]     = useLocalStorage('hooked_photo', null)
  const [lastCatch, setLastCatch] = useLocalStorage('hooked_last_catch', null)

  const submitCatch = () => {
    const record = {
      id: Date.now(),
      name,
      species,
      length,
      photo,
      date: new Date().toISOString(),
    }
    // append to catch history
    try {
      const prev = JSON.parse(localStorage.getItem('hooked_catches') || '[]')
      localStorage.setItem('hooked_catches', JSON.stringify([record, ...prev]))
    } catch {}
    setLastCatch(record)
    setScreen(4)
  }

  const logAnother = () => {
    setSpecies('')
    setLength('')
    setPhoto(null)
    setScreen(1)
  }

  const undoLastCatch = () => {
    if (lastCatch) {
      try {
        const prev = JSON.parse(localStorage.getItem('hooked_catches') || '[]')
        localStorage.setItem('hooked_catches', JSON.stringify(prev.filter(c => c.id !== lastCatch.id)))
      } catch {}
    }
    setLastCatch(null)
    setSpecies('')
    setLength('')
    setPhoto(null)
    setScreen(1)
  }

  return (
    <>
      {showSplash && <SplashScreen onDone={() => setShowSplash(false)} />}
      {screen === 0 && (
        <NameScreen
          name={name}
          setName={setName}
          onNext={() => setScreen(1)}
        />
      )}
      {screen === 1 && (
        <SpeciesScreen
          name={name}
          species={species}
          setSpecies={setSpecies}
          onNext={() => setScreen(2)}
          onBack={() => setScreen(0)}
        />
      )}
      {screen === 2 && (
        <LengthScreen
          species={species}
          length={length}
          setLength={setLength}
          onNext={() => setScreen(3)}
          onBack={() => setScreen(1)}
        />
      )}
      {screen === 3 && (
        <PhotoScreen
          species={species}
          length={length}
          photo={photo}
          setPhoto={setPhoto}
          onSubmit={submitCatch}
          onBack={() => setScreen(2)}
        />
      )}
      {screen === 4 && (
        <CatchCardScreen
          catchData={lastCatch}
          onAnother={logAnother}
          onLeaderboard={() => setScreen(5)}
          onUndo={undoLastCatch}
        />
      )}
      {screen === 5 && (
        <LeaderboardScreen
          onLogAnother={logAnother}
        />
      )}
    </>
  )
}
