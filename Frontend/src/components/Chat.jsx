import React, { useState, useEffect, useRef } from 'react';
import { useChat } from '../utils/useChat';

const Chat = ({ sub_id, user_id, user_name, user_type }) => {
  const [message, setMessage] = useState('');
  const { messages, typingUsers, sendMessage, sendTyping } = useChat(sub_id, user_id);
  const endRef = useRef(null);
  const typingTimeout = useRef();

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    
    if (await sendMessage(message, user_name, user_type)) {
      setMessage('');
      sendTyping(false, user_name);
    }
  };

  const handleTyping = () => {
    sendTyping(true, user_name);
    clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {
      sendTyping(false, user_name);
    }, 2000);
  };

  return (
    <div className="flex flex-col h-full border rounded-lg overflow-hidden">
      <div className="bg-blue-600 text-white p-4">
        <h2 className="text-xl font-bold">Subject Chat</h2>
      </div>

      <div className="flex-1 p-4 overflow-y-auto">
        {messages.map(msg => (
          <div key={msg.chat_id} className={`flex ${msg.user_id === user_id ? 'justify-end' : 'justify-start'} mb-3`}>
            <div className={`max-w-xs rounded-lg p-3 ${msg.user_id === user_id ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>
              <div className="font-bold">{msg.user_name}</div>
              <div>{msg.message}</div>
              <div className="text-xs mt-1 opacity-80">
                {new Date(msg.time).toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}
        
        {typingUsers.length > 0 && (
          <div className="flex items-center p-2">
            {typingUsers.map(user => (
              <div key={user.user_id} className="flex items-center mr-3">
                <div className="flex space-x-1 mr-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
                <span className="text-sm text-gray-500">{user.user_name} typing...</span>
              </div>
            ))}
          </div>
        )}
        
        <div ref={endRef} />
      </div>

      <form onSubmit={handleSubmit} className="border-t p-4">
        <div className="flex">
          <input
            type="text"
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              handleTyping();
            }}
            className="flex-1 border rounded-l-lg px-4 py-2 focus:outline-none"
            placeholder="Type your message..."
          />
          <button 
            type="submit" 
            className="bg-blue-600 text-white px-4 py-2 rounded-r-lg hover:bg-blue-700"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
};

export default Chat;