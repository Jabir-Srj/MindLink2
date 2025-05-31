'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, AuthProvider } from '@/lib/AuthContext';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import gsap from 'gsap';

function SignUpContent() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const { signUp } = useAuth();
  const router = useRouter();
  const signupRef = useRef(null);

  // Animate in on mount
  useEffect(() => {
    if (signupRef.current) {
      gsap.fromTo(
        signupRef.current,
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' }
      );
    }
  }, []);

  // Animate out on navigation
  const handleNavigate = (url: string) => {
    if (signupRef.current) {
      gsap.to(signupRef.current, {
        opacity: 0,
        y: 40,
        duration: 0.5,
        ease: 'power3.in',
        onComplete: () => router.push(url)
      });
    } else {
      router.push(url);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (!username.trim()) {
      setError('Username is required');
      return;
    }
    
    try {
      // Pass username as metadata to signUp
      await signUp(email, password, username);
      // Show verification message instead of redirecting immediately
      setSuccessMessage(`Account created successfully! Please check your email (${email}) to verify your account before logging in.`);
      // Clear the form
      setUsername('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
    }
  };

  return (
    <div ref={signupRef} style={{ 
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'flex-start',
      height: '100vh',
      width: '100%',
      margin: 0,
      padding: 0,
      paddingTop: '6vh',
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'linear-gradient(135deg, #1c3b70 0%, #4e2a84 50%, #1a6855 100%)',
      overflow: 'hidden',
      boxSizing: 'border-box'
    }}>
      <div style={{ 
        width: '450px', 
        color: 'white',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
      }}>
        <div style={{ 
          marginBottom: '16px'
        }}>
          <img
            src="/images/mindlink logo.png"
            alt="MindLink Logo"
            style={{ 
              width: '80px', 
              height: 'auto'
            }}
          />
        </div>
        <h1 style={{ 
          fontSize: '24px', 
          fontWeight: '400', 
          margin: 0,
          marginBottom: '16px',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
          color: 'white'
        }}>
          Create a MindLink account
        </h1>
        
        {successMessage ? (
          <div style={{
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '6px',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            padding: '20px',
            marginBottom: '16px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
            width: '100%'
          }}>
            <div style={{ 
              padding: '15px', 
              background: 'rgba(0, 200, 83, 0.2)', 
              borderRadius: '4px',
              marginBottom: '20px',
              color: '#b9ffcb',
              textAlign: 'left',
              fontSize: '14px',
              lineHeight: '1.5'
            }}>
              {successMessage}
            </div>
            
            <div style={{ marginTop: '20px', textAlign: 'center' }}>
              <button
                onClick={() => handleNavigate('/')}
                style={{ 
                  color: '#6bc1ff', 
                  fontSize: '14px',
                  textDecoration: 'none',
                  padding: '8px 25px',
                  border: 'none',
                  borderRadius: '4px',
                  background: 'rgba(10, 132, 255, 0.3)',
                  cursor: 'pointer',
                  display: 'inline-block'
                }}
              >
                Return to Login
              </button>
            </div>
          </div>
        ) : (
          <div style={{
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '6px',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            padding: '24px',
            marginBottom: '16px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
            width: '100%',
            backdropFilter: 'blur(10px)'
          }}>
            <form onSubmit={handleSubmit} style={{ textAlign: 'left', width: '100%' }}>
              <div style={{ marginBottom: '16px' }}>
                <label htmlFor="username" style={{ 
                  display: 'block', 
                  marginBottom: '8px', 
                  fontSize: '14px',
                  fontWeight: '500',
                  color: 'white',
                  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
                }}>
                  Username
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
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
                  placeholder="Username"
                />
              </div>
              
              <div style={{ marginBottom: '16px' }}>
                <label htmlFor="email" style={{ 
                  display: 'block', 
                  marginBottom: '8px', 
                  fontSize: '14px',
                  fontWeight: '500',
                  color: 'white',
                  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
                }}>
                  E-mail
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
                  placeholder="E-mail"
                />
              </div>
              
              <div style={{ marginBottom: '16px' }}>
                <label htmlFor="password" style={{ 
                  display: 'block', 
                  marginBottom: '8px', 
                  fontSize: '14px',
                  fontWeight: '500',
                  color: 'white',
                  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
                }}>
                  Password
                </label>
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
              
              <div style={{ marginBottom: '16px' }}>
                <label htmlFor="confirmPassword" style={{ 
                  display: 'block', 
                  marginBottom: '8px', 
                  fontSize: '14px',
                  fontWeight: '500',
                  color: 'white',
                  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
                }}>
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
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
                  placeholder="Confirm Password"
                />
              </div>

              {error && (
                <div style={{ 
                  color: '#ff8080', 
                  marginBottom: '16px', 
                  fontSize: '14px',
                  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
                }}>{error}</div>
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
                  Create Account
                </button>
                <div style={{
                  marginTop: '16px',
                  textAlign: 'center'
                }}>
                  <Link href="/" style={{ 
                    color: '#6bc1ff', 
                    fontSize: '14px',
                    textDecoration: 'none',
                    transition: 'color 0.2s',
                    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.color = '#89d1ff'}
                  onMouseOut={(e) => e.currentTarget.style.color = '#6bc1ff'}>
                    Back to Login
                  </Link>
                </div>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SignUp() {
  return (
    <AuthProvider>
      <SignUpContent />
    </AuthProvider>
  );
} 