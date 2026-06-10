import React, { useEffect, useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import NavTop from '../components/NavTop';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config';

const MessagingPortal = () => {
  const { user, token } = useAuth();
  const location = useLocation();
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [activePartner, setActivePartner] = useState(null);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  
  const chatEndRef = useRef(null);

  // Fetch all messages and users
  const fetchMessagesAndUsers = async () => {
    if (!user?._id) return;
    try {
      setLoading(true);
      
      // Fetch messages for current user
      const msgRes = await fetch(`${API_BASE_URL}/api/messages/${user._id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!msgRes.ok) throw new Error('Failed to load messages');
      const msgData = await msgRes.json();
      // Backend returns newest first. Let's reverse to store chronologically, or keep it sorted.
      // We will sort them by date ascending when displaying.
      setMessages(msgData);

      // Fetch all system users to allow starting new chats
      const userRes = await fetch(`${API_BASE_URL}/api/users`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!userRes.ok) throw new Error('Failed to load users');
      const userData = await userRes.json();
      // Filter out the logged-in user themselves
      setUsers(userData.filter(u => u._id !== user._id));
      
      setLoading(false);
    } catch (err) {
      setError(err.message || 'Error loading messages');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessagesAndUsers();

    const pollInterval = setInterval(async () => {
      if (!user?._id) return;
      try {
        const msgRes = await fetch(`${API_BASE_URL}/api/messages/${user._id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (msgRes.ok) {
          const msgData = await msgRes.json();
          // Only update if there are new messages to prevent unnecessary scrolls/refreshes
          setMessages(prev => {
            if (prev.length === msgData.length && JSON.stringify(prev[0]) === JSON.stringify(msgData[0])) {
              return prev;
            }
            return msgData;
          });
        }
      } catch (err) {
        console.error("Failed to poll messages:", err);
      }
    }, 4000);

    return () => clearInterval(pollInterval);
  }, [user, token]);

  // Scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activePartner]);

  // Group messages by conversation partner to build the sidebar list
  const getConversations = () => {
    const convos = {};
    
    messages.forEach(msg => {
      const partner = msg.senderId._id === user._id ? msg.receiverId : msg.senderId;
      if (!partner?._id) return;
      
      if (!convos[partner._id]) {
        convos[partner._id] = {
          user: partner,
          lastMessage: msg.text,
          date: new Date(msg.createdAt),
          unread: !msg.isRead && msg.receiverId._id === user._id
        };
      } else {
        // If message is newer, update last message
        const msgDate = new Date(msg.createdAt);
        if (msgDate > convos[partner._id].date) {
          convos[partner._id].lastMessage = msg.text;
          convos[partner._id].date = msgDate;
        }
      }
    });

    return Object.values(convos).sort((a, b) => b.date - a.date);
  };

  // Filter messages for the active selected partner
  const getActiveMessages = () => {
    if (!activePartner) return [];
    
    return messages
      .filter(msg => 
        (msg.senderId._id === user._id && msg.receiverId._id === activePartner._id) ||
        (msg.senderId._id === activePartner._id && msg.receiverId._id === user._id)
      )
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)); // Oldest first
  };

  // Send message to backend
  const handleSend = async (e) => {
    if (e) e.preventDefault();
    if (!input.trim() || !activePartner) return;

    const payload = {
      senderId: user._id,
      receiverId: activePartner._id,
      text: input.trim()
    };

    try {
      const res = await fetch(`${API_BASE_URL}/api/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error('Failed to send message');
      
      const newMsg = await res.json();
      
      // Update local state directly so it feels responsive
      setMessages(prev => [newMsg, ...prev]); // Add to beginning (backend returns newest first)
      setInput('');
    } catch (err) {
      setError(err.message || 'Failed to send message');
    }
  };

  const conversations = getConversations();
  const activeMessages = getActiveMessages();

  // If no active partner is selected, default to the first conversation partner or state recipient
  useEffect(() => {
    if (location.state?.recipient) {
      setActivePartner(location.state.recipient);
    } else if (!activePartner && conversations.length > 0) {
      setActivePartner(conversations[0].user);
    }
  }, [conversations, activePartner, location.state]);

  const startNewChat = (partner) => {
    setActivePartner(partner);
    setShowNewChatModal(false);
    
    // If no existing conversation, add a placeholder or let them start typing
    const exists = conversations.some(c => c.user._id === partner._id);
    if (!exists) {
      // It will dynamically appear once the first message is sent
    }
  };

  return (
    <div className="h-screen overflow-hidden flex flex-col bg-slate-950 text-slate-100">
      <NavTop />
      
      <main className="flex-grow pt-20 pb-8 px-4 md:px-12 max-w-7xl mx-auto w-full h-[calc(100vh-80px)] overflow-hidden">
        <div className="glass-panel w-full h-full rounded-[30px] border border-slate-850 shadow-2xl flex overflow-hidden bg-slate-900/10">
          
          {/* Sidebar - Conversations List */}
          <aside className="w-full md:w-[360px] border-r border-slate-850 flex flex-col bg-slate-950/40 shrink-0">
            <div className="p-6 border-b border-slate-850 space-y-4">
              <div className="flex justify-between items-center">
                <h1 className="text-2xl font-black text-slate-100 tracking-tight">Messages</h1>
                <button 
                  onClick={() => setShowNewChatModal(true)}
                  className="w-10 h-10 rounded-full bg-primary/20 text-primary hover:bg-primary/30 flex items-center justify-center transition-colors"
                  title="New Conversation"
                >
                  <span className="material-symbols-outlined text-xl">chat_bubble</span>
                </button>
              </div>
            </div>
            
            <div className="flex-grow overflow-y-auto custom-scrollbar divide-y divide-slate-850">
              {loading && conversations.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-3"></div>
                  <p className="text-slate-500 text-xs">Loading chats...</p>
                </div>
              ) : conversations.length === 0 ? (
                <div className="text-center py-12 text-slate-500 text-xs px-6 space-y-2">
                  <p>No conversations found.</p>
                  <button 
                    onClick={() => setShowNewChatModal(true)}
                    className="text-primary font-bold hover:underline"
                  >
                    Start a conversation
                  </button>
                </div>
              ) : (
                conversations.map((convo) => {
                  const isActive = activePartner?._id === convo.user._id;
                  return (
                    <div 
                      key={convo.user._id}
                      onClick={() => setActivePartner(convo.user)}
                      className={`p-5 flex gap-4 cursor-pointer transition-colors ${
                        isActive ? 'bg-slate-900/60 border-l-4 border-primary' : 'hover:bg-slate-900/30'
                      }`}
                    >
                      <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-800 shrink-0 border border-slate-700">
                        <img src={convo.user.avatar} className="w-full h-full object-cover" alt={convo.user.name}/>
                      </div>
                      <div className="min-w-0 flex-grow">
                        <div className="min-w-0">
                          <span className="font-bold text-slate-100 text-sm truncate">{convo.user.name}</span>
                          <span className="text-[10px] text-slate-500">
                            {convo.date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                        <p className={`text-xs truncate ${convo.unread ? 'text-slate-100 font-bold' : 'text-slate-400'}`}>
                          {convo.lastMessage}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </aside>

          {/* Active Chat Section */}
          <section className="flex-grow flex flex-col bg-slate-900/20">
            {activePartner ? (
              <>
                {/* Chat Header */}
                <header className="h-20 px-6 border-b border-slate-850 flex items-center justify-between bg-slate-950/40 backdrop-blur-md">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-800 border border-slate-700">
                      <img src={activePartner.avatar} className="w-full h-full object-cover" alt={activePartner.name}/>
                    </div>
                    <div>
                      <h2 className="font-bold text-slate-100 text-sm">{activePartner.name}</h2>
                      <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">
                        {activePartner.role === 'landlord' ? 'Host Partner' : 'Traveler / Tenant'}
                      </p>
                    </div>
                  </div>
                </header>

                {/* Chat History Messages */}
                <div className="flex-grow p-6 overflow-y-auto custom-scrollbar flex flex-col gap-4 bg-slate-950/20">
                  {activeMessages.map((m) => {
                    const isSentByMe = m.senderId._id === user._id;
                    return (
                      <div 
                        key={m._id} 
                        className={`flex gap-3 max-w-[70%] ${isSentByMe ? 'ml-auto flex-row-reverse' : ''}`}
                      >
                        <div className={`p-3.5 shadow-md text-xs leading-relaxed ${
                          isSentByMe 
                            ? 'bg-primary text-white rounded-[18px] rounded-br-[4px]' 
                            : 'bg-slate-900 text-slate-100 border border-slate-850 rounded-[18px] rounded-bl-[4px]'
                        }`}>
                          {m.text}
                        </div>
                      </div>
                    );
                  })}
                  <div ref={chatEndRef} />
                </div>

                {/* Chat Footer Input */}
                <form 
                  onSubmit={handleSend}
                  className="p-6 bg-slate-950/40 border-t border-slate-850"
                >
                  <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 p-2 rounded-2xl focus-within:border-primary transition-colors">
                    <input 
                      value={input} 
                      onChange={e => setInput(e.target.value)}
                      className="flex-grow bg-transparent border-none focus:ring-0 text-xs text-white placeholder-slate-500 outline-none px-3" 
                      placeholder="Type your secure message..." 
                    />
                    <button 
                      type="submit"
                      className="bg-primary hover:bg-primary/90 text-white w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    >
                      <span className="material-symbols-outlined text-sm" style={{fontVariationSettings: "'FILL' 1"}}>send</span>
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div className="flex-grow flex items-center justify-center flex-col text-slate-500 space-y-4">
                <span className="material-symbols-outlined text-5xl">forum</span>
                <p className="text-sm">Select a conversation or start a new chat below.</p>
                <button 
                  onClick={() => setShowNewChatModal(true)}
                  className="bg-primary hover:bg-primary/90 text-white px-6 py-2.5 rounded-full font-bold text-xs"
                >
                  Start Conversation
                </button>
              </div>
            )}
          </section>
        </div>
      </main>

      {/* New Chat Selection Modal */}
      {showNewChatModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
          <div className="glass-panel bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-6">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-xl font-black text-slate-100">Start Conversation</h3>
              <button 
                onClick={() => setShowNewChatModal(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <div className="max-h-60 overflow-y-auto custom-scrollbar divide-y divide-slate-850">
              {users.length === 0 ? (
                <p className="text-slate-500 text-xs text-center py-4">No other members registered in RentEase.</p>
              ) : (
                users.map(u => (
                  <div 
                    key={u._id}
                    onClick={() => startNewChat(u)}
                    className="flex items-center gap-3 p-3 hover:bg-slate-950 rounded-xl cursor-pointer transition-colors"
                  >
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-800 border border-slate-700 shrink-0">
                      <img src={u.avatar} className="w-full h-full object-cover" alt={u.name}/>
                    </div>
                    <div>
                      <p className="font-bold text-white text-xs">{u.name}</p>
                      <p className="text-[10px] text-slate-500 capitalize">{u.role}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessagingPortal;