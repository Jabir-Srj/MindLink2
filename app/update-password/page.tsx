'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function UpdatePassword() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Check if we have a recovery token in the URL
    const checkSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      // If no session and no recovery token in URL, redirect to recovery page
      if (!session && !window.location.hash.includes('type=recovery')) {
        router.push('/recovery');
      }
    };

    checkSession();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (newPassword !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      setSuccessMessage('Password updated successfully!');
      setTimeout(() => {
        router.push('/');
      }, 2000);
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
        <div style={{ marginBottom: '16px' }}>
          <img
            src="/images/mindlink logo.png"
            alt="MindLink Logo"
            style={{ width: '80px', height: 'auto' }}
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
          Update your password
        </h1>

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
              <label htmlFor="newPassword" style={{ 
                display: 'block', 
                marginBottom: '8px', 
                fontSize: '14px',
                fontWeight: '500',
                color: 'white'
              }}>
                New Password:
              </label>
              <input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
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
                  outline: 'none'
                }}
                placeholder="Enter new password"
                required
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label htmlFor="confirmPassword" style={{ 
                display: 'block', 
                marginBottom: '8px', 
                fontSize: '14px',
                fontWeight: '500',
                color: 'white'
              }}>
                Confirm Password:
              </label>
              <input
                id="confirmPassword"
                type="password"
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
                  outline: 'none'
                }}
                placeholder="Confirm new password"
                required
              />
            </div>

            {error && (
              <div style={{ 
                color: '#ff8080', 
                marginBottom: '16px', 
                fontSize: '14px'
              }}>
                {error}
              </div>
            )}

            {successMessage && (
              <div style={{ 
                color: '#b9ffcb', 
                marginBottom: '16px', 
                fontSize: '14px'
              }}>
                {successMessage}
              </div>
            )}

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
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
            >
              Update Password
            </button>
          </form>
        </div>
      </div>
    </div>
  );
} 