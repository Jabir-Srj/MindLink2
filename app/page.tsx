'use client';

import { useState, useEffect, useRef } from "react";
import { supabase } from '@/lib/supabase';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import Login from '@/components/Login';
import MoodEntries from '@/components/MoodEntries';
import { useRouter } from 'next/navigation';
import gsap from "gsap";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import EmergencyButton from '@/components/EmergencyButton';
gsap.registerPlugin(ScrollToPlugin);

interface MoodEntry {
  id: string;
  date: string;
  mood: number;
  note: string;
  created_at: string;
  user_id: string;
}

type TabType = 'mood' | 'confession' | 'chat' | 'creative';

function MindLinkContent() {
  const { user, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('mood');
  const [moodEntries, setMoodEntries] = useState<MoodEntry[]>([]);
  const [currentMood, setCurrentMood] = useState(3);
  const [moodNote, setMoodNote] = useState("");
  const [confession, setConfession] = useState("");
  const [confessions, setConfessions] = useState<{ content: string, created_at: string, id: string }[]>([]);
  const [chatHistory, setChatHistory] = useState<{role: 'user'|'assistant', content: string, timestamp: string}[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [creativeDescription, setCreativeDescription] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [creativeUploads, setCreativeUploads] = useState<{ file_name: string, description: string, username: string, created_at: string, id: string }[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const ADMIN_EMAILS = ['yousefahmedhamada2006@gmail.com', 'jabirsrj8@gmail.com'];
  const router = useRouter();
  const homepageRef = useRef(null);
  const tabContentRef = useRef(null);
  const prevTab = useRef<TabType>('mood');

  const moodOptions = ["😢", "😕", "😐", "🙂", "😄"];

  const OPENROUTER_API_KEY = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY || '';

  const SYSTEM_PROMPT = `You are a supportive and empathetic AI peer supporter. Your role is to:
1. Listen actively and respond with understanding
2. Provide gentle guidance and encouragement
3. Share helpful coping strategies when appropriate
4. Maintain a warm, non-judgmental tone
5. Respect boundaries and avoid giving medical advice
6. Focus on emotional support and personal growth
7. If the user is feeling suicidal, link them to suicide prevention to international hotlines and resources as well as websites that can help them.
8. Always backup your responses with references to validated online research and/or to the user's mood entries`;

  const handleMoodSubmit = async () => {
    const newEntry = {
      date: new Date().toLocaleDateString(),
      mood: currentMood,
      note: moodNote,
      user_id: user?.id
    };
    
    try {
      const { data, error } = await supabase
        .from('mood_entries')
        .insert([newEntry])
        .select();
      
      if (error) {
        console.error('Error saving mood entry:', error);
        alert('Failed to save mood entry: ' + error.message);
        return;
      }
      
      if (data && data[0]) {
        console.log('Successfully saved mood entry:', data);
        setMoodEntries([...moodEntries, data[0]]);
        setMoodNote("");
        setCurrentMood(3);
      }
    } catch (error) {
      console.error('Error saving mood entry:', error);
      alert('Failed to save mood entry');
    }
  };

  const handleConfessionSubmit = async () => {
    try {
      const { data, error } = await supabase
        .from('confessions')
        .insert([{ 
          content: confession,
          user_id: user?.id
        }])
        .select();
      
      if (error) {
        console.error('Error posting confession:', error);
        alert('Failed to post confession: ' + error.message);
        return;
      }
      
      console.log('Successfully posted confession:', data);
      setConfession("");
      fetchConfessions();
    } catch (error) {
      console.error('Error posting confession:', error);
      alert('Failed to post confession');
    }
  };

  const handleDeleteConfession = async (confessionId: string) => {
    if (!isAdmin) return;
    try {
      console.log('Attempting to delete confession:', confessionId);
      
      // Try deletion with normal client
      let { error } = await supabase
        .from('confessions')
        .delete()
        .eq('id', confessionId);
      
      if (error) {
        console.error('Error deleting confession:', error);
        alert('Failed to delete confession: ' + error.message);
        return;
      }

      console.log('Delete request sent for confession:', confessionId);
      
      // Force update UI without waiting for server
      setConfessions(prevConfessions => 
        prevConfessions.filter(c => c.id !== confessionId)
      );
      
      // Wait a bit longer for Supabase to process
      setTimeout(async () => {
        await fetchConfessions();
      }, 2000);
    } catch (error) {
      console.error('Exception during confession deletion:', error);
      alert('Failed to delete confession');
    }
  };

  const handleDeleteCreative = async (uploadId: string, fileName: string) => {
    if (!isAdmin) return;
    try {
      console.log('Attempting to delete creative upload:', uploadId, fileName);
      
      // First delete from database
      let { error: dbError } = await supabase
        .from('creative_uploads')
        .delete()
        .eq('id', uploadId);
      
      if (dbError) {
        console.error('Error deleting upload record:', dbError);
        alert('Failed to delete upload record: ' + dbError.message);
        return;
      }
      
      console.log('Database record delete request sent');
      
      // Force update UI without waiting for server
      setCreativeUploads(prevUploads => 
        prevUploads.filter(u => u.id !== uploadId)
      );
      
      // Try to delete from storage
      try {
        await supabase.storage
          .from('creative-uploads')
          .remove([fileName]);
        
        console.log('Storage file delete request sent');
      } catch (storageError) {
        console.error('Error deleting file from storage:', storageError);
        // Continue since at least the database record is deleted
      }
      
      // Wait a bit longer for Supabase to process
      setTimeout(async () => {
        await fetchCreativeUploads();
      }, 2000);
    } catch (error) {
      console.error('Exception during creative upload deletion:', error);
      alert('Failed to delete creative upload');
    }
  };

  const fetchConfessions = async () => {
    try {
      console.log('Fetching confessions from Supabase...');
      const { data, error } = await supabase
        .from('confessions')
        .select('id, content, created_at')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching confessions:', error);
        return;
      }
      
      console.log(`Successfully fetched ${data?.length || 0} confessions`);
      setConfessions(data || []);
    } catch (error) {
      console.error('Exception during confession fetching:', error);
    }
  };

  const handleSendChat = async () => {
    if (!chatInput.trim()) return;
    const now = new Date();
    const userMsg = { role: 'user' as const, content: chatInput, timestamp: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    const newHistory = [...chatHistory, userMsg];
    setChatHistory(newHistory);
    setChatInput("");
    setChatLoading(true);
    try {
      const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.0-flash-001",
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            ...newHistory.map(m => ({ role: m.role, content: m.content }))
          ],
        }),
      });
      const data = await res.json();
      console.log('OpenRouter API response:', data);
      const aiNow = new Date();
      if (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) {
        setChatHistory(h => [...h, { role: 'assistant', content: data.choices[0].message.content, timestamp: aiNow.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
      } else if (data.error) {
        setChatHistory(h => [...h, { role: 'assistant', content: `Error: ${data.error.message || JSON.stringify(data.error)}`, timestamp: aiNow.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
      } else {
        setChatHistory(h => [...h, { role: 'assistant', content: "(No response)", timestamp: aiNow.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
      }
    } catch (err) {
      const aiNow = new Date();
      setChatHistory(h => [...h, { role: 'assistant', content: "Sorry, there was an error contacting the AI.", timestamp: aiNow.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
    } finally {
      setChatLoading(false);
    }
  }

  const handleCreativeSubmit = async (file: File) => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('creative-uploads')
        .upload(fileName, file);
      
      if (uploadError) {
        console.error('Error uploading file:', uploadError);
        alert('Failed to upload file: ' + uploadError.message);
        return;
      }
      
      const { data, error: dbError } = await supabase
        .from('creative_uploads')
        .insert([{
          file_name: fileName,
          description: creativeDescription,
          user_id: user?.id
        }])
        .select();
      
      if (dbError) {
        console.error('Error saving upload record:', dbError);
        alert('Failed to save upload record: ' + dbError.message);
        return;
      }
      
      console.log('Successfully uploaded creative content:', data);
      setCreativeDescription("");
      fetchCreativeUploads();
    } catch (error) {
      console.error('Error uploading creative content:', error);
      alert('Failed to upload creative content');
    }
  };

  const fetchCreativeUploads = async () => {
    try {
      console.log('Fetching creative uploads from Supabase...');
      const { data, error } = await supabase
        .from('creative_uploads')
        .select('id, file_name, description, created_at, user_id')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching creative uploads:', error);
        return;
      }
      
      console.log(`Successfully fetched ${data?.length || 0} creative uploads`);
      
      // Fetch usernames for each upload
      console.log('Fetching usernames for creative uploads...');
      const uploadsWithUsernames = await Promise.all((data || []).map(async (upload) => {
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('username')
          .eq('id', upload.user_id)
          .single();
        
        if (userError) {
          console.error('Error fetching username for upload ID:', upload.id, userError);
          return { ...upload, username: 'Anonymous' };
        }
        
        return { ...upload, username: userData?.username || 'Anonymous' };
      }));
      
      console.log('Setting creative uploads with usernames to state');
      setCreativeUploads(uploadsWithUsernames);
    } catch (error) {
      console.error('Exception during creative uploads fetching:', error);
    }
  };

  useEffect(() => {
    const fetchEntries = async () => {
      try {
        const { data: moodData, error: moodError } = await supabase
          .from('mood_entries')
          .select('*')
          .order('created_at', { ascending: false });

        if (moodError) {
          console.error('Error fetching mood entries:', moodError);
          return;
        }

        if (moodData) {
          setMoodEntries(moodData);
        }
      } catch (error) {
        console.error('Error fetching entries:', error);
      }
    };

    if (user) {
      fetchEntries();
    }
  }, [user]);

  useEffect(() => {
    gsap.set(window, { scrollTo: { y: window.scrollY, autoKill: false } });
    document.documentElement.style.scrollBehavior = 'auto';
    document.body.style.scrollBehavior = 'auto';
    // Optionally, you can add a scroll handler for smoother anchor navigation
    // or use gsap.to(window, { scrollTo: y, duration: 1, ease: 'power2.out' }) when needed
  }, []);

  // Clear chat on logout
  useEffect(() => {
    if (!user) {
      setChatHistory([]);
      setChatInput("");
    }
  }, [user]);

  // Zoom-in animation when user logs in
  useEffect(() => {
    if (user && homepageRef.current) {
      gsap.fromTo(
        homepageRef.current,
        { scale: 0.9, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.7, ease: 'power3.out' }
      );
    }
  }, [user]);

  // Tab sliding animation
  useEffect(() => {
    if (tabContentRef.current) {
      const direction =
        (prevTab.current === 'mood' && activeTab === 'confession') ||
        (prevTab.current === 'confession' && activeTab === 'chat') ||
        (prevTab.current === 'chat' && activeTab === 'creative') ||
        (prevTab.current === 'mood' && activeTab === 'chat') ||
        (prevTab.current === 'confession' && activeTab === 'creative') ||
        (prevTab.current === 'mood' && activeTab === 'creative')
          ? 1
          : -1;
      gsap.fromTo(
        tabContentRef.current,
        { x: 60 * direction, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.5, ease: 'power2.out' }
      );
      prevTab.current = activeTab;
    }
  }, [activeTab]);

  useEffect(() => {
    fetchConfessions();
  }, []);

  useEffect(() => {
    fetchCreativeUploads();
  }, []);

  useEffect(() => {
    if (user) {
      setIsAdmin(ADMIN_EMAILS.includes(user.email || ''));
    }
  }, [user]);

  if (!user) {
    return <Login />;
  }

  return (
    <div ref={homepageRef} style={{ 
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh',
      width: '100vw',
      background: 'linear-gradient(135deg, #1c3b70 0%, #4e2a84 50%, #1a6855 100%)',
      color: '#333',
      padding: 0,
      margin: 0,
      overflowX: 'hidden',
      position: 'absolute',
      left: 0,
      top: 0
    }}>
      <header style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        padding: '20px 20px 0 20px',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
        maxWidth: '1400px',
        margin: '0 auto'
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '20px',
          width: '100%'
        }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <img
              src="/images/mindlink logo.png"
              alt="MindLink Logo"
              style={{ width: '40px', height: 'auto', marginRight: '15px' }}
            />
            <h1 style={{ 
              fontSize: '24px', 
              color: 'white', 
              margin: 0,
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
            }}>MindLink</h1>
          </div>
          <div style={{ display: 'flex', gap: '15px' }}>
            <button 
              onClick={() => router.push('/profile')}
              style={{ 
                background: 'rgba(255, 255, 255, 0.1)',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                padding: '8px 15px',
                cursor: 'pointer',
                fontSize: '14px',
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
                whiteSpace: 'nowrap'
              }}
            >
              Profile
            </button>
            <button 
              onClick={() => router.push('/support')}
              style={{ 
                background: 'rgba(255, 255, 255, 0.1)',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                padding: '8px 15px',
                cursor: 'pointer',
                fontSize: '14px',
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
                whiteSpace: 'nowrap'
              }}
            >
              Support
            </button>
            <button 
              onClick={async () => {
                try {
                  if (user) {
                    console.log('Logging out...');
                    await signOut();
                    console.log('Signed out, redirecting...');
                    window.location.href = '/';
                  }
                } catch (err: any) {
                  console.warn('Sign out error:', err?.message || err);
                }
              }}
              style={{ 
                background: 'rgba(255, 255, 255, 0.1)',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                padding: '8px 15px',
                cursor: 'pointer',
                fontSize: '14px',
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
                whiteSpace: 'nowrap'
              }}
            >
              Logout
            </button>
          </div>
        </div>

        <div style={{
          width: '100%',
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          <div style={{ 
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '-1px',
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '4px 4px 0 0'
          }}>
            <button 
              onClick={() => setActiveTab('mood')} 
              style={{ 
                flex: 1,
                padding: '15px', 
                border: 'none', 
                background: activeTab === 'mood' ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
                color: 'white',
                cursor: 'pointer',
                transition: 'all 0.3s',
                borderBottom: activeTab === 'mood' ? '3px solid white' : '3px solid transparent',
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
                fontSize: '15px',
                fontWeight: activeTab === 'mood' ? '600' : 'normal',
                position: 'relative',
                minWidth: '200px'
              }}
            >
              Mood Diary
              {activeTab === 'mood' && (
                <div style={{
                  position: 'absolute',
                  bottom: '0',
                  left: '0',
                  right: '0',
                  height: '3px',
                  background: 'white',
                  borderRadius: '3px 3px 0 0'
                }} />
              )}
            </button>
            <button 
              onClick={() => setActiveTab('confession')} 
              style={{ 
                flex: 1,
                padding: '15px', 
                border: 'none', 
                background: activeTab === 'confession' ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
                color: 'white',
                cursor: 'pointer',
                transition: 'all 0.3s',
                borderBottom: activeTab === 'confession' ? '3px solid white' : '3px solid transparent',
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
                fontSize: '15px',
                fontWeight: activeTab === 'confession' ? '600' : 'normal',
                position: 'relative',
                minWidth: '200px'
              }}
            >
              Confession Wall
              {activeTab === 'confession' && (
                <div style={{
                  position: 'absolute',
                  bottom: '0',
                  left: '0',
                  right: '0',
                  height: '3px',
                  background: 'white',
                  borderRadius: '3px 3px 0 0'
                }} />
              )}
            </button>
            <button 
              onClick={() => setActiveTab('chat')} 
              style={{ 
                flex: 1,
                padding: '15px', 
                border: 'none', 
                background: activeTab === 'chat' ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
                color: 'white',
                cursor: 'pointer',
                transition: 'all 0.3s',
                borderBottom: activeTab === 'chat' ? '3px solid white' : '3px solid transparent',
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
                fontSize: '15px',
                fontWeight: activeTab === 'chat' ? '600' : 'normal',
                position: 'relative',
                minWidth: '200px'
              }}
            >
              Peer Support Chat
              {activeTab === 'chat' && (
                <div style={{
                  position: 'absolute',
                  bottom: '0',
                  left: '0',
                  right: '0',
                  height: '3px',
                  background: 'white',
                  borderRadius: '3px 3px 0 0'
                }} />
              )}
            </button>
            <button 
              onClick={() => setActiveTab('creative')} 
              style={{ 
                flex: 1,
                padding: '15px', 
                border: 'none', 
                background: activeTab === 'creative' ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
                color: 'white',
                cursor: 'pointer',
                transition: 'all 0.3s',
                borderBottom: activeTab === 'creative' ? '3px solid white' : '3px solid transparent',
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
                fontSize: '15px',
                fontWeight: activeTab === 'creative' ? '600' : 'normal',
                position: 'relative',
                minWidth: '200px'
              }}
            >
              Creative Space
              {activeTab === 'creative' && (
                <div style={{
                  position: 'absolute',
                  bottom: '0',
                  left: '0',
                  right: '0',
                  height: '3px',
                  background: 'white',
                  borderRadius: '3px 3px 0 0'
                }} />
              )}
            </button>
          </div>
        </div>
      </header>
      
      <div style={{
        width: '100%',
        maxWidth: '1200px',
        margin: '0 auto',
        background: 'white',
        overflow: 'hidden',
        boxShadow: '0 6px 16px rgba(0, 0, 0, 0.15)',
        flex: 1,
        display: 'flex',
        flexDirection: 'column'
      }}>
        <div ref={tabContentRef} style={{
          padding: '40px',
          flex: 1,
          display: 'flex',
          flexDirection: 'column'
        }}>
          {activeTab === 'mood' && (
            <div style={{
              padding: '60px 40px',
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}>
              <h2 style={{ 
                fontSize: '28px', 
                marginBottom: '40px', 
                color: '#333', 
                textAlign: 'center',
                fontWeight: '500',
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
              }}>Emoji Mood Diary</h2>
              
              <div style={{
                maxWidth: '700px',
                margin: '0 auto 60px auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '35px',
                width: '100%'
              }}>
                <div style={{ 
                  display: 'flex',
                  justifyContent: 'space-around', 
                  width: '100%',
                  padding: '10px 20px 30px 20px'
                }}>
                  {moodOptions.map((emoji, index) => (
                    <button 
                      key={index} 
                      onClick={() => setCurrentMood(index)}
                      style={{ 
                        border: 'none',
                        background: 'transparent',
                        borderRadius: '50%',
                        width: '70px',
                        height: '70px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '36px', 
                        cursor: 'pointer',
                        padding: '0',
                        position: 'relative',
                        outline: 'none'
                      }}
                    >
                      {emoji}
                      {currentMood === index && (
                        <div style={{
                          position: 'absolute',
                          top: '-5px',
                          left: '-5px',
                          right: '-5px',
                          bottom: '-5px',
                          borderRadius: '50%',
                          border: '2px solid #1c3b70',
                          pointerEvents: 'none'
                        }} />
                      )}
                    </button>
                  ))}
                </div>

                <textarea
                  placeholder="Optional note..."
                  value={moodNote}
                  onChange={e => setMoodNote(e.target.value)}
                  style={{ 
                    width: '100%',
                    height: '150px', 
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    background: 'white',
                    color: '#333',
                    padding: '16px',
                    resize: 'vertical',
                    fontSize: '16px',
                    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
                  }}
                />

                <div>
                  <button 
                    onClick={handleMoodSubmit}
                    style={{ 
                      padding: '12px 28px', 
                      border: 'none',
                      borderRadius: '4px',
                      background: '#0d1a33',
                      color: 'white',
                      cursor: 'pointer',
                      fontSize: '16px',
                      fontWeight: 'normal',
                      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
                    }}
                  >
                    Save Mood
                  </button>
                </div>
              </div>

              {moodEntries.length > 0 && (
                <div style={{ 
                  width: '90%', 
                  margin: '20px auto 0 auto',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  padding: '40px 0'
                }}>
                  <MoodEntries entries={moodEntries} />
                </div>
              )}
            </div>
          )}

          {activeTab === 'confession' && (
            <div style={{
              maxWidth: '800px',
              margin: '0 auto',
              padding: '20px',
              width: '100%',
              flex: 1,
              display: 'flex',
              flexDirection: 'column'
            }}>
              <h2 style={{ 
                fontSize: '28px', 
                marginBottom: '40px', 
                color: '#333', 
                textAlign: 'center',
                fontWeight: '500',
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
              }}>Confession Wall</h2>
              
              <div style={{
                background: 'white',
                borderRadius: '8px',
                padding: '24px',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                marginBottom: '30px'
              }}>
                <div style={{
                  border: '1px solid #ccc',
                  borderRadius: '8px',
                  padding: '30px',
                  marginBottom: '20px',
                  background: 'white',
                  minHeight: '120px'
                }}>
                  <textarea
                    placeholder="Share anonymously..."
                    value={confession}
                    onChange={e => setConfession(e.target.value)}
                    style={{ 
                      width: '100%',
                      border: 'none',
                      background: 'transparent',
                      color: '#333',
                      resize: 'none',
                      fontSize: '14px',
                      lineHeight: '1.4',
                      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
                      outline: 'none',
                      height: '60px'
                    }}
                  />
                </div>
                <button 
                  onClick={handleConfessionSubmit}
                  style={{ 
                    padding: '12px 24px', 
                    border: 'none',
                    borderRadius: '6px',
                    background: '#0d1a33',
                    color: 'white',
                    cursor: 'pointer',
                    fontSize: '16px',
                    fontWeight: '500',
                    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
                  }}
                >
                  Post Confession
                </button>
              </div>

              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '20px',
                flex: 1
              }}>
                {confessions.length === 0 && (
                  <div style={{ color: '#888', textAlign: 'center', fontSize: '16px' }}>No confessions yet. Be the first to share!</div>
                )}
                {confessions.map((c, idx) => (
                  <div key={idx} style={{
                    background: 'white',
                    borderRadius: '8px',
                    padding: '20px',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                    border: '1px solid #eee',
                    position: 'relative'
                  }}>
                    <p style={{ margin: 0, color: '#333', fontSize: '16px', whiteSpace: 'pre-line' }}>{c.content}</p>
                    <div style={{ fontSize: '13px', color: '#888', marginTop: '10px', textAlign: 'right' }}>{new Date(c.created_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</div>
                    {isAdmin && (
                      <button
                        onClick={() => handleDeleteConfession(c.id)}
                        style={{
                          position: 'absolute',
                          top: '10px',
                          right: '10px',
                          background: '#ff4444',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          padding: '4px 8px',
                          fontSize: '12px',
                          cursor: 'pointer',
                          opacity: 0.8,
                          transition: 'opacity 0.2s'
                        }}
                        onMouseOver={e => e.currentTarget.style.opacity = '1'}
                        onMouseOut={e => e.currentTarget.style.opacity = '0.8'}
                      >
                        Delete
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'chat' && (
            <div style={{
              maxWidth: '800px',
              margin: '0 auto',
              padding: '20px',
              width: '100%',
              flex: 1,
              display: 'flex',
              flexDirection: 'column'
            }}>
              <h2 style={{ 
                fontSize: '28px', 
                marginBottom: '40px', 
                color: '#333', 
                textAlign: 'center',
                fontWeight: '500',
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
              }}>Peer Support Chat</h2>

              <div style={{
                background: 'white',
                borderRadius: '8px',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                height: '700px',
                display: 'flex',
                flexDirection: 'column'
              }}>
                <div style={{
                  flex: 1,
                  overflowY: 'auto',
                  padding: '30px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '20px',
                  background: '#f9f9f9',
                }}>
                  {chatHistory.length === 0 && (
                    <div style={{ color: '#888', textAlign: 'center' }}>
                      Start a conversation with our AI Peer Supporter!
                    </div>
                  )}
                  {chatHistory.map((msg, idx) => {
                    // Replace markdown-style bold (**text**) with <strong>text</strong> for AI messages
                    let content = msg.content;
                    if (msg.role === 'assistant') {
                      content = content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                      // Convert URLs to clickable links
                      content = content.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>');
                    }
                    return (
                      <div
                        key={idx}
                        style={{
                          alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                          maxWidth: '70%',
                          background: msg.role === 'user' ? '#0d1a33' : '#f4f6fa',
                          color: msg.role === 'user' ? 'white' : '#222',
                          padding: '16px 20px',
                          borderRadius: msg.role === 'user'
                            ? '18px 18px 6px 18px'
                            : '18px 18px 18px 6px',
                          marginBottom: '14px',
                          fontSize: '17px',
                          wordBreak: 'break-word',
                          position: 'relative',
                          fontFamily: 'Inter, Segoe UI, Roboto, Arial, sans-serif',
                          fontWeight: msg.role === 'user' ? 600 : 400,
                          boxShadow: msg.role === 'user'
                            ? '0 2px 8px rgba(13,26,51,0.08)'
                            : '0 2px 8px rgba(44,62,80,0.06)',
                          border: msg.role === 'user' ? 'none' : '1px solid #e3e8ee',
                          textAlign: msg.role === 'user' ? 'right' : 'left',
                          letterSpacing: '0.01em',
                          lineHeight: 1.6,
                          transition: 'background 0.2s',
                        }}
                      >
                        <div style={{ whiteSpace: 'pre-line' }} dangerouslySetInnerHTML={{ __html: content }} />
                        <div style={{ fontSize: '12px', color: msg.role === 'user' ? '#b3d4fc' : '#888', marginTop: '8px', textAlign: msg.role === 'user' ? 'right' : 'left', fontWeight: 400, fontFamily: 'Inter, Segoe UI, Roboto, Arial, sans-serif' }}>{msg.timestamp}</div>
                      </div>
                    );
                  })}
                </div>

                <div style={{
                  borderTop: '1px solid #eee',
                  padding: '20px',
                  display: 'flex',
                  gap: '12px',
                  background: 'white',
                }}>
                  <textarea
                    placeholder="Type your message..."
                    value={chatInput}
                    onChange={e => setChatInput(e.target.value)}
                    style={{ 
                      flex: 1,
                      height: '50px', 
                      border: '1px solid #ddd',
                      borderRadius: '6px',
                      padding: '12px',
                      resize: 'none',
                      fontSize: '16px',
                      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
                    }}
                    onKeyDown={e => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        if (!chatLoading) handleSendChat();
                      }
                    }}
                    disabled={chatLoading}
                  />
                  <button 
                    onClick={handleSendChat}
                    style={{ 
                      padding: '12px 24px',
                      border: 'none',
                      borderRadius: '6px',
                      background: '#0d1a33',
                      color: 'white',
                      cursor: chatLoading ? 'not-allowed' : 'pointer',
                      fontSize: '16px',
                      fontWeight: '500',
                      whiteSpace: 'nowrap',
                      opacity: chatLoading ? 0.7 : 1,
                    }}
                    disabled={chatLoading}
                  >
                    {chatLoading ? 'Sending...' : 'Send'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'creative' && (
            <div style={{
              maxWidth: '800px',
              margin: '0 auto',
              padding: '20px',
              width: '100%',
              flex: 1,
              display: 'flex',
              flexDirection: 'column'
            }}>
              <h2 style={{ 
                fontSize: '28px', 
                marginBottom: '40px', 
                color: '#333', 
                textAlign: 'center',
                fontWeight: '500',
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
              }}>Creative Space</h2>

              <div style={{
                background: 'white',
                borderRadius: '8px',
                padding: '30px',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
                marginBottom: '30px',
                border: '1px solid #eee'
              }}>
                <div 
                  style={{
                    border: '2px dashed #ddd',
                    borderRadius: '8px',
                    padding: '40px 20px',
                    textAlign: 'center',
                    marginBottom: '25px',
                    background: '#fafafa',
                    cursor: 'pointer'
                  }}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const file = e.dataTransfer.files[0];
                    if (file) {
                      if (!file.type.startsWith('image/')) {
                        alert('Please upload an image file.');
                        return;
                      }
                      setSelectedFile(file);
                    }
                  }}
                >
                  <input
                    type="file"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        if (!file.type.startsWith('image/')) {
                          alert('Please upload an image file.');
                          e.target.value = '';
                          return;
                        }
                        setSelectedFile(file);
                        e.target.value = '';  // Reset the input after storing the file
                      }
                    }}
                    style={{ 
                      display: 'none'
                    }}
                    id="file-upload"
                    accept="image/*"
                  />
                  <label htmlFor="file-upload" style={{
                    cursor: 'pointer',
                    display: 'block'
                  }}>
                    <div style={{
                      fontSize: '16px',
                      color: '#333',
                      marginBottom: '8px'
                    }}>
                      {selectedFile ? selectedFile.name : 'Drop your image here or click to upload'}
                    </div>
                    <div style={{
                      fontSize: '14px',
                      color: '#666'
                    }}>
                      Only images are allowed
                    </div>
                  </label>
                </div>

                <div style={{
                  border: '1px solid #e0e0e0',
                  borderRadius: '8px',
                  padding: '20px',
                  marginBottom: '25px',
                  background: 'white',
                }}>
                  <textarea
                    placeholder="Describe your art..."
                    value={creativeDescription}
                    onChange={e => setCreativeDescription(e.target.value)}
                    style={{ 
                      width: '100%',
                      border: 'none',
                      background: 'transparent',
                      color: '#333',
                      resize: 'none',
                      fontSize: '14px',
                      lineHeight: '1.4',
                      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
                      outline: 'none'
                    }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                  {selectedFile && (
                    <button 
                      onClick={() => setSelectedFile(null)}
                      style={{ 
                        padding: '10px 20px',
                        border: '1px solid #ddd',
                        borderRadius: '6px',
                        background: 'white',
                        color: '#666',
                        cursor: 'pointer',
                        fontSize: '15px',
                        fontWeight: '500',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      Cancel
                    </button>
                  )}
                  <button 
                    onClick={() => {
                      if (selectedFile) {
                        handleCreativeSubmit(selectedFile);
                        setSelectedFile(null);
                      } else {
                        document.getElementById('file-upload')?.click();
                      }
                    }}
                    style={{ 
                      padding: '10px 20px',
                      border: 'none',
                      borderRadius: '6px',
                      background: '#0d1a33',
                      color: 'white',
                      cursor: 'pointer',
                      fontSize: '15px',
                      fontWeight: '500',
                      transition: 'background 0.2s ease'
                    }}
                  >
                    {selectedFile ? 'Share Creation' : 'Select File'}
                  </button>
                </div>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
                gap: '25px',
                padding: '0 5px'
              }}>
                {creativeUploads.length === 0 && (
                  <div style={{ color: '#888', textAlign: 'center', fontSize: '16px', gridColumn: '1 / -1' }}>No creative uploads yet. Be the first to share!</div>
                )}
                {creativeUploads.map((upload, idx) => (
                  <div key={idx} style={{
                    background: 'white',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                    border: '1px solid #eee',
                    position: 'relative'
                  }}>
                    <div 
                      onClick={() => setSelectedImage(supabase.storage.from('creative-uploads').getPublicUrl(upload.file_name).data.publicUrl)}
                      style={{
                        height: '200px',
                        background: '#f0f0f0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden',
                        cursor: 'pointer',
                      }}
                    >
                      <img
                        src={`${supabase.storage.from('creative-uploads').getPublicUrl(upload.file_name).data.publicUrl}`}
                        alt="Creative upload"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </div>
                    <div style={{ padding: '16px' }}>
                      <div style={{ fontSize: '16px', color: '#333', marginBottom: '8px' }}>{upload.description || 'Untitled'}</div>
                      <div style={{ fontSize: '14px', color: '#666' }}>Posted by {upload.username}</div>
                      <div style={{ fontSize: '12px', color: '#888', marginTop: '5px' }}>{new Date(upload.created_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</div>
                      {isAdmin && (
                        <button
                          onClick={() => handleDeleteCreative(upload.id, upload.file_name)}
                          style={{
                            position: 'absolute',
                            top: '10px',
                            right: '10px',
                            background: '#ff4444',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            padding: '4px 8px',
                            fontSize: '12px',
                            cursor: 'pointer',
                            opacity: 0.8,
                            transition: 'opacity 0.2s'
                          }}
                          onMouseOver={e => e.currentTarget.style.opacity = '1'}
                          onMouseOut={e => e.currentTarget.style.opacity = '0.8'}
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {selectedImage && (
                <div 
                  onClick={() => setSelectedImage(null)}
                  style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0, 0, 0, 0.8)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000,
                    cursor: 'pointer',
                  }}
                >
                  <div 
                    onClick={e => e.stopPropagation()}
                    style={{
                      position: 'relative',
                      maxWidth: '90%',
                      maxHeight: '90vh',
                      background: 'white',
                      padding: '20px',
                      borderRadius: '8px',
                      cursor: 'default',
                    }}
                  >
                    <img
                      src={selectedImage}
                      alt="Full size creative upload"
                      style={{
                        maxWidth: '100%',
                        maxHeight: 'calc(90vh - 40px)',
                        objectFit: 'contain',
                      }}
                    />
                    <button
                      onClick={() => setSelectedImage(null)}
                      style={{
                        position: 'absolute',
                        top: '-15px',
                        right: '-15px',
                        width: '30px',
                        height: '30px',
                        borderRadius: '50%',
                        background: '#ff4444',
                        color: 'white',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '18px',
                        fontWeight: 'bold',
                      }}
                    >
                      ×
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function MindLink() {
  return (
    <AuthProvider>
      <MindLinkContent />
      <EmergencyButton />
    </AuthProvider>
  );
} 