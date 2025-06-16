import { useEffect, useState } from 'react';
import { getSocket } from '../utils/socket';
import axios from 'axios';

export const useChat = (sub_id, user_id) => {
  const [messages, setMessages] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  
  // Get socket instance
  const socket = getSocket();

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await axios.get(`/chat/messages?sub_id=${sub_id}`);
        console.log('Fetched messages:', res.data);
        setMessages(res.data);
      } catch (err) {
        console.error('Error fetching messages:', err);
      }
    };

    if (sub_id) {
      fetchMessages();
    }
  }, [sub_id]);

  useEffect(() => {
    if (!sub_id || !socket) return;

    // Wait for socket to connect before joining room
    const joinRoom = () => {
      socket.emit('join_subject', { sub_id, user_id });
      console.log(`Joining subject ${sub_id} with user ${user_id}`);
    };

    if (socket.connected) {
      joinRoom();
    } else {
      socket.on('connect', joinRoom);
    }

    // Listen for new messages
    const handleNewMessage = (message) => {
      console.log('Received new message from socket:', message);
      console.log('Current user_id:', user_id);
      console.log('Message user_id:', message[1]);
      
      setMessages(prev => {
        // Check if message already exists to prevent duplicates
        const exists = prev.some(msg => msg[0] === message[0]);
        if (exists) {
          console.log('Message already exists, skipping');
          return prev;
        }
        
        console.log('Adding new message to UI');
        return [...prev, message];
      });
    };

    // Listen for typing events
    const handleTyping = ({ user_id: typingId, user_name, isTyping }) => {
      console.log('Typing event:', { typingId, user_name, isTyping });
      setTypingUsers(prev => {
        if (isTyping) {
          // Add user to typing list if not already there
          const exists = prev.some(u => u.userId === typingId);
          if (exists) return prev;
          return [...prev, { userId: typingId, userName: user_name }];
        } else {
          // Remove user from typing list
          return prev.filter(u => u.userId !== typingId);
        }
      });
    };

    socket.on('new_message', handleNewMessage);
    socket.on('typing', handleTyping);

    return () => {
      socket.off('new_message', handleNewMessage);
      socket.off('typing', handleTyping);
      socket.off('connect', joinRoom);
      socket.emit('leave_subject', { sub_id, user_id });
      console.log(`Left subject ${sub_id}`);
    };
  }, [sub_id, user_id, socket]);

  const sendMessage = async (message, userName, userType) => {
    try {
      console.log('Sending message:', { sub_id, message, userName, userType });
      
      const res = await axios.post('/chat/send', {
        sub_id,
        message
      },{withCredentials: true});
      
      console.log('Message sent, response:', res.data);
      
      if (res.data.success) {
        socket.emit('send_message', { 
          message: res.data.message, 
          sub_id: sub_id 
        });
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error sending message:', err);
      return false;
    }
  };

  const sendTyping = (isTyping, user_name) => {
    if (socket && sub_id) {
      socket.emit('typing', { sub_id, user_id, user_name, isTyping });
      console.log('Sent typing event:', { sub_id, user_id, user_name, isTyping });
    }
  };

  return { messages, typingUsers, sendMessage, sendTyping };
};