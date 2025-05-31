'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { AuthProvider } from '@/lib/AuthContext';

function PasswordRecoveryContent() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'https://mind-link-dv6l.vercel.app/update-password',
      });
      
      if (error) {
        throw error;
      }
      
      // Show success message
      setSuccessMessage(`Password reset instructions have been sent to ${email}. Please check your email to continue.`);
      // Clear the form
      setEmail('');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
    }
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
          Reset your password
        </h1>
        
        {successMessage ? (
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
              <Link href="/" style={{ 
                color: '#6bc1ff', 
                fontSize: '14px',
                textDecoration: 'none',
                transition: 'color 0.2s',
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
              }}
              onMouseOver={(e) => e.currentTarget.style.color = '#89d1ff'}
              onMouseOut={(e) => e.currentTarget.style.color = '#6bc1ff'}>
                Return to Login
              </Link>
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
            <form onSubmit={handleSubmit} style={{ textAlign: 'left' }}>
              <div style={{ marginBottom: '20px' }}>
                <label htmlFor="email" style={{ 
                  display: 'block', 
                  marginBottom: '8px', 
                  fontSize: '14px',
                  fontWeight: '500',
                  color: 'white',
                  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
                }}>
                  Enter your email address:
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

              {error && (
                <div style={{ 
                  color: '#ff8080', 
                  marginBottom: '16px', 
                  fontSize: '14px',
                  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
                }}>{error}</div>
              )}

              <div style={{ 
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                marginTop: '16px'
              }}>
                <div style={{ textAlign: 'center' }}>
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
                    Send Recovery Email
                  </button>
                </div>
                <div style={{
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

export default function PasswordRecovery() {
  return (
    <AuthProvider>
      <PasswordRecoveryContent />
    </AuthProvider>
  );
} 