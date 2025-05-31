'use client';

export default function SupportPage() {
  return (
    <div style={{
      minHeight: '100vh',
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'flex-start',
      background: 'linear-gradient(135deg, #1c3b70 0%, #4e2a84 50%, #1a6855 100%)',
      color: 'white',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      padding: 0
    }}>
      <div style={{
        width: '100%',
        maxWidth: '800px',
        margin: '60px auto 0 auto',
        padding: '40px 30px',
        background: 'rgba(255,255,255,0.08)',
        borderRadius: '16px',
        textAlign: 'center',
        boxShadow: 'none',
        border: 'none'
      }}>
        <h2 style={{ marginBottom: '32px', fontWeight: 600, fontSize: '24px', letterSpacing: '0.01em' }}>Support</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '22px', fontSize: '17px' }}>
          <div>
            <div>Jabir Iliyas Suraj-Deen</div>
            <div style={{ color: '#b3e0ff' }}>0377741@sd.taylors.edu.my</div>
          </div>
          <div>
            <div>Meng Chengshuo</div>
            <div style={{ color: '#b3e0ff' }}>0378583@sd.taylors.edu.my</div>
          </div>
          <div>
            <div>Marwa Mozammal</div>
            <div style={{ color: '#b3e0ff' }}>0376988@sd.taylors.edu.my</div>
          </div>
          <div>
            <div>Youssef Ahmed Hamada Abdelfattah Mohamed</div>
            <div style={{ color: '#b3e0ff' }}>0374545@sd.taylors.edu.my</div>
          </div>
          <div>
            <div>Syed majeed sufyaan syed ibrahimsha</div>
            <div style={{ color: '#b3e0ff' }}>0378334@sd.taylors.edu.my</div>
          </div>
          <div>
            <div>Ishaq Arham Mujthaba</div>
            <div style={{ color: '#b3e0ff' }}>0378327@sd.taylors.edu.my</div>
          </div>
        </div>
      </div>
      <button
        onClick={() => window.history.back()}
        style={{
          background: 'rgba(255, 255, 255, 0.15)',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          padding: '10px 22px',
          cursor: 'pointer',
          fontSize: '15px',
          fontWeight: 500,
          marginTop: '36px',
          marginBottom: '16px',
          transition: 'background 0.2s',
          outline: 'none',
          boxShadow: '0 1px 4px rgba(0,0,0,0.07)'
        }}
      >
        ← Back
      </button>
    </div>
  );
} 