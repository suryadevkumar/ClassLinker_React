import { useState, useRef } from 'react';
import { useChat } from '../utils/useChat';

const SubjectChat = ({ subjectId, subjectName, user }) => {
  const [message, setMessage] = useState('');
  const messageInputRef = useRef(null);
  
  const {
    messages,
    participants,
    loading,
    error,
    sendMessage,
    messagesEndRef
  } = useChat(subjectId, user);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    
    sendMessage(message);
    setMessage('');
    messageInputRef.current.focus();
  };

  if (loading) return <div className="p-4 text-center">Loading chat...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar with participants */}
      <div className="w-64 bg-white border-r border-gray-200 p-4 hidden md:block">
        <h2 className="text-lg font-semibold mb-4">Participants</h2>
        <div className="space-y-2">
          {participants.map((participant) => (
            <div key={`${participant.id}-${participant.type}`} className="flex items-center p-2 hover:bg-gray-50 rounded">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-2 ${
                participant.type === 'teacher' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'
              }`}>
                {participant.name.charAt(0)}
              </div>
              <div>
                <p className="font-medium">{participant.name}</p>
                <p className="text-xs text-gray-500 capitalize">{participant.type}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main chat area */}
      <div className="flex-1 flex flex-col">
        {/* Chat header */}
        <div className="bg-white border-b border-gray-200 p-4">
          <h1 className="text-xl font-semibold">{subjectName}</h1>
          <p className="text-sm text-gray-500">
            {participants.length} participant{participants.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.chatId}
              className={`flex ${msg.userId === user.id && msg.userType === user.type ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs md:max-w-md lg:max-w-lg rounded-lg p-3 ${
                  msg.userId === user.id && msg.userType === user.type
                    ? 'bg-blue-500 text-white'
                    : msg.userType === 'teacher'
                    ? 'bg-gray-200'
                    : 'bg-green-100'
                }`}
              >
                <div className="flex items-center mb-1">
                  <span className="font-semibold mr-2">{msg.userName}</span>
                  <span className="text-xs opacity-80">
                    {new Date(msg.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="break-words">{msg.message}</p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Message input */}
        <div className="bg-white border-t border-gray-200 p-4">
          <form onSubmit={handleSubmit} className="flex space-x-2">
            <input
              type="text"
              ref={messageInputRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="bg-blue-500 text-white rounded-full px-4 py-2 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SubjectChat;