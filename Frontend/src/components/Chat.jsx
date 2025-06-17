import { useState, useEffect, useRef } from "react";
import { useChat } from "../utils/useChat";
import { useLocation } from "react-router-dom";
import { getSocket } from "../utils/socket";
import { FaPaperPlane, FaEllipsisH, FaUser, FaUserTie, FaUserGraduate } from "react-icons/fa";

const Chat = () => {
  const location = useLocation();
  const subjectId = location.state?.subjectId;
  const subjectName = location.state?.subjectName;
  const userType = location.state?.userType;
  const userName = location.state?.userName;
  const userId = location.state?.userId;

  const [message, setMessage] = useState("");
  const { messages, typingUsers, sendMessage, sendTyping } = useChat(
    subjectId,
    userId
  );

  const endRef = useRef(null);
  const typingTimeout = useRef();

  // Debug socket connection
  useEffect(() => {
    const socket = getSocket();
    
    socket.on('connect', () => {
      console.log('Socket connected in chat component');
    });
    
    socket.on('disconnect', () => {
      console.log('Socket disconnected in chat component');
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
    };
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    
    const success = await sendMessage(message, userName, userType);
    
    if (success) {
      console.log('Message sent successfully');
      console.log('Messages after send:', messages.length);
      setMessage("");
      
      if (typingTimeout.current) {
        clearTimeout(typingTimeout.current);
      }
      sendTyping(false, userName);
    } else {
      console.error('Failed to send message');
    }
  };

  const handleTyping = () => {
    sendTyping(true, userName);
    
    if (typingTimeout.current) {
      clearTimeout(typingTimeout.current);
    }
    
    typingTimeout.current = setTimeout(() => {
      sendTyping(false, userName);
    }, 2000);
  };

  const getUserIcon = (type) => {
    switch(type) {
      case 'teacher': return <FaUserTie className="inline mr-1" />;
      case 'student': return <FaUserGraduate className="inline mr-1" />;
      default: return <FaUser className="inline mr-1" />;
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] bg-gray-50">
      {/* Header */}
      <div className="bg-blue-600 text-white p-4 shadow-md">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold">
            {subjectName || 'Subject Chat'}
          </h2>
          <div className="flex items-center space-x-2">
            <span className="bg-blue-500 px-2 py-1 rounded text-sm">
              {getUserIcon(userType.toLowerCase())}
              {userName} ({userType})
            </span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 p-4 overflow-y-auto bg-gray-100">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <FaEllipsisH className="text-4xl mb-4 animate-pulse" />
            <p className="text-lg">No messages yet</p>
            <p className="text-sm mt-1">Start the conversation!</p>
            <p className="text-xs mt-4 opacity-70">Subject: {subjectId} | User: {userId}</p>
          </div>
        ) : (
          messages.map((msg, index) => (
            <div
              key={`${msg[0]}-${index}`}
              className={`flex ${msg[1] === userId ? "justify-end" : "justify-start"} mb-3`}
            >
              <div
                className={`max-w-xs lg:max-w-md rounded-lg p-3 shadow ${
                  msg[1] === userId 
                    ? "bg-blue-500 text-white rounded-br-none" 
                    : "bg-white text-gray-800 rounded-bl-none"
                }`}
              >
                <div className="font-bold flex items-center">
                  {getUserIcon(msg[6]?.toLowerCase() || 'user')}
                  {msg[5]} {msg[1] === userId ? '(You)' : ''}
                </div>
                <div className="my-1">{msg[3]}</div>
                <div className="text-xs opacity-80 text-right">
                  {new Date(msg[4]).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))
        )}

        {typingUsers.length > 0 && (
          <div className="flex items-center p-2">
            {typingUsers.map((user) => (
              <div key={user.userId} className="flex items-center mr-3 bg-white px-3 py-1 rounded-full shadow">
                <div className="flex space-x-1 mr-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.4s" }}
                  ></div>
                </div>
                <span className="text-sm text-gray-500">
                  {user.userName} is typing...
                </span>
              </div>
            ))}
          </div>
        )}

        <div ref={endRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="border-t bg-white p-4 shadow-inner">
        <div className="flex">
          <input
            type="text"
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              if (e.target.value.trim()) {
                handleTyping();
              }
            }}
            className="flex-1 border border-gray-300 rounded-l-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Type your message..."
          />
          <button
            type="submit"
            disabled={!message.trim()}
            className="bg-blue-600 text-white px-4 py-3 rounded-r-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors duration-200 flex items-center justify-center w-16"
          >
            <FaPaperPlane />
          </button>
        </div>
      </form>
    </div>
  );
};

export default Chat;