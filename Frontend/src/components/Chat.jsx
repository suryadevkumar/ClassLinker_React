import { useState, useEffect, useRef } from "react";
import { useChat } from "../utils/useChat";
import { useLocation } from "react-router-dom";
import { getSocket } from "../utils/socket";

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
    
    // Listen for connection events
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
      
      // Clear typing indicator
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
    
    // Clear existing timeout
    if (typingTimeout.current) {
      clearTimeout(typingTimeout.current);
    }
    
    // Set new timeout
    typingTimeout.current = setTimeout(() => {
      sendTyping(false, userName);
    }, 2000);
  };

  return (
    <div className="flex flex-col h-full border rounded-lg overflow-hidden">
      <div className="bg-blue-600 text-white p-4">
        <h2 className="text-xl font-bold">
          {subjectName || 'Subject Chat'} - {userName} ({userType})
        </h2>
      </div>

      <div className="flex-1 p-4 h-screen overflow-y-auto">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 mt-10">
            <p>No messages yet. Start the conversation!</p>
            <p className="text-xs mt-2">Subject: {subjectId} | User: {userId}</p>
          </div>
        ) : (
          messages.map((msg, index) => (
            <div
              key={`${msg[0]}-${index}`} // Use combination of chat_id and index
              className={`flex ${
                msg[1] === userId ? "justify-end" : "justify-start"
              } mb-3`}
            >
              <div
                className={`max-w-xs rounded-lg p-3 ${
                  msg[1] === userId ? "bg-blue-500 text-white" : "bg-gray-200"
                }`}
              >
                <div className="font-bold">{msg[5]} {msg[1] === userId ? '(You)' : ''}</div>
                <div>{msg[3]}</div>
                <div className="text-xs mt-1 opacity-80 float-end">
                  {new Date(msg[4]).toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))
        )}

        {typingUsers.length > 0 && (
          <div className="flex items-center p-2">
            {typingUsers.map((user) => (
              <div key={user.userId} className="flex items-center mr-3">
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
                  {user.userName} typing...
                </span>
              </div>
            ))}
          </div>
        )}

        <div ref={endRef} />
      </div>

      <form onSubmit={handleSubmit} className="border-t p-4">
        <div className="flex flex-col">
          <div className="flex mb-2">
            <input
              type="text"
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
                if (e.target.value.trim()) {
                  handleTyping();
                }
              }}
              className="flex-1 border rounded-l-lg px-4 py-2 focus:outline-none focus:border-blue-500"
              placeholder="Type your message..."
            />
            <button
              type="submit"
              disabled={!message.trim()}
              className="bg-blue-600 text-white px-4 py-2 rounded-r-lg hover:bg-blue-700 disabled:bg-gray-400"
            >
              Send
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Chat;