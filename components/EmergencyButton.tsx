import React, { useState } from 'react';

export default function EmergencyButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Emergency Support"
        style={{
          position: 'fixed',
          bottom: '32px',
          right: '32px',
          zIndex: 1000,
          width: '68px',
          height: '68px',
          borderRadius: '50%',
          border: 'none',
          background: 'radial-gradient(circle, #ff3b3b 60%, #b80000 100%)',
          boxShadow: '0 0 24px 6px rgba(255,0,0,0.25)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          outline: 'none',
          animation: 'emergency-breath 1.6s infinite ease-in-out',
        }}
      >
        <span style={{
          color: 'white',
          fontWeight: 900,
          fontSize: '32px',
          letterSpacing: '0.02em',
          textShadow: '0 1px 6px rgba(0,0,0,0.18)'
        }}>
          !
        </span>
        <style>{`
          @keyframes emergency-breath {
            0% { box-shadow: 0 0 24px 6px rgba(255,0,0,0.25), 0 0 0 0 rgba(255,59,59,0.5); }
            50% { box-shadow: 0 0 36px 16px rgba(255,0,0,0.45), 0 0 0 16px rgba(255,59,59,0.12); }
            100% { box-shadow: 0 0 24px 6px rgba(255,0,0,0.25), 0 0 0 0 rgba(255,59,59,0.5); }
          }
        `}</style>
      </button>
      {open && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0,0,0,0.45)',
            zIndex: 2000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onClick={() => setOpen(false)}
        >
          <div
            style={{
              background: 'white',
              color: '#b80000',
              borderRadius: '18px',
              padding: '38px 32px 32px 32px',
              minWidth: '340px',
              minHeight: '220px',
              maxWidth: '90vw',
              boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
              textAlign: 'center',
              position: 'relative',
              fontFamily: 'inherit',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
            }}
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={() => setOpen(false)}
              aria-label="Close emergency modal"
              style={{
                position: 'absolute',
                top: '10px',
                right: '14px',
                background: 'none',
                border: 'none',
                color: '#e53935',
                fontSize: '22px',
                fontWeight: 700,
                cursor: 'pointer',
                opacity: 0.7,
                transition: 'opacity 0.2s',
              }}
              onMouseOver={e => (e.currentTarget.style.opacity = '1')}
              onMouseOut={e => (e.currentTarget.style.opacity = '0.7')}
            >
              ×
            </button>
            <div style={{ color: '#2e7d32', fontWeight: 700, fontSize: '17px', marginBottom: '16px', marginTop: '2px' }}>
              You are not alone. Support is available.
            </div>
            <div style={{ color: '#e53935', fontWeight: 700, fontSize: '22px', marginBottom: '22px', letterSpacing: '0.01em' }}>
              Emergency Hotlines
            </div>
            <div style={{ marginBottom: '18px', fontSize: '17px' }}>
              <span style={{ fontWeight: 600 }}>Emergency:</span>{' '}
              <a href="tel:999" style={{ color: '#e53935', fontWeight: 700, textDecoration: 'underline' }}>999</a>
            </div>
            <div style={{ fontSize: '17px' }}>
              <span style={{ fontWeight: 600 }}>Suicide Hotline:</span>{' '}
              <a href="tel:0376272929" style={{ color: '#e53935', fontWeight: 700, textDecoration: 'underline' }}>03-7627 2929</a>
            </div>
          </div>
        </div>
      )}
    </>
  );
} 