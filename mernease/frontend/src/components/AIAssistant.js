import React, { useState, useRef, useEffect } from 'react';

const AIAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Hi! I\'m your RentEase AI assistant. I can help you find properties, answer questions, or suggest destinations. What are you looking for?'
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const quickActions = [
    { icon: 'home', text: 'Find a villa', query: 'Show me luxury villas' },
    { icon: 'location_on', text: 'Beach properties', query: 'I want beachfront properties' },
    { icon: 'family_restroom', text: 'Family friendly', query: 'Properties good for families with kids' },
    { icon: 'savings', text: 'Budget options', query: 'What are affordable properties under $200/night?' }
  ];

  const getAIResponse = async (userMessage) => {
    // Simple rule-based AI for demo (can be replaced with OpenAI API)
    const message = userMessage.toLowerCase();
    
    if (message.includes('villa') || message.includes('luxury')) {
      return {
        content: '🏰 I found some amazing luxury villas for you:\n\n• Azure Heights Villa in Santorini - $1,250/night\n• L\'Haussmann Prestige in Paris - $450/night\n\nThese properties feature pools, chef services, and stunning views. Would you like to see more details?',
        suggestions: ['Show me Santorini villa', 'What about Paris?', 'Show all villas']
      };
    }
    
    if (message.includes('beach') || message.includes('ocean') || message.includes('sea')) {
      return {
        content: '🏖️ Perfect! Here are beachfront properties:\n\n• Mediterranean Villa in Greece - Ocean views, private beach access\n• Coastal Retreat in Malibu - Right on the sand\n\nAll include beach equipment and water sports. Want to filter by price range?',
        suggestions: ['Under $500/night', 'Luxury beachfront', 'Show photos']
      };
    }
    
    if (message.includes('family') || message.includes('kids') || message.includes('children')) {
      return {
        content: '👨‍👩‍👧‍👦 Great choice! Family-friendly properties:\n\n• Spacious 4-bedroom house with playground\n• Villa with pool and kids\' club nearby\n• Apartments near family attractions\n\nAll have safety features and child amenities. Need specific locations?',
        suggestions: ['Near theme parks', 'With pool', 'Show family villas']
      };
    }
    
    if (message.includes('budget') || message.includes('cheap') || message.includes('affordable') || message.includes('$')) {
      return {
        content: '💰 Budget-friendly options:\n\n• Cozy apartments from $80/night\n• Studio lofts from $120/night\n• Shared villas from $150/night\n\nAll verified and highly rated. Want to see specific locations?',
        suggestions: ['Show apartments', 'Paris options', 'Filter by city']
      };
    }
    
    if (message.includes('paris') || message.includes('france')) {
      return {
        content: '🗼 Paris properties available:\n\n• L\'Haussmann Prestige in Le Marais - $450/night\n• Eiffel Sky Garden with tower views - $820/night\n• Montmartre Loft - $320/night\n\nAll centrally located with metro access. Interested in any?',
        suggestions: ['Show Marais property', 'Eiffel view details', 'More Paris options']
      };
    }
    
    if (message.includes('greece') || message.includes('santorini')) {
      return {
        content: '🇬🇷 Santorini properties:\n\n• Azure Heights Villa - $1,250/night - Infinity pool, chef\n• Oia Sunset Apartment - $380/night\n• Caldera View Suite - $650/night\n\nAll have breathtaking Aegean Sea views. Ready to book?',
        suggestions: ['Azure Heights details', 'Show Oia property', 'Compare prices']
      };
    }
    
    if (message.includes('book') || message.includes('reserve') || message.includes('dates')) {
      return {
        content: '📅 I can help you book! What dates are you thinking? Or would you like to:\n\n• Check availability\n• Get instant booking\n• Request special arrangements\n\nJust let me know your travel dates and preferences.',
        suggestions: ['Check availability', 'This weekend', 'Next month']
      };
    }
    
    if (message.includes('amenities') || message.includes('pool') || message.includes('wifi') || message.includes('kitchen')) {
      return {
        content: '✨ Properties with premium amenities:\n\n• Private pools: 15 properties\n• High-speed WiFi: All properties\n• Full kitchens: 22 properties\n• Gym access: 8 properties\n\nWhich amenity is most important for you?',
        suggestions: ['Pool required', 'Kitchen essential', 'Show all amenities']
      };
    }
    
    if (message.includes('thank') || message.includes('thanks')) {
      return {
        content: '😊 You\'re welcome! Is there anything else I can help you with? I can assist with:\n\n• Property searches\n• Booking assistance\n• Travel recommendations\n• Local tips',
        suggestions: ['Find more properties', 'Help with booking', 'Travel tips']
      };
    }
    
    // Default response
    return {
      content: '🤔 I can help you with:\n\n• Finding luxury properties\n• Searching by location\n• Budget-friendly options\n• Family accommodations\n• Beach/mountain properties\n• Booking assistance\n\nWhat would you like to explore?',
      suggestions: ['Show luxury villas', 'Budget options', 'Beachfront properties', 'Help me choose']
    };
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Simulate AI thinking
    setTimeout(async () => {
      const aiResponse = await getAIResponse(input);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: aiResponse.content,
        suggestions: aiResponse.suggestions 
      }]);
      setIsTyping(false);
    }, 1000);
  };

  const handleQuickAction = (query) => {
    setInput(query);
    setTimeout(() => handleSend(), 100);
  };

  const handleSuggestion = (suggestion) => {
    setInput(suggestion);
    setTimeout(() => handleSend(), 100);
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-gradient-to-br from-primary to-purple-600 text-white rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all duration-300 flex items-center justify-center group"
      >
        {isOpen ? (
          <span className="material-symbols-outlined">close</span>
        ) : (
          <span className="material-symbols-outlined animate-pulse">smart_toy</span>
        )}
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></span>
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-96 h-[600px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-outline-variant">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary to-purple-600 text-white p-4 flex items-center gap-3">
            <div className="relative">
              <span className="material-symbols-outlined text-3xl">smart_toy</span>
              <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></span>
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-lg">AI Assistant</h3>
              <p className="text-xs text-white/80">Online • Ready to help</p>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-1 rounded-lg transition-all">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-surface">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] ${msg.role === 'user' ? 'order-2' : 'order-1'}`}>
                  {msg.role === 'assistant' && (
                    <div className="flex items-center gap-2 mb-1">
                      <span className="material-symbols-outlined text-primary text-sm">smart_toy</span>
                      <span className="text-xs text-secondary font-bold">AI Assistant</span>
                    </div>
                  )}
                  <div
                    className={`p-3 rounded-2xl ${
                      msg.role === 'user'
                        ? 'bg-primary text-white rounded-br-none'
                        : 'bg-white border border-outline-variant rounded-bl-none'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-line">{msg.content}</p>
                  </div>
                  {msg.suggestions && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {msg.suggestions.map((sug, i) => (
                        <button
                          key={i}
                          onClick={() => handleSuggestion(sug)}
                          className="text-xs px-3 py-1 bg-primary/10 text-primary rounded-full hover:bg-primary/20 transition-all"
                        >
                          {sug}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white border border-outline-variant p-3 rounded-2xl rounded-bl-none">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-primary rounded-full animate-bounce"></span>
                    <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                    <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Actions */}
          {messages.length <= 1 && (
            <div className="px-4 py-2 bg-surface border-t border-outline-variant">
              <p className="text-xs text-secondary mb-2 font-bold">Quick actions:</p>
              <div className="grid grid-cols-2 gap-2">
                {quickActions.map((action, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleQuickAction(action.query)}
                    className="flex items-center gap-2 p-2 bg-white rounded-lg hover:bg-primary/5 transition-all text-left border border-outline-variant"
                  >
                    <span className="material-symbols-outlined text-primary text-lg">{action.icon}</span>
                    <span className="text-xs font-medium">{action.text}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="p-4 border-t border-outline-variant bg-white">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask me anything..."
                className="flex-1 px-4 py-2 border border-outline-variant rounded-full focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim()}
                className="w-10 h-10 bg-primary text-white rounded-full hover:opacity-90 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                <span className="material-symbols-outlined">send</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AIAssistant;
