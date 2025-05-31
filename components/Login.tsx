import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { useRouter } from 'next/navigation';
import gsap from 'gsap';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { signIn } = useAuth();
  const router = useRouter();
  const cardRef = useRef(null);

  useEffect(() => {
    if (cardRef.current) {
      gsap.fromTo(
        cardRef.current,
        { opacity: 0, y: 60 },
        { opacity: 1, y: 0, duration: 1, ease: 'power3.out' }
      );
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    try {
      await signIn(email, password);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      if (errorMessage.includes('Email not confirmed')) {
        setError('Please check your email for confirmation');
      } else if (errorMessage.includes('Invalid login credentials')) {
        setError('Invalid email or password');
      } else {
        setError(errorMessage);
      }
    }
  };

  // Handle navigating to signup page
  const navigateToSignup = () => {
    router.push('/signup');
  };

  // Handle navigating to password recovery page
  const navigateToRecovery = () => {
    router.push('/recovery');
  };

  return (
    <div style={{ 
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'flex-start',
      height: '100vh',
      width: '100%',
      margin: 0,
      padding: 0,
      paddingTop: '10vh',
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'linear-gradient(135deg, #1c3b70 0%, #4e2a84 50%, #1a6855 100%)',
      overflow: 'hidden',
      boxSizing: 'border-box'
    }}>
      <div ref={cardRef} style={{ 
        width: '450px', 
        color: 'white',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
      }}>
        <div style={{ 
          marginBottom: '24px'
        }}>
          <img
            src="/images/mindlink logo.png"
            alt="MindLink Logo"
            style={{ 
              width: '60px', 
              height: 'auto'
            }}
          />
        </div>
        <h1 style={{ 
          fontSize: '24px', 
          fontWeight: '400', 
          margin: 0,
          marginBottom: '24px',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
          color: 'white'
        }}>
          Sign in to MindLink
        </h1>
        
        <div style={{
          background: 'rgba(255, 255, 255, 0.1)',
          padding: '20px',
          borderRadius: '6px',
          width: '100%',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
          marginBottom: '16px',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}>
          <form onSubmit={handleSubmit} style={{ textAlign: 'left', width: '100%' }}>
            <div style={{ marginBottom: '16px' }}>
              <label htmlFor="email" style={{ 
                display: 'block', 
                marginBottom: '8px', 
                fontSize: '14px',
                color: 'white',
                fontWeight: '500',
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
              }}>
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ 
                  width: '100%', 
                  padding: '8px 12px',
                  height: '38px',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  background: 'rgba(255, 255, 255, 0.1)',
                  color: 'white',
                  borderRadius: '6px',
                  fontSize: '14px',
                  boxSizing: 'border-box',
                  outline: 'none',
                  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
                }}
                placeholder="Email"
              />
            </div>
            
            <div style={{ marginBottom: '16px' }}>
              <div style={{ 
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '8px'
              }}>
                <label htmlFor="password" style={{ 
                  display: 'block',
                  fontSize: '14px',
                  color: 'white',
                  fontWeight: '500',
                  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
                }}>
                  Password
                </label>
                <button
                  type="button"
                  onClick={navigateToRecovery}
                  style={{ 
                    background: 'none', 
                    border: 'none', 
                    color: '#6bc1ff', 
                    cursor: 'pointer',
                    fontSize: '12px',
                    padding: 0,
                    textDecoration: 'none',
                    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
                  }}
                >
                  Forgot password?
                </button>
              </div>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ 
                  width: '100%', 
                  padding: '8px 12px',
                  height: '38px',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  background: 'rgba(255, 255, 255, 0.1)',
                  color: 'white',
                  borderRadius: '6px',
                  fontSize: '14px',
                  boxSizing: 'border-box',
                  outline: 'none',
                  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
                }}
                placeholder="Password"
              />
            </div>

            {error && (
              <div style={{ color: '#ff8080', marginBottom: '16px', fontSize: '14px', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif' }}>{error}</div>
            )}

            <div style={{ marginTop: '16px' }}>
              <button
                type="submit"
                style={{ 
                  width: '100%',
                  padding: '8px 16px',
                  height: '38px',
                  border: 'none',
                  borderRadius: '6px',
                  background: '#0a84ff',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  transition: 'background-color 0.2s',
                  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
                }}
                onMouseOver={(e) => e.currentTarget.style.background = '#0070e0'}
                onMouseOut={(e) => e.currentTarget.style.background = '#0a84ff'}
              >
                Sign in
              </button>
            </div>
          </form>
        </div>
        
        <div style={{
          background: 'rgba(255, 255, 255, 0.1)',
          padding: '16px',
          borderRadius: '6px',
          width: '100%',
          boxSizing: 'border-box',
          textAlign: 'center',
          fontSize: '14px',
          color: 'white',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
        }}>
          New to MindLink? <button
            type="button"
            onClick={navigateToSignup}
            style={{ 
              background: 'none', 
              border: 'none', 
              color: '#6bc1ff', 
              cursor: 'pointer',
              fontSize: '14px',
              padding: 0,
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
            }}
          >
            Create an account
          </button>
        </div>
      </div>
    </div>
  );
} 