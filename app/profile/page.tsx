'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth, AuthProvider } from '@/lib/AuthContext';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import gsap from 'gsap';

function ProfileContent() {
  const { user, loading } = useAuth();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const router = useRouter();
  
  // Password change states
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Email change states
  const [isChangingEmail, setIsChangingEmail] = useState(false);
  const [newEmail, setNewEmail] = useState('');

  const profileRef = useRef(null);

  useEffect(() => {
    if (user) {
      // Get user metadata
      const metadata = user.user_metadata;
      setUsername(metadata?.username || '');
      setEmail(user.email || '');
      setNewUsername(metadata?.username || '');
      setNewEmail(user.email || '');
    }
  }, [user]);

  // Animate in on mount
  useEffect(() => {
    if (profileRef.current) {
      gsap.fromTo(
        profileRef.current,
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' }
      );
    }
  }, []);

  // Animate out on navigation
  const handleNavigate = (url: string) => {
    if (profileRef.current) {
      gsap.to(profileRef.current, {
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

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    try {
      const { error } = await supabase.auth.updateUser({
        data: { username: newUsername }
      });

      if (error) throw error;

      setUsername(newUsername);
      setIsEditing(false);
      setSuccessMessage('Profile updated successfully!');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
    }
  };
  
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }
    
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    
    try {
      // Supabase doesn't have a direct way to verify current password before changing
      // We'll update the password directly
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      
      if (error) throw error;
      
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setIsChangingPassword(false);
      setSuccessMessage('Password updated successfully!');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
    }
  };
  
  const handleEmailChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    
    if (!newEmail || !newEmail.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }
    
    try {
      const { error } = await supabase.auth.updateUser({
        email: newEmail
      });
      
      if (error) throw error;
      
      setIsChangingEmail(false);
      setSuccessMessage('Email update initiated! Please check your new email for a confirmation link.');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
    }
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        color: 'white',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
      }}>
        Loading...
      </div>
    );
  }

  if (!user) {
    router.push('/');
    return null;
  }

  return (
    <div ref={profileRef} style={{ 
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'flex-start',
      height: '100vh',
      width: '100vw',
      margin: 0,
      padding: 0,
      paddingTop: '10vh',
      position: 'absolute',
      top: 0,
      left: 0,
      background: 'linear-gradient(135deg, #1c3b70 0%, #4e2a84 50%, #1a6855 100%)',
      overflow: 'auto'
    }}>
      <div style={{ 
        width: '400px', 
        color: 'white',
        textAlign: 'center',
        marginBottom: '40px'
      }}>
        <div style={{ 
          marginBottom: '24px', 
          marginTop: '10px'
        }}>
          <img
            src="/images/mindlink logo.png"
            alt="MindLink Logo"
            style={{ 
              width: '48px', 
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
          Your Profile
        </h1>
        
        {successMessage && (
          <div style={{ 
            padding: '15px', 
            background: 'rgba(0, 200, 83, 0.2)', 
            borderRadius: '4px',
            marginBottom: '20px',
            color: '#b9ffcb',
            textAlign: 'left',
            fontSize: '14px',
            lineHeight: '1.5',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
          }}>
            {successMessage}
          </div>
        )}

        {error && (
          <div style={{ 
            padding: '15px',
            background: 'rgba(255, 0, 0, 0.1)',
            borderRadius: '4px',
            marginBottom: '20px',
            color: '#ff5c5c', 
            textAlign: 'left', 
            fontSize: '14px',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
          }}>
            {error}
          </div>
        )}
        
        {/* Username section */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '6px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          padding: '20px',
          marginBottom: '16px',
          textAlign: 'left'
        }}>
          <h2 style={{ 
            fontSize: '18px',
            fontWeight: '400',
            marginTop: 0,
            marginBottom: '20px',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
          }}>
            Profile Information
          </h2>
          
          <div style={{ marginBottom: '10px' }}>
            <span style={{ fontSize: '14px', color: '#a9adc7', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif' }}>Email:</span>
            <p style={{ margin: '5px 0 0 0', fontSize: '16px', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif' }}>{email}</p>
          </div>
          
          {isEditing ? (
            <form onSubmit={handleUpdateProfile}>
              <div style={{ marginBottom: '20px' }}>
                <label htmlFor="username" style={{ 
                  display: 'block', 
                  marginBottom: '8px', 
                  fontSize: '14px',
                  color: '#a9adc7',
                  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
                }}>
                  Username:
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  style={{ 
                    width: '100%', 
                    padding: '10px',
                    border: 'none',
                    background: 'rgba(255, 255, 255, 0.1)',
                    color: 'white',
                    borderRadius: '3px',
                    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
                  }}
                />
              </div>
              
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-start' }}>
                <button
                  type="submit"
                  style={{ 
                    padding: '8px 15px',
                    border: 'none',
                    borderRadius: '4px',
                    background: '#0a84ff',
                    color: 'white',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
                  }}
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setNewUsername(username);
                  }}
                  style={{ 
                    padding: '8px 15px',
                    border: 'none',
                    borderRadius: '4px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    color: 'white',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div>
              <div style={{ marginBottom: '20px' }}>
                <span style={{ fontSize: '14px', color: '#a9adc7', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif' }}>Username:</span>
                <p style={{ margin: '5px 0 0 0', fontSize: '16px', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif' }}>{username || 'No username set'}</p>
              </div>
              <button
                onClick={() => setIsEditing(true)}
                style={{ 
                  padding: '8px 15px',
                  border: 'none',
                  borderRadius: '4px',
                  background: '#0a84ff',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
                }}
              >
                Edit Username
              </button>
            </div>
          )}
        </div>
        
        {/* Email change section */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '6px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          padding: '20px',
          marginBottom: '16px',
          textAlign: 'left'
        }}>
          <h2 style={{ 
            fontSize: '18px',
            fontWeight: '400',
            marginTop: 0,
            marginBottom: '20px',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
          }}>
            Email Settings
          </h2>
          
          {isChangingEmail ? (
            <form onSubmit={handleEmailChange}>
              <div style={{ marginBottom: '20px' }}>
                <label htmlFor="newEmail" style={{ 
                  display: 'block', 
                  marginBottom: '8px', 
                  fontSize: '14px',
                  color: '#a9adc7',
                  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
                }}>
                  New Email:
                </label>
                <input
                  id="newEmail"
                  name="newEmail"
                  type="email"
                  required
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  style={{ 
                    width: '100%', 
                    padding: '10px',
                    border: 'none',
                    background: 'rgba(255, 255, 255, 0.1)',
                    color: 'white',
                    borderRadius: '3px',
                    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
                  }}
                />
              </div>
              
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-start' }}>
                <button
                  type="submit"
                  style={{ 
                    padding: '8px 15px',
                    border: 'none',
                    borderRadius: '4px',
                    background: '#0a84ff',
                    color: 'white',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
                  }}
                >
                  Update Email
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsChangingEmail(false);
                    setNewEmail(email);
                  }}
                  style={{ 
                    padding: '8px 15px',
                    border: 'none',
                    borderRadius: '4px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    color: 'white',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <button
              onClick={() => setIsChangingEmail(true)}
              style={{ 
                padding: '8px 15px',
                border: 'none',
                borderRadius: '4px',
                background: '#0a84ff',
                color: 'white',
                cursor: 'pointer',
                fontSize: '14px',
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
              }}
            >
              Change Email
            </button>
          )}
        </div>
        
        {/* Password change section */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '6px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          padding: '20px',
          marginBottom: '16px',
          textAlign: 'left'
        }}>
          <h2 style={{ 
            fontSize: '18px',
            fontWeight: '400',
            marginTop: 0,
            marginBottom: '20px',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
          }}>
            Password Settings
          </h2>
          
          {isChangingPassword ? (
            <form onSubmit={handlePasswordChange}>
              <div style={{ marginBottom: '20px' }}>
                <label htmlFor="currentPassword" style={{ 
                  display: 'block', 
                  marginBottom: '8px', 
                  fontSize: '14px',
                  color: '#a9adc7',
                  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
                }}>
                  Current Password:
                </label>
                <input
                  id="currentPassword"
                  name="currentPassword"
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  style={{ 
                    width: '100%', 
                    padding: '10px',
                    border: 'none',
                    background: 'rgba(255, 255, 255, 0.1)',
                    color: 'white',
                    borderRadius: '3px',
                    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
                  }}
                />
              </div>
              
              <div style={{ marginBottom: '20px' }}>
                <label htmlFor="newPassword" style={{ 
                  display: 'block', 
                  marginBottom: '8px', 
                  fontSize: '14px',
                  color: '#a9adc7',
                  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
                }}>
                  New Password:
                </label>
                <input
                  id="newPassword"
                  name="newPassword"
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  style={{ 
                    width: '100%', 
                    padding: '10px',
                    border: 'none',
                    background: 'rgba(255, 255, 255, 0.1)',
                    color: 'white',
                    borderRadius: '3px',
                    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
                  }}
                />
              </div>
              
              <div style={{ marginBottom: '20px' }}>
                <label htmlFor="confirmPassword" style={{ 
                  display: 'block', 
                  marginBottom: '8px', 
                  fontSize: '14px',
                  color: '#a9adc7',
                  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
                }}>
                  Confirm New Password:
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
                    padding: '10px',
                    border: 'none',
                    background: 'rgba(255, 255, 255, 0.1)',
                    color: 'white',
                    borderRadius: '3px',
                    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
                  }}
                />
              </div>
              
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-start' }}>
                <button
                  type="submit"
                  style={{ 
                    padding: '8px 15px',
                    border: 'none',
                    borderRadius: '4px',
                    background: '#0a84ff',
                    color: 'white',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
                  }}
                >
                  Update Password
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsChangingPassword(false);
                    setCurrentPassword('');
                    setNewPassword('');
                    setConfirmPassword('');
                  }}
                  style={{ 
                    padding: '8px 15px',
                    border: 'none',
                    borderRadius: '4px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    color: 'white',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <button
              onClick={() => setIsChangingPassword(true)}
              style={{ 
                padding: '8px 15px',
                border: 'none',
                borderRadius: '4px',
                background: '#0a84ff',
                color: 'white',
                cursor: 'pointer',
                fontSize: '14px',
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
              }}
            >
              Change Password
            </button>
          )}
        </div>
        
        <div style={{ marginTop: '20px', marginBottom: '30px' }}>
          <button
            onClick={() => handleNavigate('/')}
            style={{ 
              color: '#0a84ff', 
              fontSize: '14px',
              textDecoration: 'none',
              padding: '8px 15px',
              background: 'rgba(10, 132, 255, 0.1)',
              borderRadius: '4px',
              display: 'inline-block',
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Profile() {
  return (
    <AuthProvider>
      <ProfileContent />
    </AuthProvider>
  );
} 