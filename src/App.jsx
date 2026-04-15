import { useState, useCallback, useRef } from 'react'

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
    <div style={{ display: 'flex', gap: '6px', padding: '0 24px' }}>
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} style={{
          flex: 1, height: '3px', borderRadius: '99px',
          background: i < step ? '#00E5C5' : 'rgba(240,248,255,0.12)',
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

// ─── Screen 0: Name ───────────────────────────────────────────────────────────

function NameScreen({ name, setName, onNext }) {
  return (
    <ScreenShell>
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        justifyContent: 'center', padding: '48px 28px 40px',
        maxWidth: '420px', margin: '0 auto', width: '100%',
      }}>

        {/* logo mark */}
        <div className="animate-fade-up" style={{ marginBottom: '40px', textAlign: 'center' }}>
          <div className="animate-float" style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: '80px', height: '80px', borderRadius: '24px',
            background: 'linear-gradient(135deg, rgba(0,229,197,0.15), rgba(0,229,197,0.05))',
            border: '1.5px solid rgba(0,229,197,0.25)',
            fontSize: '2rem', marginBottom: '24px',
          }}>
            🎣
          </div>

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
            marginBottom: '10px',
          }}>
            HOOKED
          </div>

          <p style={{
            color: 'rgba(240,248,255,0.45)',
            fontSize: '0.9rem',
            fontWeight: 400,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
          }}>
            Charter Catch Tracker
          </p>
        </div>

        {/* form */}
        <div className="animate-fade-up delay-2" style={{ marginBottom: '32px' }}>
          <label style={{
            display: 'block',
            fontFamily: "'Unbounded', sans-serif",
            fontSize: '1rem',
            fontWeight: 600,
            color: '#F0F8FF',
            marginBottom: '20px',
            lineHeight: 1.4,
          }}>
            What's your name, <span style={{ color: '#00E5C5' }}>angler?</span>
          </label>

          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && name.trim() && onNext()}
            placeholder="Captain…"
            autoFocus
            style={{
              width: '100%',
              padding: '15px 18px',
              background: 'rgba(240,248,255,0.05)',
              border: '1.5px solid rgba(240,248,255,0.12)',
              borderRadius: '14px',
              color: '#F0F8FF',
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '1.125rem',
              fontWeight: 400,
              outline: 'none',
              transition: 'all 0.2s',
            }}
            onFocus={e => {
              e.target.style.borderColor = '#00E5C5'
              e.target.style.background = 'rgba(0,229,197,0.06)'
              e.target.style.boxShadow = '0 0 0 4px rgba(0,229,197,0.1)'
            }}
            onBlur={e => {
              e.target.style.borderColor = 'rgba(240,248,255,0.12)'
              e.target.style.background = 'rgba(240,248,255,0.05)'
              e.target.style.boxShadow = 'none'
            }}
          />
        </div>

        <div className="animate-fade-up delay-3">
          <PrimaryBtn onClick={onNext} disabled={!name.trim()}>
            Let's Fish →
          </PrimaryBtn>
        </div>

        <p className="animate-fade-up delay-4" style={{
          textAlign: 'center', marginTop: '20px',
          color: 'rgba(240,248,255,0.2)', fontSize: '0.75rem',
        }}>
          Your catch data stays on this device
        </p>
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
        padding: '24px 20px 32px',
        maxWidth: '480px', margin: '0 auto', width: '100%',
      }}>

        {/* header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <BackButton onClick={onBack} />
          <ProgressBar step={1} />
        </div>

        <div className="animate-fade-up" style={{ marginBottom: '28px' }}>
          <p style={{ color: 'rgba(240,248,255,0.45)', fontSize: '0.85rem', marginBottom: '6px', fontWeight: 500 }}>
            Hey {name} 👋
          </p>
          <h2 style={{
            fontFamily: "'Unbounded', sans-serif",
            fontSize: 'clamp(1.25rem, 5vw, 1.5rem)',
            fontWeight: 700,
            color: '#F0F8FF',
            lineHeight: 1.3,
            margin: 0,
          }}>
            What did you<br />
            <span style={{ color: '#00E5C5' }}>catch?</span>
          </h2>
        </div>

        {/* species grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '12px',
          flex: 1,
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

        <div style={{ marginTop: '20px' }}>
          <PrimaryBtn onClick={onNext} disabled={!species}>
            Continue →
          </PrimaryBtn>
        </div>
      </div>
    </ScreenShell>
  )
}

// ─── Screen 2: Length ─────────────────────────────────────────────────────────

function LengthScreen({ species, length, setLength, onNext, onBack }) {
  const num = parseFloat(length)
  const valid = !isNaN(num) && num > 0 && num < 300

  return (
    <ScreenShell>
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        padding: '24px 24px 40px',
        maxWidth: '420px', margin: '0 auto', width: '100%',
      }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <BackButton onClick={onBack} />
          <ProgressBar step={2} />
        </div>

        <div className="animate-fade-up" style={{ marginBottom: '40px' }}>
          <p style={{ color: 'rgba(240,248,255,0.45)', fontSize: '0.85rem', marginBottom: '6px', fontWeight: 500 }}>
            Nice {species}! 🎉
          </p>
          <h2 style={{
            fontFamily: "'Unbounded', sans-serif",
            fontSize: 'clamp(1.2rem, 5vw, 1.45rem)',
            fontWeight: 700,
            color: '#F0F8FF',
            lineHeight: 1.3,
            margin: 0,
          }}>
            How long was<br />
            <span style={{ color: '#00E5C5' }}>your catch?</span>
          </h2>
        </div>

        {/* measurement card */}
        <div className="animate-fade-up delay-1" style={{
          background: 'rgba(240,248,255,0.04)',
          border: '1.5px solid rgba(240,248,255,0.08)',
          borderRadius: '20px',
          padding: '32px 24px',
          marginBottom: '32px',
          textAlign: 'center',
        }}>
          {/* ruler icon */}
          <div style={{ fontSize: '2.5rem', marginBottom: '20px', lineHeight: 1 }}>📏</div>

          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <input
              type="number"
              inputMode="decimal"
              value={length}
              onChange={e => setLength(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && valid && onNext()}
              placeholder="0"
              min="1"
              max="299"
              autoFocus
              style={{
                flex: 1,
                padding: '16px 60px 16px 18px',
                background: 'rgba(240,248,255,0.06)',
                border: '1.5px solid rgba(240,248,255,0.12)',
                borderRadius: '14px',
                color: '#F0F8FF',
                fontFamily: "'Unbounded', sans-serif",
                fontSize: '2rem',
                fontWeight: 700,
                textAlign: 'center',
                outline: 'none',
                transition: 'all 0.2s',
                MozAppearance: 'textfield',
              }}
              onFocus={e => {
                e.target.style.borderColor = '#00E5C5'
                e.target.style.background = 'rgba(0,229,197,0.06)'
                e.target.style.boxShadow = '0 0 0 4px rgba(0,229,197,0.1)'
              }}
              onBlur={e => {
                e.target.style.borderColor = 'rgba(240,248,255,0.12)'
                e.target.style.background = 'rgba(240,248,255,0.06)'
                e.target.style.boxShadow = 'none'
              }}
            />
            <span style={{
              position: 'absolute', right: '18px',
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '1rem', fontWeight: 600,
              color: 'rgba(240,248,255,0.4)',
              pointerEvents: 'none',
            }}>cm</span>
          </div>

          {/* quick select */}
          <div style={{ display: 'flex', gap: '8px', marginTop: '16px', justifyContent: 'center' }}>
            {[30, 45, 60, 75, 90].map(v => (
              <button
                key={v}
                onClick={() => setLength(String(v))}
                style={{
                  padding: '6px 12px',
                  background: length === String(v) ? 'rgba(0,229,197,0.15)' : 'rgba(240,248,255,0.05)',
                  border: `1px solid ${length === String(v) ? 'rgba(0,229,197,0.4)' : 'rgba(240,248,255,0.1)'}`,
                  borderRadius: '99px',
                  color: length === String(v) ? '#00E5C5' : 'rgba(240,248,255,0.45)',
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                {v}
              </button>
            ))}
          </div>
        </div>

        <div className="animate-fade-up delay-2">
          <PrimaryBtn onClick={onNext} disabled={!valid}>
            Continue →
          </PrimaryBtn>
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
        padding: '24px 24px 40px',
        maxWidth: '420px', margin: '0 auto', width: '100%',
      }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <BackButton onClick={onBack} />
          <ProgressBar step={3} />
        </div>

        <div className="animate-fade-up" style={{ marginBottom: '24px' }}>
          <p style={{ color: 'rgba(240,248,255,0.45)', fontSize: '0.85rem', marginBottom: '6px', fontWeight: 500 }}>
            {length}cm {species}
          </p>
          <h2 style={{
            fontFamily: "'Unbounded', sans-serif",
            fontSize: 'clamp(1.2rem, 5vw, 1.45rem)',
            fontWeight: 700,
            color: '#F0F8FF',
            lineHeight: 1.3,
            margin: 0,
          }}>
            Show us your<br />
            <span style={{ color: '#FFB800' }}>catch!</span>
          </h2>
        </div>

        {/* upload zone */}
        <div
          className="animate-fade-up delay-1"
          onClick={() => fileRef.current?.click()}
          onDrop={onDrop}
          onDragOver={e => e.preventDefault()}
          style={{
            flex: 1,
            minHeight: '260px',
            border: `2px dashed ${photo ? 'transparent' : 'rgba(240,248,255,0.15)'}`,
            borderRadius: '20px',
            overflow: 'hidden',
            cursor: 'pointer',
            position: 'relative',
            background: photo ? 'transparent' : 'rgba(240,248,255,0.03)',
            transition: 'all 0.2s',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onMouseEnter={e => { if (!photo) { e.currentTarget.style.borderColor = 'rgba(255,184,0,0.4)'; e.currentTarget.style.background = 'rgba(255,184,0,0.04)' } }}
          onMouseLeave={e => { if (!photo) { e.currentTarget.style.borderColor = 'rgba(240,248,255,0.15)'; e.currentTarget.style.background = 'rgba(240,248,255,0.03)' } }}
        >
          {photo ? (
            <>
              <img
                src={photo}
                alt="Your catch"
                style={{
                  width: '100%', height: '100%',
                  objectFit: 'cover',
                  borderRadius: '18px',
                }}
              />
              {/* overlay to re-tap */}
              <div style={{
                position: 'absolute', inset: 0,
                background: 'rgba(11,42,59,0.5)',
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                opacity: 0, transition: 'opacity 0.2s',
                borderRadius: '18px',
              }}
              onMouseEnter={e => { e.currentTarget.style.opacity = '1' }}
              onMouseLeave={e => { e.currentTarget.style.opacity = '0' }}
              >
                <span style={{ fontSize: '2rem' }}>📷</span>
                <span style={{ color: '#F0F8FF', fontSize: '0.85rem', marginTop: '8px', fontWeight: 500 }}>Change photo</span>
              </div>
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '32px 20px' }}>
              <div style={{ fontSize: '3rem', marginBottom: '14px', lineHeight: 1 }}>📷</div>
              <p style={{
                fontFamily: "'DM Sans', sans-serif",
                color: '#F0F8FF',
                fontSize: '1rem',
                fontWeight: 600,
                margin: '0 0 6px',
              }}>
                Tap to add a photo
              </p>
              <p style={{
                color: 'rgba(240,248,255,0.35)',
                fontSize: '0.8rem',
                margin: 0,
              }}>
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

        <div className="animate-fade-up delay-2" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <PrimaryBtn onClick={onSubmit}>
            {photo ? 'Log My Catch 🎣' : 'Skip & Log Catch'}
          </PrimaryBtn>
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
      // tied if another catch (not this one) shares the same length
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
            {tied ? `You're tied for #${rank} on the boat!` : `You're #${rank} on the boat!`}
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
            className="animate-fade-up delay-1"
            style={{
              display: 'flex',
              gap: '8px',
              overflowX: 'auto',
              paddingBottom: '16px',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
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
          <PrimaryBtn onClick={onLogAnother}>
            Log Another Catch
          </PrimaryBtn>
        </div>
      </div>
    </ScreenShell>
  )
}

// ─── App root ─────────────────────────────────────────────────────────────────

export default function App() {
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
